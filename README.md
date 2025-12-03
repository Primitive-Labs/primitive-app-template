# Primitive Labs Template App

A production-ready Vue application template built with TypeScript, Vite, and the `primitive-app` framework. This template provides a complete foundation for building modern web applications with authentication, document management, and real-time collaboration features.

## Requirements

- **GitHub access** to:
  - `Primitive-Labs/primitive-app`
  - `Primitive-Labs/js-bao`
  - `Primitive-Labs/js-bao-wss-client`

## Quick Start

### 1. Create a New Repository from Template

On [GitHub.com](https://github.com), navigate to this template repository and click the **"Use this template"** green button in the upper right. This will copy all the files to a new repository for your project.

### 2. Clone Your New Repository

```bash
git clone https://github.com/your-username/my-new-app.git
cd my-new-app
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Configure Google OAuth Client

Go to the [Google Cloud Console OAuth page](https://console.cloud.google.com/auth/clients) and configure a new OAuth client:

- **Authorized JavaScript origins**: By default, `http://localhost:5173`
- **Authorized redirect URIs**: By default, `http://localhost:5173/oauth/callback`

Make note of your **Client ID** and **Client Secret** for the next step.

### 5. Set Up js-bao App

Go to the [js-bao admin page](https://admin.primitiveapi.com/login) and create a new app:

- Add your **Google Client ID** and **Client Secret** from step 4
- Add matching origin/callback URLs to match what you configured with Google
- Make note of your **App ID** for the next step

### 6. Configure Environment

Edit `.env` and update the `VITE_APP_ID` to match the **App ID** you created in step 5.

### 7. Start Developing!

You can start the dev server with

```bash
pnpm dev
```

Visit `http://localhost:5173` to see your app running.
