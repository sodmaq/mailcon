const express = require("express");
const router = express.Router();
const integrationController = require("../controllers/integration.controller");

// Integration Endpoints
// 1. POST /api/integrations/esp - Store and validate ESP API key
router.post("/esp", integrationController.saveIntegration);

// 2. GET /api/integrations/esp/verify - Verify connection to ESP platform
router.get("/esp/verify", integrationController.verifyConnection);

// Data Retrieval Endpoints
// 3. GET /api/integrations/esp/lists - Get all audiences/lists
router.get("/esp/lists", integrationController.getLists);

module.exports = router;
