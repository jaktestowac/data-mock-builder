import { test, expect, describe } from "vitest";
import { MockBuilder } from "../src/builder";

describe("MockBuilder - Complex Nesting", () => {
  test("should build deeply nested objects", () => {
    // Arrange
    const builder = new MockBuilder().field("level1", {
      level2: {
        level3: {
          value: "deeply nested",
        },
      },
    });

    // Act
    const result = builder.build();

    // Assert
    expect(result.level1.level2.level3.value).toBe("deeply nested");
  });

  test("should build deeply nested objects using multiple builders", () => {
    // Arrange
    const level3Builder = new MockBuilder().field("data", "level 3").field("timestamp", 123456789);

    const level2Builder = new MockBuilder().field("info", "level 2").field("nested", () => level3Builder.build());

    const rootBuilder = new MockBuilder().field("id", 1).field("content", () => level2Builder.build());

    // Act
    const result = rootBuilder.build();

    // Assert
    expect(result).toEqual({
      id: 1,
      content: {
        info: "level 2",
        nested: {
          data: "level 3",
          timestamp: 123456789,
        },
      },
    });
  });

  test("should build nested array of builders", () => {
    // Arrange
    let itemCounter = 0;

    const itemBuilder = new MockBuilder()
      .field("id")
      .increment(1)
      .field("name", () => `Item ${++itemCounter}`);

    const rootBuilder = new MockBuilder().field("items", () => {
      // Reset counter before building items
      itemCounter = 0;

      // Build each item individually
      return [itemBuilder.build(), itemBuilder.build(), itemBuilder.build()];
    });

    // Act
    const result = rootBuilder.build();

    // Assert
    expect(result).toEqual({
      items: [
        { id: 1, name: "Item 1" },
        { id: 2, name: "Item 2" },
        { id: 3, name: "Item 3" },
      ],
    });
  });

  test("should build object with builder that relies on index", () => {
    // Arrange
    const builder = new MockBuilder().field("items", (_, index) => `Item ${index}`).repeat(3);

    // Act
    const result = builder.build();

    // Assert
    expect(result).toEqual([{ items: "Item 0" }, { items: "Item 1" }, { items: "Item 2" }]);
  });

  test("should create complex object graph with circular references when deep copy is off", () => {
    // Arrange
    interface Node {
      id: number;
      name: string;
      parent?: Node;
      children: Node[];
    }

    const nodeBuilder = new MockBuilder({ deepCopy: false }).field("id", 1).field("name", "Root").field("children", []);

    // Act
    const root = nodeBuilder.build<Node>();

    // Create child nodes that reference the parent
    const child1 = new MockBuilder({ deepCopy: false })
      .field("id", 2)
      .field("name", "Child 1")
      .field("parent", root)
      .field("children", [])
      .build<Node>();

    const child2 = new MockBuilder({ deepCopy: false })
      .field("id", 3)
      .field("name", "Child 2")
      .field("parent", root)
      .field("children", [])
      .build<Node>();

    // Connect children to parent
    root.children.push(child1);
    root.children.push(child2);

    // Assert
    expect(root.children[0].parent).toBe(root);
    expect(root.children[1].parent).toBe(root);
    expect(root.children[0].name).toBe("Child 1");
    expect(root.children[1].name).toBe("Child 2");
  });

  test("should build object with dynamic dependencies between fields", () => {
    // Arrange
    const builder = new MockBuilder()
      .field("firstName", "John")
      .field("lastName", "Doe")
      .field("fullName", (obj) => `${obj.firstName} ${obj.lastName}`)
      .field("username", (obj) => `${obj.firstName.toLowerCase()}${obj.lastName.toLowerCase()}`);

    // Act
    const result = builder.build();

    // Assert
    expect(result).toEqual({
      firstName: "John",
      lastName: "Doe",
      fullName: "John Doe",
      username: "johndoe",
    });
  });
});
