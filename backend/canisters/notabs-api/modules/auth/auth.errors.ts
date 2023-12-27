import { Principal } from "azle";

export class NotAuthenticatedError extends Error {
    constructor(user: Principal) {
        super(user.toString());
        this.name = "NotAuthenticatedError";
    }
}
