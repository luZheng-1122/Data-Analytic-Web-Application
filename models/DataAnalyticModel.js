/**
 * lu zheng 2017.5.12
 */
var mongoose = require('./dbConnect');
var async = require("async");

var RevisionSchema = new mongoose.Schema(
		{title: String,
		 timestamp:String, 
		 user:String,
         admin:String,
         robot:String,
		 anon:String},
		 {
             versionKey: false
		})

//overall page

//The article with the most number of revisions.
RevisionSchema.statics.findMostRev = function(callback){

    var findMostRevPipeline = [
        {'$group':{'_id':"$title", 'count': {$sum:1}}},
        {'$sort':{count:-1}},
        {'$limit':1}
    ]

	return this.aggregate(findMostRevPipeline)
	.exec(callback)
}

//article with least number of revisions
RevisionSchema.statics.findLeastRev = function(callback){

    var findMostRevPipeline = [
        {'$group':{'_id':"$title", 'count': {$sum:1}}},
        {'$sort':{count:1}},
        {'$limit':1}
    ]

    return this.aggregate(findMostRevPipeline)
        .exec(callback)
}

//article edited by largest group of registered users
RevisionSchema.statics.findLargestGroupRev = function(callback){

    var findMostRevPipeline = [
        {'$match':{'anon':{$exists:false}, 'admin': {$exists:false}, 'bot': {$exists:false}}},
        {'$group':{'_id':{'title':"$title",'user':"$user"}}},
        {'$group':{'_id':"$_id.title",sum:{$sum:1}}},
        {'$sort':{sum:-1}},
        {'$limit':1}
    ]

    return this.aggregate(findMostRevPipeline)
        .exec(callback)
}

//article edited by smallest group of registered users
RevisionSchema.statics.findLeastGroupRev = function(callback){

    var findMostRevPipeline = [
        {'$match':{'anon':{$exists:false}, 'admin': {$exists:false}, 'bot': {$exists:false}}},
        {'$group':{'_id':{'title':"$title",'user':"$user"}}},
        {'$group':{'_id':"$_id.title",sum:{$sum:1}}},
        {'$sort':{sum:1}},
        {'$limit':1}
    ]

    return this.aggregate(findMostRevPipeline)
        .exec(callback)
}

//The article with the longest history and the newest year.
RevisionSchema.statics.findLongestRev = function(callback){

    return this.find({ }, { timestamp: 1, title: 1 })
        .sort({"timestamp":1})
        .limit(1)
        .exec(callback);
}
//The oldest year
RevisionSchema.statics.findShortestRev = function(callback){

    return this.find({ }, { timestamp: 1, title: 1 })
        .sort({"timestamp":-1})
        .limit(1)
        .exec(callback);
}

//The article with the shortest history.
RevisionSchema.statics.findShortestHis = function(callback){
//结果的问题
    var findShortestHisPipeline = [
        {'$group':
            {
            _id: {title:"$title"},
            "timestamp": {$min: "$timestamp"}
        }},
        {'$sort':{timestamp:-1}},
        {'$limit':1}
    ]

    return this.aggregate(findShortestHisPipeline)
        .exec(callback)
}

//for overall page, query data for pie chart
RevisionSchema.statics.queryOverallPie = function(cb){
    var totalNum,anonNum,adminNum,robotNum,regularNum;

    async.series([
            //query totalNum
            function(callback) {
                console.log("one");
                Revision.count()
                    .exec(function (err,result) {
                        if (err){
                            console.log("Query number of total error!")
                        }else{
                            console.log("The number of total is:");
                            console.log(result)
                            totalNum = result;
                        }
                        callback(null);
                    });
            },
            function(callback) {
                console.log("two");
                Revision.find({admin:{$exists: true}})
                    .count()
                    .exec(function (err,result) {
                        if (err){
                            console.log("Query number of admin error!")
                        }else{
                            console.log("The number of admin is:");
                            console.log(result)
                            adminNum = result;
                        }
                        callback(null);
                    });

            },
            //
            function (callback) {
                console.log("three");
                Revision.find({robot:{$exists: true}})
                    .count()
                    .exec(function (err,result) {
                        if (err){
                            console.log("Query number of robot error!")
                        }else{
                            console.log("The number of robot is:");
                            console.log(result)
                            robotNum = result;
                        }
                        callback(null);
                    });

            },
            function (callback) {
                console.log("four");
                Revision.find({anon:{$exists: true}})
                    .count()
                    .exec(function (err,result) {
                        if (err){
                            console.log("Query number of anon error!")
                        }else{
                            console.log("The number of anon is:");
                            console.log(result)
                            anonNum = result;
                        }
                        callback(null);
                    });

            },
        ],
        //
        function() {
            console.log("final");
            regularNum = totalNum - (anonNum+adminNum+robotNum);
            var data = {anonNum: anonNum, adminNum:adminNum, robotNum:robotNum, regularNum:regularNum};
            cb(null,data);
        });
}

