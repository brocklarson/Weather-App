import weatherData from './processData.js';
import updateDOM from './updateDOM.js';
import getLocalStorage from './storage.js';
import events from './pubsub.js';


const form = document.querySelector(`form`);
const search = document.querySelector(`input[type=text]`);
const currentUnits =  `Metric`;

async function updateWeather(searchTerm = `Tokyo`, units = `Metric`){
    try{
        const {currentConditions, fourDayForecast, hourlyForecast} = await weatherData(searchTerm, units);
        updateDOM(currentConditions, fourDayForecast, hourlyForecast, units);
        console.log('hourly', hourlyForecast);
    }catch(err){
        console.log(err);
    }
}

form.addEventListener(`submit`, function(event){
    event.preventDefault();
    const searchTerm = search.value;
    updateWeather(searchTerm);
    events.publish('updateLocalStorage', [`weather-app`, {city: searchTerm, units: currentUnits}]);
});

(function init(){
    if(getLocalStorage(`weather-app`)){
        const lastSearch = getLocalStorage(`weather-app`);
        updateWeather(lastSearch.city, lastSearch.units);
    } else updateWeather();
})();