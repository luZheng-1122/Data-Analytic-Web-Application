/**
 * Created by zhenglu on 6/07/2017.
 */

function getData() {

    $.ajax( {
        url: 'http://localhost:3000/GetIndiArticleTable',
        data: {},
        dataType: 'json',
        type: 'GET',
        cache: false,
        headers: { 'Api-User-Agent': 'Example/1.0' },
        success: function(data) {

            var htmlLeft = new EJS({url: '/components/left_individual.ejs'}).render({articleTable: data});
            $('#individual').append(htmlLeft);
            var htmlRight = new EJS({url: '/components/right_individual.ejs'}).render({});
            $('#individual').append(htmlRight);

            insertArticle();
            initIndividualTag();
            $('#left_individual').show();
            $('#right_individual').show();

        },
        error: function (e) {
            console.log("error log: " + e);
        }
    } );

}

function insertArticle() {
    console.log("inserttable");
    var table = $('#articleTable').DataTable( {
        "scrollY":        "200px",
        "scrollCollapse": true,
        "paging":         false,
        "select":         true
    } );

    //bind select event for table, enable selection by click
    //https://datatables.net/extensions/select/
    table.on( 'select', function ( e, dt, type, indexes ) {
        if ( type === 'row' ) {
            // alert(1);
            var data = table.rows( indexes ).data();
            var articleName = data[0][0];
            var latestTimestamp;
            // console.log(data[0][0]);

            $('#TopFiveText ul').html("");
            $('#IndiCharts').hide();
            //two spinners in the individual page, thus use class "IndiSpinner" rather than id
            $('.IndiSpinner').show();

            //use ajax to ask backend for selected article`s latest timestamp, and send it back
            $.ajax( {
                url: 'http://localhost:3000/GetLatestTimestamp',
                data: {articleName:articleName},
                dataType: 'text',
                type: 'GET',
                cache: false,
                headers: { 'Api-User-Agent': 'Example/1.0' },
                success: function(data) {
                    // do something with data
                    latestTimestamp = data;
                    console.log(latestTimestamp);
                    queryNewRevisions(articleName,latestTimestamp);
                }
            } );



        }
    } );
}

function initIndividualTag() {
    var InditagBar = document.getElementById("InditagBar");
    var InditagPie = document.getElementById("InditagPie");
    var InditagBarUserTotal = document.getElementById("InditagBarUserTotal");
    InditagBar.onmouseenter = IndiBarmouse;
    InditagPie.onmouseenter = IndiPiemouse;
    InditagBarUserTotal.onmouseenter = IndiUserTotalmouse;
}


//get new revisions from wiki API, data has problems!!
function queryNewRevisions(articleName,latestTimestamp) {

    // need a loop to query until there is no new revisions
    //also work in back end
    //timestamp query, split to meet wiki URL
    var date = latestTimestamp.substring(0,10);
    var hour = latestTimestamp.substring(11,13);
    var min = latestTimestamp.substring(14,16);
    var sec = latestTimestamp.substring(17,19);
    var year = latestTimestamp.substring(0,4);
    var month = latestTimestamp.substring(5,7);

    //???
    if ( month == "01"){
        month = "12";
        year = year - 1 ;
    }
    else {
        month = month - 1;
    }

    var time = new Date( year, month, latestTimestamp.substring(8,10), hour, min, sec);
    console.log(time);
    var now = new Date();
    console.log(now);
    console.log(now);

    // query wiki API when the time is longer than 24hours
    if ( now.getTime() - time.getTime() > 86400000)
    {
        console.log("data has not up to date!")
        var URL = "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=revisions&titles=" + articleName
            +"&formatversion=2&rvprop=timestamp%7Cuser&rvlimit=max&rvstart="+ date
            +"T"+hour+"%3A"+min+"%3A"+sec+".000Z&rvdir=newer";

        $.ajax( {
            url: URL,
            data: null,
            dataType: 'json',
            type: 'GET',
            headers: { 'Api-User-Agent': 'Example/1.0' },
            success: function(data) {
                if (data){
                    //shows the number of new revisions
                    var newRevisionNum = data.query.pages['0'].revisions.length;
                    console.log(data.query.pages['0'].revisions);
                    getIndividualData(1, articleName, data.query.pages['0'].revisions, newRevisionNum, latestTimestamp);
                }
                else{
                    //shows when no new revision
                    alert("no new revisions!");
                }
            },
            err: function (err) {
                console.log(err);
            }
        } );
    }
    else{
        console.log("data has up to date");
        getIndividualData(0, articleName, null, null)
    }
}

