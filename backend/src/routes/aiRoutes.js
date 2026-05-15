const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { validateRequest } = require('../middleware/validateRequest');
const { optionalAuth } = require('../middleware/auth');

router.use(optionalAuth);

router.post('/code-review', validateRequest('codeReview'), aiController.codeReview);

router.post('/debug', validateRequest('debug'), aiController.debug);

router.post('/generate-tests', validateRequest('generateTests'), aiController.generateTests);

router.post('/analyze-pr', validateRequest('analyzePR'), aiController.analyzePR);

router.post('/review-repo', validateRequest('reviewRepo'), aiController.reviewRepository);

module.exports = router;
