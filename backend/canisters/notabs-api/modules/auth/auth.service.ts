import { ic } from "azle";
import { NotAuthenticatedError } from "./auth.errors";
import { UserService } from "../user/user.service";
import { UserDoesNotExistError } from "../user/user.errors";

export class AuthService {
    constructor(private readonly userService: UserService) {}

    validate() {
        const user = ic.caller();

        if (user.isAnonymous()) throw new NotAuthenticatedError(user);

        const exist = this.userService.exists(user);

        if (!exist) throw new UserDoesNotExistError(user);
    }
}
