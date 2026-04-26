import express from 'express';
import { generateNegotiationStrategy } from '../services/openaiService.js';

const router = express.Router();

// Get price negotiation strategy
router.post('/strategy', async (req, res) => {
  try {
    const { make, model, year, mileage, sellingPrice } = req.body;

    if (!make || !model || !year || mileage === undefined || !sellingPrice) {
      return res.status(400).json({
        error: 'Missing required fields: make, model, year, mileage, sellingPrice'
      });
    }

    // Will never throw, returns safe defaults on error
    const strategy = await generateNegotiationStrategy(make, model, year, mileage, sellingPrice);
    res.json({
      vehicle: { make, model, year, mileage, sellingPrice },
      ...strategy
    });
  } catch (error) {
    console.error('Negotiation strategy error:', error.message);
    // Return safe default structure
    res.status(200).json({
      vehicle: { make, model, year, mileage, sellingPrice },
      marketAnalysis: 'Unable to retrieve market analysis. Please research comparable vehicles.',
      fairPriceRange: 'Unable to determine fair price range.',
      negotiationPoints: ['Get pre-purchase inspection', 'Research comparable vehicles'],
      possibleIssuesBasedOnMileage: ['Have mechanic inspect vehicle'],
      suggestedOpeningOffer: 0,
      walkawayprice: 0,
      negotiationTips: ['Get multiple inspections', 'Be prepared to walk away']
    });
  }
});

export default router;
