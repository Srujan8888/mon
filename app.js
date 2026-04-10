const form = document.getElementById('recovery-form');
const entryList = document.getElementById('entry-list');
const summaryDetails = document.getElementById('summary-details');
const copyReportButton = document.getElementById('copy-report');
let entries = [];

const fetchEntries = async () => {
  const response = await fetch('/api/entries');
  if (!response.ok) {
    throw new Error('Failed to load entries');
  }
  return response.json();
};

const postEntry = async (entry) => {
  const response = await fetch('/api/entries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(entry),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to save entry');
  }
  return response.json();
};

const formatEntry = (entry) => {
  return `Date: ${entry.date}\nPain: ${entry.painLevel}\nMobility: ${entry.mobility}\nWound: ${entry.woundStatus}\nMedication taken: ${entry.medsTaken}\nNotes: ${entry.notes || 'None'}\n`;
};

const renderSummary = (allEntries) => {
  if (!allEntries.length) {
    summaryDetails.innerHTML = '<p>No entries yet. Start logging to generate a recovery report.</p>';
    return;
  }

  const painScores = allEntries
    .map((entry) => {
      const match = entry.painLevel.match(/^(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(Boolean);
  const averagePain = painScores.length ? (painScores.reduce((sum, n) => sum + n, 0) / painScores.length).toFixed(1) : 'N/A';
  const medicationCompliance = allEntries.filter((entry) => entry.medsTaken === 'Yes').length;
  const latest = allEntries[allEntries.length - 1];

  summaryDetails.innerHTML = `
    <p><strong>Days logged:</strong> ${allEntries.length}</p>
    <p><strong>Average pain level:</strong> ${averagePain}</p>
    <p><strong>Medication adherence:</strong> ${medicationCompliance} of ${allEntries.length} days</p>
    <p><strong>Latest entry:</strong> ${latest.date}, ${latest.woundStatus}, ${latest.mobility}</p>
    <p><strong>Top note:</strong> ${latest.notes || 'No notes added.'}</p>
  `;
};

const renderEntries = (allEntries) => {
  if (!allEntries.length) {
    entryList.innerHTML = '<h3>Recent entries</h3><p class="entry-empty">No recovery entries recorded yet.</p>';
    return;
  }

  const items = allEntries
    .slice()
    .reverse()
    .map((entry) => `
      <div class="entry-item">
        <time>${entry.date}</time>
        <p><strong>Pain:</strong> ${entry.painLevel}</p>
        <p><strong>Mobility:</strong> ${entry.mobility}</p>
        <p><strong>Wound:</strong> ${entry.woundStatus}</p>
        <p><strong>Medication:</strong> ${entry.medsTaken}</p>
        <p><strong>Notes:</strong> ${entry.notes || 'None'}</p>
      </div>
    `)
    .join('');

  entryList.innerHTML = `<h3>Recent entries</h3>${items}`;
};

const buildReport = (allEntries) => {
  const header = `CareCompanion Recovery Report\nEntries: ${allEntries.length}\nGenerated: ${new Date().toLocaleDateString()}\n\n`;
  const content = allEntries
    .map((entry, index) => `Entry ${index + 1}:\n${formatEntry(entry)}`)
    .join('\n');
  return `${header}${content}`;
};

form?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const entry = {
    date: data.get('date') || new Date().toISOString().slice(0, 10),
    painLevel: data.get('painLevel'),
    mobility: data.get('mobility'),
    woundStatus: data.get('woundStatus'),
    medsTaken: data.get('medsTaken'),
    notes: data.get('notes')?.toString().trim(),
  };

  try {
    await postEntry(entry);
    entries = await fetchEntries();
    renderEntries(entries);
    renderSummary(entries);
    form.reset();
    document.getElementById('entry-date').value = new Date().toISOString().slice(0, 10);
  } catch (error) {
    alert(error.message);
  }
});

copyReportButton?.addEventListener('click', async () => {
  const reportText = buildReport(entries);
  try {
    await navigator.clipboard.writeText(reportText);
    copyReportButton.textContent = 'Report copied';
    setTimeout(() => { copyReportButton.textContent = 'Copy report'; }, 2000);
  } catch (err) {
    copyReportButton.textContent = 'Copy failed';
    setTimeout(() => { copyReportButton.textContent = 'Copy report'; }, 2000);
  }
});

const initialize = async () => {
  const dateInput = document.getElementById('entry-date');
  if (dateInput) {
    dateInput.value = new Date().toISOString().slice(0, 10);
  }
  try {
    entries = await fetchEntries();
    renderEntries(entries);
    renderSummary(entries);
  } catch (error) {
    entryList.innerHTML = '<h3>Recent entries</h3><p class="entry-empty">Unable to load entries.</p>';
    summaryDetails.innerHTML = '<p>Unable to load summary.</p>';
  }
};

initialize();
