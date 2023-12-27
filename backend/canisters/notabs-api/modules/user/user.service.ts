import {
    Principal,
    StableBTreeMap,
    Vec,
    ic,
} from "azle";

import { User } from "./user.entities";
import { CollectionAlreadyAddedError, UserAlreadyExistsError, UserDoesNotExistError } from "./user.errors";

export type CreateUserData = {
    username: string;
}

export class UserService {
    private users = StableBTreeMap<Principal, User>(0);

    public getAll(): Vec<User> {
        return this.users.values();
    }

    public get(id: Principal): User {
        const user = this.users.get(id).Some;

        if (!user) throw new UserDoesNotExistError(id.toString());
    
        return user;
    }

    public create(id: Principal, data: CreateUserData): void {
        const existingUser = this.users.get(id).Some;

        if (existingUser) throw new UserAlreadyExistsError(id.toString());

        const existingUsername = this.users
            .values()
            .find((user) => user.username === data.username);

        if (existingUsername) throw new UserAlreadyExistsError(existingUsername.username);

        const user: User = {
            id,
            username: data.username,
            follow: [],
            createdAt: ic.time(),
        };

        this.users.insert(id, user);
    }

    public delete(id: Principal): void {
        const user = this.users.get(id).Some;

        if (!user) throw new UserDoesNotExistError(id.toString());

        // TODO: Remove workspaces which is the unique owner

        this.users.remove(id);
    }
    
    public addFollow(id: Principal, collection: Principal): void {
        const user = this.users.get(id).Some;

        if (!user) throw new UserDoesNotExistError(id.toString());

        const existingFollow = user.follow.find((f) => f === collection);

        if (existingFollow) throw new CollectionAlreadyAddedError(collection.toString());

        // TODO: Validate that followId is a valid collection & is not private

        user.follow.push(collection);

        this.users.insert(id, user);
    }
}
