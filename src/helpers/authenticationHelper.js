// const jwt = require("jsonwebtoken");
// const customError = require("../models/CustomError");

module.exports.authenticationHandler = async (req, res, next) => {
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


module.exports.generateAndSaveAuthToken = (id)=> {
  try {
    const token = jwt.sign({ _id: id }, process.env.JWT_SECRET_USER);
    // console.log(insertToken.recordset);
  } catch (err) {
    console.log(err);
  }
}
//
module.exports.deleteToken = (userId) => {
  try {
    // console.log({ fromDeleteToken: token });

  } catch (err) {
    console.log(err);
  }
}


