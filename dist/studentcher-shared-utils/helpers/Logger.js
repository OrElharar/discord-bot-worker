"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    constructor(owner) {
        this.owner = owner;
    }
    debug(message) {
        console.log(`${this.owner} - DEBUG - ${message}`);
    }
    info(message) {
        console.log(`${this.owner} - INFO - ${message}`);
    }
    error(message) {
        console.log(`${this.owner} - ERROR - ${message}`);
    }
    warn(message) {
        console.log(`${this.owner} - WARN - ${message}`);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map