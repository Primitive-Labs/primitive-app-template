# Working with js-bao Documents

Guidelines for building apps with js-bao's document-based architecture.

## Core Concept: Documents

A **document** is:
1. A container for js-bao model objects
2. A sharing boundary—each document can be shared with different users at different permission levels

**Properties:**
- Documents are read/written locally. js-bao handles sync with the server.
- When other clients edit a document, local data updates in real-time.
- Access is all-or-nothing: users either have access to the entire document or none of it.

**Decision rule**: If data needs to be shared independently, it belongs in separate documents.

**Permission Levels:**
- **Reader** - View-only access
- **Read-write** - View and edit capabilities
- **Owner** - Full control including sharing and deletion

**Size Guidelines:** Documents work best around ~10MB each (soft limit). For most apps (thousands of records, years of data), this is sufficient.

## Critical Rules

1. **JS-Bao query operates over ALL open documents.** NEVER iterate over documents to query. Filter results by documentId or other fields in the query itself.

2. **Use model IDs, not document IDs.** Model data references entirely in objects using model IDs. Use documentIds ONLY when required for APIs (sharing, save location). In routes and queries, prefer model IDs.

3. **NEVER remove fields from models.** Add a deprecation comment instead.

4. **ALWAYS add new models to `getJsBaoConfig`.** Run `pnpm codegen` after creating models.

5. **Load data in pages, not sub-components.** Pass data into sub-components as props.

6. **Prefer `.query()` filtering over JavaScript filtering.** If filter params change based on app state, pass them via `queryParams` to the data loader.

## Document Lifecycle

### 1. Open Documents Before Querying

Documents must be opened before querying or modifying data within them.

```typescript
await jsBaoClient.openDocument(documentId);
const result = await MyModel.query({}, { documents: documentId });
```

Track readiness with a ref:

```typescript
const documentReady = ref(false);
await jsBaoClient.openDocument(documentId);
documentReady.value = true;
```

### 2. Document List Access

```typescript
const documents = await jsBaoClient.getDocuments();        // All documents (owned + shared)
const invitations = await jsBaoClient.getInvitations();    // Pending share invitations
```

## Data Modeling Decisions

### Separate Documents When:
- Items need independent sharing (e.g., each todo list shared with different people)
- Items are logically distinct workspaces/projects
- You want to limit sync scope

### Single Document When:
- All data should always be shared together
- Data is tightly coupled
- Simplicity is more important than granular sharing

### Tagging Documents

Use tags to categorize documents by type:

```typescript
const doc = await jsBaoClient.createDocument("My List", ["todolist"]);

// Filter documents by tag
const documents = await jsBaoClient.getDocuments();
const todoLists = documents.filter((doc) => doc.tags?.includes("todolist"));
```

## Defining Models

### Field Types

| Type | Description | Common Options |
|------|-------------|----------------|
| `id` | Unique identifier | `autoAssign: true` |
| `string` | Text values | `indexed: true`, `default: ""` |
| `number` | Numeric values | `indexed: true`, `default: 0` |
| `boolean` | True/false | `default: false` |
| `date` | ISO-8601 strings | `indexed: true` |
| `stringset` | Collection of strings (tags) | `maxCount: 20` |

### Field Options

```typescript
const schema = defineModelSchema({
  name: "tasks",
  fields: {
    id: { type: "id", autoAssign: true, indexed: true },
    title: { type: "string", indexed: true },
    priority: { type: "number", default: 0 },
    dueDate: { type: "date" },
    tags: { type: "stringset", maxCount: 10 },
    archived: { type: "boolean", default: false },
  },
});
```

### Unique Constraints

Enforce uniqueness across one or more fields:

```typescript
const schema = defineModelSchema({
  name: "categories",
  fields: {
    id: { type: "id", autoAssign: true },
    name: { type: "string" },
    parentId: { type: "string" },
  },
  uniqueConstraints: [["name", "parentId"]],  // name+parentId must be unique
});
```

