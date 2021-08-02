const Cart = require("../models/cart");
const CartItem = require("../models/cart-items");
const Product = require("../models/product");
const User = require("../models/user");
const WishList = require("../models/wishlist");

const errorHandler = require("./error.handler");
const { QueryTypes, Op } = require("sequelize");
const sequelize = require("../utils/database");

// Stripe Initialization
const Helper = require("../utils/helper");
const ChildCoupon = require("../models/child-coupon");

// Get config from .dotenv
require("dotenv").config();
STRIPE_PVT_KEY = process.env.STRIPE_PVT_KEY;
const stripe = require("stripe")(STRIPE_PVT_KEY);

exports.getAllProducts = (req, res, next) => {
  Product.findAll()
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.id;
  let productInCart = false;

  Product.findByPk(prodId, {
    attributes: ["id", "title", "price", "description", "image"],
  })
    .then((product) => {
      if (!product) {
        const err = new Error(`The product with ID ${prodId} was not found`);
        throw errorHandler(err, 404);
      }

      // Check if the product is already in cart. If yes, set some flag
      Product.findAll({
        where: { id: prodId },
        attributes: ["id"],
        include: {
          model: Cart,
          through: { attributes: ["quantity", "cartId", "productId"] },
        },
        raw: true,
      })
        .then((cartItems) => {
          if (cartItems.length > 0) {
            // Check if the product Id in cart is equal to the productId, we are trying to add to cart
            if (cartItems[0]["carts.cartitem.productId"]) {
              if (cartItems[0]["carts.cartitem.productId"] == prodId) {
                // If product is not in cart, then set flag
                productInCart = true;
              }
            }
          }

          return res.json({
            productInCart: productInCart,
            message: "Product found",
            product: product,
          });
        })
        .catch((err) => {
          throw errorHandler(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};

exports.addToCart = async (req, res, next) => {
  const productId = req.body.id;
  const userId = +req.session.userId;

  try {
    // Get user cart
    const cartProducts = await sequelize.query(
      `
        select
        c.id as 'cart_id',
        u.id as 'user_id',
        p.id as 'product_id',
        p.title as 'product_title',
        p.price as 'product_price',
        p.image as 'product_image',
        ci.quantity as 'cart_quantity',
        ci.totalAmount as 'total_amount'
      from
        carts c
      left join users u
      on
        u.id = c.userId
      left join cartitems ci on
        c.id = ci.cartId
      left join products p
      on
        p.id = ci.ProductId
        where ci.quantity IS NOT NULL
        AND
        u.id = ${userId}
    `,
      { type: QueryTypes.SELECT },
      { logging: console.log }
    );

    let addCartResult;

    let exists_in_cart = false;

    for (const cartProduct of cartProducts) {
      exists_in_cart = false;
      // Check if the product exists in the cart

      if (parseInt(cartProduct.product_id) == parseInt(productId)) {
        // If yes, then increment the quantity

        addCartResult = await CartItem.update(
          {
            quantity: parseInt(cartProduct.cart_quantity) + 1,
            totalAmount:
              parseInt(cartProduct.product_price) *
              (parseInt(cartProduct.cart_quantity) + 1),
          },
          {
            where: {
              [Op.and]: [
                { cartId: +cartProduct.cart_id },
                { ProductId: +cartProduct.product_id },
              ],
            },
          },
          { logging: console.log }
        );
        exists_in_cart = true;
      }

      if (exists_in_cart) {
        break;
      }
    }
    // If not, then add it to cart and set value as 1
    if (!exists_in_cart) {
      // console.log("Adding to cart");

      // Fetch cart_id for the user
      const userCartId = await sequelize.query(
        `select id from carts where UserId  =  ${userId}`,
        { type: QueryTypes.SELECT },
        { logging: console.log }
      );

      // Get Product price to insert in DB
      const product_to_add = await Product.findOne(
        {
          where: { id: parseInt(productId) },
          attributes: ["price"],
          raw: true,
        },
        { logging: console.log }
      );

      addCartResult = await CartItem.create(
        {
          quantity: 1,
          cartId: parseInt(userCartId[0].id),
          ProductId: parseInt(productId),
          price: product_to_add.price,
          totalAmount: product_to_add.price * 1,
        }
        // { logging: console.log }
      );
    }

    res.status(200).json({
      status: "success",
      data: addCartResult,
    });
  } catch (error) {
    next(error);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const userId = req.session.userId;

    const cart = await Cart.findAll({
      attributes: [],
      where: { userId: userId },
      include: [
        {
          attributes: ["id", "title", "price", "image"],
          model: Product,
          through: { attributes: ["quantity", "productId", "totalAmount"] },
        },
      ],
    });

    res.json({
      message: "success",
      data: cart,
    });
  } catch (err) {
    res.json(err);
  }
};

exports.updateCart = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const quantity = req.body.quantity;
    const productId = +req.body.productId;

    if (!quantity) {
      const error = new Error(`Quantity is not present in the request`);
      throw errorHandler(error);
    }

    if (!productId) {
      const error = new Error(`ProductId is not present in the request`);
      throw errorHandler(error);
    }

    const product = await Product.findOne({
      attributes: ["id", "price"],
      where: { id: productId },
      raw: true,
    });

    if (+product.id !== +productId) {
      const error = new Error(`Product Id is not present in the cart`);
      throw errorHandler(error);
    }

    // Set the new totalAmount
    const totalAmount = quantity * +product.price;

    const updateResult = await sequelize.query(
      `
        UPDATE cartitems ci
        SET
        ci.quantity = ${quantity},
        ci.totalAmount = ${totalAmount}
        WHERE
        ci.ProductId = ${productId}
      `,
      { type: QueryTypes.UPDATE }
    );

    res.json({
      message: "success",
      data: updateResult,
    });
  } catch (err) {
    next(err);
  }
};

exports.test = async (req, res, next) => {
  let data = await Cart.findAll({
    attributes: [],
    where: { id: 2 },
    include: [
      {
        attributes: ["title", "price"],
        // where: { id: 1 },
        model: Product,
      },
    ],
  });

  return res.json({
    data: data,
  });
};

exports.getWishlist = async (req, res, next) => {
  try {
    const productId = req.body.id;
    const userId = req.session.userId;

    const wishlist = await WishList.findAll({});

    res.status(200).json({
      message: "Fetched wishlist",
      data: wishlist,
    });
  } catch (err) {
    next(err);
  }
};

exports.addToWishlist = async (req, res, next) => {
  try {
    const productId = req.body.id;
    const userId = req.session.userId;

    if (!productId) {
      const error = new Error(`The productId is not provided`);
      throw errorHandler(error, 404);
    }

    if (!userId) {
      const error = new Error(`The userId is not provided`);
      throw errorHandler(error, 404);
    }

    const user = await User.findOne({ where: { id: userId } });
    const wishList = await user.getWishlist();
    const product = await Product.findOne({ where: { id: productId } });

    // Check if product already exists in WishList
    const current_wishlist = await product.getWishlists({
      attributes: [],
      through: { where: { ProductId: productId } },
    });

    if (current_wishlist.length > 0) {
      current_wishlist_product = current_wishlist[0].wishlistitem.ProductId;
      if (current_wishlist_product == productId) {
        return res.json({
          message: "The product already exists in the cart",
        });
      }
    }

    const result = await sequelize.query(
      `
    INSERT INTO wishlistitems(wishlistId,ProductId) VALUES (
      ${parseInt(wishList.id)},
      ${parseInt(product.id)}
    )`,
      { type: QueryTypes.INSERT },
      { logging: console.log }
    );

    res.status(200).json({
      message: "Added product to wishlist",
      data: result,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

// Stripe Handlers

exports.createSession = async (req, res, next) => {
  try {
    // Get product details
    const { stripeToken } = req.body;

    stripe.charges
      .create({
        amount: 1000,
        currency: "inr",
        source: stripeToken.id,
        capture: false, // note that capture: false
      })
      .then((chargeObject) => {
        // do something in success here
        console.log("Charges created");

        stripe.charges
          .capture(chargeObject.id)
          .then((res) => {
            console.log(res);
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((error) => {
        // do something in error here
        console.log(error);
      });
  } catch (err) {
    console.log(err);
    res.json(err);
  }
};

exports.create = function (req, res, next) {};

exports.payment_success = (req, res, next) => {
  console.log(req);
  return res.json({
    message: "Success",
  });
};

exports.payment_cancel = (req, res, next) => {
  console.log(req);
  res.json({
    message: "Cancel",
  });
};

// Coupon Handers

exports.getCoupon = async (req, res, next) => {
  try {
    const userId = req.session.userId;

    // Fetch user specific coupons
    const childCoupons = await ChildCoupon.findAll({
      attributes: [
        "id",
        "parent_key",
        "child_discount_code",
        "start_date",
        "end_date",
        "linked_user_id",
        "is_active",
        "num_uses",
        "ParentCouponId",
      ],
      where: {
        linked_user_id: userId,
        is_active: 1,
      },
      raw: true,
    });

    // Fetch general coupons
    const generalCoupons = await ChildCoupon.findAll({
      attributes: [
        "id",
        "parent_key",
        "child_discount_code",
        "start_date",
        "end_date",
        "linked_user_id",
        "is_active",
        "num_uses",
        "ParentCouponId",
      ],
      where: {
        linked_user_id: 0,
        is_active: 1,
      },
      raw: true,
    });

    if (childCoupons.length == 0 && generalCoupons.length == 0) {
      res.json({
        message: "No coupons exists for the user",
        data: null,
      });
    }

    res.json({
      message: "Coupons fetched",
      data: { childCoupons, generalCoupons },
    });
  } catch (error) {
    next(errorHandler(error));
  }
};

exports.applyCoupon = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const { discount_code } = req.body;

    if (!discount_code) {
      const error = new Error(`The discount code has not been provided`);
      throw errorHandler(error);
    }

    // Check if coupon exists and is active or not, if the date is within the limit date.
    const coupon_to_apply = await ChildCoupon.findAll({
      attributes: ["id", "num_uses", "start_date", "end_date"],
      where: {
        child_discount_code: discount_code,
        is_active: 1,
        num_uses: {
          [Op.gt]: 1,
        },
      },
      raw: true,
    });

    if (!coupon_to_apply) {
      const error = new Error(`The applied coupon code is not valid`);
      throw errorHandler(error);
    }

    // Check if num_uses > 0
    if (coupon_to_apply.num_uses < 1) {
      const error = new Error(
        `The coupon has been applied to the maximum limit`
      );
      throw errorHandler(error);
    }

    // #TODO Check if current_date between start_date and end_date
    const currentDate = new Date();
    const coupon_start_date = new Date(coupon_to_apply.start_date);
    const coupon_end_date = new Date(coupon_to_apply.end_date);

    if (currentDate < coupon_start_date || currentDate > coupon_end_date) {
      const error = new Error(
        `The coupon is not valid during the specified period.`
      );
      throw errorHandler(error);
    }

    // #TODO If yes, get the user cart and store the coupon against the cart.

    // #####################
    // #TODO During order success, update num_uses by +1 (ANOTHER CONTROLLER).

    res.json({
      data: coupon_to_apply,
    });
  } catch (err) {
    next(errorHandler(err));
  }
};

exports.clearCoupon = async (req, res, next) => {
  const userId = req.session.userId;

  // #TODO Get the user cart.

  // #TODO Remove the coupon against the cart.
};
