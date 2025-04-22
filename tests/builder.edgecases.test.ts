import { test, expect, describe } from "vitest";
import { MockBuilder } from "../src/builder";

describe("MockBuilder - Edge Cases", () => {
  test("should return empty object if no fields defined", () => {
    // Arrange
    const builder = new MockBuilder();
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual({});
  });

  test("should return empty array if repeat(0)", () => {
    // Arrange
    const builder = new MockBuilder().field("x").number(1).repeat(0);
    // Act
    const result = builder.build();
    // Assert
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  test("should handle repeat(1) as single object", () => {
    // Arrange
    const builder = new MockBuilder().field("x").number(1).repeat(1);
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual({ x: 1 });
  });

  test("should override field with different types", () => {
    // Arrange
    const builder = new MockBuilder().field("x").string("a").field("x").number(2);
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual({ x: 2 });
  });

  test("should allow chaining repeat multiple times (last wins)", () => {
    // Arrange
    const builder = new MockBuilder().field("x").number(1).repeat(2).repeat(4);
    // Act
    const result = builder.build();
    // Assert
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(4);
  });

  test("should extend with empty object", () => {
    // Arrange
    const builder = new MockBuilder().extend({});
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual({});
  });

  test("should define and use empty preset", () => {
    // Arrange
    MockBuilder.definePreset("empty", {});
    const builder = new MockBuilder().preset("empty");
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual({});
  });

  test("should support preset with factory values", () => {
    // Arrange
    MockBuilder.definePreset("factory", { x: () => 123 });
    const builder = new MockBuilder().preset("factory");
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual({ x: 123 });
  });

  test("should support multiple presets (last wins on conflict)", () => {
    // Arrange
    MockBuilder.definePreset("a", { x: 1, y: 2 });
    MockBuilder.definePreset("b", { x: 3, z: 4 });
    const builder = new MockBuilder().preset("a").preset("b");
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual({ x: 3, y: 2, z: 4 });
  });

  test("should handle falsy values (0, false, '', null, undefined)", () => {
    // Arrange
    const builder = new MockBuilder()
      .field("zero", 0)
      .field("empty", "")
      .field("no", false)
      .field("undef", undefined)
      .field("nul", null);
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual({ zero: 0, empty: "", no: false, undef: undefined, nul: null });
  });

  test("should support factory returning undefined/null", () => {
    // Arrange
    const builder = new MockBuilder().field("u", () => undefined).field("n", () => null);
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual({ u: undefined, n: null });
  });

  test("should throw if factory throws", () => {
    // Arrange
    const builder = new MockBuilder().field("fail", () => {
      throw new Error("fail!");
    });
    // Act & Assert
    expect(() => builder.build()).toThrow("fail!");
  });

  test("should support negative and zero step in increment", () => {
    // Arrange
    const builder = new MockBuilder().field("neg").increment(10, -2).field("zero").increment(5, 0).repeat(3);
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual([
      { neg: 10, zero: 5 },
      { neg: 8, zero: 5 },
      { neg: 6, zero: 5 },
    ]);
  });

  test("should support array/object as factory", () => {
    // Arrange
    const builder = new MockBuilder()
      .field("arr")
      .array(() => [1, 2])
      .field("obj")
      .object(() => ({ a: 1 }));
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual({ arr: [1, 2], obj: { a: 1 } });
  });

  test("should support empty array/object as value", () => {
    // Arrange
    const builder = new MockBuilder().field("arr").array([]).field("obj").object({});
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual({ arr: [], obj: {} });
  });

  test("should allow preset override order", () => {
    // Arrange
    MockBuilder.definePreset("p", { x: 1 });
    const builder = new MockBuilder().field("x").number(2).preset("p");
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual({ x: 1 });
  });

  test("should allow preset with nested objects", () => {
    // Arrange
    MockBuilder.definePreset("nested", { profile: { city: "Paris" } });
    const builder = new MockBuilder().preset("nested");
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual({ profile: { city: "Paris" } });
  });

  test("should allow preset with increment", () => {
    // Arrange
    MockBuilder.definePreset("inc", {
      id: (() => {
        let i = 1;
        return () => i++;
      })(),
    });
    const builder = new MockBuilder().preset("inc").repeat(2);
    // Act
    const result = builder.build();
    // Assert
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(2);
  });

  test("should allow extend after fields", () => {
    // Arrange
    const builder = new MockBuilder().field("a").number(1).extend({ b: 2 });
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual({ a: 1, b: 2 });
  });

  test("should allow extend with overlapping keys (last wins)", () => {
    // Arrange
    const builder = new MockBuilder().field("x").number(1).extend({ x: 2 });
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual({ x: 2 });
  });

  test("should produce independent results for multiple build() calls", () => {
    // Arrange
    const builder = new MockBuilder().field("id").increment(1);
    // Act
    const a = builder.build();
    const b = builder.build();
    // Assert
    expect(a).toEqual({ id: 1 });
    expect(b).toEqual({ id: 2 });
  });

  test("should not mutate previous build results", () => {
    // Arrange
    const builder = new MockBuilder().field("arr").array([1, 2]);
    // Act
    const a = builder.build();
    a.arr.push(3);
    const b = builder.build();
    // Assert
    expect(b.arr).toEqual([1, 2]);
  });

  test("should not mutate previous build results with deep copy enabled (default)", () => {
    // Arrange
    const builder = new MockBuilder().field("arr").array([1, 2]);
    // Act
    const a = builder.build();
    a.arr.push(3);
    const b = builder.build();
    // Assert
    expect(b.arr).toEqual([1, 2]);
  });

  test("should allow mutation of previous build results with deep copy disabled (builder method)", () => {
    // Arrange
    const builder = new MockBuilder().deepCopy(false).field("arr").array([1, 2]);
    // Act
    const a = builder.build();
    a.arr.push(3);
    const b = builder.build();
    // Assert
    expect(b.arr).toEqual([1, 2, 3]);
  });

  test("should allow mutation of previous build results with deep copy disabled (build param)", () => {
    // Arrange
    const builder = new MockBuilder().field("arr").array([1, 2]);
    // Act
    const a = builder.build(false);
    a.arr.push(3);
    const b = builder.build(false);
    // Assert
    expect(b.arr).toEqual([1, 2, 3]);
  });

  test("should override builder deepCopy setting with build param", () => {
    // Arrange
    const builder = new MockBuilder().deepCopy(false).field("arr").array([1, 2]);
    // Act
    const a = builder.build(true);
    a.arr.push(3);
    const b = builder.build(true);
    // Assert
    expect(b.arr).toEqual([1, 2]);
  });

  test("should support symbol and bigint as field values", () => {
    // Arrange
    const sym = Symbol("s");
    const big = BigInt(123);

    interface ResultObj {
      sym: symbol;
      big: bigint;
    }

    const builder = new MockBuilder().field("sym", sym).field("big", big);
    // Act
    const result = builder.build<ResultObj>();
    // Assert
    expect(result.sym).toBe(sym);
    expect(result.big).toBe(big);
  });

  test("should support function as value (not as factory)", () => {
    // Arrange
    function fn() {
      return 42;
    }

    interface ResultObj {
      f: number;
    }

    const builder = new MockBuilder().field("f", fn);
    // Act
    const result = builder.build<ResultObj>();
    // Assert
    // The builder treats any function as a factory, so the result is the return value of fn.
    // This test documents the current behavior.
    expect(result.f).toBe(42);
  });
});
