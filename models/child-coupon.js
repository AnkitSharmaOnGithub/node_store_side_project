const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const ChildCoupon = sequelize.define("ChildCoupon", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  parent_key: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: {
        tableName: "ParentCoupon",
      },
      key: "id",
    },
  },
  child_discount_code: {
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
  linked_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // references: {
    //   model: {
    //     tableName: "Users",
    //   },
    //   key: "id",
    // },
  },
  is_active: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  num_uses: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
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

module.exports = ChildCoupon;
