import { Type } from "@typespec/compiler";
import { Children } from "@alloy-js/core";

export function SimpleType({
  type,
  children,
}: {
  type: Type;
  children: Children;
}) {
  return (
    <>
      {type.kind} {children}
    </>
  );
}
