const  customError = require("../models/CustomError");
const pg = require('pg');


const pgPool = new pg.Pool({
    host: process.env.POSTGRES_ADDR,
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    max: 25,
    min: 4,
    connectionTimeoutMillis: 10000
})





module.exports.callDbCmdPromise = async (sqlQuery, values=[])=>{
    const client = await pgPool.connect();
    try{
        return await client.query(sqlQuery, values) ;
    } catch(err) {
        throw err;
    }
    finally {
        await client.release();
    }
}

module.exports.callDbTransactionCmd = async (queriesArr,valuesArr)=>{
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
        return response;
    }catch(err){
        await client.query('ROLLBACK');
        throw err
    }
    finally {
        await client.release();
    }
}

