import { Principal, Record, StableBTreeMap, Vec, ic, text } from "azle";
import { Workspace, WorkspaceUser, WorkspaceRoles, WorkspaceScope } from "./workspace.entities";
import { isEqual, generate } from "../../../../packages/principal";
import { 
    WorkspaceNameAlreadyExistsError,
    WorkspaceDoesNotExistError,
    WorkspaceUserDoesNotExistError,
    WorkspaceMemberRolCantAddUsersError,
    WorkspaceOwnerRoleCantBeAssignedByNoOwnersError,
    WorkspaceMemberRolCantDeleteUsersError,
    WorkspaceOwnersCantBeDeletedByNoOwnersError,
    WorkspaceCantBeDeletedByNonOwnersError
} from "./workspace.errors";

export const CreateWorkspaceData = Record({
    name: text,
    users: Vec(WorkspaceUser),
    scope: WorkspaceScope
});

export type CreateWorkspaceData = typeof CreateWorkspaceData.tsType;

export const MemberWorkspaceRoleInfo = Record({
    workspace: Workspace,
    role: WorkspaceRoles
});

export type MemberWorkspaceRoleInfo = typeof MemberWorkspaceRoleInfo.tsType;

export const MemberWorkspaceRoleInfoVec = Vec(MemberWorkspaceRoleInfo);

export type MemberWorkspaceRoleInfoVec = typeof MemberWorkspaceRoleInfoVec.tsType;

export class WorkspaceService {
    private  workspaces = StableBTreeMap<Principal, Workspace>(1);

    public getAll(): Vec<Workspace> {
        return this.workspaces.values();
    }

    public get(id: Principal): Workspace {
        const workspace = this.workspaces.get(id).Some;

        if (!workspace) throw new WorkspaceDoesNotExistError(id);

        return workspace;
    }

    public exists(id: Principal): boolean {
        return this.workspaces.containsKey(id);
    }

    public create(createdBy: Principal, data: CreateWorkspaceData): Principal {
        const existingWorkspaceName = this.workspaces.values().find((workspace) => workspace.name === data.name);

        if (existingWorkspaceName) throw new WorkspaceNameAlreadyExistsError(data.name);

        // TODO: Personal workspaces should be unique per user

        const id = generate();

        const owner: WorkspaceUser = {
            id: createdBy,
            role: {"Owner": null},
        };

        // TODO: Validate that createdBy is not in members
        // TODO: Validate that members are not duplicated

        const workspace: Workspace = {
            id,
            name: data.name,
            users: [owner, ...data.users],
            scope: data.scope,
            createdBy,
            createdAt: ic.time(),
        };

        this.workspaces.insert(id, workspace);
        
        return id;
    }

    public addMemmbers(requesterId: Principal, workspaceId: Principal, users: Vec<WorkspaceUser>): void {
        const workspace = this.workspaces.get(workspaceId).Some;

        if (!workspace) throw new WorkspaceDoesNotExistError(workspaceId);

        const requester = workspace.users.find((user) => isEqual(user.id, requesterId));

        if (!requester) {
            throw new WorkspaceUserDoesNotExistError(requesterId);
        }

        if (requester.role.Member) {
            throw new WorkspaceMemberRolCantAddUsersError();
        }

        const areThereOwners = users.some((user) => user.role.Owner);

        if (areThereOwners && !requester.role.Owner) {
            throw new WorkspaceOwnerRoleCantBeAssignedByNoOwnersError();
        }

        const existingUsers = workspace.users.map((user) => user.id.toString());
        const newUsers = users.map((user) => user.id.toString());
        const duplicatedUsers = newUsers.filter((user) => existingUsers.includes(user));

        if (duplicatedUsers.length > 0) {
            throw new Error("Duplicated members are not allowed.");
        }

        // TODO: Validate that members are valid users

        workspace.users = [...workspace.users, ...users];

        this.workspaces.insert(workspaceId, workspace);
    }

    public removeMember(requesterId: Principal, UserId: Principal, workspaceId: Principal): void {
        const workspace = this.workspaces.get(workspaceId).Some;

        if (!workspace) {
            throw new WorkspaceDoesNotExistError(workspaceId);
        }

        const requester = workspace.users.find((user) => isEqual(user.id, requesterId));

        if (!requester) {
            throw new WorkspaceUserDoesNotExistError(requesterId);
        }

        if (requester.role.Member) {
            throw new WorkspaceMemberRolCantDeleteUsersError();
        }

        const member = workspace.users.find((user) => isEqual(user.id, UserId));

        if (!member) {
            throw new WorkspaceUserDoesNotExistError(UserId);
        }

        if (member.role.Owner && !requester.role.Owner) {
            throw new WorkspaceOwnersCantBeDeletedByNoOwnersError();
        }

        workspace.users = workspace.users.filter((user) => !isEqual(user.id, UserId));

        this.workspaces.insert(workspaceId, workspace);

        // TODO: remove permissions from collections that this workspace owns
    }

    public remove(requesterId: Principal, workspaceId: Principal): void {
        const workspace = this.workspaces.get(workspaceId).Some;

        if (!workspace) throw new WorkspaceDoesNotExistError(workspaceId);

        const requester = workspace.users.find((user) => isEqual(user.id, requesterId));

        if (!requester) {
            throw new WorkspaceUserDoesNotExistError(requesterId);
        }

        if (!requester.role.Owner) {
            throw new WorkspaceCantBeDeletedByNonOwnersError(workspaceId);
        }

        // TODO: Remove collections
        // TODO: Remove all collections followed by users

        this.workspaces.remove(workspaceId);
    }

    public getWorkspacesByMember(userId: Principal): MemberWorkspaceRoleInfoVec {        
        const workspaces = this.workspaces.values().reduce((result: MemberWorkspaceRoleInfoVec, workspace) => {
            const user = workspace.users.find((user) => isEqual(user.id, userId));
            
            if (user) {
                result.push({ workspace, role: user.role });
            }
            
            return result;
        }, []);

        return workspaces;
    }
}
