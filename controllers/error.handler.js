module.exports = (err, statusCode) => {
  err.statusCode = 500;

  if (statusCode) {
    err.statusCode = statusCode;
  }
  return err;
};
