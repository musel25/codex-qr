const steps = [
  document.getElementById('step-1'),
  document.getElementById('step-2'),
  document.getElementById('step-3'),
  document.getElementById('step-4')
];
let driverScanner, plateScanner;
let currentSummary = null;

// load draft if any
const saved = localStorage.getItem('draft-ticket');
if (saved) {
  try {
    currentSummary = JSON.parse(saved);
    if (currentSummary.driver) {
      document.getElementById('driver-name').value = currentSummary.driver.name || '';
      document.getElementById('driver-number').value = currentSummary.driver.number || '';
      document.getElementById('driver-type').value = currentSummary.driver.type || '';
    }
    if (currentSummary.vehicle) {
      document.getElementById('plate-number').value = currentSummary.vehicle.plate || '';
      document.getElementById('vehicle-make').value = currentSummary.vehicle.make || '';
      document.getElementById('vehicle-model').value = currentSummary.vehicle.model || '';
      document.getElementById('vehicle-year').value = currentSummary.vehicle.year || '';
    }
    if (currentSummary.details) {
      document.getElementById('violation-type').value = currentSummary.details.violation || 'speeding';
      document.getElementById('location').value = currentSummary.details.location || '';
      document.getElementById('observations').value = currentSummary.details.observations || '';
    }
  } catch {}
}


document.getElementById('vehicle-next').onclick = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const locInput = document.getElementById('location');
      locInput.value = `${pos.coords.latitude},${pos.coords.longitude}`;
    });
  }
  showStep(2);
};

let recognition;
document.getElementById('record').onclick = () => {
  if (!('webkitSpeechRecognition' in window)) {
    alert('Speech recognition not supported');
    return;
  }
  if (!recognition) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = e => {
      const text = e.results[0][0].transcript;
      const obs = document.getElementById('observations');
      obs.value = obs.value + ' ' + text;
    };
  }
  recognition.start();
};
    localStorage.removeItem('draft-ticket');
    localStorage.setItem('draft-ticket', JSON.stringify(currentSummary));
    alert('Saved offline. Error submitting ticket: ' + err.message);
}

function parseData(data) {
  const obj = {};
  data.split(/\n|;/).forEach(pair => {
    const [key, value] = pair.split(/:|=/);
    if (key && value) obj[key.trim()] = value.trim();
  });
  return obj;
}

document.getElementById('start-driver-scan').onclick = () => {
  const readerElem = document.getElementById('driver-reader');
  readerElem.innerHTML = '';
  driverScanner = new Html5Qrcode('driver-reader');
  driverScanner.start({ facingMode: 'environment' }, {}, (text) => {
    driverScanner.stop();
    const data = parseData(text);
    document.getElementById('driver-name').value = data.fullName || '';
    document.getElementById('driver-number').value = data.licenseNumber || '';
    document.getElementById('driver-type').value = data.licenseType || '';
    document.getElementById('issue-date').value = data.issueDate || '';
    document.getElementById('exp-date').value = data.expirationDate || '';
    document.getElementById('driver-form').classList.remove('hidden');
  });
};

document.getElementById('driver-next').onclick = () => showStep(1);

document.getElementById('start-plate-scan').onclick = () => {
  const readerElem = document.getElementById('plate-reader');
  readerElem.innerHTML = '';
  plateScanner = new Html5Qrcode('plate-reader');
  plateScanner.start({ facingMode: 'environment' }, {}, (text) => {
    plateScanner.stop();
    const data = parseData(text);
    document.getElementById('plate-number').value = data.plate || '';
    document.getElementById('vehicle-make').value = data.make || '';
    document.getElementById('vehicle-model').value = data.model || '';
    document.getElementById('vehicle-year').value = data.year || '';
    document.getElementById('vehicle-form').classList.remove('hidden');
  });
};

document.getElementById('vehicle-next').onclick = () => showStep(2);

document.getElementById('review').onclick = () => {
  currentSummary = {

    driver: {
      name: document.getElementById('driver-name').value,
      number: document.getElementById('driver-number').value,
      type: document.getElementById('driver-type').value
    },
    vehicle: {
      plate: document.getElementById('plate-number').value,
      make: document.getElementById('vehicle-make').value,
      model: document.getElementById('vehicle-model').value,
      year: document.getElementById('vehicle-year').value
    },
    details: {
      violation: document.getElementById('violation-type').value,
      location: document.getElementById('location').value,
      observations: document.getElementById('observations').value,
      time: new Date().toISOString()
    }
  };
  document.getElementById('summary').textContent = JSON.stringify(currentSummary, null, 2);
  showStep(3);
};

document.getElementById('submit').onclick = async () => {
  if (!currentSummary) return;
  try {
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentSummary)
    });
    const result = await res.json();
    alert('Ticket submitted with ID ' + result.id);
  } catch (err) {
    alert('Error submitting ticket: ' + err.message);
  }

  showStep(0);
};

showStep(0);
