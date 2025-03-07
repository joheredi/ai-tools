import { Entity } from "@typespec/compiler";
import { TypeReference } from "./type-reference.jsx";

export function EntityReference({ entity }: { entity: Entity }) {
  switch (entity.entityKind) {
    case "Type":
      return <TypeReference type={entity} />;
    default:
      return null;
  }
}