//for overall page, query data for bar chart
RevisionSchema.statics.queryOverallBar = function (Year, cb) {
    var adminData = new Array;
    var anonData = new Array;
    var robotData = new Array;
    var regularData = new Array;
//admin
    var iterateeadmin = function (value, key, callback) {
        Revision.find({
            "timestamp":{ $regex: value },
            admin:{$exists: true} })
            .count()
            .exec(function (err,result) {
                if (err){
                    console.log("Query overall bar error!")
                }else{
                    console.log("The number of revisions is:");
                    console.log(result)
                    adminData.push(result);
                }
                callback(null);
            });
    }

//anon
    var iterateeanon = function (value, key, callback) {
        Revision.find({
            "timestamp":{ $regex: value },
            anon:{$exists: true} })
            .count()
            .exec(function (err,result) {
                if (err){
                    console.log("Query overall bar error!")
                }else{
                    console.log("The number of revisions is:");
                    console.log(result)
                    anonData.push(result);
                }
                callback(null);
            });
    }

//robot
    var iterateerobot = function (value, key, callback) {
        Revision.find({
            "timestamp":{ $regex: value },
            robot:{$exists: true} })
            .count()
            .exec(function (err,result) {
                if (err){
                    console.log("Query overall bar error!")
                }else{
                    console.log("The number of revisions is:");
                    console.log(result)
                    robotData.push(result);
                }
                callback(null);
            });
    }

//regular user
    var iterateere = function (value, key, callback) {
        Revision.find({
            "timestamp":{ $regex: value },
            admin:{$exists: false},
            anon:{$exists: false},
            robot:{$exists: false}
        }).count()
            .exec(function (err,result) {
                if (err){
                    console.log("Query overall bar error!")
                }else{
                    console.log("The number of revisions is:");
                    console.log(result)
                    regularData.push(result);
                }
                callback(null);
            });
    }

    async.series([
        function (callback) {
            async.forEachOfSeries(Year, iterateeadmin, function () {
                console.log(adminData);
                callback(null);
            });
        },
        function (callback) {
            async.forEachOfSeries(Year, iterateeanon, function () {
                console.log(anonData);
                callback(null);
            });
        },
        function (callback) {
            async.forEachOfSeries(Year, iterateerobot, function () {
                console.log(robotData);
                callback(null);
            });
        },
        function (callback) {
            async.forEachOfSeries(Year, iterateere, function () {
                console.log(regularData);
                callback(null);
            });
        },
    ],function () {
        console.log("ffffinal");
        var data = {adminData:adminData, anonData:anonData,robotData:robotData,regularData:regularData};
        cb(null,data);
    });
}


//individual page

//develop article table
RevisionSchema.statics.articleTable = function(callback){
    var articleTable = [
        {'$group': {'_id':"$title",'count':{$sum:1}}}
    ]

    return this.aggregate(articleTable)
        .exec(callback)
}

//for individual page, ajax for latestTimestamp of selected article
RevisionSchema.statics.latestTimestamp = function(title,callback){

    return this.find({"title":title }, { timestamp: 1})
        .sort({"timestamp":-1})
        .limit(1)
        .exec(callback);
}

