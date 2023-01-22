"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresAdapter = void 0;
const studentcher_shared_utils_1 = require("../studentcher-shared-utils");
Object.defineProperty(exports, "PostgresAdapter", { enumerable: true, get: function () { return studentcher_shared_utils_1.PostgresAdapter; } });
const PgClient = new studentcher_shared_utils_1.PostgresAdapter({
    host: process.env.POSTGRES_ADDR,
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    max: 25,
    min: 4,
    connectionTimeoutMillis: 10000
});
exports.default = PgClient;
//# sourceMappingURL=postgresAdapter.js.map