# 🏗️ CLAUDE CODE WEBSITE BUILDING WORKFLOW

> Based on Nate Herk's "5 Hacks to Make Claude Code Build Professional Websites"
> Video: https://www.youtube.com/watch?v=86HM0RUWhCk
> Adapted for: AI Automation Society / Compliance Agency Sites

---

## 📋 WORKFLOW OVERVIEW

This is a **step-by-step workflow** for using Claude Code to build professional, branded websites that don't look "AI vibe coded." It covers setup, prompting, iteration, and deployment.

---

## 🛠️ PREREQUISITES & SETUP

### Step 1: Install Visual Studio Code
1. Go to browser → Search "VS Code"
2. Download for your OS (Windows/Mac/Linux)
3. Install and open VS Code

### Step 2: Install Claude Code Extension
1. Click **Extensions** icon (left sidebar)
2. Search "Claude Code"
3. Install the extension
4. Sign in with your Anthropic subscription
   - **Pro** ($20/mo): Good for occasional use
   - **Max** ($100-200/mo): Needed for heavy website building all day

### Step 3: Open/Create Project Folder
1. Click **Explorer** (top-left)
2. Click **"Open Folder"**
3. Create a new folder (e.g., `website-project/`)
4. Open it — this is your workspace

### Step 4: Enable Bypass Mode (Optional but Recommended)
1. Go to **Settings** → Search "Claude Code"
2. Enable: **"Allow dangerously skip permissions"**
3. ⚠️ **Warning**: This lets Claude run commands without asking — only use when you're actively monitoring

---

## 🎯 THE 5-HACK WORKFLOW

---

### HACK #0: 📄 Create `claude.md` (System Prompt File)

**What it is:** A markdown file that acts as a **system prompt** — Claude reads this BEFORE every action in your project.

**Where to get it:** Download from Skool community → Classroom → Claude Code → `web-design-claude.md`

**What to include:**
```markdown
# Claude.md — Project Rules & Instructions

## Core Rules
- Always invoke the front-end design skill before writing any front-end code every session, no exceptions
- Use brand assets from `brand_assets/` folder for all design decisions
- Follow brand guidelines for colors, typography, and tone
- Test all changes on localhost before pushing to GitHub

## Screenshot Workflow
- After building sections, take screenshots using Puppeteer
- Review and polish with 2-pass screenshot comparison
- Name screenshots descriptively (e.g., `hero-v1.png`, `stats-v2.png`)

## Deployment Rules
- All changes tested on localhost first
- Only push to GitHub when explicitly told to do so
- Never push incomplete or broken code
```

**Setup:**
1. Download `claude.md` from Skool
2. Drag it into your VS Code project folder (left sidebar)
3. Claude will now read this file before every action

---

### HACK #1: 🎨 Install Front-End Design Skill

**What it is:** A custom skill that makes Claude generate **modern, professional designs** instead of generic AI-looking sites.

**Why it matters:** Without this skill, Claude gets you ~40% there. With it, you get ~60-70% — much closer to a real designer's work.

**Installation Commands:**
```bash
# Run these in Claude Code chat
claude skill install frontend-design
claude skill enable frontend-design
```

**What it does:**
- Adds design best practices to Claude's knowledge
- Improves layouts, typography, spacing, animations
- Makes sites look polished, not "vibe coded"

**Proof:** One tweet showed Claude Code using this skill to build a music player app with animations and dynamic elements — just from a simple prompt.

**How to use:**
- The `claude.md` file should include: *"Always invoke the front-end design skill before writing any front-end code every session, no exceptions"*
- Claude will automatically load the skill when you ask it to build UI

---

### HACK #2: 📸 Screenshot Loop (Self-Correction)

**What it is:** Claude takes screenshots of what it builds, compares them to expectations, and iterates on itself — **bridging the gap from 60% to 95%+ automatically**.

**How it works:**
1. Claude builds the site
2. Takes screenshots of each section (hero, stats, about, etc.)
3. Reviews what it built vs. what it should look like
4. Makes improvements
5. Repeats 2+ times until satisfied

**Setup (in `claude.md`):**
```markdown
## Screenshot Workflow
After building each section:
1. Use Puppeteer to take screenshots
2. Review each section (hero, stats, testimonials, etc.)
3. Do a 2-pass screenshot review and polish
4. Fix any visual issues before moving to next section
```

**What Claude does automatically:**
- Installs Puppeteer (headless browser for screenshots)
- Takes full-page and viewport screenshots
- Compares sections against design intent
- Self-corrects without manual prompting

**Pro Tip:** Screenshot folder (`temp-screenshots/`) is for Claude's benefit — you can check progress, but it's not meant to be pretty. Name screenshots descriptively in `claude.md` if you want to review them easily.

---

### HACK #3: 🌍 Clone Websites for Inspiration

