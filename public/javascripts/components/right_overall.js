/**
 * Created by zhenglu on 5/07/2017.
 */

function getData() {

    var html = new EJS({url: '/components/right_overall.ejs'}).render({});
    $('#overall').append(html);
    $('#right_overall').show();

    mouseEvent();

    $.ajax( {
        url: 'http://localhost:3000/GetRightOverall',
        data: {},
        dataType: 'json',
        type: 'GET',
        cache: false,
        headers: { 'Api-User-Agent': 'Example/1.0' },
        success: function(data) {

            //if success, render two charts
            $('#Overspinner').hide();
            OverdrawBarChart(data.Bar, data.Year);
            OverdrawPieChart(data.Pie);
        },
        error: function (e) {
            console.log("error log: " + e);
        }
    } );
}

function mouseEvent() {
    var OvertagBar = document.getElementById("OvertagBar");
    var OvertagPie = document.getElementById("OvertagPie");
    OvertagBar.onmouseenter = OverBarmouse;
    OvertagPie.onmouseenter = OverPiemouse;
}

function OverBarmouse(e) {

    $('#OvertagPie').removeClass("select");
    $('#OvertagBar').addClass("select");
    $('#OverChartPie').hide();
    $('#OverChartBar').show();
}

function OverPiemouse(e) {

    $('#OvertagBar').removeClass("select");
    $('#OvertagPie').addClass("select");
    $('#OverChartBar').hide();
    $('#OverChartPie').show();
}

function OverdrawBarChart(data,year){

    var myChart = echarts.init(document.getElementById('OverChartBar'));
    // 指定图表的配置项和数据
    var option = {
        title: {
            text: 'Revision distribution by year and by user type',
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
            //need to be generated automatically
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

function OverdrawPieChart(data) {
    var dom = document.getElementById("OverChartPie");
    var myChart = echarts.init(dom);
    var app = {};
    option = null;
    option = {
        title : {
            text: 'Revision distribution by user type',
            x:'center'
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