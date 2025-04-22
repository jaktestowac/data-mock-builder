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
});
