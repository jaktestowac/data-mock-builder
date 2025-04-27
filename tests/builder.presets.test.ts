import { test, expect, describe } from "vitest";
import { MockBuilder } from "../src/builder";

describe("MockBuilder - Presets & Templates", () => {
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

  test("should use preset and override a field", () => {
    // Arrange
    MockBuilder.definePreset("car", { brand: "Ford", year: 2020 });
    const builder = new MockBuilder().preset("car").field("year").number(2023);
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual({ brand: "Ford", year: 2023 });
  });

  test("should chain multiple presets without conflicts", () => {
    // Arrange
    MockBuilder.definePreset("baseUser", { name: "Base", role: "user" });
    MockBuilder.definePreset("adminPerms", { permissions: ["create", "read", "update", "delete"] });

    const builder = new MockBuilder().preset("baseUser").preset("adminPerms");

    // Act
    const result = builder.build();

    // Assert
    expect(result).toEqual({
      name: "Base",
      role: "user",
      permissions: ["create", "read", "update", "delete"],
    });
  });

  test("should handle chained presets with overlapping fields", () => {
    // Arrange
    MockBuilder.definePreset("baseUser", { name: "Base", role: "user", level: 1 });
    MockBuilder.definePreset("admin", { name: "Admin", role: "admin", level: 3 });

    const builder = new MockBuilder().preset("baseUser").preset("admin");

    // Act
    const result = builder.build();

    // Assert
    expect(result).toEqual({ name: "Admin", role: "admin", level: 3 });
  });

  test("should work with presets containing factory functions", () => {
    // Arrange
    let counter = 0;
    MockBuilder.definePreset("counterPreset", {
      id: () => ++counter,
      timestamp: () => Date.now(),
    });

    const builder = new MockBuilder().preset("counterPreset").repeat(2);

    // Act
    const results = builder.build();

    // Assert
    expect(results[0].id).toBe(1);
    expect(results[1].id).toBe(2);
    expect(typeof results[0].timestamp).toBe("number");
    expect(typeof results[1].timestamp).toBe("number");
  });

  test("should extend with multiple templates", () => {
    // Arrange
    const template1 = { a: 1, b: 2 };
    const template2 = { c: 3, d: 4 };

    const builder = new MockBuilder().extend(template1).extend(template2);

    // Act
    const result = builder.build();

    // Assert
    expect(result).toEqual({ a: 1, b: 2, c: 3, d: 4 });
  });

  test("should allow extend and preset to be mixed in any order", () => {
    // Arrange
    MockBuilder.definePreset("preset1", { a: 1, b: 2 });
    const template = { c: 3, d: 4 };

    const builder = new MockBuilder().preset("preset1").extend(template).field("e", 5);

    // Act
    const result = builder.build();

    // Assert
    expect(result).toEqual({ a: 1, b: 2, c: 3, d: 4, e: 5 });
  });

  test("should resolve field conflicts in order of operations", () => {
    // Arrange
    MockBuilder.definePreset("preset1", { a: 1, b: 2, common: "preset" });
    const template = { c: 3, common: "template" };

    const builder = new MockBuilder()
      .field("common", "initial")
      .preset("preset1")
      .extend(template)
      .field("common", "final");

    // Act
    const result = builder.build();

    // Assert
    expect(result.common).toBe("final");
    expect(result).toEqual({
      a: 1,
      b: 2,
      c: 3,
      common: "final",
    });
  });
});
