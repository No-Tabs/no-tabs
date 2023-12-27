import { Err, Principal, Variant, text } from "azle";
import { UserDoesNotExistError, UsernameAlreadyExistsError } from "./modules/user";
import { WorkspaceDoesNotExistError, WorkspaceNameAlreadyExistsError } from "./modules/workspace";
import { NotAuthenticatedError } from "./modules/auth";

export const CanisterErrorResponse = Variant({
    UserNotAuthenticated: Principal,
    UserDoesNotExist: Principal,
    UsernameAlreadyExists: text,
    WorkspaceDoesNotExist: Principal,
    WorkspaceNameAlreadyExists: text,
    WorkspaceDoesNotHaveThisUser: Principal,
    CollectionDoesNotExist: Principal,
    UnknownError: text,
});

export function CanisterErrorMap(error: Error) {
    // Auth errors
    if (error instanceof NotAuthenticatedError) {
        const userId = Principal.fromText(error.message);
        return Err({UserNotAuthenticated: userId});
    // User errors
    } else if (error instanceof UserDoesNotExistError) {
        const userId = Principal.fromText(error.message);
        return Err({UserDoesNotExist: userId});
    } else if (error instanceof UsernameAlreadyExistsError) {
        return Err({UsernameAlreadyExists: error.message});
    // Workspace errors
    } else if (error instanceof WorkspaceDoesNotExistError) {
        const workspaceId = Principal.fromText(error.message);
        return Err({WorkspaceDoesNotExist: workspaceId});
    } else if (error instanceof WorkspaceNameAlreadyExistsError) {
        return Err({WorkspaceNameAlreadyExists: error.message});
    // Collection errors 
    }

    const message = `${error.name}: ${error.message}`;

    return Err({UnknownError: message});
}
