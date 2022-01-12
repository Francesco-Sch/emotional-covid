
// Initialize express router
import express from "express";
let router = express.Router();

// Set default API response
router.get('/', function (require, response) {
    response.json({
        status: 'API Its Working'
    });
});

//Import DataProcessingController
import DataProcessingController from './dataProcessingController.js';

router.route('/startTweetCollection')
    .get(DataProcessingController)

// Export API routes
export default router;