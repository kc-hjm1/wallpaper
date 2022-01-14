var jsTickers = JSON.parse(tickers);

var price;
var pch;

function writeStockQuote(i, key, value) {
  $.getJSON("https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol="+key+"&apikey=RLT7FWNIG32QIKEE",null,(data,status,xhr)=>{
    if (data != null) {
      price = parseFloat(data["Global Quote"]["05. price"]);
      pch = parseFloat(data["Global Quote"]["09. change"]);
      $(".company")[i].innerText = value;
      $(".ticker")[i].innerText = key;
      $(".price")[i].innerText = price;
      $(".change")[i].innerText = pch;

      if (pch > 0) {
        $(".change")[i].style.color = 'var(--gain)';
      } else if (pch < 0) {
        $(".change")[i].style.color = 'var(--loss)';
      } else {
        $(".change")[i].style.color = 'var(--unch)';
      }
    } else {
      price = null;
      pch = null;
      $(".price")[i].innerText = "NUL";
      $(".change")[i].innerText = "NUL";
      $(".change")[i].style.color = 'var(--unch)';
    }
  })
}

function stockQuote() {
  var i = 0;
  $.each(jsTickers.stock, function(key, value){
    writeStockQuote(i, key, value);
    i++;
  });
}

function writeFxQuote(i, key, value) {
  $.getJSON("https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency="+value+"&to_currency="+key+"&apikey=RLT7FWNIG32QIKEE",null,(data,status,xhr)=>{
    $(".curTo")[i].innerText = key;
    $(".curFrom")[i].innerText = value;
    $(".buy")[i].innerText = parseFloat(data["Realtime Currency Exchange Rate"]["8. Bid Price"]);
    $(".sell")[i].innerText = parseFloat(data["Realtime Currency Exchange Rate"]["9. Ask Price"]);
  })
}

function fxQuote() {
  var i = 0;
  $.each(jsTickers.currency, function(key, value){
    writeFxQuote(i, key, value);
    i++;
  });
}