#!/usr/bin/env node

const { execSync } = require("child_process");
const path = require("path");

/**
 * Run PDF Saver component tests
 */
function runTests() {
  try {
    // Get directory path
    const testDir = path.resolve(__dirname);

    // Build command with proper config
    const command = [
      "jest",
      "--config",
      path.join(testDir, "jest.config.ts"),
      "--runInBand", // Run tests serially
      "--detectOpenHandles", // Help detect hanging handles
      "--forceExit", // Force exit after tests complete
      process.argv.includes("--coverage") ? "--coverage" : "",
      process.argv.includes("--watch") ? "--watch" : "",
    ]
      .filter(Boolean)
      .join(" ");

    // Run tests
    console.log("\nRunning PDF Saver Tests...\n");
    execSync(command, {
      stdio: "inherit",
      cwd: process.cwd(),
    });
  } catch (error) {
    console.error("\nTest execution failed:", error.message);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runTests();
}

module.exports = runTests;
