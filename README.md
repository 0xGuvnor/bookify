# 📅 Bookify - Your Calendly Clone

> Because scheduling meetings shouldn't be rocket science! 🚀

Bookify is a modern, full-featured scheduling application that lets you create events, manage your availability, and allow others to book time with you seamlessly. Built with the latest Next.js 15 App Router and a powerful tech stack.

## ✨ Features

- **🔐 Authentication**: Secure user authentication with Clerk
- **📅 Event Management**: Create, edit, and manage your scheduling events
- **⏰ Availability Settings**: Set your working hours and availability
- **🔗 Public Booking**: Share your booking link for others to schedule with you
- **📱 Responsive Design**: Beautiful UI that works on all devices
- **🎨 Modern UI**: Built with shadcn/ui and Tailwind CSS
- **⚡ Real-time Updates**: Fast and responsive user experience
- **🔒 Private Dashboard**: Manage your events and schedule privately

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Clerk
- **Styling**: Tailwind CSS + shadcn/ui
- **Package Manager**: Bun
- **Deployment**: Vercel-ready

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Bun (preferred package manager)
- PostgreSQL database

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd bookify
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:

   ```env
   # Database
   DATABASE_URL="your-postgresql-connection-string"

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
   CLERK_SECRET_KEY="your-clerk-secret-key"

   # Clerk URLs
   NEXT_PUBLIC_CLERK_SIGN_IN_URL="/login"
   NEXT_PUBLIC_CLERK_SIGN_UP_URL="/register"
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/events"
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/events"
   ```

4. **Run database migrations**

   ```bash
   bun db:push
   ```

5. **Start the development server**

   ```bash
   bun dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (main)/            # Main application
│   │   ├── (private)/     # Protected routes
│   │   └── (public)/      # Public booking pages
├── components/            # Reusable UI components
│   ├── forms/            # Form components
│   ├── skeletons/        # Loading skeletons
│   └── ui/               # shadcn/ui components
├── lib/                  # Utilities and configurations
│   ├── actions/          # Server actions
│   ├── db/              # Database schema and connection
│   ├── types/           # TypeScript type definitions
│   └── validations/     # Zod validation schemas
```

## 🎯 Usage

1. **Sign Up/Login**: Create an account or login with Clerk
2. **Create Events**: Set up your schedulable events with duration and details
3. **Set Availability**: Configure your working hours and availability
4. **Share Your Link**: Give others your booking link to schedule with you
5. **Manage Bookings**: View and manage your scheduled events

## 🔧 Available Scripts

- `bun dev` - Start development server
- `bun build` - Build for production
- `bun start` - Start production server
- `bun lint` - Run ESLint
- `bun db:push` - Push database schema changes
- `bun db:studio` - Open Drizzle Studio

## 🤝 Contributing

This is a personal project, but feel free to fork it and make it your own! If you find bugs or have suggestions, open an issue.

## 📄 License

This project is for educational purposes. Feel free to use it as inspiration for your own scheduling app!

---

Built with ❤️ using Next.js 15 and modern web technologies.
