var playing = 0;
var music_sec = 0;

var mPlaying = 0;
var yIds = ["xcJtL7QggTI", "OLizj5FYkq4", "WEwgbKr5R9I"];


var pressTimer;


$(".playing").css("visibility", "hidden");

document.getElementById('cImg').onload = function () {
    document.getElementById('cArt').style.display = "flex";
}
document.getElementById('cImg').onerror = function() {
    document.getElementById("cArt").style.display = "none";
}   

getText = function(url, callback) 
{  
    $
    .getJSON( url,  function( json ) {
        callback(json);
    })  
    .fail( function (){
        $(".playing").css("visibility", "hidden");
    });
}


function updateText(data) {
    //console.log(data)
    var artist;
    var album;
    var song;
    var cArt;

    var idx = data.player.activeItem.index;


    if (idx != -1) {
        $.getJSON("http://127.0.0.1:8800/api/playlists/0/items/"+idx+":1?columns=%25artist%25,%25album%25,%25title%25", function( soundtrack ) {
            if (soundtrack.playlistItems.items[0].columns[0] != "?") {
                artist = soundtrack.playlistItems.items[0].columns[0];
            } else {
                artist = "";
            }

            if (soundtrack.playlistItems.items[0].columns[1] != "?") {
                album = soundtrack.playlistItems.items[0].columns[1];
            } else {
                album = "";
            }

            if (soundtrack.playlistItems.items[0].columns[2] != "?") {
                song = soundtrack.playlistItems.items[0].columns[2];
            } else {
                song = "";
            }

            document.getElementById("song").innerText = song;
            document.getElementById("artist").innerText = artist;
            document.getElementById("album").innerText = album;

        });
        
        var url = "http://127.0.0.1:8800/api/artwork/0/" + idx;
        document.getElementById("cImg").src = url;
            


        
        $(".playing").css("visibility", "visible");

        $.getJSON("http://127.0.0.1:8800/api/player", function( data ) {
            var dur = data.player.activeItem.duration;
            var pos = data.player.activeItem.position;
            music_sec = dur-pos;
        });

        playing = song;
        return;

        

    } 
    
    artist = "";
    album = "";
    song = "";
    cArt = "";
    document.getElementById("song").innerText = song;
    document.getElementById("artist").innerText = artist;
    document.getElementById("album").innerText = album;
    document.getElementById("cImg").src = cArt;

    $(".playing").css("visibility", "hidden");

    
    playing = song;
    
    
 }

 
$('#container_wallpaper').on('click', function() {
    // Static Screen
    if (mPlaying == 0) 
    {
        $('#container_wallpaper').css('left', '2560px');
        $('#container_wallpaper').css('top', '1440px');
        $('#container_wallpaper').css('width', '1280px');
        $('#container_wallpaper').css('height', '720px');
        
        $('#container_weather2').css('width', '426px');
        $('#container_weather2').css('height', '240px');
        $('#container_weather2').css('font-size', '44px');
        $('.clock2').css('font-size', '96px');
        
        
        $('#container_vb').css('left', '720px');
        $('#container_vb').css('top', '0px');
        $('#container_vb').css('width', '3120px');
        $('#container_vb').css('height', '1440px');

        mPlaying = 1;

    } else if (mPlaying == 1) { /* bloomberg */

        $('#container_vb').css('left', '0px');
        $('#container_vb').css('top', '1440px');
        $('#container_vb').css('width', '1280px');
        $('#container_vb').css('height', '720px');

        $('#container_v2').css('left', '720px');
        $('#container_v2').css('top', '0px');
        $('#container_v2').css('width', '2560px');
        $('#container_v2').css('height', '1440px');

        $('#container_v2').css('paddingLeft', '280px');
        $('#container_v2').css('paddingRight', '280px');
        
        
        mPlaying = 2;

    } else if (mPlaying == 2) {

        $('#container_v2').css('left', '1280px');
        $('#container_v2').css('top', '1440px');
        $('#container_v2').css('width', '1280px');
        $('#container_v2').css('height', '720px');

        $('#container_v2').css('paddingLeft', '0px');
        $('#container_v2').css('paddingRight', '0px');


        $('#container_v1').css('left', '720px');
        $('#container_v1').css('top', '0px');
        $('#container_v1').css('width', '2560px');
        $('#container_v1').css('height', '1440px');

        $('#container_v1').css('paddingLeft', '280px');
        $('#container_v1').css('paddingRight', '280px');

        mPlaying = 3;

    } else {

        $('#container_v2').css('left', '0px');

        $('#container_vb').css('left', '2560px');

        $('#container_v1').css('left', '1280px');
        $('#container_v1').css('top', '1440px');
        $('#container_v1').css('width', '1280px');
        $('#container_v1').css('height', '720px');

        $('#container_v1').css('paddingLeft', '0px');
        $('#container_v1').css('paddingRight', '0px');



        $('#container_wallpaper').css('left', '720px');
        $('#container_wallpaper').css('top', '0px');
        $('#container_wallpaper').css('width', '3120px');
        $('#container_wallpaper').css('height', '1440px');
        
        $('#container_weather2').css('width', '720px');
        $('#container_weather2').css('height', '400px');
        $('#container_weather2').css('font-size', '66px');
        $('.clock2').css('font-size', '168px');

        mPlaying = 0;

    }
});

