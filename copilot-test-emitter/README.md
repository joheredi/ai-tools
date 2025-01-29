# **TypeSpec Test Generator with Copilot API**

## **Overview**

This project automates the generation of test cases for HTTP services defined using **TypeSpec**. It leverages the **GitHub Copilot API** to generate test files based on metadata embedded within TypeSpec specifications. The tool dramatically reduces the manual effort required to write and maintain tests, ensuring consistency and efficiency.

## **Why This Project?**

Manually writing test cases for TypeSpec-defined HTTP services is time-consuming. Each test requires:

- Reading and interpreting the spec
- Mapping input and output expectations
- Writing structured tests

Historically, writing tests for one spec took **~45 minutes**. With this tool:

- **52 specs (~500 test cases) were generated in ~4 hours**, with only **1 hour** of manual fixes.
- This represents a **~10x efficiency improvement** compared to manual test writing.

## **How It Works**

1. **Discovers TypeSpec files defining tests**: These are all specs from @azure-tool/cadl-ranch-specs
2. **Uses Copilot API**: Generates test cases automatically based on structured prompts.
3. **Outputs formatted TypeScript tests**: The tool produces **Vitest-based** test files that can be directly executed.

## **Key Features**

✅ **Automated Test Generation** – Converts TypeSpec metadata into valid test cases.  
✅ **Azure Inference Library** – This tool uses the Azure JavaScript Inference library @azure-rest/ai-inference [npm](https://npmjs.org/@azure-rest/ai-inference).
✅ **Copilot API Integration** – Uses AI to generate structured, readable tests.  
✅ **Handles Large Scale** – Processes multiple specs in a batch (e.g., 52 specs with ~500 test cases).  
✅ **Reduces Manual Work** – Generates 90% of the test cases correctly, requiring only minor manual fixes.  
✅ **Vitest Support** – The generated tests follow best practices using [Vitest](https://vitest.dev/).

## **Installation & Usage**

### **Prerequisites**

- Node.js **20+**
- GitHub Copilot API Key

### **Installation**

```bash
git clone https://github.com/joheredi/ai-tools.git
cd copilot-test-emitter
npm install
```

### **Configuration**

Create a `.env` file and add your **GitHub Copilot API key**:

````env
COPILOT_KEY_CREDENTIAL=<Access token from github>
COPILOT_MODEL=gpt-4o
# PROCESS_ALL_SPECS=true # If not set it will only pick a single spec randomly to test to avoid getting throttled while iterating on the prompt
# SPEC_TEST=http/type/enum/extensible/main.tsp``` # Target a specific spec

### **Run the Tool**

```bash
node main.js
````

### **Example Output**

For a TypeSpec file like:

```typescript
@scenarioService("/routes")
namespace Routes;

@scenario
@scenarioDoc("Simple fixed route test")
@route("fixed")
op fixed(): void;
```

The tool generates:

```typescript
import { describe, it, expect } from "vitest";
import { RoutesClient } from "../../generated/http/routes/http-client-javascript/src/index.js";

describe("Routes", () => {
  const client = new RoutesClient("http://localhost:3000");

  it("Simple fixed route test", async () => {
    await client.fixed();
    // Assert successful execution
  });
});
```
