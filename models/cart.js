const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const Cart = sequelize.define("cart", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  discount_code: {
    type: DataTypes.STRING,
  },
});

module.exports = Cart;
