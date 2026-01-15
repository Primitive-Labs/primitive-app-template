#!/usr/bin/env node
/**
 * Deploy script that synchronizes configuration from wrangler.toml to .env files,
 * builds the project, and deploys to Cloudflare Workers.
 *
 * Usage: pnpm deploy [--env <environment>] [other wrangler options...]
 *
 * This script:
 * 1. Reads configuration from wrangler.toml for the specified environment
 * 2. Generates/updates .env.production with VITE_* variables
 * 3. Runs the production build
 * 4. Deploys using wrangler with all passed options
 */

import { execSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");

/**
 * Simple TOML parser for wrangler.toml structure.
 * Handles the specific patterns we need: sections, env sections, and vars.
 */
function parseWranglerToml(content) {
  const result = {
    vars: {},
    envs: {},
  };

  let currentSection = null;
  let currentEnv = null;
  let currentSubSection = null;

  const lines = content.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip comments and empty lines
    if (trimmed.startsWith("#") || trimmed === "") continue;

    // Check for section headers
    const sectionMatch = trimmed.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) {
      const sectionPath = sectionMatch[1];

      // Check if it's an env-specific section
      const envMatch = sectionPath.match(/^env\.([^.]+)(?:\.(.+))?$/);
      if (envMatch) {
        currentEnv = envMatch[1];
        currentSubSection = envMatch[2] || null;

        if (!result.envs[currentEnv]) {
          result.envs[currentEnv] = { vars: {} };
        }
      } else {
        currentEnv = null;
        currentSubSection = sectionPath;
      }
      continue;
    }

    // Check for double-bracket sections (arrays like [[env.production.routes]])
    const arraySectionMatch = trimmed.match(/^\[\[([^\]]+)\]\]$/);
    if (arraySectionMatch) {
      const sectionPath = arraySectionMatch[1];
      const envMatch = sectionPath.match(/^env\.([^.]+)/);
      if (envMatch) {
        currentEnv = envMatch[1];
        if (!result.envs[currentEnv]) {
          result.envs[currentEnv] = { vars: {} };
        }
      }
      continue;
    }

    // Parse key-value pairs
    const kvMatch = trimmed.match(/^([^=]+?)\s*=\s*(.+)$/);
    if (kvMatch) {
      const key = kvMatch[1].trim();
      let value = kvMatch[2].trim();

      // Remove quotes from string values
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      // Store in the appropriate location
      if (currentEnv && currentSubSection === "vars") {
        result.envs[currentEnv].vars[key] = value;
      } else if (currentEnv && !currentSubSection) {
        // Top-level env property (like name)
        result.envs[currentEnv][key] = value;
      } else if (currentSubSection === "vars" && !currentEnv) {
        // Global vars section
        result.vars[key] = value;
      } else if (!currentSubSection && !currentEnv) {
        // Top-level property
        result[key] = value;
      }
    }
  }

  return result;
}

/**
 * Maps wrangler.toml variable names to VITE_* environment variable names.
 */
const VAR_MAPPINGS = {
  APP_ID: "VITE_APP_ID",
  API_ORIGIN: "VITE_API_URL",
};

/**
 * Default values for VITE environment variables that aren't derived from wrangler.toml
 */
const ENV_DEFAULTS = {
  VITE_API_URL: "https://primitiveapi.com",
  VITE_WS_URL: "wss://primitiveapi.com",
  VITE_ENABLE_AUTH_PROXY: '"true"',
  VITE_LOG_LEVEL: '"warn"',
};

/**
 * Generates .env.production content from wrangler config and existing .env.production
 */
