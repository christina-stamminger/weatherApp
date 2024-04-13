const rootElement = document.getElementById("root");
let formInput; 

//cardDiv
const cardDiv = document.createElement("div");
cardDiv.setAttribute("id", "card");
rootElement.appendChild(cardDiv);

//Favorites
const favoritesBtn = document.createElement('div');    
const favoritesCityArray = []     

// Create a container for autocomplete suggestions
const autocompleteContainer = document.createElement("div");
autocompleteContainer.classList.add("dropdown");

// Create a dropdown (select) element   
const favoritesContainer = document.createElement("div");
favoritesContainer.classList.add("favorites-container");

const labelDropdownFav = document.createElement("label")
const dropdownFavorites = document.createElement('select');
dropdownFavorites.id = "dropdownFavorites";
favoritesContainer.appendChild(labelDropdownFav);
favoritesContainer.appendChild(dropdownFavorites);

//FUNCTION CALLS
createInputField();
geoLocationBtn();
inputFieldEventListener();

// AUTOCOMPLETE
function searchAutocomplete(suggestedName) {
  const searchUrl = "https://api.weatherapi.com/v1/search.json?";
  const apiKey = "9a4f206d38674938b97175154233008";

  const apiUrl = `${searchUrl}key=${apiKey}&q=${suggestedName}`;
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      if (Array.isArray(data)) {
        //because data is no array, otherwise data.map is not a function error
        const suggestions = data.map((item) => ({
          name: item.name,
          country: item.country,
        })); 
        updateAutocompleteSuggestions(suggestions); 
      }
    })
    .catch(error => console.error(error));
}

// FETCH WEATHER DATA
function fetchWeather(cityName, corrCountry) {
  const baseUrl = "https://api.weatherapi.com/v1/current.json?";
  const apiKey = "9a4f206d38674938b97175154233008";

  const apiUrl = `${baseUrl}key=${apiKey}&q=${cityName}&country=${corrCountry}`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      clearWeatherDetails();
      createElements(data);
      addEventListenerFavBtn(data);                   
      displayFavoritesCityWeather(data);
    })
    .catch(error => console.error(error));
}

// EventListener for inputField
function inputFieldEventListener() {
  formInput.addEventListener("input", function () {
    const inputCity = formInput.value;
    if (inputCity) {
      searchAutocomplete(inputCity); // Function call searchAutocomplete
      //fetchWeather(inputCity); // Function call fetchWeather with the input city name
    } else {
      autocompleteContainer.innerHTML = ""; //Clear the content
    }
  });
}

// Function to update autocomplete suggestions
function updateAutocompleteSuggestions(suggestions) {
  autocompleteContainer.innerHTML = ""; 

  suggestions.forEach((suggestion) => {
    const suggestionItem = document.createElement("ul");
    suggestionItem.classList.add("dropdown-content");
    suggestionItem.textContent = `${suggestion.name}, ${suggestion.country}`;
    console.log(suggestionItem);

    suggestionItem.addEventListener("click", function () {
      formInput.value = `${suggestion.name}, ${suggestion.country}`;
      autocompleteContainer.innerHTML = ""; // Clear suggestions after selection
      fetchWeather(formInput.value); 
    }); 
    autocompleteContainer.appendChild(suggestionItem);
  });
}

// Function clear displayed weather data                    
function clearWeatherDetails() {
  const weatherDataDiv = document.querySelector('.weatherData');
  const detailsContainerDiv = document.querySelector('.detailsContainer');

  if (weatherDataDiv) {
      weatherDataDiv.remove();
  }

  if (detailsContainerDiv) {
      detailsContainerDiv.remove();
  }
}

// Function to create input field
function createInputField() {
  const form = document.createElement("form");
  form.id = "form";

  const formLabel = document.createElement("label");
  formLabel.textContent = "Select the city: ";
  formLabel.id = "formlabel";

  formInput = document.createElement("input");
  formInput.type = "select";
  formInput.id = "formInput";
  formInput.placeholder = "E.g. London, Sydney, Berlin";
  formInput.setAttribute("autocomplete", "off");

  const inputContainer = document.createElement("div");
  inputContainer.classList.add("input-container");

  inputContainer.appendChild(formInput);
  inputContainer.appendChild(autocompleteContainer);

  form.appendChild(formLabel);
  form.appendChild(inputContainer);

  cardDiv.appendChild(form);
}

function geoLocationBtn() {
  const separatorDiv = document.createElement("div");
  separatorDiv.classList.add("separator");
  separatorDiv.innerHTML = "or";
  cardDiv.appendChild(separatorDiv);

  const geoBtn = document.createElement("button");
  geoBtn.innerHTML = "Use Current Location";
  geoBtn.setAttribute("id", "geoBtn");
  cardDiv.appendChild(geoBtn);

  geoBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(onSuccess, onError);
      clearWeatherDetails();
    } else {
      alert("Your browser does not support geolocation");
    }
  });
}

function onError(error) {
  console.log(error);
}

function onSuccess(position) {
  const {latitude, longitude} = position.coords;
  const baseUrl = "https://api.weatherapi.com/v1/current.json?";
  const apiKey = "9a4f206d38674938b97175154233008";
  const apiUrl = `${baseUrl}key=${apiKey}&q=${latitude},${longitude}`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      createElements(data);
      addEventListenerFavBtn(data);
    })
    .catch(error => console.error(error));
}

