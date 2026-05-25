# Google Search Console Setup Guide for VibeLink Event

## Step 1: Access Google Search Console
1. Go to https://search.google.com/search-console
2. Sign in with your Google account (use the same one linked to Google Analytics)

## Step 2: Add Property
1. Click "Add property" button
2. Choose "URL prefix" method
3. Enter: `https://vibelinkevent.com`
4. Click "Continue"

## Step 3: Verify Ownership (Choose ONE method)

### Method A: HTML Meta Tag (Recommended - Already Prepared)
1. Google will show you a verification code like: `<meta name="google-site-verification" content="xxxxxxxxxxxxx" />`
2. Copy ONLY the content value (the long string)
3. Open `index.html` in this project
4. Find this line: `<meta name="google-site-verification" content="YOUR_GOOGLE_VERIFICATION_CODE" />`
5. Replace `YOUR_GOOGLE_VERIFICATION_CODE` with your actual code
6. Deploy to Netlify
7. Click "Verify" in Search Console

### Method B: DNS Record (Alternative)
1. Go to your domain registrar (where you bought vibelinkevent.com)
2. Add a TXT record with the value Google provides
3. Wait 5-10 minutes for DNS propagation
4. Click "Verify"

## Step 4: Submit Sitemap
1. After verification, click "Sitemaps" in the left menu
2. Enter: `sitemap.xml`
3. Click "Submit"
4. Status should show "Success" within a few minutes

## Step 5: Request Indexing for Key Pages
1. Go to "URL Inspection" in the left menu
2. Enter each important URL and click "Request Indexing":
   - https://vibelinkevent.com/
   - https://vibelinkevent.com/services
   - https://vibelinkevent.com/portfolio
   - https://vibelinkevent.com/pricing
   - https://vibelinkevent.com/get-started
   - https://vibelinkevent.com/blog
   - https://vibelinkevent.com/about
   - https://vibelinkevent.com/contact

## Step 6: Monitor Performance
After 24-48 hours, check:
1. **Coverage Report**: Shows which pages are indexed
2. **Performance Report**: Shows clicks, impressions, and rankings
3. **Core Web Vitals**: Shows page speed issues

## Additional Submissions

### Bing Webmaster Tools
1. Go to https://www.bing.com/webmasters
2. Sign in with Microsoft account
3. Add site: vibelinkevent.com
4. Import from Google Search Console (easiest)
5. Or add the Bing verification code to index.html

### Google Analytics Connection
Your site already has Google Analytics (G-6ZY31KPC0V).
To link with Search Console:
1. In Search Console, go to Settings > Associations
2. Click "Associate" next to Google Analytics
3. Select the correct GA4 property

## Expected Timeline
- **Immediate**: Sitemap submitted
- **24-48 hours**: First pages start appearing in index
- **1-2 weeks**: Most pages indexed
- **2-4 weeks**: Rankings start stabilizing
- **1-3 months**: Full SEO impact visible

## Files Updated for SEO

### Security Headers (netlify.toml)
- Content-Security-Policy
- Strict-Transport-Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy

### SEO Files
- sitemap.xml - Updated with correct domain and dates
- robots.txt - Already correct
- index.html - Added verification meta tags

## Checklist Before Submission
- [x] Sitemap updated to vibelinkevent.com
- [x] robots.txt points to correct sitemap
- [x] Security headers configured
- [x] Meta tags complete
- [x] Open Graph tags set
- [x] Twitter Card tags set
- [x] Structured Data (Schema.org) present
- [x] Google Analytics tracking
- [ ] Replace YOUR_GOOGLE_VERIFICATION_CODE in index.html
- [ ] Replace YOUR_BING_VERIFICATION_CODE in index.html (optional)
- [ ] Deploy to Netlify
- [ ] Verify in Search Console
- [ ] Submit sitemap

## Common Issues & Solutions

### "URL is not on Google"
- Submit URL for indexing
- Check robots.txt doesn't block the page
- Ensure page has unique content

### "Redirect error"
- Check that www and non-www versions both work
- Ensure HTTPS redirects are correct

### "Soft 404"
- Make sure pages return proper 200 status
- Ensure content is substantial

---

**After completing these steps, Google will start crawling and indexing vibelinkevent.com!**
