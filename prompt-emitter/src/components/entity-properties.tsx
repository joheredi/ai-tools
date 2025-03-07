import { Entity } from "@typespec/compiler";
import { getPropertyRendering } from "../utils/type-config.js";
import { EntityProperty } from "./entity-property.jsx";
import { For } from "@alloy-js/core";

export interface EntityPropertiesProps {
  entity: Entity;
}

export function EntityProperties(props: EntityPropertiesProps) {
  return (
    <For each={getProperties(props.entity)}>
      {([key, value]) => {
        const action = getPropertyRendering(props.entity as any, key);
        return <EntityProperty name={key} value={value} action={action} />;
      }}
    </For>
  );
}

function getProperties(entity: Entity) {
  return Object.entries(entity).filter(([key]) => {
    const action = getPropertyRendering(entity as any, key);
    if (!action) return false;
    if (action === "skip") return false;
    return true;
  });
}
