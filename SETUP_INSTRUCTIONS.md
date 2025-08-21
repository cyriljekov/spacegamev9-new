# Echoes of Earth - Setup Instructions

## 🚀 Quick Start (Local Storage Only)

If you want to run the game immediately without setting up Supabase:

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Run the development server:**
   ```bash
   bun dev
   ```

3. **Open the game:**
   Navigate to http://localhost:3000

The game will work fully with local storage for saves. No database setup required!

## 🔧 Full Setup (With Cloud Saves)

For the complete experience with cloud saves and authentication:

### 1. Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase Configuration (optional - game works without it)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Gemini API Keys (required for AI Game Master)
NEXT_PUBLIC_GEMINI_API_KEY_1=your_gemini_api_key_1
NEXT_PUBLIC_GEMINI_API_KEY_2=your_gemini_api_key_2
NEXT_PUBLIC_GEMINI_API_KEY_3=your_gemini_api_key_3
NEXT_PUBLIC_GEMINI_API_KEY_4=your_gemini_api_key_4
NEXT_PUBLIC_GEMINI_API_KEY_5=your_gemini_api_key_5
NEXT_PUBLIC_GEMINI_API_KEY_6=your_gemini_api_key_6
NEXT_PUBLIC_GEMINI_API_KEY_7=your_gemini_api_key_7
NEXT_PUBLIC_GEMINI_API_KEY_8=your_gemini_api_key_8
```

### 2. Supabase Setup (Optional)

If you want cloud saves:

1. Create a Supabase project at https://supabase.com
2. Run the migration:
   ```sql
   -- Copy contents of supabase/migrations/001_initial_schema.sql
   -- Run in Supabase SQL editor
   ```
3. Add your Supabase credentials to `.env.local`

### 3. Gemini API Setup (Required)

1. Get API keys from https://aistudio.google.com/app/apikey
2. Create 8 different API keys for rate limit rotation
3. Add all keys to `.env.local`

## 📝 Important Notes

### Save System
- **Without Supabase**: Game uses local storage (5 save slots)
- **With Supabase**: Cloud saves with authentication support
- Both modes work seamlessly - the game auto-detects configuration

### API Keys
- The game requires at least one Gemini API key for the AI Game Master
- Using 8 keys provides better rate limit handling
- Keys rotate automatically to prevent rate limiting

## 🎮 Running the Game

### Development Mode
```bash
bun dev
```

### Production Build
```bash
bun run build
bun start
```

### Running Tests
```bash
# Unit tests
bun test src/

# E2E tests (requires running server)
bun test:e2e
```

## 🐛 Troubleshooting

### "Failed to get saves" Error
This is normal if Supabase is not configured. The game will use local storage automatically.

### Gemini API Errors
- Ensure at least one API key is configured
- Check that keys are valid at https://aistudio.google.com
- The game will retry with different keys automatically

### TypeScript Errors
```bash
bun add -d @types/minimatch
```

## 🚀 Deployment

### Vercel Deployment
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Manual Deployment
```bash
bun run build
# Upload .next folder to your hosting provider
```

## 📋 System Requirements

- Node.js 18+ or Bun 1.0+
- Modern browser with JavaScript enabled
- Internet connection (for AI Game Master)
- 1GB free disk space

## 🔗 Resources

- [Game Design Document](./echoes-of-earth-gdd-v9.md)
- [Development Plan](./DEVELOPMENT_PLAN.md)
- [Project Status](./PROJECT_STATUS.md)

## 💡 Tips

- Start without Supabase to test the game quickly
- Add Supabase later for cloud saves
- Use multiple Gemini API keys for better performance
- Save frequently - the game is challenging!

---

**Ready to play?** Run `bun dev` and navigate to http://localhost:3000