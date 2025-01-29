# **Automating Test Generation with Copilot: How I Saved Days of Work on My TypeSpec Emitter**

## **Introduction**

As part of my work on a **JavaScript Client Emitter for TypeSpec**, I needed to generate test cases for a **collection of test specs** called **Cadl Ranch** (`@azure-tools/cadl-ranch-specs`). These tests assess an emitter’s **coverage across a wide range of HTTP scenarios**.

Manually writing these tests is **time-consuming**. Each **TypeSpec file** describes an HTTP service, including metadata that defines **how to test each endpoint**, what **input** it expects, and what **output** it should return.

For **52 specs totaling 500 test cases**, writing tests manually would take **days**. Instead, I experimented with **GitHub Copilot’s API** to **automate** this process.

---

## **How I Built It**

### **1️⃣ The Approach: Using Copilot to Write Tests**

Instead of parsing TypeSpec myself, I **fed it directly** to **Copilot's API**, along with a structured prompt, to generate the corresponding test files in TypeScript.

**Example TypeSpec File:**

```typescript
@scenarioService("/routes")
namespace Routes;

@scenario
@scenarioDoc("Simple fixed operation")
@route("fixed")
op fixed(): void;

@route("path")
namespace PathParameters {
  @scenario
  @scenarioDoc("""
    Path parameter defined explicitly
      Value: \"a\"
      Expected path: /routes/path/explicit/a
    """)
  @route("explicit/{param}")
  op explicit(@path param: string): void;
}
```

> **What this does:** Defines HTTP endpoints and **how to test them**.

Instead of **reading and manually converting** each spec into tests, I built a tool that **sent this TypeSpec file to Copilot**, instructing it to generate the correct test cases.

---

### **2️⃣ The First Attempt: Prompting Copilot**

My initial **prompt** looked like this:

```javascript
{
  role: "system",
  content: `You are a helpful assistant that generates TypeScript tests using Vitest.
  The input is a TypeSpec file defining HTTP services with metadata describing how to test them.

  Generate a test file where:
  - Each operation is tested using a test case.
  - The root namespace maps to the root client.
  - Nested namespaces map to subclients.

  Example Spec:
  ${sampleSpec}

  Example Test:
  ${sampleTest}`
}
```

**What went wrong?**

- Copilot **misunderstood the client structure**, generating incorrect imports.
- It **referenced non-existent clients**.
- It **didn’t handle nested namespaces properly**, failing to create the correct sub-clients.

---

### **3️⃣ First Copilot Output: Issues & Debugging**

Copilot generated the following **incorrect test file**:

```typescript
import { describe, it } from "vitest";
import { FixedClient } from "../../../../generated/http/routes/http-client-javascript/src/index.js"; // ❌ Wrong! Didn't match the relative path I needed to just paste this in my project. Also FixedClient doesn't exist

describe("Routes", () => {
  describe("FixedClient", () => {
    const client = new FixedClient("http://localhost:3000"); // ❌ Wrong! Should be RoutesClient

    it("should call the fixed operation", async () => {
      await client.fixed(); // ❌ Wrong! Should be `routesClient.fixed();`
    });
  });
});
```

🔴 **Problems:**  
1️⃣ `FixedClient` **doesn’t exist**—the correct client should be `RoutesClient`.  
2️⃣ The `fixed` operation **belongs to the root client**, but Copilot **tried to call it from a subclient**.  
3️⃣ **Subclient naming was incorrect**, leading to calls that didn’t exist.

---

### **4️⃣ Fixing It: Iterating the Prompt**

I iterated enhancing the propmt after after each trial, I learnt that adjusting the **system prompt** to **explicitly clarify** how to handle problematic things helps a lot, for example:

