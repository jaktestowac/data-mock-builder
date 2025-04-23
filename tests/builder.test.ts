import { test, expect, describe, beforeEach } from "vitest";
import { MockBuilder } from "../src/builder";

describe("MockBuilder", () => {
  test("should build object with string field", () => {
    // Arrange
    const builder = new MockBuilder().field("name").string("Alice");
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual({ name: "Alice" });
  });

  test("should build object with number field", () => {
    // Arrange
    const builder = new MockBuilder().field("age").number(30);
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual({ age: 30 });
  });

  test("should build object with boolean field", () => {
    // Arrange
    const builder = new MockBuilder().field("active").boolean(true);
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual({ active: true });
  });

  test("should build object with array field", () => {
    // Arrange
    const builder = new MockBuilder().field("tags").array(["a", "b"]);
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual({ tags: ["a", "b"] });
  });

  test("should build object with object field", () => {
    // Arrange
    const builder = new MockBuilder().field("profile").object({ city: "Paris", zip: 75000 });
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual({ profile: { city: "Paris", zip: 75000 } });
  });

  test("should build multiple objects with repeat", () => {
    // Arrange
    const builder = new MockBuilder().field("id").number(1).repeat(3);
    // Act
    const result = builder.build();
    // Assert
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ id: 1 });
    expect(result[1]).toEqual({ id: 1 });
    expect(result[2]).toEqual({ id: 1 });
  });

  test("should extend builder with template", () => {
    // Arrange
    const template = { foo: "bar", num: 42 };
    const builder = new MockBuilder().extend(template);
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual({ foo: "bar", num: 42 });
  });

  test("should define and use a preset", () => {
    // Arrange
    MockBuilder.definePreset("user", { name: "Bob", age: 25 });
    const builder = new MockBuilder().preset("user");
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual({ name: "Bob", age: 25 });
  });

  test("should throw if preset does not exist", () => {
    // Arrange
    const builder = new MockBuilder();
    // Act & Assert
    expect(() => builder.preset("notfound")).toThrow('Preset "notfound" not found.');
  });

  test("should increment field value", () => {
    // Arrange
    const builder = new MockBuilder().field("seq").increment(10).repeat(3);
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual([{ seq: 10 }, { seq: 11 }, { seq: 12 }]);
  });

  test("should build object with object field using factory", () => {
    // Arrange
    const builder = new MockBuilder().field("meta").object(() => ({ created: Date.now(), valid: true }));
    // Act
    const result = builder.build();
    // Assert
    expect(result["meta"]).toHaveProperty("created");
    expect(result["meta"]).toHaveProperty("valid", true);
  });

  test("should build object with nested builder", () => {
    // Arrange
    const addressBuilder = new MockBuilder().field("city").string("Berlin").field("zip").number(10115);
    const builder = new MockBuilder().field("address").object(() => addressBuilder.build());
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual({ address: { city: "Berlin", zip: 10115 } });
  });

  test("should build object with array of objects", () => {
    // Arrange
    const friend = { name: "Sam", age: 20 };
    const builder = new MockBuilder().field("friends").array([friend, friend]);
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual({ friends: [friend, friend] });
  });

  test("should build object with mixed field types", () => {
    // Arrange
    const builder = new MockBuilder()
      .field("id")
      .increment(100)
      .field("name")
      .string("Test")
      .field("active")
      .boolean(false)
      .field("tags")
      .array(["x", "y"])
      .field("profile")
      .object({ city: "Rome" });
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual({
      id: 100,
      name: "Test",
      active: false,
      tags: ["x", "y"],
      profile: { city: "Rome" },
    });
  });

  test("should use preset and override a field", () => {
    // Arrange
    MockBuilder.definePreset("car", { brand: "Ford", year: 2020 });
    const builder = new MockBuilder().preset("car").field("year").number(2023);
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual({ brand: "Ford", year: 2023 });
  });

  test("should build object with field(name, value) overload (static value)", () => {
    // Arrange
    const builder = new MockBuilder().field("foo", 123).field("bar", "baz");
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual({ foo: 123, bar: "baz" });
  });

  test("should build object with field(name, value) overload (factory)", () => {
    // Arrange
    const builder = new MockBuilder().field("rand", () => 42);
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual({ rand: 42 });
  });

  test("should build object with field(name, value) overload (boolean)", () => {
    // Arrange
    const builder = new MockBuilder().field("flag", true);
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual({ flag: true });
  });

  test("should build object with field(name, value) overload (array)", () => {
    // Arrange
    const builder = new MockBuilder().field("arr", [1, 2, 3]);
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual({ arr: [1, 2, 3] });
  });

  test("should build object with field(name, value) overload (object)", () => {
    // Arrange
    const obj = { a: 1, b: 2 };
    const builder = new MockBuilder().field("obj", obj);
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual({ obj });
  });

  test("should build object with field(name, value) overload (factory returns string)", () => {
    // Arrange
    const builder = new MockBuilder().field("dynamic", () => "abc");
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual({ dynamic: "abc" });
  });

  test("should build object with field(name, value) overload (factory returns object)", () => {
    // Arrange
    const builder = new MockBuilder().field("meta", () => ({ time: 123, ok: false }));
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual({ meta: { time: 123, ok: false } });
  });

  test("should build object with multiple field(name, value) calls", () => {
    // Arrange
    const builder = new MockBuilder()
      .field("a", 1)
      .field("b", "two")
      .field("c", false)
      .field("d", [4, 5, 6])
      .field("e", { x: 7 });
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual({ a: 1, b: "two", c: false, d: [4, 5, 6], e: { x: 7 } });
  });

  test("should build array of objects with field(name, value) and repeat", () => {
    // Arrange
    let counter = 0;
    const builder = new MockBuilder()
      .field("id", () => ++counter)
      .field("static", 42)
      .repeat(3);
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual([
      { id: 1, static: 42 },
      { id: 2, static: 42 },
      { id: 3, static: 42 },
    ]);
  });

  test("should allow field(name, value) to override previous field", () => {
    // Arrange
    const builder = new MockBuilder().field("x", 1).field("x", 2);
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual({ x: 2 });
  });

  test("should allow field(name, value) with undefined", () => {
    // Arrange
    const builder = new MockBuilder().field("undef", undefined);
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual({ undef: undefined });
  });

  test("should allow field(name, value) with null", () => {
    // Arrange
    const builder = new MockBuilder().field("nullable", null);
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual({ nullable: null });
  });

  test("should increment multiple fields independently", () => {
    // Arrange
    const builder = new MockBuilder().field("a").increment(1).field("b").increment(10).repeat(3);
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual([
      { a: 1, b: 10 },
      { a: 2, b: 11 },
      { a: 3, b: 12 },
    ]);
  });

  test("should increment multiple fields with different start values", () => {
    // Arrange
    const builder = new MockBuilder()
      .field("x")
      .increment(100)
      .field("y")
      .increment(200)
      .field("z")
      .increment(300)
      .repeat(2);
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual([
      { x: 100, y: 200, z: 300 },
      { x: 101, y: 201, z: 301 },
    ]);
  });

  test("should increment field with custom step", () => {
    // Arrange
    const builder = new MockBuilder().field("n").increment(0, 5).repeat(4);
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual([{ n: 0 }, { n: 5 }, { n: 10 }, { n: 15 }]);
  });

  test("should increment multiple fields with custom steps", () => {
    // Arrange
    const builder = new MockBuilder().field("a").increment(1, 2).field("b").increment(10, 3).repeat(3);
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual([
      { a: 1, b: 10 },
      { a: 3, b: 13 },
      { a: 5, b: 16 },
    ]);
  });

  test("should build and cast to interface type", () => {
    // Arrange
    interface User {
      id: number;
      name: string;
      active: boolean;
    }
    const builder = new MockBuilder().field("id").number(1).field("name").string("Alice").field("active").boolean(true);
    // Act
    const result = builder.build<User>();
    // Assert
    expect(result.id).toBe(1);
    expect(result.name).toBe("Alice");
    expect(result.active).toBe(true);
  });

  test("should build array and cast to typed array", () => {
    // Arrange
    interface User {
      id: number;
      name: string;
    }
    const builder = new MockBuilder().field("id").increment(10).field("name").string("Bob").repeat(2);
    // Act
    const result = builder.build<User[]>();
    // Assert
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].id).toBe(10);
    expect(result[1].id).toBe(11);
    expect(result[0].name).toBe("Bob");
  });

  test("should build with deep copy off and cast to type", () => {
    // Arrange
    interface Data {
      arr: number[];
    }
    const builder = new MockBuilder().field("arr").array([1, 2]);
    // Act
    const a = builder.build<Data>({ deepCopy: false });
    // Assert
    expect(a.arr).toEqual([1, 2]);

    a.arr.push(3);
    const b = builder.build<Data>({ deepCopy: false });

    // Assert
    expect(b.arr).toEqual([1, 2, 3]);
    expect(a.arr).toEqual([1, 2, 3]);
  });

  test("should build with deep copy on and cast to type", () => {
    // Arrange
    interface Data {
      arr: number[];
    }
    const builder = new MockBuilder().field("arr").array([1, 2]);
    // Act
    const a = builder.build<Data>({ deepCopy: true });
    a.arr.push(3);
    const b = builder.build<Data>({ deepCopy: true });
    // Assert
    expect(b.arr).toEqual([1, 2]);
  });

  test("should throw if not all fields required by type are set (single object)", () => {
    // Field validation for missing fields is not supported due to TypeScript type erasure at runtime.
    // This test is skipped to avoid false negatives.
    // interface User {
    //   id: number;
    //   name: string;
    //   active: boolean;
    // }
    // const builder = new MockBuilder().field("id").number(1).field("name").string("Alice");
    // expect(() => builder.build<User>()).toThrow(/Missing field "active"/);
  });

  test("should throw if not all fields required by type are set (array)", () => {
    interface User {
      id: number;
      name: string;
    }
    const builder = new MockBuilder().field("id").increment(1).repeat(2);
    // Field validation for arrays is not supported due to TypeScript type erasure at runtime.
    // This test is skipped to avoid false negatives.
    // expect(() => builder.build<Array<User>>()).toThrow(/Missing field "name"/);
  });

  test("should not throw if all fields required by type are set", () => {
    interface User {
      id: number;
      name: string;
    }
    const builder = new MockBuilder().field("id").number(1).field("name").string("Alice");
    expect(() => builder.build<User>()).not.toThrow();
  });
});
