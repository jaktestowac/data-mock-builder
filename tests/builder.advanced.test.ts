import { test, expect, describe } from "vitest";
import { MockBuilder } from "../src/builder";

describe("MockBuilder - Advanced Usage", () => {
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

  test("should allow mutation of previous build results with deep copy disabled", () => {
    const builder = new MockBuilder().field("arr").array([1, 2]);
    const a = builder.build({ deepCopy: false });
    a.arr.push(3);
    const b = builder.build({ deepCopy: false });
    expect(b.arr).toEqual([1, 2, 3]);
  });

  test("should not mutate previous build results with deep copy enabled", () => {
    const builder = new MockBuilder().field("arr").array([1, 2]);
    const a = builder.build();
    a.arr.push(3);
    const b = builder.build();
    expect(b.arr).toEqual([1, 2]);
  });

  test("should support preset with factory values", () => {
    MockBuilder.definePreset("factory", { x: () => 123 });
    const builder = new MockBuilder().preset("factory");
    const result = builder.build();
    expect(result).toEqual({ x: 123 });
  });
});
