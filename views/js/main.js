var alarmList = JSON.parse(alarm);
var alarmTime = new Date();
var osNetwork = 0;

var osAlarm = new Date();
var first = true;
var date = new Date();
var osDate = new Date(date.getTime() + 1000*osNetwork);
var musicChange = new Date();
var playing = "";
var lastPlaying;
var clockOn = 1;


var mPlaying = 0;

/*******
 * Date Time Utility
 */

/******
 *  Video Utility
 */
var ytLast = new Date(2011, 1, 1);
let streamingNow = [];

/**************************************************************
 * Weather Utility
 */


 var weatherLast = -1;
 var lastStreamPoll = -1;
 let bgLastUpdate = new Date(2011, 1, 1);


 /****
  * DayNight Photo Cycle Listing
  */


function updateWeather() {
    
    $.getJSON( "/weather-json", function(data) {
        let weatherUpdate = data;
        let temp = weatherUpdate.siteData.currentConditions[0].temperature[0]._
        let humid = weatherUpdate.siteData.currentConditions[0].relativeHumidity[0]._
        let wIcon = weatherUpdate.siteData.currentConditions[0].iconCode[0]._
        
        document.getElementById("temp").innerText = "";
        document.getElementById("temp").innerText = temp;
        document.getElementById("relativeHum").innerText = "";
        document.getElementById("relativeHum").innerText = humid;  

        document.getElementById("weatherIcon").src = `https://meteo.gc.ca/weathericons/${wIcon}.gif`
        
     }).done(function() {
        //console.log( "success" );
     })
     .fail(function() {
       //console.log( "weather update error" );
     });

}

function updateUpcoming() {
    
    
    document.querySelectorAll('#container_livepoll').forEach(e => e.remove());
    

    var upcoming = document.createElement("marquee");
    upcoming.setAttribute("id", "container_livepoll");
    upcoming.setAttribute("scrollamount", 30);

    
    let allUpcoming = [];

    $.getJSON("/youtube-live-stream?nocache="+ (new Date()).getTime(), function(data) {

        for (let channel in data) {
            let videos = data[channel];

            
            let uniqueIds = videos.filter( (videos, idx, self) => 
                idx === self.findIndex((t) => (t.videoId === videos.videoId))
            ); 
            
            if (uniqueIds.length != 0) {
                uniqueIds.forEach(v => allUpcoming.push(v));
            }

        }

        

        allUpcoming.sort((a, b) => (a.liveDate - b.liveDate));
        streamingNow = allUpcoming.filter((video) => video.status == "live");

        let videoPriority = ["p2", "pB", "p1"];
        let videoframe = ["container_v2", "container_vb", "container_v1"];

        while (streamingNow.length > 0 && videoPriority.length > 0) {
            let livestream = streamingNow.pop();
            let nextframe = videoPriority.pop();
            let nextframe_div = videoframe.pop();
            let childElement = reloadIframe(livestream.videoId, nextframe);
            document.getElementById(nextframe_div).appendChild(childElement);
        }

        

        allUpcoming.filter(v => v.status != "live").forEach(v => {
            const stream = document.createElement('span');
            
            let streamDate = new Date(v.liveDate * 1000);
            
            const timeOptions = {
                year: 'numeric', month: 'numeric', day: 'numeric',
                hour: '2-digit', minute: '2-digit',
                hourCycle: 'h23',
                timeZone: 'America/Vancouver',
                timeZoneName: 'short'
            };
            let streamDateStr = streamDate.toLocaleString('zh-HK', timeOptions);
            stream.innerText = `\xa0\xa0\xa0Upcoming on ${v.channelTitle} at ${streamDateStr}: ${v.title}`;
            stream.setAttribute('vid', v.videoId);
            upcoming.appendChild(stream);
            stream.onclick = () => {
                var childElement = reloadIframe(v.videoId, "p1");
                document.getElementById("container_v1").appendChild(childElement);

            }
        });
    });


    document.getElementById("container_upcoming").appendChild(upcoming);
    
}




