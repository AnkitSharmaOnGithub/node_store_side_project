const express = require("express");
const router = express.Router();

// Imported Controller
const shopController = require("../controllers/shop");

// Setting router to handle different paths

/**
 * @swagger
 * /:
 *  get:
 *    description : Use to request all products
 *    responses:
 *      '200':
 *          description : A successful response containing all products */
router.get("/", shopController.getIndex);

module.exports = router;