// Add eventListener to favoritesBtn                       
function addEventListenerFavBtn(data) {
    favoritesBtn.addEventListener("click", function () {

        let favoritesCity = `${data.location.name}, ${data.location.country}`;
        if (!favoritesCityArray.includes(favoritesCity)) {
            favoritesCityArray.push(favoritesCity);
            console.log(favoritesCityArray);

            // Clear the dropdown before adding the updated list
            dropdownFavorites.innerHTML = '';

            // Create a blank option
            const blankOption = document.createElement('option');
            blankOption.textContent = '';
            blankOption.setAttribute('id', 'blankFav');
            dropdownFavorites.appendChild(blankOption)

            // Add favorite cities as options to the dropdown
            favoritesCityArray.forEach(city => {
                const option = document.createElement('option');
                option.textContent = city;
                option.value = city;

                dropdownFavorites.appendChild(option);
            });
            // Append the dropdown
            
            cardDiv.insertBefore(favoritesContainer, geoBtn.nextSibling);
            labelDropdownFav.textContent = "Select your favorite: ";
        }
    })
}

function displayFavoritesCityWeather() {
  const dropdownFavorites = document.getElementById('dropdownFavorites');
  const blankOption = document.getElementById('blankFav');

  dropdownFavorites.addEventListener('change', function () {
      clearWeatherDetails();
  
      let selectedCity = dropdownFavorites.value;
      if (selectedCity) {
          clearWeatherDetails();
          console.log(selectedCity)
          fetchWeather(selectedCity);
          dropdownFavorites.value = blankOption;
      }
  });
}

//Create card
function createElements(data) {
  formInput.value = "";
  const weatherDiv = document.createElement("div");
  weatherDiv.classList.add("weatherData");
  cardDiv.appendChild(weatherDiv);

  //Weather img
  const weatherImg = document.createElement("div");
  weatherImg.classList.add("weatherImg");
  weatherImg.innerHTML = `<img src=${data.current.condition.icon}></img>`;

  weatherDiv.appendChild(weatherImg);

  //Weather data
  const temp = document.createElement("h1");
  temp.innerHTML = data.current.temp_c;
  weatherDiv.appendChild(temp);

  //C and F buttons
  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("buttonCont");
  weatherDiv.appendChild(buttonContainer);

  const cBtnDiv = document.createElement("div");
  cBtnDiv.classList.add("cBtnDiv");
  buttonContainer.appendChild(cBtnDiv);

  const fBtnDiv = document.createElement("div");
  fBtnDiv.classList.add("fBtnDiv");
  buttonContainer.appendChild(fBtnDiv);

  const cBtn = document.createElement("button");
  cBtn.setAttribute("id", "cBtn");
  cBtn.innerHTML = "°C";
  cBtn.style.fontSize = "xx-large";
  cBtnDiv.appendChild(cBtn);

  const fBtn = document.createElement("button");
  fBtn.setAttribute("id", "fBtn");
  fBtn.innerHTML = "℉";
  fBtnDiv.appendChild(fBtn);

  convertDegrees(data, fBtn, cBtn, temp);

  //City
  const city = document.createElement("h2");
  city.innerHTML = `<img src='/public/images/location.png'></img>${data.location.name}`;
  weatherDiv.appendChild(city);

  const country = document.createElement("h3");
  country.innerHTML = data.location.country;
  weatherDiv.appendChild(country);

  //Favorites button star                                           
  favoritesBtn.id = 'favoritesBtn';
  favoritesBtn.innerHTML = `<img src='/public/images/star_favorites.png'></img>`
  weatherDiv.appendChild(favoritesBtn);

  //Details
  renderDetails(data, cardDiv);
}

// Function renderDetails
function renderDetails(data, cardDiv) {
  const detailsContainer = document.createElement("div");
  detailsContainer.classList.add("detailsContainer");
  cardDiv.appendChild(detailsContainer);

  const wind = document.createElement("div");
  wind.classList.add("col");
  const humidity = document.createElement("div");
  humidity.classList.add("col");

  detailsContainer.appendChild(wind);
  detailsContainer.appendChild(humidity);

  wind.innerHTML = `<img src='/public/images/wind.png'>
                        <div>
                          <p class='wind'>${data.current.wind_kph}km/h</p>
                          <p>Wind Speed</p>
                        </div>`;

  humidity.innerHTML = `<img src='/public/images/humidity.png'>
                        <div>
                          <p class='wind'>${data.current.humidity}%</p>
                          <p>Humidity</p>
                        </div>`;
}

// Convert degrees /Fahrenheit
function convertDegrees(data, fBtn, cBtn, temp) {
  cBtn.addEventListener("click", (e) => {
    console.log(e);
    cBtn.style.fontSize = "xx-large";
    fBtn.style.fontSize = "smaller";
    temp.innerHTML = null;
    temp.innerHTML = data.current.temp_c;
  });

  fBtn.addEventListener("click", (e) => {
    console.log(e);
    fBtn.style.fontSize = "xx-large";
    cBtn.style.fontSize = "smaller";
    temp.innerHTML = null;
    temp.innerHTML = data.current.temp_f;
  });
}
