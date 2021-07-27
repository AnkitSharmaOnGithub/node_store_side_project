const jwt = require("jsonwebtoken");
const errorHandler = require("../controllers/error.handler");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization").split(" ")[1];

  if (!authHeader) {
    const error = new Error("Kindly provide the Auth Header with the request");
    throw errorHandler(error, 401);
  }

  const token = authHeader;
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, "some@secret#");
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }

  if (!decodedToken) {
    const error = new Error("Not authenticated");
    error.statusCode = 401;
    throw error;
  }
  req.session.userId = decodedToken.userId;
  next();
};