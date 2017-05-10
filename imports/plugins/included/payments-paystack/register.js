/* eslint camelcase: 0 */
import { Reaction } from "/server/api";

Reaction.registerPackage({
  label: "PaystackPayment",
  name: "paystack-paymentmethod",
  icon: "fa fa-credit-card-alt",
  autoEnable: true,
  settings: {
    "mode": false,
    "apiKey": "sk_test_739672afa9d2b1672453a67e766cef689dc498ef",
    "paystack": {
      enabled: false
    },
    "paystack-paymentmethod": {
      enabled: false
    }
  },
  registry: [
    // Settings panel
    {
      label: "Paystack Payment", // this key (minus spaces) is used for translations
      provides: "paymentSettings",
      container: "dashboard",
      template: "paystackSettings"
    },

    // Payment form for checkout
    {
      template: "paystackPaymentForm",
      provides: "paymentMethod",
      icon: "fa fa-credit-card-alt"
    }
  ]
});
