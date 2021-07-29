const express = require("express");
const router = express.Router();

// Imported Controller
const shopController = require("../controllers/shop");
const isAuth = require("../middleware/is-auth");
const WishList = require("../models/wishlist");

// Setting router to handle different paths

/**
 * @swagger
 * /:
 *  get:
 *    description : Use to request all products
 *    responses:
 *      '200':
 *          description : A successful response containing all products */
router.get("/products", shopController.getAllProducts);

// ########## Cart Routes
router.get("/cart", isAuth, shopController.getCart);

router.post("/addToCart", isAuth, shopController.addToCart);

// ########## Wishlist Routes
router.get("/wishlist", isAuth, shopController.getWishlist);

router.post("/wishlist", isAuth, shopController.addToWishlist);

// ########## Get product

router.get("/product/:id", shopController.getProduct);

module.exports = router;
