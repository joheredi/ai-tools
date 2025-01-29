import aiInference from "@azure-rest/ai-inference";
import { isUnexpected } from "@azure-rest/ai-inference";
import * as dotenv from "dotenv";
import { sampleSpec, sampleTest } from "./context.js";
import { Chalk } from "chalk";
import ora from "ora";
import { getRelativeImportPath } from "./get-relative-import-path.js";
import { readFile } from "fs/promises";

const chalk = new Chalk();
dotenv.config();

/**
 * Generates a test file based on the provided spec.
 * @param {{ fullPath: string, relativePath: string }} spec
 * @returns {Promise<string>} The test file contents
 */
export async function emitTest(spec) {
  // Read spec content
  const specContent = await readFile(spec.fullPath, {
    encoding: "utf-8",
  });

  if (!specContent) {
    console.error(chalk.red("Invalid spec provided"));
    console.log("Spec:", spec);
    throw new Error("Invalid spec provided");
  }

  const copilotKey = process.env["COPILOT_KEY_CREDENTIAL"];
  const copilotModel = process.env["COPILOT_MODEL"];
  const credential = { key: copilotKey };
  const client = aiInference(
    "https://models.inference.ai.azure.com",
    credential
  );

  const importPath = getRelativeImportPath(spec.fullPath);

  const spinner = ora("💡 Starting test generation...").start();

  try {
    spinner.start("🛠️ Copilot is analyzing the spec...");
    const result = await client.path("/chat/completions").post({
      body: {
        model: copilotModel,
        messages: [
          {
            role: "system",
            content: `
            You are a helpful assistant that helps me write tests in TypeScript using Vitest. 
            Respond with only the TypeScript code, without any conversational parts, explanations, or comments. The response should be a fully valid TypeScript test file based on the provided TypeSpec.
            As Input, I will send you a TypeSpec file that describes a TestScenario, and you will use this spec to generate a test file.
            The test file should contain a test for each test case in the TestScenario.

            ### Rules for Writing Tests
            - Each test should call the appropriate client and operation defined in the TypeSpec.
            - If an operation is in the root namespace, the root client should be used. For example:
                - \`@scenarioService("/routes") namespace Routes;\`
                - An operation in \`Routes\` like \`op fixed(): void;\` should be called directly from \`RoutesClient\`.
                - Example: \`await client.fixed();\`

            - Nested namespaces or interfaces result in **subclients**. For example:
                - \`namespace PathParameters\` creates a subclient called \`pathParametersClient\`.
                - Operations within nested namespaces (e.g., \`namespace SimpleExpansion\`) are grouped into further subclients like \`simpleExpansionClient\`.

            - Subclient Naming Rules:
                - Subclients are named after the namespace or interface with the suffix \`Client\`. For example:
                - \`namespace SimpleExpansion\` → \`simpleExpansionClient\`
                - \`namespace Explode\` → \`explodeClient\`

            - When calling operations in nested namespaces, ensure you access the correct subclient:
                - Example for nested namespaces:
                - If \`PathParameters/SimpleExpansion\` contains \`Standard\` and an operation \`primitive\`, call it like:
                    \`await client.simpleExpansionClient.standardClient.primitive("a");\`
                - Access sub clients from the root client.
            - Make sure to use this path to import the generated code "${importPath}".


            ### Decorators and How to Use Them
            - \`@scenarioService\`: Use this to name the test's top-level describe block. For example:
                - \`@scenarioService("/type/scalar")\` generates: \`describe("Type Scalar", () => { ... });\`

            - \`@scenario\`: Decorates operations. This usually translates into an \`it\` block.

            - \`@scenarioDoc\`: Add this as the description of the test case. Include details from the documentation in the test name and comments.

            ### Generated Library Context
            - The generated library structure mirrors the structure of the TypeSpec file:
                - Root namespaces map to the root client (e.g., \`RoutesClient\`).
                - Nested namespaces and interfaces map to subclients (e.g., \`pathParametersClient\`, \`simpleExpansionClient\`, etc.).
            - Subclient names follow camelCase naming conventions.
            - The operations return the payload not an http response. This means that if the payload is a string, const response = await client.operation(); will be a string. No need to access the .body because it doesn't exist unless that is a property of the body defined in the spec
               -  expect(response.body).toBe("Monday"); // this is incorrect
                - expect(response).toBe("Monday"); // this is correct
            - Namespaces can be dotted for example namespace Foo.Bar.Baz in this case it means that there are 3 namespaces with a hierarchy of Foo -> Bar -> Baz
                - When only the last namespace has operations, that becomes the topLevel client, meaning there are no clients for Foo or Bar.
            - There might be namespaces that only contain other namespaces, if there is only a single namespace then the children of that namespace becomes the client and the wrapping namespace is ignored.
              - However if the namespace contains multiple namespaces then the namespace becomes the client and the children become sub-clients.

            - Example: For a TypeSpec file:
                \`\`\`
                @scenarioService("/routes")
                namespace Routes;
                @route("path")
                namespace PathParameters {
                @route("simple")
                namespace SimpleExpansion {
                    @route("standard")
                    op primitive(param: string): void;
                }
                }
                \`\`\`
                - The root client is \`RoutesClient\`.
                - The subclient for \`PathParameters\` is \`pathParametersClient\`.
                - The subclient for \`SimpleExpansion\` is \`simpleExpansionClient\`.
                - To call \`primitive\`, the path is: \`client.pathParametersClient.simpleExpansionClient.standardClient.primitive("a");\`.

            ### Example Spec File:
            ${sampleSpec}

            ### Example Test File:
            ${sampleTest}
              `,
          },
          { role: "user", content: specContent },
        ],
      },
    });

    if (isUnexpected(result)) {
      const error = result.body.error;
      spinner.fail("❌ Error occurred while processing the request.");
      throw new Error(error.message, { cause: { ...error } });
    }

    spinner.text = "📦 Processing response from Copilot API...";

    const response = result.body.choices[0]?.message?.content;

    if (!response) {
      spinner.fail("❌ The response from Copilot API is empty.");
      throw new Error("The response is empty");
    }

    // Remove ```typescript markers from the response
    const cleanedResponse = response
      .replace(/^```typescript\s*/i, "")
      .replace(/```$/, "");

    spinner.succeed("✅ Test generation complete!");

    return cleanedResponse;
  } catch (error) {
    spinner.fail(`❌ An error occurred: ${error.message}`);
    throw error;
  }
}
