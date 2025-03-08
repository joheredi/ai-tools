import { Type } from "@typespec/compiler";
import { NamedTypeRef } from "./named-type-reference.jsx";

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
        return <NamedTypeRef type={type as any} />;
      } else {
        return null;
      }
    default:
      return null;
  }
}
