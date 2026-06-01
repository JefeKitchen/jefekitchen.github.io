# Lift Workout Pages

Workout pages share their UI through:

- `workout-app.css`
- `workout-app.js`

To add a workout, duplicate an existing workout page such as `upper-body-today.html` or `chest-tri.html`, then update only:

- `<title>`
- `<h1>`
- `.meta` labels
- `window.liftWorkoutConfig`

Each workout item uses this shape:

```js
{
  group: 'Chest',
  name: 'Barbell bench press',
  sets: 4,
  reps: '5',
  rest: 120,
  track: 'weight'
}
```

Use `track: 'none'` for warmups or cooldowns that do not need reps/weight inputs.
