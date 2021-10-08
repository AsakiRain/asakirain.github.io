const rootEle = document.documentElement; // <html>
const LSThemeKey = 'user-color-scheme'; // 作为 localStorage 的 key

function addClass(obj, cls){
    let obj_class = obj.className;//获取 class 内容.
    let blank = (obj_class != '') ? ' ' : '';//判断获取到的 class 是否为空, 如果不为空在前面加个'空格'.
    obj.className = obj_class + blank + cls;//组合原来的 class 和需要添加的 class并替换原来的 class.
}
function removeClass(obj, cls){
    let obj_class = ' '+obj.className+' ';//获取 class 内容, 并在首尾各加一个空格. ex) 'abc    bcd' -> ' abc    bcd '
    obj_class = obj_class.replace(/(\s+)/gi, ' ');//将多余的空字符替换成一个空格. ex) ' abc    bcd ' -> ' abc bcd '
    let removed = obj_class.replace(' '+cls+' ', ' ');//在原来的 class 替换掉首尾加了空格的 class. ex) ' abc bcd ' -> 'bcd '
    removed = removed.replace(/(^\s+)|(\s+$)/g, '');//去掉首尾空格. ex) 'bcd ' -> 'bcd'
    obj.className = removed;//替换原来的 class.
}
function hasClass(obj, cls){
    let obj_class = obj.className;//获取 class 内容.
    let obj_class_lst = obj_class.split(/\s+/);//通过split空字符将cls转换成数组.
    let x = 0;
    for(x in obj_class_lst) {
        if(obj_class_lst[x] == cls) {//循环数组, 判断是否包含cls
            return true;
        }
    }
    return false;
}

const setLS = (k, v) => {
    try {
        localStorage.setItem(k, v);
    } catch (e) { }
}
const removeLS = (k) => {
    try {
        localStorage.removeItem(k);
    } catch (e) { }
}
const getLS = (k) => {
    try {
        return localStorage.getItem(k);
    } catch (e) {
        return null // 与 localStorage 中没有找到对应 key 的行为一致
    }
}

function applyTheme(preferredTheme){
    removeClass(rootEle,"light");
    removeClass(rootEle,"dark");
    addClass(rootEle,preferredTheme);
    setLS(LSThemeKey,preferredTheme);
}
let preferredTheme = getLS(LSThemeKey) || "light"
applyTheme(preferredTheme)

document.onreadystatechange = function () {//模拟$(document).ready()
    if (document.readyState === "interactive") {
        init();
    }
}

