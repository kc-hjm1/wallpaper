var playing = 0;
var music_sec = 0;

//circular list of youtube schedule
var yIds = ["mGA2060waxI", "cAGryeuHCcc"]; //redacted, list of youtube livestream schedule (Youtube Video ID)
var videoNow = {};

var cImgWidth = 0;

var pressTimer;


$(".playing").css("visibility", "hidden");

document.getElementById('cImg').onload = function () {
    document.getElementById('cArt').style.display = "flex";
}
document.getElementById('cImg').onerror = function() {
    document.getElementById("cArt").style.display = "none";
}   

getText = function(url, callback) // How can I use this callback?
{  
    $
    .getJSON( url,  function( json ) {
        callback(json);
    })  
    .fail( function (){
        $(".playing").css("visibility", "hidden");
    });
}


// Update what is playing now @ Foobar2000

function updateText(data) {
    //console.log(data)
    var artist;
    var album;
    var song;
    var cArt;

    var idx = data.player.activeItem.index;


    if (idx != -1) {
        $.getJSON("http://127.0.0.1:8800/api/playlists/0/items/"+idx+":1?columns=%25artist%25,%25album%25,%25title%25" , function( soundtrack ) {
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
            

        //
        /*
        try {
            $.getJSON("http://127.0.0.1:8800/api/artwork/0/" + idx, function (artwork){ 
                document.getElementById("cImg").style.display = 'auto';
                document.getElementById("cImg").src = "http://127.0.0.1:8800/api/artwork/0/" + idx;
            });
        } catch (e) {
            document.getElementById("cImg").style.display = 'none';
        }
        */
        
        
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

 $('#song').on('click', () => {
     fetch('http://127.0.0.1:8800/api/player/next', {
         method: 'POST'
     });
     setText();
 });

 
 /*
 $('#video').on('click', function() {
    $('#file-input').trigger('click');
    var fPath = $('#file-input').val();
    console.log(fPath);
    $('#vPlayer video source').attr('src', fPath);
    $("#vPlayer video")[0].load();

});
*/


function removeVFrame(frame) {
    var vFrame = document.getElementById(frame);
    vFrame.parentNode.removeChild(vFrame);
    setVideoNow("",frame);  
}

function reloadIframe(yId, frame, isRemoved = false) {
    
    if (getVideoNow(frame) == yId) {
        return null;
    }
    
    if (!isRemoved) {
        removeVFrame(frame);
    }


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

    setVideoNow(yId, frame);
    return ifrm;
}


function ytRefresher(removed = false) {
    if (mPlaying != -1) {
        let yId = yIds.shift();
        let childElement = reloadIframe(yId, "p2", removed);
        if (childElement) {            
            document.getElementById("container_v2").appendChild(childElement);
            yIds.push(yId);
        }
    }
}

function initVTUBE(removed = false) {
    ytRefresher(removed);
}

function initNC(removed = false) {
    let yId = "K1QICrgxTjA";
    let childElement = reloadIframe(yId, "p1", removed);
    if (childElement) 
        document.getElementById("container_v1").appendChild(childElement);
}


$('#yVTUBE').on('click', initVTUBE);

$('#yNC').on('click', initNC);


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

     // hls.js is not supported on platforms that do not have Media Source Extensions (MSE) enabled.
     // When the browser has built-in HLS support (check using `canPlayType`), we can provide an HLS manifest (i.e. .m3u8 URL) directly to the video element throught the `src` property.
     // This is using the built-in support of the plain video element, without using hls.js.
      else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = 'https://www.bloomberg.com/media-manifest/streams/phoenix-us.m3u8';
        video.addEventListener('canplay',function() {
          video.play();
        });
      }
}

function initBloomberg(removed = false) {
    if (!removed) {
        removeVFrame('pB');
    }
        
    var vBloomberg = document.createElement("video");
    vBloomberg.setAttribute("id", "pB");
    vBloomberg.setAttribute("class", "bgalpha rightClickable")
    vBloomberg.setAttribute("controls", "");

    vBloomberg.style.width = "100%";
    vBloomberg.style.height = "100%";

    document.getElementById("container_vb").appendChild(vBloomberg);

    loadHLS();

}

$('#bBloomberg').on('click', initBloomberg);

$('#bYoutube2').on('click', function() {

    $.getJSON("js/youtube.json?nocache=" + (new Date()).getTime(), function(jsReturn) {
        yId = jsReturn.main2;
        var childElement = reloadIframe(yId, "p2");
        if (childElement)
            document.getElementById("container_v2").appendChild(childElement);
    });

});


$('#bYoutube1').on('click', function() {

    $.getJSON("js/youtube.json?nocache=" + (new Date()).getTime(), function(jsReturn) {
        yId = jsReturn.main1;
        var childElement = reloadIframe(yId, "p1");
        if (childElement)
            document.getElementById("container_v1").appendChild(childElement);
    });

});

/*
$('#bYoutubeB').on('click', initLocalVideo);
*/


$('#bYoutubeB').on('click', function() {
    $.getJSON("js/youtube.json?nocache=" + (new Date()).getTime(), function(jsReturn) {
        yId = jsReturn.bloomberg;
        var childElement = reloadIframe(yId, "pB");
        if (childElement)
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



$('#date').on('click', function() {
    if (mPlaying != -1) {
        
        $('#container_vb').css('display', 'none');
        $('#container_v1').css('display', 'none');
        $('#container_v2').css('display', 'none');
        $('#container_controller2').css('display', 'none');

        removeVFrame('pB');
        removeVFrame('p1');
        removeVFrame('p2');
        
        $('#container_vb').removeClass('vPlayer player0 player1 player2');
        $('#container_v1').removeClass('vPlayer player0 player1 player2');
        $('#container_v2').removeClass('vPlayer player0 player1 player2');

        $('#container_wallpaper').removeClass('wallpaper player0 player1 player2');
        $('#container_wallpaper').addClass('xlMain');


        $('#container_weather2').css('width', '720px');
        $('#container_weather2').css('height', '400px');
        $('#container_weather2').css('font-size', '54px');
        $('#container_weather2').removeClass('right');
        $('#container_weather2').addClass('left');
        
        $(".wic").css('height', '60px')
        $(".date2").css('font-size', '54px');
        $(".weather").css('font-size', '54px');

        $('#container_upcoming').css('display', 'none');


    
        
        $('#container_plist2').css('width', '2440px'); //3120-680
        $('#container_plist2').css('height', '400px');
        $('#container_plist2').css('left', '720px');
        $('#container_plist2').css('padding-right', '680px');

        $('#container_plist2').css('top', '1760px');

        //$('#container_plist2').removeClass('top');
        //$('#container_plist2').addClass('bottom');

        
        $('#bg2').removeClass('bghidden');


        $('#cArt').addClass("cImgContainer");
        $('#cArt').css('width', '680px');
        $('#cArt').css('height', '680px');
        $('#cImg').css('object-position', 'bottom right');


        $('#song').css('font-size', '74px');
        $('#container_plist2').css('font-size', '64px');
        
        $('.clock2').css('font-size', '112px');

        mPlaying = -1;
    }
});



$('#MyClockDisplay').on('click', function() {
    // Static Screen

     if (mPlaying == -1) {
        $('#container_wallpaper').removeClass('xlMain');
        $('#container_wallpaper').addClass('wallpaper');

        
        $('#bg2').addClass('bghidden');

        
        $('#container_plist2').css('width', '720px');
        $('#container_plist2').css('height', '1280px');
        $('#container_plist2').css('top', '0px');
        $('#container_plist2').css('left', '0px');
        $('#container_plist2').css('padding-right', '0px');

        $('#cArt').removeClass("cImgContainer");
        $('#cArt').css('width', '572px');
        $('#cArt').css('height', '572px');
        $('#cImg').css('object-position', 'center');
        
        

        $('#song').css('font-size', '66px');
        $('#container_plist2').css('font-size', '56px');

        $('#container_vb').addClass('player0');
        $('#container_v1').addClass('player1');
        $('#container_v2').addClass('player2');

        
        $('#container_weather2').removeClass('left');
        $('#container_weather2').addClass('right');

        
        $('#container_vb').css('display', 'block');
        $('#container_v1').css('display', 'block');
        $('#container_v2').css('display', 'block');
        $('#container_controller2').css('display', 'flex');

        
        $('#container_upcoming').css('display', 'flex');

        

        mPlaying = 0;
        initVTUBE(true);
        initNC(true);
        initBloomberg(true);

    } else if (mPlaying == 0) {
        
        $('#container_wallpaper').removeClass('wallpaper');
        $('#container_wallpaper').addClass('player0');

        $('#container_weather2').css('width', '426px');
        $('#container_weather2').css('height', '240px');
        $('#container_weather2').css('font-size', '44px');

        $(".weather").css('font-size', '32px');
        $(".date2").css('font-size', '32px');
        $('.clock2').css('font-size', '72px');
        $(".wic").css('height', '30px')
        
        $('#container_vb').removeClass('player0');
        $('#container_vb').addClass('vPlayer');
        $('#bg2').removeClass('bghidden')
        
        $('#container_upcoming').css('display', 'none');


        mPlaying = 1;

    } else if (mPlaying == 1) { /* bloomberg */

        $('#container_vb').removeClass('vPlayer');
        $('#container_vb').addClass('player2');

        
        $('#container_v2').removeClass('player2');
        $('#container_v2').addClass('vPlayer');

        
        mPlaying = 2;

    } else if (mPlaying == 2) {

        $('#container_v2').removeClass('vPlayer');
        $('#container_v2').addClass('player1');

        
        $('#container_v1').removeClass('player1');
        $('#container_v1').addClass('vPlayer');


        mPlaying = 3;

    } else if (mPlaying == 3) {

        $('#container_v2').removeClass('player1');
        $('#container_v2').addClass('player2');


        $('#container_vb').removeClass('player2');
        $('#container_vb').addClass('player0');

        
        $('#container_v1').removeClass('vPlayer');
        $('#container_v1').addClass('player1');

        
        $('#container_wallpaper').removeClass('player0');
        $('#container_wallpaper').addClass('wallpaper');
        $('#bg2').addClass('bghidden')

        
        var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById("date").innerText = "";
        document.getElementById("date").innerText = new Intl.DateTimeFormat('en-gb', options).format(osDate);

        $('#container_weather2').css('width', '720px');
        $('#container_weather2').css('height', '400px');
        $('#container_weather2').css('font-size', '54px');
        
        
        $('.weather').css('font-size', '54px');
        $('.date2').css('font-size', '54px');
        $(".wic").css('height', '60px')
        $('.clock2').css('font-size', '112px');

        
        $('#container_upcoming').css('display', 'flex');


        mPlaying = 0;

    }
});

function setVideoNow(videoId, videoFrame) {
    videoNow[videoFrame] = videoId;
}

function getVideoNow(videoFrame) {
    return videoNow[videoFrame];
}


  

//Init Bloomberg Player
loadHLS();
