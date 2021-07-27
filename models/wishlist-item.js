const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const WishListItem = sequelize.define(
  "wishlistitem",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
  },
  { timestamps: false }
);

module.exports = WishListItem;
