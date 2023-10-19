'use strict';

// const { latLng } = require('leaflet');

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class workOuts {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(distance, duration, coords) {
    this.distance = distance;
    this.duration = duration;
    this.coords = coords;
  }
}

class cyling extends workOuts {
  type = 'cycling';
  constructor(distance, duration, coords, elevationGain) {
    super(distance, duration, coords);

    this.elevationGain = elevationGain;
    this.calcSpeed;
  }
  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
  }
}

class running extends workOuts {
  type = 'running';
  constructor(distance, duration, coords, cadence) {
    super(distance, duration, coords);

    this.cadence = cadence;
    this.calcPace();
  }
  calcPace() {
    this.pace = this.duration / this.distance;
  }
}

class App {
  //declaring  map and mapEvent as private property
  #map;
  #mapEvent;
  constructor() {
    this._getPosition();
    //these eventlisteners are avaliable as soon as the script is loaded
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
  }
  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not fetch location');
        }
      );
  }
  _loadMap(position) {
    console.log(position);
    const { latitude, longitude } = position.coords;
    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //add an event listener to the map
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }
  _newWorkout(e) {
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);
    const notString = (...inputs) => inputs.every(inp => Number.isFinite(inp));
    e.preventDefault();

    //get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;

    //if runniing workout, create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;
      //check if data is valid
      if (
        !allPositive(distance, duration, cadence) ||
        !notString(distance, duration, cadence)
      )
        return alert('Inpts must be positive numbers');
    }
    //if cycling workout, create cycling object
    if (type === 'cycling') {
      const elevationGain = +inputElevation.value;
      //check if data is valid
      if (
        !allPositive(distance, duration) ||
        !notString(distance, duration, elevationGain)
      )
        return alert('Inpts must be positive numbers');
    }

    //add new objects to workout array

    //render workout on map as marker
    const { lat, lng } = this.#mapEvent.latlng;
    console.log(this.#mapEvent);
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${type}-popup`,
        })
      )
      .setPopupContent(
        `Your current location:  ${(lat, lng)}
    you have ran ${distance} km and for ${duration} mins
    
    `
      )
      .openPopup();
    //hide form and clear input values
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        '';
  }
}

const app = new App(); //instantiating an initial application