✔ **How to map root namespaces to the root client**.

     - If an operation is in the root namespace, the root client should be used. For example:
        - \`@scenarioService("/routes") namespace Routes;\`
        - An operation in \`Routes\` like \`op fixed(): void;\` should be called directly from \`RoutesClient\`.
        - Example: \`await client.fixed();\`

✔ **How to correctly structure subclients** for nested namespaces.

     - Nested namespaces or interfaces result in **subclients**. For example:
        - \`namespace PathParameters\` creates a subclient called \`pathParametersClient\`.
        - Operations within nested namespaces (e.g., \`namespace SimpleExpansion\`) are grouped into further subclients like \`simpleExpansionClient\`.

    - Subclient Naming Rules:
        - Subclients are named after the namespace or interface with the suffix \`Client\`. For example:
        - \`namespace SimpleExpansion\` → \`simpleExpansionClient\`
        - \`namespace Explode\` → \`explodeClient\`

✔ **How import paths should mirror TypeSpec structure**. I found it was easier for me to pre-compute the path and provide it in the prompt

    - `Make sure to use this path to import the generated code "${importPath}".`

🔹 **Final Improved Prompt:**

```javascript
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
    ${sampleTest}`
}
```

---

### **5️⃣ The Correct Output: Final Copilot-Generated Tests**

After **iterating the prompt**, Copilot **correctly generated** the following test file:

```typescript
import { describe, it } from "vitest";
import { RoutesClient } from "../../generated/http/routes/http-client-javascript/src/index.js";

describe("Routes", () => {
  const client = new RoutesClient("http://localhost:3000");

  it("should call the fixed operation", async () => {
    await client.fixed(); // ✅ Correctly using the root client
  });

  describe("PathParameters", () => {
    it("should call explicit path parameter operation", async () => {
      await client.pathParametersClient.explicit("a"); // ✅ Correct subclient usage
    });
  });
});
```

> **Now:**  
> ✔ **Imports are correct**.  
> ✔ **Root client is used properly**.  
> ✔ **Nested namespaces map to the right subclients**.

---

## **The Results: Massive Time Savings**

✅ **Total time spent:** ~5 hours (**4 hours building the tool, 1 hour fixing small errors**).  
✅ **Estimated manual effort avoided:** **8-10 days** of writing tests manually.  
✅ **Faster issue detection:**

- Issues in my emitter surfaced **immediately** instead of weeks later.
- While these issues might not have been missed entirely, they **would have been caught much later**, increasing development costs.

---

## **Lessons Learned & Key Takeaways**

### **✅ 1. Copilot Can Dramatically Speed Up Repetitive Tasks**

Using **Copilot API**, I was able to **automate the bulk of the work**, only needing **light manual intervention** at the end.

### **✅ 2. Prompt Engineering Matters—But There’s a Limit**

- I **iterated the prompt** to improve accuracy, but beyond a certain point, it was **faster to fix small errors manually**.
- There’s a **diminishing return** in spending excessive time fine-tuning the prompt.

### **✅ 3. Early Testing Helps Reduce Development Costs**

- The tests **surfaced issues in my emitter much earlier**, rather than waiting until all tests were written manually.
- Catching issues early significantly **lowers the overall cost of development**.

---

## **Food for Thought: Future Explorations**

### **🤔 1. Can We Improve Copilot’s Context Handling?**

- Copilot **API calls are stateless**—every request must include the full prompt.
- **Could GitHub's Assistant API** or a different approach improve **context management** across multiple calls?

### **🤔 2. Would Providing API Surface Information Improve Results?**

- Right now, **only the TypeSpec test spec** is given to Copilot.
- **What if we also provided the API surface**, such as an `index.d.ts` file?
- This **could improve test accuracy**, but it **would also increase prompt size**—is it worth it?

---

## **Final Thoughts**

This experiment showed that **Copilot can massively accelerate tedious development tasks**, allowing me to **focus on the real work**—building the emitter itself.

💡 **If you’re using Copilot in interesting ways, or if you have ideas on improving AI-assisted development workflows, let’s discuss!** 🚀
