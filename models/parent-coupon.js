const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const ParentCoupon = sequelize.define("ParentCoupon", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  discount_amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  num_uses: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },

  // ################## FUTURE PLAN
  //   min_order: {
  //     type: DataTypes.INTEGER,
  //     allowNull: false,
  //   },

  //   is_one_time: {
  //     type: DataTypes.NUMBER,
  //     allowNull: false,
  //   },

  //   num_uses: {
  //     type: DataTypes.NUMBER,
  //     allowNull: false,
  //   },
});

module.exports = ParentCoupon;
