const express = require("express");
const app = express();

// Importing 3 party libraries

// # Swagger
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

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

// Configuring and setting up route handlers
const shopRoutes = require("./routes/shop");

app.use(shopRoutes);

// Setting up listener to listen on port 8000
app.listen(8000);
