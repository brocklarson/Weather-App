/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
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




/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguYnVuZGxlLmpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7QUFDQTtBQUNBLDJFQUEyRSxhQUFhLE9BQU8sYUFBYSxTQUFTLE1BQU07QUFDM0gsMkNBQTJDLGFBQWE7QUFDeEQ7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLDJFQUEyRSxhQUFhLE9BQU8sYUFBYSxTQUFTLE1BQU07QUFDM0gsMkNBQTJDLGFBQWE7QUFDeEQ7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHNFQUFzRSxXQUFXO0FBQ2pGLDJDQUEyQyxhQUFhO0FBQ3hEO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7O0FBR0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsa0JBQWtCO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQSIsInNvdXJjZXMiOlsid2VicGFjazovL3dlYXRoZXItYXBwLy4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImFzeW5jIGZ1bmN0aW9uIGdldEN1cnJlbnRXZWF0aGVyIChsb2NhdGlvbiwgdW5pdHMpe1xuICAgIHRyeXtcbiAgICAgICAgY29uc3QgdXJsID0gYGh0dHBzOi8vYXBpLm9wZW53ZWF0aGVybWFwLm9yZy9kYXRhLzIuNS93ZWF0aGVyP2xhdD0ke2xvY2F0aW9uLmxhdH0mbG9uPSR7bG9jYXRpb24ubG9ufSZ1bml0cz0ke3VuaXRzfSZhcHBpZD0yOTA5YTc0YTkyNzQxMTgyYWM5NTJhOWQ1NTk2YjM0MWA7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7bW9kZTogYGNvcnNgfSk7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH1jYXRjaChlcnIpe1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgIH1cbn07XG5cbmFzeW5jIGZ1bmN0aW9uIGdldEZvcmVjYXN0V2VhdGhlciAobG9jYXRpb24sIHVuaXRzKXtcbiAgICB0cnl7XG4gICAgICAgIGNvbnN0IHVybCA9IGBodHRwOi8vYXBpLm9wZW53ZWF0aGVybWFwLm9yZy9kYXRhLzIuNS9mb3JlY2FzdD9sYXQ9JHtsb2NhdGlvbi5sYXR9Jmxvbj0ke2xvY2F0aW9uLmxvbn0mdW5pdHM9JHt1bml0c30mY250PTQwJmFwcGlkPTI5MDlhNzRhOTI3NDExODJhYzk1MmE5ZDU1OTZiMzQxYDtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIHttb2RlOiBgY29yc2B9KVxuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9Y2F0Y2goZXJyKXtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICB9XG59O1xuXG5hc3luYyBmdW5jdGlvbiBjb252ZXJ0VG9MYXRMb24oc2VhcmNoVGVybSl7XG4gICAgdHJ5e1xuICAgICAgICBjb25zdCB1cmwgPSBgaHR0cDovL2FwaS5vcGVud2VhdGhlcm1hcC5vcmcvZ2VvLzEuMC9kaXJlY3Q/cT0ke3NlYXJjaFRlcm19JmxpbWl0PTEmYXBwaWQ9MjkwOWE3NGE5Mjc0MTE4MmFjOTUyYTlkNTU5NmIzNDFgO1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwge21vZGU6IGBjb3JzYH0pO1xuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICByZXR1cm4gZGF0YVswXTtcbiAgICB9Y2F0Y2goZXJyKXtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGdldERhdGVUaW1lKHRpbWV6b25lLCBkdCA9IG51bGwpe1xuICAgIC8vY29udmVydHMgdGltZSBnaXZlbiBmcm9tIEFQSSB0byB0aW1lIGluIHRoZSBzZWFyY2hlZCBjaXR5XG4gICAgaWYoIWR0KSBkdCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpIC8gMTAwMDtcbiAgICBkYXRlID0gbmV3IERhdGUoKGR0ICsgdGltZXpvbmUpICogMTAwMCk7XG4gICAgY29uc3QgZGF0ZXRpbWUgPSBkYXRlLnRvVVRDU3RyaW5nKCk7XG4gICAgY29uc3QgZGF5ID0gZGF0ZS5nZXRVVENEYXkoKTtcbiAgICBjb25zdCBob3VycyA9IGRhdGUuZ2V0VVRDSG91cnMoKTtcbiAgICByZXR1cm4ge2RhdGV0aW1lLCBkYXksIGhvdXJzfTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0RhdGEobG9jYXRpb24sIGN1cnJlbnRXZWF0aGVyLCBmb3JlY2FzdFdlYXRoZXIpe1xuICAgIGNvbnN0IGRhdGUgPSBnZXREYXRlVGltZShjdXJyZW50V2VhdGhlci50aW1lem9uZSk7XG4gICAgY29uc3QgdG9kYXlGdWxsID0gZGF0ZS5kYXRldGltZTtcbiAgICBjb25zdCB0b2RheURheSA9IGRhdGUuZGF5O1xuXG4gICAgLyogQ1VSUkVOVCBXRUFUSEVSICovXG4gICAgY29uc29sZS5sb2coJypDdXJyZW50IFdlYXRoZXIqJylcbiAgICBjb25zb2xlLmxvZyhgTG9jYXRpb246YCwgbG9jYXRpb24ubmFtZSArIGAsIGAgKyBsb2NhdGlvbi5jb3VudHJ5KTtcbiAgICBjb25zb2xlLmxvZyhgVGltZTpgLCB0b2RheUZ1bGwpO1xuICAgIGNvbnNvbGUubG9nKGBUZW1wOmAsIGN1cnJlbnRXZWF0aGVyLm1haW4udGVtcCk7XG4gICAgY29uc29sZS5sb2coYE1pbiBUZW1wOmAsIGN1cnJlbnRXZWF0aGVyLm1haW4udGVtcF9taW4pO1xuICAgIGNvbnNvbGUubG9nKGBNYXggVGVtcDpgLCBjdXJyZW50V2VhdGhlci5tYWluLnRlbXBfbWF4KTtcbiAgICBjb25zb2xlLmxvZyhgRmVlbHMgTGlrZTpgLCBjdXJyZW50V2VhdGhlci5tYWluLmZlZWxzX2xpa2UpO1xuICAgIGNvbnNvbGUubG9nKGBIdW1pZGl0eTpgLCBjdXJyZW50V2VhdGhlci5tYWluLmh1bWlkaXR5KTtcbiAgICBjb25zb2xlLmxvZyhgQ29uZGl0aW9uOmAsIGN1cnJlbnRXZWF0aGVyLndlYXRoZXJbMF0ubWFpbik7XG4gICAgY29uc29sZS5sb2coYFdpbmQgU3BlZWQ6YCwgY3VycmVudFdlYXRoZXIud2luZC5zcGVlZCk7XG4gICAgY29uc29sZS5sb2coYFRvZGF5OmApO1xuXG4gICAgLyogSE9VUkxZIEZPUkVDQVNUICovXG4gICAgY29uc29sZS5sb2coJ1xcbipIb3VybHkgRm9yZWNhc3QqJyk7XG4gICAgZm9yZWNhc3RXZWF0aGVyLmxpc3QuZm9yRWFjaChpdGVtID0+e1xuICAgICAgICBjb25zdCBkYXRlVGltZSA9IGdldERhdGVUaW1lKGN1cnJlbnRXZWF0aGVyLnRpbWV6b25lLCBpdGVtLmR0KTtcbiAgICAgICAgY29uc29sZS5sb2coYEZvcmVjYXN0OiBEYXkgLWAsIGRhdGVUaW1lLmRheSwgYHwgVGltZSAtYCwgZGF0ZVRpbWUuaG91cnMsIGB8IFRlbXAgLWAsIGl0ZW0ubWFpbi50ZW1wKTtcbiAgICB9KTtcblxuXG4gICAgLyogMy1EQVkgRk9SRUNBU1QgKi9cbiAgICAvKiBDTEVBTiBUSElTIFNFQ1RJT04gVVAhICovXG4gICAgY29uc29sZS5sb2coJ1xcbiozLURheSBGb3JlY2FzdConKVxuICAgIGZ1bmN0aW9uIG1vc3RDb21tb25Db25kKGFycmF5KXtcbiAgICAgICAgaWYoYXJyYXkubGVuZ3RoID09IDApIHJldHVybiBudWxsO1xuICAgICAgICB2YXIgbW9kZU1hcCA9IHt9O1xuICAgICAgICB2YXIgbWF4RWwgPSBhcnJheVswXS53ZWF0aGVyWzBdLm1haW4sIG1heENvdW50ID0gMTtcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIHZhciBlbCA9IGFycmF5W2ldLndlYXRoZXJbMF0ubWFpbjtcbiAgICAgICAgICAgIGlmKG1vZGVNYXBbZWxdID09IG51bGwpIG1vZGVNYXBbZWxdID0gMTtcbiAgICAgICAgICAgIGVsc2UgbW9kZU1hcFtlbF0rKzsgIFxuICAgICAgICAgICAgaWYobW9kZU1hcFtlbF0gPiBtYXhDb3VudCl7XG4gICAgICAgICAgICAgICAgbWF4RWwgPSBlbDtcbiAgICAgICAgICAgICAgICBtYXhDb3VudCA9IG1vZGVNYXBbZWxdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXhFbDtcbiAgICB9XG5cbiAgICBjb25zdCBkYXkxID0gZm9yZWNhc3RXZWF0aGVyLmxpc3QuZmlsdGVyKGl0ZW0gPT4gKGdldERhdGVUaW1lKGN1cnJlbnRXZWF0aGVyLnRpbWV6b25lLCBpdGVtLmR0KS5kYXkgPT09IHRvZGF5RGF5ICsgMSB8fCBnZXREYXRlVGltZShjdXJyZW50V2VhdGhlci50aW1lem9uZSwgaXRlbS5kdCkuZGF5ID09PSB0b2RheURheSAtIDYpKTtcbiAgICBkYXkxLnNvcnQoKGEsYikgPT4gYS5tYWluLnRlbXAgPiBiLm1haW4udGVtcCA/IC0xOiAxKTtcbiAgICBkYXkxLmZvckVhY2gocGVyaW9kID0+IHtcbiAgICAgICAgY29uc3QgZGF0ZVRpbWUgPSBnZXREYXRlVGltZShjdXJyZW50V2VhdGhlci50aW1lem9uZSwgcGVyaW9kLmR0KTtcbiAgICB9KTsgXG5cbiAgICBjb25zdCBkYXkyID0gZm9yZWNhc3RXZWF0aGVyLmxpc3QuZmlsdGVyKGl0ZW0gPT4gKGdldERhdGVUaW1lKGN1cnJlbnRXZWF0aGVyLnRpbWV6b25lLCBpdGVtLmR0KS5kYXkgPT09IHRvZGF5RGF5ICsgMiB8fCBnZXREYXRlVGltZShjdXJyZW50V2VhdGhlci50aW1lem9uZSwgaXRlbS5kdCkuZGF5ID09PSB0b2RheURheSAtIDUpKTtcbiAgICBkYXkyLnNvcnQoKGEsYikgPT4gYS5tYWluLnRlbXAgPiBiLm1haW4udGVtcCA/IC0xOiAxKTtcbiAgICBkYXkyLmZvckVhY2gocGVyaW9kID0+IHtcbiAgICAgICAgY29uc3QgZGF0ZVRpbWUgPSBnZXREYXRlVGltZShjdXJyZW50V2VhdGhlci50aW1lem9uZSwgcGVyaW9kLmR0KTtcbiAgICB9KTtcbiAgICBjb25zdCBkYXkzID0gZm9yZWNhc3RXZWF0aGVyLmxpc3QuZmlsdGVyKGl0ZW0gPT4gKGdldERhdGVUaW1lKGN1cnJlbnRXZWF0aGVyLnRpbWV6b25lLCBpdGVtLmR0KS5kYXkgPT09IHRvZGF5RGF5ICsgMyB8fCBnZXREYXRlVGltZShjdXJyZW50V2VhdGhlci50aW1lem9uZSwgaXRlbS5kdCkuZGF5ID09PSB0b2RheURheSAtIDQpKTtcbiAgICBkYXkzLnNvcnQoKGEsYikgPT4gYS5tYWluLnRlbXAgPiBiLm1haW4udGVtcCA/IC0xOiAxKTtcbiAgICBkYXkzLmZvckVhY2gocGVyaW9kID0+IHtcbiAgICAgICAgY29uc3QgZGF0ZVRpbWUgPSBnZXREYXRlVGltZShjdXJyZW50V2VhdGhlci50aW1lem9uZSwgcGVyaW9kLmR0KTtcbiAgICB9KTtcbiAgICBcbiAgICAvL0NvbnZlcnQgdGhpcyB0byBkYXkgb2Ygd2Vla1xuICAgIGNvbnNvbGUubG9nKCdEYXkgMTogQ29uZCAtJywgbW9zdENvbW1vbkNvbmQoZGF5MSksICd8IE1heCAtJywgZGF5MVswXS5tYWluLnRlbXAsIFwifCBNaW4gLVwiLCBkYXkxW2RheTEubGVuZ3RoIC0gMV0ubWFpbi50ZW1wKTtcbiAgICBjb25zb2xlLmxvZygnRGF5IDI6IENvbmQgLScsIG1vc3RDb21tb25Db25kKGRheTIpLCAnfCBNYXggLScsIGRheTJbMF0ubWFpbi50ZW1wLCBcInwgTWluIC1cIiwgZGF5MltkYXkyLmxlbmd0aCAtIDFdLm1haW4udGVtcCk7XG4gICAgY29uc29sZS5sb2coJ0RheSAzOiBDb25kIC0nLCBtb3N0Q29tbW9uQ29uZChkYXkzKSwgJ3wgTWF4IC0nLCBkYXkzWzBdLm1haW4udGVtcCwgXCJ8IE1pbiAtXCIsIGRheTNbZGF5My5sZW5ndGggLSAxXS5tYWluLnRlbXApO1xuICAgIC8vQmV0dGVyIHRvIGp1c3Qgc3dpdGNoIHRvIG1vc3QgdW5kZXNpcmFibGUgY29uZGl0aW9uPyBTbm93LCBSYWluLCBDbG91ZCwgQ2xlYXIgPyBMb29rIHVwIGxpc3Qgb2YgY29uZGl0aW9ucyBvbiBvcGVud2VhdGhlclxuXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldERhdGEoc2VhcmNoVGVybSA9IGBUb2t5b2AsIHVuaXRzID0gYE1ldHJpY2Ape1xuICAgIHRyeXtcbiAgICAgICAgY29uc3QgbG9jYXRpb24gPSBhd2FpdCBjb252ZXJ0VG9MYXRMb24oc2VhcmNoVGVybSk7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRXZWF0aGVyID0gYXdhaXQgZ2V0Q3VycmVudFdlYXRoZXIobG9jYXRpb24sIHVuaXRzKTtcbiAgICAgICAgY29uc3QgZm9yZWNhc3RXZWF0aGVyID0gYXdhaXQgZ2V0Rm9yZWNhc3RXZWF0aGVyKGxvY2F0aW9uLCB1bml0cyk7XG4gICAgICAgIHByb2Nlc3NEYXRhKGxvY2F0aW9uLCBjdXJyZW50V2VhdGhlciwgZm9yZWNhc3RXZWF0aGVyKTtcbiAgICB9Y2F0Y2goZXJyKXtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICB9XG59O1xuXG5nZXREYXRhKCk7XG5cblxuXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=