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
        else if(timeOfDay === 12) return `12 pm`;
        else if(timeOfDay === 0) return `12 am`;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguYnVuZGxlLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFtQzs7QUFFbkM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsa0JBQWtCO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsbUJBQW1CLFFBQVE7QUFDM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjs7QUFFQTtBQUNBO0FBQ0EsMkJBQTJCLHVEQUFPO0FBQ2xDO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQSxpRUFBZSxXQUFXOzs7Ozs7Ozs7Ozs7OztBQ3BIMUI7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSw0QkFBNEIsbUNBQW1DO0FBQy9EO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7O0FBRUEsaUVBQWUsTUFBTTs7Ozs7Ozs7Ozs7Ozs7O0FDekJZOztBQUVqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLDREQUFnQixtQ0FBbUMsc0NBQXNDOztBQUV6RixpRUFBZSxlQUFlOzs7Ozs7Ozs7Ozs7OztBQzNDOUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLDJCQUEyQixvQ0FBb0MsR0FBRyxvQ0FBb0M7QUFDdEc7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxLQUFLO0FBQ0w7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsS0FBSzs7QUFFTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsaUVBQWUsU0FBUzs7Ozs7Ozs7Ozs7Ozs7QUMzTHhCO0FBQ0E7QUFDQSwyRUFBMkUsYUFBYSxPQUFPLGFBQWEsU0FBUyxNQUFNO0FBQzNILDJDQUEyQyxhQUFhO0FBQ3hEO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSw0RUFBNEUsYUFBYSxPQUFPLGFBQWEsU0FBUyxNQUFNO0FBQzVILDJDQUEyQyxhQUFhO0FBQ3hEO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1RUFBdUUsV0FBVztBQUNsRiwyQ0FBMkMsYUFBYTtBQUN4RDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUEsaUVBQWUsT0FBTzs7Ozs7O1VDNUN0QjtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7Ozs7Ozs7O0FDTjJDO0FBQ0o7QUFDSTtBQUNWOzs7QUFHakM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGVBQWUsb0RBQW9ELFFBQVEsMkRBQVc7QUFDdEYsUUFBUSx5REFBUztBQUNqQixRQUFRLDBEQUFjLHdDQUF3QywrQkFBK0I7QUFDN0YsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQSx1QkFBdUIsdURBQWU7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQSxPQUFPLHVEQUFlO0FBQ3RCLDJCQUEyQix1REFBZTtBQUMxQztBQUNBLE1BQU07QUFDTixDQUFDLEkiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly93ZWF0aGVyLWFwcC8uL3NyYy9wcm9jZXNzRGF0YS5qcyIsIndlYnBhY2s6Ly93ZWF0aGVyLWFwcC8uL3NyYy9wdWJzdWIuanMiLCJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvLi9zcmMvc3RvcmFnZS5qcyIsIndlYnBhY2s6Ly93ZWF0aGVyLWFwcC8uL3NyYy91cGRhdGVET00uanMiLCJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvLi9zcmMvd2VhdGhlci5qcyIsIndlYnBhY2s6Ly93ZWF0aGVyLWFwcC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly93ZWF0aGVyLWFwcC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly93ZWF0aGVyLWFwcC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3dlYXRoZXItYXBwLy4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBnZXREYXRhIGZyb20gJy4vd2VhdGhlci5qcyc7XG5cbmZ1bmN0aW9uIGdldERhdGVUaW1lKHRpbWV6b25lLCBkdCA9IG51bGwpe1xuICAgIC8vY29udmVydHMgdGltZSBnaXZlbiBmcm9tIG9wZW53ZWF0aGVyIEFQSSB0byB0aW1lIGluIHRoZSBzZWFyY2hlZCBjaXR5XG4gICAgaWYoIWR0KSBkdCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpIC8gMTAwMDtcbiAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoKGR0ICsgdGltZXpvbmUpICogMTAwMCk7XG5cbiAgICBjb25zdCBkYXkgPSBkYXRlLmdldFVUQ0RheSgpO1xuICAgIGNvbnN0IGhvdXJzID0gZGF0ZS5nZXRVVENIb3VycygpO1xuICAgIGxldCBkYXRldGltZSA9IGRhdGUudG9VVENTdHJpbmcoKS5zbGljZSgwLC03KTtcbiAgICByZXR1cm4ge2RhdGV0aW1lLCBkYXksIGhvdXJzfTtcbn1cblxuZnVuY3Rpb24gbW9zdENvbW1vbkNvbmQoYXJyYXkpe1xuICAgIC8vR29lcyB0aHJvdWdoIGVhY2ggaG91ciBhbmQgZmluZHMgbW9zdCBjb21tb24gd2VhdGhlciBjb25kaXRpb24gZm9yIHRoZSBkYXlcbiAgICBpZihhcnJheS5sZW5ndGggPT0gMCkgcmV0dXJuIG51bGw7XG4gICAgbGV0IG1vZGVNYXAgPSB7fTtcbiAgICBsZXQgbWF4RWwgPSBhcnJheVswXS53ZWF0aGVyWzBdLm1haW4sIG1heENvdW50ID0gMTtcbiAgICBmb3IobGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspe1xuICAgICAgICBsZXQgZWwgPSBhcnJheVtpXS53ZWF0aGVyWzBdLm1haW47XG4gICAgICAgIGlmKG1vZGVNYXBbZWxdID09IG51bGwpIG1vZGVNYXBbZWxdID0gMTtcbiAgICAgICAgZWxzZSBtb2RlTWFwW2VsXSsrOyAgXG4gICAgICAgIGlmKG1vZGVNYXBbZWxdID4gbWF4Q291bnQpe1xuICAgICAgICAgICAgbWF4RWwgPSBlbDtcbiAgICAgICAgICAgIG1heENvdW50ID0gbW9kZU1hcFtlbF07XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBtYXhFbDtcbn1cblxuZnVuY3Rpb24gZ2V0RGF5T2ZXZWVrKCl7XG4gICAgcmV0dXJuIFtgU3VuYCwgJ01vbicsICdUdWUnLCAnV2VkJywgJ1RodScsICdGcmknLCAnU2F0J107XG59XG5cbmZ1bmN0aW9uIGV4dHJhY3REYXlXZWF0aGVyKG4sIGN1cnJlbnRXZWF0aGVyLCBmb3JlY2FzdFdlYXRoZXIsIHRvZGF5V2Vla2RheSl7XG4gICAgbGV0IHdlZWtkYXk7XG4gICAgLy9Hb2VzIHRocm91Z2ggdGhlIGhvdXJseSBmb3JlY2FzdCBhbmQgZ2V0cyBqdXN0IHRoZSBkYXRhIGZyb20gdGhlIGRlc2lyZWQgZGF5XG4gICAgY29uc3QgZGF5ID0gZm9yZWNhc3RXZWF0aGVyLmxpc3QuZmlsdGVyKGl0ZW0gPT4ge1xuICAgICAgICBjb25zdCB3ZCA9IGdldERhdGVUaW1lKGN1cnJlbnRXZWF0aGVyLnRpbWV6b25lLCBpdGVtLmR0KS5kYXk7XG4gICAgICAgIGlmKCh3ZCA9PT0gdG9kYXlXZWVrZGF5ICsgbikgfHwgKHdkID09PSB0b2RheVdlZWtkYXkgLSAoNyAtIG4pKSl7XG4gICAgICAgICAgICB3ZWVrZGF5ID0gd2Q7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGRheS5zb3J0KChhLGIpID0+IGEubWFpbi50ZW1wID4gYi5tYWluLnRlbXAgPyAtMTogMSk7XG4gICAgZGF5WzBdLndkID0gZ2V0RGF5T2ZXZWVrKClbd2Vla2RheV07XG4gICAgcmV0dXJuIGRheTtcbn07XG5cbmZ1bmN0aW9uIGdldEN1cnJlbnRXZWF0aGVyKGxvY2F0aW9uLCBjdXJyZW50V2VhdGhlciwgdG9kYXlGdWxsRGF0ZSl7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY2l0eTogbG9jYXRpb24ubmFtZSxcbiAgICAgICAgY291bnRyeTogbG9jYXRpb24uY291bnRyeSxcbiAgICAgICAgdGltZTogdG9kYXlGdWxsRGF0ZSxcbiAgICAgICAgdGVtcDogY3VycmVudFdlYXRoZXIubWFpbi50ZW1wLFxuICAgICAgICB0ZW1wX21pbjogY3VycmVudFdlYXRoZXIubWFpbi50ZW1wX21pbixcbiAgICAgICAgdGVtcF9tYXg6IGN1cnJlbnRXZWF0aGVyLm1haW4udGVtcF9tYXgsXG4gICAgICAgIGZlZWxzX2xpa2U6IGN1cnJlbnRXZWF0aGVyLm1haW4uZmVlbHNfbGlrZSxcbiAgICAgICAgaHVtaWRpdHk6IGN1cnJlbnRXZWF0aGVyLm1haW4uaHVtaWRpdHksXG4gICAgICAgIGNvbmRpdGlvbjogY3VycmVudFdlYXRoZXIud2VhdGhlclswXS5tYWluLFxuICAgICAgICB3aW5kX3NwZWVkOiBjdXJyZW50V2VhdGhlci53aW5kLnNwZWVkXG4gICAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0Rm91ckRheUZvcmVjYXN0KGN1cnJlbnRXZWF0aGVyLCBmb3JlY2FzdFdlYXRoZXIsIHRvZGF5V2Vla2RheSl7XG4gICAgbGV0IGZvdXJEYXlGb3JlY2FzdCA9IFtdO1xuICAgIGZvcihsZXQgaSA9IDE7IGkgPD0gNDsgaSsrKXtcbiAgICAgICAgY29uc3QgZGF5ID0gZXh0cmFjdERheVdlYXRoZXIoaSwgY3VycmVudFdlYXRoZXIsIGZvcmVjYXN0V2VhdGhlciwgdG9kYXlXZWVrZGF5KTtcbiAgICAgICAgZm91ckRheUZvcmVjYXN0LnB1c2goXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZGF5OiBkYXlbMF0ud2QsXG4gICAgICAgICAgICAgICAgY29uZGl0aW9uOiBtb3N0Q29tbW9uQ29uZChkYXkpLFxuICAgICAgICAgICAgICAgIHRlbXBfbWF4OiBkYXlbMF0ubWFpbi50ZW1wLFxuICAgICAgICAgICAgICAgIHRlbXBfbWluOiBkYXlbZGF5Lmxlbmd0aCAtIDFdLm1haW4udGVtcFxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH07XG4gICAgcmV0dXJuIGZvdXJEYXlGb3JlY2FzdDtcbn1cblxuZnVuY3Rpb24gZ2V0SG91cmx5Rm9yZWNhc3QoY3VycmVudFdlYXRoZXIsIGZvcmVjYXN0V2VhdGhlcil7XG4gICAgbGV0IGhvdXJseUZvcmVjYXN0ID0gW107XG4gICAgZm9yZWNhc3RXZWF0aGVyLmxpc3QuZm9yRWFjaChpdGVtID0+e1xuICAgICAgICBjb25zdCBkYXRlVGltZSA9IGdldERhdGVUaW1lKGN1cnJlbnRXZWF0aGVyLnRpbWV6b25lLCBpdGVtLmR0KTtcbiAgICAgICAgaG91cmx5Rm9yZWNhc3QucHVzaChcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBkYXk6IGdldERheU9mV2VlaygpW2RhdGVUaW1lLmRheV0sXG4gICAgICAgICAgICAgICAgdGltZTogZGF0ZVRpbWUuaG91cnMsXG4gICAgICAgICAgICAgICAgdGVtcDogaXRlbS5tYWluLnRlbXAsXG4gICAgICAgICAgICAgICAgY29uZGl0aW9uOiBpdGVtLndlYXRoZXJbMF0ubWFpblxuICAgICAgICAgICAgfVxuICAgICAgICApXG4gICAgfSk7XG4gICAgcmV0dXJuIGhvdXJseUZvcmVjYXN0O1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzRGF0YShsb2NhdGlvbiwgY3VycmVudFdlYXRoZXIsIGZvcmVjYXN0V2VhdGhlcil7XG4gICAgY29uc3QgZGF0ZSA9IGdldERhdGVUaW1lKGN1cnJlbnRXZWF0aGVyLnRpbWV6b25lKTtcbiAgICBjb25zdCB0b2RheUZ1bGxEYXRlID0gZGF0ZS5kYXRldGltZTtcbiAgICBjb25zdCB0b2RheVdlZWtkYXkgPSBkYXRlLmRheTtcblxuICAgIGNvbnN0IGN1cnJlbnRDb25kaXRpb25zID0gZ2V0Q3VycmVudFdlYXRoZXIobG9jYXRpb24sIGN1cnJlbnRXZWF0aGVyLCB0b2RheUZ1bGxEYXRlKTsgICAgXG4gICAgY29uc3QgZm91ckRheUZvcmVjYXN0ID0gZ2V0Rm91ckRheUZvcmVjYXN0KGN1cnJlbnRXZWF0aGVyLCBmb3JlY2FzdFdlYXRoZXIsIHRvZGF5V2Vla2RheSk7XG4gICAgY29uc3QgaG91cmx5Rm9yZWNhc3QgPSBnZXRIb3VybHlGb3JlY2FzdChjdXJyZW50V2VhdGhlciwgZm9yZWNhc3RXZWF0aGVyKTsgXG4gICAgcmV0dXJuIHtjdXJyZW50Q29uZGl0aW9ucywgZm91ckRheUZvcmVjYXN0LCBob3VybHlGb3JlY2FzdH07ICBcbn1cblxuYXN5bmMgZnVuY3Rpb24gd2VhdGhlckRhdGEoc2VhcmNoVGVybSA9IGBUb2t5b2AsIHVuaXRzID0gYE1ldHJpY2Ape1xuICAgIHRyeXtcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IGdldERhdGEoc2VhcmNoVGVybSwgdW5pdHMpOyBcbiAgICAgICAgcmV0dXJuIHByb2Nlc3NEYXRhKGRhdGEubG9jYXRpb24sIGRhdGEuY3VycmVudFdlYXRoZXIsIGRhdGEuZm9yZWNhc3RXZWF0aGVyKTtcbiAgICB9Y2F0Y2goZXJyKXtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHdlYXRoZXJEYXRhOyIsImNvbnN0IGV2ZW50cyA9IHtcbiAgICBldmVudHM6IHt9LFxuICAgIHN1YnNjcmliZShldmVudE5hbWUsIGZuKSB7XG4gICAgICAgIHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0gPSB0aGlzLmV2ZW50c1tldmVudE5hbWVdIHx8IFtdO1xuICAgICAgICB0aGlzLmV2ZW50c1tldmVudE5hbWVdLnB1c2goZm4pO1xuICAgIH0sXG4gICAgdW5zdWJzY3JpYmUoZXZlbnROYW1lLCBmbikge1xuICAgICAgICBpZiAodGhpcy5ldmVudHNbZXZlbnROYW1lXSkge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmV2ZW50c1tldmVudE5hbWVdLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZXZlbnRzW2V2ZW50TmFtZV1baV0gPT09IGZuKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0uc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHB1Ymxpc2goZXZlbnROYW1lLCBkYXRhKSB7XG4gICAgICAgIGlmICh0aGlzLmV2ZW50c1tldmVudE5hbWVdKSB7XG4gICAgICAgICAgICB0aGlzLmV2ZW50c1tldmVudE5hbWVdLmZvckVhY2goKGZuKSA9PiB7XG4gICAgICAgICAgICAgICAgZm4oZGF0YSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGV2ZW50czsiLCJpbXBvcnQgZXZlbnRzIGZyb20gXCIuL3B1YnN1Yi5qc1wiO1xuXG5mdW5jdGlvbiBzdG9yYWdlQXZhaWxhYmxlKHR5cGUpIHtcbiAgICBsZXQgc3RvcmFnZTtcbiAgICB0cnkge1xuICAgICAgICBzdG9yYWdlID0gd2luZG93W3R5cGVdO1xuICAgICAgICBjb25zdCB4ID0gJ19fc3RvcmFnZV90ZXN0X18nO1xuICAgICAgICBzdG9yYWdlLnNldEl0ZW0oeCwgeCk7XG4gICAgICAgIHN0b3JhZ2UucmVtb3ZlSXRlbSh4KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gZSBpbnN0YW5jZW9mIERPTUV4Y2VwdGlvbiAmJiAoXG4gICAgICAgICAgICAgICAgLy8gZXZlcnl0aGluZyBleGNlcHQgRmlyZWZveFxuICAgICAgICAgICAgICAgIGUuY29kZSA9PT0gMjIgfHxcbiAgICAgICAgICAgICAgICAvLyBGaXJlZm94XG4gICAgICAgICAgICAgICAgZS5jb2RlID09PSAxMDE0IHx8XG4gICAgICAgICAgICAgICAgLy8gdGVzdCBuYW1lIGZpZWxkIHRvbywgYmVjYXVzZSBjb2RlIG1pZ2h0IG5vdCBiZSBwcmVzZW50XG4gICAgICAgICAgICAgICAgLy8gZXZlcnl0aGluZyBleGNlcHQgRmlyZWZveFxuICAgICAgICAgICAgICAgIGUubmFtZSA9PT0gJ1F1b3RhRXhjZWVkZWRFcnJvcicgfHxcbiAgICAgICAgICAgICAgICAvLyBGaXJlZm94XG4gICAgICAgICAgICAgICAgZS5uYW1lID09PSAnTlNfRVJST1JfRE9NX1FVT1RBX1JFQUNIRUQnKSAmJlxuICAgICAgICAgICAgLy8gYWNrbm93bGVkZ2UgUXVvdGFFeGNlZWRlZEVycm9yIG9ubHkgaWYgdGhlcmUncyBzb21ldGhpbmcgYWxyZWFkeSBzdG9yZWRcbiAgICAgICAgICAgIChzdG9yYWdlICYmIHN0b3JhZ2UubGVuZ3RoICE9PSAwKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUxvY2FsU3RvcmFnZShuYW1lLCBkYXRhKSB7XG4gICAgaWYgKHN0b3JhZ2VBdmFpbGFibGUoJ2xvY2FsU3RvcmFnZScpKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKG5hbWUsIEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGdldExvY2FsU3RvcmFnZShkYXRhKSB7XG4gICAgaWYgKHN0b3JhZ2VBdmFpbGFibGUoJ2xvY2FsU3RvcmFnZScpKSB7XG4gICAgICAgIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbShkYXRhKSkge1xuICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oZGF0YSkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuZXZlbnRzLnN1YnNjcmliZSgndXBkYXRlTG9jYWxTdG9yYWdlJywgKGRhdGEpID0+IHsgdXBkYXRlTG9jYWxTdG9yYWdlKGRhdGFbMF0sIGRhdGFbMV0pIH0pO1xuXG5leHBvcnQgZGVmYXVsdCBnZXRMb2NhbFN0b3JhZ2U7IiwiY29uc3QgZ2V0Q29uZGl0aW9uSWNvbiA9IChjb25kaXRpb24pID0+IHtcbiAgICBpZihjb25kaXRpb24udG9Mb3dlckNhc2UoKSA9PT0gYGNsZWFyYCkgcmV0dXJuIGBzdW5ueWA7XG4gICAgZWxzZSBpZihjb25kaXRpb24udG9Mb3dlckNhc2UoKSA9PT0gYGNsb3Vkc2ApIHJldHVybiBgY2xvdWR5YDtcbiAgICBlbHNlIGlmKGNvbmRpdGlvbi50b0xvd2VyQ2FzZSgpID09PSBgcmFpbmApIHJldHVybiBgcmFpbnlgO1xuICAgIGVsc2UgaWYoY29uZGl0aW9uLnRvTG93ZXJDYXNlKCkgPT09IGBzbm93YCkgcmV0dXJuIGBjbG91ZHlfc25vd2luZ2A7XG4gICAgZWxzZSBpZihjb25kaXRpb24udG9Mb3dlckNhc2UoKSA9PT0gYGRyaXp6bGVgKSByZXR1cm4gYHJhaW55YDtcbiAgICBlbHNlIGlmKGNvbmRpdGlvbi50b0xvd2VyQ2FzZSgpID09PSBgdGh1bmRlcnN0b3JtYCkgcmV0dXJuIGB0aHVuZGVyc3Rvcm1gO1xuICAgIGVsc2UgcmV0dXJuIGBmb2dneWA7XG59XG5cbmNvbnN0IGN1cnJlbnRXZWF0aGVyT3ZlcnZpZXcgPSAoY3VycmVudFdlYXRoZXIsIHVuaXRzKSA9PiB7XG4gICAgY29uc3QgY3VycmVudENvbmRpdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5jdXJyZW50LWNvbmRpdGlvbmApO1xuICAgIGNvbnN0IGN1cnJlbnRUZW1wID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmN1cnJlbnQtdGVtcGApO1xuICAgIGNvbnN0IGNpdHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuY2l0eWApO1xuICAgIGNvbnN0IGNvdW50cnkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuY291bnRyeWApO1xuICAgIGNvbnN0IGljb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuY29uZGl0aW9uLWljb25gKTtcbiAgICBjb25zdCBtYWluVW5pdHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAubWFpbi11bml0c2ApO1xuICAgIGNvbnN0IHNlY29uZGFyeVVuaXRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLnNlY29uZGFyeS11bml0c2ApO1xuXG4gICAgZnVuY3Rpb24gdXBkYXRlRGF0YSgpe1xuICAgICAgICBjdXJyZW50Q29uZGl0aW9uLmlubmVyVGV4dCA9IGN1cnJlbnRXZWF0aGVyLmNvbmRpdGlvbjtcbiAgICAgICAgY3VycmVudFRlbXAuaW5uZXJUZXh0ID0gTWF0aC5yb3VuZChjdXJyZW50V2VhdGhlci50ZW1wKTtcbiAgICAgICAgY2l0eS5pbm5lclRleHQgPSBjdXJyZW50V2VhdGhlci5jaXR5ICsgYCBgO1xuICAgICAgICBjb3VudHJ5LmlubmVyVGV4dCA9IGN1cnJlbnRXZWF0aGVyLmNvdW50cnk7XG4gICAgICAgIGljb24uaW5uZXJUZXh0ID0gZ2V0Q29uZGl0aW9uSWNvbihjdXJyZW50V2VhdGhlci5jb25kaXRpb24pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldFVuaXRzKCl7XG4gICAgICAgIGlmKHVuaXRzID09PSBgTWV0cmljYCl7XG4gICAgICAgICAgICBtYWluVW5pdHMuaW5uZXJUZXh0ID0gYFxcdTAwQjBDYDtcbiAgICAgICAgICAgIHNlY29uZGFyeVVuaXRzLmlubmVyVGV4dCA9IGBcXHUwMEIwRmA7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgbWFpblVuaXRzLmlubmVyVGV4dCA9IGBcXHUwMEIwRmA7XG4gICAgICAgICAgICBzZWNvbmRhcnlVbml0cy5pbm5lclRleHQgPSBgXFx1MDBCMENgO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgKGZ1bmN0aW9uIGluaXQoKXtcbiAgICAgICAgdXBkYXRlRGF0YSgpO1xuICAgICAgICBzZXRVbml0cygpO1xuICAgIH0pKCk7XG59XG5cbmNvbnN0IGN1cnJlbnRXZWF0aGVyRGV0YWlscyA9IChjdXJyZW50V2VhdGhlciwgdW5pdHMpID0+IHtcbiAgICBjb25zdCB0ZW1wTWF4ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLnRlbXAtbWluLW1heGApO1xuICAgIGNvbnN0IGZlZWxzTGlrZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5mZWVscy1saWtlYCk7XG4gICAgY29uc3QgdGVtcFVuaXRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgLnRlbXAtdW5pdHNgKTtcbiAgICBjb25zdCBodW1pZGl0eSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5odW1pZGl0eWApO1xuICAgIGNvbnN0IHdpbmRTcGVlZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC53aW5kLXNwZWVkYCk7XG4gICAgY29uc3Qgd2luZFVuaXRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLndpbmQtdW5pdHNgKTtcblxuICAgIHRlbXBNYXguaW5uZXJUZXh0ID0gYCR7TWF0aC5yb3VuZChjdXJyZW50V2VhdGhlci50ZW1wX21pbil9LyR7TWF0aC5yb3VuZChjdXJyZW50V2VhdGhlci50ZW1wX21heCl9YDtcbiAgICBmZWVsc0xpa2UuaW5uZXJUZXh0ID0gTWF0aC5yb3VuZChjdXJyZW50V2VhdGhlci5mZWVsc19saWtlKTtcbiAgICBodW1pZGl0eS5pbm5lclRleHQgPSBjdXJyZW50V2VhdGhlci5odW1pZGl0eSArIGAlYDtcblxuICAgIGlmKHVuaXRzID09PSBgTWV0cmljYCl7XG4gICAgICAgIHdpbmRTcGVlZC5pbm5lclRleHQgPSBNYXRoLnJvdW5kKGN1cnJlbnRXZWF0aGVyLndpbmRfc3BlZWQgKiAzLjYpO1xuICAgICAgICB3aW5kVW5pdHMuaW5uZXJUZXh0ID0gYCBrbWhgO1xuICAgICAgICB0ZW1wVW5pdHMuZm9yRWFjaChlbCA9PiBlbC5pbm5lclRleHQgPSBgXFx1MDBCMENgKTtcbiAgICB9ZWxzZXtcbiAgICAgICAgd2luZFNwZWVkLmlubmVyVGV4dCA9IE1hdGgucm91bmQoY3VycmVudFdlYXRoZXIud2luZF9zcGVlZCk7XG4gICAgICAgIHdpbmRVbml0cy5pbm5lclRleHQgPSBgIG1waGA7XG4gICAgICAgIHRlbXBVbml0cy5mb3JFYWNoKGVsID0+IGVsLmlubmVyVGV4dCA9IGBcXHUwMEIwRmApO1xuICAgIH1cbiAgICBcbn1cblxuY29uc3QgdXBkYXRlRm91ckRheUZvcmVjYXN0ID0gKGZvdXJEYXlGb3JlY2FzdCwgdW5pdHMpID0+IHtcbiAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuZm91ci1kYXktZm9yZWNhc3RgKTtcblxuICAgIGZ1bmN0aW9uIGNyZWF0ZUNhcmRzKGRheU9mV2VlaywgbWF4VGVtcCwgbWluVGVtcCwgY29uZGl0aW9uLCB1bml0cyl7XG4gICAgICAgIGNvbnN0IGNhcmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGBkaXZgKTtcbiAgICAgICAgY2FyZC5jbGFzc0xpc3QuYWRkKCdmb3VyRGF5Q2FyZC1jb250YWluZXInKTtcblxuICAgICAgICBjb25zdCBkYXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGBwYCk7XG4gICAgICAgIGRheS5jbGFzc0xpc3QuYWRkKGBmb3VyRGF5Q2FyZC1kYXlgKTtcbiAgICAgICAgZGF5LmlubmVyVGV4dCA9IGRheU9mV2VlaztcblxuICAgICAgICBjb25zdCBtYXhTcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChgc3BhbmApO1xuICAgICAgICBtYXhTcGFuLmNsYXNzTGlzdC5hZGQoYGZvdXJEYXlDYXJkLW1heGApO1xuICAgICAgICBjb25zdCBtYXggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGBzcGFuYCk7XG4gICAgICAgIG1heC5pbm5lclRleHQgPSBNYXRoLnJvdW5kKG1heFRlbXApO1xuXG4gICAgICAgIGNvbnN0IG1pblNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGBzcGFuYCk7XG4gICAgICAgIG1pblNwYW4uY2xhc3NMaXN0LmFkZChgZm91ckRheUNhcmQtbWluYCk7XG4gICAgICAgIGNvbnN0IG1pbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoYHNwYW5gKTtcbiAgICAgICAgbWluLmlubmVyVGV4dCA9IE1hdGgucm91bmQobWluVGVtcCk7XG5cbiAgICAgICAgY29uc3QgY29uZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoYHNwYW5gKTtcbiAgICAgICAgY29uZC5jbGFzc0xpc3QuYWRkKGBmb3VyRGF5Q2FyZC1jb25kaXRpb25gLCBgbWF0ZXJpYWwtc3ltYm9scy1vdXRsaW5lZGApO1xuICAgICAgICBjb25kLmlubmVyVGV4dCA9IGdldENvbmRpdGlvbkljb24oY29uZGl0aW9uKTtcblxuICAgICAgICBjb25zdCB1bml0c1NwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGBzcGFuYCk7XG4gICAgICAgIGlmKHVuaXRzID09PSBgTWV0cmljYCkgdW5pdHNTcGFuLmlubmVyVGV4dCA9IGBcXHUwMEIwQ2A7XG4gICAgICAgIGVsc2UgdW5pdHNTcGFuLmlubmVyVGV4dCA9IGBcXHUwMEIwRmA7XG5cbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGNhcmQpO1xuICAgICAgICBjYXJkLmFwcGVuZENoaWxkKGRheSk7XG4gICAgICAgIGNhcmQuYXBwZW5kQ2hpbGQobWF4U3Bhbik7XG4gICAgICAgIG1heFNwYW4uYXBwZW5kQ2hpbGQobWF4KTtcbiAgICAgICAgbWF4U3Bhbi5hcHBlbmRDaGlsZCh1bml0c1NwYW4pO1xuICAgICAgICBjYXJkLmFwcGVuZENoaWxkKG1pblNwYW4pO1xuICAgICAgICBtaW5TcGFuLmFwcGVuZENoaWxkKG1pbik7XG4gICAgICAgIG1pblNwYW4uYXBwZW5kQ2hpbGQodW5pdHNTcGFuLmNsb25lTm9kZSh0cnVlKSk7XG4gICAgICAgIGNhcmQuYXBwZW5kQ2hpbGQoY29uZCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgICAgIHdoaWxlIChjb250YWluZXIuZmlyc3RDaGlsZCkge1xuICAgICAgICAgICAgY29udGFpbmVyLnJlbW92ZUNoaWxkKGNvbnRhaW5lci5maXJzdENoaWxkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIChmdW5jdGlvbiBpbml0KCl7XG4gICAgICAgIHJlc2V0KCk7XG4gICAgICAgIGZvdXJEYXlGb3JlY2FzdC5mb3JFYWNoKGRheSA9PiB7XG4gICAgICAgICAgICBjcmVhdGVDYXJkcyhkYXkuZGF5LCBkYXkudGVtcF9tYXgsIGRheS50ZW1wX21pbiwgZGF5LmNvbmRpdGlvbiwgdW5pdHMpO1xuICAgICAgICB9KTtcbiAgICB9KSgpO1xufVxuXG5jb25zdCB1cGRhdGVIb3VybHlGb3JlY2FzdCA9IChob3VybHlGb3JlY2FzdCwgdW5pdHMpID0+IHtcbiAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuaG91cmx5LWZvcmVjYXN0YCk7XG5cbiAgICBmdW5jdGlvbiBmb3JtYXRUaW1lKHRpbWVPZkRheSl7XG4gICAgICAgIGlmKHRpbWVPZkRheSA+IDEyKSByZXR1cm4gKHRpbWVPZkRheSAtIDEyKSArIGAgcG1gO1xuICAgICAgICBlbHNlIGlmKHRpbWVPZkRheSA9PT0gMTIpIHJldHVybiBgMTIgcG1gO1xuICAgICAgICBlbHNlIGlmKHRpbWVPZkRheSA9PT0gMCkgcmV0dXJuIGAxMiBhbWA7XG4gICAgICAgIGVsc2UgcmV0dXJuIHRpbWVPZkRheSArIGAgYW1gO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZUNhcmRzKHRpbWVPZkRheSwgZGF5T2ZXZWVrLCB0ZW1wLCBjb25kaXRpb24sIHVuaXRzKXtcbiAgICAgICAgY29uc3QgY2FyZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoYGRpdmApO1xuICAgICAgICBjYXJkLmNsYXNzTGlzdC5hZGQoJ2hvdXJseUNhcmQtY29udGFpbmVyJyk7XG5cbiAgICAgICAgY29uc3QgdGltZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoYHBgKTtcbiAgICAgICAgdGltZS5jbGFzc0xpc3QuYWRkKGBob3VybHlDYXJkLXRpbWVgKTtcbiAgICAgICAgdGltZS5pbm5lclRleHQgPSBmb3JtYXRUaW1lKHRpbWVPZkRheSk7XG5cbiAgICAgICAgY29uc3QgZGF5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChgcGApO1xuICAgICAgICBkYXkuY2xhc3NMaXN0LmFkZChgaG91cmx5Q2FyZC1kYXlgKTtcbiAgICAgICAgZGF5LmlubmVyVGV4dCA9IGRheU9mV2VlazsgIFxuXG4gICAgICAgIGNvbnN0IHRlbXBTcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChgc3BhbmApO1xuICAgICAgICB0ZW1wU3Bhbi5jbGFzc0xpc3QuYWRkKGBob3VybHlDYXJkLXRlbXBgKTtcbiAgICAgICAgY29uc3QgbWluID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChgc3BhbmApO1xuICAgICAgICBtaW4uaW5uZXJUZXh0ID0gTWF0aC5yb3VuZCh0ZW1wKTtcblxuICAgICAgICBjb25zdCB1bml0c1NwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGBzcGFuYCk7XG4gICAgICAgIGlmKHVuaXRzID09PSBgTWV0cmljYCkgdW5pdHNTcGFuLmlubmVyVGV4dCA9IGBcXHUwMEIwQ2A7XG4gICAgICAgIGVsc2UgdW5pdHNTcGFuLmlubmVyVGV4dCA9IGBcXHUwMEIwRmA7XG5cbiAgICAgICAgY29uc3QgY29uZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoYHNwYW5gKTtcbiAgICAgICAgY29uZC5jbGFzc0xpc3QuYWRkKGBob3VybHlDYXJkLWNvbmRpdGlvbmAsIGBtYXRlcmlhbC1zeW1ib2xzLW91dGxpbmVkYCk7XG4gICAgICAgIGNvbmQuaW5uZXJUZXh0ID0gZ2V0Q29uZGl0aW9uSWNvbihjb25kaXRpb24pO1xuXG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChjYXJkKTtcbiAgICAgICAgY2FyZC5hcHBlbmRDaGlsZCh0aW1lKTtcbiAgICAgICAgY2FyZC5hcHBlbmRDaGlsZChkYXkpO1xuICAgICAgICBjYXJkLmFwcGVuZENoaWxkKHRlbXBTcGFuKTtcbiAgICAgICAgdGVtcFNwYW4uYXBwZW5kQ2hpbGQobWluKTtcbiAgICAgICAgdGVtcFNwYW4uYXBwZW5kQ2hpbGQodW5pdHNTcGFuKTtcbiAgICAgICAgY2FyZC5hcHBlbmRDaGlsZChjb25kKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZXNldCgpIHtcbiAgICAgICAgd2hpbGUgKGNvbnRhaW5lci5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICBjb250YWluZXIucmVtb3ZlQ2hpbGQoY29udGFpbmVyLmZpcnN0Q2hpbGQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgKGZ1bmN0aW9uIGluaXQoKXtcbiAgICAgICAgcmVzZXQoKTtcbiAgICAgICAgaG91cmx5Rm9yZWNhc3QuZm9yRWFjaChkYXkgPT4ge1xuICAgICAgICAgICAgY3JlYXRlQ2FyZHMoZGF5LnRpbWUsIGRheS5kYXksIGRheS50ZW1wLCBkYXkuY29uZGl0aW9uLCB1bml0cyk7XG4gICAgICAgIH0pO1xuICAgIH0pKCk7XG5cbn1cblxuZnVuY3Rpb24gdXBkYXRlRE9NKGN1cnJlbnRXZWF0aGVyLCBmb3VyRGF5Rm9yZWNhc3QsIGhvdXJseUZvcmVjYXN0LCB1bml0cyl7XG4gICAgY3VycmVudFdlYXRoZXJPdmVydmlldyhjdXJyZW50V2VhdGhlciwgdW5pdHMpO1xuICAgIGN1cnJlbnRXZWF0aGVyRGV0YWlscyhjdXJyZW50V2VhdGhlciwgdW5pdHMpO1xuICAgIHVwZGF0ZUZvdXJEYXlGb3JlY2FzdChmb3VyRGF5Rm9yZWNhc3QsIHVuaXRzKTtcbiAgICB1cGRhdGVIb3VybHlGb3JlY2FzdChob3VybHlGb3JlY2FzdCwgdW5pdHMpO1xufVxuXG5leHBvcnQgZGVmYXVsdCB1cGRhdGVET007IiwiYXN5bmMgZnVuY3Rpb24gZ2V0Q3VycmVudFdlYXRoZXIgKGxvY2F0aW9uLCB1bml0cyl7XG4gICAgdHJ5e1xuICAgICAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9hcGkub3BlbndlYXRoZXJtYXAub3JnL2RhdGEvMi41L3dlYXRoZXI/bGF0PSR7bG9jYXRpb24ubGF0fSZsb249JHtsb2NhdGlvbi5sb259JnVuaXRzPSR7dW5pdHN9JmFwcGlkPTI5MDlhNzRhOTI3NDExODJhYzk1MmE5ZDU1OTZiMzQxYDtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIHttb2RlOiBgY29yc2B9KTtcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfWNhdGNoKGVycil7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgfVxufTtcblxuYXN5bmMgZnVuY3Rpb24gZ2V0Rm9yZWNhc3RXZWF0aGVyIChsb2NhdGlvbiwgdW5pdHMpe1xuICAgIHRyeXtcbiAgICAgICAgY29uc3QgdXJsID0gYGh0dHBzOi8vYXBpLm9wZW53ZWF0aGVybWFwLm9yZy9kYXRhLzIuNS9mb3JlY2FzdD9sYXQ9JHtsb2NhdGlvbi5sYXR9Jmxvbj0ke2xvY2F0aW9uLmxvbn0mdW5pdHM9JHt1bml0c30mY250PTQwJmFwcGlkPTI5MDlhNzRhOTI3NDExODJhYzk1MmE5ZDU1OTZiMzQxYDtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIHttb2RlOiBgY29yc2B9KVxuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9Y2F0Y2goZXJyKXtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICB9XG59O1xuXG5hc3luYyBmdW5jdGlvbiBjb252ZXJ0VG9MYXRMb24oc2VhcmNoVGVybSl7XG4gICAgdHJ5e1xuICAgICAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9hcGkub3BlbndlYXRoZXJtYXAub3JnL2dlby8xLjAvZGlyZWN0P3E9JHtzZWFyY2hUZXJtfSZsaW1pdD0xJmFwcGlkPTI5MDlhNzRhOTI3NDExODJhYzk1MmE5ZDU1OTZiMzQxYDtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIHttb2RlOiBgY29yc2B9KTtcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgcmV0dXJuIGRhdGFbMF07XG4gICAgfWNhdGNoKGVycil7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBnZXREYXRhKHNlYXJjaFRlcm0sIHVuaXRzKXtcbiAgICB0cnl7XG4gICAgICAgIGNvbnN0IGxvY2F0aW9uID0gYXdhaXQgY29udmVydFRvTGF0TG9uKHNlYXJjaFRlcm0pO1xuICAgICAgICBjb25zdCBjdXJyZW50V2VhdGhlciA9IGF3YWl0IGdldEN1cnJlbnRXZWF0aGVyKGxvY2F0aW9uLCB1bml0cyk7XG4gICAgICAgIGNvbnN0IGZvcmVjYXN0V2VhdGhlciA9IGF3YWl0IGdldEZvcmVjYXN0V2VhdGhlcihsb2NhdGlvbiwgdW5pdHMpO1xuICAgICAgICByZXR1cm4ge2xvY2F0aW9uLCBjdXJyZW50V2VhdGhlciwgZm9yZWNhc3RXZWF0aGVyfTtcbiAgICB9Y2F0Y2goZXJyKXtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBnZXREYXRhOyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHdlYXRoZXJEYXRhIGZyb20gJy4vcHJvY2Vzc0RhdGEuanMnO1xuaW1wb3J0IHVwZGF0ZURPTSBmcm9tICcuL3VwZGF0ZURPTS5qcyc7XG5pbXBvcnQgZ2V0TG9jYWxTdG9yYWdlIGZyb20gJy4vc3RvcmFnZS5qcyc7XG5pbXBvcnQgZXZlbnRzIGZyb20gJy4vcHVic3ViLmpzJztcblxuXG5jb25zdCBmb3JtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgZm9ybWApO1xuY29uc3Qgc2VhcmNoID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgaW5wdXRbdHlwZT10ZXh0XWApO1xuY29uc3QgdW5pdHNTZWxlY3RvciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5zZWNvbmRhcnktdW5pdHNgKTtcbmNvbnN0IGZvcmVjYXN0U2VsZWN0b3IgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuZm9yZWNhc3Qtc2VsZWN0b3JgKTtcblxuYXN5bmMgZnVuY3Rpb24gdXBkYXRlV2VhdGhlcihzZWFyY2hUZXJtID0gYFRva3lvYCwgdW5pdHMgPSBgTWV0cmljYCl7XG4gICAgdHJ5e1xuICAgICAgICBjb25zdCB7Y3VycmVudENvbmRpdGlvbnMsIGZvdXJEYXlGb3JlY2FzdCwgaG91cmx5Rm9yZWNhc3R9ID0gYXdhaXQgd2VhdGhlckRhdGEoc2VhcmNoVGVybSwgdW5pdHMpO1xuICAgICAgICB1cGRhdGVET00oY3VycmVudENvbmRpdGlvbnMsIGZvdXJEYXlGb3JlY2FzdCwgaG91cmx5Rm9yZWNhc3QsIHVuaXRzKTtcbiAgICAgICAgZXZlbnRzLnB1Ymxpc2goJ3VwZGF0ZUxvY2FsU3RvcmFnZScsIFtgd2VhdGhlci1hcHBgLCB7Y2l0eTogc2VhcmNoVGVybSwgdW5pdHM6IHVuaXRzfV0pO1xuICAgIH1jYXRjaChlcnIpe1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICB3aW5kb3cuYWxlcnQoYENvdWxkIG5vdCBmaW5kIGNpdHkuXFxuWW91ciBzZWFyY2ggbXVzdCBiZSBpbiB0aGUgZm9ybSBvZiBcIkNpdHlcIiwgXCJDaXR5LCBTdGF0ZVwiLCBvciBcIkNpdHksIENvdW50cnlcIi5gKVxuICAgIH1cbn1cblxuLy9GaXJlcyB3aGVuIGEgbmV3IGNpdHkgaXMgc2VhcmNoZWRcbmZvcm0uYWRkRXZlbnRMaXN0ZW5lcihgc3VibWl0YCwgZnVuY3Rpb24oZXZlbnQpe1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgY29uc3Qgc2VhcmNoVGVybSA9IHNlYXJjaC52YWx1ZTtcbiAgICB1cGRhdGVXZWF0aGVyKHNlYXJjaFRlcm0pO1xufSk7XG5cbi8vRmlyZXMgd2hlbiBjbGlja2luZyB0aGUgQyBvciBGIHRvIGNoYW5nZSB1bml0c1xudW5pdHNTZWxlY3Rvci5hZGRFdmVudExpc3RlbmVyKGBjbGlja2AsIGZ1bmN0aW9uKCl7XG4gICAgY29uc3QgbGFzdFNlYXJjaCA9IGdldExvY2FsU3RvcmFnZShgd2VhdGhlci1hcHBgKTtcbiAgICBsZXQgdW5pdHM7XG4gICAgaWYobGFzdFNlYXJjaC51bml0cyA9PT0gYE1ldHJpY2ApIHVuaXRzID0gYEltcGVyaWFsYDtcbiAgICBlbHNlIHVuaXRzID0gYE1ldHJpY2A7XG4gICAgdXBkYXRlV2VhdGhlcihsYXN0U2VhcmNoLmNpdHksIHVuaXRzKTtcbn0pO1xuXG4vL0ZpcmVzIHdoZW4gY2xpY2tpbmcgJ0RhaWx5JyBvciAnSG91cmx5JyB0byBjaGFuZ2UgdGhlIGZvcmVjYXN0IHZpZXdcbmZvcmVjYXN0U2VsZWN0b3IuYWRkRXZlbnRMaXN0ZW5lcihgY2xpY2tgLCBmdW5jdGlvbigpe1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5mb3VyLWRheS1mb3JlY2FzdGApLmNsYXNzTGlzdC50b2dnbGUoYGhpZGVgKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuaG91cmx5LWZvcmVjYXN0YCkuY2xhc3NMaXN0LnRvZ2dsZShgaGlkZWApO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCNkYWlseWApLmNsYXNzTGlzdC50b2dnbGUoYGhpZGVgKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjaG91cmx5YCkuY2xhc3NMaXN0LnRvZ2dsZShgaGlkZWApO1xufSk7XG5cbihmdW5jdGlvbiBpbml0KCl7XG4gICAgaWYoZ2V0TG9jYWxTdG9yYWdlKGB3ZWF0aGVyLWFwcGApKXtcbiAgICAgICAgY29uc3QgbGFzdFNlYXJjaCA9IGdldExvY2FsU3RvcmFnZShgd2VhdGhlci1hcHBgKTtcbiAgICAgICAgdXBkYXRlV2VhdGhlcihsYXN0U2VhcmNoLmNpdHksIGxhc3RTZWFyY2gudW5pdHMpO1xuICAgIH0gZWxzZSB1cGRhdGVXZWF0aGVyKCk7XG59KSgpOyJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==