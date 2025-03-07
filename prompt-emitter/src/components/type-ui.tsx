import { Type } from "@typespec/compiler";
import { EntityProperties } from "./entity-properties.jsx";
import { TypeId } from "./type-id.jsx";
import { JsonObject, JsonObjectProperty, JsonValue } from "@alloy-js/json";

export function TypeUI({ type }: { type: Type }) {
  return (
    <JsonObject>
      <JsonObjectProperty name="name">
        {"name" in type && type.name ? (
          <JsonValue jsValue={type.name?.toString()} />
        ) : (
          <JsonValue jsValue={"(Anonymous)"} />
        )}
      </JsonObjectProperty>
      <JsonObjectProperty name="kind" jsValue={type.kind} />
      <JsonObjectProperty name="typeId">
        <TypeId type={type} />
      </JsonObjectProperty>
      <EntityProperties entity={type} />
    </JsonObject>
  );
}
