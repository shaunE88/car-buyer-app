import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function extractAndParseJSON(content) {
  // Strip markdown code block if present
  let jsonStr = content.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    // Try to fix common issues: unescaped quotes in strings
    // This regex looks for quotes that appear inside quoted strings and escapes them
    jsonStr = jsonStr.replace(/": "([^"]*)"([^"]*)",/g, '": "$1\\"$2",');
    jsonStr = jsonStr.replace(/": "([^"]*)"$/g, '": "$1\\"');
    
    try {
      return JSON.parse(jsonStr);
    } catch (e2) {
      console.error('Failed to parse JSON:', e2.message);
      console.error('Attempted JSON:', jsonStr.substring(0, 500));
      throw new Error(`Invalid JSON response: ${e.message}`);
    }
  }
}

export async function generateCarResearch(make, model, year, mileage) {
  const prompt = `You are an expert car buying advisor. Provide a comprehensive research report for a ${year} ${make} ${model} with ${mileage} miles. Include:
1. Common reliability issues for this model year
2. Known recalls or safety concerns
3. Typical maintenance costs
4. Expected fuel economy
5. Safety ratings and features
6. Resale value outlook
7. Average market price for this year/mileage
8. Key features to look for in condition

Format as JSON with these exact keys: commonIssues, reliability, maintenanceCosts, fuelEconomy, safetyRating, resaleValue, averagePrice, keyFeatures`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      messages: [
        { role: 'user', content: prompt }
      ]
    });

    const content = completion.choices[0].message.content;
    return extractAndParseJSON(content);
  } catch (error) {
    console.error('OpenAI error:', error);
    throw error;
  }
}

export async function generateTestDriveGuide(make, model, year) {
  const prompt = `You are a certified mechanic and car buying expert. Generate a detailed test drive inspection guide for a ${year} ${make} ${model}. Include specific things to check for this model that are known to have issues. Provide as JSON with these keys:
- preTestDriveChecks: array of steps
- exteriorInspection: array of items
- interiorInspection: array of items
- engineCompartment: array of items
- testDrivePoints: array of driving checks
- redFlags: array of warning signs specific to this model
- modelSpecificConcerns: array of known issues for this year/model`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1500,
      messages: [
        { role: 'user', content: prompt }
      ]
    });

    const content = completion.choices[0].message.content;
    return extractAndParseJSON(content);
  } catch (error) {
    console.error('OpenAI error:', error);
    throw error;
  }
}

export async function generateNegotiationStrategy(make, model, year, mileage, sellingPrice) {
  const prompt = `You are an expert car negotiator. Analyze a ${year} ${make} ${model} with ${mileage} miles being sold for $${sellingPrice}. Provide negotiation advice as JSON with these keys:
- marketAnalysis: string explaining current market conditions
- fairPriceRange: string with estimated fair price range
- negotiationPoints: array of specific points to negotiate
- possibleIssuesBasedOnMileage: array
- suggestedOpeningOffer: number
- walkawayprice: number at which to decline
- negotiationTips: array of strategies`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1200,
      messages: [
        { role: 'user', content: prompt }
      ]
    });

    const content = completion.choices[0].message.content;
    return extractAndParseJSON(content);
  } catch (error) {
    console.error('OpenAI error:', error);
    throw error;
  }
}

export async function generateQuestionsForSeller(make, model, year) {
  const prompt = `You are a car buying expert. Generate important questions to ask when viewing a ${year} ${make} ${model}. Return JSON with this structure:
{
  "history": ["question1", "question2", ...],
  "maintenance": ["question1", "question2", ...],
  "condition": ["question1", "question2", ...],
  "pricing": ["question1", "question2", ...]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1000,
      messages: [
        { role: 'user', content: prompt }
      ]
    });

    const content = completion.choices[0].message.content;
    return extractAndParseJSON(content);
  } catch (error) {
    console.error('OpenAI error:', error);
    throw error;
  }
}
