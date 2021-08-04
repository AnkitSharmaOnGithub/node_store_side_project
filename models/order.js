const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const User = require("../models/user");
const Cart = require("../models/cart");

const Order = sequelize.define("Order", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  cartId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Cart,
      key: "id",
    },
  },
  chargeId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  balance_transaction_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_name: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  user_email: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  order_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  paid: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  payment_method: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  receipt_url: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  refunded: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Order;
