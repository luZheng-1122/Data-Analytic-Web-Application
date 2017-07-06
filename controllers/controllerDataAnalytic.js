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

module.exports.GetLatestTimestamp = function (req,res) {
    console.log("query latestTimestamp api");
    var title = req.query.articleName;
    var latestTimestamp;
    Revision.latestTimestamp(title, function (err,result) {
            if (err){
                console.log("Cannot find latestTimestamp!")
            }else{
                latestTimestamp = result[0].timestamp;
                res.send(latestTimestamp);
            }
        }
    )
}

module.exports.GetIndiArticleTable = function (req,res) {
    var articleTable;

    Revision.articleTable( function (err,result) {
            if (err){
                console.log("Cannot find articleTable!")
            }else{
                articleTable = result;
                res.send(articleTable);
            }
        }
    )
}

module.exports.GetIndividualData = function (req,res) {
    var data = req.query.apiData;
    var title = req.query.title;
    var latestTimestamp = req.query.latestTimestamp;
    var type = req.query.type;
    var admin,bot;
    var num = 0;
    console.log("getIndividualData"+data[0]);

    //insert new revisions,
    if (type == 1){
        async.series([
            function (callback) {
                fs.readFile('/Users/zhenglu/PhpstormProjects/dataAnalyticApp/public/file/admin.txt',
                    {flag: 'r+', encoding: 'utf8'},
                    function (err, data) {
                        if(err) {
                            console.error(err);
                            return;
                        }
                        admin = data.split("\\\n");
                        callback(null);
                        // console.log(admin);
                    });
            },
            function (callback) {
                fs.readFile('/Users/zhenglu/PhpstormProjects/dataAnalyticApp/public/file/bot.txt',
                    {flag: 'r+', encoding: 'utf8'},
                    function (err, data) {
                        if(err) {
                            console.error(err);
                            return;
                        }
                        bot = data.split("\\\n");
                        // console.log(bot);
                        callback(null);
                    });
            },
        ],function () {
            async.forEachOfSeries(data, iterateeInsertAPI, function () {
                // console.log(data.length-1 +" revisions have been inserted!");
                getNewRevisions(title, res);
            });
        });
        var iterateeInsertAPI = function (data, key, callback) {
            var type;
            console.log("each new revisions number"+data.anon);
            console.log("each new revisions number"+data.user);
            var ifanon = data.anon;
            if ( admin.includes(data.user) ){
                console.log("newdata == admin!")
                type = "admin";
            }
            else if( bot.includes(data.user) ){
                console.log("newdata == robot!")
                type = "robot";
            }
            else if( ifanon ){
                console.log("newdata == anon!")
                type = "anon";
            }
            else{
                console.log("newdata == regular!")
                type = "other";
            }

            if ( data.timestamp == latestTimestamp)
            {
                //withdraw the exited one
                console.log("equal, not update")
                callback(null);
            }
            else{
                Revision.insertNewRevision(title,data,type,function (err,result) {
                    if (err){
                        console.log("Cannot insert")
                    }else{
                        console.log(key + "insert one record");
                    }
                    callback(null);
                });
            }

        }
    }
    else{
        getNewRevisions(title,res);
    }
}

function getNewRevisions(title, res) {
    console.log("getnewrevisions!");
    var total,longYear,shortYear;
    var overChartData,pieData,barData;
    var topUsers,topUsersDis;
    var Year = new Array;

    async.series([
            //get longest time
            function(callback) {
                // do some more stuff ...
                Revision.findArticleLongestRev(title, function (err,result) {
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
                // do some more stuff ...
                Revision.findArticleShortestRev(title, function (err,result) {
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
                // do some more stuff ...
                Revision.queryArticlePie(title, function (err,result) {
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
                // do some more stuff ...
                var startYear = longYear;
                for (var i =0;i< (shortYear-longYear+1);i++){
                    Year.push(startYear);
                    startYear++;
                }

                Revision.queryArticleBar(title, Year,function (err,result) {
                    if (err){
                        console.log("Cannot queryOverallbar")
                    }else{
                        console.log("get queryOverallbar");
                        barData = result;
                    }
                    callback(null);
                });
            },
            //top 5 regular users
            function(callback) {
                // do some more stuff ...
                Revision.findTopusers(title, function (err,result) {
                    if (err){
                        console.log("Cannot queryOverallPie")
                    }else{
                        console.log("get 5 topusers");
                        topUsers = result;
                        console.log(result);
                    }
                    callback(null);
                });
            },
            //top 5 regular users distribution
            function(callback) {
                // do some more stuff ...
                Revision.topUsersDistribution(title, Year,topUsers ,function (err,result) {
                    if (err){
                        console.log("Cannot queryOverallPie")
                    }else{
                        console.log("get 5 topusers distribution");
                        topUsersDis = result;
                        console.log(result);
                    }
                    callback(null);
                });
            },
        ],
        //callback for return data to ajax
        function(err, results) {
            overChartData = {Pie: pieData,Bar: barData,Year:Year, topUsers:topUsers, topUsersDis: topUsersDis};
            console.log("final");
            res.send(overChartData);
        });

}