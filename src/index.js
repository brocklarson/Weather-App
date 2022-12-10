async function getCurrentWeather (location, units){
    try{
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&units=${units}&appid=2909a74a92741182ac952a9d5596b341`;
        const response = await fetch(url, {mode: `cors`});
        const data = await response.json();
        return data;
    }catch(err){
        console.log(err);
    }
};

async function getForecastWeather (location, units){
    try{
        const url = `http://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}&units=${units}&cnt=40&appid=2909a74a92741182ac952a9d5596b341`;
        const response = await fetch(url, {mode: `cors`})
        const data = await response.json();
        return data;
    }catch(err){
        console.log(err);
    }
};

async function convertToLatLon(searchTerm){
    try{
        const url = `http://api.openweathermap.org/geo/1.0/direct?q=${searchTerm}&limit=1&appid=2909a74a92741182ac952a9d5596b341`;
        const response = await fetch(url, {mode: `cors`});
        const data = await response.json();
        return data[0];
    }catch(err){
        console.log(err);
    }
}

function getDateTime(timezone, dt = null){
    //converts time given from API to time in the searched city
    if(!dt) dt = new Date().getTime() / 1000;
    date = new Date((dt + timezone) * 1000);
    const datetime = date.toUTCString();
    const day = date.getUTCDay();
    const hours = date.getUTCHours();
    return {datetime, day, hours};
}

function processData(location, currentWeather, forecastWeather){
    const date = getDateTime(currentWeather.timezone);
    const todayFull = date.datetime;
    const todayDay = date.day;

    /* CURRENT WEATHER */
    console.log('*Current Weather*')
    console.log(`Location:`, location.name + `, ` + location.country);
    console.log(`Time:`, todayFull);
    console.log(`Temp:`, currentWeather.main.temp);
    console.log(`Min Temp:`, currentWeather.main.temp_min);
    console.log(`Max Temp:`, currentWeather.main.temp_max);
    console.log(`Feels Like:`, currentWeather.main.feels_like);
    console.log(`Humidity:`, currentWeather.main.humidity);
    console.log(`Condition:`, currentWeather.weather[0].main);
    console.log(`Wind Speed:`, currentWeather.wind.speed);
    console.log(`Today:`);

    /* HOURLY FORECAST */
    console.log('\n*Hourly Forecast*');
    forecastWeather.list.forEach(item =>{
        const dateTime = getDateTime(currentWeather.timezone, item.dt);
        console.log(`Forecast: Day -`, dateTime.day, `| Time -`, dateTime.hours, `| Temp -`, item.main.temp);
    });


    /* 3-DAY FORECAST */
    /* CLEAN THIS SECTION UP! */
    console.log('\n*3-Day Forecast*')
    function mostCommonCond(array){
        if(array.length == 0) return null;
        var modeMap = {};
        var maxEl = array[0].weather[0].main, maxCount = 1;
        for(var i = 0; i < array.length; i++){
            var el = array[i].weather[0].main;
            if(modeMap[el] == null) modeMap[el] = 1;
            else modeMap[el]++;  
            if(modeMap[el] > maxCount){
                maxEl = el;
                maxCount = modeMap[el];
            }
        }
        return maxEl;
    }

    const day1 = forecastWeather.list.filter(item => (getDateTime(currentWeather.timezone, item.dt).day === todayDay + 1 || getDateTime(currentWeather.timezone, item.dt).day === todayDay - 6));
    day1.sort((a,b) => a.main.temp > b.main.temp ? -1: 1);
    day1.forEach(period => {
        const dateTime = getDateTime(currentWeather.timezone, period.dt);
    }); 

    const day2 = forecastWeather.list.filter(item => (getDateTime(currentWeather.timezone, item.dt).day === todayDay + 2 || getDateTime(currentWeather.timezone, item.dt).day === todayDay - 5));
    day2.sort((a,b) => a.main.temp > b.main.temp ? -1: 1);
    day2.forEach(period => {
        const dateTime = getDateTime(currentWeather.timezone, period.dt);
    });
    const day3 = forecastWeather.list.filter(item => (getDateTime(currentWeather.timezone, item.dt).day === todayDay + 3 || getDateTime(currentWeather.timezone, item.dt).day === todayDay - 4));
    day3.sort((a,b) => a.main.temp > b.main.temp ? -1: 1);
    day3.forEach(period => {
        const dateTime = getDateTime(currentWeather.timezone, period.dt);
    });
    
    //Convert this to day of week
    console.log('Day 1: Cond -', mostCommonCond(day1), '| Max -', day1[0].main.temp, "| Min -", day1[day1.length - 1].main.temp);
    console.log('Day 2: Cond -', mostCommonCond(day2), '| Max -', day2[0].main.temp, "| Min -", day2[day2.length - 1].main.temp);
    console.log('Day 3: Cond -', mostCommonCond(day3), '| Max -', day3[0].main.temp, "| Min -", day3[day3.length - 1].main.temp);
    //Better to just switch to most undesirable condition? Snow, Rain, Cloud, Clear ? Look up list of conditions on openweather

}

async function getData(searchTerm = `Tokyo`, units = `Metric`){
    try{
        const location = await convertToLatLon(searchTerm);
        const currentWeather = await getCurrentWeather(location, units);
        const forecastWeather = await getForecastWeather(location, units);
        processData(location, currentWeather, forecastWeather);
    }catch(err){
        console.log(err);
    }
};

getData();



