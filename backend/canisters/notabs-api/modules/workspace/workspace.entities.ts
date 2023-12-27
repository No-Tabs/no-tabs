import { Null, Principal, Record, Variant, Vec, nat64, text } from "azle";

export const WorkspaceMemberRoles = Variant({
  Owner: Null,
  Admin: Null,
  Member: Null,
});

export type WorkspaceMemberRoles = typeof WorkspaceMemberRoles.tsType;

export const WorkspaceMember = Record({
  id: Principal,
  role: WorkspaceMemberRoles,
});

export type WorkspaceMember = typeof WorkspaceMember.tsType;

export const WorkspaceScope = Variant({
  Personal: Null,
  Team: Null,
});

export type WorkspaceScope = typeof WorkspaceScope.tsType;

export const Workspace = Record({
  id: Principal,
  name: text,
  scope: WorkspaceScope,
  members: Vec(WorkspaceMember),
  createdBy: Principal,
  createdAt: nat64,
});

export type Workspace = typeof Workspace.tsType;
