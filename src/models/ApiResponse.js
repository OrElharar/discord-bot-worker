
class ApiResponse {

    constructor(success, data) {
        this.name = "customError";
        this.success = success;
        this.data = data;
    }
}

module.exports = ApiResponse;

