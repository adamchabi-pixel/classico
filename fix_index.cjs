const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const target = `<div style="display:flex;justify-content:center;align-items:center;height:100vh;background-color:#000;">
        <svg style="animation: spin 1s linear infinite; height: 2rem; width: 2rem; color: #f59e0b;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle style="opacity: 0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path style="opacity: 0.75;" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <style>@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }</style>
      </div>`;

const replacement = `<div style="display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;background-color:#000;font-family:sans-serif;">
        <div style="position:relative;overflow:hidden;display:flex;align-items:center;">
          <span style="font-family:'Cinzel',serif;font-weight:700;font-size:1.25rem;letter-spacing:0.22em;text-transform:uppercase;line-height:1;background:linear-gradient(to bottom right, #fcd34d 20%, #d97706 50%, #fcd34d 80%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
            CLASSICO
          </span>
        </div>
        <span style="display:block;font-size:14px;color:#f4ecd8;line-height:1;margin-top:-1px;user-select:none;text-align:center;transform:translateX(-3px);filter:drop-shadow(0 0 4px rgba(244,236,216,0.2));font-style:italic;">
          The Best
        </span>
        <div style="display:flex;gap:6px;margin-top:20px;">
          <div class="dot" style="width:6px;height:6px;border-radius:50%;background-color:#f59e0b;animation:bounce 1.4s infinite ease-in-out both;"></div>
          <div class="dot" style="width:6px;height:6px;border-radius:50%;background-color:#f59e0b;animation:bounce 1.4s infinite ease-in-out both;animation-delay:0.16s;"></div>
          <div class="dot" style="width:6px;height:6px;border-radius:50%;background-color:#f59e0b;animation:bounce 1.4s infinite ease-in-out both;animation-delay:0.32s;"></div>
        </div>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap');
          @keyframes bounce { 0%, 80%, 100% { transform: scale(0); opacity: 0.3; } 40% { transform: scale(1); opacity: 1; } }
        </style>
      </div>`;

content = content.replace(target, replacement);
fs.writeFileSync('index.html', content);
