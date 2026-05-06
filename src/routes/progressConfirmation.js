const express = require('express');
const router = express.Router();

// import controllers
const {createProgressConfirmation, getProgressConfirmations, 
    getOneProgressConfirmation} = require ('../controllers/progressConfirmation');

// import protection
const {protect} = require('../middleware/auth');
// for all protection
router.use(protect);
// create a new progress confirmation
router.post('/', createProgressConfirmation);
// get all confirmation
router.get('/', getProgressConfirmations);
// get one confirmation
router.get('/:id', getOneProgressConfirmation);

module.exports = router;