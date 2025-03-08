export const serviceValidationPrompt = (
  input: string,
) => `You are given a JSON array describing the REST operations for a service. Each object in the array contains:

- operation name
- HTTP verb
- path (with path parameters if any)
- parameter definitions (path/body)
- possible return types (e.g., \`Widget\` or \`Error\`).

We also have a \`zod.ts\` file that exports Zod schemas for each model type. For example:

- \`export const WidgetSchema = z.object({ ... });\`
- \`export const ErrorSchema = z.object({ ... });\`
- etc.

We want you to generate **one TypeScript file** named \`test-operations.ts\` that does the following:

1. **Imports**

   - Import \`fetch\` from the global environment (assume Node 20+ or browser).
   - Import the relevant Zod schemas from \`./zod\`. For example:
     \`\`\`ts
     import {
       WidgetSchema,
       ErrorSchema,
       // and any others...
     } from "./zod";
     \`\`\`
   - Optionally, import \`z\` from "zod" if needed.

2. **Config / Setup**

   - Define a constant \`BASE_URL = "http://localhost:3000"\` (or some default) for the tested service endpoint.
   - For each model referenced in the JSON, you should reference the correct schema from \`zod.ts\`. If an operation returns \`Widget | Error\`, then you must validate the response against \`WidgetSchema\` on success or \`ErrorSchema\` on error.

3. **Generate a test function per operation**

   - For each operation in the JSON:
     - Create an async function named \`test<Name>()\`, where \`<Name>\` matches the operation name (e.g., \`testList()\`, \`testRead()\`, etc.).
     - Inside that function:
       1. Construct the URL based on \`BASE_URL\` plus the \`path\`. If the path has placeholders like \`"{id}"\`, accept an \`id\` parameter or hardcode a sample ID for testing.
       2. Set the \`method\` from the operation’s \`verb\` (GET, POST, PATCH, DELETE, etc.).
       3. If the operation has a request body (like a create or update), send it as JSON with \`headers: { "Content-Type": "application/json" }\`.
       4. Await the response and parse as JSON.
       5. If \`response.ok\` is false, validate the body using \`ErrorSchema\`. Otherwise, validate using the relevant success schema (e.g., \`WidgetSchema\` or \`z.array(WidgetSchema)\` if it’s an array).
       6. If validation fails, throw an error or print a failure message. If it succeeds, print a success message.

4. **Single Execution Flow**

   - After defining all test functions, create a top-level \`runTests()\` function that calls each one in sequence with any needed parameters.
   - \`runTests()\` should call functions in an order that allows it to correctly validate the service. For example create should happen before get.
   - For any resources created you must keep track of the id or similar to be able to use it for subsequent calls as input.
   - Log to the console when each test starts and finishes.

5. **Error Handling**

   - If a response is not OK (\`!response.ok\`), parse it as JSON and validate with \`ErrorSchema\`. If validation fails, throw an error with details. If it passes, log something like \`console.error("Error response: ", errorBody)\` and continue or handle as you see fit.
   - If a response is OK, validate with the success schema. If it fails, throw an error or log details.

### Output Format

Please produce **one complete TypeScript file**, named \`test-operations.ts\`, that includes:

- The imports from \`zod.ts\` and any minimal dependencies.
- All test functions (one per operation).
- A \`runTests()\` at the bottom that invokes them.
- No extraneous libraries (besides \`zod\` and \`fetch\`).


If the spec references models for which we do not have a schema, skip them or place a placeholder comment. Use best practices for modern TypeScript, such as \`async/await\`, noImplicitAny, etc.

---

Please generate that file now.

### Operations JSON Definition
\`\`\`json
${input}
\`\`\`


- DO NOT INCLUDE CONVERSATIONAL CONTENT.
- DO NOT WRAP CODE WITHIN CODE BLOCKS.
`;
