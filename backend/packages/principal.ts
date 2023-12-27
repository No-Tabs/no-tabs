import { Principal } from "azle";

export function generate(): Principal {
  const randomBytes = new Array(29)
    .fill(0)
    .map((_) => Math.floor(Math.random() * 256));

  return Principal.fromUint8Array(Uint8Array.from(randomBytes));
}

export function isEqual(p1: Principal, p2: Principal): boolean {
  return p1.toString() === p2.toString();
}
