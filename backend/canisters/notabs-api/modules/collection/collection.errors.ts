import { Principal } from "azle";

export class CollectionDoesNotExistError extends Error {
    constructor(message: Principal) {
        super(message.toString());
        this.name = "CollectionDoesNotExistError";
    }
}

export class CollectionUserIsNotMemberError extends Error {
    constructor(message: Principal) {
        super(message.toString());
        this.name = "CollectionUserIsNotMemberError";
    }
}

export class CollectionTabDoesNotExistError extends Error {
    constructor(message: Principal) {
        super(message.toString());
        this.name = "CollectionTabDoesNotExistError";
    }
}
