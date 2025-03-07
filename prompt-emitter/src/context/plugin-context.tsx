import {
  Children,
  ComponentContext,
  createNamedContext,
  useContext,
} from "@alloy-js/core";
import { NoTarget, Type } from "@typespec/compiler";
import { reportDiagnostic } from "../lib.js";
import { $ } from "@typespec/compiler/experimental/typekit";

export interface Plugin {
  name: string;
  metadataPropertyName: string;
  getMetadata(type: Type): Record<string, any>;
}

export interface PluginContext {
  plugins: Set<Plugin>;
}

export const PluginContext: ComponentContext<PluginContext> =
  createNamedContext<PluginContext>("PluginContext");

export function usePluginManager() {
  const context = useContext(PluginContext);

  if (!context) {
    reportDiagnostic($.program, {
      code: "use-plugin-manager-without-provider",
      target: NoTarget,
    });
  }

  return context!;
}
