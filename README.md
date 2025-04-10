# 🏃‍♂️ Workout Tracker App

A JavaScript fitness tracking application that logs running and cycling workouts with geolocation. My learning project focused on OOP, DOM manipulation, and localStorage.

<div>
  <img src="screenshot/start-page.bmp" width="400" alt="Start page">
  <img src="screenshot/workout-form.bmp" width="400" alt="Form of workout">
  <img src="screenshot/marker-and-workout.bmp" width="400" alt="Render marker and workout">
  <img src="screenshot/diff-workout.bmp" width="400" alt="Render any workout">
</div>

## ✨ Key Features

- **Geolocation tracking** using browser API
- **Workout logging** for running & cycling
- **Interactive map** with Leaflet.js
- **Data persistence** via localStorage
- **Object-Oriented Architecture**:
  - `Workout` parent class
  - `Running` and `Cycling` child classes
  - `App` controller class

## 🛠 Technical Implementation

### Core JavaScript Concepts Demonstrated:
```javascript
// Class inheritance
class Running extends Workout {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }
}

// Geolocation API
navigator.geolocation.getCurrentPosition(this._loadMap.bind(this));

// DOM manipulation
form.insertAdjacentHTML("afterend", html);

// LocalStorage usage
localStorage.setItem('workouts', JSON.stringify(this._workouts));

