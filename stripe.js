// stripe.js
const Stripe = require("stripe");
const stripe = Stripe(
  "sk_test_51Pyv8z1JCipCWrBSVSTRqSOSF99DLElcKkshNAwaaiBaehJyt1fVGqwmZpIDV11Bq9bnEgWe37woljcu0jpqQvti00YaDD3nYp"
); // Replace with your actual secret key

module.exports = stripe;
