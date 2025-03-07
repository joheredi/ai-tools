import { Type } from "@typespec/compiler";
import { EntityProperties } from "./entity-properties.jsx";
import { Indent, List } from "@alloy-js/core";
import { TypeId } from "./type-id.jsx";

export function TypeUI({ type }: { type: Type }) {

  return ( 
    <List>
      <>
        {type.kind}: {"name" in type ? type.name?.toString() : "(Anonymous)"} <TypeId type={type} />
      </>
      <Indent>
        <EntityProperties entity={type} />
      </Indent>
    </List>
  );
}
