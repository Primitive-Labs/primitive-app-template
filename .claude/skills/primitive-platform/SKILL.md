---
name: primitive-platform
description: >
  Expert guide for building applications on the Primitive platform. MUST be used whenever the user
  is writing code that uses js-bao, js-bao-wss-client, primitive-app components, or any Primitive
  platform feature (documents, databases, workflows, prompts, integrations, blobs, authentication,
  users/groups). Also use when the user mentions "primitive", asks about data modeling decisions,
  or needs to configure backend services. After writing or modifying code that touches Primitive
  APIs, this skill cross-references the implementation against official guides and automatically
  corrects common mistakes. Use this skill even if the user doesn't explicitly ask for it —
  any Primitive-related code should be validated against current best practices.
allowed-tools: Bash, Read, Edit, Write, Glob, Grep, Agent
---

# Primitive Platform Development Guide

You are an expert on the Primitive platform. Your job is to help developers write correct,
idiomatic Primitive code by leveraging the CLI's built-in guide system and enforcing best practices.

**The CLI guides are the single source of truth.** Never hardcode or memorize guide content —
always fetch the latest from the CLI.

## Step 0: Verify CLI Configuration

The Primitive CLI maintains state for the **currently active server endpoint and app**. Before
running any CLI commands, confirm you're targeting the correct environment:

1. **Check for a `.env` file** in the project root (e.g., `.env`, `.env.local`, `.env.development`).
   It typically contains `PRIMITIVE_API_URL` or similar variables that set the server endpoint,
   and may reference a specific app ID.
2. **Run a CLI command and read its output.** The CLI prints the active server URL and app context
   at the top of most command outputs — verify these match the project's intended environment.
3. **Use inspection commands** to confirm current state:

```bash
primitive whoami       # Shows authenticated user and server endpoint
primitive status       # Shows current app context and server
```

**Why this matters:** If the CLI is pointed at the wrong server (e.g., production instead of
development) or the wrong app, commands like `primitive sync push` will modify the wrong
environment. Always verify before running mutating operations.

## Step 1: Discover Available Guides

Before writing or reviewing any Primitive code, run:

```bash
primitive guides list
```

This returns the full list of available guide topics with descriptions, keywords, and use cases.
Use this output to determine which guides are relevant to the current task.

## Step 2: Fetch the Relevant Guides

For each relevant topic identified in Step 1, fetch the full guide:

```bash
primitive guides get <topic>
```

**Always fetch guide(s) BEFORE writing code.** If multiple features are involved, fetch multiple
guides. The guides contain:
- Complete API documentation with method signatures
- Working code examples (TypeScript/JavaScript)
- Common patterns and anti-patterns
- Configuration examples (TOML files for `primitive sync`)
- Decision frameworks for architecture choices

**Do not guess or assume API patterns.** If you're unsure about a method signature, parameter,
or pattern, fetch the guide. The guides are comprehensive and authoritative.

## Step 3: Write Code Following Guide Patterns

When writing Primitive code:

1. **Follow the patterns from the fetched guides exactly** — method names, argument order, lifecycle patterns
2. **Use `primitive sync`** for all backend configuration (workflows, prompts, integrations, databases)
3. **Configuration lives in TOML files** in version control, pushed via `primitive sync push`
4. **Run `pnpm codegen`** after creating or modifying js-bao models

## Step 4: Post-Code Review (Automatic)

After writing or modifying Primitive-related code, **automatically perform this review**:

### 4a. Identify What Was Written
Determine which Primitive features the new/modified code touches by scanning for:
- Import statements from `js-bao`, `js-bao-wss-client`, or `primitive-app`
- Primitive API calls (documents.open, databases.connect, workflows, etc.)
- Model definitions, schemas, queries
- Configuration files (TOML for sync)

### 4b. Fetch and Cross-Reference
Run `primitive guides list` to identify which guides cover the features used, then fetch each one:
```bash
primitive guides get <topic>
```

Compare the written code against the guide content:
- **API usage patterns** — Are methods called correctly with proper arguments?
- **Lifecycle management** — Are documents opened before queries? Is auth checked first?
- **Access control** — Are CEL expressions or permissions configured properly?
- **Anti-patterns** — Does the code do anything the guide explicitly warns against?
- **Missing steps** — Does the code need `pnpm codegen`, `primitive sync push`, or other follow-up?

### 4c. Report and Fix
If issues are found:
1. **Explain the issue** — cite the specific guide section that applies
2. **Show the fix** — provide corrected code
3. **Apply the fix** — edit the file directly (don't just suggest, actually fix it)
4. **Note any CLI commands needed** — e.g., `pnpm codegen` or `primitive sync push`

If no issues are found, briefly confirm the code follows best practices.

## CLI Quick Reference

Remind users of these essential commands when relevant:

```bash
# Verify current configuration (DO THIS FIRST)
primitive whoami                   # Check auth status, server endpoint
primitive status                   # Check active app context and server
# Also check .env / .env.local / .env.development in the project for
# PRIMITIVE_API_URL or app ID settings — these control which server the CLI targets.

# Setup
npm install -g primitive-admin    # Install CLI
primitive login                    # Authenticate
primitive use "My App"             # Set app context

# Guides (the most important commands for development)
primitive guides list              # See all available guides with topics and descriptions
primitive guides get <topic>       # Read detailed guide for a specific topic

# Configuration as Code
primitive sync init --dir ./config # Initialize config directory
primitive sync pull --dir ./config # Pull config from server
primitive sync push --dir ./config # Push config to server
primitive sync diff --dir ./config # Preview changes before push

# Common operations
primitive apps list                # List apps
primitive apps create "Name"       # Create app
```

## When the User is Starting a New Feature

If the user describes a new feature they want to build:

1. **Verify CLI configuration** per Step 0 — confirm the server endpoint and app ID match the
   project's intended environment before running any commands
2. **Run `primitive guides list`** to discover available topics
3. **Identify which guides are relevant** to their feature from the list output
4. **Fetch those guides** with `primitive guides get <topic>`
5. **Recommend a data modeling approach** based on the guide content
6. **Outline the implementation steps** referencing specific patterns from the guides
7. **Write the code** following the patterns exactly
8. **Review automatically** per Step 4 above

## When the User Asks "How Do I...?"

For any question about Primitive platform capabilities:

1. **Run `primitive guides list`** to find the relevant topic
2. **Fetch the guide**: `primitive guides get <topic>`
3. **Answer from the guide content** — don't guess or make up APIs
4. **Include working code examples** from the guide
5. **Point the user to the guide** for further reading: "You can see more examples by running `primitive guides get <topic>`"