//for individual page, insert with new revisions from wiki api//err!!
RevisionSchema.statics.insertNewRevision = function (title,data,type,callback) {
    if (type == "other")
    {
        console.log("newrevision type == other"+type)
        var newRevision = new Revision({title: title, user:data.user , timestamp:data.timestamp});
        newRevision.save(function (err, product, numAffected) {
            if (err){console.log("err")}
            console.log(numAffected + "has been saved");
            callback(null);
        });
    }
    else if(type == "anon"){
        console.log("newrevision type =="+type)
        var newRevision = new Revision({title: title, user:data.user , timestamp:data.timestamp, anon: true});
        newRevision.save(function (err, product, numAffected) {
            if (err){console.log("err")}
            console.log(numAffected + "has been saved");
            callback(null);
        });
    }
    else if(type == "admin"){
        console.log("newrevision type =="+type)
        var newRevision = new Revision({title: title, user:data.user , timestamp:data.timestamp, admin: true});
        newRevision.save(function (err, product, numAffected) {
            if (err){console.log("err")}
            console.log(numAffected + "has been saved");
            callback(null);
        });
    }
    else if(type == "robot"){
        console.log("newrevision type =="+type)
        var newRevision = new Revision({title: title, user:data.user , timestamp:data.timestamp, robot: true});
        newRevision.save(function (err, product, numAffected) {
            if (err){console.log("err")}
            console.log(numAffected + "has been saved");
            callback(null);
        });
    }

}

//for individual page, longest time of selected article
RevisionSchema.statics.findArticleLongestRev = function(title, callback){

    return this.find({"title":title}, { timestamp: 1})
        .sort({"timestamp":1})
        .limit(1)
        .exec(callback);
}

//for individual page, shortest time of selected article
RevisionSchema.statics.findArticleShortestRev = function(title,callback){

    return this.find({"title":title }, { timestamp: -1})
        .sort({"timestamp":-1})
        .limit(1)
        .exec(callback);
}

//for individual page, query data of selected article for pie chart
RevisionSchema.statics.queryArticlePie = function(title,cb){
    var totalNum,anonNum,adminNum,robotNum,regularNum;

    async.series([
            //query totalNum
            function(callback) {
                console.log("one");
                Revision.find({"title":title })
                    .count()
                    .exec(function (err,result) {
                        if (err){
                            console.log("Query number of total error!")
                        }else{
                            console.log("The number of total is:");
                            console.log(result)
                            totalNum = result;
                        }
                        callback(null);
                    });
            },
            function(callback) {
                console.log("two");
                Revision.find({title:title,admin:{$exists: true}})
                    .count()
                    .exec(function (err,result) {
                        if (err){
                            console.log("Query number of admin error!")
                        }else{
                            console.log("The number of admin is:");
                            console.log(result)
                            adminNum = result;
                        }
                        callback(null);
                    });

            },
            //
            function (callback) {
                console.log("three");
                Revision.find({title:title,robot:{$exists: true}})
                    .count()
                    .exec(function (err,result) {
                        if (err){
                            console.log("Query number of robot error!")
                        }else{
                            console.log("The number of robot is:");
                            console.log(result)
                            robotNum = result;
                        }
                        callback(null);
                    });

            },
            function (callback) {
                console.log("four");
                Revision.find({title:title,anon:{$exists: true}})
                    .count()
                    .exec(function (err,result) {
                        if (err){
                            console.log("Query number of anon error!")
                        }else{
                            console.log("The number of anon is:");
                            console.log(result)
                            anonNum = result;
                        }
                        callback(null);
                    });

            },
        ],
        //
        function() {
            console.log("final");
            regularNum = totalNum - (anonNum+adminNum+robotNum);
            var data = {anonNum: anonNum, adminNum:adminNum, robotNum:robotNum, regularNum:regularNum};
            cb(null,data);
        });
}

