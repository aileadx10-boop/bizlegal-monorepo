# 🚀 DocAI - Deployment Guide

## ✅ GitHub Deployment - COMPLETE

**Repository:** https://github.com/aileadx10-boop/DocAI  
**Branch:** main  
**Status:** ✅ Pushed successfully

### Latest Commit
```
feat: Complete redesign with DOR-INNOVATION integration
- New design system with cyan theme
- Added Advocate Dor bio section
- Integrated 7 social media links
- AI Due Diligence lead magnet
- Enhanced security headers
```

---

## 📋 Vercel Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**
   - Visit: https://vercel.com/new
   - Log in with your GitHub account

2. **Import Repository**
   - Click "Import Git Repository"
   - Find and select: `aileadx10-boop/DocAI`
   - Click "Import"

3. **Configure Project**
   - **Framework Preset:** Other
   - **Root Directory:** `./` (default)
   - **Build Command:** (leave empty - no build needed)
   - **Output Directory:** `./` (default)

4. **Environment Variables** (Add these in Vercel Settings → Environment Variables)
   ```
   CLAUDE_KEY=your_claude_api_key
   RESEND_KEY=your_resend_api_key
   EMAIL_DOMAIN=your-domain.com
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~30 seconds)
   - Your site will be live at: `https://docai-xxx.vercel.app`

---

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Navigate to project
cd "C:\Users\Moshe Dor\DocAI"

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## 🔗 Post-Deployment Tasks

### 1. Update index-new.html
Replace `YOUR_CLIENT_ID` (line 9) with your actual PayPal Client ID:
```html
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=USD"></script>
```

### 2. Configure API Keys
Make sure these files have your actual API keys:
- `/api/paypal.js` - PayPal credentials
- `/api/dd.js` - Claude API key
- `/api/email.js` - Resend API key

### 3. Custom Domain (Optional)
In Vercel Dashboard:
1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `docai.com`)
3. Update DNS records as instructed

### 4. Production Checklist
- [ ] PayPal Client ID updated
- [ ] All API keys configured
- [ ] Test payment flow
- [ ] Test DD analysis
- [ ] Test email delivery
- [ ] Check all social media links
- [ ] Verify mobile responsiveness
- [ ] Test all document templates

---

## 📊 Project Structure

```
DocAI/
├── index-new.html          ← Main redesigned page
├── index.html              ← Original page (backup)
├── vercel.json             ← Vercel configuration
├── api/
│   ├── paypal.js           ← PayPal payment handler
│   ├── dd.js               ← Due diligence AI analysis
│   ├── email.js            ← Email delivery
│   └── ...
├── legal/
│   ├── terms.html
│   ├── privacy.html
│   ├── disclaimer.html
│   └── ...
└── seo/
    ├── crypto-contract-risks.html
    ├── real-estate-jv-agreement.html
    └── vara-compliance-checklist.html
```

---

## 🎨 Live URLs

After deployment, your site will be available at:

**Vercel Preview:** `https://docai-<random>.vercel.app`  
**Custom Domain:** `https://your-domain.com` (if configured)

**GitHub:** https://github.com/aileadx10-boop/DocAI

---

## 🔧 Troubleshooting

### Build Fails
- Check that all files are committed and pushed
- Verify `vercel.json` syntax is correct
- Check Vercel build logs for errors

### API Not Working
- Ensure environment variables are set in Vercel
- Check API file permissions
- Verify API routes in Vercel Functions tab

### PayPal Not Loading
- Update Client ID in `index-new.html` line 9
- Check PayPal SDK console for errors
- Verify PayPal account is business account

---

## 📈 Next Steps After Deployment

1. **Test Everything**
   - Navigate through all pages
   - Test the DD analysis flow
   - Verify payment processing
   - Check email delivery

2. **Monitor Performance**
   - Vercel Analytics (enable in dashboard)
   - Check Core Web Vitals
   - Monitor API function usage

3. **SEO Optimization**
   - Submit sitemap to Google Search Console
   - Add meta descriptions
   - Configure Open Graph tags

4. **Backup**
   - Download production database (if any)
   - Export Vercel environment variables
   - Save deployment logs

---

## 🎉 Success!

Your DocAI site is now deployed with:
- ✅ Modern cyan theme from DOR-INNOVATION
- ✅ Advocate Dor bio section
- ✅ 7 social media links
- ✅ AI Due Diligence tool ($250)
- ✅ PayPal payment integration
- ✅ Responsive design
- ✅ Enhanced security headers

**Deployment Date:** 2025-03-22  
**Version:** 3.1.0 (Production Ready)

---

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review browser console for errors
3. Verify all API keys are correct
4. Test in incognito mode to clear cache

**Documentation Files:**
- `SETUP_GUIDE.html` - Visual setup guide
- `VARIABLES_REFERENCE.html` - Color palette & variables
- `SOCIAL_MEDIA_COMPLETE.md` - Social links reference
- `DOR-INNOVATION_INTEGRATION.md` - Design system docs
