import { JsonObject, JsonObjectProperty } from "@alloy-js/json";
import { getTypeName, Type } from "@typespec/compiler";
import { TypeId } from "./type-id.jsx";
type NamedType = Type & { name: string };

export function NamedTypeRef({ type }: { type: NamedType }) {
  return (
    <JsonObject>
      <JsonObjectProperty
        name="namedRef"
        jsValue={getTypeName(type).replace(/"/g, '\\"')}
      />
      <JsonObjectProperty name="typeId">
        <TypeId type={type} />
      </JsonObjectProperty>
    </JsonObject>
  );
}
