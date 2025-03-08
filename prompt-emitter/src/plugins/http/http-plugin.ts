import { Plugin } from "../../context/plugin-context.jsx";
import { $ } from "@typespec/compiler/experimental/typekit";
import "@typespec/http/experimental/typekit";

export function createHttpPlugin(): Plugin {
  return {
    name: "http-plugin",
    metadataPropertyName: "http-metadata",
    getMetadata(type) {
      if ($.operation.is(type)) {
        const httpOperation = $.httpOperation.get(type);
        const verb = httpOperation.verb;
        const path = httpOperation.path;
        return { verb, path };
      }

      if ($.modelProperty.is(type)) {
        const properties: Record<string, any> = {};

        if ($.modelProperty.isHttpHeader(type)) {
          properties["http-param-location"] = "header";
        }

        if ($.modelProperty.isHttpQueryParam(type)) {
          properties["http-param-location"] = "query";
        }

        if ($.modelProperty.isHttpPathParam(type)) {
          properties["http-param-location"] = "path";
        }

        if ($.modelProperty.isHttpMultipartBody(type)) {
          properties["http-body-kind"] = "multipart";
        } else {
          properties["http-body-kind"] = "single";
        }
        return properties;
      }

      return {};
    },
  };
}
