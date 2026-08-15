const express = require('express');
const { getGroupStandings, getBestThirdPlaced, getKnockoutBracket } = require('../controllers/standingsController');

const router = express.Router();

router.get('/groups', getGroupStandings);
router.get('/best-third', getBestThirdPlaced);
router.get('/knockout-bracket', getKnockoutBracket);

module.exports = router;
