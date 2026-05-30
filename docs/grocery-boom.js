(() => {
  const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
  if (!checkboxes.length) return;

  let wasComplete = checkboxes.every(cb => cb.checked);

  const addStyles = () => {
    if (document.getElementById('grocery-boom-styles')) return;
    const style = document.createElement('style');
    style.id = 'grocery-boom-styles';
    style.textContent = `
      .cart-boom {
        inset: 0;
        overflow: hidden;
        pointer-events: none;
        position: fixed;
        z-index: 3000;
      }
      .boom-pop {
        animation: grocery-boom-pop 900ms ease-out forwards;
        filter: drop-shadow(0 0 14px rgba(184, 149, 58, .65));
        font-size: 42px;
        left: var(--x);
        opacity: 0;
        position: absolute;
        top: var(--y);
        transform: translate(-50%, -50%) scale(.4);
      }
      .boom-note {
        animation: grocery-boom-note 1800ms ease-out forwards;
        background: #171717;
        border: 1px solid #b8953a;
        border-radius: 8px;
        bottom: 22px;
        box-shadow: 0 18px 40px rgba(0, 0, 0, .42);
        color: var(--text, #ddd8cf);
        font-family: 'Playfair Display', serif;
        font-size: 22px;
        left: 20px;
        padding: 14px 16px;
        position: fixed;
        right: 20px;
        text-align: center;
      }
      @keyframes grocery-boom-pop {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(.35) rotate(-14deg); }
        18% { opacity: 1; transform: translate(-50%, -50%) scale(1.18) rotate(8deg); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(1.7) rotate(18deg); }
      }
      @keyframes grocery-boom-note {
        0% { opacity: 0; transform: translateY(18px); }
        16%, 78% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(10px); }
      }
    `;
    document.head.appendChild(style);
  };

  const showCartBoom = () => {
    addStyles();
    document.querySelector('.cart-boom')?.remove();
    const boom = document.createElement('div');
    boom.className = 'cart-boom';
    [
      ['18%', '18%'],
      ['78%', '20%'],
      ['50%', '34%'],
      ['24%', '58%'],
      ['76%', '62%'],
      ['48%', '78%']
    ].forEach(([x, y], index) => {
      const pop = document.createElement('span');
      pop.className = 'boom-pop';
      pop.textContent = '💥';
      pop.style.setProperty('--x', x);
      pop.style.setProperty('--y', y);
      pop.style.animationDelay = `${index * 85}ms`;
      boom.appendChild(pop);
    });
    const note = document.createElement('div');
    note.className = 'boom-note';
    note.textContent = 'Groceries acquired.';
    boom.appendChild(note);
    document.body.appendChild(boom);
    window.setTimeout(() => boom.remove(), 2200);
  };

  checkboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      const complete = checkboxes.every(item => item.checked);
      if (complete && !wasComplete) showCartBoom();
      wasComplete = complete;
    });
  });
})();
