# primitive-app-template

`primitive-app-template` is a minimal starter template for building new Vue 3 applications on top of the **primitive-app** library and js-bao.

This repository is intended to be used as a GitHub template or cloned directly to create new application worktrees.

## Requirements

- **Node**: 22 or newer (latest major).
- **Package manager**: `pnpm`.
- **GitHub access** to:
  - `Primitive-Labs/primitive-app`
  - `Primitive-Labs/js-bao`
  - `Primitive-Labs/js-bao-wss-client`

## Creating a new app from this template

You can either use GitHub’s “Use this template” functionality, or clone the repository directly.

### Clone via Git

```bash
git clone git@github.com:Primitive-Labs/primitive-app-template.git my-app
cd my-app
```

### Configure environment variables

Copy the example environment file and update values as needed:

```bash
cp .env.example .env
```

Edit `.env` to provide the correct settings for your js-bao backend and any other required configuration. The template’s `envConfig.ts` file shows how these values are consumed at runtime.

### Install dependencies

Install all dependencies with pnpm:

```bash
pnpm install
```

### Run the development server

Start the Vite dev server:

```bash
pnpm dev
```

Build the app for production:

```bash
pnpm build
```

Preview the production build locally:

```bash
pnpm preview
```

## Working with Git worktrees

This template includes helper scripts under `scripts/` that make it easier to run a dev server against different Git worktrees.

You can start a dev server for a specific worktree label using:

```bash
pnpm dev <worktree-label>
```

The launcher will:

1. Resolve `<worktree-label>` against the output of `git worktree list`.
2. Start the dev server in that worktree directory.
3. Set a `VITE_WORKTREE_LABEL` environment variable so the running app can display which worktree it is serving (for example, in the UI or browser tab title).

If you omit the label:

```bash
pnpm dev
```

the dev server runs in the current directory, with labeling based on the active worktree when applicable.

## Relationship to primitive-app

The template depends on the `primitive-app` library via a GitHub-based dependency:

```json
"dependencies": {
  "primitive-app": "github:Primitive-Labs/primitive-app"
}
```

When you are working inside the `primitive-app-dev` monorepo, `pnpm` there overrides this dependency to point to the local `primitive-app` source directory instead. In standalone projects created from this template, the dependency will resolve to the `primitive-app` repository on GitHub.

For full details on configuring and using the library itself, see:

- `https://github.com/Primitive-Labs/primitive-app`