### Working with StringSets

```typescript
// Add/remove tags
task.tags.add("urgent");
task.tags.remove("low-priority");

// Check membership
if (task.tags.has("urgent")) { ... }

// Convert to array for display
const tagList = task.tags.toArray();
```

### Working with Dates

Dates are stored as ISO-8601 strings. Convert for comparisons:

```typescript
// Store
task.dueDate = new Date().toISOString();

// Compare
const due = new Date(task.dueDate);
if (due < new Date()) {
  console.log("Overdue!");
}

// Query with date comparison
const result = await Task.query({
  dueDate: { $lt: new Date().toISOString() }
});
```

## Querying Data

### Single Document Query

```typescript
const result = await MyModel.query(
  { completed: false },
  { documents: documentId, sort: { order: 1 } }
);
```

### Query Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `$eq` | Equals (default) | `{ status: "active" }` |
| `$gt`, `$lt` | Greater/less than | `{ priority: { $gt: 5 } }` |
| `$gte`, `$lte` | Greater/less or equal | `{ dueDate: { $lte: today } }` |
| `$in` | Matches any in array | `{ status: { $in: ["active", "pending"] } }` |
| `$startsWith` | String prefix match | `{ title: { $startsWith: "Bug:" } }` |
| `$containsText` | Full-text search | `{ title: { $containsText: "urgent" } }` |
| `$exists` | Field exists/not null | `{ dueDate: { $exists: true } }` |

```typescript
const result = await Task.query({
  completed: false,
  priority: { $gte: 3 },
  tags: { $in: ["work", "urgent"] },
});
```

### Pagination

Use cursor-based pagination for large result sets:

```typescript
const pageSize = 20;
let cursor: string | undefined;

// First page
const page1 = await Task.query(
  { completed: false },
  { limit: pageSize, sort: { createdAt: -1 } }
);

// Next page using cursor
cursor = page1.uniqueStartKey;
const page2 = await Task.query(
  { completed: false },
  { limit: pageSize, sort: { createdAt: -1 }, uniqueStartKey: cursor }
);
```

### Counting Records

```typescript
const activeCount = await Task.count({ completed: false });
const totalCount = await Task.count({});
```

### Aggregations

Group and calculate statistics:

```typescript
const stats = await Task.aggregate({
  groupBy: ["category"],
  operations: [
    { type: "count" },
    { type: "avg", field: "priority" },
    { type: "sum", field: "estimatedHours" },
  ],
});
// Returns: [{ category: "work", count: 10, avg_priority: 2.5, sum_estimatedHours: 45 }, ...]
```

### Multi-Document Query

Open all documents first, then query across them:

```typescript
const documentIds = todoLists.map(d => d.documentId);
await Promise.all(documentIds.map(id => jsBaoClient.openDocument(id)));

const result = await TodoItem.query({}, { documents: documentIds });

// Get the document an item belongs to
for (const item of result.data) {
  const docId = item.getDocumentId();
}
```

### useJsBaoDataLoader Pattern

**ALWAYS** pass a `documentReady` ref/computed to `useJsBaoDataLoader` to indicate when documents are open and ready for querying.

```typescript
const {
  data: todos,
  initialDataLoaded,
  reload,
} = useJsBaoDataLoader<TodoItem[]>({
  subscribeTo: [TodoItem],
  queryParams: computed(() => ({ documentId })),
  documentReady,
  async loadData() {
    const result = await TodoItem.query({}, { documents: documentId });
    return result.data;
  },
});
```

**Rules:**
- Use `useJsBaoDataLoader` no more than once per component
- **Return a single structured object** from `loadData`
- NEVER add a watch on `loadData` results. Do processing inside `loadData`.
- NEVER rely on component remounting for route param changes. The loader only sees changes via `queryParams`.
- `initialDataLoaded` becomes true after the first successful `loadData`. Use this (not `documentReady`) with `PrimitiveSkeletonGate`.
- Make rendering/redirect decisions ONLY after `initialDataLoaded` is true.
- For side effects after load (like redirects), watch `initialDataLoaded` and act when it becomes true.
- For sequences of mutations (save/delete/reorder), set `pauseUpdates` while mutating, then call `reload()` afterward to avoid flicker.

