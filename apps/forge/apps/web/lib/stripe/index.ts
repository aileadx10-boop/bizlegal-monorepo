// lib/stripe/index.ts
// ⚠️ DEPRECATED — Stripe has been replaced by PayPal + ETH Crypto wallet
// Kept for reference only. Payment logic moved to lib/payments/index.ts
//
// Old Stripe code for reference:
//   import Stripe from 'stripe'
//   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })
//
// To remove Stripe entirely once PayPal is confirmed working:
//   1. npm uninstall stripe @paypal/checkout-server-sdk
//   2. Delete this file
//   3. Remove STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET from .env
