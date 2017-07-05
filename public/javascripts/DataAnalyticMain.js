/**
 * Created by zhenglu on 4/07/2017.
 */

window.onload = function () {

    $.getScript('/javascripts/components/left_overall.js', function()
    {
        console.log("load left overall");
        getData();
    });

    $.getScript('/javascripts/components/right_overall.js', function()
    {
        console.log("load right overall");
        getData();
    });

}

