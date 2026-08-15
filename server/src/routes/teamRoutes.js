const express = require('express');
const { param } = require('express-validator');
const { getTeams, getRankings, getTeamById, getTeamsByGroup } = require('../controllers/teamController');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/', getTeams);
router.get('/rankings', getRankings);
router.get('/group/:group', [param('group').isLength({ min: 1, max: 1 }).isAlpha()], validate, getTeamsByGroup);
router.get('/:id', [param('id').isMongoId()], validate, getTeamById);

module.exports = router;
