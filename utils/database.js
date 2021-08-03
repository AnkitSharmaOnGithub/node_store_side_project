require("dotenv").config();

const { Sequelize } = require("sequelize");
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, "", {
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
