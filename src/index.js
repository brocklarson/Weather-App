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
    const weekday = [`Sun`,`Mon`,`Tue`,`Wed`,`Thu`,`Fri`,`Sat`];
    const day = weekday[date.getUTCDay()];
    const hours = date.getUTCHours();
    return {datetime, day, hours};
}

function processData(location, currentWeather, forecastWeather){
    console.log(`Location:`, location.name + `, ` + location.country);
    console.log(`Time:`, getDateTime(currentWeather.timezone).datetime);
    console.log(`Temp:`, currentWeather.main.temp);
    console.log(`Min Temp:`, currentWeather.main.temp_min);
    console.log(`Max Temp:`, currentWeather.main.temp_max);
    console.log(`Feels Like:`, currentWeather.main.feels_like);
    console.log(`Humidity:`, currentWeather.main.humidity);
    console.log(`Condition:`, currentWeather.weather[0].main);
    console.log(`Wind Speed:`, currentWeather.wind.speed);
    console.log(`Today:`);
    console.log(forecastWeather);
    forecastWeather.list.forEach(item =>{
        //item.main.temp
        //item.main.temp_max
        //item.main.temp_min
        const dateTime = getDateTime(currentWeather.timezone, item.dt)
        console.log(`Forecast: Day -`, dateTime.day, `Time -`, dateTime.hours, `Temp -`, item.main.temp, `Max -`, item.main.temp_max, `Min -`, item.main.temp_min);
    });

}

async function getData(searchTerm = `Tokyo`, units = `metric`){
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



