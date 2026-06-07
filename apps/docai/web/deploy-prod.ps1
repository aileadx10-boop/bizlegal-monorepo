# Run this from apps/docai/web/
# 1. Set root directory so Vercel understands the monorepo layout
vercel project set --root-directory apps/docai/web

# 2. Enable Corepack for pnpm (Node 24.x needs the flag)
echo "1" | vercel env add ENABLE_EXPERIMENTAL_COREPACK production

# 3. Flip PayPal from sandbox to live
echo "live" | vercel env add PAYPAL_ENV production --force

# 4. Deploy
vercel deploy --prod
