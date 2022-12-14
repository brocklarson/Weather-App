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

/***/ "./src/updateDOM.js":
/*!**************************!*\
  !*** ./src/updateDOM.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });


function updateDOM(){
    return;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (updateDOM);

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
/* harmony import */ var _updateDOM_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./updateDOM.js */ "./src/updateDOM.js");



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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguYnVuZGxlLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFtQzs7QUFFbkM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsa0JBQWtCO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLG1CQUFtQixRQUFRO0FBQzNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaOztBQUVBO0FBQ0E7QUFDQSwyQkFBMkIsdURBQU87QUFDbEM7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBLGlFQUFlLFdBQVc7Ozs7Ozs7Ozs7Ozs7Ozs7QUNoSDFCO0FBQ0E7QUFDQTs7QUFFQSxpRUFBZSxTQUFTOzs7Ozs7Ozs7Ozs7OztBQ054QjtBQUNBO0FBQ0EsMkVBQTJFLGFBQWEsT0FBTyxhQUFhLFNBQVMsTUFBTTtBQUMzSCwyQ0FBMkMsYUFBYTtBQUN4RDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsMkVBQTJFLGFBQWEsT0FBTyxhQUFhLFNBQVMsTUFBTTtBQUMzSCwyQ0FBMkMsYUFBYTtBQUN4RDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esc0VBQXNFLFdBQVc7QUFDakYsMkNBQTJDLGFBQWE7QUFDeEQ7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQjtBQUNoQixLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBLGlFQUFlLE9BQU87Ozs7OztVQzVDdEI7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7Ozs7Ozs7Ozs7QUNOMkM7QUFDSjs7QUFFdkM7QUFDQSxXQUFXLG9EQUFvRCxRQUFRLDJEQUFXLElBQUk7QUFDdEY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQyxFIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvLi9zcmMvcHJvY2Vzc0RhdGEuanMiLCJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvLi9zcmMvdXBkYXRlRE9NLmpzIiwid2VicGFjazovL3dlYXRoZXItYXBwLy4vc3JjL3dlYXRoZXIuanMiLCJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL3dlYXRoZXItYXBwL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly93ZWF0aGVyLWFwcC8uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZ2V0RGF0YSBmcm9tICcuL3dlYXRoZXIuanMnO1xuXG5mdW5jdGlvbiBnZXREYXRlVGltZSh0aW1lem9uZSwgZHQgPSBudWxsKXtcbiAgICAvL2NvbnZlcnRzIHRpbWUgZ2l2ZW4gZnJvbSBBUEkgdG8gdGltZSBpbiB0aGUgc2VhcmNoZWQgY2l0eVxuICAgIGlmKCFkdCkgZHQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSAvIDEwMDA7XG4gICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKChkdCArIHRpbWV6b25lKSAqIDEwMDApO1xuXG4gICAgY29uc3QgZGF0ZXRpbWUgPSBkYXRlLnRvVVRDU3RyaW5nKCk7XG4gICAgY29uc3QgZGF5ID0gZGF0ZS5nZXRVVENEYXkoKTtcbiAgICBjb25zdCBob3VycyA9IGRhdGUuZ2V0VVRDSG91cnMoKTtcbiAgICByZXR1cm4ge2RhdGV0aW1lLCBkYXksIGhvdXJzfTtcbn1cblxuZnVuY3Rpb24gbW9zdENvbW1vbkNvbmQoYXJyYXkpe1xuICAgIC8vR29lcyB0aHJvdWdoIGVhY2ggaG91ciBhbmQgZmluZCBtb3N0IGNvbW1vbiB3ZWF0aGVyIGNvbmRpdGlvbiBmb3IgdGhlIGRheVxuICAgIGlmKGFycmF5Lmxlbmd0aCA9PSAwKSByZXR1cm4gbnVsbDtcbiAgICBsZXQgbW9kZU1hcCA9IHt9O1xuICAgIGxldCBtYXhFbCA9IGFycmF5WzBdLndlYXRoZXJbMF0ubWFpbiwgbWF4Q291bnQgPSAxO1xuICAgIGZvcihsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKyl7XG4gICAgICAgIGxldCBlbCA9IGFycmF5W2ldLndlYXRoZXJbMF0ubWFpbjtcbiAgICAgICAgaWYobW9kZU1hcFtlbF0gPT0gbnVsbCkgbW9kZU1hcFtlbF0gPSAxO1xuICAgICAgICBlbHNlIG1vZGVNYXBbZWxdKys7ICBcbiAgICAgICAgaWYobW9kZU1hcFtlbF0gPiBtYXhDb3VudCl7XG4gICAgICAgICAgICBtYXhFbCA9IGVsO1xuICAgICAgICAgICAgbWF4Q291bnQgPSBtb2RlTWFwW2VsXTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIG1heEVsO1xufVxuXG5mdW5jdGlvbiBnZXREYXlPZldlZWsoKXtcbiAgICByZXR1cm4gW2BTdW5gLCAnTW9uJywgJ1R1ZScsICdXZWQnLCAnVGh1JywgJ0ZyaScsICdTYXQnXTtcbn1cblxuZnVuY3Rpb24gZXh0cmFjdERheVdlYXRoZXIobiwgY3VycmVudFdlYXRoZXIsIGZvcmVjYXN0V2VhdGhlciwgdG9kYXlXZWVrZGF5KXtcbiAgICBsZXQgd2Vla2RheTtcbiAgICBjb25zdCBkYXkgPSBmb3JlY2FzdFdlYXRoZXIubGlzdC5maWx0ZXIoaXRlbSA9PiB7XG4gICAgICAgIGNvbnN0IHdkID0gZ2V0RGF0ZVRpbWUoY3VycmVudFdlYXRoZXIudGltZXpvbmUsIGl0ZW0uZHQpLmRheTtcbiAgICAgICAgaWYoKHdkID09PSB0b2RheVdlZWtkYXkgKyBuKSB8fCAod2QgPT09IHRvZGF5V2Vla2RheSAtICg3IC0gbikpKXtcbiAgICAgICAgICAgIHdlZWtkYXkgPSB3ZDtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgZGF5LnNvcnQoKGEsYikgPT4gYS5tYWluLnRlbXAgPiBiLm1haW4udGVtcCA/IC0xOiAxKTtcbiAgICBkYXlbMF0ud2QgPSBnZXREYXlPZldlZWsoKVt3ZWVrZGF5XTtcbiAgICByZXR1cm4gZGF5O1xufTtcblxuZnVuY3Rpb24gZ2V0Q3VycmVudFdlYXRoZXIobG9jYXRpb24sIGN1cnJlbnRXZWF0aGVyLCB0b2RheUZ1bGxEYXRlKXtcbiAgICByZXR1cm4ge1xuICAgICAgICBjaXR5OiBsb2NhdGlvbi5uYW1lLFxuICAgICAgICBjb3VudHJ5OiBsb2NhdGlvbi5jb3VudHJ5LFxuICAgICAgICB0aW1lOiB0b2RheUZ1bGxEYXRlLFxuICAgICAgICB0ZW1wOiBjdXJyZW50V2VhdGhlci5tYWluLnRlbXAsXG4gICAgICAgIHRlbXBfbWluOiBjdXJyZW50V2VhdGhlci5tYWluLnRlbXBfbWluLFxuICAgICAgICB0ZW1wX21heDogY3VycmVudFdlYXRoZXIubWFpbi50ZW1wX21heCxcbiAgICAgICAgZmVlbHNfbGlrZTogY3VycmVudFdlYXRoZXIubWFpbi5mZWVsc19saWtlLFxuICAgICAgICBodW1pZGl0eTogY3VycmVudFdlYXRoZXIubWFpbi5odW1pZGl0eSxcbiAgICAgICAgY29uZGl0aW9uOiBjdXJyZW50V2VhdGhlci53ZWF0aGVyWzBdLm1haW4sXG4gICAgICAgIHdpbmRfc3BlZWQ6IGN1cnJlbnRXZWF0aGVyLndpbmQuc3BlZWRcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBnZXRGb3VyRGF5Rm9yZWNhc3QoY3VycmVudFdlYXRoZXIsIGZvcmVjYXN0V2VhdGhlciwgdG9kYXlXZWVrZGF5KXtcbiAgICBsZXQgZm91ckRheUZvcmVjYXN0ID0gW107XG4gICAgZm9yKGxldCBpID0gMTsgaSA8PSA0OyBpKyspe1xuICAgICAgICBjb25zdCBkYXkgPSBleHRyYWN0RGF5V2VhdGhlcihpLCBjdXJyZW50V2VhdGhlciwgZm9yZWNhc3RXZWF0aGVyLCB0b2RheVdlZWtkYXkpO1xuICAgICAgICBmb3VyRGF5Rm9yZWNhc3QucHVzaChcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBkYXk6IGRheVswXS53ZCxcbiAgICAgICAgICAgICAgICBjb25kaXRpb246IG1vc3RDb21tb25Db25kKGRheSksXG4gICAgICAgICAgICAgICAgdGVtcF9tYXg6IGRheVswXS5tYWluLnRlbXAsXG4gICAgICAgICAgICAgICAgdGVtcF9taW46IGRheVtkYXkubGVuZ3RoIC0gMV0ubWFpbi50ZW1wXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfTtcbiAgICByZXR1cm4gZm91ckRheUZvcmVjYXN0O1xufVxuXG5mdW5jdGlvbiBnZXRIb3VybHlGb3JlY2FzdChjdXJyZW50V2VhdGhlciwgZm9yZWNhc3RXZWF0aGVyKXtcbiAgICBsZXQgaG91cmx5Rm9yZWNhc3QgPSBbXTtcbiAgICBmb3JlY2FzdFdlYXRoZXIubGlzdC5mb3JFYWNoKGl0ZW0gPT57XG4gICAgICAgIGNvbnN0IGRhdGVUaW1lID0gZ2V0RGF0ZVRpbWUoY3VycmVudFdlYXRoZXIudGltZXpvbmUsIGl0ZW0uZHQpO1xuICAgICAgICBob3VybHlGb3JlY2FzdC5wdXNoKFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGRheTogZ2V0RGF5T2ZXZWVrKClbZGF0ZVRpbWUuZGF5XSxcbiAgICAgICAgICAgICAgICB0aW1lOiBkYXRlVGltZS5ob3VycyxcbiAgICAgICAgICAgICAgICB0ZW1wOiBpdGVtLm1haW4udGVtcFxuICAgICAgICAgICAgfVxuICAgICAgICApXG4gICAgfSk7XG4gICAgcmV0dXJuIGhvdXJseUZvcmVjYXN0O1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzRGF0YShsb2NhdGlvbiwgY3VycmVudFdlYXRoZXIsIGZvcmVjYXN0V2VhdGhlcil7XG4gICAgY29uc3QgZGF0ZSA9IGdldERhdGVUaW1lKGN1cnJlbnRXZWF0aGVyLnRpbWV6b25lKTtcbiAgICBjb25zdCB0b2RheUZ1bGxEYXRlID0gZGF0ZS5kYXRldGltZTtcbiAgICBjb25zdCB0b2RheVdlZWtkYXkgPSBkYXRlLmRheTtcblxuICAgIGNvbnN0IGN1cnJlbnRDb25kaXRpb25zID0gZ2V0Q3VycmVudFdlYXRoZXIobG9jYXRpb24sIGN1cnJlbnRXZWF0aGVyLCB0b2RheUZ1bGxEYXRlKTsgICAgXG4gICAgY29uc3QgZm91ckRheUZvcmVjYXN0ID0gZ2V0Rm91ckRheUZvcmVjYXN0KGN1cnJlbnRXZWF0aGVyLCBmb3JlY2FzdFdlYXRoZXIsIHRvZGF5V2Vla2RheSk7XG4gICAgY29uc3QgaG91cmx5Rm9yZWNhc3QgPSBnZXRIb3VybHlGb3JlY2FzdChjdXJyZW50V2VhdGhlciwgZm9yZWNhc3RXZWF0aGVyKTsgXG4gICAgcmV0dXJuIHtjdXJyZW50Q29uZGl0aW9ucywgZm91ckRheUZvcmVjYXN0LCBob3VybHlGb3JlY2FzdH07ICBcbn1cblxuYXN5bmMgZnVuY3Rpb24gd2VhdGhlckRhdGEoc2VhcmNoVGVybSA9IGBUb2t5b2AsIHVuaXRzID0gYE1ldHJpY2Ape1xuICAgIHRyeXtcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IGdldERhdGEoc2VhcmNoVGVybSwgdW5pdHMpOyBcbiAgICAgICAgcmV0dXJuIHByb2Nlc3NEYXRhKGRhdGEubG9jYXRpb24sIGRhdGEuY3VycmVudFdlYXRoZXIsIGRhdGEuZm9yZWNhc3RXZWF0aGVyKTtcbiAgICB9Y2F0Y2goZXJyKXtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHdlYXRoZXJEYXRhOyIsIlxuXG5mdW5jdGlvbiB1cGRhdGVET00oKXtcbiAgICByZXR1cm47XG59XG5cbmV4cG9ydCBkZWZhdWx0IHVwZGF0ZURPTTsiLCJhc3luYyBmdW5jdGlvbiBnZXRDdXJyZW50V2VhdGhlciAobG9jYXRpb24sIHVuaXRzKXtcbiAgICB0cnl7XG4gICAgICAgIGNvbnN0IHVybCA9IGBodHRwczovL2FwaS5vcGVud2VhdGhlcm1hcC5vcmcvZGF0YS8yLjUvd2VhdGhlcj9sYXQ9JHtsb2NhdGlvbi5sYXR9Jmxvbj0ke2xvY2F0aW9uLmxvbn0mdW5pdHM9JHt1bml0c30mYXBwaWQ9MjkwOWE3NGE5Mjc0MTE4MmFjOTUyYTlkNTU5NmIzNDFgO1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwge21vZGU6IGBjb3JzYH0pO1xuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9Y2F0Y2goZXJyKXtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICB9XG59O1xuXG5hc3luYyBmdW5jdGlvbiBnZXRGb3JlY2FzdFdlYXRoZXIgKGxvY2F0aW9uLCB1bml0cyl7XG4gICAgdHJ5e1xuICAgICAgICBjb25zdCB1cmwgPSBgaHR0cDovL2FwaS5vcGVud2VhdGhlcm1hcC5vcmcvZGF0YS8yLjUvZm9yZWNhc3Q/bGF0PSR7bG9jYXRpb24ubGF0fSZsb249JHtsb2NhdGlvbi5sb259JnVuaXRzPSR7dW5pdHN9JmNudD00MCZhcHBpZD0yOTA5YTc0YTkyNzQxMTgyYWM5NTJhOWQ1NTk2YjM0MWA7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7bW9kZTogYGNvcnNgfSlcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfWNhdGNoKGVycil7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgfVxufTtcblxuYXN5bmMgZnVuY3Rpb24gY29udmVydFRvTGF0TG9uKHNlYXJjaFRlcm0pe1xuICAgIHRyeXtcbiAgICAgICAgY29uc3QgdXJsID0gYGh0dHA6Ly9hcGkub3BlbndlYXRoZXJtYXAub3JnL2dlby8xLjAvZGlyZWN0P3E9JHtzZWFyY2hUZXJtfSZsaW1pdD0xJmFwcGlkPTI5MDlhNzRhOTI3NDExODJhYzk1MmE5ZDU1OTZiMzQxYDtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIHttb2RlOiBgY29yc2B9KTtcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgcmV0dXJuIGRhdGFbMF07XG4gICAgfWNhdGNoKGVycil7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBnZXREYXRhKHNlYXJjaFRlcm0sIHVuaXRzKXtcbiAgICB0cnl7XG4gICAgICAgIGNvbnN0IGxvY2F0aW9uID0gYXdhaXQgY29udmVydFRvTGF0TG9uKHNlYXJjaFRlcm0pO1xuICAgICAgICBjb25zdCBjdXJyZW50V2VhdGhlciA9IGF3YWl0IGdldEN1cnJlbnRXZWF0aGVyKGxvY2F0aW9uLCB1bml0cyk7XG4gICAgICAgIGNvbnN0IGZvcmVjYXN0V2VhdGhlciA9IGF3YWl0IGdldEZvcmVjYXN0V2VhdGhlcihsb2NhdGlvbiwgdW5pdHMpO1xuICAgICAgICByZXR1cm4ge2xvY2F0aW9uLCBjdXJyZW50V2VhdGhlciwgZm9yZWNhc3RXZWF0aGVyfTtcbiAgICB9Y2F0Y2goZXJyKXtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBnZXREYXRhOyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHdlYXRoZXJEYXRhIGZyb20gJy4vcHJvY2Vzc0RhdGEuanMnO1xuaW1wb3J0IHVwZGF0ZURPTSBmcm9tICcuL3VwZGF0ZURPTS5qcyc7XG5cbmFzeW5jIGZ1bmN0aW9uIHVwZGF0ZVdlYXRoZXIoKXtcbiAgICBjb25zdCB7Y3VycmVudENvbmRpdGlvbnMsIGZvdXJEYXlGb3JlY2FzdCwgaG91cmx5Rm9yZWNhc3R9ID0gYXdhaXQgd2VhdGhlckRhdGEoKTsgLy9TZW5kIGluIHNlYXJjaFRlcm0gYW5kIHVuaXRzIGhlcmVcbiAgICBjb25zb2xlLmxvZygnY3VycmVudCcsIGN1cnJlbnRDb25kaXRpb25zKTtcbiAgICBjb25zb2xlLmxvZygndGhyZWVEYXknLCBmb3VyRGF5Rm9yZWNhc3QpO1xuICAgIGNvbnNvbGUubG9nKCdob3VybHknLCBob3VybHlGb3JlY2FzdCk7XG59XG51cGRhdGVXZWF0aGVyKCkuY2F0Y2goZXJyID0+IHtcbiAgICBjb25zb2xlLmxvZyhlcnIpO1xufSk7Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9