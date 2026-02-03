import type { TestGroup } from "primitive-app";

/**
 * Example test group demonstrating the primitive-app test harness.
 *
 * Tests are auto-discovered by the primitiveDevTools Vite plugin
 * when placed in the testsDir (configured in vite.config.ts as "src/tests").
 *
 * Each test receives:
 * - ctx: Contains docId for the ephemeral test document (auto-created and cleaned up)
 * - log: Optional logging function to output progress during test execution
 *
 * Tests should return a string message on success, or throw an error on failure.
 */
const exampleTests: TestGroup = {
  name: "Example Tests",
  tests: [
    {
      id: "example-hello-world",
      name: "Hello World Test",
      run: async (_ctx, log) => {
        log?.("Starting hello world test...");

        // Simulate some async work
        await new Promise((resolve) => setTimeout(resolve, 100));

        log?.("Test completed successfully!");
        return "Hello World test passed";
      },
    },
    {
      id: "example-basic-assertions",
      name: "Basic Assertions Test",
      run: async (_ctx, log) => {
        log?.("Testing basic assertions...");

        // Example: test a simple calculation
        const sum = 2 + 2;
        if (sum !== 4) {
          throw new Error(`Expected 2 + 2 = 4, got ${sum}`);
        }
        log?.("2 + 2 = 4 ✓");

        // Example: test string operations
        const greeting = "hello".toUpperCase();
        if (greeting !== "HELLO") {
          throw new Error(`Expected "HELLO", got "${greeting}"`);
        }
        log?.("String toUpperCase works ✓");

        return "All basic assertions passed";
      },
    },
  ],
};

export default exampleTests;
