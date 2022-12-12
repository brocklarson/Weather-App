/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/processData.js":
/*!****************************!*\
  !*** ./src/processData.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
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

function mostCommonCond(array){
    //Goes through each hour and find most common weather condition for the day
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
    };
    return maxEl;
}

function getDayOfWeek(){
    return [`Sun`, 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
}

function extractDayWeather(n, currentWeather, forecastWeather, todayWeekday){
    let weekday;
    const day = forecastWeather.list.filter(item => {
        const wd = getDateTime(currentWeather.timezone, item.dt).day;
        if((wd === todayWeekday + n) || (wd === todayWeekday - (7 - n))){
            weekday = wd;
            return true;
        }
    });
    day.sort((a,b) => a.main.temp > b.main.temp ? -1: 1);
    day[0].wd = getDayOfWeek()[weekday];
    return day;
};

function getCurrentWeather(location, currentWeather, todayFullDate){
    return {
        city: location.name,
        country: location.country,
        time: todayFullDate,
        temp: currentWeather.main.temp,
        temp_min: currentWeather.main.temp_min,
        temp_max: currentWeather.main.temp_max,
        feels_like: currentWeather.main.feels_like,
        humidity: currentWeather.main.humidity,
        condition: currentWeather.weather[0].main,
        wind_speed: currentWeather.wind.speed
    };
}

function getFourDayForecast(currentWeather, forecastWeather, todayWeekday){
    let fourDayForecast = [];
    for(let i = 1; i <= 4; i++){
        const day = extractDayWeather(i, currentWeather, forecastWeather, todayWeekday);
        fourDayForecast.push(
            {
                day: day[0].wd,
                condition: mostCommonCond(day),
                temp_max: day[0].main.temp,
                temp_min: day[day.length - 1].main.temp
            }
        );
    };
    return fourDayForecast;
}

function getHourlyForecast(currentWeather, forecastWeather){
    let hourlyForecast = [];
    forecastWeather.list.forEach(item =>{
        const dateTime = getDateTime(currentWeather.timezone, item.dt);
        hourlyForecast.push(
            {
                day: getDayOfWeek()[dateTime.day],
                time: dateTime.hours,
                temp: item.main.temp
            }
        )
    });
    return hourlyForecast;
}

function processData(location, currentWeather, forecastWeather){
    const date = getDateTime(currentWeather.timezone);
    const todayFullDate = date.datetime;
    const todayWeekday = date.day;

    const currentConditions = getCurrentWeather(location, currentWeather, todayFullDate);    
    const fourDayForecast = getFourDayForecast(currentWeather, forecastWeather, todayWeekday);
    const hourlyForecast = getHourlyForecast(currentWeather, forecastWeather); 
    return {currentConditions, fourDayForecast, hourlyForecast};  
}

async function weatherData(searchTerm = `Tokyo`, units = `Metric`){
    try{
        const data = await (0,_weather_js__WEBPACK_IMPORTED_MODULE_0__["default"])(searchTerm, units); 
        return processData(data.location, data.currentWeather, data.forecastWeather);
    }catch(err){
        console.log(err);
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (weatherData);

/***/ }),

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

async function getData(searchTerm, units){
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
/* harmony import */ var _processData_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./processData.js */ "./src/processData.js");


