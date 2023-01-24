"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.whiteListHandler = void 0;
const CustomError_1 = require("../models/CustomError");
const Constants_1 = require("../helpers/Constants");
const whitelistedAddress = process.env.WHITE_LIST_ADDRESS;
function whiteListHandler(req, res, next) {
    if (req.socket.localAddress !== whitelistedAddress)
        return next(new CustomError_1.CustomError("Forbidden!", 403));
    const userId = req.headers[Constants_1.Constants.PROXY_AUTHORIZED_HEADER];
    if (userId == null)
        return next(new CustomError_1.CustomError("Committed UserId not provided", 403));
    res.locals.userId = userId;
    next();
}
exports.whiteListHandler = whiteListHandler;
//# sourceMappingURL=whiteListHandler.js.map