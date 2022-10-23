
class customError extends Error {

    constructor(message, status = 400, code = "000000") {
        super();
        this.name = "customError";
        this.message = message;
        this.code = code;
        this.status = status;
        this.extra = {};
    }

}

module.exports = customError;

