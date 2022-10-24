
class ApiResponse {
    constructor(success, data = {}) {
        this.success = success;
        this.data = data;
    }
}

module.exports = ApiResponse;

