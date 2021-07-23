const express = require("express");
const router = express.Router();

// Imported Controller
const shopController = require("../routes/shop");

// Setting router to handle different paths
router.get("/", shopController.getIndex);

module.exports = router;
