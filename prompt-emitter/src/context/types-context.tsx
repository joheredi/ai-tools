import {
  ComponentContext,
  createNamedContext,
  useContext,
} from "@alloy-js/core";
import { NoTarget, Type } from "@typespec/compiler";
import { reportDiagnostic } from "../lib.js";
import { $ } from "@typespec/compiler/experimental/typekit";

export interface TypesCtx {
  types: Set<Type>;
  trackType(type: Type): string;
  getTypeById(id: string): Type | undefined;
}

export const TypesContext: ComponentContext<TypesCtx> =
  createNamedContext<TypesCtx>("TypesContext");

export function useTypes() {
  const context = useContext(TypesContext);

  if (!context) {
    reportDiagnostic($.program, {
      code: "use-types-without-provider",
      target: NoTarget,
    });
  }

  return context!;
}
