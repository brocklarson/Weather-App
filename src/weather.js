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

async function getData(searchTerm, units){
    try{
        const location = await convertToLatLon(searchTerm);
        const currentWeather = await getCurrentWeather(location, units);
        const forecastWeather = await getForecastWeather(location, units);
        return {location, currentWeather, forecastWeather};
    }catch(err){
        console.log(err);
    }
};

export default getData;