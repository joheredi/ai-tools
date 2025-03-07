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
  },
});

export const { reportDiagnostic, createDiagnostic } = $lib;
