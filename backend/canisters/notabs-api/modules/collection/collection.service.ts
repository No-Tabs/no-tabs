import { Principal, Record, StableBTreeMap, Vec, bool, ic, text } from "azle";
import { Collection, CollectionMember } from "./collection.entities";
import { generateId } from "../../../../packages/helpers";

export const CreateCollectionData = Record({
    name: text,
    private: bool,
    tags: Vec(text),
});

export type CreateCollectionData = typeof CreateCollectionData.tsType;

export class CollectionService {
    private collections = StableBTreeMap<Principal, Collection>(2);
    
    public create(createdBy: Principal, workspace: Principal, data: CreateCollectionData): Principal {
        // TODO: Validate that workspace exists
        // TODO: Validate that createdBy is in workspace
        // TODO: Validate that collection name is not duplicated for the createdBy
        // TODO: Validate that tags are not duplicated

        const id = generateId();

        const member: CollectionMember = {
            id: createdBy,
            role: {"Admin": null},
        };

        const collection: Collection = {
            id,
            name: data.name,
            private: data.private,
            workspace,
            members: [member],
            tabs: [],
            tags: data.tags,
            createdBy,
            createdAt: ic.time(),
            updatedAt: ic.time(),
        };

        this.collections.insert(id, collection);
        
        return id;
    };

    // TODO: Update name
    // TODO: Update collection privacy & remove follow from all users if changed to private
    // TODO: Add tags to collection
    // TODO: Remove tags from collection
    // TODO: Remove collection & remove follow from all users
    // TODO: Add tab to collection
    // TODO: Remove tab from collection
}
