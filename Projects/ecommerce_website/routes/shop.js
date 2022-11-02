const path = require("path");

const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const shopController = require("../controllers/shop");
const isAuth = require("../middleware/is-auth");

router.get("/", shopController.getIndexPage);

router.get("/products", shopController.getProducts);

router.get("/products/:productId", shopController.getProduct);

router.post("/comment/:productId", [
  body(
    "activeComment",
    "Comment should not be empty and minimum 3 Character long"
  )
    .trim()
    .isString()
    .not()
    .isEmpty()
    .isLength({ min: 3 }),

  body("rating", "Rate the product between 1 and 5").isFloat({
    min: 1,
    max: 5,
  }),
  shopController.addComment,
]);

router.get("/cart", shopController.getCart);
router.post("/cart", shopController.postCart);

router.post("/delete-item-cart", shopController.postCartDeleteProduct);

router.get("/checkout", isAuth, shopController.getCheckout);

router.get("/checkout/success", shopController.postOrder);
router.get("/checkout/cancel", shopController.getCheckout);

router.get("/orders", shopController.getOrders);

// router.post('/create-order', shopController.postOrder);

router.get("/orders/:orderId", isAuth, shopController.getInvoice);

module.exports = router;
