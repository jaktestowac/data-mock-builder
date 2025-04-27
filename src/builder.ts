type ValueOrFactory<T> =
  | T
  | ((obj?: any, index?: number, options?: { deepCopy?: boolean; skipValidation?: boolean }) => T);

interface FieldDefinition<T> {
  name: string;
  generator: (obj?: any, index?: number, options?: { deepCopy?: boolean; skipValidation?: boolean }) => T;
}

/**
 * MockBuilder provides a fluent API to construct mock objects for testing purposes.
 *
 * Features:
 * - Define fields with static values or value factories (functions).
 * - Support for string, number, boolean, array, and incrementing number fields.
 * - Repeat object creation to generate arrays of mocks.
 * - Extend builder with templates or presets for reusable field sets.
 * - Define and use named presets for common mock structures.
 *
 * Example usage:
 * ```
 * const builder = new MockBuilder()
 *   .field("id").increment(1)
 *   .field("name").string("Alice")
 *   .repeat(2);
 * const result = builder.build();
 * // result: [{ id: 1, name: "Alice" }, { id: 2, name: "Alice" }]
 * ```
 */
export class MockBuilder {
  private fields: FieldDefinition<any>[] = [];
  private repeatCount = 1;
  private static presets: Presets = {};
  private deepCopyEnabled = true;
  private defaultSkipValidation: boolean = true;

  /**
   * Creates a new MockBuilder instance.
   * @param options Optional. { deepCopy?: boolean, skipValidation?: boolean }
   */
  constructor(options?: { deepCopy?: boolean; skipValidation?: boolean }) {
    if (options && typeof options.deepCopy === "boolean") {
      this.deepCopyEnabled = options.deepCopy;
    }
    if (options && typeof options.skipValidation === "boolean") {
      this.defaultSkipValidation = options.skipValidation;
    }
  }

  /**
   * Enable or disable deep copy of field values in build().
   * By default, deep copy is enabled to prevent mutation between builds.
   * @param enabled true to enable deep copy, false to disable
   * @returns The builder instance for chaining.
   */
  deepCopy(enabled: boolean) {
    this.deepCopyEnabled = enabled;
    return this;
  }

