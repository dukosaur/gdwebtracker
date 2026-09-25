# 🎮 Geometry Dash Level Tracker (Ashrit & Arsh)

A high-performance, modern web front-end for your Geometry Dash Google Spreadsheet with **real-time 2-way sync**, exact spreadsheet layout replication, difficulty pills, level image attachments, and head-to-head stats.

---

## 🚀 Key Features

* **☁️ 100% Cloud-Ready (Deploy to Vercel)**:
  * Runs 24/7 in the cloud on **Vercel** for free.
  * **Your personal computer does NOT need to be turned on**. You and your friends can access it from phones, laptops, or tablets anywhere.
* **🔄 2-Way Google Sheets Sync**:
  * Powered by Google's free **Google Apps Script** serverless engine.
  * Edit on Google Sheets $\rightarrow$ automatically appears on the website.
  * Edit on the website $\rightarrow$ automatically saves to Google Sheets.
  * Works offline out-of-the-box with all data from your screenshots pre-seeded!
* **📊 Exact Spreadsheet Layout (1:1)**:
  * 3 tabs matching your sheet:
    * `ashriiiiiiiiiiiiiit` (Navy/Indigo theme)
    * `mahmoud arsh im sorry` (Crimson Red theme)
    * `fun googogoaaaagga` (Dark Slate / Neon theme)
  * Colored difficulty badges: `Easy Demon`, `Medium Demon`, `Hard Demon`, `Insane Demon`, `Extreme Demon`, `Easy`, `Insane`, `NA`.
  * Status badges on the shared tab: `not done`, `attempted`, `done`.
  * Exclusive "Current Hardest" checkbox with celebratory confetti.
* **✨ Geometry Dash Showcase Mode**:
  * Toggle from spreadsheet view to rich visual Geometry Dash cards with iconic demon faces, level ID copy button, and attempt counts.
* **🖼️ Level Screenshot & Image Support**:
  * Click the image icon on any row or card to paste a URL or upload a screenshot of the level.
* **🏆 Stats & Head-to-Head Comparison**:
  * Ashrit vs. Arsh demon counts, total attempts, current hardest showcase, and completion progress on the shared 22 levels.

---

## ⚡ Quick Start (Local Testing)

If you have Node.js installed and want to run it locally:

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 🌐 Deploy to Vercel (Free 24/7 Hosting)

You can deploy this site in under 2 minutes so you never need to run anything on your computer:

### Option 1: Via GitHub (Recommended)
1. Initialize a git repository and push your project to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Geometry Dash Tracker"
   git branch -M main
   # Push to your new GitHub repository
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Select your GitHub repository.
4. Click **"Deploy"** (Vercel automatically detects Vite).
5. Done! Your website is live on a custom `your-app.vercel.app` URL forever.

### Option 2: Via Vercel CLI
```bash
npm i -g vercel
vercel
```

---

## 🔗 How to Connect 2-Way Google Sheets Sync (2 Minutes)

You don't need any database or server! Google Sheets can act as your live database:

1. Open your Google Sheet that has your 3 tabs (`ashriiiiiiiiiiiiiit`, `mahmoud arsh im sorry`, `fun googogoaaaagga`).
2. In the top Google Sheets menu, click **Extensions** > **Apps Script**.
3. Delete any code in the editor, and copy-paste all the code from [`google_apps_script.js`](./google_apps_script.js).
4. Click the blue **Deploy** button at the top right > **New deployment**.
5. Click the gear icon next to "Select type" and choose **Web app**.
6. Set:
   * **Description**: `GD Web App Sync`
   * **Execute as**: `Me`
   * **Who has access**: `Anyone` *(Crucial so the website can read/write without complex login!)*
7. Click **Deploy** and authorize permissions when prompted.
8. Copy the **Web app URL** (looks like `https://script.google.com/macros/s/.../exec`).
9. On your website, click the **"Connect Sheet"** button in the top right, paste the URL, and click **"Save & Apply"**!

---

## 📁 File Structure

```text
├── google_apps_script.js       # Plug-and-play script for Google Sheets backend
├── vercel.json                 # Single-page routing config for Vercel
├── package.json                # Project dependencies
├── index.html                  # HTML template with gaming fonts
├── src/
│   ├── types/index.ts          # TypeScript models
│   ├── data/seedData.ts        # Transcribed data from all 3 sheet screenshots
│   ├── services/sheetSyncService.ts # LocalStorage cache + Google Apps Script sync
│   ├── components/
│   │   ├── Header.tsx          # Brand, view switcher, and sync indicator
│   │   ├── TabNavigation.tsx   # The 3 tabs with counters and theme colors
│   │   ├── SpreadsheetView.tsx # Exact 1:1 table view matching Google Sheets
│   │   ├── ShowcaseView.tsx    # Geometry Dash card view with demon faces
│   │   ├── StatsDashboard.tsx  # Ashrit vs. Arsh head-to-head stats
│   │   ├── DifficultyBadge.tsx # Custom GD pills & SVG demon faces
│   │   ├── LevelImageModal.tsx # Upload/paste image screenshot modal
│   │   └── SyncModal.tsx       # Sync settings & Apps Script setup guide
│   ├── App.tsx                 # Core app state & navigation
│   ├── main.tsx                # React root mount
│   └── index.css               # Tailwind CSS & custom scrollbars
```
