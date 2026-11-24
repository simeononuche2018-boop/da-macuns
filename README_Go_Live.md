# DA MacUNS website: how to put it live (Level 8)

Files (all in one folder, no sub-folders except images):
- `index.html` homepage
- `menu.html` Menu page (search, category filter, quantity, cart drawer, demo checkout)
- `style.css` all styles (colours are CSS variables at the top: `--green`, `--orange`, ...)
- `script.js` all interactions
- `images/` pictures

## Test on your phone first
1. Unzip `da-macuns-site.zip`.
2. Double-click `index.html` to open it in your laptop browser. Check: header menu, Add to cart, cart drawer, Menu page search and filters.
3. To see it on your phone, deploy it (below) and open the link on the phone.

## Option A: Netlify Drop (fastest)
1. Open https://app.netlify.com/drop and sign in.
2. Drag the unzipped `da-macuns-site` folder (the one containing `index.html`) onto the page.
3. You get a live link like `https://something.netlify.app`. Open it on your phone.

## Option B: Vercel (what your portfolio uses)
1. Push the folder to a new GitHub repo called `da-macuns` (separate from your portfolio).
2. In Vercel: Add New > Project > import `da-macuns`. Framework preset: Other. Deploy.

## Option C: GitHub Pages
1. New public repo `da-macuns`, upload everything inside the folder (keep `images`).
2. Settings > Pages > Branch `main`, folder `/ (root)`, Save. Live in about a minute.

## What the site does
- Hero image auto-slides through 4 combo photos (dots, pauses on hover).
- Header Menu and hero View Menu scroll to the menu section; View Full Menu shows all 6 cards (Show Less returns to 4); Open Menu Page goes to menu.html.
- Menu page: search, category filters, item count, quick view with quantity, cart drawer in Naira, demo checkout.

## Things to replace before submitting
- `images/orange-smoothie-placeholder.jpg`: stand-in; replace with your real DA Orange Smoothie image (keep the file name).
- `images/hero-slide-*.jpg` and `hero-plate-clean.jpg` come from your Figma exports (536 px wide); larger exports look sharper.
- Delivery map, kitchen photo, phone-in-hand and avatars are placeholders or stand-ins; swap with your Figma exports (keep file names).
- Phone, email, social links, ratings and testimonials come from your landing design; keep only what is true.
- Checkout is a demo (no payment or server). App Store / Google Play buttons show a "coming soon" message.
- Party Jollof price is set to the app screens' value; confirm it (₦4,000 vs ₦4,200).
