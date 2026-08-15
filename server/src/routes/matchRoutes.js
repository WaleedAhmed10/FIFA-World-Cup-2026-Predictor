const express = require('express');
const { param, body } = require('express-validator');
const { getMatches, getMatchById, getMatchesByStage, updateMatchResult } = require('../controllers/matchController');
const validate = require('../middleware/validate');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', getMatches);
router.get('/stage/:stage', getMatchesByStage);
router.get('/:id', [param('id').isMongoId()], validate, getMatchById);

router.put(
  '/:id',
  protect,
  adminOnly,
  [
    param('id').isMongoId(),
    body('homeScore').isInt({ min: 0, max: 50 }),
    body('awayScore').isInt({ min: 0, max: 50 }),
    body('status').optional().isIn(['Scheduled', 'Live', 'Completed'])
  ],
  validate,
  updateMatchResult
);

module.exports = router;
