"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logFinishMiddleware = exports.logReceivingMiddleware = void 0;
function logReceivingMiddleware(logger) {
    return (req, res, next) => {
        logger.info(`Rout: ${decodeURI(req.url)} (${req.method}), body: ${req.body}, query params: ${req.query.params}`);
        next();
    };
}
exports.logReceivingMiddleware = logReceivingMiddleware;
function logFinishMiddleware(logger) {
    return (req, res, next) => {
        res.on("finish", function () {
            logger.info(`${req.method}, ${decodeURI(req.url)}, ${res.statusCode}, ${res.statusMessage}`);
        });
        next();
    };
}
exports.logFinishMiddleware = logFinishMiddleware;
//# sourceMappingURL=loggerHandler.js.map