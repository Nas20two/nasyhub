# NaSy Hub — AI Portfolio & Personal Site

![Site Preview](https://placeholder-screenshot.png)

> **Portfolio showcasing AI projects, creative work, and professional journey.**

**🚀 Live Site:** https://nasyhub.lovable.app

## 🎯 What It Is

NaSy Hub is my personal portfolio and professional showcase:
- **Projects** — All my AI-powered apps and tools
- **Creative Work** — Music, visual art, experiments
- **Resume/CV** — Professional background and experience
- **Contact** — Ways to connect and collaborate

## ✨ Features

- **Dynamic Project Showcase** — Projects pulled from Supabase (easy updates)
- **Admin Dashboard** — Manage projects, content, and site settings
- **Authentication** — Secure admin access
- **Resume Download** — Token-protected PDF downloads
- **Responsive Design** — Works beautifully on all devices
- **PWA Support** — Install as native app

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Supabase (Auth + Database + Storage) |
| State | React Query (TanStack) |
| Routing | React Router |
| Build | Vite |
| PWA | vite-plugin-pwa |

## 🚀 Deployment

### Prerequisites
- Node.js 18+
- Supabase account

### Environment Variables
```bash
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_URL=your_supabase_url
```

### Local Development
```bash
npm install
npm run dev
```

### Deploy to Vercel
```bash
npm i -g vercel
vercel --prod
```

## 📊 What I Learned

Building my portfolio taught me:

1. **Content management via database** — Using Supabase means I can update projects without redeploying. Just add a row to the database.

2. **Protected routes matter** — Admin pages need authentication checks. React Router + Supabase Auth makes this clean.

3. **Portfolio as product** — Treating my portfolio like a product (iterative updates, analytics, user feedback) makes it better than a static page.

## 🔮 Managing Content

### Adding Projects
1. Log into Supabase dashboard
2. Go to Table Editor → `apps` table
3. Add new row with:
   - `name` — Project name
   - `description` — What it does
   - `app_url` — Live demo link
   - `tags` — Tech stack tags
   - `image_url` — Screenshot URL
   - `is_active` — Show/hide

### Updating Resume
Upload new PDF to Supabase Storage, update download links in admin.

## 🔮 Roadmap

- [x] Dynamic project showcase
- [x] Admin dashboard
- [x] Authentication
- [x] Resume download
- [x] PWA support
- [ ] Analytics dashboard
- [ ] Blog/Writing section
- [ ] Newsletter signup
- [ ] Custom domain (nasyhub.com)

## 🤝 Why I Built This

I needed a portfolio that grows with me:
- **Not static** — Easy to update without coding
- **Professional** — Shows I can build full-stack apps
- **Flexible** — Can add new sections as needed

**Hiring?** Check out my projects: [github.com/Nas20two](https://github.com/Nas20two)

---

Built with ❤️ by [NaSy](https://github.com/Nas20two)
