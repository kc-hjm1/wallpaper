let sarra = require('node-sarra');
let https = require('https');
let xml2js = require('xml2js');
let parser = new xml2js.Parser();
let express = require('express');
const res = require('express/lib/response');
const app = express();
const http = require('http').Server(app);


//var concat = require('concat-stream');

// Weather update daemon
const amqp_queue = "d18_wall_engine";
const api_key = "AIzaSyDaeeAua6sJbrcwgH9uulpdwMrLA3C0RCE";



//Load HTTP module
const hostname = '127.0.0.1';
const port = 9326;

var latestWeatherInfo = null;

const rainCode = ['06','07','08','11','12','13','14','15','16','17','18','19','27','28','36','37','38','39','40','41','42','46','48'];
let isRain = false;
let rise;
let set;
let dRise = null;
let dSet = null;

const numOfPhoto = {
    "rain": 1,
    "day": 1,
    "evening": 1,
    "night": 1
}

const dtPhotoUpdate = new Date(2011, 1, 1);

const youtubeChannels = [""]; //redacted, list of Youtube Channel ID
let upcomingLive = {};




app.set('view engine', 'pug');
app.use(express.static(__dirname + '/views'));

app.get('/', (req, res) => {
    reloadUpcomingLive();
    res.render('index', {});
});


app.get('/bg', (req, res) => {
    let curTimeOfDate = getDayOfTime(new Date());
    res.end(ImgExt(genPhoto(numOfPhoto[curTimeOfDate]), curTimeOfDate));
});

function genPhoto(num) {
    return Math.floor((Math.random() * num) + 1);
}

function getDayOfTime(curTime) {
    if (isRain == true) {
        return "rain";
    }
    let curHour;
    let morningStart, morningEnd;
    let eveningStart, eveningEnd


    if (dRise == null || dSet == null) {
        //fall back, default
        curHour = curTime.getHours();

        
        morningStart = 5;
        morningEnd = 10;

        eveningStart = 14;
        eveningEnd = 22;

    } else {

        curHour = curTime.getTime();

        
        morningStart = new Date(dRise.getTime() - 2*1000*60*60);
        morningEnd = new Date(dRise.getTime() + 2*1000*60*60);
        
        eveningStart = new Date(dSet.getTime() - 2*1000*60*60);
        eveningEnd = new Date(dSet.getTime() + 2*1000*60*60);
        
    }

    
    if ((curHour > morningStart && curHour <= morningEnd) || (curHour > eveningStart && curHour <= eveningEnd)) {
        return "evening";
    } else if (curHour > eveningEnd || curHour <= morningStart) {
        return "night";
    } else {
        return "day";
    }
}

function ImgExt(num, dayOfTime) {
    var src = `url(./assets/${dayOfTime}${num}.jpg)`
    return  src;
 }


app.get('/youtube-live-stream', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(upcomingLive));
});


app.get('/weather-json',(req,res) => {
    res.setHeader('Content-Type', 'application/json');
    //console.log("Serving weather JSON");
    //console.log("latestWeatherInfo");
    res.end(latestWeatherInfo);
});

// function findFirstFromYoutubeList(channels) {
//     let returnJson = null;
//     console.log(channels);
//     for (let channel in channels) {
//         console.log(channel);
//         youtubeJson = reloadYoutubeRss(channel);

//         if (youtubeJson != null) {
//             return youtubeJson;
//         }
//         return null;
//     }
// }

function isSubscribedStreamer(streamer) {
    return youtubeChannels.indexOf(streamer.cid) >= 0;
}

