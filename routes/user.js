const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const isAuth = require("../middleware/is-auth");

router.post("/signUp", userController.signUp);

router.post("/signIn", userController.signIn);

module.exports = router;