**What it is:** Give Claude a screenshot + style code from ANY website, and it will clone it — then you rebrand it with your colors, logo, and copy.

**Step-by-Step Workflow:**

#### Step A: Find Inspiration
Visit sites like:
- **Dribbble** (dribbble.com) — UI design inspiration
- **Godly Website** (godly.website) — Curated beautiful sites
- **Awwwards** (awwwards.com) — Award-winning web design

#### Step B: Capture Full Screenshot
1. Open the inspiration site in browser
2. Press **F12** (Windows) or **Cmd+Option+I** (Mac) → DevTools
3. Open **Console**
4. Press **Cmd+Shift+P** (Mac) or **Ctrl+Shift+P** (Windows)
5. Type "screenshot" → Select **"Capture full size screenshot"**
6. Save the image to your computer

#### Step C: Copy Style Code
1. In DevTools, go to **Elements** tab
2. Scroll to the `<style>` section or inline styles
3. **Copy all the CSS/style code**
4. Save it or keep it ready to paste

#### Step D: Prompt Claude Code
```
Clear this session. I want you to spin up a new website for us. 
Get rid of the old one and put this one on localhost.

I want you to clone this website. Here's a screenshot:
[drag in the full-page screenshot]

And here's the style code:
[paste the copied CSS/style code]

Go ahead and clone this website for us.
```

**What Claude does:**
- Analyzes the screenshot visually
- Reads the style code for exact colors, fonts, spacing
- Builds a clone on localhost
- Uses screenshot loop to compare and refine (2+ passes)

**Result:** A near-identical clone — ready for your branding.

---

### HACK #3.5: 🔄 Rebrand the Clone

**Once Claude finishes the clone, rebrand it:**

```
The most recent landing page looks really good. What I want you to do now 
is work in our brand assets — our brand guidelines and our [Your Company] logo.

This is for our community called [Your Community Name]. Just work in those 
changes to the website clone you just built.
```

**What to have ready in `brand_assets/` folder:**
- **Logo** (PNG or SVG)
- **Brand Guidelines PDF** (colors, typography, icons, tone)

**What Claude will do:**
- Replace colors with your brand palette
- Swap in your logo
- Rewrite copy for your brand (English/French/any language)
- Mock up dashboards/graphics using your brand colors
- Convert all text from the original site to your language

**Example Result:**
- Original: French site with purple colors → Clone: English with YOUR colors
- Dashboard: Auto-generated with your brand theme
- Copy: Rewritten for your business (fill in real stats later)

---

### HACK #4: 🧩 Add Individual Components

**What it is:** Instead of cloning entire sites, grab **specific components** (buttons, backgrounds, animations) and integrate them into your site.

