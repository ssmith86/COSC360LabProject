const express = require("express");
const router = express.Router();
const checkAdmin = require("../middleware/checkAdmin");
const ctrl = require("../controllers/analyticsController");

router.get("/event-trends", checkAdmin, ctrl.getEventTrends);
router.get("/popular-events", ctrl.getPopularEvents);
router.get("/location-distribution", ctrl.getLocationDistribution);
router.get("/user-growth", checkAdmin, ctrl.getUserGrowth);
router.get("/event-total-summary", checkAdmin, ctrl.getEventTotalSummary);
router.get("/event-period-summary", checkAdmin, ctrl.getEventPeriodSummary);
router.get("/event-start-trends", checkAdmin, ctrl.getEventStartTrends);
router.get("/save-trends", checkAdmin, ctrl.getSaveTrends);
router.get("/top-creators", ctrl.getTopCreators);
router.get("/user-total-summary", checkAdmin, ctrl.getUserTotalSummary);
router.get("/user-period-summary", checkAdmin, ctrl.getUserPeriodSummary);
router.get("/total-comments", checkAdmin, ctrl.getTotalComments);

module.exports = router;
