import { Type } from "@typespec/compiler";
import { NamedTypeRef } from "./named-type-reference.jsx";
import { useTypes } from "../context/types-context.jsx";
import { $ } from "@typespec/compiler/experimental/typekit";
import { TypeId } from "./type-id.jsx";

export function ParentReference({ type }: { type: Type }) {
  switch (type.kind) {
    case "Namespace":
    case "Operation":
    case "Interface":
    case "Enum":
    case "ModelProperty":
    case "Scalar":
    case "Model":
    case "Union":
      if (type.name !== undefined) {
        return <><NamedTypeRef type={type as any} /> <TypeId type={type}/></>;
      } else {
        return null;
      }
    default:
      return null;
  }
}
