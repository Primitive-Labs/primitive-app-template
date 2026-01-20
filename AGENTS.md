## Project Stack

- This project uses vite, typescript, vue, vue-router, tailwind, shadcn-vue, primitive-app and js-bao for data persistence. Do not deviate from this stack. If there are additional foundational components required, ask the user before installing them.

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

- ALWAYS Fail early. Don't mask missing required inputs with inline fallbacks or try to recover from errors caused by improper usage or bad input. Expose the errors directly.
- ALWAYS use strong typing and invariants over scattered defensive code.
- PREFER keeping components and source files under 500 LOC. ALWAYS refactor code into components if files get large.
- After completing a task, ALWAYS do a final review code review of your work. Automatically refactor if there is a way to delete dead code, simplify, or reduce duplicative code.
- ALWAYS delete old code rather than comment it out or deprecate it. If removing code will be a breaking change, CONFIRM with the user how to handle it. Don't assume.
- js-bao is a client side library. All data syncing with the server is handled in the background. NEVER try to write server code.
- ALWAYS use logger.createLogger to create a new logger for each file rather than logging to the console directly. Pass in the current log level with an explicit "level: getLogLevel()". NEVER use the primitiveAppBaseLogger.
- ALWAYS add meaningful comments that explain WHY something is done, NEVER add comments that just explain what code does, or code changes from a prior version.
- ALWAYS organize functions in code files in a logical order (e.g. "initialze" functions at the top of the file, a logical sequence or grouping, etc.). Add comments to break up sections of related functions.
- ALWAYS run pnpm codegen and pnpm type-check after making changes and fix any errors.
- NEVER modify worker.js. This is a library provided file and should not be edited.

## Vue Code Guidelines

- ALWAYS use Composition API + <script setup>, NEVER use Options API
- ALWAYS Keep types alongside your code, use TypeScript for type safety, prefer interface over type for defining types
- ALWAYS use named functions when declaring methods, use arrow functions only for callbacks
- ALWAYS prefer named exports over default exports
- AVOID watch/watchEffect wherever possible. PREFER to call code directly after a user action or after loading data.
- ALWAYS place Vue lifecycle methods (e.g. onMounted) as the first functions in the component
- ALWAYS use Pinia for state management. Pina stores should expose:
  - State – refs/reactive objects that can be returned
  - Getters – derived, reactive values from state
  - Actions – functions that do stuff (async, mutations, side effects)
- AVOID writing exported functions in Pina stores that return non-reactive state. Helper functions should be internal, actions can return non-reactive status, but shouldn't return non-reactive state. Use reactive getters instead.

## Using Primitive-app

- Primitive-app provides configuration based support for common usage patterns and wireup of js-bao and js-bao-wss-client. In general start by modifying config data to accomplish your goals. Refer to the Primitive Docs at https://primitive-labs.github.io/primitive-docs/ for guides on how to model data and documents and use the js-bao-wss-client APIs.
- If configuration options aren't available to accomplish the user's request, you can add new layouts and new components.

### Data Storage and Loading

- ALWAYS use js-bao for data persistence, and the js-bao-wss-client for interacting with the backend (auth, API calls, opening/closing js-bao documents, storing blobs, etc.).
- ALWAYS refer to @./node_modules/js-bao/README.md and @./node_modules/js-bao-wss-client/README.md for instructions on how to create js-bao models and use the js-bao-wss-client.
- ALWAYS use useJsBaoDataLoader for data loading. Use it no more than once per component to load data. When multiple documents are open, this will automatically query across all open documents.
- NEVER add a watch function that triggers on the results of the loadData function changing. Instead, if there is processing required after data changes, do that processing in loadData.
- NEVER rely on the component remounting when route params change; the loader only sees changes via queryParams, so make sure to update this object to trigger a reload.
- PREFER filtering for needed data using js-bao .query() rather than querying all objects and filtering in Javascript. If those queryParams can be changed by application state, pass those to the jsBaoDataLoader via queryParams.
- PREFER loading data in pages rather than sub-components. Pass data into sub components directly.
- NEVER remove data fields from js-bao models, just add a comment that they have been deprecated.
- ALWAYS add newly created models to the models param in getJsBaoConfig. Run pnpm codegen after creating a new model.
- When using useJsBaoDataLoader, ALWAYS return a single structured object from loadData and, for sequences of related mutations (save/delete/reorder), set pauseUpdates while mutating then call a single reload() afterward to avoid mid-interaction flicker.

### useJsBaoDataLoader Pattern

- ALWAYS pass a `documentReady` ref/computed to `useJsBaoDataLoader`. For single-document apps, use `useSingleDocumentStore().isReady`. For multi-document collections, use `multiDocStore.getCollectionReadyRef("collectionName")`.
- The loader returns `initialDataLoaded` which becomes `true` only after the first successful `loadData` call completes. Use this (not `documentReady`) with `PrimitiveSkeletonGate`.
- Make rendering/redirect decisions based ONLY on the loaded `data`. Only act on data after `initialDataLoaded` is true.
- If you need to perform a side effect (like a redirect) after data loads, use a `watch` on `initialDataLoaded` that fires once when it becomes true, then make decisions based on `data.value`.

### Data modeling and working with multiple documents and the `multiDocStore`

- JS-Bao query always operates over ALL open documents. You NEVER need to iterate over documents to query. You can filter results by documentId or any other field on the ORM.
- ALWAYS model data references entirely in objects, using model IDs to create connections. Don't rely on document boundaries for modeling relationships.
- PREFER using model IDs as identifiers (in routes, queries etc.), not documentIds. Use documentIds when REQUIRED for APIs like sharing, setting model save location, etc.
- From an object you can get the document its stored in by accessing the model object's getDocumentId() function.

## UI/UX Guidelines

## Responsive Design

- Unless specifically directed otherwise, ALWAYS think about building UI that's responsive to desktop, tablet, and mobile phone sized screens.
- If you write UI components that utilize desktop UX patterns (like Dialogs) ALWAYS provide a phone pattern (like a Sheet) that is used on smaller screens.

### CSS & Component Library

- ALWAYS use shadcn-vue components without modification if possible.
- ALWAYS install needed shadcn-vue components if they are not available in the current project, ONLY using the command line installation tool.
- NEVER build components from scratch. If a default shadcn-vue component does not meet the project needs, create new components by composing shadcn-vue components.
- ALWAYS use TailwindCSS classes rather than manual CSS.
- NEVER hard code colors, use Tailwind's color system.

### Writing Components

- ALWAYS use PrimitiveSkeletonGate to show skeletons until jsBaoDataLoader sets initialDataLoaded.
- It is NEVER an error for components to mount before js-bao document isReady becomes true or data is loaded. Components should handle this case using jsBaoDataLoader and PrimitiveSkeletonGate, waiting until the required data is available.
- AVOID writing business logic in Vue components. Components should be focused on rendering and UI interaction - move data manipulation and business logic to a related /lib file so it can be tested.
- ALWAYS make customizations at the layout level, not in App.vue. You can compose a provided primitive-app layout to customize it, or create a new one.

### PrimitiveSkeletonGate Pattern

- ALWAYS use `PrimitiveSkeletonGate` with `:is-ready="initialDataLoaded"` to show loading state while data loads.
- For skeleton content, create a Skeleton component using shadcn-vue Skeleton that mimics the eventual loaded data on the page.

## Writing Tests

- ALWAYS use the primitive-app test harness to write browser based tests for business logic in lib files/functions. For EVERY new lib file/function you create or update write tests that cover key cases. Refer to the Primitive Docs at https://primitive-labs.github.io/primitive-docs/ for examples.
