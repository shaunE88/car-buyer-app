# Architecture Overview

## Application Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Browser)                       │
│  - HTML/CSS/JavaScript UI at http://localhost:3000          │
│  - Three tabs: Research | Test Drive | Negotiation          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP Requests
                     ▼
┌─────────────────────────────────────────────────────────────┐
│            Express.js Backend (Node.js)                     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Routes Layer                                        │   │
│  │  ├─ POST /api/research/by-details                    │   │
│  │  ├─ POST /api/research/by-vin                        │   │
│  │  ├─ GET  /api/research/makes                         │   │
│  │  ├─ GET  /api/test-drive/checklist                   │   │
│  │  ├─ POST /api/test-drive/questions-for-seller        │   │
│  │  └─ POST /api/negotiation/strategy                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                     │                                        │
│                     ▼                                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Services Layer                                      │   │
│  │  ├─ openaiService.js                                 │   │
│  │  │  ├─ generateCarResearch()                         │   │
│  │  │  ├─ generateTestDriveGuide()                      │   │
│  │  │  ├─ generateNegotiationStrategy()                 │   │
│  │  │  └─ generateQuestionsForSeller()                  │   │
│  │  │                                                    │   │
│  │  └─ vinDecoder.js (via RapidAPI)                     │   │
│  │     └─ decodeVin()                                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                     │         │                              │
└─────────────────────┼─────────┼──────────────────────────────┘
                      │         │
                      │         │ HTTP Calls
                      ▼         ▼
        ┌──────────────────┐   ┌────────────────────┐
        │   OpenAI API     │   │   RapidAPI VIN     │
        │  (Claude Model)  │   │    Decoder         │
        └──────────────────┘   └────────────────────┘
```

## Data Flow Example: Research a Car by VIN

```
User Input (VIN + Mileage)
         │
         ▼
┌─────────────────────────────┐
│ POST /api/research/by-vin   │
└──────────────┬──────────────┘
               │
               ▼
        ┌─────────────┐
        │ vinDecoder  │──────────┐
        └─────────────┘          │
               │                 │
               ▼                 ▼
    ┌────────────────┐   ┌──────────────────┐
    │ Validate VIN   │   │ RapidAPI Request │
    │ (17 chars)     │   │ → Get Make/Model │
    └────────────────┘   │   /Year/Style    │
                         └──────────────────┘
               │                 │
               └────────┬────────┘
                        ▼
            ┌─────────────────────┐
            │ Extract: Make,Model │
            │ Year, BodyStyle etc │
            └──────────┬──────────┘
                       │
                       ▼
            ┌─────────────────────┐
            │ Check carDatabase   │
            │ for cached info     │
            └──────────┬──────────┘
                       │ Not found
                       ▼
            ┌─────────────────────┐
            │ generateCarResearch │ ──► OpenAI API
            │ (openaiService.js)  │
            └──────────┬──────────┘
                       │ AI Response
                       ▼
        ┌──────────────────────────┐
        │ Format Response with VIN │
        │ data + AI research       │
        └──────────┬───────────────┘
                   │
                   ▼
          ┌─────────────────┐
          │ Return JSON to  │
          │ Frontend        │
          └─────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Display Results in   │
        │ Browser              │
        └──────────────────────┘
