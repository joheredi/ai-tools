import { ChatCompletionsToolDefinition } from "@azure-rest/ai-inference";

const describeType: ChatCompletionsToolDefinition = {
  type: "function",
  function: {
    name: "describeType",
    description:
      "Given a Type, returns a description containing they name, kind, and all its properties",
    parameters: {
      type: "object",
      properties: {
        typeId: {
          type: "string",
          description: "The id of the type to get the description of",
        },
      },
      required: ["typeId"],
      additionalProperties: false,
    },
  },
};
