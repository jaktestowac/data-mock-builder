import { test, expect, describe } from "vitest";
import { MockBuilder } from "../src/builder";

describe("MockBuilder - Field Validators", () => {
  test("should validate field with validator method", () => {
    const builder = new MockBuilder()
      .field("age")
      .number(25)
      .validator("age", (value) => ({
        success: value >= 18,
        errorMsg: "Age must be at least 18",
      }));

    const result = builder.build();
    expect(result).toEqual({ age: 25 });
  });

  test("should throw validation error with custom message", () => {
    const builder = new MockBuilder()
      .field("age")
      .number(15)
      .validator("age", (value) => ({
        success: value >= 18,
        errorMsg: "Age must be at least 18",
      }));

    expect(() => builder.build({ skipValidation: false })).toThrowError("Age must be at least 18");
  });

  test("should validate with chained validator", () => {
    const builder = new MockBuilder()
      .field("email")
      .string("user@example.com")
      .validator("email", (value) => ({
        success: /^.+@.+\..+$/.test(value),
        errorMsg: "Invalid email format",
      }));

    const result = builder.build({ skipValidation: false });
    expect(result).toEqual({ email: "user@example.com" });
  });

  test("should skip validation when skipValidation is true", () => {
    const builder = new MockBuilder()
      .field("age")
      .number(15)
      .validator("age", (value) => ({
        success: value >= 18,
        errorMsg: "Age must be at least 18",
      }));

    // Validation should be skipped by default
    const result = builder.build();
    expect(result).toEqual({ age: 15 });

    // Explicitly skip validation
    const result2 = builder.build({ skipValidation: true });
    expect(result2).toEqual({ age: 15 });
  });

  test("should validate multiple fields and collect all errors", () => {
    const builder = new MockBuilder()
      .field("age")
      .number(15)
      .validator("age", (value) => ({
        success: value >= 18,
        errorMsg: "Age must be at least 18",
      }))
      .field("email")
      .string("invalid")
      .validator("email", (value) => ({
        success: /^.+@.+\..+$/.test(value),
        errorMsg: "Invalid email format",
      }));

    expect(() => builder.build({ skipValidation: false })).toThrowError("Age must be at least 18\nInvalid email format");
  });

  test("should validate when building repeated objects", () => {
    const builder = new MockBuilder()
      .field("value")
      .increment(10, 5)
      .validator("value", (value) => ({
        success: value <= 15,
        errorMsg: `Value ${value} exceeds maximum 15`,
      }))
      .repeat(5);

    expect(() => builder.build({ skipValidation: false })).toThrowError("Value 20 exceeds maximum 15");
  });

  test("should work with undefined errorMsg when success is true", () => {
    const builder = new MockBuilder()
      .field("age")
      .number(25)
      .validator("age", (value) => ({
        success: value >= 18,
        errorMsg: undefined, // No error message when validation passes
      }));

    const result = builder.build({ skipValidation: false });
    expect(result).toEqual({ age: 25 });
  });

  test("should validate with custom error message when success is false", () => {
    const builder = new MockBuilder()
      .field("age")
      .number(15)
      .validator("age", (value) => ({
        success: value >= 18,
        errorMsg: "Age must be at least 18",
      }));

    expect(() => builder.build({ skipValidation: false })).toThrowError("Age must be at least 18");
  });
});
