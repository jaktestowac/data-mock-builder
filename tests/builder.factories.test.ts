import { test, expect, describe } from "vitest";
import { MockBuilder } from "../src/builder";

describe("MockBuilder - Advanced Factory Functions", () => {
  test("should support factory functions that use build count", () => {
    // Arrange
    let buildCount = 0;

    const builder = new MockBuilder()
      .field("buildNumber", () => ++buildCount)
      .field("metadata", () => ({ timestamp: Date.now() }));

    // Act
    const result1 = builder.build();
    const result2 = builder.build();

    // Assert
    expect(result1.buildNumber).toBe(1);
    expect(result2.buildNumber).toBe(2);
    expect(result1.metadata).not.toBe(result2.metadata);
  });

  test("should handle factories that return different types on different builds", () => {
    // Arrange
    let count = 0;

    const builder = new MockBuilder().field("dynamic", () => {
      count++;
      if (count === 1) return "string value";
      if (count === 2) return 42;
      return { complex: true };
    });

    // Act
    const result1 = builder.build();
    const result2 = builder.build();
    const result3 = builder.build();

    // Assert
    expect(result1.dynamic).toBe("string value");
    expect(result2.dynamic).toBe(42);
    expect(result3.dynamic).toEqual({ complex: true });
  });

  test("should allow factories to use current repeat index in repetitions", () => {
    // Arrange
    const builder = new MockBuilder()
      .field("primary", (_, index) => index === 0)
      .field("label", (_, index) => (index === 0 ? "Primary" : `Secondary ${index}`))
      .repeat(3);

    // Act
    const results = builder.build();

    // Assert
    expect(results).toEqual([
      { primary: true, label: "Primary" },
      { primary: false, label: "Secondary 1" },
      { primary: false, label: "Secondary 2" },
    ]);
  });

  test("should pass build options to factory functions", () => {
    // Arrange
    const builder = new MockBuilder().field("options", (_, __, options) => ({ deepCopyEnabled: options?.deepCopy }));

    // Act
    const result1 = builder.build({ deepCopy: true });
    const result2 = builder.build({ deepCopy: false });

    // Assert
    expect(result1.options).toEqual({ deepCopyEnabled: true });
    expect(result2.options).toEqual({ deepCopyEnabled: false });
  });

  test("should allow factories to reference other fields in the same object", () => {
    // Arrange
    const builder = new MockBuilder()
      .field("firstName", "John")
      .field("lastName", "Doe")
      .field("email", (obj) => `${obj.firstName.toLowerCase()}.${obj.lastName.toLowerCase()}@example.com`);

    // Act
    const result = builder.build();

    // Assert
    expect(result.email).toBe("john.doe@example.com");
  });

  test("should support cross-referencing between factory functions", () => {
    // Arrange
    const builder = new MockBuilder()
      .field("id", () => Math.floor(Math.random() * 1000))
      .field("createdAt", () => new Date().toISOString())
      .field("slug", (obj) => `user-${obj.id}`)
      .field("summary", (obj) => ({
        id: obj.id,
        slug: obj.slug,
        created: obj.createdAt,
      }));

    // Act
    const result = builder.build();

    // Assert
    expect(result.summary.id).toBe(result.id);
    expect(result.summary.slug).toBe(result.slug);
    expect(result.summary.created).toBe(result.createdAt);
  });

  test("should handle factories that return arrays of builders", () => {
    // Arrange
    // Create a counter to track which comment we're building
    let commentCount = 0;

    const commentBuilder = new MockBuilder()
      .field("id")
      .increment(1)
      .field("text", () => `Comment #${++commentCount}`);

    const postBuilder = new MockBuilder().field("title", "Test Post").field("comments", () => {
      // Create three separate comment objects with incrementing IDs
      return [commentBuilder.build(), commentBuilder.build(), commentBuilder.build()];
    });

    // Act
    const result = postBuilder.build();

    // Assert
    expect(result.title).toBe("Test Post");
    expect(result.comments).toHaveLength(3);
    expect(result.comments[0].id).toBe(1);
    expect(result.comments[1].id).toBe(2);
    expect(result.comments[2].id).toBe(3);
    expect(result.comments[0].text).toBe("Comment #1");
    expect(result.comments[1].text).toBe("Comment #2");
    expect(result.comments[2].text).toBe("Comment #3");
  });

  test("should support conditional factory logic based on other fields", () => {
    // Arrange
    const userBuilder = new MockBuilder().field("role", "admin").field("permissions", (obj) => {
      if (obj.role === "admin") {
        return ["read", "write", "delete"];
      } else if (obj.role === "editor") {
        return ["read", "write"];
      } else {
        return ["read"];
      }
    });

    // Act
    const adminResult = userBuilder.build();
    const editorResult = new MockBuilder()
      .field("role", "editor")
      .field("permissions", (obj) => {
        if (obj.role === "admin") {
          return ["read", "write", "delete"];
        } else if (obj.role === "editor") {
          return ["read", "write"];
        } else {
          return ["read"];
        }
      })
      .build();
    const readerResult = new MockBuilder()
      .field("role", "reader")
      .field("permissions", (obj) => {
        if (obj.role === "admin") {
          return ["read", "write", "delete"];
        } else if (obj.role === "editor") {
          return ["read", "write"];
        } else {
          return ["read"];
        }
      })
      .build();

    // Assert
    expect(adminResult.permissions).toEqual(["read", "write", "delete"]);
    expect(editorResult.permissions).toEqual(["read", "write"]);
    expect(readerResult.permissions).toEqual(["read"]);
  });
});
