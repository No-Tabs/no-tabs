import { Principal } from "azle";

export class WorkspaceNameAlreadyExistsError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "WorkspaceNameAlreadyExistsError";
    }
}

export class WorkspaceDoesNotExistError extends Error {
    constructor(message: Principal) {
        super(message.toString());
        this.name = "WorkspaceDoesNotExistError";
    }
}

export class WorkspaceUserDoesNotExistError extends Error {
    constructor(message: Principal) {
        super(message.toString());
        this.name = "WorkspaceUserDoesNotExistError";
    }
}

export class WorkspaceAddUsersToPersonalScopeNotAllowedError extends Error {
    constructor(message: Principal) {
        super(message.toString());
        this.name = "WorkspaceAddUsersToPersonalScopeNotAllowedError";
    }
}

export class WorkspaceMemberRolCantAddUsersError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = "WorkspaceMemberRolCantAddUsersError";
    }
}

export class WorkspaceOwnerRoleCantBeAssignedByNoOwnersError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = "WorkspaceOwnerRoleCantBeAssignedByNoOwnersError";
    }
}

export class WorkspaceMemberRolCantDeleteUsersError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = "WorkspaceMemberRolCantDeleteUsersError";
    }
}

export class WorkspaceOwnersCantBeDeletedByNoOwnersError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = "WorkspaceOwnersCantBeDeletedByNoOwnersError";
    }
}

export class WorkspaceCantBeDeletedByNonOwnersError extends Error {
    constructor(message: Principal) {
        super(message.toString());
        this.name = "WorkspaceCantBeDeletedByNonOwnersError";
    }
}
