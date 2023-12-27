import { Principal, Record, Vec, nat64, text } from "azle";

export const User = Record({
  id: Principal,
  username: text,
  follow: Vec(Principal),
  createdAt: nat64,
});

export type User = typeof User.tsType;
