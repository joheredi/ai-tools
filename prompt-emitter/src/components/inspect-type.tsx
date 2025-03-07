import { Entity } from "@typespec/compiler";
import { EntityUI } from "./entity-ui.jsx";

export interface InspectTypeProps {
  type: Entity;
}

export function InspectType(props: InspectTypeProps) {
  return <EntityUI entity={props.type} />;
}
