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

    const guide = await generateTestDriveGuide(make, model, year);
    res.json(guide);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

    const questions = await generateQuestionsForSeller(make, model, year);
    res.json({
      vehicle: { make, model, year },
      ...questions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
