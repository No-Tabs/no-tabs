import { Err, Principal } from "azle";
import { UserDoesNotExistError, UsernameAlreadyExistsError } from "./modules/user/user.errors";
import { WorkspaceDoesNotExistError, WorkspaceNameAlreadyExistsError } from "./modules/workspace/workspace.errors";

export function CanisterErrorHandler(error: any) {
    // TODO: handle authentication error
    if (error instanceof UserDoesNotExistError) {
        const userId = Principal.fromText(error.message);
        return Err({UserDoesNotExist: userId});
    } else if (error instanceof UsernameAlreadyExistsError) {
        return Err({UsernameAlreadyExists: error.message});
    } else if (error instanceof WorkspaceDoesNotExistError) {
        const workspaceId = Principal.fromText(error.message);
        return Err({WorkspaceDoesNotExist: workspaceId});
    } else if (error instanceof WorkspaceNameAlreadyExistsError) {
        return Err({WorkspaceNameAlreadyExists: error.message});
    }

    // TODO: handle other errors

    return Err({UnknownError: error.message});
}
