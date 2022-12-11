/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/weather.js":
/*!************************!*\
  !*** ./src/weather.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
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

async function getData(searchTerm = `Tokyo`, units = `Metric`){
    try{
        const location = await convertToLatLon(searchTerm);
        const currentWeather = await getCurrentWeather(location, units);
        const forecastWeather = await getForecastWeather(location, units);
        return {location, currentWeather, forecastWeather};
    }catch(err){
        console.log(err);
    }
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (getData);

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _weather_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./weather.js */ "./src/weather.js");


function getDateTime(timezone, dt = null){
    //converts time given from API to time in the searched city
    if(!dt) dt = new Date().getTime() / 1000;
    const date = new Date((dt + timezone) * 1000);

    const datetime = date.toUTCString();
    const day = date.getUTCDay();
    const hours = date.getUTCHours();
    return {datetime, day, hours};
}

function getCurrentWeather(location, currentWeather, todayFullDate){
    console.log('\n*Current Weather*')
    console.log(`Location:`, location.name + `, ` + location.country);
    console.log(`Time:`, todayFullDate);
    console.log(`Temp:`, currentWeather.main.temp);
    console.log(`Min Temp:`, currentWeather.main.temp_min);
    console.log(`Max Temp:`, currentWeather.main.temp_max);
    console.log(`Feels Like:`, currentWeather.main.feels_like);
    console.log(`Humidity:`, currentWeather.main.humidity);
    console.log(`Condition:`, currentWeather.weather[0].main);
    console.log(`Wind Speed:`, currentWeather.wind.speed);
}

