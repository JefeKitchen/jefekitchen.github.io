const pullStateKey = `${location.pathname}-pulled-ingredients`;
let pulledIngredients = {};

try {
  pulledIngredients = JSON.parse(localStorage.getItem(pullStateKey) || '{}');
} catch {
  pulledIngredients = {};
}

document.querySelectorAll('.pill').forEach((pill, index) => {
  const name = pill.textContent.trim();
  const stateKey = `${index}-${name}`;
  pill.setAttribute('role', 'button');
  pill.setAttribute('tabindex', '0');
  pill.setAttribute('aria-pressed', pulledIngredients[stateKey] ? 'true' : 'false');
  pill.classList.toggle('is-pulled', !!pulledIngredients[stateKey]);

  const toggle = () => {
    pulledIngredients[stateKey] = !pulledIngredients[stateKey];
    pill.classList.toggle('is-pulled', pulledIngredients[stateKey]);
    pill.setAttribute('aria-pressed', pulledIngredients[stateKey] ? 'true' : 'false');
    localStorage.setItem(pullStateKey, JSON.stringify(pulledIngredients));
  };

  pill.addEventListener('click', toggle);
  pill.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggle();
    }
  });
});
