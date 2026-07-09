(function () {
  const container = document.currentScript;
  const siteKey = container.dataset.siteKey;
  const passwordHash = container.dataset.passwordHash;
  const storageKey = `gate_unlocked_${siteKey}`;

  async function sha256(text) {
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  }

  function alreadyUnlocked() {
    return localStorage.getItem(storageKey) === "1";
  }

  function buildOverlay() {
    const overlay = document.createElement("div");
    overlay.id = "gate-overlay";
    overlay.innerHTML = `
      <div class="gate-box">
        <h2>This page is password protected</h2>
        <p>Enter the password to view this page.</p>
        <form id="gate-form" autocomplete="off">
          <input type="password" id="gate-input" placeholder="Password" autofocus>
          <button type="submit">Unlock</button>
        </form>
        <p id="gate-error" class="gate-error"></p>
      </div>
    `;
    document.body.appendChild(overlay);

    const style = document.createElement("style");
    style.textContent = `
      #gate-overlay {
        position: fixed; inset: 0; z-index: 1000;
        background: #1b2a3a;
        display: flex; align-items: center; justify-content: center;
        font-family: -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;
      }
      #gate-overlay .gate-box {
        background: #fff; border-radius: 10px; padding: 36px 40px;
        max-width: 360px; width: 90%; text-align: center;
        box-shadow: 0 20px 60px rgba(0,0,0,0.4);
      }
      #gate-overlay h2 { margin: 0 0 8px; font-size: 1.2rem; color: #22282f; }
      #gate-overlay p { margin: 0 0 18px; color: #6b7178; font-size: 0.9rem; }
      #gate-overlay input {
        width: 100%; padding: 10px 12px; font-size: 1rem;
        border: 1px solid #ddd8cc; border-radius: 6px; margin-bottom: 12px;
        box-sizing: border-box;
      }
      #gate-overlay button {
        width: 100%; padding: 10px 12px; font-size: 1rem; font-weight: 600;
        background: #1b2a3a; color: #fff; border: none; border-radius: 6px; cursor: pointer;
      }
      #gate-overlay button:hover { background: #c25b2c; }
      .gate-error { color: #c0392b !important; font-size: 0.85rem !important; margin-top: 10px !important; min-height: 1em; }
      body.gate-locked > *:not(#gate-overlay) { filter: blur(6px); pointer-events: none; user-select: none; }
    `;
    document.head.appendChild(style);

    document.body.classList.add("gate-locked");

    const form = document.getElementById("gate-form");
    const input = document.getElementById("gate-input");
    const error = document.getElementById("gate-error");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const hash = await sha256(input.value);
      if (hash === passwordHash) {
        localStorage.setItem(storageKey, "1");
        document.body.classList.remove("gate-locked");
        overlay.remove();
      } else {
        error.textContent = "Incorrect password. Try again.";
        input.value = "";
        input.focus();
      }
    });
  }

  if (!alreadyUnlocked()) {
    if (document.body) {
      buildOverlay();
    } else {
      document.addEventListener("DOMContentLoaded", buildOverlay);
    }
  }
})();
