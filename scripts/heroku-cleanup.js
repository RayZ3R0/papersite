const fs = require("fs");
const path = require("path");

console.log("Starting Heroku build cleanup process...");

// Primary targets - largest directories first
const primaryTargets = [
  ".next/cache/webpack/edge-server-production", // 2.2 GiB
  ".next/cache/webpack/client-production", // 373.4 MiB
  ".next/cache/webpack/edge-server-development", // 216.6 MiB
  ".next/cache/webpack/server-production", // 89.9 MiB
  ".next/cache/webpack/client-development", // 87.5 MiB
  ".next/cache/webpack/server-development", // 14.7 MiB
  ".next/cache/webpack/client-development-fallback", // 9.1 MiB
];

// Secondary targets - other large files and directories
const secondaryTargets = [
  ".next/trace",
  ".next/server/chunks",
  ".next/static/development",
  "node_modules/.cache",
];

// Function to safely remove a directory or file
function safeRemove(targetPath) {
  const fullPath = path.join(__dirname, "..", targetPath);

  try {
    if (fs.existsSync(fullPath)) {
      console.log(`Removing: ${targetPath}`);
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`Successfully removed: ${targetPath}`);
      return true;
    } else {
      console.log(`Path not found, skipping: ${targetPath}`);
      return false;
    }
  } catch (err) {
    console.error(`Error removing ${targetPath}:`, err);
    return false;
  }
}

// Remove primary targets first (these are the largest)
let removedCount = 0;
for (const target of primaryTargets) {
  if (safeRemove(target)) {
    removedCount++;
  }
}

// If we're still having size issues, remove secondary targets
for (const target of secondaryTargets) {
  if (safeRemove(target)) {
    removedCount++;
  }
}

console.log(`Build cleanup complete. Removed ${removedCount} directories.`);
