const  customError = require("../models/CustomError");
const pg = require('pg');


const exports = module.exports = {};

const pgPool = new pg.Pool({
    host: process.env.POSTGRES_ADDR,
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    max: 25,
    min: 4,
    connectionTimeoutMillis: 10000
})





exports.callDbCmdPromise = async (sqlQuery, values=[])=>{
    const client = await pgPool.connect();
    try{
        return { response: await client.query(sqlQuery, values) };
    } catch(err) {
        return {err};
    }
    finally {
        await client.release();
    }
}

exports.callDbTransactionCmd = async (queriesArr,valuesArr)=>{
    if(queriesArr.length !== valuesArr.length)
        return new customError("queriesArr.length !== valuesArr.length in callDbTransactionCmd", 500)
    const client = await pgPool.connect();
    try{
        const response = {}
        await client.query('BEGIN ');
        for(let i =0; i< queriesArr.length; i++){
            response[i] = await client.query(queriesArr[i], valuesArr[i]);
        }
        await client.query('COMMIT ');
        return {response};
    }catch(err){
        await client.query('ROLLBACK');
        return {err}
    }
    finally {
        await client.release();
    }
}

