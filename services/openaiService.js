
import OpenAI from 'openai';
import JSON5 from 'json5';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Safely extract and parse JSON from OpenAI response
 * Handles markdown wrapping, malformed JSON, and missing content
 * Returns null on failure instead of throwing
 */
function extractAndParseJSON(content) {
  // Guard: Check for null/undefined content
  if (!content || typeof content !== 'string') {
    console.error('Invalid content type:', typeof content, content);
    return null;
  }

  // Step 1: Clean up markdown code blocks (handle variations)
  let jsonStr = content
    .replace(/^```(?:json|JSON)?\s*\n?/, '') // Start markdown
    .replace(/\n?```\s*$/, '') // End markdown
    .trim();

  // Guard: Check for empty string
  if (!jsonStr || jsonStr.length === 0) {
    console.error('Content is empty after markdown removal');
    return null;
  }

  // Step 2: Try standard JSON parsing
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch (e) {
    console.log('Standard JSON parse failed, attempting JSON5...');
  }

  // Step 3: Try JSON5 (more lenient parsing)
  try {
    const parsed = JSON5.parse(jsonStr);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch (e) {
    console.log('JSON5 parse failed, attempting repairs...');
  }

  // Step 4: Attempt repairs (be conservative)
  let repaired = jsonStr;
  
  // Remove trailing commas before } or ]
  repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
  
  // Escape unescaped quotes in string values (complex but safer approach)
  // Only fix obvious issues like: "key": "value"extra" → "key": "value\"extra"
  repaired = repaired.replace(/": "([^"]*)"(?=\s*[,}])/g, (match, p1) => {
    // Don't modify if it looks already escaped
    if (p1.endsWith('\\')) return match;
    return '": "' + p1 + '"';
  });

  try {
    const parsed = JSON5.parse(repaired);
    if (parsed && typeof parsed === 'object') {
      console.log('Successfully parsed with repairs');
      return parsed;
    }
  } catch (e) {
    console.log('Repairs failed, attempting extraction...');
  }

  // Step 5: Try extracting JSON object/array by delimiters
  try {
    // Try finding JSON object first (most common case)
    const braceStart = jsonStr.indexOf('{');
    const braceEnd = jsonStr.lastIndexOf('}');
    
    if (braceStart !== -1 && braceEnd !== -1 && braceEnd > braceStart) {
      const extracted = jsonStr.substring(braceStart, braceEnd + 1);
      const parsed = JSON5.parse(extracted);
      if (parsed && typeof parsed === 'object') {
        console.log('Successfully extracted JSON object');
        return parsed;
      }
    }

    // Try finding JSON array if object extraction failed
    const arrayStart = jsonStr.indexOf('[');
    const arrayEnd = jsonStr.lastIndexOf(']');
    
    if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
      const extracted = jsonStr.substring(arrayStart, arrayEnd + 1);
      const parsed = JSON5.parse(extracted);
      if (Array.isArray(parsed) || (parsed && typeof parsed === 'object')) {
        console.log('Successfully extracted JSON array');
        return parsed;
      }
    }
  } catch (e) {
    console.log('Extraction failed:', e.message);
  }

  // Step 6: All parsing failed - return null instead of throwing
  console.error('All JSON parsing methods failed');
  console.error('Original response (first 500 chars):', content.substring(0, 500));
  return null;
}

/**
 * Create safe default response structure for a type
 */
function getSafeDefault(type) {
  const defaults = {
    research: {
      commonIssues: ['Unable to retrieve specific issues - please check manufacturer reports'],
      reliability: 'Unable to retrieve reliability data',
      maintenanceCosts: 'Check with local dealers for specific quotes',
      fuelEconomy: 'Check EPA.gov for official specifications',
      safetyRating: 'Check NHTSA.gov for safety ratings',
      resaleValue: 'Check Kelley Blue Book for resale values',
      averagePrice: 'Unable to retrieve pricing data - check local listings',
      keyFeatures: ['Recommend professional pre-purchase inspection']
    },
    testDrive: {
      preTestDriveChecks: ['Check tire pressure and condition', 'Verify fluid levels', 'Test all lights and wipers'],
      exteriorInspection: ['Look for dents, rust, and paint issues', 'Check alignment of panels', 'Inspect windows and seals'],
      interiorInspection: ['Check upholstery condition', 'Test all controls and buttons', 'Check for odors'],
      engineCompartment: ['Look for leaks', 'Check fluid levels', 'Inspect hoses and connections'],
      testDrivePoints: ['Test acceleration', 'Check braking response', 'Listen for unusual noises'],
      redFlags: ['Smoke or unusual odors', 'Warning lights on dashboard', 'Grinding or metal-on-metal sounds'],
      modelSpecificConcerns: ['Recommend professional mechanic inspection before purchase']
    },
    negotiation: {
      marketAnalysis: 'Market analysis unavailable - recommend researching comparable vehicles',
      fairPriceRange: 'Unable to determine fair price range',
      negotiationPoints: ['Get pre-purchase inspection', 'Research comparable listings', 'Check vehicle history report'],
      possibleIssuesBasedOnMileage: ['Have mechanic inspect vehicle'],
      suggestedOpeningOffer: 0,
      walkawayprice: 0,
      negotiationTips: ['Get multiple inspections', 'Research market prices', 'Be prepared to walk away']
    }
  };
  return defaults[type] || defaults.research;
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
8. Key features and issues to look for when inspecting condition

Format as JSON with these exact keys: commonIssues (array), reliability (string), maintenanceCosts (string), fuelEconomy (string), safetyRating (string), resaleValue (string), averagePrice (string), keyFeatures (array)`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      messages: [
        { role: 'user', content: prompt }
      ]
    });

    // Guard: Check response structure
    if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
      console.warn('Invalid OpenAI response structure');
      return getSafeDefault('research');
    }

    const content = completion.choices[0].message.content;
    const parsed = extractAndParseJSON(content);

    // If parsing failed, return safe defaults
    if (!parsed) {
      console.warn('JSON parsing failed for research, returning safe defaults');
      return getSafeDefault('research');
    }

    // Validate that parsed result is an object (not array or string)
    if (typeof parsed !== 'object' || Array.isArray(parsed)) {
      console.warn('Parsed result is not an object, returning safe defaults');
      return getSafeDefault('research');
    }

    return parsed;
  } catch (error) {
    console.error('generateCarResearch error:', error.message);
    // Return safe defaults instead of throwing
    return getSafeDefault('research');
  }
}

export async function generateTestDriveGuide(make, model, year) {
  const prompt = `You are a certified mechanic and car buying expert. Generate a detailed test drive inspection guide specifically for a ${year} ${make} ${model}. Include specific things to check for this model that are known to have issues. Avoid providing generic test drive advice that is not model specific. Provide as JSON with these exact keys:
- preTestDriveChecks: array of strings
- exteriorInspection: array of strings
- interiorInspection: array of strings
- engineCompartment: array of strings
- testDrivePoints: array of strings
- redFlags: array of strings
- modelSpecificConcerns: array of strings`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1500,
      messages: [
        { role: 'user', content: prompt }
      ]
    });

    // Guard: Check response structure
    if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
      console.warn('Invalid OpenAI response structure');
      return getSafeDefault('testDrive');
    }

    const content = completion.choices[0].message.content;
    const parsed = extractAndParseJSON(content);

    // If parsing failed, return safe defaults
    if (!parsed) {
      console.warn('JSON parsing failed for test drive guide, returning safe defaults');
      return getSafeDefault('testDrive');
    }

    // Validate that parsed result is an object
    if (typeof parsed !== 'object' || Array.isArray(parsed)) {
      console.warn('Parsed result is not an object, returning safe defaults');
      return getSafeDefault('testDrive');
    }

    return parsed;
  } catch (error) {
    console.error('generateTestDriveGuide error:', error.message);
    // Return safe defaults instead of throwing
    return getSafeDefault('testDrive');
  }
}

export async function generateNegotiationStrategy(make, model, year, mileage, sellingPrice) {
  const prompt = `You are an expert car negotiator. Analyze a ${year} ${make} ${model} with ${mileage} miles being sold for $${sellingPrice}. Provide negotiation advice as JSON with these exact keys:
- marketAnalysis: string explaining current market conditions
- fairPriceRange: string with estimated fair price range
- negotiationPoints: array of specific strings to negotiate
- possibleIssuesBasedOnMileage: array of strings
- suggestedOpeningOffer: number (integer dollar amount)
- walkawayprice: number (integer dollar amount at which to decline)
- negotiationTips: array of strings with strategies`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1200,
      messages: [
        { role: 'user', content: prompt }
      ]
    });

    // Guard: Check response structure
    if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
      console.warn('Invalid OpenAI response structure');
      return getSafeDefault('negotiation');
    }

    const content = completion.choices[0].message.content;
    const parsed = extractAndParseJSON(content);

    // If parsing failed, return safe defaults
    if (!parsed) {
      console.warn('JSON parsing failed for negotiation strategy, returning safe defaults');
      return getSafeDefault('negotiation');
    }

    // Validate that parsed result is an object
    if (typeof parsed !== 'object' || Array.isArray(parsed)) {
      console.warn('Parsed result is not an object, returning safe defaults');
      return getSafeDefault('negotiation');
    }

    return parsed;
  } catch (error) {
    console.error('generateNegotiationStrategy error:', error.message);
    // Return safe defaults instead of throwing
    return getSafeDefault('negotiation');
  }
}

export async function generateQuestionsForSeller(make, model, year) {
  const prompt = `You are a car buying expert. Generate important questions to ask when viewing a ${year} ${make} ${model}. Return JSON with this structure:
{
  "history": ["question1", "question2", "question3"],
  "maintenance": ["question1", "question2", "question3"],
  "condition": ["question1", "question2", "question3"],
  "pricing": ["question1", "question2", "question3"]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1000,
      messages: [
        { role: 'user', content: prompt }
      ]
    });

    // Guard: Check response structure
    if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
      console.warn('Invalid OpenAI response structure');
      return {
        history: [],
        maintenance: [],
        condition: [],
        pricing: []
      };
    }

    const content = completion.choices[0].message.content;
    const parsed = extractAndParseJSON(content);

    // If parsing failed, return empty structure
    if (!parsed) {
      console.warn('JSON parsing failed for seller questions, returning empty structure');
      return {
        history: [],
        maintenance: [],
        condition: [],
        pricing: []
      };
    }

    // Validate that parsed result is an object
    if (typeof parsed !== 'object' || Array.isArray(parsed)) {
      console.warn('Parsed result is not an object, returning empty structure');
      return {
        history: [],
        maintenance: [],
        condition: [],
        pricing: []
      };
    }

    return parsed;
  } catch (error) {
    console.error('generateQuestionsForSeller error:', error.message);
    // Return empty structure instead of throwing
    return {
      history: [],
      maintenance: [],
      condition: [],
      pricing: []
    };
  }
}
