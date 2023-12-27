import { Principal, Record, StableBTreeMap, Vec, ic, text } from "azle";
import { Workspace, WorkspaceMember, WorkspaceMemberRoles, WorkspaceScope } from "./workspace.entities";
import { isEqual, generate } from "../../../../packages/principal";
import { WorkspaceCantBeDeletedByNonOwnersError, WorkspaceDoesNotExistError, WorkspaceMemberDoesNotExistError, WorkspaceMemberRolCantAddMembersError, WorkspaceMemberRolCantDeleteMembersError, WorkspaceNameAlreadyExistsError, WorkspaceOwnerRoleCantBeAssignByNoOwnersError, WorkspaceOwnersCantBeDeletedByNoOwnersError } from "./workspace.errors";

export const CreateWorkspaceData = Record({
    name: text,
    members: Vec(WorkspaceMember),
    scope: WorkspaceScope
});

export type CreateWorkspaceData = typeof CreateWorkspaceData.tsType;

export const MemberWorkspaceRoleInfo = Record({
    workspace: Workspace,
    role: WorkspaceMemberRoles
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

        const owner: WorkspaceMember = {
            id: createdBy,
            role: {"Owner": null},
        };

        // TODO: Validate that createdBy is not in members
        // TODO: Validate that members are not duplicated

        const workspace: Workspace = {
            id,
            name: data.name,
            members: [owner, ...data.members],
            scope: data.scope,
            createdBy,
            createdAt: ic.time(),
        };

        this.workspaces.insert(id, workspace);
        
        return id;
    }

    public addMemmbers(requesterId: Principal, workspaceId: Principal, members: Vec<WorkspaceMember>): void {
        const workspace = this.workspaces.get(workspaceId).Some;

        if (!workspace) throw new WorkspaceDoesNotExistError(workspaceId);

        const requester = workspace.members.find((member) => isEqual(member.id, requesterId));

        if (!requester) {
            throw new WorkspaceMemberDoesNotExistError(requesterId);
        }

        if (requester.role.Member) {
            throw new WorkspaceMemberRolCantAddMembersError();
        }

        const areThereOwners = members.some((member) => member.role.Owner);

        if (areThereOwners && !requester.role.Owner) {
            throw new WorkspaceOwnerRoleCantBeAssignByNoOwnersError();
        }

        const existingMembers = workspace.members.map((member) => member.id.toString());
        const newMembers = members.map((member) => member.id.toString());
        const duplicatedMembers = newMembers.filter((member) => existingMembers.includes(member));

        if (duplicatedMembers.length > 0) {
            throw new Error("Duplicated members are not allowed.");
        }

        // TODO: Validate that members are valid users

        workspace.members = [...workspace.members, ...members];

        this.workspaces.insert(workspaceId, workspace);
    }

    public removeMember(requesterId: Principal, memberId: Principal, workspaceId: Principal): void {
        const workspace = this.workspaces.get(workspaceId).Some;

        if (!workspace) {
            throw new WorkspaceDoesNotExistError(workspaceId);
        }

        const requester = workspace.members.find((member) => isEqual(member.id, requesterId));

        if (!requester) {
            throw new WorkspaceMemberDoesNotExistError(requesterId);
        }

        if (requester.role.Member) {
            throw new WorkspaceMemberRolCantDeleteMembersError();
        }

        const member = workspace.members.find((member) => isEqual(member.id, memberId));

        if (!member) {
            throw new WorkspaceMemberDoesNotExistError(memberId);
        }

        if (member.role.Owner && !requester.role.Owner) {
            throw new WorkspaceOwnersCantBeDeletedByNoOwnersError();
        }

        workspace.members = workspace.members.filter((member) => !isEqual(member.id, memberId));

        this.workspaces.insert(workspaceId, workspace);

        // TODO: remove permissions from collections that this workspace owns
    }

    public remove(requesterId: Principal, workspaceId: Principal): void {
        const workspace = this.workspaces.get(workspaceId).Some;

        if (!workspace) throw new WorkspaceDoesNotExistError(workspaceId);

        const requester = workspace.members.find((member) => isEqual(member.id, requesterId));

        if (!requester) {
            throw new WorkspaceMemberDoesNotExistError(requesterId);
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
            const member = workspace.members.find((member) => isEqual(member.id, userId));
            
            if (member) {
                result.push({ workspace, role: member.role });
            }
            
            return result;
        }, []);

        return workspaces;
    }
}
