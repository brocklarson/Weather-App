const determineConditionIcon = (condition) => {
    if(condition.toLowerCase() === `clear`) return `sunny`;
    else if(condition.toLowerCase() === `clouds`) return `cloudy`;
    else if(condition.toLowerCase() === `rain`) return `rainy`;
    else if(condition.toLowerCase() === `snow`) return `cloudy_snowing`;
    else if(condition.toLowerCase() === `drizzle`) return `rainy`;
    else if(condition.toLowerCase() === `thunderstorm`) return `thunderstorm`;
    else return `foggy`;
}

const currentWeatherOverview = (currentWeather, units) => {
    const currentCondition = document.querySelector(`.current-condition`);
    const currentTemp = document.querySelector(`.current-temp`);
    const city = document.querySelector(`.city`);
    const country = document.querySelector(`.country`);
    const icon = document.querySelector(`.condition-icon`);
    const mainUnits = document.querySelector(`.main-units`);
    const secondaryUnits = document.querySelector(`.secondary-units`);

    function updateData(){
        currentCondition.innerText = currentWeather.condition;
        currentTemp.innerText = Math.round(currentWeather.temp);
        city.innerText = currentWeather.city + ` `;
        country.innerText = currentWeather.country;
        icon.innerText = determineConditionIcon(currentWeather.condition);
    }

    function setUnits(){
        if(units === `Metric`){
            mainUnits.innerText = `\u00B0C`;
            secondaryUnits.innerText = `\u00B0F`;
        }else{
            mainUnits.innerText = `\u00B0F`;
            secondaryUnits.innerText = `\u00B0C`;
        }
    }

    function toggleUnits(){
        setUnits();
        //Need to update values for temp and wind speed here too
    }

    (function init(){
        updateData();
        setUnits();
    })();

    secondaryUnits.addEventListener(`click`, toggleUnits);
}

const currentWeatherDetails = (currentWeather, units) => {
    const tempMax = document.querySelector(`.temp-min-max`);
    const feelsLike = document.querySelector(`.feels-like`);
    const tempUnits = document.querySelectorAll(`.temp-units`);
    const humidity = document.querySelector(`.humidity`);
    const windSpeed = document.querySelector(`.wind-speed`);
    const windUnits = document.querySelector(`.wind-units`);

    tempMax.innerText = `${Math.round(currentWeather.temp_min)}/${Math.round(currentWeather.temp_max)}`;
    feelsLike.innerText = Math.round(currentWeather.feels_like);
    humidity.innerText = currentWeather.humidity + `%`;

    if(units === `Metric`){
        windSpeed.innerText = Math.round(currentWeather.wind_speed * 3.6);
        windUnits.innerText = ` kmh`;
        tempUnits.forEach(el => el.innerText = `\u00B0C`);
    }else{
        windSpeed.innerText = Math.round(currentWeather.wind_speed);
        windUnits.innerText = ` mph`;
        tempUnits.forEach(el => el.innerText = `\u00B0F`);
    }
    
}

const updateFourDayForecast = (fourDayForecast, units) => {
    const container = document.querySelector(`.four-day-forecast`);

    function createCards(dayOfWeek, maxTemp, minTemp, condition, units){
        const card = document.createElement(`div`);
        card.classList.add('fourDayCard-container');

        const day = document.createElement(`p`);
        day.classList.add(`fourDayCard-day`);
        day.innerText = dayOfWeek;

        const maxSpan = document.createElement(`span`);
        maxSpan.classList.add(`fourDayCard-max`);
        const max = document.createElement(`span`);
        max.innerText = Math.round(maxTemp);

        const minSpan = document.createElement(`span`);
        minSpan.classList.add(`fourDayCard-min`);
        const min = document.createElement(`span`);
        min.innerText = Math.round(minTemp);

        const cond = document.createElement(`span`);
        cond.classList.add(`fourDayCard-condition`, `material-symbols-outlined`);
        cond.innerText = determineConditionIcon(condition);

        const unitsSpan = document.createElement(`span`);
        if(units === `Metric`) unitsSpan.innerText = `\u00B0C`;
        else unitsSpan.innerText = `\u00B0F`;

        container.appendChild(card);
        card.appendChild(day);
        card.appendChild(maxSpan);
        maxSpan.appendChild(max);
        maxSpan.appendChild(unitsSpan);
        card.appendChild(minSpan);
        minSpan.appendChild(min);
        minSpan.appendChild(unitsSpan.cloneNode(true));
        card.appendChild(cond);
    }

    function reset() {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }

    (function init(){
        reset();
        fourDayForecast.forEach(day => {
            createCards(day.day, day.temp_max, day.temp_min, day.condition, units);
        });
    })();
}

const updateHourlyForecast = (hourlyForecast, units) => {
    const container = document.querySelector(`.hourly-forecast`);

    function formatTime(timeOfDay){
        if(timeOfDay > 12) return (timeOfDay - 12) + ` pm`;
        else return timeOfDay + ` am`;
    }

    function createCards(timeOfDay, dayOfWeek, temp, condition, units){
        const card = document.createElement(`div`);
        card.classList.add('hourlyCard-container');

        const time = document.createElement(`p`);
        time.classList.add(`hourlyCard-time`);
        time.innerText = formatTime(timeOfDay);

        const day = document.createElement(`p`);
        day.classList.add(`hourlyCard-day`);
        day.innerText = dayOfWeek;  

        const tempSpan = document.createElement(`span`);
        tempSpan.classList.add(`hourlyCard-temp`);
        const min = document.createElement(`span`);
        min.innerText = Math.round(temp);

        const unitsSpan = document.createElement(`span`);
        if(units === `Metric`) unitsSpan.innerText = `\u00B0C`;
        else unitsSpan.innerText = `\u00B0F`;

        const cond = document.createElement(`span`);
        cond.classList.add(`hourlyCard-condition`, `material-symbols-outlined`);
        cond.innerText = determineConditionIcon(condition);

        container.appendChild(card);
        card.appendChild(time);
        card.appendChild(day);
        card.appendChild(tempSpan);
        tempSpan.appendChild(min);
        tempSpan.appendChild(unitsSpan);
        card.appendChild(cond);
    }

    function reset() {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }

    (function init(){
        reset();
        hourlyForecast.forEach(day => {
            createCards(day.time, day.day, day.temp, day.condition, units);
        });
    })();

}

function updateDOM(currentWeather, fourDayForecast, hourlyForecast, units){
    currentWeatherOverview(currentWeather, units);
    currentWeatherDetails(currentWeather, units);
    updateFourDayForecast(fourDayForecast, units);
    updateHourlyForecast(hourlyForecast, units);
}

export default updateDOM;