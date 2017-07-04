/**
 * Created by zhenglu on 1/07/2017.
 */
var fs = require('fs');
var http = require("http");
var async = require("async");
var Revision = require("../models/DataAnalyticModel");

module.exports.DataAnalyticMain = function(req,res){

    // test for db
    var MostRevArticle, LeastRevArticle,
        LargestGroupArticle, LeastGroupArticle, LongestRev, ShortestRev;
    var articleTable;
    //增加一个查询值就增加一个变量

    async.series([
            function(callback) {
                //article with most number of revisions
                Revision.findMostRev(function (err,result) {
                        if (err){
                            console.log("Cannot find most revision!")
                        }else{
                            console.log("mrelse");
                            MostRevArticle = result[0];
                        }
                        callback(null);
                    }
                );
            }

        ],
// optional callback
        function(err, results) {

            console.log("final");
            //增加一个查询值就增加一个变量，传给模板
            res.render('DataAnalyticMain.ejs',{
                MostRevArticle:MostRevArticle});
        });

}