  /**
   * Adds a field to the mock object.
   * Overloads:
   * - field(name: string): returns an object with type methods (string, number, etc.)
   * - field(name: string, value: any | (() => any)): adds the field directly and returns the builder instance.
   *
   * @param name The name of the field to add.
   * @param value (optional) The value or factory for the field.
   * @returns The builder instance or the type API.
   */
  field<T>(name: string): {
    string: (val?: ValueOrFactory<string>) => MockBuilder;
    number: (val?: ValueOrFactory<number>) => MockBuilder;
    boolean: (val?: ValueOrFactory<boolean>) => MockBuilder;
    array: <T = any>(val: ValueOrFactory<T[]>) => MockBuilder;
    object: <T = Record<string, any>>(val: ValueOrFactory<T>) => MockBuilder;
    /**
     * Sets an incrementing number for the field, starting from `start` and incrementing by `step`.
     * @param start The starting value for the increment (default: 1).
     * @param step The increment step (default: 1).
     * @returns The builder instance for chaining.
     */
    increment: (start?: number, step?: number) => MockBuilder;
  };
  field<T>(name: string, value: ValueOrFactory<T>): MockBuilder;
  field<T>(
    name: string,
    value?: ValueOrFactory<T>,
  ):
    | MockBuilder
    | {
        string: (val?: ValueOrFactory<string>) => MockBuilder;
        number: (val?: ValueOrFactory<number>) => MockBuilder;
        boolean: (val?: ValueOrFactory<boolean>) => MockBuilder;
        array: <T = any>(val: ValueOrFactory<T[]>) => MockBuilder;
        object: <T = Record<string, any>>(val: ValueOrFactory<T>) => MockBuilder;
        increment: (start?: number, step?: number) => MockBuilder;
      } {
    if (arguments.length === 2) {
      return this.addField(name, value as ValueOrFactory<T>);
    }
    return {
      /**
       * Sets a string value or generator for the field.
       * If no value is provided, a random string is generated.
       *
       * @param val The string value or a factory function returning a string.
       * @returns The builder instance for chaining.
       */
      string: (val: ValueOrFactory<string> = () => Math.random().toString(36).slice(2, 6)) => this.addField(name, val),
      /**
       * Sets a number value or generator for the field.
       * If no value is provided, a random integer is generated.
       *
       * @param val The number value or a factory function returning a number.
       * @returns The builder instance for chaining.
       */
      number: (val: ValueOrFactory<number> = () => Math.floor(Math.random() * 1000)) => this.addField(name, val),
      /**
       * Sets a boolean value or generator for the field.
       * If no value is provided, a random boolean is generated.
       *
       * @param val The boolean value or a factory function returning a boolean.
       * @returns The builder instance for chaining.
       */
      boolean: (val: ValueOrFactory<boolean> = () => Math.random() > 0.5) => this.addField(name, val),
      /**
       * Sets an array value or generator for the field.
       *
       * @param val The array value or a factory function returning an array.
       * @returns The builder instance for chaining.
       */
      array: <T = any>(val: ValueOrFactory<T[]>) => this.addField(name, val),
      /**
       * Sets an object value or generator for the field.
       *
       * @param val The object value or a factory function returning an object.
       * @returns The builder instance for chaining.
       */
      object: <T = Record<string, any>>(val: ValueOrFactory<T>) => this.addField(name, val),
      /**
       * Sets an incrementing number for the field, starting from `start` and incrementing by `step`.
       * @param start The starting value for the increment (default: 1).
       * @param step The increment step (default: 1).
       * @returns The builder instance for chaining.
       */
      increment: (start = 1, step = 1) => {
        let counter = start;
        return this.addField(name, () => {
          const val = counter;
          counter += step;
          return val;
        });
      },
    };
  }

  /**
   * Adds a field definition to the builder.
   *
   * @param name The field name.
   * @param val The value or value factory for the field.
   * @returns The builder instance for chaining.
   * @private
   */
  private addField<T>(name: string, val: ValueOrFactory<T>) {
    const generator =
      typeof val === "function"
        ? (obj?: any, index?: number, options?: { deepCopy?: boolean; skipValidation?: boolean }) =>
            (val as Function)(obj, index, options)
        : () => val;
    this.fields.push({ name, generator });
    return this;
  }

  /**
   * Sets the number of objects to generate when build() is called.
   *
   * @param n The number of objects to build.
   * @returns The builder instance for chaining.
   *
   * Example:
   * ```
   * builder.repeat(5).build(); // returns an array of 5 objects
   * ```
   */
  repeat(n: number) {
    this.repeatCount = n;
    return this;
  }

  /**
   * Extends the builder with fields from a template object.
   * Each key-value pair in the template becomes a field.
   *
   * @param template An object whose properties are added as fields.
   * @returns The builder instance for chaining.
   *
   * Example:
   * ```
   * builder.extend({ foo: "bar", count: 42 });
   * ```
   */
  extend(template: Record<string, any>) {
    Object.entries(template).forEach(([key, value]) => {
      this.addField(key, value);
    });
    return this;
  }

  /**
   * Defines a named preset template for reuse in multiple builders.
   *
   * Presets are global and can be used in any MockBuilder instance via the `preset` method.
   * A preset is simply a named object template that can be reused and extended.
   *
   * Example:
   * ```
   * // Define a preset named "user"
   * MockBuilder.definePreset("user", { name: "Alice", age: 30 });
   *
   * // Use the preset in a builder
   * const builder = new MockBuilder().preset("user");
   * const result = builder.build();
   * // result: { name: "Alice", age: 30 }
   *
   * // You can override fields after applying a preset
   * const builder2 = new MockBuilder().preset("user").field("age").number(40);
   * const result2 = builder2.build();
   * // result2: { name: "Alice", age: 40 }
   * ```
   *
   * @param name The name of the preset.
   * @param template The template object to associate with the preset.
   */
  static definePreset(name: string, template: Record<string, any>) {
    this.presets[name] = template;
  }

