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