function reloadIframe(yId, frame) {
    var o_iframe = document.getElementById(frame);
    o_iframe.parentNode.removeChild(o_iframe);

    var n_src = `https://www.youtube.com/embed/${yId}?autoplay=1`;
    console.log(n_src);

    var ifrm = document.createElement("iframe");
    ifrm.setAttribute("src", n_src);
    
    ifrm.setAttribute("id", frame);
    ifrm.setAttribute("class", "bgalpha rightClickable")
    ifrm.setAttribute("title", "YouTube video player");
    ifrm.setAttribute("frameborder", "0");
    ifrm.setAttribute("allowfullscreen", "true")
    ifrm.setAttribute("allow", "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen");
    ifrm.style.width = "100%";
    ifrm.style.height = "100%";
    return ifrm;
}

function ytRefresher() {
    var yId = yIds.shift();
    var childElement = reloadIframe(yId, "p2");
    document.getElementById("container_v2").appendChild(childElement);
    yIds.push(yId);
}


$('#yVTUBE').on('click', function() {
    ytRefresher();
});

$('#yNC').on('click', function() {
    yId = "Dxya5ucIroI";
    var childElement = reloadIframe(yId, "p1");
    document.getElementById("container_v1").appendChild(childElement);
    
});



function loadHLS() {
    
    if(Hls.isSupported()) {
        var video = document.getElementById("pB");
        var hls = new Hls();
        hls.loadSource('https://www.bloomberg.com/media-manifest/streams/phoenix-us.m3u8');
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED,function() {
          video.play();
      });
     }
      else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = 'https://www.bloomberg.com/media-manifest/streams/phoenix-us.m3u8';
        video.addEventListener('canplay',function() {
          video.play();
        });
      }
}

$('#bBloomberg').on('click', function() {

    var o_iframe = document.getElementById('pB');
    o_iframe.parentNode.removeChild(o_iframe);
        
    var vBloomberg = document.createElement("video");
    vBloomberg.setAttribute("id", "pB");
    vBloomberg.setAttribute("class", "bgalpha rightClickable")
    vBloomberg.setAttribute("controls", "");

    vBloomberg.style.width = "100%";
    vBloomberg.style.height = "100%";

    document.getElementById("container_vb").appendChild(vBloomberg);

    loadHLS();

});

$('#bYoutube2').on('click', function() {

    $.getJSON("js/youtube.json?nocache=" + (new Date()).getTime(), function(jsReturn) {
        yId = jsReturn.main2;
        var childElement = reloadIframe(yId, "p2");
        document.getElementById("container_v2").appendChild(childElement);
    });

});


$('#bYoutube1').on('click', function() {

    $.getJSON("js/youtube.json?nocache=" + (new Date()).getTime(), function(jsReturn) {
        yId = jsReturn.main1;
        var childElement = reloadIframe(yId, "p1");
        document.getElementById("container_v1").appendChild(childElement);
    });

});

$('#bYoutubeB').on('click', function() {
    $.getJSON("js/youtube.json?nocache=" + (new Date()).getTime(), function(jsReturn) {
        yId = jsReturn.bloomberg;
        var childElement = reloadIframe(yId, "pB");
        
        document.getElementById("container_vb").appendChild(childElement);
    });
})


 
function setText() {
    getText('http://127.0.0.1:8800/api/player', updateText); //passing mycallback as a method
    return playing;
}

function playerPos() {
    return music_sec;
}

$(".rightClickable").mouseup(function(){
    clearTimeout(pressTimer);
    // Clear timeout
    return false;
  }).mousedown(function(){
    // Set timeout
    pressTimer = window.setTimeout(function() {     
        var ev3 = new MouseEvent("contextmenu", {
            bubbles: true,
            cancelable: false,
            view: window,
            button: 2,
            buttons: 0,
            clientX: element.getBoundingClientRect().x,
            clientY: element.getBoundingClientRect().y
        });
        this.id.dispatchEvent(ev3);
    },1000);
    return false; 
  });

  $(".rightClickable").on("taphold", function( event ) { 
    var ev3 = new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: false,
        view: window,
        button: 2,
        buttons: 0,
        clientX: element.getBoundingClientRect().x,
        clientY: element.getBoundingClientRect().y
    });
    this.id.dispatchEvent(ev3);
});

  

//Init Bloomberg Player
loadHLS();
