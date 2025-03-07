import { resolvePath } from "@typespec/compiler";
import {
  createTestLibrary,
  TypeSpecTestLibrary,
} from "@typespec/compiler/testing";
import { fileURLToPath } from "url";

export const PromptEmitterTestLibrary: TypeSpecTestLibrary = createTestLibrary({
  name: "prompt-emitter",
  packageRoot: resolvePath(fileURLToPath(import.meta.url), "../../../../"),
});
