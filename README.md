<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Aureus Tasking

A collaborative task and team management app built with React and TypeScript. Manage your team, track tasks, schedule meetings, and visualize your team's global availability — all in one place.

## Features

- **Team Management** — Add team members with their locations, timezones, and working hours
- **Task Tracking** — Assign tasks with priorities, due dates, tags, and time tracking
- **Meeting Notes** — Rich text meeting editor with `@mention` support and task extraction
- **World Clock** — Visualize your team's working hours across timezones
- **Dark / Light Mode** — Full theme support
- **Optional AI Assist** — If a Gemini API key is configured, the meeting editor gains an AI summarization feature and the add-member form can auto-detect timezones from a location name

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```
   npm install
   ```
2. Run the app:
   ```
   npm run dev
   ```

> **Optional:** To enable AI-powered features (auto timezone detection & meeting summarization), create a `.env.local` file and add your Gemini API key:
> ```
> GEMINI_API_KEY=your_key_here
> ```

## Tech Stack

- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
