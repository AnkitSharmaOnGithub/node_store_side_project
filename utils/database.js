const { Sequelize } = require("sequelize");
const sequelize = new Sequelize("node_store_side_project", "root", "", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
  logQueryParameters: true,
});

sequelize
  .authenticate()
  .then((result) => {
    console.log("Connection has been established successfully.");
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });

module.exports = sequelize;
