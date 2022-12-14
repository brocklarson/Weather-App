const currentWeatherOverview = (currentWeather, units) => {
    const currentCondition = document.querySelector(`.current-condition`);
    const currentTemp = document.querySelector(`.current-temp`);
    const city = document.querySelector(`.city`);
    const country = document.querySelector(`.country`);
    const time = document.querySelector(`.time`);
    const icon = document.querySelector(`.condition-icon`);
    const mainUnits = document.querySelector(`.main-units`);
    const secondaryUnits = document.querySelector(`.secondary-units`);

    currentCondition.innerText = currentWeather.condition;
    currentTemp.innerText = currentWeather.temp;
    city.innerText = currentWeather.city + ` `;
    country.innerText = currentWeather.country;
    time.innerText = currentWeather.time;

    function setUnits(){
        if(units === `Metric`){
            mainUnits.innerText = `\u00B0C`;
            secondaryUnits.innerText = `\u00B0F`;
        }else{
            mainUnits.innerText = `\u00B0F`;
            secondaryUnits.innerText = `\u00B0C`;
        }
    }
    setUnits();

    (function determineIcon(){
        if(currentWeather.condition.toLowerCase() === `clear`) icon.innerText = `sunny`;
        else if(currentWeather.condition.toLowerCase() === `clouds`) icon.innerText = `cloudy`;
        else if(currentWeather.condition.toLowerCase() === `rain`) icon.innerText = `rainy`;
        else if(currentWeather.condition.toLowerCase() === `snow`) icon.innerText = `cloudy_snowing`;
        else if(currentWeather.condition.toLowerCase() === `drizzle`) icon.innerText = `rainy`;
        else if(currentWeather.condition.toLowerCase() === `thunderstorm`) icon.innerText = `thunderstorm`;
        else icon.innerText = `foggy`;
    })();

    function toggleUnits(){
        if(units === `Metric`) units = `Imperial`;
        else units = `Metric`;
        setUnits();
        //Need to update values for temp and wind speed here too
    }

    secondaryUnits.addEventListener(`click`, toggleUnits);
}

const currentWeatherDetails = (currentWeather, units) => {
    const tempMax = document.querySelector(`.temp-max`);
    const tempMin = document.querySelector(`.temp-min`);
    const feelsLike = document.querySelector(`.feels-like`);
    const tempUnits = document.querySelectorAll(`.temp-units`);
    const humidity = document.querySelector(`.humidity`);
    const windSpeed = document.querySelector(`.wind-speed`);
    const windUnits = document.querySelector(`.wind-units`);

    tempMax.innerText = ` ` + currentWeather.temp_max;
    tempMin.innerText = ` ` + currentWeather.temp_min;
    feelsLike.innerText = currentWeather.feels_like;
    humidity.innerText = currentWeather.humidity + ` %`;

    if(units === `Metric`){
        windSpeed.innerText = Math.round(currentWeather.wind_speed * 3.6);
        windUnits.innerText = ` kmh`;
        tempUnits.forEach(el => el.innerText = ` \u00B0C`);
    }else{
        windSpeed.innerText = Math.round(currentWeather.wind_speed);
        windUnits.innerText = ` mph`;
        tempUnits.forEach(el => el.innerText = ` \u00B0F`);
    }
    
}

function updateDOM(currentWeather, fourDayForecast, hourlyForecast, units){
    currentWeatherOverview(currentWeather, units);
    currentWeatherDetails(currentWeather, units);
    return;
}

export default updateDOM;