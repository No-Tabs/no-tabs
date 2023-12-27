import {
    Principal,
    StableBTreeMap,
    Vec,
    ic,
} from "azle";

import { User } from "./user.entities";
import { CollectionAlreadyAddedError, UserAlreadyExistsError, UserDoesNotExistError, UsernameAlreadyExistsError } from "./user.errors";

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

        if (!user) throw new UserDoesNotExistError(id);
    
        return user;
    }

    public exists(id: Principal): boolean {
        return this.users.containsKey(id);
    }

    public create(id: Principal, data: CreateUserData): void {
        const exists = this.exists(id);

        if (exists) throw new UserAlreadyExistsError(id);

        const existingUsername = this.users
            .values()
            .find((user) => user.username === data.username);

        if (existingUsername) throw new UsernameAlreadyExistsError(existingUsername.username);

        const user: User = {
            id,
            username: data.username,
            follow: [],
            createdAt: ic.time(),
        };

        this.users.insert(id, user);
    }

    public delete(id: Principal): void {
        const exists = this.exists(id);

        if (!exists) throw new UserDoesNotExistError(id);

        // TODO: Remove workspaces where is the unique owner

        this.users.remove(id);
    }
    
    public addFollow(id: Principal, collection: Principal): void {
        const user = this.users.get(id).Some;

        if (!user) throw new UserDoesNotExistError(id);

        const existingFollow = user.follow.find((f) => f === collection);

        if (existingFollow) throw new CollectionAlreadyAddedError(collection);

        // TODO: Validate that followId is a valid collection & is not private

        user.follow.push(collection);

        this.users.insert(id, user);
    }
}
