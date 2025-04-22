import { test, expect, describe } from "vitest";
import { MockBuilder } from "../src/builder";

describe("MockBuilder - Repeat & Arrays", () => {
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
});
