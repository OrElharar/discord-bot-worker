"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plan = void 0;
const entity_1 = require("./entity");
class Plan extends entity_1.Entity {
    constructor(id, createdAt, updatedAt, name) {
        super(id, createdAt, updatedAt);
        this.name = name;
    }
}
exports.Plan = Plan;
//# sourceMappingURL=plan.js.map