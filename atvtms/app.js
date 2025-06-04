const steps = [
  document.getElementById('step-1'),
  document.getElementById('step-2'),
  document.getElementById('step-3'),
  document.getElementById('step-4')
];
let driverScanner, plateScanner;
let currentSummary = null;


function showStep(index) {
  steps.forEach((s, i) => s.classList.toggle('active', i === index));
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
