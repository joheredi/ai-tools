import { getLifecycleVisibilityEnum } from "@typespec/compiler";
import { Plugin } from "../context/plugin-context.jsx";
import { $ } from "@typespec/compiler/experimental/typekit";
import "@typespec/http/experimental/typekit";

export function createVisibilityPlugin(): Plugin {
  const lifecycleEnum = getLifecycleVisibilityEnum($.program);
  return {
    name: "visibility-plugin",
    metadataPropertyName: "visibility-metadata",
    getMetadata(type) {
      if ($.modelProperty.is(type)) {
        const visibilities = $.modelProperty.getVisibilityForClass(
          type,
          lifecycleEnum,
        );
        const value: string[] = [];

        for (const visibility of visibilities) {
          value.push(visibility.name);
        }

        return { visibilities: value };
      }

      return {};
    },
  };
}