async function updateWeather(){
    const {currentConditions, fourDayForecast, hourlyForecast} = await (0,_processData_js__WEBPACK_IMPORTED_MODULE_0__["default"])(); //Send in searchTerm and units here
    console.log('current', currentConditions);
    console.log('threeDay', fourDayForecast);
    console.log('hourly', hourlyForecast);
}
updateWeather().catch(err => {
    console.log(err);
});
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguYnVuZGxlLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFtQzs7QUFFbkM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsa0JBQWtCO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLG1CQUFtQixRQUFRO0FBQzNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaOztBQUVBO0FBQ0E7QUFDQSwyQkFBMkIsdURBQU87QUFDbEM7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBLGlFQUFlLFdBQVc7Ozs7Ozs7Ozs7Ozs7O0FDbEgxQjtBQUNBO0FBQ0EsMkVBQTJFLGFBQWEsT0FBTyxhQUFhLFNBQVMsTUFBTTtBQUMzSCwyQ0FBMkMsYUFBYTtBQUN4RDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsMkVBQTJFLGFBQWEsT0FBTyxhQUFhLFNBQVMsTUFBTTtBQUMzSCwyQ0FBMkMsYUFBYTtBQUN4RDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esc0VBQXNFLFdBQVc7QUFDakYsMkNBQTJDLGFBQWE7QUFDeEQ7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQjtBQUNoQixLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBLGlFQUFlLE9BQU87Ozs7OztVQzVDdEI7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7Ozs7Ozs7OztBQ04yQzs7QUFFM0M7QUFDQSxXQUFXLG9EQUFvRCxRQUFRLDJEQUFXLElBQUk7QUFDdEY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQyxFIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvLi9zcmMvcHJvY2Vzc0RhdGEuanMiLCJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvLi9zcmMvd2VhdGhlci5qcyIsIndlYnBhY2s6Ly93ZWF0aGVyLWFwcC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly93ZWF0aGVyLWFwcC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly93ZWF0aGVyLWFwcC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3dlYXRoZXItYXBwLy4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBnZXREYXRhIGZyb20gJy4vd2VhdGhlci5qcyc7XG5cbmZ1bmN0aW9uIGdldERhdGVUaW1lKHRpbWV6b25lLCBkdCA9IG51bGwpe1xuICAgIC8vY29udmVydHMgdGltZSBnaXZlbiBmcm9tIEFQSSB0byB0aW1lIGluIHRoZSBzZWFyY2hlZCBjaXR5XG4gICAgaWYoIWR0KSBkdCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpIC8gMTAwMDtcbiAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoKGR0ICsgdGltZXpvbmUpICogMTAwMCk7XG5cbiAgICBjb25zdCBkYXRldGltZSA9IGRhdGUudG9VVENTdHJpbmcoKTtcbiAgICBjb25zdCBkYXkgPSBkYXRlLmdldFVUQ0RheSgpO1xuICAgIGNvbnN0IGhvdXJzID0gZGF0ZS5nZXRVVENIb3VycygpO1xuICAgIHJldHVybiB7ZGF0ZXRpbWUsIGRheSwgaG91cnN9O1xufVxuXG5mdW5jdGlvbiBtb3N0Q29tbW9uQ29uZChhcnJheSl7XG4gICAgLy9Hb2VzIHRocm91Z2ggZWFjaCBob3VyIGFuZCBmaW5kIG1vc3QgY29tbW9uIHdlYXRoZXIgY29uZGl0aW9uIGZvciB0aGUgZGF5XG4gICAgaWYoYXJyYXkubGVuZ3RoID09IDApIHJldHVybiBudWxsO1xuICAgIGxldCBtb2RlTWFwID0ge307XG4gICAgbGV0IG1heEVsID0gYXJyYXlbMF0ud2VhdGhlclswXS5tYWluLCBtYXhDb3VudCA9IDE7XG4gICAgZm9yKGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKXtcbiAgICAgICAgbGV0IGVsID0gYXJyYXlbaV0ud2VhdGhlclswXS5tYWluO1xuICAgICAgICBpZihtb2RlTWFwW2VsXSA9PSBudWxsKSBtb2RlTWFwW2VsXSA9IDE7XG4gICAgICAgIGVsc2UgbW9kZU1hcFtlbF0rKzsgIFxuICAgICAgICBpZihtb2RlTWFwW2VsXSA+IG1heENvdW50KXtcbiAgICAgICAgICAgIG1heEVsID0gZWw7XG4gICAgICAgICAgICBtYXhDb3VudCA9IG1vZGVNYXBbZWxdO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gbWF4RWw7XG59XG5cbmZ1bmN0aW9uIGdldERheU9mV2Vlaygpe1xuICAgIHJldHVybiBbYFN1bmAsICdNb24nLCAnVHVlJywgJ1dlZCcsICdUaHUnLCAnRnJpJywgJ1NhdCddO1xufVxuXG5mdW5jdGlvbiBleHRyYWN0RGF5V2VhdGhlcihuLCBjdXJyZW50V2VhdGhlciwgZm9yZWNhc3RXZWF0aGVyLCB0b2RheVdlZWtkYXkpe1xuICAgIGxldCB3ZWVrZGF5O1xuICAgIGNvbnN0IGRheSA9IGZvcmVjYXN0V2VhdGhlci5saXN0LmZpbHRlcihpdGVtID0+IHtcbiAgICAgICAgY29uc3Qgd2QgPSBnZXREYXRlVGltZShjdXJyZW50V2VhdGhlci50aW1lem9uZSwgaXRlbS5kdCkuZGF5O1xuICAgICAgICBpZigod2QgPT09IHRvZGF5V2Vla2RheSArIG4pIHx8ICh3ZCA9PT0gdG9kYXlXZWVrZGF5IC0gKDcgLSBuKSkpe1xuICAgICAgICAgICAgd2Vla2RheSA9IHdkO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBkYXkuc29ydCgoYSxiKSA9PiBhLm1haW4udGVtcCA+IGIubWFpbi50ZW1wID8gLTE6IDEpO1xuICAgIGRheVswXS53ZCA9IGdldERheU9mV2VlaygpW3dlZWtkYXldO1xuICAgIHJldHVybiBkYXk7XG59O1xuXG5mdW5jdGlvbiBnZXRDdXJyZW50V2VhdGhlcihsb2NhdGlvbiwgY3VycmVudFdlYXRoZXIsIHRvZGF5RnVsbERhdGUpe1xuICAgIHJldHVybiB7XG4gICAgICAgIGNpdHk6IGxvY2F0aW9uLm5hbWUsXG4gICAgICAgIGNvdW50cnk6IGxvY2F0aW9uLmNvdW50cnksXG4gICAgICAgIHRpbWU6IHRvZGF5RnVsbERhdGUsXG4gICAgICAgIHRlbXA6IGN1cnJlbnRXZWF0aGVyLm1haW4udGVtcCxcbiAgICAgICAgdGVtcF9taW46IGN1cnJlbnRXZWF0aGVyLm1haW4udGVtcF9taW4sXG4gICAgICAgIHRlbXBfbWF4OiBjdXJyZW50V2VhdGhlci5tYWluLnRlbXBfbWF4LFxuICAgICAgICBmZWVsc19saWtlOiBjdXJyZW50V2VhdGhlci5tYWluLmZlZWxzX2xpa2UsXG4gICAgICAgIGh1bWlkaXR5OiBjdXJyZW50V2VhdGhlci5tYWluLmh1bWlkaXR5LFxuICAgICAgICBjb25kaXRpb246IGN1cnJlbnRXZWF0aGVyLndlYXRoZXJbMF0ubWFpbixcbiAgICAgICAgd2luZF9zcGVlZDogY3VycmVudFdlYXRoZXIud2luZC5zcGVlZFxuICAgIH07XG59XG5cbmZ1bmN0aW9uIGdldEZvdXJEYXlGb3JlY2FzdChjdXJyZW50V2VhdGhlciwgZm9yZWNhc3RXZWF0aGVyLCB0b2RheVdlZWtkYXkpe1xuICAgIGxldCBmb3VyRGF5Rm9yZWNhc3QgPSBbXTtcbiAgICBmb3IobGV0IGkgPSAxOyBpIDw9IDQ7IGkrKyl7XG4gICAgICAgIGNvbnN0IGRheSA9IGV4dHJhY3REYXlXZWF0aGVyKGksIGN1cnJlbnRXZWF0aGVyLCBmb3JlY2FzdFdlYXRoZXIsIHRvZGF5V2Vla2RheSk7XG4gICAgICAgIGZvdXJEYXlGb3JlY2FzdC5wdXNoKFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGRheTogZGF5WzBdLndkLFxuICAgICAgICAgICAgICAgIGNvbmRpdGlvbjogbW9zdENvbW1vbkNvbmQoZGF5KSxcbiAgICAgICAgICAgICAgICB0ZW1wX21heDogZGF5WzBdLm1haW4udGVtcCxcbiAgICAgICAgICAgICAgICB0ZW1wX21pbjogZGF5W2RheS5sZW5ndGggLSAxXS5tYWluLnRlbXBcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9O1xuICAgIHJldHVybiBmb3VyRGF5Rm9yZWNhc3Q7XG59XG5cbmZ1bmN0aW9uIGdldEhvdXJseUZvcmVjYXN0KGN1cnJlbnRXZWF0aGVyLCBmb3JlY2FzdFdlYXRoZXIpe1xuICAgIGxldCBob3VybHlGb3JlY2FzdCA9IFtdO1xuICAgIGZvcmVjYXN0V2VhdGhlci5saXN0LmZvckVhY2goaXRlbSA9PntcbiAgICAgICAgY29uc3QgZGF0ZVRpbWUgPSBnZXREYXRlVGltZShjdXJyZW50V2VhdGhlci50aW1lem9uZSwgaXRlbS5kdCk7XG4gICAgICAgIGhvdXJseUZvcmVjYXN0LnB1c2goXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZGF5OiBnZXREYXlPZldlZWsoKVtkYXRlVGltZS5kYXldLFxuICAgICAgICAgICAgICAgIHRpbWU6IGRhdGVUaW1lLmhvdXJzLFxuICAgICAgICAgICAgICAgIHRlbXA6IGl0ZW0ubWFpbi50ZW1wXG4gICAgICAgICAgICB9XG4gICAgICAgIClcbiAgICB9KTtcbiAgICByZXR1cm4gaG91cmx5Rm9yZWNhc3Q7XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NEYXRhKGxvY2F0aW9uLCBjdXJyZW50V2VhdGhlciwgZm9yZWNhc3RXZWF0aGVyKXtcbiAgICBjb25zdCBkYXRlID0gZ2V0RGF0ZVRpbWUoY3VycmVudFdlYXRoZXIudGltZXpvbmUpO1xuICAgIGNvbnN0IHRvZGF5RnVsbERhdGUgPSBkYXRlLmRhdGV0aW1lO1xuICAgIGNvbnN0IHRvZGF5V2Vla2RheSA9IGRhdGUuZGF5O1xuXG4gICAgY29uc3QgY3VycmVudENvbmRpdGlvbnMgPSBnZXRDdXJyZW50V2VhdGhlcihsb2NhdGlvbiwgY3VycmVudFdlYXRoZXIsIHRvZGF5RnVsbERhdGUpOyAgICBcbiAgICBjb25zdCBmb3VyRGF5Rm9yZWNhc3QgPSBnZXRGb3VyRGF5Rm9yZWNhc3QoY3VycmVudFdlYXRoZXIsIGZvcmVjYXN0V2VhdGhlciwgdG9kYXlXZWVrZGF5KTtcbiAgICBjb25zdCBob3VybHlGb3JlY2FzdCA9IGdldEhvdXJseUZvcmVjYXN0KGN1cnJlbnRXZWF0aGVyLCBmb3JlY2FzdFdlYXRoZXIpOyBcbiAgICByZXR1cm4ge2N1cnJlbnRDb25kaXRpb25zLCBmb3VyRGF5Rm9yZWNhc3QsIGhvdXJseUZvcmVjYXN0fTsgIFxufVxuXG5hc3luYyBmdW5jdGlvbiB3ZWF0aGVyRGF0YShzZWFyY2hUZXJtID0gYFRva3lvYCwgdW5pdHMgPSBgTWV0cmljYCl7XG4gICAgdHJ5e1xuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgZ2V0RGF0YShzZWFyY2hUZXJtLCB1bml0cyk7IFxuICAgICAgICByZXR1cm4gcHJvY2Vzc0RhdGEoZGF0YS5sb2NhdGlvbiwgZGF0YS5jdXJyZW50V2VhdGhlciwgZGF0YS5mb3JlY2FzdFdlYXRoZXIpO1xuICAgIH1jYXRjaChlcnIpe1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgd2VhdGhlckRhdGE7IiwiYXN5bmMgZnVuY3Rpb24gZ2V0Q3VycmVudFdlYXRoZXIgKGxvY2F0aW9uLCB1bml0cyl7XG4gICAgdHJ5e1xuICAgICAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9hcGkub3BlbndlYXRoZXJtYXAub3JnL2RhdGEvMi41L3dlYXRoZXI/bGF0PSR7bG9jYXRpb24ubGF0fSZsb249JHtsb2NhdGlvbi5sb259JnVuaXRzPSR7dW5pdHN9JmFwcGlkPTI5MDlhNzRhOTI3NDExODJhYzk1MmE5ZDU1OTZiMzQxYDtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIHttb2RlOiBgY29yc2B9KTtcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfWNhdGNoKGVycil7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgfVxufTtcblxuYXN5bmMgZnVuY3Rpb24gZ2V0Rm9yZWNhc3RXZWF0aGVyIChsb2NhdGlvbiwgdW5pdHMpe1xuICAgIHRyeXtcbiAgICAgICAgY29uc3QgdXJsID0gYGh0dHA6Ly9hcGkub3BlbndlYXRoZXJtYXAub3JnL2RhdGEvMi41L2ZvcmVjYXN0P2xhdD0ke2xvY2F0aW9uLmxhdH0mbG9uPSR7bG9jYXRpb24ubG9ufSZ1bml0cz0ke3VuaXRzfSZjbnQ9NDAmYXBwaWQ9MjkwOWE3NGE5Mjc0MTE4MmFjOTUyYTlkNTU5NmIzNDFgO1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwge21vZGU6IGBjb3JzYH0pXG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH1jYXRjaChlcnIpe1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgIH1cbn07XG5cbmFzeW5jIGZ1bmN0aW9uIGNvbnZlcnRUb0xhdExvbihzZWFyY2hUZXJtKXtcbiAgICB0cnl7XG4gICAgICAgIGNvbnN0IHVybCA9IGBodHRwOi8vYXBpLm9wZW53ZWF0aGVybWFwLm9yZy9nZW8vMS4wL2RpcmVjdD9xPSR7c2VhcmNoVGVybX0mbGltaXQ9MSZhcHBpZD0yOTA5YTc0YTkyNzQxMTgyYWM5NTJhOWQ1NTk2YjM0MWA7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7bW9kZTogYGNvcnNgfSk7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICAgIHJldHVybiBkYXRhWzBdO1xuICAgIH1jYXRjaChlcnIpe1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0RGF0YShzZWFyY2hUZXJtLCB1bml0cyl7XG4gICAgdHJ5e1xuICAgICAgICBjb25zdCBsb2NhdGlvbiA9IGF3YWl0IGNvbnZlcnRUb0xhdExvbihzZWFyY2hUZXJtKTtcbiAgICAgICAgY29uc3QgY3VycmVudFdlYXRoZXIgPSBhd2FpdCBnZXRDdXJyZW50V2VhdGhlcihsb2NhdGlvbiwgdW5pdHMpO1xuICAgICAgICBjb25zdCBmb3JlY2FzdFdlYXRoZXIgPSBhd2FpdCBnZXRGb3JlY2FzdFdlYXRoZXIobG9jYXRpb24sIHVuaXRzKTtcbiAgICAgICAgcmV0dXJuIHtsb2NhdGlvbiwgY3VycmVudFdlYXRoZXIsIGZvcmVjYXN0V2VhdGhlcn07XG4gICAgfWNhdGNoKGVycil7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgZ2V0RGF0YTsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB3ZWF0aGVyRGF0YSBmcm9tICcuL3Byb2Nlc3NEYXRhLmpzJztcblxuYXN5bmMgZnVuY3Rpb24gdXBkYXRlV2VhdGhlcigpe1xuICAgIGNvbnN0IHtjdXJyZW50Q29uZGl0aW9ucywgZm91ckRheUZvcmVjYXN0LCBob3VybHlGb3JlY2FzdH0gPSBhd2FpdCB3ZWF0aGVyRGF0YSgpOyAvL1NlbmQgaW4gc2VhcmNoVGVybSBhbmQgdW5pdHMgaGVyZVxuICAgIGNvbnNvbGUubG9nKCdjdXJyZW50JywgY3VycmVudENvbmRpdGlvbnMpO1xuICAgIGNvbnNvbGUubG9nKCd0aHJlZURheScsIGZvdXJEYXlGb3JlY2FzdCk7XG4gICAgY29uc29sZS5sb2coJ2hvdXJseScsIGhvdXJseUZvcmVjYXN0KTtcbn1cbnVwZGF0ZVdlYXRoZXIoKS5jYXRjaChlcnIgPT4ge1xuICAgIGNvbnNvbGUubG9nKGVycik7XG59KTsiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=