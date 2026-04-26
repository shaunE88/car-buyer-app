import express from 'express';
import { generateTestDriveGuide, generateQuestionsForSeller } from '../services/openaiService.js';

const router = express.Router();

// Get test drive checklist
router.get('/checklist', async (req, res) => {
  try {
    const { make, model, year } = req.query;

    if (!make || !model || !year) {
      return res.status(400).json({
        error: 'Missing required fields: make, model, year'
      });
    }

    // Will never throw, returns safe defaults on error
    const guide = await generateTestDriveGuide(make, model, year);
    res.json(guide);
  } catch (error) {
    console.error('Test drive guide error:', error.message);
    // Return safe default structure
    res.status(200).json({
      preTestDriveChecks: ['Check tire pressure and condition', 'Verify fluid levels'],
      exteriorInspection: ['Look for dents, rust, and paint issues'],
      interiorInspection: ['Check upholstery condition', 'Test all controls'],
      engineCompartment: ['Look for leaks', 'Check fluid levels'],
      testDrivePoints: ['Test acceleration', 'Check braking'],
      redFlags: ['Smoke or unusual odors', 'Warning lights'],
      modelSpecificConcerns: ['Recommend professional inspection']
    });
  }
});

// Get questions for seller
router.post('/questions-for-seller', async (req, res) => {
  try {
    const { make, model, year } = req.body;

    if (!make || !model || !year) {
      return res.status(400).json({
        error: 'Missing required fields: make, model, year'
      });
    }

    // Will never throw, returns safe defaults on error
    const questions = await generateQuestionsForSeller(make, model, year);
    res.json({
      vehicle: { make, model, year },
      ...questions
    });
  } catch (error) {
    console.error('Seller questions error:', error.message);
    // Return safe default structure
    res.status(200).json({
      vehicle: { make, model, year },
      history: [],
      maintenance: [],
      condition: [],
      pricing: []
    });
  }
});

export default router;
