const customError = require("../models/CustomError");

const errorHandler = (error, req, res, next) => {
    console.log(error.message);
    const err = error.constructor.name === "customError" ? error : new customError("Error");
    return res.status(400).json(err.serialize());
}

module.exports = errorHandler