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
});
