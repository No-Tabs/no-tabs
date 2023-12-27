import { Null, Principal, Record, Variant, Vec, nat64, text } from "azle";

export const WorkspaceRoles = Variant({
  Owner: Null,
  Admin: Null,
  Member: Null,
});

export type WorkspaceRoles = typeof WorkspaceRoles.tsType;

export const WorkspaceUser = Record({
  id: Principal,
  role: WorkspaceRoles,
});

export type WorkspaceUser = typeof WorkspaceUser.tsType;

export const WorkspaceScope = Variant({
  Personal: Null,
  Team: Null,
});

export type WorkspaceScope = typeof WorkspaceScope.tsType;

export const Workspace = Record({
  id: Principal,
  name: text,
  scope: WorkspaceScope,
  users: Vec(WorkspaceUser),
  createdBy: Principal,
  createdAt: nat64,
});

export type Workspace = typeof Workspace.tsType;
