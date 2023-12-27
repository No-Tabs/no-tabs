import { Null, Principal, Record, Variant, Vec, bool, nat64, text } from "azle";

export const CollectionRoles = Variant({
  Admin: Null,
  Collaborator: Null,
});

export type CollectionRoles = typeof CollectionRoles.tsType;

export const CollectionMember = Record({
  id: Principal,
  role: CollectionRoles,
});

export type CollectionMember = typeof CollectionMember.tsType;

export const Tab = Record({
  id: Principal,
  name: text,
  url: text,
  createAt: nat64,
  updatedAt: nat64,
});

export type Tab = typeof Tab.tsType;

export const Collection = Record({
  id: Principal,
  name: text,
  description: text,
  private: bool,
  workspace: Principal,
  members: Vec(CollectionMember),
  tabs: Vec(Tab),
  tags: Vec(text),
  createdBy: Principal,
  createdAt: nat64,
  updatedAt: nat64,
});

export type Collection = typeof Collection.tsType;
