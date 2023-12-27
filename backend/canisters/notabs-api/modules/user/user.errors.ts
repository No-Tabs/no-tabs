export class UserDoesNotExistError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "UserDoesNotExist";
    }
}

export class UserAlreadyExistsError extends Error {
    constructor(message: string) {
        super(message);
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
    constructor(message: string) {
        super(message);
        this.name = "CollectionAlreadyAdded";
    }
}
