const express = require("express");
const app = express();

// Import in app dependencies
const sequelize = require("./utils/database");

// Importing 3 party libraries
const bodyParser = require("body-parser");
const session = require("express-session");
// initalize sequelize with session store
const SequelizeStore = require("connect-session-sequelize")(session.Store);

// ## Swagger
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Configuroding 3rd party libraries
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

// Setting CORS headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Setting swagger options
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "Node Store Side Project API",
      description:
        "This is an API for Node Store Side Project developed by Ankit Sharma",
      contact: {
        name: "Ankit Sharma",
      },
      servers: ["http://localhost:8000/"],
    },
  },
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const sequelizeSessionStore = new SequelizeStore({
  db: sequelize,
});
sequelizeSessionStore.sync();
app.use(
  session({
    secret: "THIS#IS%SECRET&*PASSWORD()",
    resave: false,
    saveUninitialized: false,
    store: sequelizeSessionStore,
  })
);

// Configuring and setting up route handlers
const shopRoutes = require("./routes/shop");
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/user");

app.use("/shop", shopRoutes);
app.use("/admin", adminRoutes);
app.use("/user", userRoutes);

// Import models
const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-items");
const WishList = require("./models/wishlist");
const WishListItem = require("./models/wishlist-item");
const ParentCoupon = require("./models/parent-coupon");
const ChildCoupon = require("./models/child-coupon");

// Add the error handler route
app.use((error, req, res, next) => {
  const statusCode = error.statusCode | 500;
  const message = error.message;

  return res.status(statusCode).json({
    message: message,
  });
});

// Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
// User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);

User.hasOne(WishList);
WishList.belongsTo(User);

WishList.belongsToMany(Product, { through: WishListItem });
Product.belongsToMany(WishList, { through: WishListItem });

Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

ParentCoupon.hasMany(ChildCoupon);
ChildCoupon.belongsTo(ParentCoupon);

// Syncing sequelize models with the database
sequelize
  .sync()
  .then((result) => {
    // Setting up listener to listen on port 8000
    app.listen(8000, () => {
      console.log(`Listening on port 8000`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
