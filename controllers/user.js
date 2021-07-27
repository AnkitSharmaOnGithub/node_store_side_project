const User = require("../models/user");
const Cart = require("../models/cart");
const bcrypt = require("bcryptjs");
const errorHandler = require("./error.handler");
const jwt = require("jsonwebtoken");

exports.signUp = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email: email } });
    if (user) {
      const err = new Error(`The user with the email ${email} already exists`);
      throw errorHandler(err, 404);
    }

    const hashedPassword = await bcrypt.hash(password, 14);
    const new_user = await User.create({
      email: email,
      password: hashedPassword,
    });

    const cart = await new_user.createCart();
    const result = await new_user.save();

    return res.json({
      message: "User created",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

exports.signIn = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email: email } });

    if (!user) {
      const error = new Error(`The user with this email ID does not exists`);
      throw errorHandler(error);
    }

    const password_matched = bcrypt.compare(password, user.password);

    if (!password_matched) {
      const error = new Error(`The email or password does not match`);
      throw errorHandler(error, 401);
    }

    const token = jwt.sign(
      {
        email: user.email,
        userId: user.id.toString(),
      },
      "some@secret#",
      { expiresIn: "1h" }
    );

    res.status(200).json({
      token: token,
    });
  } catch (error) {
    next(error);
  }
};
