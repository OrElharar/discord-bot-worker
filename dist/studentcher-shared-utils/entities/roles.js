"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = void 0;
const entity_1 = require("./entity");
class Role extends entity_1.Entity {
    constructor(id, createdAt, updatedAt, name) {
        super(id, createdAt, updatedAt);
        this.name = name;
    }
}
exports.Role = Role;
//# sourceMappingURL=roles.js.map