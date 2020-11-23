//Coin data initialization
var btcTradesData = InitiCoinData('btc');
var ethTradesData = InitiCoinData('eth');
var ltcTradesData = InitiCoinData('ltc');
var xrpTradesData = InitiCoinData('xrp');
var bchTradesData = InitiCoinData('bch');
var gntTradesData = InitiCoinData('gnt');
var batTradesData = InitiCoinData('bat');
var manaTradesData = InitiCoinData('mana');

//Coin visual elements initialization
var btcVisualElements = InitVisualElements('btc');
var ethVisualElements = InitVisualElements('eth');
var ltcVisualElements = InitVisualElements('ltc');
var xrpVisualElements = InitVisualElements('xrp');
var bchVisualElements = InitVisualElements('bch');
var gntVisualElements = InitVisualElements('gnt');
var batVisualElements = InitVisualElements('bat');
var manaVisualElements = InitVisualElements('mana');

var interval = setInterval(function () { TradesPerMinute(); }, 60 * 1000); // 60 * 1000 milsec Every minute check count
var minutesRunning = 0;
var loadDate = new Date();
document.title = 'Bitso Trades ' + str_pad(loadDate.getHours()) + ':' + str_pad(loadDate.getMinutes()) + ':' + str_pad(loadDate.getSeconds());
var runningDay = loadDate.getDay();

var formatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
});

var websocket = new WebSocket('wss://ws.bitso.com');

websocket.onopen = function() {
    websocket.send(JSON.stringify({ action: 'subscribe', book: 'btc_mxn', type: 'trades' }));
    websocket.send(JSON.stringify({ action: 'subscribe', book: 'eth_mxn', type: 'trades' }));
    websocket.send(JSON.stringify({ action: 'subscribe', book: 'xrp_mxn', type: 'trades' }));
    websocket.send(JSON.stringify({ action: 'subscribe', book: 'mana_mxn', type: 'trades' }));
    websocket.send(JSON.stringify({ action: 'subscribe', book: 'ltc_mxn', type: 'trades' }));
    websocket.send(JSON.stringify({ action: 'subscribe', book: 'bch_mxn', type: 'trades' }));
    websocket.send(JSON.stringify({ action: 'subscribe', book: 'gnt_mxn', type: 'trades' }));
    websocket.send(JSON.stringify({ action: 'subscribe', book: 'bat_mxn', type: 'trades' }));
};

websocket.onmessage = function(message){
    var data = JSON.parse(message.data);
    //if (data.type != 'ka')
    //    console.log(data); // Default response, no data

    if (data.type == 'trades' && data.payload) {
        switch(data.book){
            case 'btc_mxn':
                FillTables(data.payload, btcVisualElements, btcTradesData);
            break;
            case 'eth_mxn':
                FillTables(data.payload, ethVisualElements, ethTradesData);
            break;
            case 'xrp_mxn':
                FillTables(data.payload, xrpVisualElements, xrpTradesData);
            break;
            case 'mana_mxn':
                FillTables(data.payload, manaVisualElements, manaTradesData);
            break;
            case 'ltc_mxn':
                FillTables(data.payload, ltcVisualElements, ltcTradesData);
            break;
            case 'bch_mxn':
                FillTables(data.payload, bchVisualElements, bchTradesData);
            break;
            case 'gnt_mxn':
                FillTables(data.payload, gntVisualElements, gntTradesData);
            break;
            case 'bat_mxn':
                FillTables(data.payload, batVisualElements, batTradesData);
            break;
            default:
            break;
        } 
    }
};

function Stadistics(dt, ve){
    dt.promedio = math.mean(dt.arrData);      //Media(promedio)
    dt.min = math.min(dt.arrData);            //Mínimo
    dt.max = math.max(dt.arrData);            //Máximo
    let mediana = math.median(dt.arrData);    //Mediana
    let devstd = math.std(dt.arrData);        //Desviacion Standard 'unbiased' d/n-1 default -> 'uncorrected' d/n  'biased' d/n+1
    let variance = math.variance(dt.arrData); //Varianza

    ve.vPromedio.textContent = formatter.format(dt.promedio);
    ve.vMin.textContent = formatter.format(dt.min);
    ve.vMax.textContent = formatter.format(dt.max);
    ve.vMediana = formatter.format(mediana);
    ve.vDesv.textContent = Number(devstd).toFixed(4);
    ve.vVari.textContent = Number(variance).toFixed(4);
}

