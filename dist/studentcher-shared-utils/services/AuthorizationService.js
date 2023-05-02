"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationService = void 0;
const CustomError_1 = require("../models/CustomError");
class AuthorizationService {
    constructor(rolesRepository, cloudBucketAdapter) {
        this.rolesRepository = rolesRepository;
        this.cloudBucketAdapter = cloudBucketAdapter;
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
    async verifyAccessToQuestions(questionIds, userId) {
        if ((!Array.isArray(questionIds)) || questionIds.length === 0 || userId == null)
            throw new Error("Questions' id list and User's id must be provided");
        const isQuestionAccessible = await this.rolesRepository.isQuestionsAccessible({
            userId,
            questionIds
        });
        if (!isQuestionAccessible)
            throw new CustomError_1.CustomError("Question is not valid");
    }
    async verifyAccessToQuestionComment(commentIds, userId) {
        if ((!Array.isArray(commentIds)) || commentIds.length === 0 || userId == null)
            throw new Error("Questions' comments id list and User's id must be provided");
        const isQuestionAccessible = await this.rolesRepository.isQuestionCommentsAccessible(commentIds, userId);
        if (!isQuestionAccessible)
            throw new CustomError_1.CustomError("Access denied.");
    }
    async verifyAccessToFileOnCloud(fileName) {
        const isFileExist = await this.cloudBucketAdapter.checkIfFileExists(fileName);
        if (!isFileExist)
            throw new CustomError_1.CustomError(`File: ${fileName} not found.`);
    }
    async verifyAccessToQuizzes(quizzesIds, userId) {
        if ((!Array.isArray(quizzesIds)) || quizzesIds.length === 0 || userId == null)
            throw new Error("Quizzes' id list and User's id must be provided");
        const isQuestionAccessible = await this.rolesRepository.areQuizzesAccessible(quizzesIds, userId);
        if (!isQuestionAccessible)
            throw new CustomError_1.CustomError("Access denied.");
    }
    async verifyAccessToStartQuiz(userId) {
        const isUserInTest = await this.rolesRepository.isUserInTest({ userId });
        if (isUserInTest)
            throw new CustomError_1.CustomError("User cannot start a quiz until he complete the previous quiz he started.");
    }
    async verifyAccessToEndQuiz(userId) {
        const isUserInTest = await this.rolesRepository.isUserInTest({ userId });
        if (!isUserInTest)
            throw new CustomError_1.CustomError("User cannot end a quiz if he is not in quiz.");
    }
}
exports.AuthorizationService = AuthorizationService;
//# sourceMappingURL=AuthorizationService.js.map