"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationService = void 0;
const CustomError_1 = require("../models/CustomError");
const RolesRepository_1 = require("../repositories/RolesRepository");
class AuthorizationService {
    constructor() {
        this.rolesRepository = new RolesRepository_1.RolesRepository();
    }
    async checkUserPermission({ userId, permissionField }) {
        try {
            if (userId == null)
                return { err: new Error("Cannot verify user's permission without user id.") };
            const isUserPermissionAllowed = await this.rolesRepository.isUserPermissionAllowed({ userId, permissionField });
            if (!isUserPermissionAllowed)
                return { response: false };
            return { response: true };
        }
        catch (err) {
            return { err };
        }
    }
    verifyUserPermission(permissionField = "") {
        return async (req, res, next) => {
            try {
                const userId = res.locals.userId;
                const { err, response: isUserPermissionAllowed } = await this.checkUserPermission({ userId, permissionField });
                if (err != null || !isUserPermissionAllowed)
                    return next(new CustomError_1.CustomError("User not having needed permissions, access denied"));
                next();
            }
            catch (err) {
                next(err);
            }
        };
    }
    verifyAccessToRole() {
        return async (req, res, next) => {
            try {
                const roleId = req.body.roleId;
                if (roleId == null)
                    return next();
                const isRoleAccessible = await this.rolesRepository.isRoleAccessible({ userId: res.locals.userId, roleId });
                if (!isRoleAccessible)
                    return next(new CustomError_1.CustomError("Role is not valid"));
                next();
            }
            catch (err) {
                next(err);
            }
        };
    }
}
exports.AuthorizationService = AuthorizationService;
//# sourceMappingURL=AuthorizationService.js.map