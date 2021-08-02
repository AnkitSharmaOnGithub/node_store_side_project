const errorHandler = require("./error.handler");
const Product = require("../models/product");
const User = require("../models/user");
const ParentCoupon = require("../models/parent-coupon");
const ChildCoupon = require("../models/child-coupon");

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

exports.generateParentCoupon = async (req, res, next) => {
  try {
    const { key, start_date, end_date, discount_amount, num_uses } = req.body;
    // const props = [key, start_date, end_date, discount_amount];
    const props = {
      key: key,
      start_date: start_date,
      end_date: end_date,
      discount_amount: discount_amount,
    };

    for (const prop in props) {
      // Check if each of the props is not empty
      if (!props[prop]) {
        const error = new Error(
          `${prop} cannot be empty. Please enter the ${prop} and try again.`
        );
        throw errorHandler(error);
      }
    }

    // Check if the key exists
    const coupon_exists = await ParentCoupon.findOne({
      where: { key: props["key"] },
      raw: true,
    });

    if (coupon_exists) {
      const error = new Error(
        `Coupon with the key ${props["key"]} already exists`
      );
      throw errorHandler(error);
    }

    /* # Check if the dates are :-
        START DATE :- Should be greater than current date. 
        END DATE :-  Should be greater than current date (Margin ~ 1hr).
    */

    const currentDate = new Date();
    const start_date_entered = new Date(props["start_date"]);
    const end_date_entered = new Date(props["end_date"]);

    if (start_date_entered < currentDate) {
      const error = new Error(`Start date must be greater than today's date.`);
      throw errorHandler(error);
    }

    if (end_date_entered < currentDate) {
      const error = new Error(`End date must be greater than today's date.`);
      throw errorHandler(error);
    }

    if (props["discount_amount"] <= 0) {
      // Check if discount amount is not zero or lesser than zero
      const error = new Error(`Discount amount must be greater than 0.`);
      throw errorHandler(error);
    }

    // # TODO Randomize the key in future

    const parentCoupon = await ParentCoupon.build({
      key: props["key"],
      start_date: props["start_date"],
      end_date: props["end_date"],
      discount_amount: props["discount_amount"],
    });

    // num_uses is optional, check if it is present. If yes, then add to the DB.
    if (num_uses) {
      parentCoupon.num_uses = num_uses;
    }

    const result = await parentCoupon.save();

    res.json({
      message: "Parent Coupon Created",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

exports.generateChildCoupon = async (req, res, next) => {
  try {
    let {
      parent_key,
      child_discount_code,
      start_date,
      end_date,
      linked_user_id,
      num_uses,
    } = req.body;

    const props = {
      parent_key: parent_key,
      child_discount_code: child_discount_code,
      start_date: start_date,
      end_date: end_date,
      num_uses: num_uses,
    };

    // Check if the fields to be entered in DB are not empty

    for (const prop in props) {
      // Check if each of the props is not empty
      if (!props[prop]) {
        const error = new Error(
          `${prop} cannot be empty. Please enter the ${prop} and try again.`
        );
        throw errorHandler(error);
      }
    }

    // Check if the parent key is present in the DB. If yes, set the ParentCouponId(Foreign Key)
    const parent_exists = await ParentCoupon.findOne({
      attributes: ["id"],
      where: { key: props["parent_key"] },
      raw: true,
    });

    if (!parent_exists) {
      const error = new Error(
        `A parent coupon with the key ${props["parent_key"]} does not exist.`
      );
      throw errorHandler(error);
    }
    // #TODO Assign the fetched Parent Coupon id to a variable
    const parentCouponId = parent_exists.id;

    if (linked_user_id) {
      // Check if the user with the linked_user_id exists
      const user = await User.findOne({
        where: { id: props["linked_user_id"] },
      });

      if (!user) {
        const error = new Error(
          `A user with the ID ${props["linked_user_id"]} does not exist.`
        );
        throw errorHandler(error);
      }
    }
    // If no user id is linked, then make it a general coupon
    else {
      linked_user_id = 0;
    }

    // Check start and end date validations

    /* # Check if the dates are :-
        START DATE :- Should be greater than current date. 
        END DATE :-  Should be greater than current date (Margin ~ 1hr).
    */

    const currentDate = new Date();
    const start_date_entered = new Date(props["start_date"]);
    const end_date_entered = new Date(props["end_date"]);

    if (start_date_entered < currentDate) {
      const error = new Error(`Start date must be greater than today's date.`);
      throw errorHandler(error);
    }

    if (end_date_entered < currentDate) {
      const error = new Error(`End date must be greater than today's date.`);
      throw errorHandler(error);
    }

    // # Check if child_discount_code is unique and is active. Set in DB also -> unique.
    const child_coupon_code_exists = await ChildCoupon.findOne({
      attributes: ["id"],
      where: { child_discount_code: child_discount_code, is_active: 1 },
    });

    if (child_coupon_code_exists) {
      const error = new Error(
        `Child coupon code already exists and is also active`
      );
      throw errorHandler(error);
    }

    // # Check if num_uses is present. If yes, check if it is greater than 0. If not, set it to 1
    if (num_uses) {
      if (+num_uses <= 0) {
        const error = new Error(`Num uses must be greater than 0`);
        throw errorHandler(error);
      }
    } else {
      num_uses = 1;
    }

    // # If all validations are passed, Insert the child coupon in the DB.
    const childCoupon = ChildCoupon.build({
      parent_key: parent_key,
      child_discount_code: child_discount_code,
      start_date: start_date,
      end_date: end_date,
      linked_user_id: linked_user_id,
      is_active: 1,
      num_uses: num_uses,
      ParentCouponId: parentCouponId,
    });

    const result = await childCoupon.save();

    return res.json({
      message: "Child coupon created successfully.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