function FillTables(payload, ve, dt){
    for (var i in payload) {
        var trade = payload[i];

        if(ve.vTable.rows.length > 9) ve.vTable.deleteRow(9);
        var row = ve.vTable.insertRow(0);
        var cell0 = row.insertCell(0);
        var cell1 = row.insertCell(1);
        var cell2 = row.insertCell(2);
        var cell3 = row.insertCell(3);

        dt.totalTrades++;
        dt.price = trade['r']
        dt.arrData.push(trade['r']);

        if(dt.arrData.length > 512) dt.arrData.pop();

        Stadistics(dt, ve);
        if(trade['t']){
            cell1.className = 'tradeout';
            dt.countUp++;
            ve.vCountUp.textContent = '\u00A0' + dt.countUp + "↑\u00A0";
        } 
        else{
            cell1.className = 'tradein';
            dt.countDown++;
            ve.vCountDo.textContent = '\u00A0' + dt.countDown + "↓\u00A0";
        }

        var date = new Date();
        cell0.className = 'textLeft';
        cell0.textContent = str_pad(date.getHours()) + ':' + str_pad(date.getMinutes()) + ':' + str_pad(date.getSeconds());
        cell1.textContent = formatter.format(trade['r']);
        cell2.textContent = trade['a'];
        cell3.textContent = formatter.format(trade['v']);
    }
}

function TradesPerMinute(){
    minutesRunning++;
    SetLastValues(btcTradesData);
    SetLastValues(ethTradesData);
    SetLastValues(xrpTradesData);
    SetLastValues(ltcTradesData);
    SetLastValues(bchTradesData);
    SetLastValues(gntTradesData);
    SetLastValues(batTradesData);
    SetLastValues(manaTradesData);
}

function SetLastValues(dataCoin){
    dataCoin.minuteTotal = dataCoin.totalTrades - dataCoin.lastCountTotal;
    dataCoin.minuteDown = dataCoin.countDown - dataCoin.lastCountDown;
    dataCoin.minuteUp = dataCoin.countUp - dataCoin.lastCountUp;

    if(dataCoin.minuteUp > 20 && dataCoin.lastPrice > 0){
        console.log("Se mando mensaje a Telegram *ALTA*");
        SendTelegramMessage(dataCoin, ' ↑↑\n');
    }

    if(dataCoin.minuteDown > 20 && dataCoin.lastPrice > 0){
        console.log("Se mando mensaje a Telegram *BAJA*");
        SendTelegramMessage(dataCoin, ' ↓↓\n');
    }

    if(new Date().getDay() != runningDay){
        location.reload();
    }

    dataCoin.lastCountTotal = dataCoin.totalTrades;
    dataCoin.lastCountUp = dataCoin.countUp;
    dataCoin.lastCountDown = dataCoin.countDown;
    dataCoin.lastPrice = dataCoin.price;
}

function SendTelegramMessage(dataObj, estadoString){
    let message = dataObj.name.toUpperCase() + ' %' + Number((dataObj.price * 100 / dataObj.lastPrice) - 100).toFixed(2) + estadoString +
        "[OldPrice: " + formatter.format(dataObj.lastPrice) + "]\n" + 
        "[NewPrice: " + formatter.format(dataObj.price) + "]\n" + 
        "[Promedio: " + formatter.format(dataObj.promedio) + "]\n" + 
        "[Trades: " + dataObj.minuteTotal + "] [TUp: " + dataObj.minuteUp + "] [TDown: " + dataObj.minuteDown + "]\n" +
        "[PMin: " + formatter.format(dataObj.min) + "] [PMax: " + formatter.format(dataObj.max) + "]";

    let telegramBotId = '1234567890:AAE4dRj0093x3lTaf6T5Rb24Td0PwnQxeBk';  //Change this to your BotID this is an example
    let chatId = -123456789; //987654321;  //If chatId is group it starts with - 

    //Next link copy and paste in you browser, you will see your bot data, chat id and updates
    //'https://api.telegram.org/bot' + telegramBotId + '/getUpdates' //Just an example, need you data

    var settings = {
        'async': true,
        'crossDomain': true,
        'url': 'https://api.telegram.org/bot' + telegramBotId + '/sendMessage',
        'method': 'POST',
        'headers': {
            'Content-Type': 'application/json',
            'cache-control': 'no-cache'
        },
        'data': JSON.stringify({
            'chat_id': chatId,
            'text': message
        })
    };

    $.ajax(settings).done(function (response) {
        console.log(response);
    });
}

function InitiCoinData(coinName){
    let newData = {
        name: coinName,
        countUp: 0,
        countDown: 0,
        totalTrades: 0,
        lastCountUp: 0,
        lastCountDown: 0,
        lastCountTotal: 0,
        minuteUp: 0,
        minuteDown: 0,
        minuteTotal: 0,
        price: 0,
        lastPrice: 0,
        min: 0,
        max: 0,
        promedio: 0,
        arrData: new Array()
    }
    return newData
}

function InitVisualElements(name){
    let newVisualElements = {
        name: name,
        vTable: document.getElementById(name + "Table").tBodies[0],
        vPromedio: document.getElementById(name + "Promedio"), 
        vMediana: document.getElementById(name + "Mediana"), 
        vMax: document.getElementById(name + "Max"),
        vMin: document.getElementById(name + "Min"),
        vDesv: document.getElementById(name + "Des"), 
        vVari: document.getElementById(name + "Var"),
        vCountUp: document.getElementById(name + "Up"),
        vCountDo: document.getElementById(name + "Down")
    }
    return newVisualElements;
}

function str_pad(n) {
    return String("00" + n).slice(-2);
}