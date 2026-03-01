# Quick Start Guide

## Step 1: Get Your API Keys

### OpenAI API Key
1. Go to https://platform.openai.com/api/keys
2. Click "Create new secret key"
3. Copy it (you'll only see it once)

### RapidAPI VIN Decoder Key
1. Go to https://rapidapi.com/vin-decoder19-api/api/vin-decoder19
2. Click "Subscribe to Test"
3. In your dashboard, find your API key under "API key"
4. Copy your API key

## Step 2: Setup Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your favorite editor and add your keys
# OPENAI_API_KEY=your_key_here
# RAPIDAPI_KEY=your_key_here
```

## Step 3: Install & Run

```bash
# Install dependencies
npm install

# Start the server
npm start

# Or for development with auto-reload:
npm run dev
```

## Step 4: Open in Browser

Navigate to `http://localhost:3000`

## Features Overview

### 🔍 Research Tab
- Enter a car's make, model, year, and mileage OR a VIN
- Get reliability info, common issues, pricing, and safety ratings
- AI-powered research for comprehensive vehicle analysis

### 🚗 Test Drive Tab
- Get a detailed inspection checklist for your specific vehicle
- Learn what to look for before, during, and after the test drive
- Model-specific red flags and concerns

### 💰 Negotiation Tab
- Enter the asking price for a vehicle
- Get market analysis and fair price range
- Get recommended opening offer and walk-away price
- Learn specific negotiation points and strategies

## Example Workflow

1. **Find a car** you're interested in (make, model, year)
2. **Research** it using the Research tab to understand common issues
3. **Get Test Drive Guide** for that specific model
4. **Prepare questions** for the seller
5. **Negotiate** using the negotiation strategy based on market data

## Troubleshooting

### "API Key Error"
- Check that `.env` file exists and has correct keys
- Make sure there are no extra spaces in the keys
- Verify keys are still valid (OpenAI keys can be revoked)

### "Failed to decode VIN"
- VINs must be exactly 17 characters
- Check for typos in the VIN
- The RapidAPI service might be down - check their status page

### Port 3000 Already in Use
```bash
# Use a different port
PORT=3001 npm start
```

## Common Questions

**Q: Will my API keys be safe?**
A: API keys are stored locally in `.env` and never sent to anyone but OpenAI and RapidAPI. Never commit `.env` to git.

**Q: Is there a cost to use this?**
A: OpenAI charges per request (very cheap). RapidAPI has a free tier for VIN decoding. Check their pricing pages.

**Q: Can I save my searches?**
A: Not yet, but that's planned for a future update!

**Q: Will this app work offline?**
A: No, it requires internet to call the AI and VIN decoder services.

## Next Steps

- Check the README.md for more detailed API documentation
- Explore the source code in `routes/` and `services/`
- Customize the frontend in `public/index.html`
- Add your own car data to `data/carDatabase.js`
