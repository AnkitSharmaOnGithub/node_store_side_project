const Product = require("../models/product");
const errorHandler = require("./error.handler");

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll();

    return res.json({
      message: "Products fetched successfully",
      data: products,
    });
  } catch (err) {
    next(errorHandler(err));
  }
};

exports.postProduct = async (req, res, next) => {
  const { title, price, image, description } = req.body;

  // console.log(title, price, image, description);

  const product = await Product.create({
    title: title,
    price: price,
    image: image,
    description: description,
  });
  product.save();

  return res.json({
    message: "Product created",
    data: product,
  });
};

exports.getProduct = async (req, res, next) => {
  const prodId = req.params.id;

  const product = Product.findByPk(prodId)
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

exports.updateProduct = async (req, res, next) => {
  const prodId = req.params.id;

  // Check if product with the id exists in the DB
  Product.findByPk(prodId)
    .then((product) => {
      if (!product) {
        const err = new Error(`The product with ID ${prodId} was not found`);
        throw errorHandler(err, 404);
      }

      return product;
    })
    .then((product) => {
      // If product exists,then extract the body
      const { title, price, image, description } = req.body;

      product.title = title;
      product.price = price;
      product.image = image;
      product.description = description;

      // Update the porduct and send response
      return product.save();
    })
    .then((result) => {
      return res.json({
        message: "Product Updated",
        data: result,
      });
    })
    .catch((err) => {
      next(err);
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteProduct = async (req, res, next) => {
  const prodId = req.params.id;

  Product.destroy({ where: { id: prodId } })
    .then((data) => {
      if (data === 0) {
        const err = new Error(`The product with ID ${prodId} was not found`);
        throw errorHandler(err, 404);
      }

      return res.json({
        message: "Product deleted",
        data: `The product with ID ${prodId} has been deleted`,
      });
    })
    .catch((err) => {
      next(err);
    });
};
