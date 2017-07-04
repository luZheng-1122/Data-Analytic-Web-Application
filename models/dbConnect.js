/**
 * Created by zhenglu on 1/07/2017.
 */
var mongoose = require('mongoose');
var fs = require('fs');
var async = require("async");

// mongodb connect

mongoose.connect('mongodb://localhost/WebTut', function () {
  console.log('mongodb connected')
});

module.exports = mongoose