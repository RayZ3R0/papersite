#!/usr/bin/env node

require("ts-node").register({
  project: "./scripts/tsconfig.json",
  transpileOnly: true,
  compilerOptions: {
    module: "commonjs",
  },
});

// Register path aliases
require("tsconfig-paths").register({
  baseUrl: ".",
  paths: {
    "@/*": ["src/*"],
  },
});

const { spawn } = require("child_process");

async function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { stdio: "inherit" });
    process.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const isVerify = args.includes("--verify");
  const isReport = args.includes("--report");

  try {
    // Run tests based on flags
    if (isVerify) {
      await runCommand("pnpm", ["run", "test:devices"]);
      await runCommand("pnpm", ["run", "test:performance"]);
      await runCommand("pnpm", ["run", "test:network"]);
    } else if (isReport) {
      // Generate test report
      const { performanceMonitor } = require("../src/utils/performance");
      const report = performanceMonitor.generateReport();
      console.log("Test Report:", report);
    } else {
      // Run all tests
      await runCommand("pnpm", ["run", "test"]);
      await runCommand("pnpm", ["run", "test:devices"]);
      await runCommand("pnpm", ["run", "test:performance"]);
      await runCommand("pnpm", ["run", "test:network"]);
      await runCommand("pnpm", ["run", "test:touch"]);
      await runCommand("pnpm", ["run", "test:offline"]);
    }
  } catch (error) {
    console.error("Tests failed:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Error running tests:", error);
  process.exit(1);
});
