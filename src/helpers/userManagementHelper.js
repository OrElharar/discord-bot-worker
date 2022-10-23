const bcrypt = require('bcrypt');
const customError = require("../models/CustomError");
const ApiResponse = require("../models/ApiResponse");
const pgAdapter = require("../db/postgresAdapter");

const userManagementQueries = require("./postgresQueriesHelper/userManagement");
const verificationsHelper = require("./verificationsHelper");

module.exports.addUser = async(data)=>{
    try{
        verificationsHelper.verifyPasswordStrength(data.password)
        const hashedPassword = await bcrypt.hash(data.password, 12);
        const insertUserQuery = userManagementQueries.getInsertUserQuery();
        const insertUserValues = [data.id, data.name, hashedPassword, data.roleId];
        const response = await pgAdapter.callDbCmdPromise(insertUserQuery, insertUserValues);
        const user = response.rows[0];
        return { response: new ApiResponse(true, {user}) }
    }catch (err){
        if (err.constraint === "hyperactive_users_pkey")
            return {err: new customError("Email already registered in the system.")}
        return {err}
    }
}