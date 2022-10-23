const jwt = require("jsonwebtoken");

module.exports.sign = (data, options = {}) => {
    return jwt.sign(data, process.env.SECRET, options);
}

