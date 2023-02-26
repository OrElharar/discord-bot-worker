"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userActivityTracker = exports.PgClient = exports.PostgresAdapter = void 0;
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
    async callDb(dbCommand) {
        const client = await this.pgPool.connect();
        try {
            return await client.query(dbCommand.query, dbCommand.values);
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
    async callDbTransactionCmd(dbCommands) {
        if (dbCommands.length === 0)
            throw new Error("dbCommands' length must be greater then 0");
        const client = await this.pgPool.connect();
        try {
            const response = {};
            await client.query('BEGIN ');
            for (let i = 0; i < dbCommands.length; i++) {
                response[i] = await client.query(dbCommands[i].query, dbCommands[i].values);
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
    password: process.env.DB_PASSWORD || "",
    max: 25,
    min: 4,
    connectionTimeoutMillis: 10000
});
exports.PgClient = PgClient;
const userActivityTracker = async (req, res, next) => {
    try {
        const userActivityQuery = `insert into user_activity_monitoring (userId, route, request_values)
                                    VALUES ($1, $2, $3)    ;`;
        const userActivityValues = [res.locals.userId, req.originalUrl, Object.assign({}, req.body)];
        await PgClient.callDbCmd(userActivityQuery, userActivityValues);
        next();
    }
    catch (err) {
        return next(err);
    }
};
exports.userActivityTracker = userActivityTracker;
//# sourceMappingURL=PostgresAdapter.js.map