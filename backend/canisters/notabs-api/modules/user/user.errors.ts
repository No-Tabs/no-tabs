import { Principal } from "azle";

export class UserDoesNotExistError extends Error {
    constructor(message: Principal) {
        super(message.toString());
        this.name = "UserDoesNotExist";
    }
}

export class UserAlreadyExistsError extends Error {
    constructor(message: Principal) {
        super(message.toString());
        this.name = "UserAlreadyExists";
    }
}

export class UsernameAlreadyExistsError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "UsernameAlreadyExists";
    }
}

export class CollectionAlreadyAddedError extends Error {
    constructor(message: Principal) {
        super(message.toString());
        this.name = "CollectionAlreadyAdded";
    }
}
