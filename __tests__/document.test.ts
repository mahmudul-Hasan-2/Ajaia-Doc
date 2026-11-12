import { describe, it, expect } from "@jest/globals";

// __tests__/document.test.ts
describe("Document Validation Tests", () => {
  it("should validate document title correctly", () => {
    const title = "My First Document";
    expect(title.trim().length).toBeGreaterThan(0);
  });

  it("should clean and format email correctly", () => {
    const email = "  User@Example.COM  ";
    const cleanEmail = email.trim().toLowerCase();
    expect(cleanEmail).toBe("user@example.com");
  });
});
