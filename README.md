# Primitive Labs Template App

A production-ready Vue application template built with TypeScript, Vite, and the `primitive-app` framework. This template provides a complete foundation for building modern web applications with authentication, document management, and real-time collaboration features.

## Documentation

For guides and API reference docs, see **Primitive Docs**: https://primitive-labs.github.io/primitive-docs/

## Quick Start

### 1. Create a New Repository from Template

On [GitHub.com](https://github.com), navigate to this template repository and click the **"Use this template"** green button in the upper right. This will copy all the files to a new repository for your project.

### 2. Install pnpm

This project uses [pnpm](https://pnpm.io/) as its package manager. The easiest way to install pnpm is using [Corepack](https://nodejs.org/api/corepack.html), which is included with Node.js 16+:

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

If you prefer, you can also install pnpm using other methods described in the [pnpm installation guide](https://pnpm.io/installation).

### 3. Clone Your New Repository

```bash
git clone https://github.com/your-username/my-new-app.git
cd my-new-app
```

### 4. Install Dependencies

```bash
pnpm install
```

### 5. Create a Primitive App

Go to the [Primitive Admin console](https://admin.primitiveapi.com/login) and create a new app. Make note of your **App ID** for the next step.

### 6. Configure Environment

Edit `.env` and update the `VITE_APP_ID` to match the **App ID** you created in step 5.

### 7. Start Developing!

You can start the dev server with

```bash
pnpm dev
```

Visit `http://localhost:5173` to see your app running.

## Setting Up Google Sign In

Google OAuth is optional. If you want to enable Google as a sign-in option for your app, follow these steps:

### 1. Configure Google OAuth Client

Go to the [Google Cloud Console OAuth page](https://console.cloud.google.com/auth/clients) and configure a new OAuth client:

- **Authorized JavaScript origins**: By default, `http://localhost:5173` (add your production domain as well)
- **Authorized redirect URIs**: By default, `http://localhost:5173/oauth/callback` (add your production callback URL as well)

Make note of your **Client ID** and **Client Secret**.

### 2. Enable Google OAuth in Primitive Admin

Go to the [Primitive Admin console](https://admin.primitiveapi.com/login) and navigate to your app's settings:

1. Open the **Google OAuth** section
2. Enable Google OAuth as a sign-in method
3. Add your **Google Client ID** and **Client Secret** from step 1
4. Add matching origin/callback URLs to match what you configured with Google

## Deploying to Production

### 1. Prerequisites

- **Cloudflare account** with access to deploy Workers.
- **Wrangler CLI** installed in your project. Follow the official [Wrangler installation guide](https://developers.cloudflare.com/workers/wrangler/install-and-update/) and install it as a dev dependency using pnpm:

```bash
pnpm add -D wrangler@latest
```

### 2. Configure Production Environment

Edit `wrangler.toml` with your production settings. This file is the **source of truth** for production configuration:

```toml
[env.production]
name = "your-app-name-prod"

[[env.production.routes]]
pattern = "your-domain.com"
custom_domain = true

[env.production.vars]
APP_ID = "YOUR_PRODUCTION_APP_ID"
```

The `APP_ID` should match the App ID you created in the Primitive Admin console (this can be the same App ID you use for development, or a different one created specifically for production).

### 3. Deploy

The `deploy` script handles everything: it syncs configuration from `wrangler.toml` to `.env.production`, builds the project, and deploys to Cloudflare Workers:

```bash
pnpm deploy --env production
```

Any additional options are passed through to `wrangler deploy`. For example:

```bash
pnpm deploy --env production --dry-run
```
