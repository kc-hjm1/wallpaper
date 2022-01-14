
var alarmTime = new Date();
var osNetwork = 0;
var osAlarm = new Date();
var first = true;
var date = new Date();
var osDate = new Date(date.getTime() + 1000*osNetwork);
var musicChange = new Date();
var playing = "";
var lastPlaying
var clockOn = 0;
var loadBlock = false;
var request = null;
var gcRequest = null;
var gcWeather;

const forecastTime = [4,18,22,23];
const rain = [12,13,14,15,16,17,18,26,29,39,40,41,42];

var block = false;
var weatherLast = -1;

var ytLast = -1;
var fxLast = 0;


/**************************************************************
 * Weather Utility
 */


 var isRain = -1;
 var iWic = 0;

 var weather = null;


function getTemp() {
    var isoTime = osDate.toISOString().slice(0,13);
    gcRequest = new XMLHttpRequest();
    gcRequest.open("GET", `https://api.weather.gc.ca/collections/swob-realtime/items?f=json&msc_id-value=1108395&sortby=obs_date_tm&obs_date_tm=${isoTime}:00:00.000Z`);

    gcRequest.onreadystatechange = function(){
        if(gcRequest.readyState == 4){
            if(gcRequest.status  == 200){
                var gcResponse = gcRequest.responseText;
                gcWeather = JSON.parse(gcResponse);
                var dTemp = gcWeather.features[0].properties.air_temp;
                var sTemp = dTemp.toFixed(1);

                var dHum = gcWeather.features[0].properties.rel_hum;
                
                document.getElementById("temp").innerText = "";
                document.getElementById("temp").innerText = sTemp;
                document.getElementById("relativeHum").innerText = "";
                document.getElementById("relativeHum").innerText = dHum;
                

            }
        }   
    }

    gcRequest.send();
}

function getCondition() {   

    request = new XMLHttpRequest();
    request.open("GET", "http://dataservice.accuweather.com/currentconditions/v1/47173?apikey=x84iiCjXIHmdmaEvyNqdNBFG9bcGSclA&metric=true");

    request.onreadystatechange = function(){
        if(request.readyState == 4){
            if(request.status  == 200){
                var requestReturn = JSON.parse(request.responseText);
                weather = requestReturn[0];
                
                iWic = Number(weather.WeatherIcon);
                var sWic = iWic.toString();

                isRain = weather.HasPrecipitation;

                document.getElementById("weatherIcon").src = "https://developer.accuweather.com/sites/default/files/"+sWic.padStart(2, "0")+"-s.png"
            }
        }
    }
    request.send();

}
    
function getWeather() {
    //Init Weather GET Request

    getTemp();
    getCondition();
}



//var idx = Array(alarmList.length).fill().map((element, index) => index);
var clk = document.getElementById("MyClockDisplay");

function genPhoto(num) {
    return Math.floor((Math.random() * num) + 1);
}


function updateDate() {

    date = new Date();
    osDate = new Date(date.getTime() + 1000*osNetwork);
    var h = osDate.getHours(); // 0 - 23
    var m = osDate.getMinutes(); // 0 - 59
    var s = osDate.getSeconds(); // 0 - 59


    var dh = h;
    var dm = m;
    var ds = s;
    var song_dur = 0;

    var num = 1;

    h = (h < 10) ? "0" + h : h;
    m = (m < 10) ? "0" + m : m;
    s = (s < 10) ? "0" + s : s;

    var myTime = h + ":" + m + ":" + s;
    clk.innerText = "";
    clk.innerText = myTime;

    //Update time-based info

    
    if ((musicChange < osDate && playing != "") || (playing === "" && ds % 4 == 1)) {
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


    if (dm != ytLast && dm % 5 == 0) {
        ytRefresher();
        ytLast = dm;
    }

    if (dh != weatherLast && dm >= 8) {
        getWeather();
        weatherLast = dh;
    }


    if (isRain == true) {
        if ((dm % 5 == 3 && !block) || first) {
            num = genPhoto(17);
            document.getElementById("bg2").style.backgroundImage = `var(--rain${num})`;
            document.getElementById("container_wallpaper").style.backgroundImage = `var(--rain${num})`;
            var list = [1,10,13];
            block = true;
        }
    } else {
        if ((dh >= 6 && dh <= 9) || (dh > 14 && dh <= 21)) {
            if ((dm % 5 == 3 && !block) || first) {
                num = genPhoto(31);
                document.getElementById("bg2").style.backgroundImage = `var(--evening${num})`;
                document.getElementById("container_wallpaper").style.backgroundImage = `var(--evening${num})`;

                block = true;
            }
        }
        if ((dh < 6 || dh > 21)) {
            if ((dm % 5 == 3 && !block) || first) {
                num = genPhoto(25);
                document.getElementById("bg2").style.backgroundImage = `var(--night${num})`;
                document.getElementById("container_wallpaper").style.backgroundImage = `var(--night${num})`;

                block = true;
            }
        }
        if ( (dh > 9 && dh <= 14) ) {
            if ((dm % 5 == 3 && !block) || first) {
                num = genPhoto(30);
                document.getElementById("bg2").style.backgroundImage = `var(--day${num})`;
                document.getElementById("container_wallpaper").style.backgroundImage = `var(--day${num})`;

                block = true;
            }
        }
    }


    first = false;
    if (dm % 5 != 3) block = false;

    
}

var date = new Date();
date = new Date(date.getTime() + 1000*osNetwork);


function showTime(){

    updateDate();
    setTimeout(showTime, 1000);

    /*
    if (clockOn == 1) {
        if (osDate.getHours() == osAlarm.getHours() && osDate.getMinutes() == osAlarm.getMinutes()) {   
            checkOddEven();    
            accuTime(1000, 60, checkOddEven, function(){
                showTime();
            })
        } else if (osDate.getHours() == alarmTime.getHours() && osDate.getMinutes() == alarmTime.getMinutes()) {   
            onClock();
            setTimeout(showTime, 1000);
        
        } else {
            setTimeout(showTime, 1000);
        }
    } else {
        setTimeout(showTime, 1000);
    }
    */
    
}

getWeather();
showTime();