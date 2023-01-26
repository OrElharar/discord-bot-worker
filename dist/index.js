"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = __importDefault(require("./helpers/Logger"));
const port = process.env.PORT;
const app_1 = __importDefault(require("./app"));
app_1.default.listen(port, async () => {
    // await connectDb()
    Logger_1.default.info(`Server connected, port: ${port}`);
});
//# sourceMappingURL=index.js.map