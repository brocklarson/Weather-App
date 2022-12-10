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

function getDateTime(currentWeather){
    const date = new Date();
    const localTime = date.getTime();
    const localOffset = date.getTimezoneOffset() * 60 ;
    const utc = localTime + localOffset;
    var dt = utc + (1000 * currentWeather.timezone);
    const dateTime = new Date(dt).toUTCString();
    return dateTime;
}

function processData(location, currentWeather, forecastWeather){
    //console.log(location, currentWeather, forecastWeather);
    const dateTime = getDateTime(currentWeather);
    console.log('Location:', location.name + ', ' + location.country);
    console.log('Time:', dateTime);
    console.log('Temp:', currentWeather.main.temp);
    console.log('Min Temp:', currentWeather.main.temp_min);
    

    /*LOCATION:
    name
    country

    CURRENT WEATHER:
    main.temp
    main.temp_min
    main.temp_max
    main.feels_like
    main.humidity
    sys.sunrise
    sys.sunset
    weather[0].main.main
    wind.speed

    FORECAST WEATHER:
    - 

    */
}

async function getData(searchTerm = `Tokyo`, units = 'metric'){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguYnVuZGxlLmpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7QUFDQTtBQUNBLDJFQUEyRSxhQUFhLE9BQU8sYUFBYSxTQUFTLE1BQU07QUFDM0gsMkNBQTJDLGFBQWE7QUFDeEQ7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLDJFQUEyRSxhQUFhLE9BQU8sYUFBYSxTQUFTLE1BQU07QUFDM0gsMkNBQTJDLGFBQWE7QUFDeEQ7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHNFQUFzRSxXQUFXO0FBQ2pGLDJDQUEyQyxhQUFhO0FBQ3hEO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQSIsInNvdXJjZXMiOlsid2VicGFjazovL3dlYXRoZXItYXBwLy4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImFzeW5jIGZ1bmN0aW9uIGdldEN1cnJlbnRXZWF0aGVyIChsb2NhdGlvbiwgdW5pdHMpe1xuICAgIHRyeXtcbiAgICAgICAgY29uc3QgdXJsID0gYGh0dHBzOi8vYXBpLm9wZW53ZWF0aGVybWFwLm9yZy9kYXRhLzIuNS93ZWF0aGVyP2xhdD0ke2xvY2F0aW9uLmxhdH0mbG9uPSR7bG9jYXRpb24ubG9ufSZ1bml0cz0ke3VuaXRzfSZhcHBpZD0yOTA5YTc0YTkyNzQxMTgyYWM5NTJhOWQ1NTk2YjM0MWA7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7bW9kZTogYGNvcnNgfSk7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH1jYXRjaChlcnIpe1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgIH1cbn07XG5cbmFzeW5jIGZ1bmN0aW9uIGdldEZvcmVjYXN0V2VhdGhlciAobG9jYXRpb24sIHVuaXRzKXtcbiAgICB0cnl7XG4gICAgICAgIGNvbnN0IHVybCA9IGBodHRwOi8vYXBpLm9wZW53ZWF0aGVybWFwLm9yZy9kYXRhLzIuNS9mb3JlY2FzdD9sYXQ9JHtsb2NhdGlvbi5sYXR9Jmxvbj0ke2xvY2F0aW9uLmxvbn0mdW5pdHM9JHt1bml0c30mY250PTQwJmFwcGlkPTI5MDlhNzRhOTI3NDExODJhYzk1MmE5ZDU1OTZiMzQxYDtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIHttb2RlOiBgY29yc2B9KVxuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9Y2F0Y2goZXJyKXtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICB9XG59O1xuXG5hc3luYyBmdW5jdGlvbiBjb252ZXJ0VG9MYXRMb24oc2VhcmNoVGVybSl7XG4gICAgdHJ5e1xuICAgICAgICBjb25zdCB1cmwgPSBgaHR0cDovL2FwaS5vcGVud2VhdGhlcm1hcC5vcmcvZ2VvLzEuMC9kaXJlY3Q/cT0ke3NlYXJjaFRlcm19JmxpbWl0PTEmYXBwaWQ9MjkwOWE3NGE5Mjc0MTE4MmFjOTUyYTlkNTU5NmIzNDFgO1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwge21vZGU6IGBjb3JzYH0pO1xuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICByZXR1cm4gZGF0YVswXTtcbiAgICB9Y2F0Y2goZXJyKXtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGdldERhdGVUaW1lKGN1cnJlbnRXZWF0aGVyKXtcbiAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoKTtcbiAgICBjb25zdCBsb2NhbFRpbWUgPSBkYXRlLmdldFRpbWUoKTtcbiAgICBjb25zdCBsb2NhbE9mZnNldCA9IGRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKSAqIDYwIDtcbiAgICBjb25zdCB1dGMgPSBsb2NhbFRpbWUgKyBsb2NhbE9mZnNldDtcbiAgICB2YXIgZHQgPSB1dGMgKyAoMTAwMCAqIGN1cnJlbnRXZWF0aGVyLnRpbWV6b25lKTtcbiAgICBjb25zdCBkYXRlVGltZSA9IG5ldyBEYXRlKGR0KS50b1VUQ1N0cmluZygpO1xuICAgIHJldHVybiBkYXRlVGltZTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0RhdGEobG9jYXRpb24sIGN1cnJlbnRXZWF0aGVyLCBmb3JlY2FzdFdlYXRoZXIpe1xuICAgIC8vY29uc29sZS5sb2cobG9jYXRpb24sIGN1cnJlbnRXZWF0aGVyLCBmb3JlY2FzdFdlYXRoZXIpO1xuICAgIGNvbnN0IGRhdGVUaW1lID0gZ2V0RGF0ZVRpbWUoY3VycmVudFdlYXRoZXIpO1xuICAgIGNvbnNvbGUubG9nKCdMb2NhdGlvbjonLCBsb2NhdGlvbi5uYW1lICsgJywgJyArIGxvY2F0aW9uLmNvdW50cnkpO1xuICAgIGNvbnNvbGUubG9nKCdUaW1lOicsIGRhdGVUaW1lKTtcbiAgICBjb25zb2xlLmxvZygnVGVtcDonLCBjdXJyZW50V2VhdGhlci5tYWluLnRlbXApO1xuICAgIGNvbnNvbGUubG9nKCdNaW4gVGVtcDonLCBjdXJyZW50V2VhdGhlci5tYWluLnRlbXBfbWluKTtcbiAgICBcblxuICAgIC8qTE9DQVRJT046XG4gICAgbmFtZVxuICAgIGNvdW50cnlcblxuICAgIENVUlJFTlQgV0VBVEhFUjpcbiAgICBtYWluLnRlbXBcbiAgICBtYWluLnRlbXBfbWluXG4gICAgbWFpbi50ZW1wX21heFxuICAgIG1haW4uZmVlbHNfbGlrZVxuICAgIG1haW4uaHVtaWRpdHlcbiAgICBzeXMuc3VucmlzZVxuICAgIHN5cy5zdW5zZXRcbiAgICB3ZWF0aGVyWzBdLm1haW4ubWFpblxuICAgIHdpbmQuc3BlZWRcblxuICAgIEZPUkVDQVNUIFdFQVRIRVI6XG4gICAgLSBcblxuICAgICovXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldERhdGEoc2VhcmNoVGVybSA9IGBUb2t5b2AsIHVuaXRzID0gJ21ldHJpYycpe1xuICAgIHRyeXtcbiAgICAgICAgY29uc3QgbG9jYXRpb24gPSBhd2FpdCBjb252ZXJ0VG9MYXRMb24oc2VhcmNoVGVybSk7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRXZWF0aGVyID0gYXdhaXQgZ2V0Q3VycmVudFdlYXRoZXIobG9jYXRpb24sIHVuaXRzKTtcbiAgICAgICAgY29uc3QgZm9yZWNhc3RXZWF0aGVyID0gYXdhaXQgZ2V0Rm9yZWNhc3RXZWF0aGVyKGxvY2F0aW9uLCB1bml0cyk7XG4gICAgICAgIHByb2Nlc3NEYXRhKGxvY2F0aW9uLCBjdXJyZW50V2VhdGhlciwgZm9yZWNhc3RXZWF0aGVyKTtcbiAgICB9Y2F0Y2goZXJyKXtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICB9XG59O1xuXG5nZXREYXRhKCk7XG5cblxuXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=