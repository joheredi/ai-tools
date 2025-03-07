import { Children } from "@alloy-js/core/jsx-runtime";
import { Plugin, PluginContext } from "../context/plugin-context.jsx";
import { TypesProvider } from "./types-provider.jsx";

export interface PromptEmitterProviderProps {
  plugins?: Plugin[];
  children: Children;
}

export function PromptEmitterProvider(props: PromptEmitterProviderProps) {
  return (
    <PluginContext.Provider value={{ plugins: new Set(props.plugins ?? []) }}>
      <TypesProvider>{props.children}</TypesProvider>
    </PluginContext.Provider>
  );
}
