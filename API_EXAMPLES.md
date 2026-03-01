# API Examples & Usage

Complete curl command examples for testing all API endpoints.

## Prerequisites

Before running these commands:
1. Start the server: `npm start` or `npm run dev`
2. Server should be running at `http://localhost:3000`
3. API keys should be configured in `.env`

---

## RESEARCH ENDPOINTS

### 1. Research Car by Make, Model, Year, Mileage

Research a specific car with all its characteristics.

```bash
curl -X POST http://localhost:3000/api/research/by-details \
  -H "Content-Type: application/json" \
  -d '{
    "make": "Toyota",
    "model": "Camry",
    "year": 2023,
    "mileage": 45000
  }'
```

**Response Example:**
```json
{
  "vehicle": {
    "make": "Toyota",
    "model": "Camry",
    "year": 2023,
    "mileage": 45000
  },
  "commonIssues": ["..."],
  "reliability": "Excellent",
  "averagePrice": "$28,500 - $32,000",
  "fuelEconomy": "28-32 MPG",
  "safetyRating": "5 stars NHTSA",
  "maintenanceCosts": "Low",
  "resaleValue": "Excellent",
  "keyFeatures": ["Apple CarPlay", "Android Auto", "...]
}
```

---

### 2. Research Car by VIN

Decode a VIN and get comprehensive research for that exact vehicle.

```bash
curl -X POST http://localhost:3000/api/research/by-vin \
  -H "Content-Type: application/json" \
  -d '{
    "vin": "WBADT43452G297186",
    "mileage": 75000
  }'
```

**Sample VINs for Testing:**
- `WBADT43452G297186` - BMW
- `JTHBP26G505008104` - Toyota
- `1HGCM82633A123456` - Honda

**Response Example:**
```json
{
  "vehicle": {
    "vin": "WBADT43452G297186",
    "make": "BMW",
    "model": "X5",
    "year": 2016,
    "mileage": 75000,
    "bodyStyle": "Sport Utility Vehicle",
    "decoderData": {
      "Make": "BMW",
      "Model": "X5",
      "Year": 2016,
      "BodyType": "Sport Utility Vehicle",
      "...": "..."
    }
  },
  "commonIssues": ["..."],
  "reliability": "Good",
  "averagePrice": "$32,000 - $38,000",
  "...": "..."
}
```

---

### 3. Get Available Car Makes

List all car makes available in the database.

```bash
curl http://localhost:3000/api/research/makes
```

**Response Example:**
```json
{
  "makes": ["BMW", "FORD", "HONDA", "TOYOTA"]
}
```

---

### 4. Get Models by Make

Get all models available for a specific car make.

```bash
curl "http://localhost:3000/api/research/models/Toyota"
```

**Response Example:**
```json
{
  "make": "TOYOTA",
  "models": ["CAMRY", "COROLLA", "RAV4"]
}
```

---

### 5. Get Model Years

Get all available years for a specific make and model.

```bash
curl "http://localhost:3000/api/research/years/Toyota/Camry"
```

**Response Example:**
```json
{
  "make": "TOYOTA",
  "model": "CAMRY",
  "years": [2023, 2022, 2021, 2020]
}
```

---

## TEST DRIVE ENDPOINTS

### 1. Get Test Drive Checklist

Get a detailed inspection guide for a specific vehicle.

```bash
curl "http://localhost:3000/api/test-drive/checklist?make=Toyota&model=Camry&year=2023"
```

**Query Parameters:**
- `make`: Car manufacturer (required)
- `model`: Car model (required)
- `year`: Model year (required)

**Response Example:**
```json
{
  "preTestDriveChecks": [
    "Check vehicle registration and title",
    "Review maintenance history",
    "Check CarFax or AutoCheck report",
    "..."
  ],
  "exteriorInspection": [
    "Check for rust and body damage",
    "Inspect tires for wear and alignment",
    "..."
  ],
  "interiorInspection": [
    "Test all power windows and locks",
    "Check air conditioning and heating",
    "..."
  ],
  "engineCompartment": [
    "Check for fluid leaks",
    "Inspect hoses and belts",
    "..."
  ],
  "testDrivePoints": [
    "Test acceleration smoothly",
    "Test braking at different speeds",
    "..."
  ],
  "redFlags": [
    "Excessive engine knocking or pinging",
    "Transmission hesitation, slipping, or grinding",
    "..."
  ],
  "modelSpecificConcerns": [
    "..."
  ]
}
```

---

### 2. Get Questions for Seller

Get important questions to ask when viewing a vehicle.

```bash
curl -X POST http://localhost:3000/api/test-drive/questions-for-seller \
  -H "Content-Type: application/json" \
  -d '{
    "make": "Honda",
    "model": "Civic",
    "year": 2022
  }'
```

**Response Example:**
```json
{
  "vehicle": {
    "make": "Honda",
    "model": "Civic",
    "year": 2022
  },
  "history": [
    "Do you have all service records?",
    "Has this car been in any accidents?",
    "Has it been flooded or damaged by weather?",
    "..."
  ],
  "maintenance": [
    "When was the last oil change?",
    "When were brakes last serviced?",
    "..."
  ],
  "condition": [
    "Any warning lights currently on?",
    "Any known issues or concerns?",
    "..."
  ],
  "pricing": [
    "Why are you selling this car?",
    "What is the lowest price you would accept?",
    "..."
  ]
}
```

---

## NEGOTIATION ENDPOINTS

### 1. Get Price Negotiation Strategy

Get market analysis and negotiation recommendations for a vehicle.

