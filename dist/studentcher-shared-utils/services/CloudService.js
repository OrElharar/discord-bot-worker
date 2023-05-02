"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudService = void 0;
const uuid = __importStar(require("uuid"));
const Validations_1 = require("../helpers/Validations");
const CustomError_1 = require("../models/CustomError");
const ApiResponse_1 = require("../models/ApiResponse");
const Constants_1 = require("../helpers/Constants");
const process = __importStar(require("process"));
class CloudService {
    constructor(cloudBucketAdapter) {
        this.cloudBucketAdapter = cloudBucketAdapter;
    }
    async generatePreSignUrl(data) {
        try {
            const { result, message } = Validations_1.Validations.areFieldsProvided(["fileName", "action"], data);
            if (!result)
                return { err: new CustomError_1.CustomError(message) };
            if (CloudService.signedUrlActionsIndex[data.action] == null)
                return { err: new CustomError_1.CustomError(`Invalid action: ${data.action}`) };
            if (data.directory != null && (CloudService.directoriesIndex[data.directory] == null))
                return { err: new CustomError_1.CustomError(`Invalid directory ${data.directory}`) };
            if (data.action === Constants_1.Constants.CLOUD_STORAGE_PRE_SIGNED_URL_WRITE_ACTION) {
                if (typeof data.fileName !== "string" || data.fileName.indexOf(".") === -1)
                    return { err: new CustomError_1.CustomError("Invalid file name") };
                const fileExtension = data.fileName.split('.').pop();
                if (CloudService.filesExtensionIndex[fileExtension] == null)
                    return { err: new CustomError_1.CustomError(`File extension ${fileExtension} is forbidden.`) };
                data.fileName = `${data.fileName.split('.')[0]}_${CloudService.idGenerator()}.${fileExtension}`;
            }
            const fileName = data.directory == null ? data.fileName : `${CloudService.directoriesIndex[data.directory]}/${data.fileName}`;
            const preSignedUrl = await this.cloudBucketAdapter.getSignedUrl(fileName, data.action);
            return { response: new ApiResponse_1.ApiResponse(true, { preSignedUrl, fileName }) };
        }
        catch (err) {
            return { err };
        }
    }
    async getBucketBilling() {
        const region = process.env.CLOUD_BUCKET_REGION;
        const billing = await this.cloudBucketAdapter.getBucketBilling(region);
        return billing;
    }
    async getActivitiesVideosOnCloud() {
        return this.cloudBucketAdapter.getFileNamesFromBucketByPrefix(Constants_1.Constants.CLOUD_ACTIVITIES_VIDEOS_BUCKET_PREFIX);
    }
}
exports.CloudService = CloudService;
CloudService.idGenerator = uuid.v1;
CloudService.directoriesIndex = {
    questions: "stack-overflow-module/questions",
    answers: "stack-overflow-module/answers",
    activities: Constants_1.Constants.CLOUD_ACTIVITIES_VIDEOS_BUCKET_PREFIX,
    interviewQuestions: 'interviewer-module/questions',
    interviewAnswers: 'interviewer-module/answers'
};
CloudService.signedUrlActionsIndex = {
    [Constants_1.Constants.CLOUD_STORAGE_PRE_SIGNED_URL_READ_ACTION]: true,
    [Constants_1.Constants.CLOUD_STORAGE_PRE_SIGNED_URL_WRITE_ACTION]: true
};
CloudService.filesExtensionIndex = {
    "mp4": true,
    "webm": true
};
//# sourceMappingURL=CloudService.js.map