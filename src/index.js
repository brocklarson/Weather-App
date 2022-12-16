import weatherData from './processData.js';
import updateDOM from './updateDOM.js';
import getLocalStorage from './storage.js';
import events from './pubsub.js';


const form = document.querySelector(`form`);
const search = document.querySelector(`input[type=text]`);
const unitsSelector = document.querySelector(`.secondary-units`);
const forecastSelector = document.querySelector(`.forecast-selector`);

async function updateWeather(searchTerm = `Tokyo`, units = `Metric`){
    try{
        const {currentConditions, fourDayForecast, hourlyForecast} = await weatherData(searchTerm, units);
        updateDOM(currentConditions, fourDayForecast, hourlyForecast, units);
        events.publish('updateLocalStorage', [`weather-app`, {city: searchTerm, units: units}]);
    }catch(err){
        console.log(err);
    }
}

form.addEventListener(`submit`, function(event){
    event.preventDefault();
    const searchTerm = search.value;
    updateWeather(searchTerm);
});

unitsSelector.addEventListener(`click`, function(){
    const lastSearch = getLocalStorage(`weather-app`);
    let units;
    if(lastSearch.units === `Metric`) units = `Imperial`;
    else units = `Metric`;
    updateWeather(lastSearch.city, units);
});

forecastSelector.addEventListener(`click`, function(){
    const fourDayForecast = document.querySelector(`.four-day-forecast`);
    const hourlyForecast = document.querySelector(`.hourly-forecast`);
    const daily = document.querySelector(`#daily`);
    const hourly = document.querySelector(`#hourly`);

    fourDayForecast.classList.toggle(`hide`);
    hourlyForecast.classList.toggle(`hide`);
    daily.classList.toggle('hide');
    hourly.classList.toggle('hide');
});

(function init(){
    if(getLocalStorage(`weather-app`)){
        const lastSearch = getLocalStorage(`weather-app`);
        updateWeather(lastSearch.city, lastSearch.units);
    } else updateWeather();
})();