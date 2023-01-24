"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PgClient = exports.PostgresAdapter = void 0;
const pg_1 = __importDefault(require("pg"));
class PostgresAdapter {
    constructor({ host, database, user, password, max = 25, min = 4, connectionTimeoutMillis = 10000 }) {
        this.pgPool = new pg_1.default.Pool({ host, database, user, password, max, min, connectionTimeoutMillis });
    }
    async callDbCmd(sqlQuery, values = []) {
        const client = await this.pgPool.connect();
        try {
            return await client.query(sqlQuery, values);
        }
        catch (err) {
            throw err;
        }
        finally {
            await client.release();
        }
    }
    async callDbTransaction(queriesArr, valuesArr) {
        if (queriesArr.length !== valuesArr.length)
            throw new Error("queriesArr.length !== valuesArr.length in callDbTransactionCmd");
        const client = await this.pgPool.connect();
        try {
            const response = {};
            await client.query('BEGIN ');
            for (let i = 0; i < queriesArr.length; i++) {
                response[i] = await client.query(queriesArr[i], valuesArr[i]);
            }
            await client.query('COMMIT ');
            return response;
        }
        catch (err) {
            await client.query('ROLLBACK');
            throw err;
        }
        finally {
            await client.release();
        }
    }
}
exports.PostgresAdapter = PostgresAdapter;
const PgClient = new PostgresAdapter({
    host: process.env.POSTGRES_ADDR || "local",
    database: process.env.DB_NAME || "db",
    user: process.env.DB_USERNAME || "user",
    password: process.env.DB_PASSWORD || "password",
    max: 25,
    min: 4,
    connectionTimeoutMillis: 10000
});
exports.PgClient = PgClient;
//# sourceMappingURL=PostgresAdapter.js.map