```bash
curl -X POST http://localhost:3000/api/negotiation/strategy \
  -H "Content-Type: application/json" \
  -d '{
    "make": "Honda",
    "model": "Civic",
    "year": 2022,
    "mileage": 35000,
    "sellingPrice": 24500
  }'
```

**Request Parameters:**
- `make`: Car manufacturer (required)
- `model`: Car model (required)
- `year`: Model year (required)
- `mileage`: Current mileage (required)
- `sellingPrice`: Asking price in dollars (required)

**Response Example:**
```json
{
  "vehicle": {
    "make": "Honda",
    "model": "Civic",
    "year": 2022,
    "mileage": 35000,
    "sellingPrice": 24500
  },
  "marketAnalysis": "The 2022 Honda Civic is a solid compact car with strong demand...",
  "fairPriceRange": "$22,500 - $24,000",
  "negotiationPoints": [
    "Point 1: Lower mileage than average for the year",
    "Point 2: Current market trends favor buyers",
    "..."
  ],
  "suggestedOpeningOffer": 23000,
  "walkawayprice": 22000,
  "negotiationTips": [
    "Start 5-10% below asking price",
    "Reference market comps",
    "..."
  ],
  "possibleIssuesBasedOnMileage": [
    "Possible brake pad wear at 35k miles",
    "Transmission fluid change may be due soon",
    "..."
  ]
}
```

---

## UTILITY ENDPOINTS

### Health Check

Verify the server is running and healthy.

```bash
curl http://localhost:3000/api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-01T20:52:44.820Z"
}
```

---

## TESTING WITH DIFFERENT TOOLS

### Using Postman

1. Import the endpoints above into Postman
2. Create a new POST request with:
   - URL: `http://localhost:3000/api/research/by-details`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
   ```json
   {
     "make": "Toyota",
     "model": "Camry",
     "year": 2023,
     "mileage": 45000
   }
   ```
3. Click "Send"

### Using Python

```python
import requests
import json

url = "http://localhost:3000/api/research/by-details"
data = {
    "make": "Toyota",
    "model": "Camry",
    "year": 2023,
    "mileage": 45000
}

response = requests.post(url, json=data)
print(json.dumps(response.json(), indent=2))
```

### Using JavaScript/Node.js

```javascript
const data = {
  make: "Toyota",
  model: "Camry",
  year: 2023,
  mileage: 45000
};

fetch('http://localhost:3000/api/research/by-details', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
})
  .then(response => response.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(error => console.error('Error:', error));
```

---

## ERROR RESPONSES

### Missing Required Fields

```bash
curl -X POST http://localhost:3000/api/research/by-details \
  -H "Content-Type: application/json" \
  -d '{"make": "Toyota"}'
```

**Response (400 Bad Request):**
```json
{
  "error": "Missing required fields: make, model, year, mileage"
}
```

### Invalid VIN

```bash
curl -X POST http://localhost:3000/api/research/by-vin \
  -H "Content-Type: application/json" \
  -d '{"vin": "ABC", "mileage": 45000}'
```

**Response (400 Bad Request):**
```json
{
  "error": "Invalid VIN: must be 17 characters"
}
```

### Vehicle Not Found

```bash
curl -X POST http://localhost:3000/api/research/by-details \
  -H "Content-Type: application/json" \
  -d '{"make": "UnknownBrand", "model": "Unknown", "year": 2023, "mileage": 45000}'
```

**Response (404 Not Found):**
```json
{
  "error": "Car not found in database: UnknownBrand Unknown 2023",
  "suggestions": "Try searching with a different year or model"
}
```

### Server/API Error

```json
{
  "error": "API Error: Failed to call OpenAI service"
}
```

---

## TIPS FOR TESTING

1. **Test Systematically**
   - Start with GET endpoints (easier to test)
   - Then test POST endpoints
   - Check error cases last

2. **Use Real VINs**
   - The VIN decoder service works with real VINs
   - Invalid VINs will return an error
   - Format must be exactly 17 characters

3. **Monitor API Costs**
   - Each research request calls OpenAI API
   - Costs are typically <$0.01 per request
   - Consider caching popular searches

4. **Check Response Times**
   - AI requests take 2-5 seconds
   - VIN decoding is usually instant
   - Expected response time: 2-10 seconds

5. **Save Test Scenarios**
   - Create test cases for different car types
   - Test luxury vs economy cars
   - Test different mileage ranges
   - Test different model years

---

## BATCH TESTING SCRIPT

Save as `test_api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000/api"

echo "Testing Car Buyer Assistant API..."
echo ""

# Test 1: Research by details
echo "1. Testing research by details..."
curl -s -X POST $BASE_URL/research/by-details \
  -H "Content-Type: application/json" \
  -d '{"make":"Toyota","model":"Camry","year":2023,"mileage":45000}' | jq .

echo ""
echo "2. Testing test drive checklist..."
curl -s "$BASE_URL/test-drive/checklist?make=Toyota&model=Camry&year=2023" | jq .

echo ""
echo "3. Testing negotiation strategy..."
curl -s -X POST $BASE_URL/negotiation/strategy \
  -H "Content-Type: application/json" \
  -d '{"make":"Toyota","model":"Camry","year":2023,"mileage":45000,"sellingPrice":28500}' | jq .

echo ""
echo "Done!"
```

Run with: `bash test_api.sh`

---

## NEXT STEPS

1. **Test all endpoints** using these examples
2. **Integrate with frontend** - Use the built-in web interface
3. **Monitor API usage** - Check OpenAI dashboard for costs
4. **Add error handling** - Implement retry logic for production
5. **Scale up** - Cache popular vehicles to reduce API calls
