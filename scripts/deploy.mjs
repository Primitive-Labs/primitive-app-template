#!/usr/bin/env node
/**
 * Deploy script that reads configuration from .env.production,
 * builds the project, and deploys to Cloudflare Workers.
 *
 * Usage: pnpm deploy [--env <environment>] [other wrangler options...]
 *
 * This script:
 * 1. Reads configuration from .env.production (the source of truth)
 * 2. Runs the production build (Vite reads .env.production automatically)
 * 3. Deploys using wrangler, passing APP_ID and API_ORIGIN as --var flags
 */

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");

/**
 * Parse a .env file into an object
 */
function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const vars = {};

  for (const line of content.split("\n")) {
    const trimmed = line.trim();

    // Skip comments and empty lines
    if (trimmed.startsWith("#") || trimmed === "") continue;

    const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match) {
      let value = match[2];

      // Remove surrounding quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      vars[match[1]] = value;
    }
  }

  return vars;
}

/**
 * Mapping from .env.production vars to wrangler --var names
 * These are the vars the worker needs at runtime
 */
const ENV_TO_WRANGLER_VARS = {
  VITE_APP_ID: "APP_ID",
  VITE_API_URL: "API_ORIGIN",
};

/**
 * Run a command and return a promise
 */
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\n> ${command} ${args.join(" ")}\n`);
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: true,
      cwd: ROOT_DIR,
      ...options,
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on("error", reject);
  });
}

async function main() {
  const args = process.argv.slice(2);

  // Read .env.production
  const envFilePath = path.join(ROOT_DIR, ".env.production");
  if (!fs.existsSync(envFilePath)) {
    console.error("[deploy] Error: .env.production not found");
    console.error(
      "[deploy] Please create .env.production with your production configuration"
    );
    process.exit(1);
  }

  const envVars = parseEnvFile(envFilePath);

  console.log("[deploy] Configuration from .env.production:");
  for (const [key, value] of Object.entries(envVars)) {
    // Mask sensitive values and truncate long ones
    const displayValue =
      key.includes("SECRET") || key.includes("KEY")
        ? "***"
        : value.length > 40
          ? value.substring(0, 40) + "..."
          : value;
    console.log(`  ${key}=${displayValue}`);
  }

  // Validate required vars
  if (!envVars.VITE_APP_ID || envVars.VITE_APP_ID === "YOUR_APP_ID_GOES_HERE") {
    console.error("\n[deploy] Error: VITE_APP_ID is not set in .env.production");
    console.error(
      "[deploy] Please set your Primitive App ID from the admin console"
    );
    process.exit(1);
  }

  // Run build (Vite automatically reads .env.production for production builds)
  console.log("\n[deploy] Building for production...");
  try {
    await runCommand("pnpm", ["build"]);
  } catch (error) {
    console.error("[deploy] Build failed:", error.message);
    process.exit(1);
  }

  // Build wrangler --var flags from .env.production
  const varFlags = [];
  for (const [envKey, wranglerKey] of Object.entries(ENV_TO_WRANGLER_VARS)) {
    if (envVars[envKey]) {
      varFlags.push("--var", `${wranglerKey}:${envVars[envKey]}`);
    }
  }

  // Deploy with wrangler
  console.log("\n[deploy] Deploying to Cloudflare Workers...");
  console.log("[deploy] Passing vars to worker:", Object.keys(ENV_TO_WRANGLER_VARS).map(k => ENV_TO_WRANGLER_VARS[k]).join(", "));

  try {
    await runCommand("pnpm", [
      "dlx",
      "wrangler",
      "deploy",
      ...varFlags,
      ...args,
    ]);
  } catch (error) {
    console.error("[deploy] Deploy failed:", error.message);
    process.exit(1);
  }

  console.log("\n[deploy] Deployment complete!");
}

main().catch((error) => {
  console.error("[deploy] Unexpected error:", error);
  process.exit(1);
});