function generateEnvContent(wranglerVars, existingEnvPath) {
  // Read existing .env.production if it exists to preserve comments and order
  let existingContent = "";
  let existingVars = {};

  if (fs.existsSync(existingEnvPath)) {
    existingContent = fs.readFileSync(existingEnvPath, "utf-8");
    // Parse existing vars
    for (const line of existingContent.split("\n")) {
      const match = line.match(/^([A-Z_]+)=(.*)$/);
      if (match) {
        existingVars[match[1]] = match[2];
      }
    }
  }

  // Build the new vars object, starting with defaults
  const newVars = { ...ENV_DEFAULTS, ...existingVars };

  // Apply mappings from wrangler.toml
  for (const [wranglerKey, viteKey] of Object.entries(VAR_MAPPINGS)) {
    if (wranglerVars[wranglerKey]) {
      newVars[viteKey] = wranglerVars[wranglerKey];
    }
  }

  // Generate the .env.production content
  const lines = [
    "# Auto-generated from wrangler.toml by deploy script",
    "# Edit wrangler.toml to change APP_ID and API_ORIGIN, then run pnpm deploy",
    "",
    "# Your Primitive APP ID (synced from wrangler.toml)",
    `VITE_APP_ID=${newVars.VITE_APP_ID || "YOUR_APP_ID_GOES_HERE"}`,
    "",
    "# Primitive API servers",
    `VITE_API_URL=${newVars.VITE_API_URL}`,
    `VITE_WS_URL=${newVars.VITE_WS_URL}`,
    "",
    "# OAuth Redirect URI - update this to match your production domain",
    `VITE_OAUTH_REDIRECT_URI=${newVars.VITE_OAUTH_REDIRECT_URI || "https://[YOUR PRODUCTION URL]/oauth/callback"}`,
    "",
    "# Auth proxy settings for production",
    `VITE_ENABLE_AUTH_PROXY=${newVars.VITE_ENABLE_AUTH_PROXY}`,
    "",
    "# Log level for production",
    `VITE_LOG_LEVEL=${newVars.VITE_LOG_LEVEL}`,
  ];

  return lines.join("\n") + "\n";
}

/**
 * Parse command line arguments to extract the environment name
 */
function parseArgs(args) {
  let env = "production"; // default
  const wranglerArgs = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--env" && args[i + 1]) {
      env = args[i + 1];
      wranglerArgs.push(args[i], args[i + 1]);
      i++; // skip the value
    } else {
      wranglerArgs.push(args[i]);
    }
  }

  return { env, wranglerArgs };
}

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
  const { env, wranglerArgs } = parseArgs(args);

  console.log(`[deploy] Deploying to environment: ${env}`);

  // Read and parse wrangler.toml
  const wranglerPath = path.join(ROOT_DIR, "wrangler.toml");
  if (!fs.existsSync(wranglerPath)) {
    console.error("[deploy] Error: wrangler.toml not found");
    process.exit(1);
  }

  const wranglerContent = fs.readFileSync(wranglerPath, "utf-8");
  const wranglerConfig = parseWranglerToml(wranglerContent);

  // Get vars for the specified environment
  const envConfig = wranglerConfig.envs[env];
  if (!envConfig) {
    console.warn(
      `[deploy] Warning: No configuration found for environment "${env}" in wrangler.toml`
    );
    console.warn("[deploy] Using global vars only");
  }

  const vars = {
    ...wranglerConfig.vars,
    ...(envConfig?.vars || {}),
  };

  console.log("[deploy] Configuration from wrangler.toml:");
  for (const [key, value] of Object.entries(vars)) {
    // Mask sensitive values
    const displayValue =
      key.includes("SECRET") || key.includes("KEY")
        ? "***"
        : value.substring(0, 30) + (value.length > 30 ? "..." : "");
    console.log(`  ${key}=${displayValue}`);
  }

  // Generate .env.production
  const envFilePath = path.join(ROOT_DIR, ".env.production");
  const envContent = generateEnvContent(vars, envFilePath);

  console.log(`\n[deploy] Writing ${envFilePath}`);
  fs.writeFileSync(envFilePath, envContent);

  // Run build
  console.log("\n[deploy] Building for production...");
  try {
    await runCommand("pnpm", ["build"]);
  } catch (error) {
    console.error("[deploy] Build failed:", error.message);
    process.exit(1);
  }

  // Deploy with wrangler
  console.log("\n[deploy] Deploying to Cloudflare Workers...");
  try {
    await runCommand("pnpm", ["dlx", "wrangler", "deploy", ...wranglerArgs]);
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
