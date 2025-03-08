import * as ay from "@alloy-js/core";
import { Type } from "@typespec/compiler";
import { PromptEmitterProvider } from "./type-inspector/prompt-emitter-provider.jsx";
import { JsonArray, JsonArrayElement, SourceFile } from "@alloy-js/json";
import { InspectType } from "./type-inspector/inspect-type.jsx";
import { createHttpPlugin } from "../plugins/http/http-plugin.js";
import { createVisibilityPlugin } from "../plugins/visibility-plugin.js";
import { useTypes } from "../context/types-context.jsx";

export interface TypeDescriptionProps {
  types: Type[];
}

export function TypeDescription(props: TypeDescriptionProps) {
  return (
    <ay.Output>
      <PromptEmitterProvider
        plugins={[createHttpPlugin(), createVisibilityPlugin()]}
      >
        <ay.SourceDirectory path={"src"}>
          <SourceFile path={"out.json"}>
            <JsonArray>
              <ReferencedTypes />
              <ay.For each={props.types} comma line>
                {(operation) => <InspectType type={operation} />}
              </ay.For>
              {() => {
                const { types } = useTypes();

                return (
                  <>
                    <hbr />
                    <ay.For each={Array.from(types.values())}>
                      {(type) => <InspectType type={type} />}
                    </ay.For>
                  </>
                );
              }}
            </JsonArray>
          </SourceFile>
        </ay.SourceDirectory>
      </PromptEmitterProvider>
    </ay.Output>
  );
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