  /**
   * Applies a preset template by name to the builder.
   * Throws an error if the preset does not exist.
   *
   * @param name The name of the preset to apply.
   * @returns The builder instance for chaining.
   * @throws Error if the preset is not found.
   *
   * Example:
   * ```
   * builder.preset("user");
   * ```
   */
  preset(name: string) {
    const preset = MockBuilder.presets[name];
    if (!preset) throw new Error(`Preset "${name}" not found.`);
    return this.extend(preset);
  }

  /**
   * Builds the mock object(s) according to the defined fields and repeat count.
   * If repeat() was not called or set to 1, returns a single object.
   * If repeat() was set to n > 1, returns an array of n objects.
   *
   * @param options Optional. Options object:
   *   - deepCopy: boolean (overrides the builder's deep copy setting for this build)
   *   - skipValidation: boolean (if true, skips field validation for required fields; default: true)
   * @returns The built object or array of objects, optionally cast to type T.
   *
   * Example:
   * ```
   * interface User { id: number; name: string }
   * const user = builder.build<User>();
   * const users = builder.repeat(2).build<User[]>();
   * ```
   */
  build<T extends object = any>(options?: { deepCopy?: boolean; skipValidation?: boolean } = {}): T {
    // Helper to deep clone objects/arrays to avoid mutation between builds
    function deepClone<V>(value: V): V {
      if (Array.isArray(value)) {
        return value.map(deepClone) as any;
      }
      if (
        value &&
        typeof value === "object" &&
        !(value instanceof Date) &&
        !(value instanceof RegExp) &&
        !(value instanceof Function) &&
        !(value instanceof Map) &&
        !(value instanceof Set) &&
        !(value instanceof WeakMap) &&
        !(value instanceof WeakSet) &&
        !(value instanceof Error) &&
        !(value instanceof Promise)
      ) {
        const result: any = {};
        for (const key in value) {
          result[key] = deepClone((value as any)[key]);
        }
        return result;
      }
      return value;
    }

    const useDeepCopy = typeof options?.deepCopy === "boolean" ? options.deepCopy : this.deepCopyEnabled;
    const skipValidation = options?.skipValidation === undefined ? this.defaultSkipValidation : options.skipValidation;

    options.deepCopy = useDeepCopy;
    options.skipValidation = skipValidation;

    const createOne = (index?: number) => {
      const obj: Record<string, any> = {};
      for (const { name, generator } of this.fields) {
        const val = generator(obj, index, options);
        obj[name] = useDeepCopy ? deepClone(val) : val;
      }
      return obj;
    };

    // --- Validation helper ---
    function validateFields<U>(obj: any, typeKeys: string[]) {
      for (const key of typeKeys) {
        if (!(key in obj)) {
          throw new Error(`Missing field "${key}" in built object.`);
        }
      }
    }

    // --- Get type keys if T is not 'any' ---
    function getTypeKeys<V extends object>(): string[] {
      // This hack uses a dummy object to extract keys at runtime if T is not 'any'
      // At runtime, T is erased, so this only works if user passes a value as a type argument
      // Otherwise, returns empty array (no validation)
      return (Object.keys({} as V) as string[]) || [];
    }

    const typeKeys = getTypeKeys<T>();

    if (this.repeatCount === 1) {
      const obj = createOne();
      if (!skipValidation && typeKeys.length > 0) {
        validateFields(obj, typeKeys);
      }
      return obj as T;
    }

    const arr = Array.from({ length: this.repeatCount }, (_, index) => createOne(index)) as T;
    if (!skipValidation && typeKeys.length > 0 && Array.isArray(arr)) {
      for (const obj of arr as any[]) {
        validateFields(obj, typeKeys);
      }
    }
    return arr;
  }
}
