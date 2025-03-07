import { Entity } from "@typespec/compiler";
import { getPropertyRendering } from "../utils/type-config.js";
import { EntityProperty } from "./entity-property.jsx";
import { For } from "@alloy-js/core";
import {} from "@alloy-js/json";
import { usePluginManager } from "../context/plugin-context.jsx";

export interface EntityPropertiesProps {
  entity: Entity;
}

export function EntityProperties(props: EntityPropertiesProps) {
  return (
    <For each={getProperties(props.entity)} comma line>
      {([key, value]) => {
        const action = getPropertyRendering(props.entity as any, key);
        return <EntityProperty name={key} value={value} action={action} />;
      }}
    </For>
  );
}

function getProperties(entity: Entity) {
  const pluginManager = usePluginManager();
  const properties: [string, any][] = Object.entries(entity).filter(([key]) => {
    const action = getPropertyRendering(entity as any, key);
    if (!action) return false;
    if (action === "skip") return false;
    return true;
  });

  for(const plugin of pluginManager.plugins) {
    if(entity.entityKind !== "Type") continue;

    const metadata = plugin.getMetadata(entity);
    if (metadata && Object.keys(metadata).length > 0) {
      properties.push([plugin.metadataPropertyName, {entityKind: "PluginMetadata", ...metadata}]);
    }
  }

  return properties;
}
