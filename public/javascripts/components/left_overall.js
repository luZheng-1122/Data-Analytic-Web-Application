/**
 * Created by zhenglu on 5/07/2017.
 */

function getData() {

    $.ajax( {
        url: 'http://localhost:3000/GetLeftOverall',
        data: {},
        dataType: 'json',
        type: 'GET',
        cache: false,
        headers: { 'Api-User-Agent': 'Example/1.0' },
        success: function(data) {

            var html = new EJS({url: '/components/left_overall.ejs'}).render({data: data});

            $('#overall').append(html);
        },
        error: function (e) {
            console.log("error log: " + e);
        }
    } );

}