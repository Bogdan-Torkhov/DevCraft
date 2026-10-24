# DevCraft — Developer & Designer Showcase Platform

> Built with **Next.js 15 (App Router)**, **React 19**, **Tailwind CSS**, and **native SQLite (`node:sqlite`)**.

DevCraft is a community showcase platform for software engineers and UI/UX designers to discover, inspect, and run cutting-edge web components, generative canvas experiments, and interactive micro-interactions.

---

## 🌟 Key Highlights

- **Live Code & UI Sandboxes**: Every project can include runnable HTML/CSS/JS code with an isolated interactive iframe runner, desktop/tablet/mobile viewport switchers, reload control, and fullscreen mode.
- **Standalone Authentication & Demo Switching**: 1-click persona switching (Elena Rostova, Marcus Chen, Alex Rivera, Sophie Laurent) + complete custom user registration and session management. Works 100% offline with zero external API keys.
- **Dynamic Exploration & Real-Time Filtering**: Instant client-side search, tag pills (`#React`, `#Tailwind`, `#Canvas`, `#CreativeCoding`, `#WebGL`, `#Components`, `#CSSArt`, `#Microinteractions`), and sorting (`Trending`, `Recent`, `Most Starred`, `Most Viewed`).
- **Interactive Project Publishing Studio**: Live authoring modal with real-time sandbox preview before publishing.
- **Optimistic Star System & Peer Discussions**: Upvoting and threaded comment discussions persisted in SQLite with instantaneous UI updates via Server Actions.
- **Creator Profiles**: Dedicated showcase portfolios for each creator displaying their published creations, stars earned, view counters, and social links.
- **Sleek Dark Mode Glassmorphism**: Polished dark aesthetics inspired by modern developer platforms (Linear, Raycast, Vercel) with subtle ambient neon glows and smooth transitions.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build & Start
```bash
npm run build
npm run start
```

---

## 🛠 Tech Stack & Architecture

- **Framework**: [Next.js 16/15 (App Router)](https://nextjs.org) with React 19 Server Components & Server Actions
- **Styling**: Tailwind CSS with custom glassmorphism panels, glowing borders, and dark obsidian theme
- **Database**: SQLite powered by Node.js native `node:sqlite` (zero compilation, zero cloud dependencies)
- **Icons**: Lucide React + custom inline SVGs
- **Security**: HttpOnly cookie sessions with bcrypt password hashing

---

## 👥 Pre-seeded Demo Personas

When running the app, click **"Switch Persona"** in the top navigation bar to test the platform as any of the creators:
1. **Elena Rostova** (`elena_design`): Design Systems Lead & Ex-Linear Designer
2. **Marcus Chen** (`marcus_code`): Creative Technologist & WebGL / Canvas Engineer
3. **Alex Rivera** (`alex_fullstack`): Fullstack Architect & Next.js Dev
4. **Sophie Laurent** (`sophie_css`): Frontend & CSS Artist

Default password for demo accounts: `devcraft123`.
