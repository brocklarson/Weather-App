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
    //converts time given from openweather API to time in the searched city
    if(!dt) dt = new Date().getTime() / 1000;
    const date = new Date((dt + timezone) * 1000);

    const day = date.getUTCDay();
    const hours = date.getUTCHours();
    let datetime = date.toUTCString().slice(0,-7);
    return {datetime, day, hours};
}

function mostCommonCond(array){
    //Goes through each hour and finds most common weather condition for the day
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
    //Goes through the hourly forecast and gets just the data from the desired day
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
                temp: item.main.temp,
                condition: item.weather[0].main
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

/***/ "./src/pubsub.js":
/*!***********************!*\
  !*** ./src/pubsub.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const events = {
    events: {},
    subscribe(eventName, fn) {
        this.events[eventName] = this.events[eventName] || [];
        this.events[eventName].push(fn);
    },
    unsubscribe(eventName, fn) {
        if (this.events[eventName]) {
            for (let i = 0; i < this.events[eventName].length; i++) {
                if (this.events[eventName][i] === fn) {
                    this.events[eventName].splice(i, 1);
                    break;
                }
            }
        }
    },
    publish(eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach((fn) => {
                fn(data);
            });
        }
    }
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (events);

/***/ }),

/***/ "./src/storage.js":
/*!************************!*\
  !*** ./src/storage.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _pubsub_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./pubsub.js */ "./src/pubsub.js");


function storageAvailable(type) {
    let storage;
    try {
        storage = window[type];
        const x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return e instanceof DOMException && (
                // everything except Firefox
                e.code === 22 ||
                // Firefox
                e.code === 1014 ||
                // test name field too, because code might not be present
                // everything except Firefox
                e.name === 'QuotaExceededError' ||
                // Firefox
                e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
    }
}

function updateLocalStorage(name, data) {
    if (storageAvailable('localStorage')) {
        localStorage.setItem(name, JSON.stringify(data));
    }
}

function getLocalStorage(data) {
    if (storageAvailable('localStorage')) {
        if (localStorage.getItem(data)) {
            return JSON.parse(localStorage.getItem(data));
        }
    }
    return false;
}

_pubsub_js__WEBPACK_IMPORTED_MODULE_0__["default"].subscribe('updateLocalStorage', (data) => { updateLocalStorage(data[0], data[1]) });

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (getLocalStorage);

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
const getConditionIcon = (condition) => {
    if(condition.toLowerCase() === `clear`) return `sunny`;
    else if(condition.toLowerCase() === `clouds`) return `cloudy`;
    else if(condition.toLowerCase() === `rain`) return `rainy`;
    else if(condition.toLowerCase() === `snow`) return `cloudy_snowing`;
    else if(condition.toLowerCase() === `drizzle`) return `rainy`;
    else if(condition.toLowerCase() === `thunderstorm`) return `thunderstorm`;
    else return `foggy`;
}

const currentWeatherOverview = (currentWeather, units) => {
    const currentCondition = document.querySelector(`.current-condition`);
    const currentTemp = document.querySelector(`.current-temp`);
    const city = document.querySelector(`.city`);
    const country = document.querySelector(`.country`);
    const icon = document.querySelector(`.condition-icon`);
    const mainUnits = document.querySelector(`.main-units`);
    const secondaryUnits = document.querySelector(`.secondary-units`);

    function updateData(){
        currentCondition.innerText = currentWeather.condition;
        currentTemp.innerText = Math.round(currentWeather.temp);
        city.innerText = currentWeather.city + ` `;
        country.innerText = currentWeather.country;
        icon.innerText = getConditionIcon(currentWeather.condition);
    }

    function setUnits(){
        if(units === `Metric`){
            mainUnits.innerText = `\u00B0C`;
            secondaryUnits.innerText = `\u00B0F`;
        }else{
            mainUnits.innerText = `\u00B0F`;
            secondaryUnits.innerText = `\u00B0C`;
        }
    }

    (function init(){
        updateData();
        setUnits();
    })();
}

const currentWeatherDetails = (currentWeather, units) => {
    const tempMax = document.querySelector(`.temp-min-max`);
    const feelsLike = document.querySelector(`.feels-like`);
    const tempUnits = document.querySelectorAll(`.temp-units`);
    const humidity = document.querySelector(`.humidity`);
    const windSpeed = document.querySelector(`.wind-speed`);
    const windUnits = document.querySelector(`.wind-units`);

    tempMax.innerText = `${Math.round(currentWeather.temp_min)}/${Math.round(currentWeather.temp_max)}`;
    feelsLike.innerText = Math.round(currentWeather.feels_like);
    humidity.innerText = currentWeather.humidity + `%`;

    if(units === `Metric`){
        windSpeed.innerText = Math.round(currentWeather.wind_speed * 3.6);
        windUnits.innerText = ` kmh`;
        tempUnits.forEach(el => el.innerText = `\u00B0C`);
    }else{
        windSpeed.innerText = Math.round(currentWeather.wind_speed);
        windUnits.innerText = ` mph`;
        tempUnits.forEach(el => el.innerText = `\u00B0F`);
    }
    
}

const updateFourDayForecast = (fourDayForecast, units) => {
    const container = document.querySelector(`.four-day-forecast`);

    function createCards(dayOfWeek, maxTemp, minTemp, condition, units){
        const card = document.createElement(`div`);
        card.classList.add('fourDayCard-container');

        const day = document.createElement(`p`);
        day.classList.add(`fourDayCard-day`);
        day.innerText = dayOfWeek;

        const maxSpan = document.createElement(`span`);
        maxSpan.classList.add(`fourDayCard-max`);
        const max = document.createElement(`span`);
        max.innerText = Math.round(maxTemp);

        const minSpan = document.createElement(`span`);
        minSpan.classList.add(`fourDayCard-min`);
        const min = document.createElement(`span`);
        min.innerText = Math.round(minTemp);

        const cond = document.createElement(`span`);
        cond.classList.add(`fourDayCard-condition`, `material-symbols-outlined`);
        cond.innerText = getConditionIcon(condition);

        const unitsSpan = document.createElement(`span`);
        if(units === `Metric`) unitsSpan.innerText = `\u00B0C`;
        else unitsSpan.innerText = `\u00B0F`;

        container.appendChild(card);
        card.appendChild(day);
        card.appendChild(maxSpan);
        maxSpan.appendChild(max);
        maxSpan.appendChild(unitsSpan);
        card.appendChild(minSpan);
        minSpan.appendChild(min);
        minSpan.appendChild(unitsSpan.cloneNode(true));
        card.appendChild(cond);
    }

    function reset() {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }

    (function init(){
        reset();
        fourDayForecast.forEach(day => {
            createCards(day.day, day.temp_max, day.temp_min, day.condition, units);
        });
    })();
}

const updateHourlyForecast = (hourlyForecast, units) => {
    const container = document.querySelector(`.hourly-forecast`);

    function formatTime(timeOfDay){
        if(timeOfDay > 12) return (timeOfDay - 12) + ` pm`;
        else return timeOfDay + ` am`;
    }

    function createCards(timeOfDay, dayOfWeek, temp, condition, units){
        const card = document.createElement(`div`);
        card.classList.add('hourlyCard-container');

        const time = document.createElement(`p`);
        time.classList.add(`hourlyCard-time`);
        time.innerText = formatTime(timeOfDay);

        const day = document.createElement(`p`);
        day.classList.add(`hourlyCard-day`);
        day.innerText = dayOfWeek;  

        const tempSpan = document.createElement(`span`);
        tempSpan.classList.add(`hourlyCard-temp`);
        const min = document.createElement(`span`);
        min.innerText = Math.round(temp);

        const unitsSpan = document.createElement(`span`);
        if(units === `Metric`) unitsSpan.innerText = `\u00B0C`;
        else unitsSpan.innerText = `\u00B0F`;

        const cond = document.createElement(`span`);
        cond.classList.add(`hourlyCard-condition`, `material-symbols-outlined`);
        cond.innerText = getConditionIcon(condition);

        container.appendChild(card);
        card.appendChild(time);
        card.appendChild(day);
        card.appendChild(tempSpan);
        tempSpan.appendChild(min);
        tempSpan.appendChild(unitsSpan);
        card.appendChild(cond);
    }

    function reset() {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }

    (function init(){
        reset();
        hourlyForecast.forEach(day => {
            createCards(day.time, day.day, day.temp, day.condition, units);
        });
    })();

}

function updateDOM(currentWeather, fourDayForecast, hourlyForecast, units){
    currentWeatherOverview(currentWeather, units);
    currentWeatherDetails(currentWeather, units);
    updateFourDayForecast(fourDayForecast, units);
    updateHourlyForecast(hourlyForecast, units);
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
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}&units=${units}&cnt=40&appid=2909a74a92741182ac952a9d5596b341`;
        const response = await fetch(url, {mode: `cors`})
        const data = await response.json();
        return data;
    }catch(err){
        console.log(err);
    }
};

async function convertToLatLon(searchTerm){
    try{
        const url = `https://api.openweathermap.org/geo/1.0/direct?q=${searchTerm}&limit=1&appid=2909a74a92741182ac952a9d5596b341`;
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
/* harmony import */ var _storage_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./storage.js */ "./src/storage.js");
/* harmony import */ var _pubsub_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./pubsub.js */ "./src/pubsub.js");






