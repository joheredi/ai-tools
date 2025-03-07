import { createTypeSpecLibrary } from "@typespec/compiler";

export const $lib = createTypeSpecLibrary({
  name: "prompt-emitter",
  diagnostics: {
    "use-types-without-provider": {
      severity: "error",
      messages: {
        default: "You must provide a `types` object when using `useTypes`.",
      },
    },
    "use-plugin-manager-without-provider": {
      severity: "error",
      messages: {
        default:
          "You must provide a `pluginManager` object when using `usePluginManager`.",
      },
    },
  },
});

export const { reportDiagnostic, createDiagnostic } = $lib;
