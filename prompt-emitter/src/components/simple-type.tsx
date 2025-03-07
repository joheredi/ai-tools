import { Type } from "@typespec/compiler";
import { Children } from "@alloy-js/core";
import { JsonObject, JsonObjectProperty } from "@alloy-js/json";

export interface SimpleTypeProps {
  type: Type;
  children: Children;
}

export function SimpleType({ type, children }: SimpleTypeProps) {
  return (
    <JsonObject>
      <JsonObjectProperty name="kind" jsValue={type.kind} />
      <JsonObjectProperty name="value">{children}</JsonObjectProperty>
    </JsonObject>
  );
}
