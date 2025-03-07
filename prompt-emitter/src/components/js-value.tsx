import { List } from "@alloy-js/core";

export interface JsValueProps {
  readonly value: any;
}

/**
 * A short description of the object values.
 * Can be used to render tree node in ObjectInspector
 * or render objects in TableInspector.
 */
export function JsValue({ value }: JsValueProps) {
  switch (typeof value) {
    case "bigint":
      return String(value) + "n";
    case "number":
      return String(value);
    case "string":
      return `\"${value}\"`;
    case "boolean":
      return String(value);
    case "undefined":
      return "undefined";
    case "object":
      if (value === null) {
        return "null";
      }
      if (value instanceof Date) {
        return value.toString();
      }
      if (value instanceof RegExp) {
        return value.toString();
      }
      if (Array.isArray(value)) {
        return `Array(${value.length})`;
      }
      if (!value.constructor) {
        return "Object";
      }
      if (
        typeof value.constructor.isBuffer === "function" &&
        value.constructor.isBuffer(value)
      ) {
        return `Buffer[${value.length}]`;
      }

      return value.constructor.name;
    case "function":
      return (
        <List>
          ƒ&nbsp;
          {value.name}()
        </List>
      );
    case "symbol":
      return value.toString();
    default:
      return `""`;
  }
}
