export const sampleSpec = `
import "@typespec/http";
import "@azure-tools/cadl-ranch-expect";
import "@azure-tools/typespec-client-generator-core";

using TypeSpec.Http;
using Azure.ClientGenerator.Core;

@scenarioService("/type/scalar")
namespace Scalar;


@scenario
@scenarioDoc("""
  Simple operation in the root namespace
    Expected path: /routes/fixed
  """)
@route("fixed")
op fixed(): void;

@operationGroup
@route("/string")
interface String {
  #suppress "@azure-tools/typespec-azure-core/use-standard-operations" "For testing"
  @scenario
  @scenarioDoc("Expect to handle a string value. Mock api will return 'test'")
  @get
  @doc("get string value")
  get(): string;

  #suppress "@azure-tools/typespec-azure-core/use-standard-operations" "For testing"
  @scenario
  @scenarioDoc("Expect to send a string value. Mock api expect to receive 'test'")
  @put
  @doc("put string value")
  put(@body @doc("_") body: string): void;
}

@operationGroup
@route("/boolean")
interface Boolean {
  #suppress "@azure-tools/typespec-azure-core/use-standard-operations" "For testing"
  @scenario
  @scenarioDoc("Expect to handle a boolean value. Mock api will return true ")
  @get
  @doc("get boolean value")
  get(): boolean;

  #suppress "@azure-tools/typespec-azure-core/use-standard-operations" "For testing"
  @scenario
  @scenarioDoc("Expect to send a boolean value. Mock api expect to receive 'true'")
  @put
  @doc("put boolean value")
  put(@body @doc("_") body: boolean): void;
}

@operationGroup
@route("/unknown")
interface Unknown {
  #suppress "@azure-tools/typespec-azure-core/use-standard-operations" "For testing"
  @scenario
  @scenarioDoc("Expect to handle a unknown type value. Mock api will return 'test'")
  @get
  @doc("get unknown value")
  get(): unknown;

  #suppress "@azure-tools/typespec-azure-core/use-standard-operations" "For testing"
  @scenario
  @scenarioDoc("Expect to send a string value. Mock api expect to receive 'test'")
  @put
  @doc("put unknown value")
  put(@body @doc("_") body: unknown): void;
}

@doc("Template to have scalar types operations")
interface ScalarTypesOperations<T, TDoc extends string> {
  @scenario
  @scenarioDoc(
    """
      Expected response body:
      \`\`\`json
      {doc}
      \`\`\`
      """,
    {
      doc: TDoc,
    }
  )
  @get
  @route("/response_body")
  responseBody(): T;

  @scenario
  @scenarioDoc(
    """
      Expected input body:
      \`\`\`json
      {doc}
      \`\`\`
      """,
    {
      doc: TDoc,
    }
  )
  @put
  @route("/resquest_body")
  requestBody(@body body: T): void;

  @scenario
  @scenarioDoc(
    """
      Expected request parameter:
      value={doc}
      """,
    {
      doc: TDoc,
    }
  )
  @get
  @route("/request_parameter")
  requestParameter(@query value: T): void;
}

@doc("Decimal type")
@route("/decimal")
@operationGroup
interface DecimalType extends ScalarTypesOperations<decimal, "0.33333"> {}

@doc("Decimal128 type")
@route("/decimal128")
@operationGroup
interface Decimal128Type extends ScalarTypesOperations<decimal128, "0.33333"> {}

@doc("Template to verify number types")
interface NumberTypesVerifyOperations<T, VerifyValues extends string, ResultValue extends string> {
  @scenario
  @scenarioDoc(
    """
      Get verify values:
      {doc}
      """,
    {
      doc: VerifyValues,
    }
  )
  @get
  @route("/prepare_verify")
  prepareVerify(): T[];

  @scenario
  @scenarioDoc(
    """
      Expected input body:
      \`\`\`json
      {doc}
      \`\`\`
      """,
    {
      doc: ResultValue,
    }
  )
  @post
  @route("/verify")
  verify(@body body: T): void;
}

@doc("Decimal type verification")
@route("/decimal")
@operationGroup
interface DecimalVerify extends NumberTypesVerifyOperations<decimal, "[0.1, 0.1, 0.1]", "0.3"> {}

@doc("Decimal128 type verification")
@route("/decimal128")
@operationGroup
interface Decimal128Verify extends NumberTypesVerifyOperations<decimal, "[0.1, 0.1, 0.1]", "0.3"> {}
`;

export const sampleTest = `
import { describe, expect, it } from "vitest";
import {
  BooleanClient,
  DecimalTypeClient,
  DecimalVerifyClient,
  StringClient,
  UnknownClient,
} from "../../../generated/http/type/scalar/http-client-javascript/src/index.js";

describe("Type.Scalar", () => {
  describe("StringClient", () => {
    const client = new StringClient("http://localhost:3000");

    it("should handle a string value returned from the server", async () => {
      const response = await client.get();
      expect(response).toBe("test"); // Mock API expected value
    });

    it("should send a string value to the server", async () => {
      await client.put("test");
      // Assert successful request
    });
  });

  describe("BooleanClient", () => {
    const client = new BooleanClient("http://localhost:3000");

    it("should handle a boolean value returned from the server", async () => {
      const response = await client.get();
      expect(response).toBe(true); // Mock API expected value
    });

    it("should send a boolean value to the server", async () => {
      await client.put(true);
      // Assert successful request
    });
  });

  describe("UnknownClient", () => {
    const client = new UnknownClient("http://localhost:3000");

    it("should handle an unknown value returned from the server", async () => {
      const response = await client.get();
      expect(response).toBe("test"); // Mock API expected value
    });

    it("should send an unknown value to the server", async () => {
      await client.put("test");
      // Assert successful request
    });
  });

  describe("DecimalTypeClient", () => {
    const client = new DecimalTypeClient("http://localhost:3000");

    it("should handle a decimal value returned from the server", async () => {
      const response = await client.responseBody();
      expect(response).toBe(0.33333); // Mock API expected value
    });

    it("should send a decimal value to the server", async () => {
      await client.requestBody(0.33333);
      // Assert successful request
    });

    it("should handle a decimal request parameter", async () => {
      await client.requestParameter(0.33333);
      // Assert successful request
    });
  });

  describe("DecimalVerifyClient", () => {
    const client = new DecimalVerifyClient("http://localhost:3000");

    it("should prepare verify values for decimal", async () => {
      const response = await client.prepareVerify();
      expect(response).toEqual([0.1, 0.1, 0.1]); // Mock API expected values
    });

    it("should send a decimal value to verify", async () => {
      await client.verify(0.3);
      // Assert successful request
    });
  });
});

`;
