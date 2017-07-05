/**
 * Created by zhenglu on 1/07/2017.
 */
var express = require('express');
var controller = require('../controllers/controllerDataAnalytic');
var router = express.Router();

//MVC routes
router.get('/DataAnalytic', controller.DataAnalyticMain);

//for ajax api
router.get('/GetLeftOverall', controller.GetLeftOverall);
router.get('/GetRightOverall', controller.GetRightOverall);
module.exports = router;