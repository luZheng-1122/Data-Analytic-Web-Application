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

    $.getScript('/javascripts/components/individual.js', function()
    {
        console.log("load left individual");
        getData();
    });

    intiPageTag();

}

function intiPageTag() {
    var OverPageTag = document.getElementById("overPageTag");
    var IndiPageTag = document.getElementById("indiPageTag");
    OverPageTag.onclick = OverPageTagclick;
    IndiPageTag.onclick = IndiPageTagclick;
}

function OverPageTagclick() {

    $('#indiPageTag').removeClass("current");
    $('#overPageTag').addClass("current");
    $('#individual').hide();
    $('#overall').show();

}

function IndiPageTagclick() {

    $('#overPageTag').removeClass("current");
    $('#indiPageTag').addClass("current");
    $('#overall').hide();
    $('#individual').show();
}