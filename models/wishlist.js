const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const WishList = sequelize.define(
  "wishlist",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
  },
  { freezeTableName: true }
);

module.exports = WishList;