const form = document.querySelector(`form`);
const search = document.querySelector(`input[type=text]`);
const unitsSelector = document.querySelector(`.secondary-units`);
const forecastSelector = document.querySelector(`.forecast-selector`);

async function updateWeather(searchTerm = `Tokyo`, units = `Metric`){
    try{
        const {currentConditions, fourDayForecast, hourlyForecast} = await (0,_processData_js__WEBPACK_IMPORTED_MODULE_0__["default"])(searchTerm, units);
        (0,_updateDOM_js__WEBPACK_IMPORTED_MODULE_1__["default"])(currentConditions, fourDayForecast, hourlyForecast, units);
        _pubsub_js__WEBPACK_IMPORTED_MODULE_3__["default"].publish('updateLocalStorage', [`weather-app`, {city: searchTerm, units: units}]);
    }catch(err){
        console.log(err);
        window.alert(`Could not find city.\nYour search must be in the form of "City", "City, State", or "City, Country".`)
    }
}

//Fires when a new city is searched
form.addEventListener(`submit`, function(event){
    event.preventDefault();
    const searchTerm = search.value;
    updateWeather(searchTerm);
});

//Fires when clicking the C or F to change units
unitsSelector.addEventListener(`click`, function(){
    const lastSearch = (0,_storage_js__WEBPACK_IMPORTED_MODULE_2__["default"])(`weather-app`);
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
    if((0,_storage_js__WEBPACK_IMPORTED_MODULE_2__["default"])(`weather-app`)){
        const lastSearch = (0,_storage_js__WEBPACK_IMPORTED_MODULE_2__["default"])(`weather-app`);
        updateWeather(lastSearch.city, lastSearch.units);
    } else updateWeather();
})();
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguYnVuZGxlLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFtQzs7QUFFbkM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsa0JBQWtCO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsbUJBQW1CLFFBQVE7QUFDM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjs7QUFFQTtBQUNBO0FBQ0EsMkJBQTJCLHVEQUFPO0FBQ2xDO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQSxpRUFBZSxXQUFXOzs7Ozs7Ozs7Ozs7OztBQ3BIMUI7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSw0QkFBNEIsbUNBQW1DO0FBQy9EO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7O0FBRUEsaUVBQWUsTUFBTTs7Ozs7Ozs7Ozs7Ozs7O0FDekJZOztBQUVqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLDREQUFnQixtQ0FBbUMsc0NBQXNDOztBQUV6RixpRUFBZSxlQUFlOzs7Ozs7Ozs7Ozs7OztBQzNDOUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLDJCQUEyQixvQ0FBb0MsR0FBRyxvQ0FBb0M7QUFDdEc7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxLQUFLO0FBQ0w7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxLQUFLOztBQUVMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxpRUFBZSxTQUFTOzs7Ozs7Ozs7Ozs7OztBQ3pMeEI7QUFDQTtBQUNBLDJFQUEyRSxhQUFhLE9BQU8sYUFBYSxTQUFTLE1BQU07QUFDM0gsMkNBQTJDLGFBQWE7QUFDeEQ7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLDRFQUE0RSxhQUFhLE9BQU8sYUFBYSxTQUFTLE1BQU07QUFDNUgsMkNBQTJDLGFBQWE7QUFDeEQ7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHVFQUF1RSxXQUFXO0FBQ2xGLDJDQUEyQyxhQUFhO0FBQ3hEO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0I7QUFDaEIsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQSxpRUFBZSxPQUFPOzs7Ozs7VUM1Q3RCO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7Ozs7Ozs7Ozs7Ozs7QUNOMkM7QUFDSjtBQUNJO0FBQ1Y7OztBQUdqQztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsZUFBZSxvREFBb0QsUUFBUSwyREFBVztBQUN0RixRQUFRLHlEQUFTO0FBQ2pCLFFBQVEsMERBQWMsd0NBQXdDLCtCQUErQjtBQUM3RixLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBLHVCQUF1Qix1REFBZTtBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBLE9BQU8sdURBQWU7QUFDdEIsMkJBQTJCLHVEQUFlO0FBQzFDO0FBQ0EsTUFBTTtBQUNOLENBQUMsSSIsInNvdXJjZXMiOlsid2VicGFjazovL3dlYXRoZXItYXBwLy4vc3JjL3Byb2Nlc3NEYXRhLmpzIiwid2VicGFjazovL3dlYXRoZXItYXBwLy4vc3JjL3B1YnN1Yi5qcyIsIndlYnBhY2s6Ly93ZWF0aGVyLWFwcC8uL3NyYy9zdG9yYWdlLmpzIiwid2VicGFjazovL3dlYXRoZXItYXBwLy4vc3JjL3VwZGF0ZURPTS5qcyIsIndlYnBhY2s6Ly93ZWF0aGVyLWFwcC8uL3NyYy93ZWF0aGVyLmpzIiwid2VicGFjazovL3dlYXRoZXItYXBwL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3dlYXRoZXItYXBwL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly93ZWF0aGVyLWFwcC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3dlYXRoZXItYXBwL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGdldERhdGEgZnJvbSAnLi93ZWF0aGVyLmpzJztcblxuZnVuY3Rpb24gZ2V0RGF0ZVRpbWUodGltZXpvbmUsIGR0ID0gbnVsbCl7XG4gICAgLy9jb252ZXJ0cyB0aW1lIGdpdmVuIGZyb20gb3BlbndlYXRoZXIgQVBJIHRvIHRpbWUgaW4gdGhlIHNlYXJjaGVkIGNpdHlcbiAgICBpZighZHQpIGR0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCkgLyAxMDAwO1xuICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSgoZHQgKyB0aW1lem9uZSkgKiAxMDAwKTtcblxuICAgIGNvbnN0IGRheSA9IGRhdGUuZ2V0VVRDRGF5KCk7XG4gICAgY29uc3QgaG91cnMgPSBkYXRlLmdldFVUQ0hvdXJzKCk7XG4gICAgbGV0IGRhdGV0aW1lID0gZGF0ZS50b1VUQ1N0cmluZygpLnNsaWNlKDAsLTcpO1xuICAgIHJldHVybiB7ZGF0ZXRpbWUsIGRheSwgaG91cnN9O1xufVxuXG5mdW5jdGlvbiBtb3N0Q29tbW9uQ29uZChhcnJheSl7XG4gICAgLy9Hb2VzIHRocm91Z2ggZWFjaCBob3VyIGFuZCBmaW5kcyBtb3N0IGNvbW1vbiB3ZWF0aGVyIGNvbmRpdGlvbiBmb3IgdGhlIGRheVxuICAgIGlmKGFycmF5Lmxlbmd0aCA9PSAwKSByZXR1cm4gbnVsbDtcbiAgICBsZXQgbW9kZU1hcCA9IHt9O1xuICAgIGxldCBtYXhFbCA9IGFycmF5WzBdLndlYXRoZXJbMF0ubWFpbiwgbWF4Q291bnQgPSAxO1xuICAgIGZvcihsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKyl7XG4gICAgICAgIGxldCBlbCA9IGFycmF5W2ldLndlYXRoZXJbMF0ubWFpbjtcbiAgICAgICAgaWYobW9kZU1hcFtlbF0gPT0gbnVsbCkgbW9kZU1hcFtlbF0gPSAxO1xuICAgICAgICBlbHNlIG1vZGVNYXBbZWxdKys7ICBcbiAgICAgICAgaWYobW9kZU1hcFtlbF0gPiBtYXhDb3VudCl7XG4gICAgICAgICAgICBtYXhFbCA9IGVsO1xuICAgICAgICAgICAgbWF4Q291bnQgPSBtb2RlTWFwW2VsXTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIG1heEVsO1xufVxuXG5mdW5jdGlvbiBnZXREYXlPZldlZWsoKXtcbiAgICByZXR1cm4gW2BTdW5gLCAnTW9uJywgJ1R1ZScsICdXZWQnLCAnVGh1JywgJ0ZyaScsICdTYXQnXTtcbn1cblxuZnVuY3Rpb24gZXh0cmFjdERheVdlYXRoZXIobiwgY3VycmVudFdlYXRoZXIsIGZvcmVjYXN0V2VhdGhlciwgdG9kYXlXZWVrZGF5KXtcbiAgICBsZXQgd2Vla2RheTtcbiAgICAvL0dvZXMgdGhyb3VnaCB0aGUgaG91cmx5IGZvcmVjYXN0IGFuZCBnZXRzIGp1c3QgdGhlIGRhdGEgZnJvbSB0aGUgZGVzaXJlZCBkYXlcbiAgICBjb25zdCBkYXkgPSBmb3JlY2FzdFdlYXRoZXIubGlzdC5maWx0ZXIoaXRlbSA9PiB7XG4gICAgICAgIGNvbnN0IHdkID0gZ2V0RGF0ZVRpbWUoY3VycmVudFdlYXRoZXIudGltZXpvbmUsIGl0ZW0uZHQpLmRheTtcbiAgICAgICAgaWYoKHdkID09PSB0b2RheVdlZWtkYXkgKyBuKSB8fCAod2QgPT09IHRvZGF5V2Vla2RheSAtICg3IC0gbikpKXtcbiAgICAgICAgICAgIHdlZWtkYXkgPSB3ZDtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgZGF5LnNvcnQoKGEsYikgPT4gYS5tYWluLnRlbXAgPiBiLm1haW4udGVtcCA/IC0xOiAxKTtcbiAgICBkYXlbMF0ud2QgPSBnZXREYXlPZldlZWsoKVt3ZWVrZGF5XTtcbiAgICByZXR1cm4gZGF5O1xufTtcblxuZnVuY3Rpb24gZ2V0Q3VycmVudFdlYXRoZXIobG9jYXRpb24sIGN1cnJlbnRXZWF0aGVyLCB0b2RheUZ1bGxEYXRlKXtcbiAgICByZXR1cm4ge1xuICAgICAgICBjaXR5OiBsb2NhdGlvbi5uYW1lLFxuICAgICAgICBjb3VudHJ5OiBsb2NhdGlvbi5jb3VudHJ5LFxuICAgICAgICB0aW1lOiB0b2RheUZ1bGxEYXRlLFxuICAgICAgICB0ZW1wOiBjdXJyZW50V2VhdGhlci5tYWluLnRlbXAsXG4gICAgICAgIHRlbXBfbWluOiBjdXJyZW50V2VhdGhlci5tYWluLnRlbXBfbWluLFxuICAgICAgICB0ZW1wX21heDogY3VycmVudFdlYXRoZXIubWFpbi50ZW1wX21heCxcbiAgICAgICAgZmVlbHNfbGlrZTogY3VycmVudFdlYXRoZXIubWFpbi5mZWVsc19saWtlLFxuICAgICAgICBodW1pZGl0eTogY3VycmVudFdlYXRoZXIubWFpbi5odW1pZGl0eSxcbiAgICAgICAgY29uZGl0aW9uOiBjdXJyZW50V2VhdGhlci53ZWF0aGVyWzBdLm1haW4sXG4gICAgICAgIHdpbmRfc3BlZWQ6IGN1cnJlbnRXZWF0aGVyLndpbmQuc3BlZWRcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBnZXRGb3VyRGF5Rm9yZWNhc3QoY3VycmVudFdlYXRoZXIsIGZvcmVjYXN0V2VhdGhlciwgdG9kYXlXZWVrZGF5KXtcbiAgICBsZXQgZm91ckRheUZvcmVjYXN0ID0gW107XG4gICAgZm9yKGxldCBpID0gMTsgaSA8PSA0OyBpKyspe1xuICAgICAgICBjb25zdCBkYXkgPSBleHRyYWN0RGF5V2VhdGhlcihpLCBjdXJyZW50V2VhdGhlciwgZm9yZWNhc3RXZWF0aGVyLCB0b2RheVdlZWtkYXkpO1xuICAgICAgICBmb3VyRGF5Rm9yZWNhc3QucHVzaChcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBkYXk6IGRheVswXS53ZCxcbiAgICAgICAgICAgICAgICBjb25kaXRpb246IG1vc3RDb21tb25Db25kKGRheSksXG4gICAgICAgICAgICAgICAgdGVtcF9tYXg6IGRheVswXS5tYWluLnRlbXAsXG4gICAgICAgICAgICAgICAgdGVtcF9taW46IGRheVtkYXkubGVuZ3RoIC0gMV0ubWFpbi50ZW1wXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfTtcbiAgICByZXR1cm4gZm91ckRheUZvcmVjYXN0O1xufVxuXG5mdW5jdGlvbiBnZXRIb3VybHlGb3JlY2FzdChjdXJyZW50V2VhdGhlciwgZm9yZWNhc3RXZWF0aGVyKXtcbiAgICBsZXQgaG91cmx5Rm9yZWNhc3QgPSBbXTtcbiAgICBmb3JlY2FzdFdlYXRoZXIubGlzdC5mb3JFYWNoKGl0ZW0gPT57XG4gICAgICAgIGNvbnN0IGRhdGVUaW1lID0gZ2V0RGF0ZVRpbWUoY3VycmVudFdlYXRoZXIudGltZXpvbmUsIGl0ZW0uZHQpO1xuICAgICAgICBob3VybHlGb3JlY2FzdC5wdXNoKFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGRheTogZ2V0RGF5T2ZXZWVrKClbZGF0ZVRpbWUuZGF5XSxcbiAgICAgICAgICAgICAgICB0aW1lOiBkYXRlVGltZS5ob3VycyxcbiAgICAgICAgICAgICAgICB0ZW1wOiBpdGVtLm1haW4udGVtcCxcbiAgICAgICAgICAgICAgICBjb25kaXRpb246IGl0ZW0ud2VhdGhlclswXS5tYWluXG4gICAgICAgICAgICB9XG4gICAgICAgIClcbiAgICB9KTtcbiAgICByZXR1cm4gaG91cmx5Rm9yZWNhc3Q7XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NEYXRhKGxvY2F0aW9uLCBjdXJyZW50V2VhdGhlciwgZm9yZWNhc3RXZWF0aGVyKXtcbiAgICBjb25zdCBkYXRlID0gZ2V0RGF0ZVRpbWUoY3VycmVudFdlYXRoZXIudGltZXpvbmUpO1xuICAgIGNvbnN0IHRvZGF5RnVsbERhdGUgPSBkYXRlLmRhdGV0aW1lO1xuICAgIGNvbnN0IHRvZGF5V2Vla2RheSA9IGRhdGUuZGF5O1xuXG4gICAgY29uc3QgY3VycmVudENvbmRpdGlvbnMgPSBnZXRDdXJyZW50V2VhdGhlcihsb2NhdGlvbiwgY3VycmVudFdlYXRoZXIsIHRvZGF5RnVsbERhdGUpOyAgICBcbiAgICBjb25zdCBmb3VyRGF5Rm9yZWNhc3QgPSBnZXRGb3VyRGF5Rm9yZWNhc3QoY3VycmVudFdlYXRoZXIsIGZvcmVjYXN0V2VhdGhlciwgdG9kYXlXZWVrZGF5KTtcbiAgICBjb25zdCBob3VybHlGb3JlY2FzdCA9IGdldEhvdXJseUZvcmVjYXN0KGN1cnJlbnRXZWF0aGVyLCBmb3JlY2FzdFdlYXRoZXIpOyBcbiAgICByZXR1cm4ge2N1cnJlbnRDb25kaXRpb25zLCBmb3VyRGF5Rm9yZWNhc3QsIGhvdXJseUZvcmVjYXN0fTsgIFxufVxuXG5hc3luYyBmdW5jdGlvbiB3ZWF0aGVyRGF0YShzZWFyY2hUZXJtID0gYFRva3lvYCwgdW5pdHMgPSBgTWV0cmljYCl7XG4gICAgdHJ5e1xuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgZ2V0RGF0YShzZWFyY2hUZXJtLCB1bml0cyk7IFxuICAgICAgICByZXR1cm4gcHJvY2Vzc0RhdGEoZGF0YS5sb2NhdGlvbiwgZGF0YS5jdXJyZW50V2VhdGhlciwgZGF0YS5mb3JlY2FzdFdlYXRoZXIpO1xuICAgIH1jYXRjaChlcnIpe1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgd2VhdGhlckRhdGE7IiwiY29uc3QgZXZlbnRzID0ge1xuICAgIGV2ZW50czoge30sXG4gICAgc3Vic2NyaWJlKGV2ZW50TmFtZSwgZm4pIHtcbiAgICAgICAgdGhpcy5ldmVudHNbZXZlbnROYW1lXSA9IHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0gfHwgW107XG4gICAgICAgIHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0ucHVzaChmbik7XG4gICAgfSxcbiAgICB1bnN1YnNjcmliZShldmVudE5hbWUsIGZuKSB7XG4gICAgICAgIGlmICh0aGlzLmV2ZW50c1tldmVudE5hbWVdKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5ldmVudHNbZXZlbnROYW1lXVtpXSA9PT0gZm4pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ldmVudHNbZXZlbnROYW1lXS5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgcHVibGlzaChldmVudE5hbWUsIGRhdGEpIHtcbiAgICAgICAgaWYgKHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0pIHtcbiAgICAgICAgICAgIHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0uZm9yRWFjaCgoZm4pID0+IHtcbiAgICAgICAgICAgICAgICBmbihkYXRhKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgZXZlbnRzOyIsImltcG9ydCBldmVudHMgZnJvbSBcIi4vcHVic3ViLmpzXCI7XG5cbmZ1bmN0aW9uIHN0b3JhZ2VBdmFpbGFibGUodHlwZSkge1xuICAgIGxldCBzdG9yYWdlO1xuICAgIHRyeSB7XG4gICAgICAgIHN0b3JhZ2UgPSB3aW5kb3dbdHlwZV07XG4gICAgICAgIGNvbnN0IHggPSAnX19zdG9yYWdlX3Rlc3RfXyc7XG4gICAgICAgIHN0b3JhZ2Uuc2V0SXRlbSh4LCB4KTtcbiAgICAgICAgc3RvcmFnZS5yZW1vdmVJdGVtKHgpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybiBlIGluc3RhbmNlb2YgRE9NRXhjZXB0aW9uICYmIChcbiAgICAgICAgICAgICAgICAvLyBldmVyeXRoaW5nIGV4Y2VwdCBGaXJlZm94XG4gICAgICAgICAgICAgICAgZS5jb2RlID09PSAyMiB8fFxuICAgICAgICAgICAgICAgIC8vIEZpcmVmb3hcbiAgICAgICAgICAgICAgICBlLmNvZGUgPT09IDEwMTQgfHxcbiAgICAgICAgICAgICAgICAvLyB0ZXN0IG5hbWUgZmllbGQgdG9vLCBiZWNhdXNlIGNvZGUgbWlnaHQgbm90IGJlIHByZXNlbnRcbiAgICAgICAgICAgICAgICAvLyBldmVyeXRoaW5nIGV4Y2VwdCBGaXJlZm94XG4gICAgICAgICAgICAgICAgZS5uYW1lID09PSAnUXVvdGFFeGNlZWRlZEVycm9yJyB8fFxuICAgICAgICAgICAgICAgIC8vIEZpcmVmb3hcbiAgICAgICAgICAgICAgICBlLm5hbWUgPT09ICdOU19FUlJPUl9ET01fUVVPVEFfUkVBQ0hFRCcpICYmXG4gICAgICAgICAgICAvLyBhY2tub3dsZWRnZSBRdW90YUV4Y2VlZGVkRXJyb3Igb25seSBpZiB0aGVyZSdzIHNvbWV0aGluZyBhbHJlYWR5IHN0b3JlZFxuICAgICAgICAgICAgKHN0b3JhZ2UgJiYgc3RvcmFnZS5sZW5ndGggIT09IDApO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdXBkYXRlTG9jYWxTdG9yYWdlKG5hbWUsIGRhdGEpIHtcbiAgICBpZiAoc3RvcmFnZUF2YWlsYWJsZSgnbG9jYWxTdG9yYWdlJykpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0obmFtZSwgSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZ2V0TG9jYWxTdG9yYWdlKGRhdGEpIHtcbiAgICBpZiAoc3RvcmFnZUF2YWlsYWJsZSgnbG9jYWxTdG9yYWdlJykpIHtcbiAgICAgICAgaWYgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKGRhdGEpKSB7XG4gICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShkYXRhKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5ldmVudHMuc3Vic2NyaWJlKCd1cGRhdGVMb2NhbFN0b3JhZ2UnLCAoZGF0YSkgPT4geyB1cGRhdGVMb2NhbFN0b3JhZ2UoZGF0YVswXSwgZGF0YVsxXSkgfSk7XG5cbmV4cG9ydCBkZWZhdWx0IGdldExvY2FsU3RvcmFnZTsiLCJjb25zdCBnZXRDb25kaXRpb25JY29uID0gKGNvbmRpdGlvbikgPT4ge1xuICAgIGlmKGNvbmRpdGlvbi50b0xvd2VyQ2FzZSgpID09PSBgY2xlYXJgKSByZXR1cm4gYHN1bm55YDtcbiAgICBlbHNlIGlmKGNvbmRpdGlvbi50b0xvd2VyQ2FzZSgpID09PSBgY2xvdWRzYCkgcmV0dXJuIGBjbG91ZHlgO1xuICAgIGVsc2UgaWYoY29uZGl0aW9uLnRvTG93ZXJDYXNlKCkgPT09IGByYWluYCkgcmV0dXJuIGByYWlueWA7XG4gICAgZWxzZSBpZihjb25kaXRpb24udG9Mb3dlckNhc2UoKSA9PT0gYHNub3dgKSByZXR1cm4gYGNsb3VkeV9zbm93aW5nYDtcbiAgICBlbHNlIGlmKGNvbmRpdGlvbi50b0xvd2VyQ2FzZSgpID09PSBgZHJpenpsZWApIHJldHVybiBgcmFpbnlgO1xuICAgIGVsc2UgaWYoY29uZGl0aW9uLnRvTG93ZXJDYXNlKCkgPT09IGB0aHVuZGVyc3Rvcm1gKSByZXR1cm4gYHRodW5kZXJzdG9ybWA7XG4gICAgZWxzZSByZXR1cm4gYGZvZ2d5YDtcbn1cblxuY29uc3QgY3VycmVudFdlYXRoZXJPdmVydmlldyA9IChjdXJyZW50V2VhdGhlciwgdW5pdHMpID0+IHtcbiAgICBjb25zdCBjdXJyZW50Q29uZGl0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmN1cnJlbnQtY29uZGl0aW9uYCk7XG4gICAgY29uc3QgY3VycmVudFRlbXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuY3VycmVudC10ZW1wYCk7XG4gICAgY29uc3QgY2l0eSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5jaXR5YCk7XG4gICAgY29uc3QgY291bnRyeSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5jb3VudHJ5YCk7XG4gICAgY29uc3QgaWNvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5jb25kaXRpb24taWNvbmApO1xuICAgIGNvbnN0IG1haW5Vbml0cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5tYWluLXVuaXRzYCk7XG4gICAgY29uc3Qgc2Vjb25kYXJ5VW5pdHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuc2Vjb25kYXJ5LXVuaXRzYCk7XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVEYXRhKCl7XG4gICAgICAgIGN1cnJlbnRDb25kaXRpb24uaW5uZXJUZXh0ID0gY3VycmVudFdlYXRoZXIuY29uZGl0aW9uO1xuICAgICAgICBjdXJyZW50VGVtcC5pbm5lclRleHQgPSBNYXRoLnJvdW5kKGN1cnJlbnRXZWF0aGVyLnRlbXApO1xuICAgICAgICBjaXR5LmlubmVyVGV4dCA9IGN1cnJlbnRXZWF0aGVyLmNpdHkgKyBgIGA7XG4gICAgICAgIGNvdW50cnkuaW5uZXJUZXh0ID0gY3VycmVudFdlYXRoZXIuY291bnRyeTtcbiAgICAgICAgaWNvbi5pbm5lclRleHQgPSBnZXRDb25kaXRpb25JY29uKGN1cnJlbnRXZWF0aGVyLmNvbmRpdGlvbik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2V0VW5pdHMoKXtcbiAgICAgICAgaWYodW5pdHMgPT09IGBNZXRyaWNgKXtcbiAgICAgICAgICAgIG1haW5Vbml0cy5pbm5lclRleHQgPSBgXFx1MDBCMENgO1xuICAgICAgICAgICAgc2Vjb25kYXJ5VW5pdHMuaW5uZXJUZXh0ID0gYFxcdTAwQjBGYDtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBtYWluVW5pdHMuaW5uZXJUZXh0ID0gYFxcdTAwQjBGYDtcbiAgICAgICAgICAgIHNlY29uZGFyeVVuaXRzLmlubmVyVGV4dCA9IGBcXHUwMEIwQ2A7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAoZnVuY3Rpb24gaW5pdCgpe1xuICAgICAgICB1cGRhdGVEYXRhKCk7XG4gICAgICAgIHNldFVuaXRzKCk7XG4gICAgfSkoKTtcbn1cblxuY29uc3QgY3VycmVudFdlYXRoZXJEZXRhaWxzID0gKGN1cnJlbnRXZWF0aGVyLCB1bml0cykgPT4ge1xuICAgIGNvbnN0IHRlbXBNYXggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAudGVtcC1taW4tbWF4YCk7XG4gICAgY29uc3QgZmVlbHNMaWtlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmZlZWxzLWxpa2VgKTtcbiAgICBjb25zdCB0ZW1wVW5pdHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGAudGVtcC11bml0c2ApO1xuICAgIGNvbnN0IGh1bWlkaXR5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmh1bWlkaXR5YCk7XG4gICAgY29uc3Qgd2luZFNwZWVkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLndpbmQtc3BlZWRgKTtcbiAgICBjb25zdCB3aW5kVW5pdHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAud2luZC11bml0c2ApO1xuXG4gICAgdGVtcE1heC5pbm5lclRleHQgPSBgJHtNYXRoLnJvdW5kKGN1cnJlbnRXZWF0aGVyLnRlbXBfbWluKX0vJHtNYXRoLnJvdW5kKGN1cnJlbnRXZWF0aGVyLnRlbXBfbWF4KX1gO1xuICAgIGZlZWxzTGlrZS5pbm5lclRleHQgPSBNYXRoLnJvdW5kKGN1cnJlbnRXZWF0aGVyLmZlZWxzX2xpa2UpO1xuICAgIGh1bWlkaXR5LmlubmVyVGV4dCA9IGN1cnJlbnRXZWF0aGVyLmh1bWlkaXR5ICsgYCVgO1xuXG4gICAgaWYodW5pdHMgPT09IGBNZXRyaWNgKXtcbiAgICAgICAgd2luZFNwZWVkLmlubmVyVGV4dCA9IE1hdGgucm91bmQoY3VycmVudFdlYXRoZXIud2luZF9zcGVlZCAqIDMuNik7XG4gICAgICAgIHdpbmRVbml0cy5pbm5lclRleHQgPSBgIGttaGA7XG4gICAgICAgIHRlbXBVbml0cy5mb3JFYWNoKGVsID0+IGVsLmlubmVyVGV4dCA9IGBcXHUwMEIwQ2ApO1xuICAgIH1lbHNle1xuICAgICAgICB3aW5kU3BlZWQuaW5uZXJUZXh0ID0gTWF0aC5yb3VuZChjdXJyZW50V2VhdGhlci53aW5kX3NwZWVkKTtcbiAgICAgICAgd2luZFVuaXRzLmlubmVyVGV4dCA9IGAgbXBoYDtcbiAgICAgICAgdGVtcFVuaXRzLmZvckVhY2goZWwgPT4gZWwuaW5uZXJUZXh0ID0gYFxcdTAwQjBGYCk7XG4gICAgfVxuICAgIFxufVxuXG5jb25zdCB1cGRhdGVGb3VyRGF5Rm9yZWNhc3QgPSAoZm91ckRheUZvcmVjYXN0LCB1bml0cykgPT4ge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5mb3VyLWRheS1mb3JlY2FzdGApO1xuXG4gICAgZnVuY3Rpb24gY3JlYXRlQ2FyZHMoZGF5T2ZXZWVrLCBtYXhUZW1wLCBtaW5UZW1wLCBjb25kaXRpb24sIHVuaXRzKXtcbiAgICAgICAgY29uc3QgY2FyZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoYGRpdmApO1xuICAgICAgICBjYXJkLmNsYXNzTGlzdC5hZGQoJ2ZvdXJEYXlDYXJkLWNvbnRhaW5lcicpO1xuXG4gICAgICAgIGNvbnN0IGRheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoYHBgKTtcbiAgICAgICAgZGF5LmNsYXNzTGlzdC5hZGQoYGZvdXJEYXlDYXJkLWRheWApO1xuICAgICAgICBkYXkuaW5uZXJUZXh0ID0gZGF5T2ZXZWVrO1xuXG4gICAgICAgIGNvbnN0IG1heFNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGBzcGFuYCk7XG4gICAgICAgIG1heFNwYW4uY2xhc3NMaXN0LmFkZChgZm91ckRheUNhcmQtbWF4YCk7XG4gICAgICAgIGNvbnN0IG1heCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoYHNwYW5gKTtcbiAgICAgICAgbWF4LmlubmVyVGV4dCA9IE1hdGgucm91bmQobWF4VGVtcCk7XG5cbiAgICAgICAgY29uc3QgbWluU3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoYHNwYW5gKTtcbiAgICAgICAgbWluU3Bhbi5jbGFzc0xpc3QuYWRkKGBmb3VyRGF5Q2FyZC1taW5gKTtcbiAgICAgICAgY29uc3QgbWluID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChgc3BhbmApO1xuICAgICAgICBtaW4uaW5uZXJUZXh0ID0gTWF0aC5yb3VuZChtaW5UZW1wKTtcblxuICAgICAgICBjb25zdCBjb25kID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChgc3BhbmApO1xuICAgICAgICBjb25kLmNsYXNzTGlzdC5hZGQoYGZvdXJEYXlDYXJkLWNvbmRpdGlvbmAsIGBtYXRlcmlhbC1zeW1ib2xzLW91dGxpbmVkYCk7XG4gICAgICAgIGNvbmQuaW5uZXJUZXh0ID0gZ2V0Q29uZGl0aW9uSWNvbihjb25kaXRpb24pO1xuXG4gICAgICAgIGNvbnN0IHVuaXRzU3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoYHNwYW5gKTtcbiAgICAgICAgaWYodW5pdHMgPT09IGBNZXRyaWNgKSB1bml0c1NwYW4uaW5uZXJUZXh0ID0gYFxcdTAwQjBDYDtcbiAgICAgICAgZWxzZSB1bml0c1NwYW4uaW5uZXJUZXh0ID0gYFxcdTAwQjBGYDtcblxuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoY2FyZCk7XG4gICAgICAgIGNhcmQuYXBwZW5kQ2hpbGQoZGF5KTtcbiAgICAgICAgY2FyZC5hcHBlbmRDaGlsZChtYXhTcGFuKTtcbiAgICAgICAgbWF4U3Bhbi5hcHBlbmRDaGlsZChtYXgpO1xuICAgICAgICBtYXhTcGFuLmFwcGVuZENoaWxkKHVuaXRzU3Bhbik7XG4gICAgICAgIGNhcmQuYXBwZW5kQ2hpbGQobWluU3Bhbik7XG4gICAgICAgIG1pblNwYW4uYXBwZW5kQ2hpbGQobWluKTtcbiAgICAgICAgbWluU3Bhbi5hcHBlbmRDaGlsZCh1bml0c1NwYW4uY2xvbmVOb2RlKHRydWUpKTtcbiAgICAgICAgY2FyZC5hcHBlbmRDaGlsZChjb25kKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZXNldCgpIHtcbiAgICAgICAgd2hpbGUgKGNvbnRhaW5lci5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICBjb250YWluZXIucmVtb3ZlQ2hpbGQoY29udGFpbmVyLmZpcnN0Q2hpbGQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgKGZ1bmN0aW9uIGluaXQoKXtcbiAgICAgICAgcmVzZXQoKTtcbiAgICAgICAgZm91ckRheUZvcmVjYXN0LmZvckVhY2goZGF5ID0+IHtcbiAgICAgICAgICAgIGNyZWF0ZUNhcmRzKGRheS5kYXksIGRheS50ZW1wX21heCwgZGF5LnRlbXBfbWluLCBkYXkuY29uZGl0aW9uLCB1bml0cyk7XG4gICAgICAgIH0pO1xuICAgIH0pKCk7XG59XG5cbmNvbnN0IHVwZGF0ZUhvdXJseUZvcmVjYXN0ID0gKGhvdXJseUZvcmVjYXN0LCB1bml0cykgPT4ge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5ob3VybHktZm9yZWNhc3RgKTtcblxuICAgIGZ1bmN0aW9uIGZvcm1hdFRpbWUodGltZU9mRGF5KXtcbiAgICAgICAgaWYodGltZU9mRGF5ID4gMTIpIHJldHVybiAodGltZU9mRGF5IC0gMTIpICsgYCBwbWA7XG4gICAgICAgIGVsc2UgcmV0dXJuIHRpbWVPZkRheSArIGAgYW1gO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZUNhcmRzKHRpbWVPZkRheSwgZGF5T2ZXZWVrLCB0ZW1wLCBjb25kaXRpb24sIHVuaXRzKXtcbiAgICAgICAgY29uc3QgY2FyZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoYGRpdmApO1xuICAgICAgICBjYXJkLmNsYXNzTGlzdC5hZGQoJ2hvdXJseUNhcmQtY29udGFpbmVyJyk7XG5cbiAgICAgICAgY29uc3QgdGltZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoYHBgKTtcbiAgICAgICAgdGltZS5jbGFzc0xpc3QuYWRkKGBob3VybHlDYXJkLXRpbWVgKTtcbiAgICAgICAgdGltZS5pbm5lclRleHQgPSBmb3JtYXRUaW1lKHRpbWVPZkRheSk7XG5cbiAgICAgICAgY29uc3QgZGF5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChgcGApO1xuICAgICAgICBkYXkuY2xhc3NMaXN0LmFkZChgaG91cmx5Q2FyZC1kYXlgKTtcbiAgICAgICAgZGF5LmlubmVyVGV4dCA9IGRheU9mV2VlazsgIFxuXG4gICAgICAgIGNvbnN0IHRlbXBTcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChgc3BhbmApO1xuICAgICAgICB0ZW1wU3Bhbi5jbGFzc0xpc3QuYWRkKGBob3VybHlDYXJkLXRlbXBgKTtcbiAgICAgICAgY29uc3QgbWluID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChgc3BhbmApO1xuICAgICAgICBtaW4uaW5uZXJUZXh0ID0gTWF0aC5yb3VuZCh0ZW1wKTtcblxuICAgICAgICBjb25zdCB1bml0c1NwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGBzcGFuYCk7XG4gICAgICAgIGlmKHVuaXRzID09PSBgTWV0cmljYCkgdW5pdHNTcGFuLmlubmVyVGV4dCA9IGBcXHUwMEIwQ2A7XG4gICAgICAgIGVsc2UgdW5pdHNTcGFuLmlubmVyVGV4dCA9IGBcXHUwMEIwRmA7XG5cbiAgICAgICAgY29uc3QgY29uZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoYHNwYW5gKTtcbiAgICAgICAgY29uZC5jbGFzc0xpc3QuYWRkKGBob3VybHlDYXJkLWNvbmRpdGlvbmAsIGBtYXRlcmlhbC1zeW1ib2xzLW91dGxpbmVkYCk7XG4gICAgICAgIGNvbmQuaW5uZXJUZXh0ID0gZ2V0Q29uZGl0aW9uSWNvbihjb25kaXRpb24pO1xuXG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChjYXJkKTtcbiAgICAgICAgY2FyZC5hcHBlbmRDaGlsZCh0aW1lKTtcbiAgICAgICAgY2FyZC5hcHBlbmRDaGlsZChkYXkpO1xuICAgICAgICBjYXJkLmFwcGVuZENoaWxkKHRlbXBTcGFuKTtcbiAgICAgICAgdGVtcFNwYW4uYXBwZW5kQ2hpbGQobWluKTtcbiAgICAgICAgdGVtcFNwYW4uYXBwZW5kQ2hpbGQodW5pdHNTcGFuKTtcbiAgICAgICAgY2FyZC5hcHBlbmRDaGlsZChjb25kKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZXNldCgpIHtcbiAgICAgICAgd2hpbGUgKGNvbnRhaW5lci5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICBjb250YWluZXIucmVtb3ZlQ2hpbGQoY29udGFpbmVyLmZpcnN0Q2hpbGQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgKGZ1bmN0aW9uIGluaXQoKXtcbiAgICAgICAgcmVzZXQoKTtcbiAgICAgICAgaG91cmx5Rm9yZWNhc3QuZm9yRWFjaChkYXkgPT4ge1xuICAgICAgICAgICAgY3JlYXRlQ2FyZHMoZGF5LnRpbWUsIGRheS5kYXksIGRheS50ZW1wLCBkYXkuY29uZGl0aW9uLCB1bml0cyk7XG4gICAgICAgIH0pO1xuICAgIH0pKCk7XG5cbn1cblxuZnVuY3Rpb24gdXBkYXRlRE9NKGN1cnJlbnRXZWF0aGVyLCBmb3VyRGF5Rm9yZWNhc3QsIGhvdXJseUZvcmVjYXN0LCB1bml0cyl7XG4gICAgY3VycmVudFdlYXRoZXJPdmVydmlldyhjdXJyZW50V2VhdGhlciwgdW5pdHMpO1xuICAgIGN1cnJlbnRXZWF0aGVyRGV0YWlscyhjdXJyZW50V2VhdGhlciwgdW5pdHMpO1xuICAgIHVwZGF0ZUZvdXJEYXlGb3JlY2FzdChmb3VyRGF5Rm9yZWNhc3QsIHVuaXRzKTtcbiAgICB1cGRhdGVIb3VybHlGb3JlY2FzdChob3VybHlGb3JlY2FzdCwgdW5pdHMpO1xufVxuXG5leHBvcnQgZGVmYXVsdCB1cGRhdGVET007IiwiYXN5bmMgZnVuY3Rpb24gZ2V0Q3VycmVudFdlYXRoZXIgKGxvY2F0aW9uLCB1bml0cyl7XG4gICAgdHJ5e1xuICAgICAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9hcGkub3BlbndlYXRoZXJtYXAub3JnL2RhdGEvMi41L3dlYXRoZXI/bGF0PSR7bG9jYXRpb24ubGF0fSZsb249JHtsb2NhdGlvbi5sb259JnVuaXRzPSR7dW5pdHN9JmFwcGlkPTI5MDlhNzRhOTI3NDExODJhYzk1MmE5ZDU1OTZiMzQxYDtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIHttb2RlOiBgY29yc2B9KTtcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfWNhdGNoKGVycil7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgfVxufTtcblxuYXN5bmMgZnVuY3Rpb24gZ2V0Rm9yZWNhc3RXZWF0aGVyIChsb2NhdGlvbiwgdW5pdHMpe1xuICAgIHRyeXtcbiAgICAgICAgY29uc3QgdXJsID0gYGh0dHBzOi8vYXBpLm9wZW53ZWF0aGVybWFwLm9yZy9kYXRhLzIuNS9mb3JlY2FzdD9sYXQ9JHtsb2NhdGlvbi5sYXR9Jmxvbj0ke2xvY2F0aW9uLmxvbn0mdW5pdHM9JHt1bml0c30mY250PTQwJmFwcGlkPTI5MDlhNzRhOTI3NDExODJhYzk1MmE5ZDU1OTZiMzQxYDtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIHttb2RlOiBgY29yc2B9KVxuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9Y2F0Y2goZXJyKXtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICB9XG59O1xuXG5hc3luYyBmdW5jdGlvbiBjb252ZXJ0VG9MYXRMb24oc2VhcmNoVGVybSl7XG4gICAgdHJ5e1xuICAgICAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9hcGkub3BlbndlYXRoZXJtYXAub3JnL2dlby8xLjAvZGlyZWN0P3E9JHtzZWFyY2hUZXJtfSZsaW1pdD0xJmFwcGlkPTI5MDlhNzRhOTI3NDExODJhYzk1MmE5ZDU1OTZiMzQxYDtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIHttb2RlOiBgY29yc2B9KTtcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgcmV0dXJuIGRhdGFbMF07XG4gICAgfWNhdGNoKGVycil7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBnZXREYXRhKHNlYXJjaFRlcm0sIHVuaXRzKXtcbiAgICB0cnl7XG4gICAgICAgIGNvbnN0IGxvY2F0aW9uID0gYXdhaXQgY29udmVydFRvTGF0TG9uKHNlYXJjaFRlcm0pO1xuICAgICAgICBjb25zdCBjdXJyZW50V2VhdGhlciA9IGF3YWl0IGdldEN1cnJlbnRXZWF0aGVyKGxvY2F0aW9uLCB1bml0cyk7XG4gICAgICAgIGNvbnN0IGZvcmVjYXN0V2VhdGhlciA9IGF3YWl0IGdldEZvcmVjYXN0V2VhdGhlcihsb2NhdGlvbiwgdW5pdHMpO1xuICAgICAgICByZXR1cm4ge2xvY2F0aW9uLCBjdXJyZW50V2VhdGhlciwgZm9yZWNhc3RXZWF0aGVyfTtcbiAgICB9Y2F0Y2goZXJyKXtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBnZXREYXRhOyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHdlYXRoZXJEYXRhIGZyb20gJy4vcHJvY2Vzc0RhdGEuanMnO1xuaW1wb3J0IHVwZGF0ZURPTSBmcm9tICcuL3VwZGF0ZURPTS5qcyc7XG5pbXBvcnQgZ2V0TG9jYWxTdG9yYWdlIGZyb20gJy4vc3RvcmFnZS5qcyc7XG5pbXBvcnQgZXZlbnRzIGZyb20gJy4vcHVic3ViLmpzJztcblxuXG5jb25zdCBmb3JtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgZm9ybWApO1xuY29uc3Qgc2VhcmNoID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgaW5wdXRbdHlwZT10ZXh0XWApO1xuY29uc3QgdW5pdHNTZWxlY3RvciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5zZWNvbmRhcnktdW5pdHNgKTtcbmNvbnN0IGZvcmVjYXN0U2VsZWN0b3IgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuZm9yZWNhc3Qtc2VsZWN0b3JgKTtcblxuYXN5bmMgZnVuY3Rpb24gdXBkYXRlV2VhdGhlcihzZWFyY2hUZXJtID0gYFRva3lvYCwgdW5pdHMgPSBgTWV0cmljYCl7XG4gICAgdHJ5e1xuICAgICAgICBjb25zdCB7Y3VycmVudENvbmRpdGlvbnMsIGZvdXJEYXlGb3JlY2FzdCwgaG91cmx5Rm9yZWNhc3R9ID0gYXdhaXQgd2VhdGhlckRhdGEoc2VhcmNoVGVybSwgdW5pdHMpO1xuICAgICAgICB1cGRhdGVET00oY3VycmVudENvbmRpdGlvbnMsIGZvdXJEYXlGb3JlY2FzdCwgaG91cmx5Rm9yZWNhc3QsIHVuaXRzKTtcbiAgICAgICAgZXZlbnRzLnB1Ymxpc2goJ3VwZGF0ZUxvY2FsU3RvcmFnZScsIFtgd2VhdGhlci1hcHBgLCB7Y2l0eTogc2VhcmNoVGVybSwgdW5pdHM6IHVuaXRzfV0pO1xuICAgIH1jYXRjaChlcnIpe1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICB3aW5kb3cuYWxlcnQoYENvdWxkIG5vdCBmaW5kIGNpdHkuXFxuWW91ciBzZWFyY2ggbXVzdCBiZSBpbiB0aGUgZm9ybSBvZiBcIkNpdHlcIiwgXCJDaXR5LCBTdGF0ZVwiLCBvciBcIkNpdHksIENvdW50cnlcIi5gKVxuICAgIH1cbn1cblxuLy9GaXJlcyB3aGVuIGEgbmV3IGNpdHkgaXMgc2VhcmNoZWRcbmZvcm0uYWRkRXZlbnRMaXN0ZW5lcihgc3VibWl0YCwgZnVuY3Rpb24oZXZlbnQpe1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgY29uc3Qgc2VhcmNoVGVybSA9IHNlYXJjaC52YWx1ZTtcbiAgICB1cGRhdGVXZWF0aGVyKHNlYXJjaFRlcm0pO1xufSk7XG5cbi8vRmlyZXMgd2hlbiBjbGlja2luZyB0aGUgQyBvciBGIHRvIGNoYW5nZSB1bml0c1xudW5pdHNTZWxlY3Rvci5hZGRFdmVudExpc3RlbmVyKGBjbGlja2AsIGZ1bmN0aW9uKCl7XG4gICAgY29uc3QgbGFzdFNlYXJjaCA9IGdldExvY2FsU3RvcmFnZShgd2VhdGhlci1hcHBgKTtcbiAgICBsZXQgdW5pdHM7XG4gICAgaWYobGFzdFNlYXJjaC51bml0cyA9PT0gYE1ldHJpY2ApIHVuaXRzID0gYEltcGVyaWFsYDtcbiAgICBlbHNlIHVuaXRzID0gYE1ldHJpY2A7XG4gICAgdXBkYXRlV2VhdGhlcihsYXN0U2VhcmNoLmNpdHksIHVuaXRzKTtcbn0pO1xuXG4vL0ZpcmVzIHdoZW4gY2xpY2tpbmcgJ0RhaWx5JyBvciAnSG91cmx5JyB0byBjaGFuZ2UgdGhlIGZvcmVjYXN0IHZpZXdcbmZvcmVjYXN0U2VsZWN0b3IuYWRkRXZlbnRMaXN0ZW5lcihgY2xpY2tgLCBmdW5jdGlvbigpe1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5mb3VyLWRheS1mb3JlY2FzdGApLmNsYXNzTGlzdC50b2dnbGUoYGhpZGVgKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuaG91cmx5LWZvcmVjYXN0YCkuY2xhc3NMaXN0LnRvZ2dsZShgaGlkZWApO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCNkYWlseWApLmNsYXNzTGlzdC50b2dnbGUoYGhpZGVgKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjaG91cmx5YCkuY2xhc3NMaXN0LnRvZ2dsZShgaGlkZWApO1xufSk7XG5cbihmdW5jdGlvbiBpbml0KCl7XG4gICAgaWYoZ2V0TG9jYWxTdG9yYWdlKGB3ZWF0aGVyLWFwcGApKXtcbiAgICAgICAgY29uc3QgbGFzdFNlYXJjaCA9IGdldExvY2FsU3RvcmFnZShgd2VhdGhlci1hcHBgKTtcbiAgICAgICAgdXBkYXRlV2VhdGhlcihsYXN0U2VhcmNoLmNpdHksIGxhc3RTZWFyY2gudW5pdHMpO1xuICAgIH0gZWxzZSB1cGRhdGVXZWF0aGVyKCk7XG59KSgpOyJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==