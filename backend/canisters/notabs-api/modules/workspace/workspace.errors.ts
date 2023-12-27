import { Principal } from "azle";

export class WorkspaceNameAlreadyExistsError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "WorkspaceNameAlreadyExists";
    }
}

export class WorkspaceDoesNotExistError extends Error {
    constructor(message: Principal) {
        super(message.toString());
        this.name = "WorkspaceDoesNotExist";
    }
}

export class WorkspaceMemberDoesNotExistError extends Error {
    constructor(message: Principal) {
        super(message.toString());
        this.name = "WorkspaceMemberDoesNotExist";
    }
}

export class WorkspaceMemberRolCantAddMembersError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = "WorkspaceMemberRolCantAddMembers";
    }
}

export class WorkspaceOwnerRoleCantBeAssignByNoOwnersError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = "WorkspaceOwnerRoleCantBeAssignByNoOwners";
    }
}

export class WorkspaceMemberRolCantDeleteMembersError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = "WorkspaceMemberRolCantDeleteMembers";
    }
}

export class WorkspaceOwnersCantBeDeletedByNoOwnersError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = "WorkspaceOwnersCantBeDeletedByNoOwners";
    }
}

export class WorkspaceCantBeDeletedByNonOwnersError extends Error {
    constructor(message: Principal) {
        super(message.toString());
        this.name = "WorkspaceCantBeDeletedByNonOwners";
    }
}
