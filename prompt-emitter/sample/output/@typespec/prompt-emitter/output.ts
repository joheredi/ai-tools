import { describe, it, expect } from "vitest";
import { TodoClient } from "todo-client";

describe("TodoClient update operation", () => {
  const client = new TodoClient("https://api.example.com");

  it("should successfully update a todo item", async () => {
    const todoId = "123-abcd"; // Example ID of an existing todo item
    const patchData = {
      title: "Update Test Item Title",
      assignedTo: "john.doe@example.com",
      description: "Updated description of the test item",
      status: "InProgress",
    };

    const response = await client.todoItems.update(
      "application/merge-patch+json",
      todoId,
      patchData
    );

    expect(response).toBeDefined();
    expect(response.title).toBe(patchData.title);
    expect(response.assignedTo).toBe(patchData.assignedTo);
    expect(response.description).toBe(patchData.description);
    expect(response.status).toBe(patchData.status);
  });

  it("should handle not found error when updating a non-existent todo item", async () => {
    const invalidTodoId = "does-not-exist"; // ID that does not exist
    const patchData = {
      title: "Non-existent Item",
      assignedTo: "unknown@example.com",
      description: "Trying to update non-existent item",
      status: "NotStarted",
    };

    try {
      await client.todoItems.update(
        "application/merge-patch+json",
        invalidTodoId,
        patchData
      );
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe("not-found");
    }
  });

  it("should handle invalid patch data error", async () => {
    const todoId = "123-abcd"; // Example ID of an existing todo item
    const invalidPatchData = {
      title: null, // Invalid title
      assignedTo: null, // Invalid assignedTo
      description: null, // Invalid description
      status: "InvalidStatus", // Invalid enum value
    };

    try {
      await client.todoItems.update(
        "application/merge-patch+json",
        todoId,
        invalidPatchData
      );
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.statusCode).toBe(422);
    }
  });
});