/**
 * Created by zhenglu on 1/07/2017.
 */
var express = require('express');
var controller = require('../controller/controllerDataAnalytic');
var router = express.Router();

//MVC routes
router.get('/DataAnalytic', controller.DataAnalyticMain);

//for ajax api

module.exports = router;