function getForecastWeather(currentWeather, forecastWeather, todayWeekday){
    function mostCommonCond(array){
        if(array.length == 0) return null;
        let modeMap = {};
        let maxEl = array[0].weather[0].main, maxCount = 1;
        for(let i = 0; i < array.length; i++){
            let el = array[i].weather[0].main;
            if(modeMap[el] == null) modeMap[el] = 1;
            else modeMap[el]++;  
            if(modeMap[el] > maxCount){
                maxEl = el;
                maxCount = modeMap[el];
            }
        }
        return maxEl;
    };

    function extractDayWeather(n){
        const days = [`Sun`, 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        let weekday;
        const day = forecastWeather.list.filter(item => {
            const wd = getDateTime(currentWeather.timezone, item.dt).day;
            if((wd === todayWeekday + n) || (wd === todayWeekday - (7 - n))){
                weekday = wd;
                return true;
            }
        });
        day.sort((a,b) => a.main.temp > b.main.temp ? -1: 1);
        day[0].weekday = days[weekday];
        return day;
    };

    const day1 = extractDayWeather(1);
    const day2 = extractDayWeather(2);
    const day3 = extractDayWeather(3);
    
    //Convert to day of week
    console.log('\n*3-Day Forecast*')
    console.log('Day 1: Cond -', mostCommonCond(day1), '| Max -', day1[0].main.temp, `| Min -`, day1[day1.length - 1].main.temp);
    console.log('Day 2: Cond -', mostCommonCond(day2), '| Max -', day2[0].main.temp, `| Min -`, day2[day2.length - 1].main.temp);
    console.log('Day 3: Cond -', mostCommonCond(day3), '| Max -', day3[0].main.temp, `| Min -`, day3[day3.length - 1].main.temp);
    //Better to just switch to most undesirable condition? Snow, Rain, Cloud, Clear ? Look up list of conditions on openweather
}

function getHourlyForecast(currentWeather, forecastWeather){
    console.log('\n*Hourly Forecast*');
    forecastWeather.list.forEach(item =>{
        const dateTime = getDateTime(currentWeather.timezone, item.dt);
        console.log(`Forecast: Day -`, dateTime.day, `| Time -`, dateTime.hours, `| Temp -`, item.main.temp);
    });
}

function processData(location, currentWeather, forecastWeather){
    const date = getDateTime(currentWeather.timezone);
    const todayFullDate = date.datetime;
    const todayWeekday = date.day;

    getCurrentWeather(location, currentWeather, todayFullDate);    
    getForecastWeather(currentWeather, forecastWeather, todayWeekday);
    getHourlyForecast(currentWeather, forecastWeather);   
}

async function init(){
    const data = await (0,_weather_js__WEBPACK_IMPORTED_MODULE_0__["default"])();
    processData(data.location, data.currentWeather, data.forecastWeather);
}
init();
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguYnVuZGxlLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBLDJFQUEyRSxhQUFhLE9BQU8sYUFBYSxTQUFTLE1BQU07QUFDM0gsMkNBQTJDLGFBQWE7QUFDeEQ7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLDJFQUEyRSxhQUFhLE9BQU8sYUFBYSxTQUFTLE1BQU07QUFDM0gsMkNBQTJDLGFBQWE7QUFDeEQ7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHNFQUFzRSxXQUFXO0FBQ2pGLDJDQUEyQyxhQUFhO0FBQ3hEO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0I7QUFDaEIsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQSxpRUFBZSxPQUFPOzs7Ozs7VUM1Q3RCO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7Ozs7Ozs7Ozs7QUNObUM7O0FBRW5DO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1QixrQkFBa0I7QUFDekM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHVCQUF1Qix1REFBTztBQUM5QjtBQUNBO0FBQ0EsTyIsInNvdXJjZXMiOlsid2VicGFjazovL3dlYXRoZXItYXBwLy4vc3JjL3dlYXRoZXIuanMiLCJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL3dlYXRoZXItYXBwL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly93ZWF0aGVyLWFwcC8uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJhc3luYyBmdW5jdGlvbiBnZXRDdXJyZW50V2VhdGhlciAobG9jYXRpb24sIHVuaXRzKXtcbiAgICB0cnl7XG4gICAgICAgIGNvbnN0IHVybCA9IGBodHRwczovL2FwaS5vcGVud2VhdGhlcm1hcC5vcmcvZGF0YS8yLjUvd2VhdGhlcj9sYXQ9JHtsb2NhdGlvbi5sYXR9Jmxvbj0ke2xvY2F0aW9uLmxvbn0mdW5pdHM9JHt1bml0c30mYXBwaWQ9MjkwOWE3NGE5Mjc0MTE4MmFjOTUyYTlkNTU5NmIzNDFgO1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwge21vZGU6IGBjb3JzYH0pO1xuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9Y2F0Y2goZXJyKXtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICB9XG59O1xuXG5hc3luYyBmdW5jdGlvbiBnZXRGb3JlY2FzdFdlYXRoZXIgKGxvY2F0aW9uLCB1bml0cyl7XG4gICAgdHJ5e1xuICAgICAgICBjb25zdCB1cmwgPSBgaHR0cDovL2FwaS5vcGVud2VhdGhlcm1hcC5vcmcvZGF0YS8yLjUvZm9yZWNhc3Q/bGF0PSR7bG9jYXRpb24ubGF0fSZsb249JHtsb2NhdGlvbi5sb259JnVuaXRzPSR7dW5pdHN9JmNudD00MCZhcHBpZD0yOTA5YTc0YTkyNzQxMTgyYWM5NTJhOWQ1NTk2YjM0MWA7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7bW9kZTogYGNvcnNgfSlcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfWNhdGNoKGVycil7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgfVxufTtcblxuYXN5bmMgZnVuY3Rpb24gY29udmVydFRvTGF0TG9uKHNlYXJjaFRlcm0pe1xuICAgIHRyeXtcbiAgICAgICAgY29uc3QgdXJsID0gYGh0dHA6Ly9hcGkub3BlbndlYXRoZXJtYXAub3JnL2dlby8xLjAvZGlyZWN0P3E9JHtzZWFyY2hUZXJtfSZsaW1pdD0xJmFwcGlkPTI5MDlhNzRhOTI3NDExODJhYzk1MmE5ZDU1OTZiMzQxYDtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIHttb2RlOiBgY29yc2B9KTtcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgcmV0dXJuIGRhdGFbMF07XG4gICAgfWNhdGNoKGVycil7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBnZXREYXRhKHNlYXJjaFRlcm0gPSBgVG9reW9gLCB1bml0cyA9IGBNZXRyaWNgKXtcbiAgICB0cnl7XG4gICAgICAgIGNvbnN0IGxvY2F0aW9uID0gYXdhaXQgY29udmVydFRvTGF0TG9uKHNlYXJjaFRlcm0pO1xuICAgICAgICBjb25zdCBjdXJyZW50V2VhdGhlciA9IGF3YWl0IGdldEN1cnJlbnRXZWF0aGVyKGxvY2F0aW9uLCB1bml0cyk7XG4gICAgICAgIGNvbnN0IGZvcmVjYXN0V2VhdGhlciA9IGF3YWl0IGdldEZvcmVjYXN0V2VhdGhlcihsb2NhdGlvbiwgdW5pdHMpO1xuICAgICAgICByZXR1cm4ge2xvY2F0aW9uLCBjdXJyZW50V2VhdGhlciwgZm9yZWNhc3RXZWF0aGVyfTtcbiAgICB9Y2F0Y2goZXJyKXtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBnZXREYXRhOyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IGdldERhdGEgZnJvbSAnLi93ZWF0aGVyLmpzJztcblxuZnVuY3Rpb24gZ2V0RGF0ZVRpbWUodGltZXpvbmUsIGR0ID0gbnVsbCl7XG4gICAgLy9jb252ZXJ0cyB0aW1lIGdpdmVuIGZyb20gQVBJIHRvIHRpbWUgaW4gdGhlIHNlYXJjaGVkIGNpdHlcbiAgICBpZighZHQpIGR0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCkgLyAxMDAwO1xuICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSgoZHQgKyB0aW1lem9uZSkgKiAxMDAwKTtcblxuICAgIGNvbnN0IGRhdGV0aW1lID0gZGF0ZS50b1VUQ1N0cmluZygpO1xuICAgIGNvbnN0IGRheSA9IGRhdGUuZ2V0VVRDRGF5KCk7XG4gICAgY29uc3QgaG91cnMgPSBkYXRlLmdldFVUQ0hvdXJzKCk7XG4gICAgcmV0dXJuIHtkYXRldGltZSwgZGF5LCBob3Vyc307XG59XG5cbmZ1bmN0aW9uIGdldEN1cnJlbnRXZWF0aGVyKGxvY2F0aW9uLCBjdXJyZW50V2VhdGhlciwgdG9kYXlGdWxsRGF0ZSl7XG4gICAgY29uc29sZS5sb2coJ1xcbipDdXJyZW50IFdlYXRoZXIqJylcbiAgICBjb25zb2xlLmxvZyhgTG9jYXRpb246YCwgbG9jYXRpb24ubmFtZSArIGAsIGAgKyBsb2NhdGlvbi5jb3VudHJ5KTtcbiAgICBjb25zb2xlLmxvZyhgVGltZTpgLCB0b2RheUZ1bGxEYXRlKTtcbiAgICBjb25zb2xlLmxvZyhgVGVtcDpgLCBjdXJyZW50V2VhdGhlci5tYWluLnRlbXApO1xuICAgIGNvbnNvbGUubG9nKGBNaW4gVGVtcDpgLCBjdXJyZW50V2VhdGhlci5tYWluLnRlbXBfbWluKTtcbiAgICBjb25zb2xlLmxvZyhgTWF4IFRlbXA6YCwgY3VycmVudFdlYXRoZXIubWFpbi50ZW1wX21heCk7XG4gICAgY29uc29sZS5sb2coYEZlZWxzIExpa2U6YCwgY3VycmVudFdlYXRoZXIubWFpbi5mZWVsc19saWtlKTtcbiAgICBjb25zb2xlLmxvZyhgSHVtaWRpdHk6YCwgY3VycmVudFdlYXRoZXIubWFpbi5odW1pZGl0eSk7XG4gICAgY29uc29sZS5sb2coYENvbmRpdGlvbjpgLCBjdXJyZW50V2VhdGhlci53ZWF0aGVyWzBdLm1haW4pO1xuICAgIGNvbnNvbGUubG9nKGBXaW5kIFNwZWVkOmAsIGN1cnJlbnRXZWF0aGVyLndpbmQuc3BlZWQpO1xufVxuXG5mdW5jdGlvbiBnZXRGb3JlY2FzdFdlYXRoZXIoY3VycmVudFdlYXRoZXIsIGZvcmVjYXN0V2VhdGhlciwgdG9kYXlXZWVrZGF5KXtcbiAgICBmdW5jdGlvbiBtb3N0Q29tbW9uQ29uZChhcnJheSl7XG4gICAgICAgIGlmKGFycmF5Lmxlbmd0aCA9PSAwKSByZXR1cm4gbnVsbDtcbiAgICAgICAgbGV0IG1vZGVNYXAgPSB7fTtcbiAgICAgICAgbGV0IG1heEVsID0gYXJyYXlbMF0ud2VhdGhlclswXS5tYWluLCBtYXhDb3VudCA9IDE7XG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICBsZXQgZWwgPSBhcnJheVtpXS53ZWF0aGVyWzBdLm1haW47XG4gICAgICAgICAgICBpZihtb2RlTWFwW2VsXSA9PSBudWxsKSBtb2RlTWFwW2VsXSA9IDE7XG4gICAgICAgICAgICBlbHNlIG1vZGVNYXBbZWxdKys7ICBcbiAgICAgICAgICAgIGlmKG1vZGVNYXBbZWxdID4gbWF4Q291bnQpe1xuICAgICAgICAgICAgICAgIG1heEVsID0gZWw7XG4gICAgICAgICAgICAgICAgbWF4Q291bnQgPSBtb2RlTWFwW2VsXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWF4RWw7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGV4dHJhY3REYXlXZWF0aGVyKG4pe1xuICAgICAgICBjb25zdCBkYXlzID0gW2BTdW5gLCAnTW9uJywgJ1R1ZScsICdXZWQnLCAnVGh1JywgJ0ZyaScsICdTYXQnXTtcbiAgICAgICAgbGV0IHdlZWtkYXk7XG4gICAgICAgIGNvbnN0IGRheSA9IGZvcmVjYXN0V2VhdGhlci5saXN0LmZpbHRlcihpdGVtID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHdkID0gZ2V0RGF0ZVRpbWUoY3VycmVudFdlYXRoZXIudGltZXpvbmUsIGl0ZW0uZHQpLmRheTtcbiAgICAgICAgICAgIGlmKCh3ZCA9PT0gdG9kYXlXZWVrZGF5ICsgbikgfHwgKHdkID09PSB0b2RheVdlZWtkYXkgLSAoNyAtIG4pKSl7XG4gICAgICAgICAgICAgICAgd2Vla2RheSA9IHdkO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgZGF5LnNvcnQoKGEsYikgPT4gYS5tYWluLnRlbXAgPiBiLm1haW4udGVtcCA/IC0xOiAxKTtcbiAgICAgICAgZGF5WzBdLndlZWtkYXkgPSBkYXlzW3dlZWtkYXldO1xuICAgICAgICByZXR1cm4gZGF5O1xuICAgIH07XG5cbiAgICBjb25zdCBkYXkxID0gZXh0cmFjdERheVdlYXRoZXIoMSk7XG4gICAgY29uc3QgZGF5MiA9IGV4dHJhY3REYXlXZWF0aGVyKDIpO1xuICAgIGNvbnN0IGRheTMgPSBleHRyYWN0RGF5V2VhdGhlcigzKTtcbiAgICBcbiAgICAvL0NvbnZlcnQgdG8gZGF5IG9mIHdlZWtcbiAgICBjb25zb2xlLmxvZygnXFxuKjMtRGF5IEZvcmVjYXN0KicpXG4gICAgY29uc29sZS5sb2coJ0RheSAxOiBDb25kIC0nLCBtb3N0Q29tbW9uQ29uZChkYXkxKSwgJ3wgTWF4IC0nLCBkYXkxWzBdLm1haW4udGVtcCwgYHwgTWluIC1gLCBkYXkxW2RheTEubGVuZ3RoIC0gMV0ubWFpbi50ZW1wKTtcbiAgICBjb25zb2xlLmxvZygnRGF5IDI6IENvbmQgLScsIG1vc3RDb21tb25Db25kKGRheTIpLCAnfCBNYXggLScsIGRheTJbMF0ubWFpbi50ZW1wLCBgfCBNaW4gLWAsIGRheTJbZGF5Mi5sZW5ndGggLSAxXS5tYWluLnRlbXApO1xuICAgIGNvbnNvbGUubG9nKCdEYXkgMzogQ29uZCAtJywgbW9zdENvbW1vbkNvbmQoZGF5MyksICd8IE1heCAtJywgZGF5M1swXS5tYWluLnRlbXAsIGB8IE1pbiAtYCwgZGF5M1tkYXkzLmxlbmd0aCAtIDFdLm1haW4udGVtcCk7XG4gICAgLy9CZXR0ZXIgdG8ganVzdCBzd2l0Y2ggdG8gbW9zdCB1bmRlc2lyYWJsZSBjb25kaXRpb24/IFNub3csIFJhaW4sIENsb3VkLCBDbGVhciA/IExvb2sgdXAgbGlzdCBvZiBjb25kaXRpb25zIG9uIG9wZW53ZWF0aGVyXG59XG5cbmZ1bmN0aW9uIGdldEhvdXJseUZvcmVjYXN0KGN1cnJlbnRXZWF0aGVyLCBmb3JlY2FzdFdlYXRoZXIpe1xuICAgIGNvbnNvbGUubG9nKCdcXG4qSG91cmx5IEZvcmVjYXN0KicpO1xuICAgIGZvcmVjYXN0V2VhdGhlci5saXN0LmZvckVhY2goaXRlbSA9PntcbiAgICAgICAgY29uc3QgZGF0ZVRpbWUgPSBnZXREYXRlVGltZShjdXJyZW50V2VhdGhlci50aW1lem9uZSwgaXRlbS5kdCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBGb3JlY2FzdDogRGF5IC1gLCBkYXRlVGltZS5kYXksIGB8IFRpbWUgLWAsIGRhdGVUaW1lLmhvdXJzLCBgfCBUZW1wIC1gLCBpdGVtLm1haW4udGVtcCk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NEYXRhKGxvY2F0aW9uLCBjdXJyZW50V2VhdGhlciwgZm9yZWNhc3RXZWF0aGVyKXtcbiAgICBjb25zdCBkYXRlID0gZ2V0RGF0ZVRpbWUoY3VycmVudFdlYXRoZXIudGltZXpvbmUpO1xuICAgIGNvbnN0IHRvZGF5RnVsbERhdGUgPSBkYXRlLmRhdGV0aW1lO1xuICAgIGNvbnN0IHRvZGF5V2Vla2RheSA9IGRhdGUuZGF5O1xuXG4gICAgZ2V0Q3VycmVudFdlYXRoZXIobG9jYXRpb24sIGN1cnJlbnRXZWF0aGVyLCB0b2RheUZ1bGxEYXRlKTsgICAgXG4gICAgZ2V0Rm9yZWNhc3RXZWF0aGVyKGN1cnJlbnRXZWF0aGVyLCBmb3JlY2FzdFdlYXRoZXIsIHRvZGF5V2Vla2RheSk7XG4gICAgZ2V0SG91cmx5Rm9yZWNhc3QoY3VycmVudFdlYXRoZXIsIGZvcmVjYXN0V2VhdGhlcik7ICAgXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGluaXQoKXtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgZ2V0RGF0YSgpO1xuICAgIHByb2Nlc3NEYXRhKGRhdGEubG9jYXRpb24sIGRhdGEuY3VycmVudFdlYXRoZXIsIGRhdGEuZm9yZWNhc3RXZWF0aGVyKTtcbn1cbmluaXQoKTsiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=