### Manual Subscriptions

For cases outside `useJsBaoDataLoader`, subscribe to model changes directly:

```typescript
const unsubscribe = Task.subscribe(() => {
  // Re-query or update UI when Task records change
  refreshTaskList();
});

// Clean up on component unmount
onUnmounted(() => unsubscribe());
```

## Saving Data

### Save to a Specific Document

```typescript
const newItem = new TodoItem();
newItem.title = "Buy groceries";
await newItem.save({ targetDocument: documentId });
```

### Update Existing Item

```typescript
// Items remember their document
todo.completed = true;
await todo.save();
```

### Upsert by Unique Constraint

Create or update based on unique fields:

```typescript
// If a category with this name+parentId exists, update it; otherwise create it
await Category.upsertByUnique(
  ["name", "parentId"],           // unique constraint fields
  { name: "Work", parentId: null }, // match values
  { color: "blue" }                // fields to set/update
);
```

## Design Patterns

### Singleton Model per Document (Avoiding ID Confusion)

Create a singleton model per document for metadata. Child models reference by model ID, not document ID:

```typescript
// TodoList - one per document
const todoListSchema = defineModelSchema({
  name: "todo_lists",
  fields: {
    id: { type: "id", autoAssign: true, indexed: true },
    title: { type: "string" },
    createdAt: { type: "number" },
    createdBy: { type: "string" },
  },
});

// TodoItem references TodoList by MODEL ID
const todoItemSchema = defineModelSchema({
  name: "todo_items",
  fields: {
    id: { type: "id", autoAssign: true, indexed: true },
    listId: { type: "string", indexed: true },  // Model ID, not document ID
    title: { type: "string" },
    completed: { type: "boolean" },
  },
});
```

**Use this pattern when:**
- Documents represent a meaningful entity (project, list, workspace)
- You need document-level metadata
- Child models need to reference their parent container

### Singleton Documents with Aliases

For documents that should exist exactly once (default document, settings):

```typescript
// Atomic get-or-create
const prefsDocId = await jsBaoClient.ensureDocWithAlias(
  "My Preferences",
  { scope: "user", aliasKey: "user-prefs" },
  ["preferences"]
);
```

**Alias scopes:**
- `"user"` - Unique per user
- `"app"` - Unique across entire app (shared by all users)

### Handling Route Changes

Vue may reuse components when document ID changes in route params.

**Option 1: Force recreation**
```vue
<TodoListView :key="documentId" :document-id="documentId" />
```

**Option 2: Watch and reload**
```typescript
watch(
  () => props.documentId,
  async (newId) => {
    documentReady.value = false;
    await jsBaoClient.openDocument(newId);
    documentReady.value = true;
  }
);
```

## Common Errors

| Symptom | Cause | Fix |
|---------|-------|-----|
| Query returns empty | Document not opened | `await jsBaoClient.openDocument()` before query |
| Computed doesn't update | Using `toRef(store, 'prop')` | Access store properties directly in computed |
| Need document from item | N/A | Use `item.getDocumentId()` |

## Architecture Template

```
src/
├── models/
│   ├── MyContainer.ts          # Singleton model for doc metadata
│   └── MyItem.ts               # Child model (refs container by model ID)
├── stores/
│   └── myAppStore.ts           # App state (current selection, UI)
├── composables/
│   └── useGlobalSearch.ts      # Cross-document operations
├── components/
├── pages/
│   ├── DocumentListPage.vue    # Shows all documents
│   └── DocumentDetailPage.vue  # Shows single document
└── layouts/
    └── AppLayout.vue           # App layout with jsBaoClient setup
```
