# SB Construction — Sandhu Brothers

> **Built Right. Every Time.**

A premium, fully responsive single-page website for **SB Construction**, a Perth-based building, landscaping, and painting company run by the Sandhu Brothers. Built with vanilla HTML, CSS, and JavaScript — no frameworks, no dependencies, just fast and polished.

🌐 **Live Demo:** [sb-construction-eight.vercel.app](https://sb-construction-eight.vercel.app)

---

## Features

- Cinematic intro loader with canvas particle animation and curtain-rip reveal
- Editorial hero with giant overlapping display type and floating image card
- Apple-style sticky scroll section with image transitions
- Photo service cards with 3 full-width category banners
- Drag-to-explore horizontal photo gallery
- Interactive before & after drag slider
- Animated number counters, scroll-reveal animations, and magnetic CTAs
- Testimonials carousel with auto-advance
- Suburb marquee and services ticker strip
- Contact form that pre-fills and opens the user's email client
- Dark / light mode toggle
- Fully mobile responsive

---

## Services Offered

### 🏗️ Building & Renovation
- Building Maintenance & Renovation
- Retaining Walls
- Concrete (driveways, pathways, slabs)
- Cladding (timber, stone, panel)
- Decking (hardwood, composite, spotted gum)
- Fencing (Colorbond, timber, aluminium, pool)

### 🌿 Landscaping & Garden
- Artificial Grass
- Real Grass / Turf Laying
- Plants & Mulching
- Stone & Steppers
- Limestone & Panel/Post
- Garden Maintenance

### 🎨 Painting Services
- Exterior & Interior Painting (Residential & Commercial)
- Garage Epoxy / Flake Flooring
- Roof Painting
- Texture Coating
- Pressure Washing
- Wallpaper Installation & Removal

---

## Contact Details

| Channel | Details |
|---------|---------|
| 📞 Phone | [0497 579 997](tel:0497579997) |
| 📧 Email | [sbconstruction0001@gmail.com](mailto:sbconstruction0001@gmail.com) |
| 📍 Location | Perth, WA, Australia |

---

## Project Structure

```
sb-construction/
├── index.html              # Main single-page HTML
├── style.css               # All styles (premium design system)
├── script.js               # Interactions, animations, carousel
├── logo.png                # SB Construction badge logo
├── sb_hero.png             # Hero background image
├── sb_garden.png           # Landscaping section image
├── sb_painting.png         # Painting section image
├── sb_concrete_deck.png    # Building section image
├── sb_before.png           # Before/after slider — before
├── sb_after.png            # Before/after slider — after
├── sb_epoxy.png            # Gallery image
├── sb_fencing.png          # Gallery image
├── sb_interior.png         # Gallery image
├── svc_banner_building.png       # Building category banner
├── svc_banner_landscaping.png    # Landscaping category banner
├── svc_banner_painting.png       # Painting category banner
├── svc_maintenance.png           # Service card photos (×18)
├── svc_retaining.png
├── svc_concrete.png
├── svc_cladding.png
├── svc_decking.png
├── svc_fencing_card.png
├── svc_artificial_grass.png
├── svc_real_grass.png
├── svc_plants_mulch.png
├── svc_steppers.png
├── svc_limestone.png
├── svc_garden_maint.png
├── svc_interior_paint.png
├── svc_epoxy_card.png
├── svc_roof_paint.png
├── svc_texture.png
├── svc_pressure_wash.png
└── svc_wallpaper.png
```

---

## Deploying with Vercel

### Option 1 — Vercel Dashboard (Recommended)

1. Push this repo to GitHub (already done)
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click **Add New → Project**
4. Import the `sb-construction` repository from GitHub
5. Leave all settings as default (no build command needed — it's a static site)
6. Click **Deploy**

Your site will be live at a `*.vercel.app` URL within seconds.

### Option 2 — Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from the project directory
cd sb-construction
vercel --prod
```

Follow the prompts on first run. Subsequent deploys:

```bash
vercel --prod --yes
```

### Automatic Redeployment

Once connected to GitHub via the Vercel dashboard, every `git push` to the `main` branch will trigger an automatic production deployment — no manual steps needed.

```bash
git add -A
git commit -m "Your update message"
git push origin main
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | HTML5 (semantic) |
| Styling | CSS3 (custom properties, grid, flexbox, clamp) |
| Scripting | Vanilla JavaScript (ES6+) |
| Fonts | [Clash Display](https://www.fontshare.com/fonts/clash-display) + [Satoshi](https://www.fontshare.com/fonts/satoshi) via Fontshare |
| Hosting | [Vercel](https://vercel.com) |
| Version Control | [GitHub](https://github.com/kawalshah/sb-construction) |

---

## License

This project is proprietary. All content, images, and code are owned by **SB Construction — Sandhu Brothers**.  
© 2026 SB Construction. All rights reserved.
