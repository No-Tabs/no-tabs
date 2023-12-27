import { Canister, Err, Ok, Principal, Record, Result, Vec, bool, ic, query, text, update } from "azle";
import { CanisterErrorMap, CanisterErrorResponse } from "./canister.errors";
import { isEqual } from "../../packages/principal";

import { User, UserService } from "./modules/user";
import { AuthService } from "./modules/auth";
import { CollectionService } from "./modules/collection";
import { MemberWorkspaceRoleInfoVec, WorkspaceUser, WorkspaceService } from "./modules/workspace";

const CreateUserData = Record({
    username: text,
});

const CreateWorkspaceData = Record({
    name: text,
    users: Vec(WorkspaceUser),
});

const CreateCollectionData = Record({
    name: text,
    description: text,
    private: bool,
    tags: Vec(text),
});

const AddTabToCollectionData = Record({
    name: text,
    url: text,
});

const userService = new UserService();
const authService = new AuthService(userService);
const workspaceService = new WorkspaceService();
const collectionService = new CollectionService();

export default Canister({
    createUser: update([CreateUserData], Result(bool, CanisterErrorResponse), (data) => {
        const userId = ic.caller();

        try {
            const workspace = {
                name: `${data.username}'s Workspace}`,
                users: [],
                scope: {Personal: null}
            }

            userService.create(userId, data);
            workspaceService.create(userId, workspace);
            return Ok(true);
        } catch(error: any) {
            return CanisterErrorMap(error);
        }
    }),
    getProfile: query([], Result(User, CanisterErrorResponse), () => {
        try {
            authService.validate();
            const userId = ic.caller();
            const user = userService.get(userId);
            return Ok(user);
        } catch(error: any) {
            return CanisterErrorMap(error);
        }
    }),
    createWorkspace: update([CreateWorkspaceData], Result(Principal, CanisterErrorResponse), (data) => {
        try {            
            authService.validate();
            const userId = ic.caller();
            const workspace = {
                name: data.name,
                users: data.users,
                scope: {Team: null},
            }

            const workspaceId = workspaceService.create(userId, workspace);
            return Ok(workspaceId);
        } catch(error: any) {
            return CanisterErrorMap(error);
        }
    }),
    getMyWorkspaces: query([], Result(MemberWorkspaceRoleInfoVec, CanisterErrorResponse), () => {
        try {
            authService.validate();
            const userId = ic.caller();
            const workspaces = workspaceService.getWorkspacesByMember(userId);

            return Ok(workspaces);
        } catch(error: any) {
            return CanisterErrorMap(error);
        }
    }),
    createCollection: update([Principal, CreateCollectionData], Result(Principal, CanisterErrorResponse), (workspaceId, data) => {
        try {
            authService.validate();
            const userId = ic.caller();
            const workspace = workspaceService.get(workspaceId);

            const isUser = workspace.users.find((user) => isEqual(user.id, userId));

            if (!isUser) {
                return Err({WorkspaceDoesNotHaveThisUser: userId});
            }

            const collectionId = collectionService.create(userId, workspace.id, data);

            return Ok(collectionId);
        } catch(error: any) {
            return CanisterErrorMap(error);
        }
    }),
    addTabToCollection: update([Principal, AddTabToCollectionData], Result(bool, CanisterErrorResponse), (collectionId, data) => {
        try {
            authService.validate();
            const userId = ic.caller();

            const collection = {
                name: data.name,
                url: data.url,
            }

            collectionService.addTab(userId, collectionId, collection);

            return Ok(true);
        } catch(error: any) {
            return CanisterErrorMap(error);
        }
    }),
    removeTabFromCollection: update([Principal], Result(bool, CanisterErrorResponse), (tabId) => {
        try {
            authService.validate();
            const userId = ic.caller();

            collectionService.removeTab(userId, tabId);

            return Ok(true);
        } catch(error: any) {
            return CanisterErrorMap(error);
        }
    })
});
