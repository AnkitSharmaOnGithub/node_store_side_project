const { Sequelize } = require("sequelize");
const sequelize = new Sequelize({
  host: "localhost",
  database: "node_store_side_project",
  username: "root",
  password: "",
  dialect: "mysql",
});

try {
  await sequelize.authenticate();
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

module.exports = sequelize.Promise();
