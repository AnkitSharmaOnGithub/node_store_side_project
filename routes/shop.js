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

router.patch("/cart", shopController.updateCart);

// ########## Wishlist Routes
router.get("/wishlist", isAuth, shopController.getWishlist);

router.post("/wishlist", isAuth, shopController.addToWishlist);

// ########## Get product

router.get("/product/:id", shopController.getProduct);

// ########## Stripe Routes

router.post("/payment", shopController.createSession);

router.get("/payment_success", shopController.createSession);

router.get("/payment_cancel", shopController.createSession);

// ########## Coupon Routes

router.get("/coupon", shopController.getCoupon);

module.exports = router;
