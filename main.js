import './style.css';
import Quagga from '@ericblade/quagga2';

const DEBOUNCE_MS = 2000;
let lastScan = 0;

const statusEl = document.querySelector('#status');
const manualInput = document.querySelector('#manual-input');
const searchBtn = document.querySelector('#search-btn');

function setStatus(text) {
  statusEl.textContent = text;
}

function navigateToSearch(code) {
  setStatus(`Found: ${code} — opening…`);
  window.location.href = `https://hobby-genki.com/en/search?controller=search&s=${encodeURIComponent(code)}`;
}

async function startScanner() {
  setStatus('Requesting camera…');
  try {
    await new Promise((resolve, reject) => {
      Quagga.init(
        {
          inputStream: {
            name: 'Live',
            type: 'LiveStream',
            target: document.querySelector('#scanner'),
            constraints: {
              facingMode: 'environment',
            },
          },
          decoder: {
            readers: ['ean_reader', 'ean_8_reader'],
          },
          locate: true,
          numOfWorkers: 0,
        },
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    Quagga.start();
    setStatus('Scanning — point camera at barcode');

    Quagga.onDetected((result) => {
      const code = result?.codeResult?.code;
      if (!code) return;
      const now = Date.now();
      if (now - lastScan < DEBOUNCE_MS) return;
      lastScan = now;
      navigateToSearch(code);
    });
  } catch (err) {
    console.error('Camera error:', err);
    setStatus('Camera unavailable — use manual input below');
  }
}

searchBtn.addEventListener('click', () => {
  const code = manualInput.value.trim();
  if (code) navigateToSearch(code);
});

manualInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const code = e.target.value.trim();
    if (code) navigateToSearch(code);
  }
});

startScanner();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(console.error);
  });
}
