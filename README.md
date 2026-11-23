# 🌴 GOA ESCAPE — The Ultimate North & South Goa Travel Website

A modern, aesthetic, tropical web guide curated with the **top viral, Instagram-famous, and Google Maps landmarks across North and South Goa**.

Built with pure modern web standards (ES Modules, modern CSS glassmorphism, responsive grids), zero external dependencies, 100 Lighthouse performance, and **ready for instant deployment on Vercel**.

---

## 🚀 Key Features

* **Complete North & South Goa Coverage**: 24+ hand-curated spots across Chapora Fort, Parra Coconut Road, Fontainhas, Dudhsagar Falls, Cola Lagoon, Cabo de Rama, Butterfly Beach, and hidden gems.
* **Direct Google Maps Navigation**: 1-click **"🧭 Directions"** button on every single card opening the exact spot in Google Maps with pre-verified latitude & longitude coordinates.
* **Multi-Stop Route Generator**: Add spots to **"🎒 My Goa Trip"** and click **"🗺️ Open Route in Google Maps"** to automatically generate a single driving/riding route between all your saved stops!
* **Viral Reel & Photography Angles**: Specific shooting advice for creators (e.g., golden hour timings, 0.5x wide-angle tips, drone coordinates, reflections).
* **Multi-Day Curated Itineraries**:
  * ⚡ **The Viral North Goa 3-Day Trail** (Forts, Sunsets, Latin Quarter & Bohemian Beach Clubs)
  * 🌊 **The Serene South Goa 3-Day Soul Trail** (Lagoons, Cliffs, Dolphin Kayaks & Jungle Falls)
  * 🗺️ **The Grand 5-Day Master Goa Odyssey** (Best of Both Worlds)
* **Local Travel Hacks**: Practical advice on scooter/car rental rules, police checkpoints, the "GoaMiles" taxi hack (since Ola/Uber don't run in Goa), and Dabolim vs Mopa airport proximity.
* **Aesthetic Theme Switcher**: Cycle between **🌙 Ocean Dark**, **🌅 Goa Sunset**, and **☀️ Tropical Day** modes.

---

## ⚡ How to Deploy Live on Vercel in 60 Seconds

You have 3 easy ways to make this website live on Vercel:

### Method 1: Using the Vercel CLI (Fastest)

1. Open your terminal in this project directory:
   ```bash
   cd /Users/shreyas/Desktop/Dirindicsearch
   ```
2. Run the Vercel deploy command:
   ```bash
   npx vercel
   ```
3. Follow the on-screen prompts:
   - *Set up and deploy?* Press **Y**
   - *Which scope?* Select your account
   - *Link to existing project?* Press **N**
   - *What's your project's name?* Press **Enter** (or type `goa-travel-guide`)
   - *In which directory is your code located?* Press **Enter** (current directory `./`)
4. To deploy to your production custom domain:
   ```bash
   npx vercel --prod
   ```
   Your site is now live at `https://goa-travel-guide.vercel.app`! 🎉

---

### Method 2: Deploy via GitHub (Recommended for automatic updates)

1. Initialize a git repository and push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Goa Escape Travel Website"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/goa-travel-guide.git
   git push -u origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new).
3. Import your `goa-travel-guide` repository.
4. Click **Deploy**. Vercel will detect the static site and deploy it in under 10 seconds.
5. Every time you push a change to GitHub, Vercel will automatically redeploy!

---

### Method 3: Drag & Drop Deploy (Zero terminal commands)

1. Open [vercel.com](https://vercel.com) and log in.
2. Click **Add New** -> **Project**.
3. Drag and drop the `Dirindicsearch` folder directly into the browser window.
4. Click **Deploy**. Your site is instantly live!

---

## 📁 File Structure

```text
├── index.html          # Main HTML structure with semantic components & Open Graph tags
├── css/
│   └── style.css       # Tropical Goa aesthetic, glassmorphism, responsive grids, themes
├── js/
│   ├── data.js         # Curated database of 24+ viral spots, 3 itineraries, & travel tips
│   └── app.js          # Interactive search, region switcher, bucket list, modals & maps
├── vercel.json         # Vercel caching, clean URLs, and security headers config
├── package.json        # Metadata and npm start/deploy scripts
└── README.md           # Documentation & deployment guide
```

---

## 💻 Local Preview

To test or preview the website locally on your computer:

```bash
# Option A: With Python 3 (built-in on Mac)
python3 -m http.server 3000

# Option B: With Node.js npx
npx serve .
```

Then open `http://localhost:3000` in your web browser!
