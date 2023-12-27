import { Principal, Record, StableBTreeMap, Vec, bool, ic, text } from "azle";
import { Collection, CollectionMember, Tab } from "./collection.entities";
import { generate, isEqual } from "../../../../packages/principal";
import { CollectionDoesNotExistError, CollectionTabDoesNotExistError, CollectionUserIsNotMemberError } from "./collection.errors";

export const CreateCollectionData = Record({
    name: text,
    description: text,
    private: bool,
    tags: Vec(text),
});

export type CreateCollectionData = typeof CreateCollectionData.tsType;

export const AddTabData = Record({
    name: text,
    url: text,
});

export type AddTabData = typeof AddTabData.tsType;

export class CollectionService {
    private collections = StableBTreeMap<Principal, Collection>(2);

    public get(id: Principal): Collection {
        const collection = this.collections.get(id).Some;

        if (!collection) {
            throw new CollectionDoesNotExistError(id);
        }

        return collection;
    }

    public exists(id: Principal): boolean {
        return this.collections.containsKey(id);
    }
    
    public create(createdBy: Principal, workspace: Principal, data: CreateCollectionData): Principal {
        // TODO: Validate that workspace exists
        // TODO: Validate that createdBy is in workspace
        // TODO: Validate that collection name is not duplicated for the createdBy
        // TODO: Validate that tags are not duplicated

        const id = generate();

        const member: CollectionMember = {
            id: createdBy,
            role: {"Admin": null},
        };

        const collection: Collection = {
            id,
            name: data.name,
            description: data.description,
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
    
    public addTab(requesterId: Principal, collectionId: Principal, data: AddTabData): void {
        const collection = this.collections.get(collectionId).Some;

        if (!collection) {
            throw new CollectionDoesNotExistError(collectionId);
        }

        const isContributor = collection.members.find((member) => isEqual(member.id, requesterId));

        if (!isContributor) {
            throw new CollectionUserIsNotMemberError(requesterId);
        }

        const tabId = generate();

        const tab: Tab = {
            id: tabId,
            name: data.name,
            url: data.url,
            createAt: ic.time(),
            updatedAt: ic.time(),
        };

        collection.tabs.push(tab);

        this.collections.insert(collectionId, collection);
    }

    public removeTab(requesterId: Principal, tabId: Principal): void {
        const collections = this.collections.values().filter((collection) => collection.members.find((member) => isEqual(member.id, requesterId)));

        if (collections.length === 0) {
            throw new CollectionTabDoesNotExistError(tabId);
        }
        
        const collection = collections.flat().find((collection) => collection.tabs.find((tab) => isEqual(tab.id, tabId)));

        if (!collection) {
            throw new CollectionTabDoesNotExistError(tabId);
        }

        collection.tabs = collection.tabs.filter((tab) => !isEqual(tab.id, tabId));

        this.collections.insert(collection.id, collection);
    }
}
