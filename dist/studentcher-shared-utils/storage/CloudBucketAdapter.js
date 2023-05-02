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
exports.CloudBucketAdapter = void 0;
const AWS = __importStar(require("aws-sdk"));
const crypto = __importStar(require("crypto"));
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const Constants_1 = require("../helpers/Constants");
const ApiResponse_1 = require("../models/ApiResponse");
const stream_1 = require("stream");
const iv = Buffer.alloc(16, 0);
const process = __importStar(require("process"));
const getEncryptionKey = () => {
    const encryptionKey = process.env.ENCRYPTION_KEY_SECRET;
    if (encryptionKey == null)
        throw new Error("ENCRYPTION_KEY_SECRET is not provided");
    let result = Buffer.from(encryptionKey, 'base64');
    if (result.length !== 32) {
        const padding = Buffer.alloc(32 - result.length, 0);
        result = Buffer.concat([result, padding]);
    }
    return result;
};
const encryptionKey = getEncryptionKey();
const algorithm = 'aes-256-cbc';
const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);
const bucketName = process.env.CLOUD_BUCKET_NAME || "";
const accessKeyId = process.env.CLOUD_BUCKET_ACCESS_KEY || "";
const secretAccessKey = process.env.CLOUD_BUCKET_ACCESS_SECRET || "";
const region = process.env.CLOUD_BUCKET_REGION;
const s3 = new client_s3_1.S3Client({
    credentials: {
        accessKeyId,
        secretAccessKey
    },
    region
});
const s3v2 = new AWS.S3({
    credentials: {
        accessKeyId,
        secretAccessKey
    }
});
const costExplorer = new AWS.CostExplorer({ region });
class CloudBucketAdapter {
    constructor() {
        this.s3Client = s3;
        this.s3ClientV2 = s3v2;
    }
    async generateUploadId(fileObj) {
        const createUploadResponse = await this.s3Client.send(new client_s3_1.CreateMultipartUploadCommand({
            Key: fileObj.filename,
            Bucket: bucketName,
            ContentType: fileObj.contentType
        }));
        return createUploadResponse.UploadId;
    }
    async uploadPartialFile(fileObj, retry = 1) {
        try {
            const params = {
                Key: fileObj.filename,
                Bucket: bucketName,
                Body: fileObj.body,
                UploadId: fileObj.uploadId,
                PartNumber: fileObj.uploadIndex
            };
            const command = new client_s3_1.UploadPartCommand(params);
            return await this.s3Client.send(command);
        }
        catch (err) {
            if (retry < 5)
                return await this.uploadPartialFile(fileObj, ++retry);
            throw err;
        }
    }
    async getSignedUrl(fileName, action = "READ") {
        const VALID_DURATION_IN_SEC = 600;
        if (action === Constants_1.Constants.CLOUD_STORAGE_PRE_SIGNED_URL_READ_ACTION)
            return await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, new client_s3_1.GetObjectCommand({
                Bucket: bucketName,
                Key: fileName
            }), { expiresIn: VALID_DURATION_IN_SEC });
        if (action === Constants_1.Constants.CLOUD_STORAGE_PRE_SIGNED_URL_WRITE_ACTION)
            return await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, new client_s3_1.PutObjectCommand({
                Bucket: bucketName,
                Key: fileName
            }), { expiresIn: VALID_DURATION_IN_SEC });
        throw new Error("Invalid action provided.");
    }
    // TODO - test it. due to lack of network connections I was not able to test it propperly.
    async uploadFile(req) {
        const passThrough = new stream_1.PassThrough();
        const params = {
            Bucket: bucketName,
            Key: "test200MB.zip",
            Body: passThrough,
            ContentEncoding: "base64"
        };
        req.pipe(CloudBucketAdapter.cipher).pipe(passThrough);
        const upload = this.s3ClientV2.upload(params);
        upload.on('httpUploadProgress', (progress) => {
            // Log progress events
            console.log(`Upload progress: ${progress.loaded}/${progress.total}`);
        });
        try {
            const data = await new Promise((resolve, reject) => {
                upload.send((err, data) => {
                    if (err)
                        reject(err);
                    else
                        resolve(data);
                });
            });
            // Upload succeeded
            console.log(`File successfully uploaded to ${data.Location}`);
            return { response: new ApiResponse_1.ApiResponse(true, {}) };
        }
        catch (err) {
            return { err };
        }
    }
    async checkIfFileExists(fileName) {
        const params = {
            Bucket: bucketName,
            Key: `${fileName}`,
        };
        try {
            const res = await this.s3ClientV2.headObject(params).promise();
            return res != null;
        }
        catch (error) {
            if (['Forbidden', 'NotFound'].includes(error.code)) {
                return false;
            }
            throw error;
        }
    }
    // async  checkIfFilesExist(fileNamesList: string[]): Promise<void> {
    //     const params: AWS.S3.Types.HeadObjectRequest[] = fileNamesList.map((fileName) => ({
    //         Bucket: bucketName,
    //         Key: fileName,
    //     }));
    //     const responses = await Promise.all(
    //         params.map((param) => s3v2.headObject(param).promise())
    //     );
    //
    //     const allFilesExist = responses.every((res) => res != null);
    //
    //     if (!allFilesExist) {
    //         const missingFiles = fileNamesList.filter((fileName, index) => responses[index] == null);
    //         throw new CustomError(`The following files do not exist in S3: ${missingFiles.join(', ')}`);
    //     }
    // }
    static getBucketBillingParams(startDate, endDate) {
        return {
            Granularity: 'MONTHLY',
            Metrics: ['UnblendedCost'],
            TimePeriod: {
                Start: startDate.toISOString().slice(0, 10),
                End: endDate.toISOString().slice(0, 10),
            },
            Filter: {
                And: [
                    {
                        Dimensions: {
                            Key: 'USAGE_TYPE',
                            Values: ['S3 Object Transition-Infrequent Access'],
                        },
                    },
                    {
                        Dimensions: {
                            Key: 'SERVICE',
                            Values: ['Amazon Simple Storage Service'],
                        },
                    },
                    {
                        Dimensions: {
                            Key: 'LINKED_ACCOUNT',
                            Values: [process.env.CLOUD_AWS_ACCOUNT_ID],
                        },
                    },
                ],
            },
            GroupBy: [
                {
                    Type: 'DIMENSION',
                    Key: 'USAGE_TYPE'
                }
            ]
        };
    }
    async getBucketBilling(regionName) {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const params = CloudBucketAdapter.getBucketBillingParams(start, end);
        const costExplorer = new AWS.CostExplorer({
            region: regionName,
            credentials: {
                accessKeyId,
                secretAccessKey
            }
        });
        const response = await costExplorer.getCostAndUsage(params).promise();
        const cost = response.ResultsByTime[0].Total.UnblendedCost.Amount;
        return Number(cost);
    }
    async getFileNamesFromBucketByPrefix(prefix) {
        const objects = await this.s3ClientV2.listObjectsV2({
            Bucket: bucketName,
            Prefix: prefix + '/'
        }).promise();
        return objects.Contents.map(({ Key }) => Key);
    }
}
exports.CloudBucketAdapter = CloudBucketAdapter;
CloudBucketAdapter.cipher = cipher;
//# sourceMappingURL=CloudBucketAdapter.js.map