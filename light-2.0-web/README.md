# Light - Waitlist Website 🌟

A beautiful, animated waitlist landing page built with Next.js, Supabase, and Framer Motion.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)

## ✨ Features

- 🎨 **Beautiful UI** - Modern, clean design with gradient backgrounds
- 🎭 **Smooth Animations** - Engaging animations powered by Framer Motion
- 📧 **Email Collection** - Secure email storage with Supabase
- ✅ **Validation** - Email validation and duplicate checking
- 🌓 **Dark Mode** - Automatic dark mode support
- 📱 **Responsive** - Works perfectly on all devices
- ⚡ **Fast** - Built with Next.js 15 and Turbopack

## 🚀 Quick Start

### 1. Clone and Install

```bash
npm install
```

### 2. Set Up Supabase

Follow the detailed instructions in [SETUP.md](./SETUP.md) to:
- Create a Supabase project
- Set up the waitlist table
- Configure environment variables

### 3. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your waitlist page!

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── waitlist/
│   │       └── route.ts       # API endpoint for waitlist
│   ├── layout.tsx             # Root layout with metadata
│   ├── page.tsx               # Main waitlist page
│   └── globals.css            # Global styles
├── components/
│   ├── ui/                    # Shadcn UI components
│   └── WaitlistForm.tsx       # Waitlist form component
└── lib/
    ├── supabase.ts            # Supabase client
    └── utils.ts               # Utility functions
```

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org)
- **Language:** [TypeScript](https://www.typescriptlang.org)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com)
- **Animations:** [Framer Motion](https://www.framer.com/motion)
- **Database:** [Supabase](https://supabase.com)
- **Validation:** [Zod](https://zod.dev)

## 📝 Environment Variables

Create a `.env.local` file with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 🎨 Customization

### Change Branding
- Update the title in `src/app/page.tsx`
- Modify metadata in `src/app/layout.tsx`
- Adjust colors in `src/app/globals.css`

### Modify Animations
- Edit animation settings in `src/components/WaitlistForm.tsx`
- Adjust background effects in `src/app/page.tsx`

## 📊 Viewing Waitlist Data

Access your waitlist data in the Supabase dashboard:
1. Go to your project dashboard
2. Navigate to "Table Editor"
3. Select the "waitlist" table

## 🚀 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push your code to GitHub
2. Import repository on Vercel
3. Add environment variables
4. Deploy!

## 📖 Documentation

For detailed setup instructions, see [SETUP.md](./SETUP.md)

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit PRs.

## 📄 License

MIT License - feel free to use this for your own projects!

---

Built with ❤️ using Next.js and Supabase
