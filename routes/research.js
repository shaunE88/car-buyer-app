import express from 'express';
import { generateCarResearch, generateQuestionsForSeller } from '../services/openaiService.js';
import { decodeVin } from '../utils/vinDecoder.js';
import { carDatabase } from '../data/carDatabase.js';

const router = express.Router();

// Research cars by make, model, year
router.post('/by-details', async (req, res) => {
  try {
    const { make, model, year, mileage } = req.body;

    if (!make || !model || !year || mileage === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: make, model, year, mileage'
      });
    }

    // Try to get from database first, then fallback to AI
    const carKey = `${make.toUpperCase()}-${model.toUpperCase()}-${year}`;
    let carData = carDatabase[carKey];

    if (!carData) {
      // Use AI to generate research
      carData = await generateCarResearch(make, model, year, mileage);
    }

    const research = {
      vehicle: { make, model, year, mileage },
      ...carData
    };

    res.json(research);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Research by VIN
router.post('/by-vin', async (req, res) => {
  try {
    const { vin, mileage } = req.body;

    if (!vin || mileage === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: vin, mileage'
      });
    }

    let vinData;
    try {
      // Try to decode VIN using RapidAPI
      vinData = await decodeVin(vin);
      console.log('VIN decoder response:', vinData);
    } catch (error) {
      console.warn('VIN decoder API failed:', error.message);
      vinData = null;
    }

    // Extract values from the nested API response structure
    let make, model, year;
    
    if (vinData && vinData.Status === 'SUCCESS') {
      // API returns nested objects with { unit, value } structure
      make = vinData.Make?.value || vinData.make?.value || vinData.Make || vinData.make;
      model = vinData.Model?.value || vinData.model?.value || vinData.Model || vinData.model;
      year = vinData.Model_Year?.value || vinData.year?.value || vinData.Model_Year || vinData.year;

      if (!make || !model || !year) {
        return res.status(400).json({
          error: 'Unable to extract vehicle information from VIN. Please enter the vehicle details manually.',
          details: vinData
        });
      }
    } else if (!process.env.RAPIDAPI_KEY) {
      // No API key configured
      return res.status(400).json({
        error: 'VIN decoder is not configured. Please enter the vehicle details manually (Make, Model, Year).'
      });
    } else {
      // API didn't return success
      return res.status(400).json({
        error: 'Unable to decode VIN with the provided information. Please enter the vehicle details manually (Make, Model, Year).',
        details: vinData
      });
    }

    // Try database first, then AI
    const carKey = `${make.toUpperCase()}-${model.toUpperCase()}-${year}`;
    let carData = carDatabase[carKey];

    if (!carData) {
      carData = await generateCarResearch(make, model, year, mileage);
    }

    const research = {
      vehicle: {
        vin,
        make,
        model,
        year,
        mileage,
        bodyStyle: vinData?.Body_Style?.value || 'Unknown',
        decoderData: vinData
      },
      ...carData
    };

    res.json(research);
  } catch (error) {
    console.error('VIN research error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get available makes
router.get('/makes', (req, res) => {
  try {
    const makes = [...new Set(Object.keys(carDatabase).map(key => key.split('-')[0]))];
    res.json({ makes: makes.sort() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get models by make
router.get('/models/:make', (req, res) => {
  try {
    const make = req.params.make.toUpperCase();
    const models = [...new Set(
      Object.keys(carDatabase)
        .filter(key => key.startsWith(make + '-'))
        .map(key => key.split('-')[1])
    )];
    res.json({ make, models: models.sort() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get years by make and model
router.get('/years/:make/:model', (req, res) => {
  try {
    const make = req.params.make.toUpperCase();
    const model = req.params.model.toUpperCase();
    const years = Object.keys(carDatabase)
      .filter(key => key.startsWith(`${make}-${model}-`))
      .map(key => parseInt(key.split('-')[2]))
      .sort((a, b) => b - a);
    res.json({ make, model, years });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
