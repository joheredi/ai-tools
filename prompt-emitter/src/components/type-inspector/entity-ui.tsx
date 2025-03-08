import { Entity } from "@typespec/compiler";
import { TypeUI } from "./type-ui.jsx";
import { JsValue } from "./js-value.jsx";

export interface EntityUIProps {
  readonly entity: Entity;
}

export function EntityUI({ entity }: EntityUIProps) {
  switch (entity.entityKind) {
    case "Type":
      return <TypeUI type={entity} />;
    case "Value":
      return <TypeUI type={entity.type} />;
    default:
      return null;
  }
}
