import { getTypeName, Type } from "@typespec/compiler";
type NamedType = Type & { name: string };

export function NamedTypeRef({ type }: { type: NamedType }) {
  return getTypeName(type);
}
