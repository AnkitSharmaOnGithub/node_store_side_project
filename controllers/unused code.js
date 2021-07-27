// Shop cart controller - add to cart
const cartData = await Cart.findOne({
  attributes: [["id", "cartId"]],
  include: [
    {
      model: User,
      attributes: [],
      where: { id: userId },
    },
  ],
});

if (cartData.length === 0) {
  const err = new Error("No cart exists for the user");
  throw errorHandler(err, 404);
}

// Get cart id from cartData
const cartId = cartData.getDataValue("cartId");

// Check if the product exists in the cart
let productData;

productData = await Cart.findAll({
  attributes: [],
  where: { id: cartId },
  include: [
    {
      attributes: ["id", "title", "price"],
      model: Product,
      through: { attributes: ["quantity"] },
    },
  ],
});

// const tempData = productData[0].Products;

// tempData.forEach(data => {
//   console.log(data.cartitem.quantity);
// })

let productsToUpdate = [];
// Loop through products to find products that needs to be added or updated
productData[0].getDataValue("Products").map((product) => {
  let id = product.getDataValue("id");
  let quantity = product.getDataValue("cartitem").getDataValue("quantity");

  productsToUpdate.push({
    id: id,
    quantity: quantity,
  });
});

// If yes,increase qty by 1
for (const product of productsToUpdate) {
  if (product.quantity === 1) {
    product.quantity++;
  }
}

// If no, add and set qty to 1
return res.json({
  productData,
});
