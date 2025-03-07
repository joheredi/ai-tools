import { Entity } from "@typespec/compiler";
import { EntityPropertyConfig } from "../utils/type-config.js";
import { ParentReference } from "./parent-reference.jsx";
import { EntityReference } from "./entity-reference.jsx";
import { EntityUI } from "./entity-ui.jsx";
import { ItemList } from "./item-list.jsx";
import { JsValue } from "./js-value.jsx";
import { Indent } from "@alloy-js/core";
import { useTypes } from "../context/types-context.jsx";
import { $ } from "@typespec/compiler/experimental/typekit";

export interface EntityPropertyProps {
  name: string;
  value: any;
  action: EntityPropertyConfig;
}

export function EntityProperty(props: EntityPropertyProps) {
  return (
    <>
      {props.name}:{" "}
      <EntityPropertyValue value={props.value} action={props.action} />
    </>
  );
}

export interface EntityPropertyValueProps {
  value: any;
  action: EntityPropertyConfig;
}

export function EntityPropertyValue({
  value,
  action,
}: EntityPropertyValueProps) {
  const render = (x: Entity) => {
    const { types } = useTypes();
    if(x.entityKind === "Type" && $.type.isUserDefined(x)) {
      types.add(x);
    }


    if (action === "parent") {
      return x.entityKind === "Type" ? <ParentReference type={x} /> : null;
    }

    if (action === "ref") {
      return <EntityReference entity={x} />;
    }

    return (
      <Indent>
        <EntityUI entity={x} />
      </Indent>
    );
  };

  if (value === undefined) {
    return null;
  } else if (value.entityKind) {
    return render(value);
  } else if (
    typeof value === "object" &&
    "entries" in value &&
    typeof value.entries === "function"
  ) {
    return <ItemList items={value} render={render} />;
  } else {
    return <JsValue value={value} />;
  }
}
