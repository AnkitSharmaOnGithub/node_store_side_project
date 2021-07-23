exports.getIndex = (req, res, next) => {
  console.log(req.url);
  res.send("Index is working");
};