//for individual page, query data of selected article for bar chart
RevisionSchema.statics.queryArticleBar = function (title,Year, cb) {
    var adminData = new Array;
    var anonData = new Array;
    var robotData = new Array;
    var regularData = new Array;
//admin
    var iterateeadmin = function (value, key, callback) {
        Revision.find({
            title:title,
            timestamp:{ $regex: value },
            admin:{$exists: true} })
            .count()
            .exec(function (err,result) {
                if (err){
                    console.log("Query overall bar error!")
                }else{
                    console.log("The number of revisions is:");
                    console.log(result)
                    adminData.push(result);
                }
                callback(null);
            });
    }

//anon
    var iterateeanon = function (value, key, callback) {
        Revision.find({
            title:title,
            timestamp:{ $regex: value },
            anon:{$exists: true} })
            .count()
            .exec(function (err,result) {
                if (err){
                    console.log("Query overall bar error!")
                }else{
                    console.log("The number of revisions is:");
                    console.log(result)
                    anonData.push(result);
                }
                callback(null);
            });
    }

//robot
    var iterateerobot = function (value, key, callback) {
        Revision.find({
            title:title,
            timestamp:{ $regex: value },
            robot:{$exists: true} })
            .count()
            .exec(function (err,result) {
                if (err){
                    console.log("Query overall bar error!")
                }else{
                    console.log("The number of revisions is:");
                    console.log(result)
                    robotData.push(result);
                }
                callback(null);
            });
    }

//regular user
    var iterateere = function (value, key, callback) {
        Revision.find({
            title:title,
            timestamp:{ $regex: value },
            admin:{$exists: false},
            anon:{$exists: false},
            robot:{$exists: false}
        }).count()
            .exec(function (err,result) {
                if (err){
                    console.log("Query overall bar error!")
                }else{
                    console.log("The number of revisions is:");
                    console.log(result)
                    regularData.push(result);
                }
                callback(null);
            });
    }

    async.series([
        function (callback) {
            async.forEachOfSeries(Year, iterateeadmin, function () {
                console.log(adminData);
                callback(null);
            });
        },
        function (callback) {
            async.forEachOfSeries(Year, iterateeanon, function () {
                console.log(anonData);
                callback(null);
            });
        },
        function (callback) {
            async.forEachOfSeries(Year, iterateerobot, function () {
                console.log(robotData);
                callback(null);
            });
        },
        function (callback) {
            async.forEachOfSeries(Year, iterateere, function () {
                console.log(regularData);
                callback(null);
            });
        },
    ],function () {
        console.log("ffffinal");
        var data = {adminData:adminData, anonData:anonData,robotData:robotData,regularData:regularData};
        cb(null,data);
    });
}

//for individual page, find 5 topUsers of selected article
RevisionSchema.statics.findTopusers = function (title,callback) {

    var findTopusersPipeline = [
        {$match:{
            title: title,
            anon:{$exists:false},
            admin:{$exists:false},
            robot:{$exists:false}}
        },
        {$group:{_id:"$user",count:{$sum:1}}},
        {$sort:{count:-1}},
        {$limit:5}
    ]

    return this.aggregate(findTopusersPipeline)
        .exec(callback)
}

//for individual page, find distribution of 5 topUsers of selected article
RevisionSchema.statics.topUsersDistribution = function (title,year,topUsers,callback){
    var usersData = new Array;
    var user1 = new Array;
    var user2 = new Array;
    var user3 = new Array;
    var user4 = new Array;
    var user5 = new Array;
    usersData = [user1,user2,user3,user4,user5];
    console.log(usersData);
    console.log(title);
    console.log(year);
    console.log(topUsers);

    var iterateeTopUsers = function (year, key, callback) {

        var iterateeTopUsersinner = function (users, innerkey, callback) {
            console.log(title);
            console.log(year);
            console.log(users._id);
            Revision.find({
                title:title,
                timestamp:{ $regex: year },
                user:users._id })
                .count()
                .exec(function (err,result) {
                    if (err){
                        console.log("Query overall bar error!")
                    }else{
                        console.log("The number of revisions is:");
                        console.log(result);
                        console.log(usersData[innerkey]);
                        usersData[innerkey].push(result);
                    }
                    callback(null);
                });
        }

        async.forEachOfSeries(topUsers, iterateeTopUsersinner, function () {
            // console.log(adminData);
            callback(null);
        });
    }
    async.forEachOfSeries(year, iterateeTopUsers, function () {
        console.log(usersData);
        callback(null,usersData);
    });

}

var Revision = mongoose.model('Revision', RevisionSchema, 'revisions');

module.exports = Revision