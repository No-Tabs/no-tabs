import { Principal, Record, StableBTreeMap, Vec, ic, text } from "azle";
import { Workspace, WorkspaceMember, WorkspaceMemberRoles, WorkspaceScope } from "./workspace.entities";
import { generateId } from "../../../../packages/helpers";
import { WorkspaceDoesNotExistError, WorkspaceNameAlreadyExistsError } from "./workspace.errors";

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

        if (!workspace) throw new WorkspaceDoesNotExistError(id.toString());

        return workspace;
    }

    public create(createdBy: Principal, data: CreateWorkspaceData): Principal {
        const existingWorkspaceName = this.workspaces.values().find((workspace) => workspace.name === data.name);

        if (existingWorkspaceName) throw new WorkspaceNameAlreadyExistsError(data.name);

        // TODO: Personal workspaces should be unique per user

        const id = generateId();

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

    public addMemmbers(workspaceId: Principal, members: Vec<WorkspaceMember>): void {
        const workspace = this.workspaces.get(workspaceId).Some;

        if (!workspace) throw new WorkspaceDoesNotExistError(workspaceId.toString());

        // TODO: Only allow owners and admins to add members
        // TODO: Validate that members are not duplicated
        // TODO: Validate that members are valid users

        workspace.members = [...workspace.members, ...members];

        this.workspaces.insert(workspaceId, workspace);
    }

    public remove(workspaceId: Principal): void {
        const workspace = this.workspaces.get(workspaceId).Some;

        if (!workspace) throw new WorkspaceDoesNotExistError(workspaceId.toString());

        // TODO: Only allow owners to remove workspaces
        // TODO: Remove collections
        // TODO: Remove all collections followed by users

        this.workspaces.remove(workspaceId);
    }

    public getWorkspacesByMember(userId: Principal): MemberWorkspaceRoleInfoVec {
        const workspaces = this.workspaces.values().reduce((result: MemberWorkspaceRoleInfoVec, workspace) => {
            const member = workspace.members.find((member) => member.id === userId);
            
            if (member) {
                result.push({ workspace, role: member.role });
            }
            return result;
        }, []);

        return workspaces;
    }
}
