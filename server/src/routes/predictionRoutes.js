const express = require('express');
const { body, param } = require('express-validator');
const {
  submitPrediction,
  getMyPredictions,
  getMatchPredictionSummary
} = require('../controllers/predictionController');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // every prediction route requires a logged-in user

router.post(
  '/',
  [
    body('matchId').isMongoId().withMessage('Valid matchId is required'),
    body('homeScore').isInt({ min: 0, max: 20 }).withMessage('homeScore must be 0-20'),
    body('awayScore').isInt({ min: 0, max: 20 }).withMessage('awayScore must be 0-20')
  ],
  validate,
  submitPrediction
);

router.get('/my', getMyPredictions);
router.get('/match/:matchId', [param('matchId').isMongoId()], validate, getMatchPredictionSummary);

module.exports = router;
