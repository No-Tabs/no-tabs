import { Canister, Err, Ok, Principal, Record, Result, Variant, Vec, bool, ic, query, text, update } from "azle";
import { UserService } from "./modules/user/user.service";
import { User } from "./modules/user/user.entities";
import { MemberWorkspaceRoleInfoVec, WorkspaceService } from "./modules/workspace/workspace.service";
import { CollectionService } from "./modules/collection/collection.service";
import { WorkspaceMember } from "./modules/workspace/workspace.entities";
import { CanisterErrorHandler } from "./error.handler";

const CreateUserData = Record({
    username: text,
});

const CreateWorkspaceData = Record({
    name: text,
    members: Vec(WorkspaceMember),
});

const CreateCollectionData = Record({
    name: text,
    private: bool,
    tags: Vec(text),
});

const userService = new UserService();
const workspaceService = new WorkspaceService();
const collectionService = new CollectionService();

const CanisterErrors = Variant({
    UserNotAuthenticated: Principal,
    UserDoesNotExist: Principal,
    UsernameAlreadyExists: text,
    WorkspaceDoesNotExist: Principal,
    WorkspaceNameAlreadyExists: text,
    WorkspaceDoesNotHaveThisMember: Principal,
    CollectionDoesNotExist: Principal,
    UnknownError: text,
});

export default Canister({
    createUser: update([CreateUserData], Result(bool, CanisterErrors), (data) => {
        let userCreated = false;
        const userId = ic.caller();

        try {
            const workspace = {
                name: `${data.username}'s Workspace}`,
                members: [],
                scope: {Personal: null} 
            }

            userService.create(userId, data);
            userCreated = true;
            workspaceService.create(userId, workspace);
            return Ok(true);
        } catch(error: any) {
            return CanisterErrorHandler(error);
        }
    }),
    getProfile: query([], Result(User, CanisterErrors), () => {
        try {
            const userId = ic.caller();
            const user = userService.get(userId);
            return Ok(user);
        } catch(error: any) {
            return CanisterErrorHandler(error);
        }
    }),
    createWorkspace: update([CreateWorkspaceData], Result(Principal, CanisterErrors), (data) => {
        try {
            const userId = ic.caller();
            const user = userService.get(userId);
            const workspace = {
                name: data.name,
                members: data.members,
                scope: {Team: null},
            }

            const workspaceId = workspaceService.create(user.id, workspace);
            return Ok(workspaceId);
        } catch(error: any) {
            return CanisterErrorHandler(error);
        }
    }),
    getWorkspaces: query([], Result(MemberWorkspaceRoleInfoVec, CanisterErrors), () => {
        try {
            const userId = ic.caller();
            const user = userService.get(userId);
            const workspaces = workspaceService.getWorkspacesByMember(user.id);

            return Ok(workspaces);
        } catch(error: any) {
            return CanisterErrorHandler(error);
        }
    }),
    createCollection: update([Principal, CreateCollectionData], Result(Principal, CanisterErrors), (workspaceId, data) => {
        try {
            const userId = ic.caller();
            const user = userService.get(userId);
            const workspace = workspaceService.get(workspaceId);

            const isMember = workspace.members.find((member) => member.id === user.id);

            if (!isMember) {
                return Err({WorkspaceDoesNotHaveThisMember: user.id});
            }

            const collectionId = collectionService.create(user.id, workspace.id, data);

            return Ok(collectionId);
        } catch(error: any) {
            return CanisterErrorHandler(error);
        }
    })
});
