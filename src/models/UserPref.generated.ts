// 🔥 AUTO-GENERATED FROM models.toml — DO NOT EDIT. 🔥
// Run `pnpm models:gen` to regenerate.
// fingerprint: 7075a833763f46c4

import type { BaseModel } from "js-bao";
import { BaseModel as BaseModelImpl } from "js-bao";

export interface UserPrefAttrs {
  id: string;
  key: string;
  value: string;
}

export interface UserPref extends UserPrefAttrs, BaseModel {}
export class UserPref extends BaseModelImpl {}

/** TOML model name corresponding to this generated class. */
export const UserPref_modelName = "user_prefs";
