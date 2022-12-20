/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/API.js":
/*!********************!*\
  !*** ./src/API.js ***!
  \********************/
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

/***/ }),

/***/ "./src/processData.js":
/*!****************************!*\
  !*** ./src/processData.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _API_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./API.js */ "./src/API.js");


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
        const data = await (0,_API_js__WEBPACK_IMPORTED_MODULE_0__["default"])(searchTerm, units); 
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
        //search for last used units
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
    let units = `Metric`;
    if((0,_storage_js__WEBPACK_IMPORTED_MODULE_2__["default"])(`weather-app`)) units = (0,_storage_js__WEBPACK_IMPORTED_MODULE_2__["default"])(`weather-app`).units;
    updateWeather(searchTerm, units);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsb0RBQW9ELFFBQVEsMkRBQVc7QUFDdEYsUUFBUSx5REFBUztBQUNqQixRQUFRLDBEQUFjLHdDQUF3QywrQkFBK0I7QUFDN0YsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLHVEQUFlLHlCQUF5Qix1REFBZTtBQUM5RDtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBLHVCQUF1Qix1REFBZTtBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBLE9BQU8sdURBQWU7QUFDdEIsMkJBQTJCLHVEQUFlO0FBQzFDO0FBQ0EsTUFBTTtBQUNOLENBQUMsSSIsInNvdXJjZXMiOlsid2VicGFjazovL3dlYXRoZXItYXBwLy4vc3JjL0FQSS5qcyIsIndlYnBhY2s6Ly93ZWF0aGVyLWFwcC8uL3NyYy9wcm9jZXNzRGF0YS5qcyIsIndlYnBhY2s6Ly93ZWF0aGVyLWFwcC8uL3NyYy9wdWJzdWIuanMiLCJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvLi9zcmMvc3RvcmFnZS5qcyIsIndlYnBhY2s6Ly93ZWF0aGVyLWFwcC8uL3NyYy91cGRhdGVET00uanMiLCJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL3dlYXRoZXItYXBwL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vd2VhdGhlci1hcHAvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly93ZWF0aGVyLWFwcC8uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJhc3luYyBmdW5jdGlvbiBnZXRDdXJyZW50V2VhdGhlciAobG9jYXRpb24sIHVuaXRzKXtcbiAgICB0cnl7XG4gICAgICAgIGNvbnN0IHVybCA9IGBodHRwczovL2FwaS5vcGVud2VhdGhlcm1hcC5vcmcvZGF0YS8yLjUvd2VhdGhlcj9sYXQ9JHtsb2NhdGlvbi5sYXR9Jmxvbj0ke2xvY2F0aW9uLmxvbn0mdW5pdHM9JHt1bml0c30mYXBwaWQ9MjkwOWE3NGE5Mjc0MTE4MmFjOTUyYTlkNTU5NmIzNDFgO1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwge21vZGU6IGBjb3JzYH0pO1xuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9Y2F0Y2goZXJyKXtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICB9XG59O1xuXG5hc3luYyBmdW5jdGlvbiBnZXRGb3JlY2FzdFdlYXRoZXIgKGxvY2F0aW9uLCB1bml0cyl7XG4gICAgdHJ5e1xuICAgICAgICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9hcGkub3BlbndlYXRoZXJtYXAub3JnL2RhdGEvMi41L2ZvcmVjYXN0P2xhdD0ke2xvY2F0aW9uLmxhdH0mbG9uPSR7bG9jYXRpb24ubG9ufSZ1bml0cz0ke3VuaXRzfSZjbnQ9NDAmYXBwaWQ9MjkwOWE3NGE5Mjc0MTE4MmFjOTUyYTlkNTU5NmIzNDFgO1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwge21vZGU6IGBjb3JzYH0pXG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH1jYXRjaChlcnIpe1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgIH1cbn07XG5cbmFzeW5jIGZ1bmN0aW9uIGNvbnZlcnRUb0xhdExvbihzZWFyY2hUZXJtKXtcbiAgICB0cnl7XG4gICAgICAgIGNvbnN0IHVybCA9IGBodHRwczovL2FwaS5vcGVud2VhdGhlcm1hcC5vcmcvZ2VvLzEuMC9kaXJlY3Q/cT0ke3NlYXJjaFRlcm19JmxpbWl0PTEmYXBwaWQ9MjkwOWE3NGE5Mjc0MTE4MmFjOTUyYTlkNTU5NmIzNDFgO1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwge21vZGU6IGBjb3JzYH0pO1xuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICByZXR1cm4gZGF0YVswXTtcbiAgICB9Y2F0Y2goZXJyKXtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldERhdGEoc2VhcmNoVGVybSwgdW5pdHMpe1xuICAgIHRyeXtcbiAgICAgICAgY29uc3QgbG9jYXRpb24gPSBhd2FpdCBjb252ZXJ0VG9MYXRMb24oc2VhcmNoVGVybSk7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRXZWF0aGVyID0gYXdhaXQgZ2V0Q3VycmVudFdlYXRoZXIobG9jYXRpb24sIHVuaXRzKTtcbiAgICAgICAgY29uc3QgZm9yZWNhc3RXZWF0aGVyID0gYXdhaXQgZ2V0Rm9yZWNhc3RXZWF0aGVyKGxvY2F0aW9uLCB1bml0cyk7XG4gICAgICAgIHJldHVybiB7bG9jYXRpb24sIGN1cnJlbnRXZWF0aGVyLCBmb3JlY2FzdFdlYXRoZXJ9O1xuICAgIH1jYXRjaChlcnIpe1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGdldERhdGE7IiwiaW1wb3J0IGdldERhdGEgZnJvbSAnLi9BUEkuanMnO1xuXG5mdW5jdGlvbiBnZXREYXRlVGltZSh0aW1lem9uZSwgZHQgPSBudWxsKXtcbiAgICAvL2NvbnZlcnRzIHRpbWUgZ2l2ZW4gZnJvbSBvcGVud2VhdGhlciBBUEkgdG8gdGltZSBpbiB0aGUgc2VhcmNoZWQgY2l0eVxuICAgIGlmKCFkdCkgZHQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSAvIDEwMDA7XG4gICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKChkdCArIHRpbWV6b25lKSAqIDEwMDApO1xuXG4gICAgY29uc3QgZGF5ID0gZGF0ZS5nZXRVVENEYXkoKTtcbiAgICBjb25zdCBob3VycyA9IGRhdGUuZ2V0VVRDSG91cnMoKTtcbiAgICBsZXQgZGF0ZXRpbWUgPSBkYXRlLnRvVVRDU3RyaW5nKCkuc2xpY2UoMCwtNyk7XG4gICAgcmV0dXJuIHtkYXRldGltZSwgZGF5LCBob3Vyc307XG59XG5cbmZ1bmN0aW9uIG1vc3RDb21tb25Db25kKGFycmF5KXtcbiAgICAvL0dvZXMgdGhyb3VnaCBlYWNoIGhvdXIgYW5kIGZpbmRzIG1vc3QgY29tbW9uIHdlYXRoZXIgY29uZGl0aW9uIGZvciB0aGUgZGF5XG4gICAgaWYoYXJyYXkubGVuZ3RoID09IDApIHJldHVybiBudWxsO1xuICAgIGxldCBtb2RlTWFwID0ge307XG4gICAgbGV0IG1heEVsID0gYXJyYXlbMF0ud2VhdGhlclswXS5tYWluLCBtYXhDb3VudCA9IDE7XG4gICAgZm9yKGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKXtcbiAgICAgICAgbGV0IGVsID0gYXJyYXlbaV0ud2VhdGhlclswXS5tYWluO1xuICAgICAgICBpZihtb2RlTWFwW2VsXSA9PSBudWxsKSBtb2RlTWFwW2VsXSA9IDE7XG4gICAgICAgIGVsc2UgbW9kZU1hcFtlbF0rKzsgIFxuICAgICAgICBpZihtb2RlTWFwW2VsXSA+IG1heENvdW50KXtcbiAgICAgICAgICAgIG1heEVsID0gZWw7XG4gICAgICAgICAgICBtYXhDb3VudCA9IG1vZGVNYXBbZWxdO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gbWF4RWw7XG59XG5cbmZ1bmN0aW9uIGdldERheU9mV2Vlaygpe1xuICAgIHJldHVybiBbYFN1bmAsICdNb24nLCAnVHVlJywgJ1dlZCcsICdUaHUnLCAnRnJpJywgJ1NhdCddO1xufVxuXG5mdW5jdGlvbiBleHRyYWN0RGF5V2VhdGhlcihuLCBjdXJyZW50V2VhdGhlciwgZm9yZWNhc3RXZWF0aGVyLCB0b2RheVdlZWtkYXkpe1xuICAgIGxldCB3ZWVrZGF5O1xuICAgIC8vR29lcyB0aHJvdWdoIHRoZSBob3VybHkgZm9yZWNhc3QgYW5kIGdldHMganVzdCB0aGUgZGF0YSBmcm9tIHRoZSBkZXNpcmVkIGRheVxuICAgIGNvbnN0IGRheSA9IGZvcmVjYXN0V2VhdGhlci5saXN0LmZpbHRlcihpdGVtID0+IHtcbiAgICAgICAgY29uc3Qgd2QgPSBnZXREYXRlVGltZShjdXJyZW50V2VhdGhlci50aW1lem9uZSwgaXRlbS5kdCkuZGF5O1xuICAgICAgICBpZigod2QgPT09IHRvZGF5V2Vla2RheSArIG4pIHx8ICh3ZCA9PT0gdG9kYXlXZWVrZGF5IC0gKDcgLSBuKSkpe1xuICAgICAgICAgICAgd2Vla2RheSA9IHdkO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBkYXkuc29ydCgoYSxiKSA9PiBhLm1haW4udGVtcCA+IGIubWFpbi50ZW1wID8gLTE6IDEpO1xuICAgIGRheVswXS53ZCA9IGdldERheU9mV2VlaygpW3dlZWtkYXldO1xuICAgIHJldHVybiBkYXk7XG59O1xuXG5mdW5jdGlvbiBnZXRDdXJyZW50V2VhdGhlcihsb2NhdGlvbiwgY3VycmVudFdlYXRoZXIsIHRvZGF5RnVsbERhdGUpe1xuICAgIHJldHVybiB7XG4gICAgICAgIGNpdHk6IGxvY2F0aW9uLm5hbWUsXG4gICAgICAgIGNvdW50cnk6IGxvY2F0aW9uLmNvdW50cnksXG4gICAgICAgIHRpbWU6IHRvZGF5RnVsbERhdGUsXG4gICAgICAgIHRlbXA6IGN1cnJlbnRXZWF0aGVyLm1haW4udGVtcCxcbiAgICAgICAgdGVtcF9taW46IGN1cnJlbnRXZWF0aGVyLm1haW4udGVtcF9taW4sXG4gICAgICAgIHRlbXBfbWF4OiBjdXJyZW50V2VhdGhlci5tYWluLnRlbXBfbWF4LFxuICAgICAgICBmZWVsc19saWtlOiBjdXJyZW50V2VhdGhlci5tYWluLmZlZWxzX2xpa2UsXG4gICAgICAgIGh1bWlkaXR5OiBjdXJyZW50V2VhdGhlci5tYWluLmh1bWlkaXR5LFxuICAgICAgICBjb25kaXRpb246IGN1cnJlbnRXZWF0aGVyLndlYXRoZXJbMF0ubWFpbixcbiAgICAgICAgd2luZF9zcGVlZDogY3VycmVudFdlYXRoZXIud2luZC5zcGVlZFxuICAgIH07XG59XG5cbmZ1bmN0aW9uIGdldEZvdXJEYXlGb3JlY2FzdChjdXJyZW50V2VhdGhlciwgZm9yZWNhc3RXZWF0aGVyLCB0b2RheVdlZWtkYXkpe1xuICAgIGxldCBmb3VyRGF5Rm9yZWNhc3QgPSBbXTtcbiAgICBmb3IobGV0IGkgPSAxOyBpIDw9IDQ7IGkrKyl7XG4gICAgICAgIGNvbnN0IGRheSA9IGV4dHJhY3REYXlXZWF0aGVyKGksIGN1cnJlbnRXZWF0aGVyLCBmb3JlY2FzdFdlYXRoZXIsIHRvZGF5V2Vla2RheSk7XG4gICAgICAgIGZvdXJEYXlGb3JlY2FzdC5wdXNoKFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGRheTogZGF5WzBdLndkLFxuICAgICAgICAgICAgICAgIGNvbmRpdGlvbjogbW9zdENvbW1vbkNvbmQoZGF5KSxcbiAgICAgICAgICAgICAgICB0ZW1wX21heDogZGF5WzBdLm1haW4udGVtcCxcbiAgICAgICAgICAgICAgICB0ZW1wX21pbjogZGF5W2RheS5sZW5ndGggLSAxXS5tYWluLnRlbXBcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9O1xuICAgIHJldHVybiBmb3VyRGF5Rm9yZWNhc3Q7XG59XG5cbmZ1bmN0aW9uIGdldEhvdXJseUZvcmVjYXN0KGN1cnJlbnRXZWF0aGVyLCBmb3JlY2FzdFdlYXRoZXIpe1xuICAgIGxldCBob3VybHlGb3JlY2FzdCA9IFtdO1xuICAgIGZvcmVjYXN0V2VhdGhlci5saXN0LmZvckVhY2goaXRlbSA9PntcbiAgICAgICAgY29uc3QgZGF0ZVRpbWUgPSBnZXREYXRlVGltZShjdXJyZW50V2VhdGhlci50aW1lem9uZSwgaXRlbS5kdCk7XG4gICAgICAgIGhvdXJseUZvcmVjYXN0LnB1c2goXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZGF5OiBnZXREYXlPZldlZWsoKVtkYXRlVGltZS5kYXldLFxuICAgICAgICAgICAgICAgIHRpbWU6IGRhdGVUaW1lLmhvdXJzLFxuICAgICAgICAgICAgICAgIHRlbXA6IGl0ZW0ubWFpbi50ZW1wLFxuICAgICAgICAgICAgICAgIGNvbmRpdGlvbjogaXRlbS53ZWF0aGVyWzBdLm1haW5cbiAgICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgIH0pO1xuICAgIHJldHVybiBob3VybHlGb3JlY2FzdDtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0RhdGEobG9jYXRpb24sIGN1cnJlbnRXZWF0aGVyLCBmb3JlY2FzdFdlYXRoZXIpe1xuICAgIGNvbnN0IGRhdGUgPSBnZXREYXRlVGltZShjdXJyZW50V2VhdGhlci50aW1lem9uZSk7XG4gICAgY29uc3QgdG9kYXlGdWxsRGF0ZSA9IGRhdGUuZGF0ZXRpbWU7XG4gICAgY29uc3QgdG9kYXlXZWVrZGF5ID0gZGF0ZS5kYXk7XG5cbiAgICBjb25zdCBjdXJyZW50Q29uZGl0aW9ucyA9IGdldEN1cnJlbnRXZWF0aGVyKGxvY2F0aW9uLCBjdXJyZW50V2VhdGhlciwgdG9kYXlGdWxsRGF0ZSk7ICAgIFxuICAgIGNvbnN0IGZvdXJEYXlGb3JlY2FzdCA9IGdldEZvdXJEYXlGb3JlY2FzdChjdXJyZW50V2VhdGhlciwgZm9yZWNhc3RXZWF0aGVyLCB0b2RheVdlZWtkYXkpO1xuICAgIGNvbnN0IGhvdXJseUZvcmVjYXN0ID0gZ2V0SG91cmx5Rm9yZWNhc3QoY3VycmVudFdlYXRoZXIsIGZvcmVjYXN0V2VhdGhlcik7IFxuICAgIHJldHVybiB7Y3VycmVudENvbmRpdGlvbnMsIGZvdXJEYXlGb3JlY2FzdCwgaG91cmx5Rm9yZWNhc3R9OyAgXG59XG5cbmFzeW5jIGZ1bmN0aW9uIHdlYXRoZXJEYXRhKHNlYXJjaFRlcm0gPSBgVG9reW9gLCB1bml0cyA9IGBNZXRyaWNgKXtcbiAgICB0cnl7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBnZXREYXRhKHNlYXJjaFRlcm0sIHVuaXRzKTsgXG4gICAgICAgIHJldHVybiBwcm9jZXNzRGF0YShkYXRhLmxvY2F0aW9uLCBkYXRhLmN1cnJlbnRXZWF0aGVyLCBkYXRhLmZvcmVjYXN0V2VhdGhlcik7XG4gICAgfWNhdGNoKGVycil7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCB3ZWF0aGVyRGF0YTsiLCJjb25zdCBldmVudHMgPSB7XG4gICAgZXZlbnRzOiB7fSxcbiAgICBzdWJzY3JpYmUoZXZlbnROYW1lLCBmbikge1xuICAgICAgICB0aGlzLmV2ZW50c1tldmVudE5hbWVdID0gdGhpcy5ldmVudHNbZXZlbnROYW1lXSB8fCBbXTtcbiAgICAgICAgdGhpcy5ldmVudHNbZXZlbnROYW1lXS5wdXNoKGZuKTtcbiAgICB9LFxuICAgIHVuc3Vic2NyaWJlKGV2ZW50TmFtZSwgZm4pIHtcbiAgICAgICAgaWYgKHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0pIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5ldmVudHNbZXZlbnROYW1lXS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmV2ZW50c1tldmVudE5hbWVdW2ldID09PSBmbikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmV2ZW50c1tldmVudE5hbWVdLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBwdWJsaXNoKGV2ZW50TmFtZSwgZGF0YSkge1xuICAgICAgICBpZiAodGhpcy5ldmVudHNbZXZlbnROYW1lXSkge1xuICAgICAgICAgICAgdGhpcy5ldmVudHNbZXZlbnROYW1lXS5mb3JFYWNoKChmbikgPT4ge1xuICAgICAgICAgICAgICAgIGZuKGRhdGEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBldmVudHM7IiwiaW1wb3J0IGV2ZW50cyBmcm9tIFwiLi9wdWJzdWIuanNcIjtcblxuZnVuY3Rpb24gc3RvcmFnZUF2YWlsYWJsZSh0eXBlKSB7XG4gICAgbGV0IHN0b3JhZ2U7XG4gICAgdHJ5IHtcbiAgICAgICAgc3RvcmFnZSA9IHdpbmRvd1t0eXBlXTtcbiAgICAgICAgY29uc3QgeCA9ICdfX3N0b3JhZ2VfdGVzdF9fJztcbiAgICAgICAgc3RvcmFnZS5zZXRJdGVtKHgsIHgpO1xuICAgICAgICBzdG9yYWdlLnJlbW92ZUl0ZW0oeCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIGUgaW5zdGFuY2VvZiBET01FeGNlcHRpb24gJiYgKFxuICAgICAgICAgICAgICAgIC8vIGV2ZXJ5dGhpbmcgZXhjZXB0IEZpcmVmb3hcbiAgICAgICAgICAgICAgICBlLmNvZGUgPT09IDIyIHx8XG4gICAgICAgICAgICAgICAgLy8gRmlyZWZveFxuICAgICAgICAgICAgICAgIGUuY29kZSA9PT0gMTAxNCB8fFxuICAgICAgICAgICAgICAgIC8vIHRlc3QgbmFtZSBmaWVsZCB0b28sIGJlY2F1c2UgY29kZSBtaWdodCBub3QgYmUgcHJlc2VudFxuICAgICAgICAgICAgICAgIC8vIGV2ZXJ5dGhpbmcgZXhjZXB0IEZpcmVmb3hcbiAgICAgICAgICAgICAgICBlLm5hbWUgPT09ICdRdW90YUV4Y2VlZGVkRXJyb3InIHx8XG4gICAgICAgICAgICAgICAgLy8gRmlyZWZveFxuICAgICAgICAgICAgICAgIGUubmFtZSA9PT0gJ05TX0VSUk9SX0RPTV9RVU9UQV9SRUFDSEVEJykgJiZcbiAgICAgICAgICAgIC8vIGFja25vd2xlZGdlIFF1b3RhRXhjZWVkZWRFcnJvciBvbmx5IGlmIHRoZXJlJ3Mgc29tZXRoaW5nIGFscmVhZHkgc3RvcmVkXG4gICAgICAgICAgICAoc3RvcmFnZSAmJiBzdG9yYWdlLmxlbmd0aCAhPT0gMCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiB1cGRhdGVMb2NhbFN0b3JhZ2UobmFtZSwgZGF0YSkge1xuICAgIGlmIChzdG9yYWdlQXZhaWxhYmxlKCdsb2NhbFN0b3JhZ2UnKSkge1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShuYW1lLCBKU09OLnN0cmluZ2lmeShkYXRhKSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBnZXRMb2NhbFN0b3JhZ2UoZGF0YSkge1xuICAgIGlmIChzdG9yYWdlQXZhaWxhYmxlKCdsb2NhbFN0b3JhZ2UnKSkge1xuICAgICAgICBpZiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oZGF0YSkpIHtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKGRhdGEpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbmV2ZW50cy5zdWJzY3JpYmUoJ3VwZGF0ZUxvY2FsU3RvcmFnZScsIChkYXRhKSA9PiB7IHVwZGF0ZUxvY2FsU3RvcmFnZShkYXRhWzBdLCBkYXRhWzFdKSB9KTtcblxuZXhwb3J0IGRlZmF1bHQgZ2V0TG9jYWxTdG9yYWdlOyIsImNvbnN0IGdldENvbmRpdGlvbkljb24gPSAoY29uZGl0aW9uKSA9PiB7XG4gICAgaWYoY29uZGl0aW9uLnRvTG93ZXJDYXNlKCkgPT09IGBjbGVhcmApIHJldHVybiBgc3VubnlgO1xuICAgIGVsc2UgaWYoY29uZGl0aW9uLnRvTG93ZXJDYXNlKCkgPT09IGBjbG91ZHNgKSByZXR1cm4gYGNsb3VkeWA7XG4gICAgZWxzZSBpZihjb25kaXRpb24udG9Mb3dlckNhc2UoKSA9PT0gYHJhaW5gKSByZXR1cm4gYHJhaW55YDtcbiAgICBlbHNlIGlmKGNvbmRpdGlvbi50b0xvd2VyQ2FzZSgpID09PSBgc25vd2ApIHJldHVybiBgY2xvdWR5X3Nub3dpbmdgO1xuICAgIGVsc2UgaWYoY29uZGl0aW9uLnRvTG93ZXJDYXNlKCkgPT09IGBkcml6emxlYCkgcmV0dXJuIGByYWlueWA7XG4gICAgZWxzZSBpZihjb25kaXRpb24udG9Mb3dlckNhc2UoKSA9PT0gYHRodW5kZXJzdG9ybWApIHJldHVybiBgdGh1bmRlcnN0b3JtYDtcbiAgICBlbHNlIHJldHVybiBgZm9nZ3lgO1xufVxuXG5jb25zdCBjdXJyZW50V2VhdGhlck92ZXJ2aWV3ID0gKGN1cnJlbnRXZWF0aGVyLCB1bml0cykgPT4ge1xuICAgIGNvbnN0IGN1cnJlbnRDb25kaXRpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuY3VycmVudC1jb25kaXRpb25gKTtcbiAgICBjb25zdCBjdXJyZW50VGVtcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5jdXJyZW50LXRlbXBgKTtcbiAgICBjb25zdCBjaXR5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmNpdHlgKTtcbiAgICBjb25zdCBjb3VudHJ5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmNvdW50cnlgKTtcbiAgICBjb25zdCBpY29uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmNvbmRpdGlvbi1pY29uYCk7XG4gICAgY29uc3QgbWFpblVuaXRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLm1haW4tdW5pdHNgKTtcbiAgICBjb25zdCBzZWNvbmRhcnlVbml0cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5zZWNvbmRhcnktdW5pdHNgKTtcblxuICAgIGZ1bmN0aW9uIHVwZGF0ZURhdGEoKXtcbiAgICAgICAgY3VycmVudENvbmRpdGlvbi5pbm5lclRleHQgPSBjdXJyZW50V2VhdGhlci5jb25kaXRpb247XG4gICAgICAgIGN1cnJlbnRUZW1wLmlubmVyVGV4dCA9IE1hdGgucm91bmQoY3VycmVudFdlYXRoZXIudGVtcCk7XG4gICAgICAgIGNpdHkuaW5uZXJUZXh0ID0gY3VycmVudFdlYXRoZXIuY2l0eSArIGAgYDtcbiAgICAgICAgY291bnRyeS5pbm5lclRleHQgPSBjdXJyZW50V2VhdGhlci5jb3VudHJ5O1xuICAgICAgICBpY29uLmlubmVyVGV4dCA9IGdldENvbmRpdGlvbkljb24oY3VycmVudFdlYXRoZXIuY29uZGl0aW9uKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZXRVbml0cygpe1xuICAgICAgICBpZih1bml0cyA9PT0gYE1ldHJpY2Ape1xuICAgICAgICAgICAgbWFpblVuaXRzLmlubmVyVGV4dCA9IGBcXHUwMEIwQ2A7XG4gICAgICAgICAgICBzZWNvbmRhcnlVbml0cy5pbm5lclRleHQgPSBgXFx1MDBCMEZgO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIG1haW5Vbml0cy5pbm5lclRleHQgPSBgXFx1MDBCMEZgO1xuICAgICAgICAgICAgc2Vjb25kYXJ5VW5pdHMuaW5uZXJUZXh0ID0gYFxcdTAwQjBDYDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIChmdW5jdGlvbiBpbml0KCl7XG4gICAgICAgIHVwZGF0ZURhdGEoKTtcbiAgICAgICAgc2V0VW5pdHMoKTtcbiAgICB9KSgpO1xufVxuXG5jb25zdCBjdXJyZW50V2VhdGhlckRldGFpbHMgPSAoY3VycmVudFdlYXRoZXIsIHVuaXRzKSA9PiB7XG4gICAgY29uc3QgdGVtcE1heCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC50ZW1wLW1pbi1tYXhgKTtcbiAgICBjb25zdCBmZWVsc0xpa2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuZmVlbHMtbGlrZWApO1xuICAgIGNvbnN0IHRlbXBVbml0cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYC50ZW1wLXVuaXRzYCk7XG4gICAgY29uc3QgaHVtaWRpdHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuaHVtaWRpdHlgKTtcbiAgICBjb25zdCB3aW5kU3BlZWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAud2luZC1zcGVlZGApO1xuICAgIGNvbnN0IHdpbmRVbml0cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC53aW5kLXVuaXRzYCk7XG5cbiAgICB0ZW1wTWF4LmlubmVyVGV4dCA9IGAke01hdGgucm91bmQoY3VycmVudFdlYXRoZXIudGVtcF9taW4pfS8ke01hdGgucm91bmQoY3VycmVudFdlYXRoZXIudGVtcF9tYXgpfWA7XG4gICAgZmVlbHNMaWtlLmlubmVyVGV4dCA9IE1hdGgucm91bmQoY3VycmVudFdlYXRoZXIuZmVlbHNfbGlrZSk7XG4gICAgaHVtaWRpdHkuaW5uZXJUZXh0ID0gY3VycmVudFdlYXRoZXIuaHVtaWRpdHkgKyBgJWA7XG5cbiAgICBpZih1bml0cyA9PT0gYE1ldHJpY2Ape1xuICAgICAgICB3aW5kU3BlZWQuaW5uZXJUZXh0ID0gTWF0aC5yb3VuZChjdXJyZW50V2VhdGhlci53aW5kX3NwZWVkICogMy42KTtcbiAgICAgICAgd2luZFVuaXRzLmlubmVyVGV4dCA9IGAga21oYDtcbiAgICAgICAgdGVtcFVuaXRzLmZvckVhY2goZWwgPT4gZWwuaW5uZXJUZXh0ID0gYFxcdTAwQjBDYCk7XG4gICAgfWVsc2V7XG4gICAgICAgIHdpbmRTcGVlZC5pbm5lclRleHQgPSBNYXRoLnJvdW5kKGN1cnJlbnRXZWF0aGVyLndpbmRfc3BlZWQpO1xuICAgICAgICB3aW5kVW5pdHMuaW5uZXJUZXh0ID0gYCBtcGhgO1xuICAgICAgICB0ZW1wVW5pdHMuZm9yRWFjaChlbCA9PiBlbC5pbm5lclRleHQgPSBgXFx1MDBCMEZgKTtcbiAgICB9XG4gICAgXG59XG5cbmNvbnN0IHVwZGF0ZUZvdXJEYXlGb3JlY2FzdCA9IChmb3VyRGF5Rm9yZWNhc3QsIHVuaXRzKSA9PiB7XG4gICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmZvdXItZGF5LWZvcmVjYXN0YCk7XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVDYXJkcyhkYXlPZldlZWssIG1heFRlbXAsIG1pblRlbXAsIGNvbmRpdGlvbiwgdW5pdHMpe1xuICAgICAgICBjb25zdCBjYXJkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChgZGl2YCk7XG4gICAgICAgIGNhcmQuY2xhc3NMaXN0LmFkZCgnZm91ckRheUNhcmQtY29udGFpbmVyJyk7XG5cbiAgICAgICAgY29uc3QgZGF5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChgcGApO1xuICAgICAgICBkYXkuY2xhc3NMaXN0LmFkZChgZm91ckRheUNhcmQtZGF5YCk7XG4gICAgICAgIGRheS5pbm5lclRleHQgPSBkYXlPZldlZWs7XG5cbiAgICAgICAgY29uc3QgbWF4U3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoYHNwYW5gKTtcbiAgICAgICAgbWF4U3Bhbi5jbGFzc0xpc3QuYWRkKGBmb3VyRGF5Q2FyZC1tYXhgKTtcbiAgICAgICAgY29uc3QgbWF4ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChgc3BhbmApO1xuICAgICAgICBtYXguaW5uZXJUZXh0ID0gTWF0aC5yb3VuZChtYXhUZW1wKTtcblxuICAgICAgICBjb25zdCBtaW5TcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChgc3BhbmApO1xuICAgICAgICBtaW5TcGFuLmNsYXNzTGlzdC5hZGQoYGZvdXJEYXlDYXJkLW1pbmApO1xuICAgICAgICBjb25zdCBtaW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGBzcGFuYCk7XG4gICAgICAgIG1pbi5pbm5lclRleHQgPSBNYXRoLnJvdW5kKG1pblRlbXApO1xuXG4gICAgICAgIGNvbnN0IGNvbmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGBzcGFuYCk7XG4gICAgICAgIGNvbmQuY2xhc3NMaXN0LmFkZChgZm91ckRheUNhcmQtY29uZGl0aW9uYCwgYG1hdGVyaWFsLXN5bWJvbHMtb3V0bGluZWRgKTtcbiAgICAgICAgY29uZC5pbm5lclRleHQgPSBnZXRDb25kaXRpb25JY29uKGNvbmRpdGlvbik7XG5cbiAgICAgICAgY29uc3QgdW5pdHNTcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChgc3BhbmApO1xuICAgICAgICBpZih1bml0cyA9PT0gYE1ldHJpY2ApIHVuaXRzU3Bhbi5pbm5lclRleHQgPSBgXFx1MDBCMENgO1xuICAgICAgICBlbHNlIHVuaXRzU3Bhbi5pbm5lclRleHQgPSBgXFx1MDBCMEZgO1xuXG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChjYXJkKTtcbiAgICAgICAgY2FyZC5hcHBlbmRDaGlsZChkYXkpO1xuICAgICAgICBjYXJkLmFwcGVuZENoaWxkKG1heFNwYW4pO1xuICAgICAgICBtYXhTcGFuLmFwcGVuZENoaWxkKG1heCk7XG4gICAgICAgIG1heFNwYW4uYXBwZW5kQ2hpbGQodW5pdHNTcGFuKTtcbiAgICAgICAgY2FyZC5hcHBlbmRDaGlsZChtaW5TcGFuKTtcbiAgICAgICAgbWluU3Bhbi5hcHBlbmRDaGlsZChtaW4pO1xuICAgICAgICBtaW5TcGFuLmFwcGVuZENoaWxkKHVuaXRzU3Bhbi5jbG9uZU5vZGUodHJ1ZSkpO1xuICAgICAgICBjYXJkLmFwcGVuZENoaWxkKGNvbmQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgICAgICB3aGlsZSAoY29udGFpbmVyLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChjb250YWluZXIuZmlyc3RDaGlsZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAoZnVuY3Rpb24gaW5pdCgpe1xuICAgICAgICByZXNldCgpO1xuICAgICAgICBmb3VyRGF5Rm9yZWNhc3QuZm9yRWFjaChkYXkgPT4ge1xuICAgICAgICAgICAgY3JlYXRlQ2FyZHMoZGF5LmRheSwgZGF5LnRlbXBfbWF4LCBkYXkudGVtcF9taW4sIGRheS5jb25kaXRpb24sIHVuaXRzKTtcbiAgICAgICAgfSk7XG4gICAgfSkoKTtcbn1cblxuY29uc3QgdXBkYXRlSG91cmx5Rm9yZWNhc3QgPSAoaG91cmx5Rm9yZWNhc3QsIHVuaXRzKSA9PiB7XG4gICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmhvdXJseS1mb3JlY2FzdGApO1xuXG4gICAgZnVuY3Rpb24gZm9ybWF0VGltZSh0aW1lT2ZEYXkpe1xuICAgICAgICBpZih0aW1lT2ZEYXkgPiAxMikgcmV0dXJuICh0aW1lT2ZEYXkgLSAxMikgKyBgIHBtYDtcbiAgICAgICAgZWxzZSBpZih0aW1lT2ZEYXkgPT09IDEyKSByZXR1cm4gYDEyIHBtYDtcbiAgICAgICAgZWxzZSBpZih0aW1lT2ZEYXkgPT09IDApIHJldHVybiBgMTIgYW1gO1xuICAgICAgICBlbHNlIHJldHVybiB0aW1lT2ZEYXkgKyBgIGFtYDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVDYXJkcyh0aW1lT2ZEYXksIGRheU9mV2VlaywgdGVtcCwgY29uZGl0aW9uLCB1bml0cyl7XG4gICAgICAgIGNvbnN0IGNhcmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGBkaXZgKTtcbiAgICAgICAgY2FyZC5jbGFzc0xpc3QuYWRkKCdob3VybHlDYXJkLWNvbnRhaW5lcicpO1xuXG4gICAgICAgIGNvbnN0IHRpbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGBwYCk7XG4gICAgICAgIHRpbWUuY2xhc3NMaXN0LmFkZChgaG91cmx5Q2FyZC10aW1lYCk7XG4gICAgICAgIHRpbWUuaW5uZXJUZXh0ID0gZm9ybWF0VGltZSh0aW1lT2ZEYXkpO1xuXG4gICAgICAgIGNvbnN0IGRheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoYHBgKTtcbiAgICAgICAgZGF5LmNsYXNzTGlzdC5hZGQoYGhvdXJseUNhcmQtZGF5YCk7XG4gICAgICAgIGRheS5pbm5lclRleHQgPSBkYXlPZldlZWs7ICBcblxuICAgICAgICBjb25zdCB0ZW1wU3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoYHNwYW5gKTtcbiAgICAgICAgdGVtcFNwYW4uY2xhc3NMaXN0LmFkZChgaG91cmx5Q2FyZC10ZW1wYCk7XG4gICAgICAgIGNvbnN0IG1pbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoYHNwYW5gKTtcbiAgICAgICAgbWluLmlubmVyVGV4dCA9IE1hdGgucm91bmQodGVtcCk7XG5cbiAgICAgICAgY29uc3QgdW5pdHNTcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChgc3BhbmApO1xuICAgICAgICBpZih1bml0cyA9PT0gYE1ldHJpY2ApIHVuaXRzU3Bhbi5pbm5lclRleHQgPSBgXFx1MDBCMENgO1xuICAgICAgICBlbHNlIHVuaXRzU3Bhbi5pbm5lclRleHQgPSBgXFx1MDBCMEZgO1xuXG4gICAgICAgIGNvbnN0IGNvbmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGBzcGFuYCk7XG4gICAgICAgIGNvbmQuY2xhc3NMaXN0LmFkZChgaG91cmx5Q2FyZC1jb25kaXRpb25gLCBgbWF0ZXJpYWwtc3ltYm9scy1vdXRsaW5lZGApO1xuICAgICAgICBjb25kLmlubmVyVGV4dCA9IGdldENvbmRpdGlvbkljb24oY29uZGl0aW9uKTtcblxuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoY2FyZCk7XG4gICAgICAgIGNhcmQuYXBwZW5kQ2hpbGQodGltZSk7XG4gICAgICAgIGNhcmQuYXBwZW5kQ2hpbGQoZGF5KTtcbiAgICAgICAgY2FyZC5hcHBlbmRDaGlsZCh0ZW1wU3Bhbik7XG4gICAgICAgIHRlbXBTcGFuLmFwcGVuZENoaWxkKG1pbik7XG4gICAgICAgIHRlbXBTcGFuLmFwcGVuZENoaWxkKHVuaXRzU3Bhbik7XG4gICAgICAgIGNhcmQuYXBwZW5kQ2hpbGQoY29uZCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgICAgIHdoaWxlIChjb250YWluZXIuZmlyc3RDaGlsZCkge1xuICAgICAgICAgICAgY29udGFpbmVyLnJlbW92ZUNoaWxkKGNvbnRhaW5lci5maXJzdENoaWxkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIChmdW5jdGlvbiBpbml0KCl7XG4gICAgICAgIHJlc2V0KCk7XG4gICAgICAgIGhvdXJseUZvcmVjYXN0LmZvckVhY2goZGF5ID0+IHtcbiAgICAgICAgICAgIGNyZWF0ZUNhcmRzKGRheS50aW1lLCBkYXkuZGF5LCBkYXkudGVtcCwgZGF5LmNvbmRpdGlvbiwgdW5pdHMpO1xuICAgICAgICB9KTtcbiAgICB9KSgpO1xuXG59XG5cbmZ1bmN0aW9uIHVwZGF0ZURPTShjdXJyZW50V2VhdGhlciwgZm91ckRheUZvcmVjYXN0LCBob3VybHlGb3JlY2FzdCwgdW5pdHMpe1xuICAgIGN1cnJlbnRXZWF0aGVyT3ZlcnZpZXcoY3VycmVudFdlYXRoZXIsIHVuaXRzKTtcbiAgICBjdXJyZW50V2VhdGhlckRldGFpbHMoY3VycmVudFdlYXRoZXIsIHVuaXRzKTtcbiAgICB1cGRhdGVGb3VyRGF5Rm9yZWNhc3QoZm91ckRheUZvcmVjYXN0LCB1bml0cyk7XG4gICAgdXBkYXRlSG91cmx5Rm9yZWNhc3QoaG91cmx5Rm9yZWNhc3QsIHVuaXRzKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgdXBkYXRlRE9NOyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHdlYXRoZXJEYXRhIGZyb20gJy4vcHJvY2Vzc0RhdGEuanMnO1xuaW1wb3J0IHVwZGF0ZURPTSBmcm9tICcuL3VwZGF0ZURPTS5qcyc7XG5pbXBvcnQgZ2V0TG9jYWxTdG9yYWdlIGZyb20gJy4vc3RvcmFnZS5qcyc7XG5pbXBvcnQgZXZlbnRzIGZyb20gJy4vcHVic3ViLmpzJztcblxuXG5jb25zdCBmb3JtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgZm9ybWApO1xuY29uc3Qgc2VhcmNoID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgaW5wdXRbdHlwZT10ZXh0XWApO1xuY29uc3QgdW5pdHNTZWxlY3RvciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5zZWNvbmRhcnktdW5pdHNgKTtcbmNvbnN0IGZvcmVjYXN0U2VsZWN0b3IgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuZm9yZWNhc3Qtc2VsZWN0b3JgKTtcblxuYXN5bmMgZnVuY3Rpb24gdXBkYXRlV2VhdGhlcihzZWFyY2hUZXJtID0gYFRva3lvYCwgdW5pdHMgPSBgTWV0cmljYCl7XG4gICAgdHJ5e1xuICAgICAgICAvL3NlYXJjaCBmb3IgbGFzdCB1c2VkIHVuaXRzXG4gICAgICAgIGNvbnN0IHtjdXJyZW50Q29uZGl0aW9ucywgZm91ckRheUZvcmVjYXN0LCBob3VybHlGb3JlY2FzdH0gPSBhd2FpdCB3ZWF0aGVyRGF0YShzZWFyY2hUZXJtLCB1bml0cyk7XG4gICAgICAgIHVwZGF0ZURPTShjdXJyZW50Q29uZGl0aW9ucywgZm91ckRheUZvcmVjYXN0LCBob3VybHlGb3JlY2FzdCwgdW5pdHMpO1xuICAgICAgICBldmVudHMucHVibGlzaCgndXBkYXRlTG9jYWxTdG9yYWdlJywgW2B3ZWF0aGVyLWFwcGAsIHtjaXR5OiBzZWFyY2hUZXJtLCB1bml0czogdW5pdHN9XSk7XG4gICAgfWNhdGNoKGVycil7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgIHdpbmRvdy5hbGVydChgQ291bGQgbm90IGZpbmQgY2l0eS5cXG5Zb3VyIHNlYXJjaCBtdXN0IGJlIGluIHRoZSBmb3JtIG9mIFwiQ2l0eVwiLCBcIkNpdHksIFN0YXRlXCIsIG9yIFwiQ2l0eSwgQ291bnRyeVwiLmApXG4gICAgfVxufVxuXG4vL0ZpcmVzIHdoZW4gYSBuZXcgY2l0eSBpcyBzZWFyY2hlZFxuZm9ybS5hZGRFdmVudExpc3RlbmVyKGBzdWJtaXRgLCBmdW5jdGlvbihldmVudCl7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBjb25zdCBzZWFyY2hUZXJtID0gc2VhcmNoLnZhbHVlO1xuICAgIGxldCB1bml0cyA9IGBNZXRyaWNgO1xuICAgIGlmKGdldExvY2FsU3RvcmFnZShgd2VhdGhlci1hcHBgKSkgdW5pdHMgPSBnZXRMb2NhbFN0b3JhZ2UoYHdlYXRoZXItYXBwYCkudW5pdHM7XG4gICAgdXBkYXRlV2VhdGhlcihzZWFyY2hUZXJtLCB1bml0cyk7XG59KTtcblxuLy9GaXJlcyB3aGVuIGNsaWNraW5nIHRoZSBDIG9yIEYgdG8gY2hhbmdlIHVuaXRzXG51bml0c1NlbGVjdG9yLmFkZEV2ZW50TGlzdGVuZXIoYGNsaWNrYCwgZnVuY3Rpb24oKXtcbiAgICBjb25zdCBsYXN0U2VhcmNoID0gZ2V0TG9jYWxTdG9yYWdlKGB3ZWF0aGVyLWFwcGApO1xuICAgIGxldCB1bml0cztcbiAgICBpZihsYXN0U2VhcmNoLnVuaXRzID09PSBgTWV0cmljYCkgdW5pdHMgPSBgSW1wZXJpYWxgO1xuICAgIGVsc2UgdW5pdHMgPSBgTWV0cmljYDtcbiAgICB1cGRhdGVXZWF0aGVyKGxhc3RTZWFyY2guY2l0eSwgdW5pdHMpO1xufSk7XG5cbi8vRmlyZXMgd2hlbiBjbGlja2luZyAnRGFpbHknIG9yICdIb3VybHknIHRvIGNoYW5nZSB0aGUgZm9yZWNhc3Qgdmlld1xuZm9yZWNhc3RTZWxlY3Rvci5hZGRFdmVudExpc3RlbmVyKGBjbGlja2AsIGZ1bmN0aW9uKCl7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLmZvdXItZGF5LWZvcmVjYXN0YCkuY2xhc3NMaXN0LnRvZ2dsZShgaGlkZWApO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5ob3VybHktZm9yZWNhc3RgKS5jbGFzc0xpc3QudG9nZ2xlKGBoaWRlYCk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgI2RhaWx5YCkuY2xhc3NMaXN0LnRvZ2dsZShgaGlkZWApO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCNob3VybHlgKS5jbGFzc0xpc3QudG9nZ2xlKGBoaWRlYCk7XG59KTtcblxuKGZ1bmN0aW9uIGluaXQoKXtcbiAgICBpZihnZXRMb2NhbFN0b3JhZ2UoYHdlYXRoZXItYXBwYCkpe1xuICAgICAgICBjb25zdCBsYXN0U2VhcmNoID0gZ2V0TG9jYWxTdG9yYWdlKGB3ZWF0aGVyLWFwcGApO1xuICAgICAgICB1cGRhdGVXZWF0aGVyKGxhc3RTZWFyY2guY2l0eSwgbGFzdFNlYXJjaC51bml0cyk7XG4gICAgfSBlbHNlIHVwZGF0ZVdlYXRoZXIoKTtcbn0pKCk7Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9