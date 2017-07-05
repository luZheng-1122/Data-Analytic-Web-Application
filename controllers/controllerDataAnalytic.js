/**
 * Created by zhenglu on 1/07/2017.
 */
var fs = require('fs');
var http = require("http");
var async = require("async");
var Revision = require("../models/DataAnalyticModel");

module.exports.DataAnalyticMain = function(req,res){
    //render with back end template
    var author = "Lu Zheng";
    res.render('DataAnalyticMain.ejs',{
        author:author});
}

// API for ajax query
module.exports.GetLeftOverall = function (req,res) {
    var MostRevArticle, LeastRevArticle,
        LargestGroupArticle, LeastGroupArticle, LongestRev, ShortestRev;

    async.series([
            function(callback) {
                //article with most number of revisions
                Revision.findMostRev(function (err,result) {
                        if (err){
                            console.log("Cannot find the most revision!")
                        }else{
                            MostRevArticle = result[0];
                        }
                        callback(null);
                    }
                );
            },
            //more requirements
            function(callback) {
                //article with least number of revisions
                Revision.findLeastRev(function (err,result) {
                        if (err){
                            console.log("Cannot find the least revision!")
                        }else{
                            LeastRevArticle = result[0];
                        }
                        callback(null);
                    }
                );
            },
            function(callback) {
                //article edited by largest group of registered users
                Revision.findLargestGroupRev(function (err,result) {
                        if (err){
                            console.log("Cannot find largest group of registered users!")
                        }else{
                            LargestGroupArticle = result[0];
                        }
                        callback(null);
                    }
                );
            },
            function(callback) {
                //article edited by smallest group of registered users
                Revision.findLeastGroupRev(function (err,result) {
                        if (err){
                            console.log("Cannot find smallest group of registered users!")
                        }else{
                            LeastGroupArticle = result[0];
                        }
                        callback(null);
                    }
                );
            },
            function(callback) {
                //The article with the longest history.
                Revision.findLongestRev(function (err,result) {
                        if (err){
                            console.log("Cannot find the longest history!")
                        }else{
                            LongestRev = result[0];
                        }
                        callback(null);
                    }
                );
            },
            function(callback) {
                //The article with the shortest history.
                Revision.findShortestHis(function (err,result) {
                        if (err){
                            console.log("Cannot find the shortest history!")
                        }else{
                            ShortestRev = result[0];
                        }
                        callback(null);
                    }
                );
            },
        ],
    // callback function to send data back
        function(err, results) {
            var leftOverall = {
                MostRevArticle:MostRevArticle,
                LeastRevArticle:LeastRevArticle,
                LargestGroupArticle:LargestGroupArticle,
                LeastGroupArticle:LeastGroupArticle,
                LongestRev:LongestRev,
                ShortestRev:ShortestRev};
            res.send(leftOverall);
        });
}

module.exports.GetRightOverall = function (req,res) {
    var longYear,shortYear;
    var overChartData,pieData,barData;
    var Year = new Array;

    async.series([
            //get longest time
            function(callback) {
                Revision.findLongestRev(function (err,result) {
                    if (err){
                        console.log("Cannot longest time")
                    }else{
                        console.log("get longest time");
                        console.log(result[0].timestamp.substring(0,4));
                        longYear = result[0].timestamp.substring(0,4);
                    }
                    callback(null);
                });
            },
            //get shortest time
            function(callback) {
                Revision.findShortestRev(function (err,result) {
                    if (err){
                        console.log("Cannot shortest time")
                    }else{
                        console.log("get shortest time");
                        console.log(result[0].timestamp.substring(0,4));
                        shortYear = result[0].timestamp.substring(0,4);
                    }
                    callback(null);
                });
            },
            //get pie data
            function(callback) {
                Revision.queryOverallPie(function (err,result) {
                    if (err){
                        console.log("Cannot queryOverallPie")
                    }else{
                        console.log("get queryOverallPie");
                        pieData = result;
                    }
                    callback(null);
                });
            },
            //get bar data
            function(callback) {
                var startYear = longYear;
                for (var i =0;i< (shortYear-longYear+1);i++){
                    Year.push(startYear);
                    startYear++;
                }
                Revision.queryOverallBar( Year,function (err,result) {
                    if (err){
                        console.log("Cannot queryOverallbar")
                    }else{
                        console.log("get queryOverallbar");
                        barData = result;
                    }
                    callback(null);
                });
            },
        ],
        //callback for return data to ajax
        function(err, results) {
            overChartData = {Pie: pieData,Bar: barData,Year:Year};
            res.send(overChartData);
        });
}