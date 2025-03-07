import { Entity } from "@typespec/compiler";
import { TypeUI } from "./type-ui.jsx";

export interface EntityUIProps {
  readonly entity: Entity;
}

export function EntityUI({ entity }: EntityUIProps) {
  switch (entity.entityKind) {
    case "Type":
      return <TypeUI type={entity} />;
    default:
      return null;
  }
}
