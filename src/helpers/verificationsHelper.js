const customError = require("../models/CustomError")

module.exports.verifyPasswordStrength = (value)=>{
    if(value == null)
        throw new customError("Password must be provided");
    if (value.includes(" "))
        throw new customError("Password could not includes space");
    const passwordRegex =  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/;
    if (!passwordRegex.test(value))
        throw new customError("Password must contain capital and regular characters, numbers and must have at least 6 characters");
}