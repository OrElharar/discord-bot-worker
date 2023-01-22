"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomError = void 0;
const ApiResponse_1 = require("./ApiResponse");
class CustomError extends Error {
    constructor(message, status = 400, code = "000000") {
        super();
        this.name = "CustomError";
        this.message = message;
        this.code = code;
        this.status = status;
        this.extra = {};
    }
    serialize() {
        return new ApiResponse_1.ApiResponse(false, { err: { message: this.message, code: this.code } });
    }
}
exports.CustomError = CustomError;
//# sourceMappingURL=CustomError.js.map