function reloadUpcomingLive() {

    
    youtubeChannels.forEach(channel => {
        upcomingLive[channel] = [];
    });

    try {
            https.get('https://vtuber.hk/data/live-hkv.json', (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                let json = JSON.parse(data);

                let scheduled = json.filter(isSubscribedStreamer);
                //                    .sort((a, b) => a.u - b.u);

                scheduled.forEach((stream) => {
                    var upcomingStream = {
                        channelTitle: stream.cTi,
                        videoId: stream.id,
                        liveDate: stream.u,
                        title: stream.t,
                        status: stream.s
                    }
                    //console.log(stream.cid);
                    upcomingLive[stream.cid].push(upcomingStream);
                });
            })
        }).on('error', err => {
            console.error(err);
        });
        
    } catch (e) {
        console.error(e);
        setTimeout(reloadUpcomingLive, 1000*10);

    }
  


    setTimeout(reloadUpcomingLive, 1000 * 120);
    
}

function reloadWeather(url) {
    const options = {
        headers: { 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36 Edg/101.0.1210.39',
        'Upgrade-Insecure-Requests': '1'
        }
    };

    let data = '';



    https.get(url, (reqResponse) => {
        if (reqResponse.statusCode >= 200 && reqResponse.statusCode < 400) {
            reqResponse.on('data', function(data_) { data += data_.toString(); });
            reqResponse.on('end', function() {
                //console.log('data', data);
                try {

                    parser.parseString(data, function(err, result) {
                        //console.log('FINISHED', err, result);
                        let yyyy = Number(result.siteData.dateTime[0].year[0]);
                        let MM = Number(result.siteData.dateTime[0].month[0]._);
                        let dd = Number(result.siteData.dateTime[0].day[0]._);
    
                        let hh = Number(result.siteData.dateTime[0].hour[0]);
                        let mm = Number(result.siteData.dateTime[0].minute[0]);
                        let dddd = new Date(Date.UTC(yyyy, MM, dd, hh, mm));
    
                        
                        let wIcon = result.siteData.currentConditions[0].iconCode[0]._
                        if (rainCode.indexOf(wIcon) >= 0) {
                            isRain = 1;
                        } else {
                            isRain = 0;
                        }
                
                        rise = result.siteData.riseSet[0].dateTime[1].timeStamp[0];
                        set = result.siteData.riseSet[0].dateTime[3].timeStamp[0];
    
                        try {
                            dRise = new Date(
                                Number(rise.substring(0,4)),
                                Number(rise.substring(4,6))-1,  // Month is zero index
                                Number(rise.substring(6,8)),
                                Number(rise.substring(8,10)),
                                Number(rise.substring(10,12)),
                            );
                
                            dSet = new Date(
                                Number(set.substring(0,4)),
                                Number(set.substring(4,6))-1, // Month is zero index
                                Number(set.substring(6,8)), 
                                Number(set.substring(8,10)),
                                Number(set.substring(10,12))
                            );
                        } catch (e) {
                            dRise = null;
                            dSet = null;
                        }
                
    
                        const options = {
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            timeZone: 'America/Vancouver',
                            timeZoneName: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                            hc: 'h23'
                        };
    
                        ddPushDate = `${dddd.toLocaleDateString('en-US', options)}`;
                        //console.log(ddPushDate);
    
                        latestWeatherInfo = JSON.stringify(result);
                    });
                    
                } catch (e) {
                    console.error(e.message);
                }
                
            });
        }
    });
    //console.log("assign ddPushDate" + ddPushDate);

}

sarra
.listen({amqp_subtopic: "*.WXO-DD.citypage_weather.xml.BC.#", amqp_queue: amqp_queue})
.on("error", err => {
    console.warn(err.message)
})
.on("message", (date, url) => { 
    //console.log(date, url);
    if (url.indexOf("s0000141_e.xml") != -1) {
        console.log(`DDUPDATE ${date} s0000141_e.xml `);
        reloadWeather(url);
        //console.log("ddpush out", ddPushDate);
        //newWeatherInfo.emit('update', ddPushDate);
    }
});



http.listen(port, hostname, () => {
    console.log(`Express server running at http://${hostname}:${port}/`);
})

/*
http.listen(port, "192.168.56.1", () => {
    console.log(`Express server running at http://${hostname}:${port}/`);
})
*/