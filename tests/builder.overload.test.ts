import { test, expect, describe } from "vitest";
import { MockBuilder } from "../src/builder";

describe("MockBuilder - Field Overload", () => {
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

  test("should override field with different types", () => {
    const builder = new MockBuilder().field("x", "a").field("x", 2);
    const result = builder.build();
    expect(result).toEqual({ x: 2 });
  });

  test("should override field multiple times", () => {
    const builder = new MockBuilder().field("x", 1).field("x", 2).field("x", 3);
    const result = builder.build();
    expect(result).toEqual({ x: 3 });
  });
});
