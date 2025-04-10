"use strict";

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");
const resetBtn = document.querySelector(".reset-btn");

// Класс тренировка
class Workout {
  date = new Date();
  id = `id-${(Date.now() + "").slice(-7)}`;
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
  _setDiscription() {
    // prettier-ignore
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December",];
    this.discription = `${this.name[0].toUpperCase()}${this.name.slice(1)} ${months[this.date.getMonth()]} ${this.date.getDate()}`
  }
}

// Беговая тренировка
class Running extends Workout {
  name = 'Бег'
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDiscription();
  }
  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

// Вело тренировка
class Cycling extends Workout {
  name = "Вело";
  type = "cycling";
  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this.calcSpeed();
    this._setDiscription();
  }
  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// Главный класс приложения
class App {
  _workouts = [];
  _map;
  _mapEvent;
  constructor() {
    // Запуск логики приложения
    this._getPosition();

    // Обработчик события который вызывает создание новой тренировки
    form.addEventListener("submit", this._newWorkout.bind(this));

    // Обработчик изменения типа тренировки
    inputType.addEventListener("change", this._toggleField);

    // Обработчик передвижения к маркеру тренировки
    containerWorkouts.addEventListener("click", this._moveToPopup.bind(this));

    // Получение данных из LS
    this._getLoclaStorage();

    // Сброс приложения
    resetBtn.addEventListener('click', this.reset)
  }

  // Запуск приложения. Через API браузера получаем согласие на получение геопозиции
  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        // Если отказано в получении геопозиции
        function () {
          alert("Вы не предоставили доступ к геопозиции!");
        }
      );
  }

  // Загрузка карты
  _loadMap(position) {
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];

    this._map = L.map("map").setView(coords, 13);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      atribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this._map);

    this._map.on("click", this._showForm.bind(this));

    this._workouts.forEach((work) => {
      this._renderMarker(work);
    });
  }

  // Показа формы для заполнения при нажатии на карту
  _showForm(mapE) {
    this._mapEvent = mapE;
    form.classList.remove("hidden");
    inputDistance.focus();
  }

  // Отображение в форме параметра темп/высота в зависимости от типа тренировки
  _toggleField() {
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
  }

  // Отображение новой отметки на карте, очистка форм, отображение новой тренировки
  _newWorkout(e) {
    e.preventDefault();

    // Данные из форм
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this._mapEvent.latlng;
    let workout;

    // Функция проверки валидности формы
    const validInput = (...inputs) =>
      inputs.every((inp) => Number.isFinite(inp));

    const allPositive = (...inputs) => inputs.every((inp) => inp > 0);

    // Проверить что данные корректные
    if (type === "running") {
      const cadence = +inputCadence.value;
      if (
        !validInput(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      ) {
        alert("Необходимо ввести целое положительное число!");
      }

      // Создаем объект пробежки
      workout = new Running([lat, lng], distance, duration, cadence);
    }

    if (type === "cycling") {
      const elevation = +inputElevation.value;
      if (
        !validInput(distance, duration, elevation) ||
        !allPositive(distance, duration)
      ) {
        return alert("Необходимо ввести целое положительное число!");
      }

      // Создаем объект вело тренировки
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // Добавить объект в массив workout
    this._workouts.push(workout);

    // Запуск рендера маркера тренировки на карте
    this._renderMarker(workout);

    // Запуск рендера тернировок
    this._renderWorkout(workout);

    // Запуск очистки поля ввода и спрятать форму
    this._hideForm(this);

    // Запуск сохранения в LocalStorage
    this._setLocalStorage();
  }

  // Рендер маркера теренировки
  _renderMarker(workout) {
    L.marker(workout.coords)
      .addTo(this._map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: "mark-popup",
        })
      )
      .setPopupContent(
        `${
          workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"
        }${workout.discription}`
      )
      .openPopup();
  }

  // Рендер тренировки
  _renderWorkout(workout) {
    let html = `<li class="workout workout--${workout.type}" data-id=${
      workout.id
    }>
      <h2 class="workout__title">${workout.discription}</h2>
      <div class="workout__details">
        <span class="workout__icon">${
          workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"
        }</span>
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">км</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.duration}</span>
        <span class="workout__unit">мин</span>
      </div>`;

    // если беговая тренировка
    if (workout.type === "running") {
      html += `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">мин/км</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">шаг</span>
          </div>
        </li>`;
    }

    // если вело тренировка
    if (workout.type === "cycling") {
      html += `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">км/час</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevation}</span>
            <span class="workout__unit">м</span>
          </div>
        </li>`;
    }
    form.insertAdjacentHTML("afterend", html);
  }

  // Очистка форм и удаление формы после заполения и отправки 
  _hideForm() {
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        "";
    form.classList.add("hidden");
  }

  // Плавное передвижение к маркеру
  _moveToPopup(e) {
    const workoutEL = e.target.closest(".workout");
    console.log(workoutEL);
    if(!workoutEL) return

    const workout = this._workouts.find((work) => work.id === workoutEL.dataset.id);
    console.log(workout);
    this._map.setView(workout.coords, 13, {animate: true, pan: {duration: 1}})
  }

  // Сохранение в LocalStorage
  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this._workouts))
  }

  // Получение данных из LS
  _getLoclaStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    
    if(!data) return;

    this._workouts = data;
    this._workouts.forEach((work) => {
          this._renderWorkout(work);
        }
      )
  }
 
  // Сброс сохраненных данных приложения
  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}

// Запуск приложения
const app = new App();
