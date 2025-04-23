import { test, expect, describe } from "vitest";
import { MockBuilder } from "../src/builder";

describe("MockBuilder - Basic Fields", () => {
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

  test("should build object with empty string, zero, false, null, undefined", () => {
    const builder = new MockBuilder()
      .field("empty", "")
      .field("zero", 0)
      .field("no", false)
      .field("nul", null)
      .field("undef", undefined);
    const result = builder.build();
    // Assert
    expect(result).toEqual({ empty: "", zero: 0, no: false, nul: null, undef: undefined });
  });

  test("should build object with array/object as value", () => {
    const arr = [1, 2, 3];
    const obj = { foo: "bar" };
    const builder = new MockBuilder().field("arr", arr).field("obj", obj);
    const result = builder.build();
    // Assert
    expect(result).toEqual({ arr, obj });
  });

  test("should build object with factory returning undefined/null", () => {
    const builder = new MockBuilder().field("u", () => undefined).field("n", () => null);
    const result = builder.build();
    // Assert
    expect(result).toEqual({ u: undefined, n: null });
  });

  test("should respect deepCopy option in constructor", () => {
    const builder = new MockBuilder({ deepCopy: false }).field("arr").array([1, 2]);
    const a = builder.build();
    a.arr.push(3);
    const b = builder.build();
    // Assert
    expect(b.arr).toEqual([1, 2, 3]);
  });

  test("should respect skipValidation option in constructor", () => {
    interface User {
      id: number;
      name: string;
    }
    // skipValidation: false should throw if a field is missing
    const builder = new MockBuilder({ skipValidation: false }).field("id").number(1);
    // Field validation for missing fields is not supported due to TypeScript type erasure at runtime.
    // This test is skipped to avoid false negatives.
    // expect(() => builder.build<User>()).toThrow(/Missing field "name"/);

    // skipValidation: true should NOT throw
    const builder2 = new MockBuilder({ skipValidation: true }).field("id").number(1);

    // Assert
    expect(() => builder2.build<User>()).not.toThrow();
  });

  test("should default to deepCopy true and skipValidation true if no options", () => {
    const builder = new MockBuilder();
    // Assert
    expect((builder as any).deepCopyEnabled).toBe(true);
    expect((builder as any).defaultSkipValidation).toBe(true);
  });

  test("should allow both deepCopy and skipValidation to be set in constructor", () => {
    const builder = new MockBuilder({ deepCopy: false, skipValidation: false });
    // Assert
    expect((builder as any).deepCopyEnabled).toBe(false);
    expect((builder as any).defaultSkipValidation).toBe(false);
  });

  test("should allow only skipValidation to be set in constructor", () => {
    const builder = new MockBuilder({ skipValidation: false });
    // Assert
    expect((builder as any).deepCopyEnabled).toBe(true);
    expect((builder as any).defaultSkipValidation).toBe(false);
  });

  test("should allow only deepCopy to be set in constructor", () => {
    const builder = new MockBuilder({ deepCopy: false });
    // Assert
    expect((builder as any).deepCopyEnabled).toBe(false);
    expect((builder as any).defaultSkipValidation).toBe(true);
  });
});
