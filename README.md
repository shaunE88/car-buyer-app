# 🚗 Car Buyer Assistant

An intelligent web application that helps car buyers research vehicles, prepare for test drives, and negotiate prices with confidence using AI-powered analysis.

## Features

### 🔍 **Car Research**
- Search by make, model, year, and mileage
- Search by VIN (17-character code)
- Get comprehensive vehicle information:
  - Reliability ratings
  - Common issues and recalls
  - Fuel economy expectations
  - Safety ratings
  - Average market prices
  - Maintenance costs
  - Resale value outlook

### 🚗 **Test Drive Guide**
- Model-specific inspection checklist
- Pre-test drive preparation steps
- Detailed exterior, interior, and engine checks
- Test drive points to evaluate
- Red flags to watch for
- Known issues for specific model years

### 💰 **Price Negotiation**
- Market analysis for your specific vehicle
- Fair price range recommendations
- Suggested opening offer based on market data
- Walk-away price threshold
- Specific negotiation points
- Expert negotiation strategies
- Issues to raise based on mileage

## Setup

### Prerequisites
- Node.js 18+ and npm
- OpenAI API key (from https://platform.openai.com)
- RapidAPI key with access to VIN Decoder API (from https://rapidapi.com/vin-decoder19-api/api/vin-decoder19)

### Installation

1. Clone or download this repository:
```bash
cd car-buyer-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Edit `.env` and add your API keys:
```env
OPENAI_API_KEY=your_openai_api_key_here
RAPIDAPI_KEY=your_rapidapi_key_here
RAPIDAPI_HOST=vin-decoder19.p.rapidapi.com
NODE_ENV=development
PORT=3000
```

### Getting API Keys

#### OpenAI API Key
1. Visit https://platform.openai.com/api/keys
2. Sign up or log in
3. Create a new API key
4. Copy the key to your `.env` file

#### RapidAPI Key
1. Visit https://rapidapi.com/vin-decoder19-api/api/vin-decoder19
2. Sign up or log in
3. Subscribe to the VIN Decoder API (free tier available)
4. Copy your API key to `.env`

## Running the Application

### Development Mode
```bash
npm run dev
```
This watches for file changes and auto-restarts the server.

### Production Mode
```bash
npm start
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Research Routes
- `POST /api/research/by-details` - Research by make, model, year, mileage
- `POST /api/research/by-vin` - Research by VIN and mileage
- `GET /api/research/makes` - Get available car makes
- `GET /api/research/models/:make` - Get models for a make
- `GET /api/research/years/:make/:model` - Get years for a model

### Test Drive Routes
- `GET /api/test-drive/checklist?make=X&model=Y&year=Z` - Get detailed inspection guide
- `POST /api/test-drive/questions-for-seller` - Get questions to ask the seller

### Negotiation Routes
- `POST /api/negotiation/strategy` - Get negotiation strategy for a vehicle

## Example Usage

### Research a Car by Details
```bash
curl -X POST http://localhost:3000/api/research/by-details \
  -H "Content-Type: application/json" \
  -d '{"make": "Toyota", "model": "Camry", "year": 2023, "mileage": 45000}'
```

### Research a Car by VIN
```bash
curl -X POST http://localhost:3000/api/research/by-vin \
  -H "Content-Type: application/json" \
  -d '{"vin": "WBADT43452G297186", "mileage": 45000}'
```

### Get Test Drive Guide
```bash
curl "http://localhost:3000/api/test-drive/checklist?make=Toyota&model=Camry&year=2023"
```

### Get Negotiation Strategy
```bash
curl -X POST http://localhost:3000/api/negotiation/strategy \
  -H "Content-Type: application/json" \
  -d '{"make": "Toyota", "model": "Camry", "year": 2023, "mileage": 45000, "sellingPrice": 28500}'
```

## Technology Stack

- **Backend**: Node.js + Express.js
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **AI**: OpenAI API (Claude)
- **VIN Decoding**: RapidAPI VIN Decoder
- **Development**: Modular architecture with separate route handlers

## Project Structure

```
car-buyer-app/
├── server.js                 # Main Express server
├── package.json             # Dependencies
├── .env                      # API keys (not in git)
├── .env.example             # Template for .env
├── public/
│   └── index.html           # Frontend UI
├── routes/
│   ├── research.js          # Car research endpoints
│   ├── testDrive.js         # Test drive guide endpoints
│   └── negotiation.js       # Price negotiation endpoints
├── services/
│   └── openaiService.js     # OpenAI integration
├── utils/
│   ├── vinDecoder.js        # VIN decoding with RapidAPI
│   └── vinParser.js         # Basic VIN parsing
└── data/
    ├── carDatabase.js       # Fallback car data
    └── testDriveGuide.js    # Default test drive checklists
```

## Future Enhancements

- Integration with multiple marketplace APIs to auto-shop vehicles
- Agent-based purchasing system for automated car buying
- User accounts and saved searches
- Historical price tracking
- Dealer comparison
- Insurance cost estimates
- Financing options comparison

## Contributing

Feel free to improve the application by:
- Adding more vehicles to the car database
- Enhancing the test drive checklist
- Improving negotiation strategies
- Adding support for more languages

## License

MIT

## Support

For issues or questions, please create an issue in the repository.

---

**Happy car shopping! 🚗**
