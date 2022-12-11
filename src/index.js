import getData from './weather.js';

function getDateTime(timezone, dt = null){
    //converts time given from API to time in the searched city
    if(!dt) dt = new Date().getTime() / 1000;
    const date = new Date((dt + timezone) * 1000);

    const datetime = date.toUTCString();
    const day = date.getUTCDay();
    const hours = date.getUTCHours();
    return {datetime, day, hours};
}

function mostCommonCond(array){
    if(array.length == 0) return null;
    let modeMap = {};
    let maxEl = array[0].weather[0].main, maxCount = 1;
    for(let i = 0; i < array.length; i++){
        let el = array[i].weather[0].main;
        if(modeMap[el] == null) modeMap[el] = 1;
        else modeMap[el]++;  
        if(modeMap[el] > maxCount){
            maxEl = el;
            maxCount = modeMap[el];
        }
    }
    return maxEl;
}

function extractDayWeather(n, currentWeather, forecastWeather, todayWeekday){
    const days = [`Sun`, 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let weekday;
    const day = forecastWeather.list.filter(item => {
        const wd = getDateTime(currentWeather.timezone, item.dt).day;
        if((wd === todayWeekday + n) || (wd === todayWeekday - (7 - n))){
            weekday = wd;
            return true;
        }
    });
    day.sort((a,b) => a.main.temp > b.main.temp ? -1: 1);
    day[0].wd = days[weekday];
    return day;
};

function getCurrentWeather(location, currentWeather, todayFullDate){
    console.log('\n*Current Weather*')
    console.log(`Location:`, location.name + `, ` + location.country);
    console.log(`Time:`, todayFullDate);
    console.log(`Temp:`, currentWeather.main.temp);
    console.log(`Min Temp:`, currentWeather.main.temp_min);
    console.log(`Max Temp:`, currentWeather.main.temp_max);
    console.log(`Feels Like:`, currentWeather.main.feels_like);
    console.log(`Humidity:`, currentWeather.main.humidity);
    console.log(`Condition:`, currentWeather.weather[0].main);
    console.log(`Wind Speed:`, currentWeather.wind.speed);
}

function getForecastWeather(currentWeather, forecastWeather, todayWeekday){
    const day1 = extractDayWeather(1, currentWeather, forecastWeather, todayWeekday);
    const day2 = extractDayWeather(2, currentWeather, forecastWeather, todayWeekday);
    const day3 = extractDayWeather(3, currentWeather, forecastWeather, todayWeekday);
    
    //Convert to day of week
    console.log('\n*3-Day Forecast*')
    console.log(day1[0].wd, `Cond:`, mostCommonCond(day1), '| Max -', day1[0].main.temp, `| Min -`, day1[day1.length - 1].main.temp);
    console.log(day2[0].wd, `Cond:`, mostCommonCond(day2), '| Max -', day2[0].main.temp, `| Min -`, day2[day2.length - 1].main.temp);
    console.log(day3[0].wd, `Cond:`,  mostCommonCond(day3), '| Max -', day3[0].main.temp, `| Min -`, day3[day3.length - 1].main.temp);
    //Better to just switch to most undesirable condition? Snow, Rain, Cloud, Clear ? Look up list of conditions on openweather
}

function getHourlyForecast(currentWeather, forecastWeather){
    console.log('\n*Hourly Forecast*');
    forecastWeather.list.forEach(item =>{
        const dateTime = getDateTime(currentWeather.timezone, item.dt);
        console.log(`Forecast: Day -`, dateTime.day, `| Time -`, dateTime.hours, `| Temp -`, item.main.temp);
    });
}

function processData(location, currentWeather, forecastWeather){
    const date = getDateTime(currentWeather.timezone);
    const todayFullDate = date.datetime;
    const todayWeekday = date.day;

    getCurrentWeather(location, currentWeather, todayFullDate);    
    getForecastWeather(currentWeather, forecastWeather, todayWeekday);
    getHourlyForecast(currentWeather, forecastWeather);   
}

async function init(){
    const data = await getData();
    processData(data.location, data.currentWeather, data.forecastWeather);
}
init();