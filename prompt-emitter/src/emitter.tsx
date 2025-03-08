import {
  EmitContext,
  emitFile,
  joinPaths,
  navigateProgram,
  Operation,
} from "@typespec/compiler";
import * as ay from "@alloy-js/core";
import { $ } from "@typespec/compiler/experimental/typekit";
import { InspectType } from "./components/type-inspector/inspect-type.jsx";
import { useTypes } from "./context/types-context.jsx";
import { renderToMemory } from "./utils/render-to-memory.js";
import { TypeDescription } from "./components/type-description.jsx";
import AiInference, { isUnexpected } from "@azure-rest/ai-inference";
import { serviceValidationPrompt } from "./ai/prompts/index.js";
import { config } from "dotenv";
import { tsServiceTest } from "./ai/prompts/ts-test.js";
import { JsonArray, SourceFile } from "@alloy-js/json";
import { PromptEmitterProvider } from "./components/type-inspector/prompt-emitter-provider.jsx";
import { createHttpPlugin } from "./plugins/http/http-plugin.js";
import { createVisibilityPlugin } from "./plugins/visibility-plugin.js";
import { TypesProvider } from "./components/type-inspector/types-provider.jsx";

config();

export async function $onEmit(context: EmitContext) {
  const operations = getOperations();
  const operationsDescription = await renderToMemory(
    <ay.Output>
      <PromptEmitterProvider
        plugins={[createHttpPlugin(), createVisibilityPlugin()]}
      >
        <ay.SourceDirectory path={"src"}>
          <SourceFile path={"out.json"}>
            <JsonArray>
              <ReferencedTypes />
              <InspectType type={operations[5]} />
            </JsonArray>
          </SourceFile>
        </ay.SourceDirectory>
      </PromptEmitterProvider>
    </ay.Output>,
  );
  console.log(process.env.COPILOT_KEY_CREDENTIAL);

  const client = AiInference(
    "https://models.inference.ai.azure.com",
    {
      key: process.env.COPILOT_KEY_CREDENTIAL ?? "",
    },
    { apiVersion: "2024-12-01-preview" },
  );

  const response = await client.path("/chat/completions").post({
    body: {
      model: process.env.COPILOT_MODEL ?? "",
      messages: [
        {
          role: "user",
          content: tsServiceTest(operationsDescription),
        },
      ],
      seed: 1,
    },
  });

  if (isUnexpected(response)) {
    throw new Error(response.body.error.message);
  }

  await emitFile(context.program, {
    path: joinPaths(context.emitterOutputDir, "output.ts"),
    content: response.body.choices[0].message.content ?? "",
  });
}

function ReferencedTypes() {
  const { types } = useTypes();

  return (
    <>
      <hbr />
      <ay.For each={Array.from(types.values())}>
        {(type) => <InspectType type={type} />}
      </ay.For>
    </>
  );
}

function getOperations() {
  const operations: Operation[] = [];
  navigateProgram($.program, {
    operation(operation) {
      operations.push(operation);
    },
  });

  return operations;
}

async function writeOutput(
  rootComponent: ay.Children,
  emitterOutputDir: string,
) {
  const tree = ay.render(rootComponent);
  await writeOutputDirectory(tree, emitterOutputDir);
}

async function writeOutputDirectory(
  dir: ay.OutputDirectory,
  emitterOutputDir: string,
) {
  for (const sub of dir.contents) {
    if (Array.isArray(sub.contents)) {
      await writeOutputDirectory(sub as ay.OutputDirectory, emitterOutputDir);
    } else {
      await emitFile($.program, {
        content: sub.contents as string,
        path: joinPaths(emitterOutputDir, sub.path),
      });
    }
  }
}
