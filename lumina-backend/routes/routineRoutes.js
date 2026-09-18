const express = require('express');
const router = express.Router();
const routineController = require('../controllers/routineController');

router.post('/', routineController.findRoutine);

module.exports = router;