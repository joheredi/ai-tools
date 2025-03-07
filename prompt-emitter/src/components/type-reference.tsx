import { Type } from "@typespec/compiler";
import { NamedTypeRef } from "./named-type-reference.jsx";
import { EntityUI } from "./entity-ui.jsx";
import { $ } from "@typespec/compiler/experimental/typekit";
import { SimpleType } from "./simple-type.jsx";

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
        return (
          <>
            {[...type.variants.values()].map((variant, i) => {
              return (
                <>
                  <TypeReference type={variant.type} />
                  {i < type.variants.size - 1 ? " | " : ""}
                </>
              );
            })}
          </>
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