```

## Component Responsibilities

### Frontend (`public/index.html`)
- **UI Rendering**: Three-tab interface for different features
- **Form Handling**: Collect user input (make/model/year, VIN, mileage, price)
- **API Calls**: Send requests to backend endpoints
- **Results Display**: Format and show AI-generated recommendations

### Backend Routes
- **research.js**: Handles car research by details or VIN
- **testDrive.js**: Provides test drive checklists and seller questions
- **negotiation.js**: Generates price negotiation strategies

### Services
- **openaiService.js**: 
  - Calls OpenAI/Claude with specific prompts
  - Returns structured JSON responses
  - Handles all AI-powered analysis

### Utils
- **vinDecoder.js**: 
  - Calls RapidAPI VIN Decoder service
  - Extracts make, model, year, body style from VIN
  - Handles API errors gracefully

### Data
- **carDatabase.js**: 
  - Fallback data for common vehicles
  - Reduces API calls for popular cars
  - Can be expanded with more vehicles

## API Response Structure

### Research Response
```json
{
  "vehicle": {
    "make": "Toyota",
    "model": "Camry",
    "year": 2023,
    "mileage": 45000,
    "vin": "...", // if from VIN search
    "bodyStyle": "Sedan"
  },
  "commonIssues": ["..."],
  "reliability": "Excellent",
  "averagePrice": "$28,500 - $32,000",
  "fuelEconomy": "28-32 MPG",
  "safetyRating": "...",
  "maintenanceCosts": "Low",
  "resaleValue": "Excellent",
  "keyFeatures": ["..."]
}
```

### Test Drive Response
```json
{
  "preTestDriveChecks": ["..."],
  "exteriorInspection": ["..."],
  "interiorInspection": ["..."],
  "engineCompartment": ["..."],
  "testDrivePoints": ["..."],
  "redFlags": ["..."],
  "modelSpecificConcerns": ["..."]
}
```

### Negotiation Response
```json
{
  "vehicle": {
    "make": "Toyota",
    "model": "Camry",
    "year": 2023,
    "mileage": 45000,
    "sellingPrice": 28500
  },
  "marketAnalysis": "...",
  "fairPriceRange": "...",
  "suggestedOpeningOffer": 27000,
  "walkawayprice": 26000,
  "negotiationPoints": ["..."],
  "negotiationTips": ["..."],
  "possibleIssuesBasedOnMileage": ["..."]
}
```

## Technology Stack Details

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | HTML5 | Structure |
| | CSS3 | Styling & animations |
| | Vanilla JS | Interactivity (no frameworks needed) |
| Backend | Node.js | Runtime |
| | Express.js | HTTP server & routing |
| | body-parser | JSON request parsing |
| | CORS | Cross-origin requests |
| | dotenv | Environment variable management |
| AI | OpenAI API | Intelligent analysis & generation |
| | Claude 3.5 Sonnet | LLM model |
| External APIs | RapidAPI | VIN decoding service |
| | Axios | HTTP client for API calls |

## Deployment Considerations

### Environment Variables
- `OPENAI_API_KEY`: OpenAI API key (required)
- `RAPIDAPI_KEY`: RapidAPI key (required)
- `RAPIDAPI_HOST`: RapidAPI host (default: vin-decoder19.p.rapidapi.com)
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: development or production

### Scaling Opportunities
1. **Caching**: Add Redis for popular searches
2. **Database**: Store user preferences and search history
3. **Rate Limiting**: Prevent API abuse
4. **Marketplace Integration**: Add car listing scrapers (future)
5. **Authentication**: User accounts for saved searches
6. **Monitoring**: Error tracking and performance monitoring

## Security Notes

1. **API Keys**: Never commit `.env` file to git
2. **Rate Limiting**: Implement limits on API endpoints
3. **Input Validation**: All user inputs are validated
4. **HTTPS**: Use HTTPS in production
5. **CORS**: Currently allows all origins (restrict in production)

## Future Architecture Enhancements

```
┌─────────────────────────────────────────────┐
│         User Authentication                 │
│  (Future: login, saved searches, history)   │
└─────────────────────────────────────────────┘
              │
              ▼
    ┌─────────────────────┐
    │   Database Layer    │
    │  (MongoDB/PostgreSQL)
    │  - Users            │
    │  - Searches         │
    │  - Saved Listings   │
    └─────────────────────┘
              │
              ▼
    ┌─────────────────────┐
    │  Agent Framework    │
    │ (AutoGPT/LangChain) │
    │  - Market Shopper   │
    │  - Auto Purchase    │
    │  - Monitoring       │
    └─────────────────────┘
              │
              ▼
    ┌─────────────────────┐
    │ Marketplace APIs    │
    │  - CarGurus         │
    │  - Autotrader       │
    │  - Facebook Market  │
    │  - Craigslist       │
    └─────────────────────┘
```

This represents the vision for eventual autonomous agent capabilities to shop and purchase cars on behalf of users.
