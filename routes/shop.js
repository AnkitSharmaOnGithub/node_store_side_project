const express = require("express");
const router = express.Router();

// Imported Controller
const shopController = require("../controllers/shop");
const isAuth = require("../middleware/is-auth");

// Setting router to handle different paths

/**
 * @swagger
 * /:
 *  get:
 *    description : Use to request all products
 *    responses:
 *      '200':
 *          description : A successful response containing all products */
router.get("/", shopController.getAllProducts);

// ########## Cart Routes
router.get("/getCart", isAuth, shopController.getCart);

router.post("/addToCart", isAuth, shopController.addToCart);

// ########## Wishlist Routes
router.get("/wishlist", isAuth, shopController.getWishlist);

router.post("/wishlist", isAuth, shopController.addToWishlist);


router.get("/:id", shopController.getProduct);

module.exports = router;
