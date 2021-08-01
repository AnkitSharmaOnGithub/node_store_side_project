// helper.js
exports.createCharge = function (amount, stripeToken) {
  const chargeData = getChargeData(amount, stripeToken);
  return stripe.charges
    .create(chargeData)
    .then((res) => res)
    .catch((err) => err);
};
function getChargeData(amount, stripeToken) {
  const amountInPence = amount * 100;
  return {
    amount: amountInPence,
    currency: "usd",
    source: stripeToken,
    capture: false,
  };
}
