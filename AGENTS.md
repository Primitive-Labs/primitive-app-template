## Project Stack

- This project uses vite, typescript, vue, vue-router, tailwind, shadcn-vue, primitive-app and js-bao. Do not deviate from this stack. If there are additional foundational components required, ask the user before installing them.

## Project Organization

- `/src/assets`: Static images/assets
- `/src/components`: Vue Components. Organized by area.
- `/src/components/ui`: Installation location for base shadcn-vue components.
- `/src/config`: Config options for primitive app
- `/src/lib`: Shared business logic, not Vue specific -- pure typescript code only.
- `/src/composables`: Vue composables (useJsBaoDataLoader, useTheme).
- `/src/layouts`: Vue layout components. Used directly by the router to render different layouts for different types of pages based on route
- `/src/models`: JS-bao model file definitions.
- `/src/pages`: Top level Vue components that map to a route.
- `/src/router`: Vue-router configuration
- `/src/stores`: Pinia stores (userStore, jsBaoDocumentsStore, singleDocumentStore, multiDocumentStore).
- `/src/tests`: Tests registered with the primitive-app test harness.

## General Coding Guidelines

- ALWAYS Fail early. Don't mask missing required inputs with inline fallbacks or try to recover from errors caused by improper usage or bad input. Expose the errors directly.
- ALWAYS use strong typing and invariants over scattered defensive code.
- ALWAYS delete old code rather than comment it out or deprecate it. If removing code will be a breaking change, CONFIRM with the user how to handle it. Don't assume.
- ALWAYS run pnpm codegen and pnpm type-check after making changes and fix any errors.
- NEVER modify worker.js. This is a library provided file and should not be edited.

## Using the Primitive Platform

- ALWAYS refer to the Primitive CLI guides before writing code that uses js-bao, js-bao-wss-client, or primitive-app. Run `primitive guides list` to see available topics and `primitive guides get <topic>` to retrieve a specific guide.
- If using Claude Code, the `primitive-platform` skill automates this workflow — it fetches the relevant guides and validates your code against them.
