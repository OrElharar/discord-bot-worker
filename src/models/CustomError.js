const ApiResponse = require("./ApiResponse")
class customError extends Error {

    constructor(message, status = 400, code = "000000") {
        super();
        this.name = "customError";
        this.message = message;
        this.code = code;
        this.status = status;
        this.extra = {};
    }

    serialize(){
        return new ApiResponse (false, {err: {message: this.message, code: this.code}})
    }

}

module.exports = customError;

