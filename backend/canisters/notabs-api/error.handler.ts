import { Err, Principal } from "azle";
import { UserDoesNotExistError, UsernameAlreadyExistsError } from "./modules/user/user.errors";
import { WorkspaceDoesNotExistError, WorkspaceNameAlreadyExistsError } from "./modules/workspace/workspace.errors";
import { NotAuthenticatedError } from "./modules/auth/auth.errors";


export function CanisterErrorHandler(error: any) {
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

    return Err({UnknownError: error.message});
}
