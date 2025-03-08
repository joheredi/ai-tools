import { isVoidType, Type } from "@typespec/compiler";
import { NamedTypeRef } from "./named-type-reference.jsx";
import { EntityUI } from "./entity-ui.jsx";
import { $ } from "@typespec/compiler/experimental/typekit";
import { SimpleType } from "./simple-type.jsx";
import { For } from "@alloy-js/core";
import { JsonArray, JsonArrayElement } from "@alloy-js/json";

export function TypeReference({ type }: { type: Type }) {
  switch (type.kind) {
    case "Namespace":
    case "Operation":
    case "Interface":
    case "Enum":
    case "ModelProperty":
    case "Scalar":
      return <NamedTypeRef type={type} />;
    case "Model":
      if (type.name === "") {
        return (
          <>
            <EntityUI entity={type} />
          </>
        );
      } else {
        return <NamedTypeRef type={type} />;
      }
    case "Union":
      if ($.union.is(type) && type.name !== undefined) {
        return <NamedTypeRef type={type as any} />;
      } else {
        const u = $.union.filter(
          type,
          (v) => !isVoidType(v.type) && !$.type.isNever(v.type),
        );

        if (u.variants.size === 1) {
          const variant = Array.from(u.variants.values())[0]!;
          return <TypeReference type={variant.type} />;
        }

        return (
          <JsonArray>
            <For each={u.variants} comma line>
              {(key, variant) => {
                return (
                  <JsonArrayElement>
                    <TypeReference type={variant.type} />
                  </JsonArrayElement>
                );
              }}
            </For>
          </JsonArray>
        );
      }

    case "TemplateParameter":
      return <>Template Param: {type.node.id.sv}</>;
    case "String":
      return <SimpleType type={type}>"{type.value}"</SimpleType>;
    case "Number":
    case "Boolean":
      return <SimpleType type={type}>{type.value.toString()}</SimpleType>;
    default:
      return null;
  }
}
