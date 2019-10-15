//Tudor Harries. 15/10/2019.

//Uses cors-anywhere proxy to allow a cross-origin request. Change the openweathermap url to change forecast.
const url = 'https://cors-anywhere.herokuapp.com/https://samples.openweathermap.org/data/2.5/forecast?id=524901&appid=b6907d289e10d714a6e88b30761fae22';

//Store variables globally here.
var globalTemperatureMap = new Map(); 
var globalHumidityMap = new Map();

//Main function to fetch the data from API and coordinate the rest of the functions
function getWeather(){
    fetch(url)
    .then((resp) => resp.json())
    .then(function(data){
        insertCityName(data);
        calculateHighTemperature(data);
        calculateAverageHumidity(data);
        populateTable(globalTemperatureMap, globalHumidityMap);
    })
    .catch(function(error) {
        console.log(error);
    });
}

//Retrieves city name, displays it
function insertCityName(weatherData){
    var cityName = weatherData.city.name;

    document.getElementById('cityName').innerHTML = cityName;
}

//Finds the max. temperature for each date using a map
function calculateHighTemperature(weatherData){
    var temperatureMap = new Map();
    var allData = weatherData.list;

    //Add the 5 dates and their corresponding max. temp to the map 
    for(var i = 0; i<allData.length; i++){
        //Need to convert the unix time to a simple YYYY-MM-DD format
        var date = new Date(allData[i].dt*1000);
        date = date.toISOString().split('T')[0];
        // Use first temp as default max. temp
        if(!temperatureMap.has(date)){
            temperatureMap.set(date, allData[i].main.temp_max);
        }
        else{
            if(allData[i].main.temp_max > temperatureMap.get(date)){
                temperatureMap.set(date, allData[i].main.temp_max);
            }
        }
    }

    //Set the global variable
    globalTemperatureMap = temperatureMap;
}

//Finds the average humidity for each day
function calculateAverageHumidity(weatherData){
    var humidityMap = new Map();
    var allData = weatherData.list;
    //To keep track of the number of humidities in the sum (used for calculating avg.)
    var dateCounter = 0;
    //To count how many days there have been (in order to set the lastDate var)
    var dayCounter = 0;
    //Need to record what the 5th date was
    var lastDate;

    //Add the 5 dates to the map and sum the humidities for each date
    for(var i = 0; i<allData.length; i++){
        //Need to convert unix date to simple YYYY-MM-DD format
        var date = new Date(allData[i].dt*1000);
        date = date.toISOString().split('T')[0];
        if(!humidityMap.has(date)){
            //Set the final date var
            if(dayCounter === 5){
                lastDate = date;
            } else{
                dayCounter++;
            }
            //We know that all humidities for previous date have been summed, so can safely calculate avg.
            if(humidityMap.size > 0){
                var previousDate = new Date(allData[i-1].dt*1000);
                previousDate = previousDate.toISOString().split('T')[0];
                humidityMap.set(previousDate, (humidityMap.get(previousDate) / dateCounter));
                dateCounter = 0;
            }
            humidityMap.set(date, allData[i].main.humidity);
            dateCounter = 1;
        }
        //If it's not the first time the date has appeared, keep summing until we can safely calculate avg.
        else {
            humidityMap.set(date, (humidityMap.get(date) + allData[i].main.humidity));
            dateCounter++;
        }
    }

    //Calculate the average for the final date
    humidityMap.set(lastDate, (humidityMap.get(lastDate) / dateCounter));

    //Set the global variable
    globalHumidityMap = humidityMap;
}

//Populates the table with dates, max. temps, and avg. humidities
function populateTable(temperatureMap, humidityMap){
    var table = document.getElementById('dataTable');

    //Iterate through temperature map and put dates and temps in the table
    for(const[k,v] of temperatureMap){
        var row = table.insertRow();
        var date = k;
        var temperature = v;
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);

        cell1.innerHTML = date;
        cell2.innerHTML = temperature.toFixed(2);
    }
    
    //Need a counter to point to the correct row
    var counter = 1;
    //Iterate through the humidity map and put avg. humidities in the table
    for(const v of humidityMap.values()){
        var humidity = v;
        var row = table.rows[counter];
        var cell3 = row.insertCell(2);
    
        cell3.innerHTML = humidity.toFixed(2);
        counter++;
    }
}

//Ensures that JS is run after table has loaded.
window.onload = function(){
    this.getWeather();
}


