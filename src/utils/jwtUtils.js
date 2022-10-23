const jwt = require("jsonwebtoken");

module.exports.sign = (id) => {
    return jwt.sign(
        {
            _id: id
        },
        process.env.SECRET,
        {
            expiresIn: '6h'
        }
    )
}

