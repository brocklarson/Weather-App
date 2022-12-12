import weatherData from './processData.js';

async function updateWeather(){
    const {currentConditions, fourDayForecast, hourlyForecast} = await weatherData(); //Send in searchTerm and units here
    console.log('current', currentConditions);
    console.log('threeDay', fourDayForecast);
    console.log('hourly', hourlyForecast);
}
updateWeather().catch(err => {
    console.log(err);
});