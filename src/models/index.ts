// 🔥 AUTO-GENERATED FROM models.toml — DO NOT EDIT. 🔥
// Run `pnpm models:gen` to regenerate.
// fingerprint: 7075a833763f46c4
//
// Importing this barrel registers every model with js-bao as a side
// effect (via `attachAndRegisterModel`). Apps should import models from
// `@/models` rather than the per-model `*.generated` files so
// registration runs exactly once.

import type { BaseModel } from "js-bao";
import { attachAndRegisterModel, loadSchemaFromTomlString } from "js-bao";
import modelsToml from "./models.toml?raw";
import { UserPref } from "./UserPref.generated";

export { UserPref } from "./UserPref.generated";

const _modelPairs: ReadonlyArray<{
  modelName: string;
  class: typeof BaseModel;
}> = [
  { modelName: "user_prefs", class: UserPref },
];

const _schemasByName = Object.fromEntries(
  loadSchemaFromTomlString(modelsToml).map((s) => [s.name, s])
);

for (const { modelName, class: ModelClass } of _modelPairs) {
  const schema = _schemasByName[modelName];
  if (!schema) {
    throw new Error(
      `Generated model ${ModelClass.name} expected TOML schema "${modelName}" — did models.toml change without re-running 'pnpm models:gen'?`
    );
  }
  attachAndRegisterModel(ModelClass, schema);
}

export const allModels: unknown[] = _modelPairs.map((m) => m.class);
