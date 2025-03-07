import {
  EmitContext,
  emitFile,
  joinPaths,
  navigateProgram,
  Operation,
} from "@typespec/compiler";
import * as ay from "@alloy-js/core";
import { $ } from "@typespec/compiler/experimental/typekit";
import { InspectType } from "./components/inspect-type.jsx";
import { useTypes } from "./context/types-context.jsx";
import { TypesProvider } from "./components/types-provider.jsx";
import { JsonArray, SourceFile } from "@alloy-js/json";

export async function $onEmit(context: EmitContext) {
  const operations = getOperations();
  const program = (
    <ay.Output>
      <ay.SourceDirectory path={"src"}>
        <SourceFile path={"out.json"}>
          <TypesProvider>
            <JsonArray>
              <InspectType type={operations[5]} />
            </JsonArray>
          </TypesProvider>
        </SourceFile>
      </ay.SourceDirectory>
    </ay.Output>
  );
  await writeOutput(program as any, context.emitterOutputDir);
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