function getIndividualData(type, articleName, apiData,newRevisionNum, latestTimestamp) {

    $.ajax( {
        url: 'http://localhost:3000/GetIndividualData',
        data: {type: type, title: articleName, apiData:apiData, latestTimestamp: latestTimestamp},
        dataType: 'json',
        type: 'GET',
        cache: false,
        headers: { 'Api-User-Agent': 'Example/1.0' },
        success: function(data) {
            //draw the charts
            $('.IndiSpinner').hide();
            $('#IndiCharts').show();

            drawBarChart(data.Bar, data.Year,articleName);
            drawPieChart(data.Pie,articleName);
            drawUserTotal(data.topUsers, data.topUsersDis, data.Year,articleName);
            addTop5Users(data.topUsers);

            console.log(newRevisionNum);
            var number = newRevisionNum - 1;
            if (newRevisionNum <= 1)
            {
                alert("no new revisions");
            }
            else{
                alert( number + " revisions have been inserted!")
            }
        }
    } );
}

//init tag event
function IndiBarmouse(e) {

    $('#InditagBarUserTotal').removeClass("select");
    $('#InditagPie').removeClass("select");
    $('#InditagBar').addClass("select");
    $('#IndiChartBarUserTotal').hide();
    $('#IndiChartPie').hide();
    $('#IndiChartBar').show();
}

function IndiPiemouse(e) {

    $('#InditagBarUserTotal').removeClass("select");
    $('#InditagBar').removeClass("select");
    $('#InditagPie').addClass("select");
    $('#IndiChartBarUserTotal').hide();
    $('#IndiChartBar').hide();
    $('#IndiChartPie').show();
}

function IndiUserTotalmouse() {

    $('#InditagPie').removeClass("select");
    $('#InditagBar').removeClass("select");
    $('#InditagBarUserTotal').addClass("select");

    $('#IndiChartPie').hide();
    $('#IndiChartBar').hide();
    $('#IndiChartBarUserTotal').show();
}


//Echarts
//http://echarts.baidu.com/gallery/index.html
function drawBarChart(data,year,articleName){
    var myChart = echarts.init(document.getElementById('IndiChartBar'));
    // 指定图表的配置项和数据
    var option = {
        title: {
            text: articleName + 'yearly revision number distribution',
            x:"center",
            y:"bottom"
        },
        tooltip: {},
        legend: {
            data:['Administrator','Anonymous','Robot','Regular user']
        },
        xAxis: {
            type: 'category',
            axisTick: {
                alignWithLabel: true
            },
            data: year
        },
        yAxis: {},
        series: [
            {
                name:'Administrator',
                type:'bar',
                data:data.adminData
            },
            {
                name:'Anonymous',
                type:'bar',
                data:data.anonData
            },
            {
                name:'Robot',
                type:'bar',
                data:data.robotData
            },
            {
                name:'Regular user',
                type:'bar',
                data:data.regularData
            }
        ]
    };

    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
}

function drawPieChart(data,articleName) {
    var dom = document.getElementById("IndiChartPie");
    var myChart = echarts.init(dom);
    var app = {};
    option = null;
    option = {
        title : {
            text: articleName + 'user type distribution',
            x:'center',
            y:'bottom'
        },
        tooltip : {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            data: ['Administrator','Anonymous','Robot','Regular user']
        },
        series : [
            {
                name: 'Revisions',
                type: 'pie',
                radius : '55%',
                center: ['50%', '60%'],
                data:[
                    {value:data.adminNum, name:'Administrator'},
                    {value:data.anonNum, name:'Anonymous'},
                    {value:data.regularNum, name:'Regular user'},
                    {value:data.robotNum, name:'Robot'}
                ],
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };
    ;
    if (option && typeof option === "object") {
        myChart.setOption(option, true);
    }
}

function drawUserTotal(users,userDis,year, articleName) {

    var myChart = echarts.init(document.getElementById('IndiChartBarUserTotal'));
    // 指定图表的配置项和数据
    var option = {
        title: {
            text: articleName + 'Top 5 users distribution',
            x:"center",
            y:"bottom"
        },
        tooltip: {},
        legend: {
            data:[users[0]._id, users[1]._id, users[2]._id, users[3]._id, users[4]._id]
        },
        xAxis: {
            type: 'category',
            axisTick: {
                alignWithLabel: true
            },
            data: year
        },
        yAxis: {},
        series: [
            {
                name:users[0]._id,
                type:'bar',
                data:userDis[0]
            },
            {
                name:users[1]._id,
                type:'bar',
                data:userDis[1]
            },
            {
                name:users[2]._id,
                type:'bar',
                data:userDis[2]
            },
            {
                name:users[3]._id,
                type:'bar',
                data:userDis[3]
            },
            {
                name:users[4]._id,
                type:'bar',
                data:userDis[4]
            }

        ]
    };

    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
}

function addTop5Users(users) {

    $('#TopFiveText ul').html("");
    $('#userName5').html("");

    for (var i = 0; i<users.length;i++) {
        var li = $("<li></li>").text("user:  " + users[i]._id + "    num:  " + users[i].count);
        var p = $("<p class='uaerName'></p>").text(users[i]._id);
        $('#TopFiveText ul').append(li);
        $('#userName5').append(p);
    }
}