import { test, expect, describe } from "vitest";
import { MockBuilder } from "../src/builder";

describe("MockBuilder - Increment", () => {
  test("should increment field value", () => {
    // Arrange
    const builder = new MockBuilder().field("seq").increment(10).repeat(3);
    // Act
    const result = builder.build();
    // Assert
    expect(result).toEqual([{ seq: 10 }, { seq: 11 }, { seq: 12 }]);
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
});
