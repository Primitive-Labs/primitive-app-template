# Primitive Labs Template App

A production-ready Vue application template built with TypeScript, Vite, and the `primitive-app` framework. This template provides a complete foundation for building modern web applications with authentication, document management, and real-time collaboration features.

## Documentation

For guides and API reference docs, see **Primitive Docs**: https://primitive-labs.github.io/primitive-docs/

## Requirements

- **GitHub access** to:
  - `Primitive-Labs/primitive-app`
  - `Primitive-Labs/js-bao`
  - `Primitive-Labs/js-bao-wss-client`

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

### 5. Configure Google OAuth Client

Go to the [Google Cloud Console OAuth page](https://console.cloud.google.com/auth/clients) and configure a new OAuth client:

- **Authorized JavaScript origins**: By default, `http://localhost:5173`
- **Authorized redirect URIs**: By default, `http://localhost:5173/oauth/callback`

Make note of your **Client ID** and **Client Secret** for the next step.

### 6. Set Up js-bao App

Go to the [js-bao admin page](https://admin.primitiveapi.com/login) and create a new app:

- Add your **Google Client ID** and **Client Secret** from step 5
- Add matching origin/callback URLs to match what you configured with Google
- Make note of your **App ID** for the next step

### 7. Configure Environment

Edit `.env` and update the `VITE_APP_ID` to match the **App ID** you created in step 6.

### 8. Start Developing!

You can start the dev server with

```bash
pnpm dev
```

Visit `http://localhost:5173` to see your app running.

## Deploying to Production

### 1. Prerequisites

- **Cloudflare account** with access to deploy Workers.
- **Wrangler CLI** installed in your project. Follow the official [Wrangler installation guide](https://developers.cloudflare.com/workers/wrangler/install-and-update/) and install it as a dev dependency using pnpm:

```bash
pnpm add -D wrangler@latest
```

### 2. Configure Production Environment

Update `.env.production` with your production `VITE_APP_ID`. This can be the same App ID you use for development or a different one created specifically for production:

```bash
VITE_APP_ID=YOUR_PRODUCTION_APP_ID
```

Then update `wrangler.toml` to ensure the production environment uses the same App ID:

```toml
[env.production.vars]
APP_ID = "YOUR_PRODUCTION_APP_ID"
```

Make sure the value of `APP_ID` in `wrangler.toml` matches `VITE_APP_ID` in `.env.production` and the App ID configured in the js-bao admin UI.

### 3. Build for Production

Create an optimized production build:

```bash
pnpm build
```

This will generate the static assets for your app in the `dist` directory, which Wrangler will deploy as your Worker’s assets.

### 4. Deploy with Wrangler

Once your production environment is configured and the app is built, deploy to Cloudflare Workers using the `production` environment defined in `wrangler.toml`:

```bash
npx wrangler deploy --env production
```

Wrangler will upload your Worker script, bind the `dist` assets, and configure any routes or custom domains specified under `[env.production]` in `wrangler.toml`.
