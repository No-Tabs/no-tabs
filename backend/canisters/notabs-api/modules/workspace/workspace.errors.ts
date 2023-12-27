export class WorkspaceNameAlreadyExistsError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "WorkspaceNameAlreadyExists";
    }
}

export class WorkspaceDoesNotExistError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "WorkspaceDoesNotExist";
    }
}
