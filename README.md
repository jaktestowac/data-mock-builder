# data-mock-builder

A fluent, flexible utility for building mock objects for testing in TypeScript/JavaScript. Supports static values, factories, arrays, nested objects, incrementing fields, templates, presets, and more.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## ✨ Features

- 🏗️ Fluent API for building mock objects
- 🔢 Supports string, number, boolean, array, object, and incrementing fields
- 🔁 Generate single or multiple objects (`repeat`)
- 🧩 Extend with templates or reusable presets
- 🧪 Supports value factories (functions)
- 🪄 TypeScript support with type casting for results
- 🪶 Zero dependencies
- 🛡️ Optional deep copy to prevent mutation between builds
- 🛡️ Optional field validation (see `.build()` options)

---

## 📦 Install

```bash
npm install data-mock-builder
```

---

## 🚀 Usage

### Basic Example

```typescript
import { MockBuilder } from "data-mock-builder";

const builder = new MockBuilder().field("id").increment(1).field("name").string("Alice").field("active").boolean(true);

const result = builder.build();
console.log(result);
// { id: 1, name: "Alice", active: true }
```

Or with compacted field definition:

```typescript
import { MockBuilder } from "data-mock-builder";

const builder = new MockBuilder().field("id", 1).field("name", "Alice").field("active", true);

const result = builder.build();
console.log(result);
// { id: 1, name: "Alice", active: true }
```

### Generate Multiple Objects

```typescript
const users = new MockBuilder().field("id").increment(100).field("role").string("user").repeat(3).build();

console.log(users);
// [
//   { id: 100, role: "user" },
//   { id: 101, role: "user" },
//   { id: 102, role: "user" }
// ]
```

Or with compacted field definition:

```typescript
const users = new MockBuilder()
  .field("id", () => Math.floor(Math.random() * 1000))
  .field("role", "user")
  .repeat(2)
  .build();

console.log(users);
// [
//   { id: 123, role: "user" },
//   { id: 456, role: "user" }
// ]
// (ids will be random)
```

### Use Factories

```typescript
const builder = new MockBuilder()
  .field("createdAt")
  .number(() => Date.now())
  .field("randomTag")
  .string(() => Math.random().toString(36).slice(2, 8));

const result = builder.build();
console.log(result);
// { createdAt: 1680000000000, randomTag: "a1b2c3" } // values will vary
```

### Nested Objects

```typescript
const addressBuilder = new MockBuilder().field("city").string("Paris").field("zip").number(75000);

const userBuilder = new MockBuilder()
  .field("name")
  .string("Alice")
  .field("address")
  .object(() => addressBuilder.build());

const user = userBuilder.build();
console.log(user);
// { name: "Alice", address: { city: "Paris", zip: 75000 } }
```

### Templates and Presets

```typescript
MockBuilder.definePreset("user", { name: "Bob", age: 25 });

const builder = new MockBuilder().preset("user").field("age").number(30); // override preset

const result = builder.build();
console.log(result);
// { name: "Bob", age: 30 }
```

### Preset Example

```typescript
// Define a preset for a product
MockBuilder.definePreset("product", { name: "Widget", price: 9.99 });

// Use the preset and override a field
const builder = new MockBuilder().preset("product").field("price").number(19.99);

const result = builder.build();
console.log(result);
// { name: "Widget", price: 19.99 }
```

### Extend Example

```typescript
const template = { foo: "bar", count: 42 };

const builder = new MockBuilder().extend(template).field("extra", true);

const result = builder.build();
console.log(result);
// { foo: "bar", count: 42, extra: true }
```

### Overload: Direct Field Assignment

```typescript
const builder = new MockBuilder().field("foo", 123).field("bar", () => "baz");
const result = builder.build();
console.log(result);
// { foo: 123, bar: "baz" }
```

### Increment with Step

```typescript
const builder = new MockBuilder().field("n").increment(0, 5).repeat(3);

const result = builder.build();
console.log(result);
// [{ n: 0 }, { n: 5 }, { n: 10 }]
```

---

### 🪄 TypeScript Type Casting

You can cast the result of `.build()` to your interface or type for full type safety:

```typescript
interface User {
  id: number;
  name: string;
  active: boolean;
}

const builder = new MockBuilder().field("id").number(1).field("name").string("Alice").field("active").boolean(true);

const user = builder.build<User>();
// user is typed as User

const users = builder.repeat(2).build<User[]>();
// users is typed as User[]
```

---

### 🛡️ Deep Copy and Field Validation Control

By default, the builder deep-copies all field values to prevent mutation between builds.  
You can disable deep copy globally or per build:

```typescript
const builder = new MockBuilder().field("arr").array([1, 2]);

// Default: deep copy ON
const a = builder.build();
a.arr.push(3);
const b = builder.build();
console.log(b.arr); // [1, 2]

// Disable deep copy for all builds from this builder
builder.deepCopy(false);
const c = builder.build();
c.arr.push(4);
const d = builder.build();
console.log(d.arr); // [1, 2, 4]

// Or disable/enable deep copy per build:
const e = builder.build({ deepCopy: true }); // deep copy ON for this build
const f = builder.build({ deepCopy: false }); // deep copy OFF for this build
```

#### Field Validation

By default, field validation is **skipped** for performance and compatibility.  
If you want to validate that all fields required by a type are present in the built object, use:

```typescript
interface User {
  id: number;
  name: string;
}

const builder = new MockBuilder().field("id").number(1);
// This will NOT throw by default:
const user = builder.build<User>();

// To enable runtime validation:
try {
  builder.build<User>({ skipValidation: false }); // Throws if any required field is missing
} catch (err) {
  console.error(err);
}
```

> **Note:** Due to TypeScript type erasure, runtime validation only works for plain objects, not for arrays of objects (e.g., `User[]`).  
> For most use cases, type safety is enforced at compile time.

---

## 🧩 API

| Method                            | Description                                                                                                            |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `.field(name)`                    | Start defining a field. Chain with `.string()`, `.number()`, `.boolean()`, `.array()`, `.object()`, or `.increment()`. |
| `.field(name, value)`             | Add a field directly with a static value or factory function.                                                          |
| `.repeat(n)`                      | Generate `n` objects (returns an array from `.build()`).                                                               |
| `.extend(template)`               | Add fields from a plain object.                                                                                        |
| `.preset(name)`                   | Add fields from a named preset (see `.definePreset`).                                                                  |
| `.build<T>(options?)`             | Build the object(s), optionally cast to type `T`. Options: `{ deepCopy?: boolean; skipValidation?: boolean }`          |
| `.deepCopy(enabled)`              | Enable or disable deep copy for all subsequent builds from this builder.                                               |
| `.increment(start = 1, step = 1)` | Incrementing number field.                                                                                             |
| `.definePreset(name, template)`   | Define a reusable preset.                                                                                              |

---

## 📄 License

MIT © jaktestowac.pl

Powered by [jaktestowac.pl](https://www.jaktestowac.pl/) team!