function geoSrv(){
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position){
            LONGITUDE = position.coords.longitude; //十进制经度
            LATITUDE = position.coords.latitude; //十进制纬度
            Promise.all([getData("https://geoapi.qweather.com/v2/city/lookup",`${LONGITUDE},${LATITUDE}`)])
                .then(function (results) {
                    LOCATION = results[0]['location'][0]['id'];
                    document.getElementById("area").innerHTML = results[0]['location'][0]['name'];
                    refresh()
                    return;
                })
        },function (err){
            console.log(err.code + "：" + err.message)
            alert("定位失败或位置服务被禁用，将显示杭州市的天气！");
            LONGITUDE = 120.15358;
            LATITUDE = 30.28745;//杭州的经纬度
            LOCATION = 101210101;
            refresh()
        })
    }
    else {
        alert("您的浏览器不支持geolocation，将显示杭州市的天气！");
        LONGITUDE = 120.15358;
        LATITUDE = 30.28745;
        LOCATION = 101210101;
        refresh()
    }
}
function init(){
    let foreHoursHtml = "";
    for (let i = 0;i < 24;i++){
        foreHoursHtml += `<div class="foreHoursEach ${(i % 2 == 0)?"foreHoursEachDark":"foreHoursEachLight"}">
                                <div class="foreHoursTime">00:00</div>
                                <div class="qicon foreHoursQicon qi-unknown-fill"></div>
                                <div class="foreHoursTemp">24℃</div>
                            </div>`;
    }
    let foreDaysHtml = "";
    for (let i = 0;i < 7;i++){
        foreDaysHtml += `<div class="foreDaysEach ${(i % 2 == 0)?"foreDaysEachDark":"foreDaysEachLight"}">
                                <div class="foreDaysDate">日期</div>
                                <div class="qicon foreDaysQicon qi-unknown-fill"></div>
                                <div class="foreDaysWeather">天气</div>
                            </div>`;
    }
    let foreDaysData = {
        "foreDaysHtml": foreDaysHtml,
        "dates": ["00-00","00-00","00-00","00-00","00-00","00-00","00-00"],
        "maxTemps": [0,0,0,0,0,0,0],
        "minTemps": [0,0,0,0,0,0,0],
    }
    var airChartOption = {
    series: [
        {
            type: 'gauge',
            min: 0,
            max: 500,
            itemStyle: {
                color: '#90EE90',
            },
            progress: {
                show: true,
                roundCap: true,
                width: 9
            },
            pointer: {
                show: false,
            },
            axisLine: {
                roundCap: true,
                lineStyle: {
                    width: 9
                }
            },
            axisTick: {
                show: false,
            },
            splitLine: {
                show: false,
            },
            axisLabel: {
                show: false,
            },
            title: {
                show: true,
                offsetCenter: [0, '40%'],
            },
            detail: {
                offsetCenter: [0, '-10%'],
            },
            data: [
                {
                    value: 0,
                    name: "未知",
                }
            ]
        }
    ]
};
    airChart = echarts.init(document.getElementById('airChart'),null,{renderer : 'svg' });
    airChartOption && airChart.setOption(airChartOption);
    let pollutionChartOption = {
        angleAxis: {
            show: false,
            max: 100
        },
        radiusAxis: {
            show: true,
            type: 'category',
            data: ['PM2.5:', 'PM10:', 'O₃:', 'CO:','SO₂:','NO₂:'],
            axisLabel:{
                interval: 0
            },
            axisTick: {
                show: false,
            },
            splitLine:{
                show: false,
            },
        },
        polar: {},
        series: [{
            type: 'bar',
            data: [0,0,0,0,0,0],
            colorBy: 'data',
            roundCap: true,
            label: {
                show:true,
                // 试试改成 'insideStart'
                position: 'insideStart',
                formatter: '{c}'
            },
            coordinateSystem: 'polar'
        }]
    };
    pollutionChart = echarts.init(document.getElementById('pollutionChart'),null,{renderer : 'svg' });
    pollutionChartOption && pollutionChart.setOption(pollutionChartOption);
    let foreDaysOption = {
        yAxis: [
            {
                type: 'value',
                scale:true,
                splitLine:{
                    show: true,
                },
                axisLabel:{
                    formatter: '{value}℃',
                }
            }
        ],
        xAxis: [
            {
                type: 'category',
                data: ["00-00","00-00","00-00","00-00","00-00","00-00","00-00"],
                axisLabel:{
                    interval: 0
                },
                axisTick: {
                    show: false,
                },
                splitLine:{
                    show: false,
                },
            }
        ],
        series: [
            {
                name: '最高气温',
                type: 'line',
                data: [0,0,0,0,0,0,0],
                smooth: true,
                label: {
                    show: true,
                    formatter: '{c}℃',
                }
            },
            {
                name: 'MinTemp',
                type: 'line',
                data: [0,0,0,0,0,0,0],
                smooth: true,
                label: {
                    show: true,
                    formatter: '{c}℃',
                }
            },
        ]
    };
    foreDaysChart = echarts.init(document.getElementById('foreDaysChart'),null,{renderer : 'svg' });
    foreDaysOption && foreDaysChart.setOption(foreDaysOption);

    updateForeHours(foreHoursHtml);
    updateForeDays(foreDaysData);

    if (preferredTheme === "light"){lightCharts()};
    if (preferredTheme === "dark"){darkCharts()};

    document.getElementById("updateTime").onclick=function (){ //onclick不是一个函数，是方法，这里运行即使函数
        refresh();
    }
    document.getElementById("themeSwitcher").onclick = function() {
        if (hasClass(rootEle,"dark")){
            applyTheme("light");
            lightCharts();
        }
        else {
            applyTheme("dark");
            darkCharts();
        }
    }
    geoSrv();
}
function darkCharts(){
    let textColor = "#E0E0E0";
    let lineColor = "#454545";
    let borderColor = "#000000";
    let borderWidth = 1;
    airChart.setOption({
        series: [{
            axisLine: {
                lineStyle: {
                    color: [
                        [1, lineColor],
                    ]
                }
            },
            title: {
                color: textColor,
                textBorderColor: borderColor,
                textBorderWidth: borderWidth,
            },
            detail: {
                color: textColor,
                textBorderColor: borderColor,
                textBorderWidth: borderWidth,
            }
        }]

    });
    pollutionChart.setOption({
        radiusAxis: {
            axisLabel:{
                color: textColor,
                textBorderColor: borderColor,
                textBorderWidth: borderWidth,
            },
        },
        series: [{
            label: {
                color: textColor,
                textBorderColor: borderColor,
                textBorderWidth: borderWidth,
            }
        }]
    });
    foreDaysChart.setOption({
        yAxis: [
            {
                splitLine:{
                    lineStyle: {
                        color: [lineColor],
                    }
                },
                axisLabel:{
                    textStyle: {
                        color: textColor,
                        textBorderColor: borderColor,
                        textBorderWidth: borderWidth,
                    }
                }
            }
        ],
        xAxis: [
            {
                axisLabel:{
                    textStyle: {
                        color: textColor,
                        textBorderColor: borderColor,
                        textBorderWidth: borderWidth,
                    }
                }
            }
        ],
        series: [
            {
                label: {
                    color: textColor,
                    textBorderColor: borderColor,
                    textBorderWidth: borderWidth,
                }
            },
            {
                label: {
                    color: textColor,
                    textBorderColor: borderColor,
                    textBorderWidth: borderWidth,
                }
            },
        ]
    })
}
function lightCharts(){
    let textColor = "#464646";
    let lineColor = "#E0E6F1";
    let borderColor = "#FFFFFF";
    let borderWidth = 1;
    airChart.setOption({
        series: [{
            axisLine: {
                lineStyle: {
                    color: [
                        [1, lineColor],
                    ]
                }
            },
            title: {
                color: textColor,
                textBorderColor: borderColor,
                textBorderWidth: borderWidth,
            },
            detail: {
                color: textColor,
                textBorderColor: borderColor,
                textBorderWidth: borderWidth,
            }
        }]

    });
    pollutionChart.setOption({
        radiusAxis: {
            axisLabel:{
                color: textColor,
                textBorderColor: borderColor,
                textBorderWidth: borderWidth,
            },
        },
        series: [{
            label: {
                color: textColor,
                textBorderColor: borderColor,
                textBorderWidth: borderWidth,
            }
        }]
    });
    foreDaysChart.setOption({
        yAxis: [
            {
                splitLine:{
                    lineStyle: {
                        color: [lineColor],
                    }
                },
                axisLabel:{
                    textStyle: {
                        color: textColor,
                        textBorderColor: borderColor,
                        textBorderWidth: borderWidth,
                    }
                }
            }
        ],
        xAxis: [
            {
                axisLabel:{
                    textStyle: {
                        color: textColor,
                        textBorderColor: borderColor,
                        textBorderWidth: borderWidth,
                    }
                }
            }
        ],
        series: [
            {
                label: {
                    color: textColor,
                    textBorderColor: borderColor,
                    textBorderWidth: borderWidth,
                }
            },
            {
                label: {
                    color: textColor,
                    textBorderColor: borderColor,
                    textBorderWidth: borderWidth,
                }
            },
        ]
    })
}
function setAMap(longitude,latitude){
    var layer = new AMap.TileLayer({
        zooms:[3,20],    //可见级别
        visible:true,    //是否可见
        opacity:1,       //透明度
        zIndex: 1,         //叠加层级
    })
    var map = new AMap.Map('amapContainer',{
        layers:[layer],//当只想显示标准图层时layers属性可缺省
        center: [longitude,latitude],
    });
}
async function refresh(){
    document.getElementById("updateTime").innerHTML = "获取数据...";
    setAMap(LONGITUDE,LATITUDE);
    Promise.all([
                getData("https://devapi.qweather.com/v7/weather/now",LOCATION),
                getData("https://devapi.qweather.com/v7/weather/24h",LOCATION),
                getData("https://devapi.qweather.com/v7/weather/7d",LOCATION),
                getData("https://devapi.qweather.com/v7/air/now",LOCATION)
            ]).then(function (results) {
                        parseData(results);
                    });
}
function getData(url,location) {
    return axios.get(url, {
            params: {
                location : location,
                key: 'f4adf1c2b510497e92ce1a5b6acccb1d'
            },
        }).then(function (response) {
            let data = JSON.parse(response.request['response']);
            return data;
        }).catch(function (error) {
            console.log(error);
            return false;
        })
}
function parseData(results){
    let data_now = results[0];
    let data_24h = results[1];
    let data_7d = results[2];
    let data_air = results[3];

    let uvIndex = data_7d['daily'][0]['uvIndex'];
    let cardData = {
        "updateTime": data_now['now']['obsTime'].substr(11,5) + "更新",
        "nowWeather": data_now['now']['text'],
        "nowTemp": data_now['now']['temp'] + "°",
        "nowWind": data_now['now']['windDir'] + data_now['now']['windScale'] + "级",
        "nowAir": "空气" + data_air['now']['category'],
        "summary": getSummary({
                "dnWeather": [data_7d['daily'][0]['textDay'],data_7d['daily'][0]['textNight']],
                "dnTemp": [data_7d['daily'][0]['tempMax'],data_7d['daily'][0]['tempMin']],
            }),
        "nowUV": uvIndex>=10?"很强":uvIndex>=7?"强":uvIndex>=5?"中等":uvIndex>=3?"弱":"最弱",
        "nowHumidity": data_now['now']['humidity'] + "%",
        "nowPressure" : data_now['now']['pressure'] + "hPa",
    }
    let foreHoursHtml = "";
    for (let i = 0;i < Object.keys(data_24h['hourly']).length;i++){
        foreHoursHtml += `<div class="foreHoursEach ${(i % 2 == 0)?"foreHoursEachDark":"foreHoursEachLight"}">
                                <div class="foreHoursTime">${data_24h['hourly'][i]['fxTime'].substr(11,5)}</div>
                                <div class="qicon foreHoursQicon qi-${data_24h['hourly'][i]['icon']}"></div>
                                <div class="foreHoursTemp">${data_24h['hourly'][i]['text']}</div>
                            </div>`;
    }
    let foreDaysHtml = "";
    let dates = [];
    let maxTemps = [];
    let minTemps = [];
    for (let i = 0;i < Object.keys(data_7d['daily']).length;i++){
        foreDaysHtml += `<div class="foreDaysEach ${(i % 2 == 0)?"foreDaysEachDark":"foreDaysEachLight"}">                   
                                <div class="foreDaysWeek">${i==0?"今天":getWeek(data_7d['daily'][i]['fxDate'])}</div>
                                <div class="foreDaysDate">${data_7d['daily'][i]['fxDate'].substr(5,5)}</div>
                                <div class="qicon foreDaysQicon qi-${data_7d['daily'][i]['iconDay']}"></div>
                                <div class="foreDaysWeather">${data_7d['daily'][i]['textDay']}</div>
                            </div>`;
    }
    for (let i = 0;i < Object.keys(data_7d['daily']).length;i++){
        dates[i] = (i==0?"今天":getWeek(data_7d['daily'][i]['fxDate'])) + "\n" + data_7d['daily'][i]['fxDate'].substr(5,5);
    }
    for (let i = 0;i < Object.keys(data_7d['daily']).length;i++){
        maxTemps[i] = data_7d['daily'][i]['tempMax'];
        minTemps[i] = data_7d['daily'][i]['tempMin'];
    }
    let foreDaysData = {
        "foreDaysHtml": foreDaysHtml,
        "dates": dates,
        "maxTemps": maxTemps,
        "minTemps": minTemps,
    }
    let todayData = {
        "uvIndex": uvIndex>=10?"很强":uvIndex>=7?"强":uvIndex>=5?"中等":uvIndex>=3?"弱":"最弱",
        "feelsLike": data_now['now']['feelsLike'] + "℃",
        "precip": data_7d['daily'][0]['precip'] + "mm",
        "humidity": data_7d['daily'][0]['humidity'] + "%",
        "pressure": data_7d['daily'][0]['pressure'] + "hPa",
        "vis": data_7d['daily'][0]['vis'] + "KM"
    };
    updateCard(cardData);
    updateForeHours(foreHoursHtml);
    updateForeDays(foreDaysData);
    updateAir(data_air);
    updateToday(todayData);

}
function getSummary(data){
    let summary = "";
    if (data['dnWeather'][0] == data['dnWeather'][1]){
        summary += "今天全天" + data['dnWeather'][0] + "，"
    }
    else{
        summary += "今天白天" + data['dnWeather'][0] + "，夜间" + data['dnWeather'][1] + "，"
    }
    summary += "最高温" + data['dnTemp'][0] + "℃，最低温" + data['dnTemp'][1] + "℃。"
    return summary
}
function getWeek(dateString) {
    var dateArray = dateString.split("-");
    date = new Date(dateArray[0], parseInt(dateArray[1] - 1), dateArray[2]);
    return "周" + "日一二三四五六".charAt(date.getDay());
};
function updateCard(cardData){
    document.getElementById("nowTemp").innerHTML = cardData['nowTemp'];
    document.getElementById("nowWeather").innerHTML = cardData['nowWeather'];
    document.getElementById("nowWind").innerHTML = cardData['nowWind'];
    document.getElementById("nowAir").innerHTML = cardData['nowAir'];
    document.getElementById("updateTime").innerHTML = cardData['updateTime'];
    document.getElementById("overviewSummary").innerHTML = cardData['summary'];
    document.getElementById("nowUV").innerHTML = cardData['nowUV'];
    document.getElementById("nowHumidity").innerHTML = cardData['nowHumidity'];
    document.getElementById("nowPressure").innerHTML = cardData['nowPressure'];
}
function updateForeHours(html){
    document.getElementById("foreHoursScroll").innerHTML = html;
}
function updateForeDays(foreDaysData){
    document.getElementById("foreDaysScroll").innerHTML = foreDaysData['foreDaysHtml'];
    //其中a代表legend中的数据，b代表类别，c代表series中的数据
    foreDaysChart.setOption({
        xAxis: [{data: foreDaysData['dates']}],
        series: [
            {
                name: '最高气温',
                data: foreDaysData['maxTemps'],
            },
            {
                name: '最低气温',
                data: foreDaysData['minTemps'],
            },
        ]
    })
}
function updateAir(data_air){
    airChart.setOption({series: [
        {
            data: [
                {
                    value: data_air['now']['aqi'],
                    name: data_air['now']['category'],
                }
                ]
        }]})
    pollutionChart.setOption({series: [{
                    data: [
                        data_air['now']['pm2p5'],
                        data_air['now']['pm10'],
                        data_air['now']['o3'],
                        data_air['now']['co'],
                        data_air['now']['so2'],
                        data_air['now']['no2']
                    ],}]})
}
function updateToday(todayData) {
    document.getElementById("uvIndex").innerHTML = todayData['uvIndex'];
    document.getElementById("feelsLike").innerHTML = todayData['feelsLike'];
    document.getElementById("precip").innerHTML = todayData['precip'];
    document.getElementById("humidity").innerHTML = todayData['humidity'];
    document.getElementById("pressure").innerHTML = todayData['pressure'];
    document.getElementById("vis").innerHTML = todayData['vis'];
}

