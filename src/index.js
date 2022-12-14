import weatherData from './processData.js';
import updateDOM from './updateDOM.js';

async function updateWeather(units){
    units = `Metric`; 
    const {currentConditions, fourDayForecast, hourlyForecast} = await weatherData(`Logan`, `Imperial`); //Send in searchTerm and units here
    updateDOM(currentConditions, fourDayForecast, hourlyForecast, units);
    console.log('current', currentConditions);
    console.log('threeDay', fourDayForecast);
    console.log('hourly', hourlyForecast);
}
updateWeather().catch(err => {
    console.log(err);
});