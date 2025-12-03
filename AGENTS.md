## Project Stack

- This project uses vite, typescript, vue, vue-router, tailwind, shadcn-vue, and primitive-app and js-bao for data persistence. Do not deviate from this stack. If there are additional foundational components required, ask the user before installing them.

## Project Organization

- `/src/assets`: Static images/assets
- `/src/components`: Vue Components. Organized by area.
- `/src/components/ui`: Installation location for base shadcn-vue components.
- `/src/config`: Config options for primitive app
- `/src/lib`: Shared business logic, not Vue specific -- pure typescript code only.
- `src/composables`: Vue composables.
- `src/layouts`: Vue layout components. Used directly by the router to render different layouts for different types of pages based on route
- `src/models`: JS-bao model file definitions.
- `src/pages`: Top level Vue components that map to a route.
- `src/router`: Vue-router configuration
- `src/tests`: Tests registered with the primitive-app test harness.

## General Coding Guidelines

- Fail early. Prefer failing early and loudly rather than masking errors that will cause problems downstream.
- Prefer strong typing and invariants over scattered defensive code.
- Don't mask missing required inputs with inline fallbacks.
- Try to keep components and source files under 500 LOC. Break into components if files get large.
- Before completing a task review your work against DRY principles. Scan for code that might be duplicative. Refactor if there is a way to simplify or re-use code.
- Prefer to delete old code rather than comment it out or deprecate it. If removing code will be a breaking change, ask the user how to handle it. Don't assume.
- Dev server is already running on http://localhost:5173. NEVER launch it yourself

## UI/UX Guidelines

- Always try to use shadcn-vue components without modification if possible.
- Install shadcn-vue components if they are not available in the current project, using the command line installation tool.
- If necessary, compose these components into new ones, but don't just start from scratch.
- ALWAYS use TailwindCSS classes rather than manual CSS
- DO NOT hard code colors, use Tailwind's color system
- Avoid writing business logic in Vue components. Vue components should be focused on rendering and interaction. Move data processing and logic to a related lib file instead.
- Primitive-app provides PrimitiveSkeletonGate to show skeletons while data is loading. Use by default where UI depends on data, waiting for the jsBaoDataLoader to return initialDataLoaded.
- In general make customizations at the layout level, not at the App.vue. You can compose a provided primitive-app layout to customize it, or create a new one.
- ONLY add meaningful comments that explain why something is done, not what it does

## Vue Code Guidelines

- ALWAYS use Composition API + <script setup>, NEVER use Options API
- ALWAYS Keep types alongside your code, use TypeScript for type safety, prefer interface over type for defining types
- ALWAYS use named functions when declaring methods, use arrow functions only for callbacks
- ALWAYS prefer named exports over default exports
- AVOID watch/watchEffect if you can call code directly. For example, on a click, call a method to do work rather than set a variable that's watched elsewhere.
- ALWAYS place Vue lifecycle methods (e.g. onMounted) as the first functions in the component.

## Data Storage and Loading

- This project uses js-bao for data persistence, and the js-bao-wss-client for interacting with the server. Never use alternatives.
- js-bao is a client side library. All data syncing with the server is handled inthe background.
- Refer to the README.md file in the js-bao and js-bao-wss-client node_modules directory for reference documentation on how to use js-bao and js-bao-wss-client.
- Primitive-app provides useJsBaoDataLoader for easily loading data and watching for changes. Default to using this pattern to load data.
- Prefer to load data in this function at the page component level. Pass data into sub components directly.
- Never remove data fields from js-bao models, just add a comment that they have been deprecated.

## Using Primitive-app

- Primitive-app provides configuration based support for common usage patterns. In general start by modifing config data to accomplish your goals.
- If configuration options aren't available, you can customize primitive-app by creating new layouts and new components.
- Refer to documentation for primitive-app in the README and /docs directory in the installed primitive-app in node_modules.
- Primitive-app includes a browser based test harness which is the best way to write application level tests that use js-bao. If you've created a new lib file or function, you should add tests to the test harness to make sure that business logic is working properly.