var idx = Array(alarmList.length).fill().map((element, index) => index);
var clk = document.getElementById("MyClockDisplay");
var txtDate = document.getElementById("date");



function updateDate() {

    date = new Date();
    osDate = new Date(date.getTime() + 1000*osNetwork);
    var h = osDate.getHours(); // 0 - 23
    var m = osDate.getMinutes(); // 0 - 59
    var s = osDate.getSeconds(); // 0 - 59


    var dm = m;
    var ds = s;
    var song_dur = 0;


    h = (h < 10) ? "0" + h : h;
    m = (m < 10) ? "0" + m : m;
    s = (s < 10) ? "0" + s : s;

    var options = null;
    if (mPlaying == 0 || mPlaying == -1) {

        options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    } else {
        options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    }

    
    txtDate.innerText = "";
    //txtDate.innerText = new Intl.DateTimeFormat('en-gb', options).format(osDate);
    txtDate.innerText = osDate.toLocaleDateString('en-GB', options);


    timeOptions = {
        hour: '2-digit', minute: '2-digit', second: 'numeric',
        hourCycle: 'h23',
        timeZone: 'America/Vancouver',
        timeZoneName: 'short'
    };



    clk.innerText = "";
    clk.innerText = osDate.toLocaleTimeString('en-US', timeOptions);
    //clk.innerText = new Intl.DateTimeFormat('en-US', options).format(osDate);


    //Update time-based info

    if ((musicChange.getTime() < osDate.getTime() && playing != "") || (playing === "" && ds % 4 == 1)) {
        // Update song duration
        playing = setText();
        if (playing === "" || lastPlaying != playing) {
            musicChange = null;       
            var song_dur = Math.floor(playerPos());    
            song_dur -= 10;
            musicChange = new Date(osDate.getTime() + (song_dur*1000));
            lastPlaying = playing;
        }
    }



    if (osDate.getTime() > ytLast.getTime()) {
        ytRefresher();
        ytLast = new Date(osDate.getTime() + 5*1000*60);
    }

    if (dm != lastStreamPoll) {
        updateUpcoming();
        lastStreamPoll = dm;
    }
    
    if (dm != weatherLast && dm % 5 == 3) {
        updateWeather();
        weatherLast = dm;
    }
    
    // set img

    if (osDate.getTime() > bgLastUpdate.getTime() || first) {
        $.get('/bg', function(url) {
            let imgStr = url;
            document.getElementById("bg2").style.backgroundImage = imgStr;
            document.getElementById("container_wallpaper").style.backgroundImage = imgStr;

            bgLastUpdate = new Date(osDate.getTime() + 3*1000*60);
        });
    }

    first = false;
}


//Initialize alarm
for (var i=0, len=alarmList.length; i<len; i++) {
    var hr = alarmList[i].hour;
    var min = alarmList[i].min;
    if (hr < date.getHours() || (hr == date.getHours() && min < date.getMinutes())) {
        idx.push(idx.shift());
    }
}

alarmTime.setHours(alarmList[idx[0]].hour,alarmList[idx[0]].min,0);        
osAlarm = new Date(alarmTime.getTime() - 1000*60);



function showTime(){

    updateDate();
    if (clockOn == 1) {
        /*
        if (osDate.getHours() == osAlarm.getHours() && osDate.getMinutes() == osAlarm.getMinutes()) {   
            checkOddEven();    
            accuTime(1000, 60, checkOddEven, function(){
                showTime();
            })
        } else */
        if (osDate.getHours() == alarmTime.getHours() && osDate.getMinutes() == alarmTime.getMinutes()) {   
            onClock();
            setTimeout(showTime, 1000);
        
        } else {
            setTimeout(showTime, 1000);
        }
    } else {
        setTimeout(showTime, 1000);
    }
    
}

function onClock() {
    document.getElementById("chime").play();
}

updateWeather();
updateUpcoming();
showTime();
