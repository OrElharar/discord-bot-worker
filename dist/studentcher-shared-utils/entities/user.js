"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const entity_1 = require("./entity");
class User extends entity_1.Entity {
    constructor(id, createdAt, updatedAt, name, hashedPassword, phoneNumber, roleId, discordUserId, dateOfBirth, profilePictureUrl) {
        super(id, createdAt, updatedAt);
        this.name = name;
        this.hashedPassword = hashedPassword;
        this.discordUserId = discordUserId;
        this.roleId = roleId;
        this.dateOfBirth = dateOfBirth;
        this.profilePictureUrl = profilePictureUrl;
    }
}
exports.User = User;
//# sourceMappingURL=user.js.map