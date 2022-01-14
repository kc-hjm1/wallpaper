var audioCtx = null;
var g2000 = null;
var g3000 = null;
var g = null;
var merger = null;
var longSiren = false;


function createSirenEffect() {

    audioCtx = new AudioContext();
    g2000 = audioCtx.createGain();
    g2000.gain.value = 0;
    g2000.gain.linearRampToValueAtTime(0.125,audioCtx.currentTime + 0.03);

    g3000 = audioCtx.createGain();
    g3000.gain.value = 0;
    g3000.gain.linearRampToValueAtTime(0.125,audioCtx.currentTime + 0.03);

    g = audioCtx.createGain();
    
    //g.gain.value = 1;

    merger = audioCtx.createChannelMerger(2);


    var o2000 = audioCtx.createOscillator();
    o2000.type = 'sine';
    o2000.frequency.setValueAtTime(1950, audioCtx.currentTime); //value in hertz
        
    o2000.connect(g2000);


    var o3000 = audioCtx.createOscillator();
    o3000.type = 'sine';
    o3000.frequency.setValueAtTime(2950, audioCtx.currentTime); //value in hertz
    o3000.connect(g3000);

    g2000.connect(merger, 0, 0);
    g2000.connect(merger, 0, 1);
    g3000.connect(merger, 0, 0);
    g3000.connect(merger, 0, 1);
    
    merger.connect(g);
    g.connect(audioCtx.destination);
    

    o2000.start(0);
    o3000.start(0);
    if (longSiren) {
        setTimeout(muteSiren, 75000);
    } else {
        setTimeout(muteSiren, 632);
    }


}

function playSiren(timeUp) {
    longSiren = timeUp;
    createSirenEffect();
}

function muteSiren() {
    g.gain.setValueAtTime(0, audioCtx.currentTime + 0.04);    
}

