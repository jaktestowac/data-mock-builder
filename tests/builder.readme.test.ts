import { test, expect, describe } from "vitest";
import { MockBuilder } from "../src/builder";

describe("MockBuilder - README Examples", () => {
  describe("Basic Examples", () => {
    test("should build object with chained field methods", () => {
      const builder = new MockBuilder()
        .field("id")
        .increment(1)
        .field("name")
        .string("Alice")
        .field("active")
        .boolean(true);
      const result = builder.build();
      expect(result).toEqual({ id: 1, name: "Alice", active: true });
    });

    test("should build object with compacted field definition", () => {
      const builder = new MockBuilder().field("id", 1).field("name", "Alice").field("active", true);
      const result = builder.build();
      expect(result).toEqual({ id: 1, name: "Alice", active: true });
    });
  });

  describe("Multiple Objects", () => {
    test("should generate multiple objects with repeat", () => {
      const users = new MockBuilder().field("id").increment(100).field("role").string("user").repeat(3).build();
      expect(users).toEqual([
        { id: 100, role: "user" },
        { id: 101, role: "user" },
        { id: 102, role: "user" },
      ]);
    });

    test("should generate multiple objects with factory function", () => {
      // Mock Math.random for consistent testing
      const originalRandom = Math.random;
      try {
        let count = 0;
        const mockValues = [0.1, 0.5];
        Math.random = () => mockValues[count++ % mockValues.length];

        const users = new MockBuilder()
          .field("id", () => Math.floor(Math.random() * 1000))
          .field("role", "user")
          .repeat(2)
          .build();

        expect(users).toEqual([
          { id: 100, role: "user" },
          { id: 500, role: "user" },
        ]);
      } finally {
        Math.random = originalRandom;
      }
    });
  });

  describe("Nested Objects", () => {
    test("should build nested objects", () => {
      const addressBuilder = new MockBuilder().field("city").string("Paris").field("zip").number(75000);
      const userBuilder = new MockBuilder()
        .field("name")
        .string("Alice")
        .field("address")
        .object(() => addressBuilder.build());

      const user = userBuilder.build();
      expect(user).toEqual({ name: "Alice", address: { city: "Paris", zip: 75000 } });
    });
  });

  describe("Templates and Presets", () => {
    test("should use presets and override fields", () => {
      // Clear existing presets that might interfere with this test
      MockBuilder["presets"] = {};

      MockBuilder.definePreset("user", { name: "Bob", age: 25 });
      const builder = new MockBuilder().preset("user").field("age").number(30);
      const result = builder.build();
      expect(result).toEqual({ name: "Bob", age: 30 });
    });

    test("should use product preset example", () => {
      // Clear existing presets that might interfere with this test
      MockBuilder["presets"] = {};

      MockBuilder.definePreset("product", { name: "Widget", price: 9.99 });
      const builder = new MockBuilder().preset("product").field("price").number(19.99);
      const result = builder.build();
      expect(result).toEqual({ name: "Widget", price: 19.99 });
    });

    test("should extend with template object", () => {
      const template = { foo: "bar", count: 42 };
      const builder = new MockBuilder().extend(template).field("extra", true);
      const result = builder.build();
      expect(result).toEqual({ foo: "bar", count: 42, extra: true });
    });
  });

  describe("Overload Methods", () => {
    test("should use direct field assignment", () => {
      const builder = new MockBuilder().field("foo", 123).field("bar", () => "baz");
      const result = builder.build();
      expect(result).toEqual({ foo: 123, bar: "baz" });
    });
  });

  describe("Increment with Step", () => {
    test("should increment with custom step", () => {
      const builder = new MockBuilder().field("n").increment(0, 5).repeat(3);
      const result = builder.build();
      expect(result).toEqual([{ n: 0 }, { n: 5 }, { n: 10 }]);
    });
  });

  describe("TypeScript Type Casting", () => {
    test("should build and cast to interface type", () => {
      interface User {
        id: number;
        name: string;
        active: boolean;
      }

      const builder = new MockBuilder()
        .field("id")
        .number(1)
        .field("name")
        .string("Alice")
        .field("active")
        .boolean(true);
      const user = builder.build<User>();

      expect(user.id).toBe(1);
      expect(user.name).toBe("Alice");
      expect(user.active).toBe(true);
    });

    test("should build array and cast to typed array", () => {
      interface User {
        id: number;
        name: string;
      }

      const builder = new MockBuilder().field("id").increment(1).field("name").string("Bob").repeat(2);
      const users = builder.build<User[]>();

      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBe(2);
      expect(users[0].id).toBe(1);
      expect(users[1].id).toBe(2);
      expect(users[0].name).toBe("Bob");
      expect(users[1].name).toBe("Bob");
    });
  });

  describe("Deep Copy and Field Validation", () => {
    test("should demonstrate deep copy behavior", () => {
      const builder = new MockBuilder().field("arr").array([1, 2]);

      // Default: deep copy ON
      const a = builder.build();
      a.arr.push(3);
      const b = builder.build();
      expect(b.arr).toEqual([1, 2]);

      // Disable deep copy for all builds from this builder
      builder.deepCopy(false);
      const c = builder.build();
      c.arr.push(4);
      const d = builder.build();
      expect(d.arr).toEqual([1, 2, 4]);

      // Override per build
      const e = builder.build({ deepCopy: true });
      e.arr.push(5);
      const f = builder.build({ deepCopy: false });
      expect(f.arr).toEqual([1, 2, 4]); // Not including 5 from e which had deep copy ON
    });
  });

  describe("Advanced Generator Usage", () => {
    test("should access object, index, and options in generator functions", () => {
      const builder = new MockBuilder()
        .field("id")
        .increment(1)
        .field("name")
        .string("User")
        // Access index parameter in generator function
        .field("displayName", (obj, index) => `${obj.name} ${index || 0}`)
        // Access current object and control deep copy
        .field("summary", (obj, index, options) => {
          return `ID: ${obj.id}, Name: ${obj.displayName}, Deep Copy: ${options?.deepCopy}`;
        });

      const users = builder.repeat(2).build();

      expect(users).toEqual([
        {
          id: 1,
          name: "User",
          displayName: "User 0",
          summary: "ID: 1, Name: User 0, Deep Copy: true",
        },
        {
          id: 2,
          name: "User",
          displayName: "User 1",
          summary: "ID: 2, Name: User 1, Deep Copy: true",
        },
      ]);
    });
    test("should access object, index, and options in generator functions", () => {
      const builder = new MockBuilder()
        .field("id")
        .increment(1)
        .field("name")
        .string("User")
        // Access index parameter in generator function
        .field("displayName", (obj, index) => `${obj.name} ${index || 0}`)
        // Access current object and control deep copy
        .field("summary", (obj, index, options) => {
          return `ID: ${obj.id}, Name: ${obj.displayName}, Deep Copy: ${options?.deepCopy}`;
        });

      const users = builder.repeat(2).build({ deepCopy: false });

      expect(users).toEqual([
        {
          id: 1,
          name: "User",
          displayName: "User 0",
          summary: "ID: 1, Name: User 0, Deep Copy: false",
        },
        {
          id: 2,
          name: "User",
          displayName: "User 1",
          summary: "ID: 2, Name: User 1, Deep Copy: false",
        },
      ]);
    });
  });
});
