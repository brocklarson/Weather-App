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
        //search for last used units
        const {currentConditions, fourDayForecast, hourlyForecast} = await weatherData(searchTerm, units);
        updateDOM(currentConditions, fourDayForecast, hourlyForecast, units);
        events.publish('updateLocalStorage', [`weather-app`, {city: searchTerm, units: units}]);
    }catch(err){
        console.log(err);
        window.alert(`Could not find city.\nYour search must be in the form of "City", "City, State", or "City, Country".`)
    }
}

//Fires when a new city is searched
form.addEventListener(`submit`, function(event){
    event.preventDefault();
    const searchTerm = search.value;
    let units = `Metric`;
    if(getLocalStorage(`weather-app`)) units = getLocalStorage(`weather-app`).units;
    updateWeather(searchTerm, units);
});

//Fires when clicking the C or F to change units
unitsSelector.addEventListener(`click`, function(){
    const lastSearch = getLocalStorage(`weather-app`);
    let units;
    if(lastSearch.units === `Metric`) units = `Imperial`;
    else units = `Metric`;
    updateWeather(lastSearch.city, units);
});

//Fires when clicking 'Daily' or 'Hourly' to change the forecast view
forecastSelector.addEventListener(`click`, function(){
    document.querySelector(`.four-day-forecast`).classList.toggle(`hide`);
    document.querySelector(`.hourly-forecast`).classList.toggle(`hide`);
    document.querySelector(`#daily`).classList.toggle(`hide`);
    document.querySelector(`#hourly`).classList.toggle(`hide`);
});

(function init(){
    if(getLocalStorage(`weather-app`)){
        const lastSearch = getLocalStorage(`weather-app`);
        updateWeather(lastSearch.city, lastSearch.units);
    } else updateWeather();
})();