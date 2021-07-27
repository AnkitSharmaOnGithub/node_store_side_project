const Cart = require("../models/cart");
const CartItem = require("../models/cart-items");
const Product = require("../models/product");
const User = require("../models/user");
const errorHandler = require("./error.handler");
const { QueryTypes, Op } = require("sequelize");
const sequelize = require("../utils/database");

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

  Product.findByPk(prodId)
    .then((product) => {
      if (!product) {
        const err = new Error(`The product with ID ${prodId} was not found`);
        throw errorHandler(err, 404);
      }

      return res.json({
        message: "Product found",
        data: product,
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
        p.price as 'product _price',
        p.image as 'product_image',
        ci.quantity as 'cart_quantity'
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
          { quantity: parseInt(cartProduct.cart_quantity) + 1 },
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
      console.log("Adding to cart");

      // Fetch cart_id for the user
      const userCartId = await sequelize.query(
        `select id from carts where UserId  =  ${userId}`,
        { type: QueryTypes.SELECT },
        { logging: console.log }
      );

      addCartResult = await CartItem.create(
        {
          quantity: 1,
          cartId: parseInt(userCartId[0].id),
          ProductId: parseInt(productId),
        },
        { logging: console.log }
      );
    }

    res.status(200).json(addCartResult);
  } catch (error) {
    res.json(error);
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
          through: { attributes: ["quantity", "productId"] },
        },
      ],
    });

    res.json({
      cartData: cart,
    });
  } catch (err) {
    res.json(err);
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

exports.getWishlist = async (req, res, next) => {};

exports.addToWishlist = async (req, res, next) => {};

