# Primitive Template App

A production-ready Vue application template built with TypeScript, Vite, and the `primitive-app` framework.

## Documentation

For guides and API reference docs, see **Primitive Docs**: https://primitive-labs.github.io/primitive-docs/

## Quick Start

### 1. Create Your App

Run the following command, replacing `my-app` with your desired app name:

```bash
npx create-primitive-app my-app
```

This will:
- Prompt you to sign in to your Primitive account (if not already authenticated)
- Create a new app on the Primitive servers
- Download and configure the template
- Install dependencies (prompting to install pnpm if needed)

### 2. Start Developing!

```bash
cd my-app
pnpm dev
```

Visit `http://localhost:5173` to see your app running.

## Optional: Set Up Git Repository

After creating your app, you may want to track it in Git and push to a remote repository:

### Initialize Git (if not already done)

```bash
cd my-app
git init
git add .
git commit -m "Initial commit from primitive-app template"
```

### Push to GitHub

1. Create a new repository on [GitHub](https://github.com/new) (don't initialize with README, .gitignore, or license)

2. Add the remote and push:

```bash
git remote add origin https://github.com/your-username/my-app.git
git branch -M main
git push -u origin main
```

## Setting Up Google Sign In

Google OAuth is optional. If you want to enable Google as a sign-in option for your app, follow these steps:

### 1. Configure Google OAuth Client

Go to the [Google Cloud Console OAuth page](https://console.cloud.google.com/auth/clients) and configure a new OAuth client:

- **Authorized JavaScript origins**: By default, `http://localhost:5173` (add your production domain as well)
- **Authorized redirect URIs**: By default, `http://localhost:5173/oauth/callback` (add your production callback URL as well)

Make note of your **Client ID** and **Client Secret**.

### 2. Enable Google OAuth in Primitive Admin

**Option A: Using the CLI**

```bash
primitive apps oauth set-google --client-id YOUR_CLIENT_ID --client-secret YOUR_CLIENT_SECRET
```

Then add your allowed origins and callback URLs:

```bash
primitive apps origins add http://localhost:5173
primitive apps origins add https://your-production-domain.com
```

**Option B: Using the Dashboard**

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

### 4. Configure Production URL in Primitive Admin

Before deploying, make sure your app is configured with the production deployment URL.

**Option A: Using the CLI**

```bash
primitive apps origins add https://my-app-prod.your-subdomain.workers.dev
```

Or if using a custom domain:

```bash
primitive apps origins add https://your-domain.com
```

**Option B: Using the Dashboard**

Go to the [Primitive Admin console](https://admin.primitiveapi.com/login) and navigate to your app's settings:

1. Add your production URL (e.g., `https://my-app-prod.your-subdomain.workers.dev` or your custom domain) to the allowed origins
2. If using Google OAuth, also update the OAuth callback URL to match your production domain

### 5. Deploy

```bash
pnpm cf-deploy production
```

The deploy script reads `.env.production`, builds the project, and deploys to Cloudflare Workers.

To pass additional flags to wrangler, use `--` followed by the flags:

```bash
pnpm cf-deploy production -- --dry-run
```

## Adding More Environments

You can add additional environments (e.g., test, staging) by:

1. **Adding a section to wrangler.toml:**

```toml
[env.test]
name = "my-app-test"

[env.test.vars]
REFRESH_PROXY_COOKIE_MAX_AGE = "604800"
REFRESH_PROXY_COOKIE_PATH = "/proxy/"
```

2. **Creating a corresponding .env file** (e.g., `.env.test`)

3. **Deploying:**

```bash
pnpm cf-deploy test
```

The deploy script reads from `.env.{environment}` and uses `[env.{environment}]` from wrangler.toml.
