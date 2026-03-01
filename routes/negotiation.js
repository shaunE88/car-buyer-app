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

    const strategy = await generateNegotiationStrategy(make, model, year, mileage, sellingPrice);
    res.json({
      vehicle: { make, model, year, mileage, sellingPrice },
      ...strategy
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
