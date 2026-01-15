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

This project deploys to Cloudflare Workers. The configuration pattern is consistent with development: edit `.env` files for app settings.

### 1. Prerequisites

- **Cloudflare account** with access to deploy Workers
- **Wrangler CLI** - already included as a dev dependency

### 2. Configure wrangler.toml

Edit `wrangler.toml` to set your worker name:

```toml
name = "my-app"

[env.production]
name = "my-app-prod"
```

By default, your app will be deployed to a `*.workers.dev` URL. To use a custom domain, uncomment and edit the routes section:

```toml
[[env.production.routes]]
pattern = "your-domain.com"
custom_domain = true
```

### 3. Configure .env.production

Edit `.env.production` with your production settings:

```bash
# Your Primitive App ID (can be the same as development or a separate production app)
VITE_APP_ID=your_production_app_id

# OAuth redirect URI for your production domain
VITE_OAUTH_REDIRECT_URI=https://my-app-prod.your-subdomain.workers.dev/oauth/callback
```

### 4. Deploy

```bash
pnpm deploy --env production
```

The deploy script reads `.env.production`, builds the project, and deploys to Cloudflare Workers.

## Multiple Environments

You can configure additional environments (e.g., test, staging) by adding sections to `wrangler.toml` and creating corresponding `.env` files.

### Setting up a test environment

1. **Add to wrangler.toml** (already included in template):

```toml
[env.test]
name = "my-app-test"
```

2. **Create .env.test** (already included in template):

```bash
VITE_APP_ID=your_test_app_id
VITE_OAUTH_REDIRECT_URI=https://my-app-test.your-subdomain.workers.dev/oauth/callback
VITE_LOG_LEVEL="debug"
```

3. **Deploy to test**:

```bash
pnpm deploy --env test
```

### Environment summary

| Environment | Config File | Deploy Command | Worker Name |
|-------------|-------------|----------------|-------------|
| Development | `.env` | `pnpm dev` | (local) |
| Test | `.env.test` | `pnpm deploy --env test` | `my-app-test` |
| Production | `.env.production` | `pnpm deploy --env production` | `my-app-prod` |
