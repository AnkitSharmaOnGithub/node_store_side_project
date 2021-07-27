const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");

/** paths:
    /admin/product:
        post:
            summary : Create a product using the params
            parameters:
                - title: string
                  in: path
                  required: true
                  schema:
                    type : integer
                    format: int64
            responses:
                '200':
                    description: A JSON array of products and a message
*/

router.get('/product',isAuth, adminController.getProducts)

router.post("/product", isAuth, adminController.postProduct);

router.get("/product/:id", isAuth, adminController.getProduct);

router.put("/product/:id", isAuth, adminController.updateProduct);

router.delete("/product/:id", isAuth, adminController.deleteProduct);

module.exports = router;