**Best Resource:** [21st.dev](https://21st.dev) — Premium UI components

**What you'll find:**
- **Shaders** — Animated backgrounds, gradients
- **Buttons** — Rainbow outlines, glow effects, shine
- **Backgrounds** — Hero waves, drop-down pills, particles
- **Mouse Effects** — Highlights, cursors, trails
- **Home Screens** — Hero sections, cards, layouts

**Step-by-Step:**

#### Step A: Find Component
1. Go to [21st.dev](https://21st.dev)
2. Browse categories (Buttons, Backgrounds, etc.)
3. Find one you like
4. Click **"Copy Prompt"** or copy the code snippet

#### Step B: Prompt Claude
```
I want you to work in this background element right behind the hero text.

[paste the component code from 21st.dev]

Because this is an animated background, do NOT use the screenshot tool 
to compare. Just work in the code and I will let you know if we need 
to make any changes.
```

**⚠️ Important:** For animated/dynamic elements, **disable screenshot loop** — screenshots can't capture animations properly, and Claude gets stuck in a loop thinking it's not good enough.

#### Step C: Iterate on Feedback
After Claude finishes, review the result. Give specific feedback:

```
I think the background is a little distracting and makes the hero text 
tough to read. Also:

1. Make "Earn More" a different color (blue, not orange)
2. Add a semi-transparent background behind the hero text for contrast
3. Make the background animation look more professional and clean — 
   less pixelated/fuzzy

Make these changes.
```

**Result:** Claude iterates and refines until you're satisfied.

---

## 🚀 DEPLOYMENT WORKFLOW (GitHub + Vercel)

### Overview:
```
Claude Code (Local) → GitHub (Version Control) → Vercel (Live Site)
```

### Step 1: Push to GitHub

#### A. Create GitHub Repository
1. Go to [github.com](https://github.com) → Create account if needed
2. Click **"+ New Repository"**
3. Name it (e.g., `ais-test-website`)
4. Click **"Create repository"**

#### B. Tell Claude to Push
```
Awesome. Now that this site looks good, we need to actually deploy it 
on our domain. I need you to help push this to GitHub. We're going to 
push it to a GitHub repository called: ais-test-website
```

**What Claude does:**
- Authenticates with GitHub (you'll need to log in)
- Creates `.gitignore` file
- Commits all files
- Pushes to your repository

**⚠️ Warning:** Don't push API keys, passwords, webhooks, or sensitive info to public repos.

### Step 2: Deploy to Vercel

#### A. Connect Vercel to GitHub
1. Go to [vercel.com](https://vercel.com)
2. Sign in with **GitHub credentials**
3. Click **"Add New Project"**
4. Select your GitHub repo → Click **"Import"**
5. Click **"Deploy"**

#### B. Visit Your Live Site
- Vercel gives you a URL: `your-project.vercel.app`
- This is now live and accessible to anyone

#### C. Add Custom Domain (Optional)
1. Go to **Project Settings** → **Domains**
2. Click **"Add"** → Buy a domain or add existing one
3. Follow DNS configuration steps
4. Your site is now on `yourdomain.com`

### Step 3: Update Workflow

**Rule:** Always test on localhost before pushing.

**Add to `claude.md`:**
```markdown
## Deployment Rules
- All changes tested on localhost first
- Only push to GitHub when explicitly told: "Push this to GitHub"
- Never auto-push — wait for approval
```

**Example Workflow:**
```
You (in Claude Code):
"Could you make the 'Join the Community' button more professional? 
Give it a cool glow effect. Once you've made this change, let me 
see it on localhost. DON'T push to GitHub until I tell you to."

Claude:
[makes changes, shows you localhost]

You (after reviewing):
"Awesome, I love that change. Go ahead and push that to GitHub."

Claude:
[commits and pushes to GitHub → Vercel auto-deploys]
```

---

## 🔄 COMPLETE WORKFLOW — END-TO-END

```
┌─────────────────────────────────────────────────────────────┐
│           CLAUDE CODE WEBSITE BUILDING WORKFLOW              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PHASE 1: SETUP                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 1. Install VS Code + Claude Code Extension           │   │
│  │ 2. Sign in with Anthropic (Pro/Max)                  │   │
│  │ 3. Create project folder                             │   │
│  │ 4. Download claude.md from Skool → drag to project   │   │
│  │ 5. Install frontend-design skill                     │   │
│  │ 6. Create brand_assets/ folder                       │   │
│  │    ├── Logo (PNG/SVG)                                │   │
│  │    └── Brand Guidelines (PDF)                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                  │
│  PHASE 2: BUILD (Choose One Path)                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ PATH A: From Scratch                                 │   │
│  │ → "Build me a modern landing page for [Company]"     │   │
│  │ → @tag brand_assets/ for branding                    │   │
│  │ → Claude invokes frontend-design skill               │   │
│  │ → Builds full site with screenshot loop              │   │
│  │                                                      │   │
│  │ PATH B: Clone from Inspiration                       │   │
│  │ → Find site on Dribbble/Godly/Awwwards               │   │
│  │ → Capture full-page screenshot (DevTools)            │   │
│  │ → Copy CSS/style code from Elements tab              │   │
│  │ → Prompt: "Clone this site" + screenshot + code      │   │
│  │ → Claude builds clone with screenshot comparison     │   │
│  │ → Then: "Work in our brand assets"                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                  │
│  PHASE 3: REFINE                                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 1. Review localhost preview                          │   │
│  │ 2. Give specific feedback (colors, spacing, text)    │   │
│  │ 3. Claude iterates + screenshots itself              │   │
│  │ 4. Repeat until satisfied                            │   │
│  │                                                      │   │
│  │ For Individual Components:                           │   │
│  │ → Go to 21st.dev → find component → copy code        │   │
│  │ → "Work this in behind hero text" + paste code       │   │
│  │ → Disable screenshot loop for animated elements      │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                  │
│  PHASE 4: DEPLOY                                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 1. Create GitHub repo                                │   │
│  │ 2. "Push this to GitHub: [repo-name]"                │   │
│  │ 3. Go to Vercel → Import GitHub repo → Deploy        │   │
│  │ 4. Add custom domain (optional)                      │   │
│  │ 5. Site is live!                                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                  │
│  PHASE 5: ITERATE (Ongoing)                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 1. Make changes in Claude Code (tested on localhost) │   │
│  │ 2. Review changes locally                            │   │
│  │ 3. When happy: "Push to GitHub"                      │   │
│  │ 4. Vercel auto-deploys new version                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 PROMPT TEMPLATES

### Template 1: Build From Scratch
```
Build me a modern and professional landing page for [Company Name].

Here's my logo: @brand_assets/logo.png
Here's my brand guidelines: @brand_assets/guidelines.pdf

Make it modern, clean, and on-brand with our colors and typography.
```

### Template 2: Clone a Site
```
I want you to spin up a new website for us. Get rid of the old one 
and put this one on localhost.

I want you to clone this website. Here's a screenshot:
[drag screenshot]

And here's the style code:
[paste CSS]

Go ahead and clone this website for us.
```

### Template 3: Rebrand Clone
```
The most recent landing page looks really good. What I want you to do 
now is work in our brand assets — our brand guidelines and our logo.

This is for our community called [Name]. Work in those changes to the 
clone you just built.
```

### Template 4: Add Component
```
I want you to work in this background element right behind the hero text.

[paste code from 21st.dev]

Because this is animated, do NOT use the screenshot tool to compare. 
Just work in the code and I will let you know if we need changes.
```

### Template 5: Give Feedback
```
The background is a bit distracting and makes the hero text hard to read.

1. Make [specific text] a [specific color]
2. Add a semi-transparent background behind hero text for contrast
3. Make the animation look more professional — less pixelated

Make these changes.
```

### Template 6: Test Locally (Don't Push)
```
Could you make [specific change]? Give it [specific effect]. 

Once you've made this change, let me see it on localhost. 
DON'T push to GitHub until I tell you to.
```

### Template 7: Push to Production
```
Awesome, I love that change. Go ahead and push that to GitHub.
```

---

## 🎯 BEST PRACTICES CHECKLIST

```
□ Always use claude.md — it's your system prompt
□ Install frontend-design skill — non-negotiable
□ Use brand_assets folder — logo + guidelines
□ Let Claude screenshot itself — enables self-correction
□ For clones: capture FULL page screenshot + copy CSS code
□ For animated components: DISABLE screenshot loop
□ Always test on localhost before pushing
□ Only push to GitHub when explicitly told to
□ Never push sensitive info (API keys, webhooks, passwords)
□ Iterate with specific feedback — don't be vague
□ Use plan mode for complex changes (asks questions first)
□ Keep claude.md updated — refine rules as you learn
□ Delete temp-screenshots/ between major builds to stay organized
```

---

## 📁 PROJECT FOLDER STRUCTURE

```
website-project/
│
├── claude.md                    # System prompt (MUST have)
├── brand_assets/                # Your brand files
│   ├── logo.png                 # Company logo
│   └── brand-guidelines.pdf     # Colors, typography, tone
│
├── temp-screenshots/            # Claude's self-review screenshots
│   ├── hero-v1.png
│   ├── hero-v2.png
│   ├── stats-v1.png
│   └── about-v1.png
│
├── index.html                   # Main website file
├── styles.css                   # Styles
├── script.js                    # JavaScript/animations
│
└── package.json                 # Puppeteer & dependencies
```

---

## 💰 COST ESTIMATES

| Action | Claude Credits Used |
|--------|-------------------|
| Build site from scratch | ~5-15 credits |
| Clone a website | ~10-25 credits |
| Add component | ~2-5 credits |
| Iterate/refine | ~1-3 credits per round |
| Push to GitHub | ~1-2 credits |

**Pro ($20/mo):** ~5-10 sites per month
**Max ($100-200/mo):** ~50+ sites per month

---

## 🔗 RESOURCES

| Resource | URL | Purpose |
|----------|-----|---------|
| Claude Code | anthropic.com/claude-code | AI coding agent |
| Frontend-Design Skill | Built-in to Claude | Professional UI output |
| 21st.dev | 21st.dev | Premium UI components |
| Dribbble | dribbble.com | Design inspiration |
| Godly | godly.website | Curated beautiful sites |
| Awwwards | awwwards.com | Award-winning web design |
| GitHub | github.com | Version control |
| Vercel | vercel.com | Site deployment |
| Skool Community | skool.com/ai-automation-society | Free claude.md file |

---

## 🚀 QUICK START — 10 MINUTES

```
1. Download VS Code → Install Claude Code extension (2 min)
2. Sign in with Anthropic Pro (1 min)
3. Create project folder → Download claude.md from Skool (2 min)
4. Install frontend-design skill (1 min)
5. Create brand_assets/ folder → Add logo + guidelines (2 min)
6. Prompt: "Build me a landing page for [Company] @brand_assets" (2 min)
7. Watch Claude build, screenshot, and self-correct (5-15 min)
8. Review on localhost → Give feedback → Iterate (5-10 min)
9. Push to GitHub → Deploy to Vercel (3 min)
10. Add custom domain → Site is LIVE! (5-10 min)
```

**Total: ~30-60 minutes from zero to live professional website**

---

> **Source:** Nate Herk — "5 Hacks to Make Claude Code Build Professional Websites"
> **Video:** https://www.youtube.com/watch?v=86HM0RUWhCk
> **Free claude.md:** Skool → AI Automation Society → Classroom → Claude Code
> **Next Step:** Install VS Code + Claude Code and start building!
