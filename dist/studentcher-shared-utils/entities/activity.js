"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Activity = void 0;
const entity_1 = require("./entity");
class Activity extends entity_1.Entity {
    constructor(id, createdAt, updatedAt, name, ownerId, phoneNumber, srcUrl, responsibleRoleId, videos = []) {
        super(id, createdAt, updatedAt);
        this.name = name;
        this.ownerId = ownerId;
        this.srcUrl = srcUrl;
        this.responsibleRoleId = responsibleRoleId;
        this.videos = videos;
    }
}
exports.Activity = Activity;
//# sourceMappingURL=activity.js.map