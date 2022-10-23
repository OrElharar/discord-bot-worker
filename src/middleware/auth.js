// const jwt = require("jsonwebtoken");
// const customError = require("../models/CustomError");

const auth = async (req, res, next) => {
  try {
    // const token = req.get("Authorization").replace("Bearer ", "");
    // const data = jwt.verify(token, process.env.SECRET);

    // const professor = await Professor.findOne({
    //   _id: data._id,
    //   "tokens.token": token,
    // });
    //
    // if (!professor) {
    //   const err = new customError("Unable to login", 401);
    //   next(err)
    // }
    //
    // req.token = token;
    // req.professor = professor;
    next();
  } catch (error) {
    // error.status = 401;
    // error.message = "no authentication";
    next(error);
  }
};

module.exports = auth;
