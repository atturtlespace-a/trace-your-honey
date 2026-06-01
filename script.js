// ─── Supabase Config ─────────────────────────────────────────────
const SUPABASE_URL = 'https://oujmcdpycjfhvnvybzlt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-pJ04yprVdNkEjwANUo-DQ_urp9SRbi';

// ─── Supabase Client (CDN build, no npm needed) ───────────────────
const SUPABASE_CONFIGURED =
  SUPABASE_URL !== 'YOUR_SUPABASE_URL' &&
  SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';

const { createClient } = supabase;
const db = SUPABASE_CONFIGURED
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// ─── Demo Data (used when Supabase not yet configured) ───────────
const DEMO_BATCHES = [
  {
    batch_code: 'B250401',
    honey_type: 'Mānuka Honey',
    harvest_region: 'Waikato, New Zealand',
    harvest_date: '2025-04-01',
    testing_laboratory: 'Analytica Laboratories, New Zealand',
    umf_rating: 15,
    mgo_rating: 514,
    authenticity_status: 'Verified Authentic – UMF Certified',
    producer: '1839 Honey Co.',
    notes: 'Single-source harvest from native mānuka trees at 400m elevation. Independently tested and certified to UMF 15+ standard.',
  },
  {
    batch_code: 'B250302',
    honey_type: 'Mānuka Honey',
    harvest_region: 'Northland, New Zealand',
    harvest_date: '2025-03-02',
    testing_laboratory: 'Hill Laboratories, New Zealand',
    umf_rating: 20,
    mgo_rating: 829,
    authenticity_status: 'Verified Authentic – UMF Certified',
    producer: '1839 Honey Co.',
    notes: 'Premium UMF 20+ batch from remote Northland coastal mānuka.',
  },
  {
    batch_code: 'B250110',
    honey_type: 'Mānuka Honey',
    harvest_region: 'Bay of Plenty, New Zealand',
    harvest_date: '2025-01-10',
    testing_laboratory: 'Analytica Laboratories, New Zealand',
    umf_rating: 10,
    mgo_rating: 263,
    authenticity_status: 'Verified Authentic – UMF Certified',
    producer: '1839 Honey Co.',
    notes: 'Entry-level UMF 10+ ideal for daily wellness.',
  },
  {
    batch_code: 'B241205',
    honey_type: 'Mānuka Honey',
    harvest_region: 'East Cape, New Zealand',
    harvest_date: '2024-12-05',
    testing_laboratory: 'AsureQuality, New Zealand',
    umf_rating: 25,
    mgo_rating: 1200,
    authenticity_status: 'Verified Authentic – UMF Certified',
    producer: '1839 Honey Co.',
    notes: 'Rare UMF 25+ from East Cape. Limited harvest batch.',
  },
];

// ─── Step References ──────────────────────────────────────────────
const steps = {
  1: document.getElementById('step-1'),
  2: document.getElementById('step-2'),
  3: document.getElementById('step-3'),
  notFound: document.getElementById('step-not-found'),
};

let registeredEmail = null;

function showStep(key) {
  Object.values(steps).forEach(s => s.classList.remove('active'));
  const target = typeof key === 'number' ? steps[key] : steps[key];
  if (target) target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function setLoading(btn, loading) {
  const text    = btn.querySelector('.btn-text');
  const spinner = btn.querySelector('.btn-spinner');
  btn.disabled  = loading;
  text.classList.toggle('hidden', loading);
  spinner.classList.toggle('hidden', !loading);
}

function setFieldError(inputEl, errorEl, msg) {
  if (msg) {
    inputEl.classList.add('invalid');
    errorEl.textContent = msg;
  } else {
    inputEl.classList.remove('invalid');
    errorEl.textContent = '';
  }
}

function setFormError(el, msg) {
  if (msg) {
    el.textContent = msg;
    el.classList.add('visible');
  } else {
    el.textContent = '';
    el.classList.remove('visible');
  }
}

// ─── STEP 1: Registration ─────────────────────────────────────────
const registrationForm = document.getElementById('registration-form');
const emailInput       = document.getElementById('email');
const emailError       = document.getElementById('email-error');
const formError        = document.getElementById('form-error');
const continueBtn      = document.getElementById('continue-btn');

registrationForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  setFieldError(emailInput, emailError, '');
  setFormError(formError, '');

  const email   = emailInput.value.trim();
  const consent = document.getElementById('marketing-consent').checked;

  if (!email) {
    setFieldError(emailInput, emailError, 'Email address is required.');
    emailInput.focus();
    return;
  }
  if (!isValidEmail(email)) {
    setFieldError(emailInput, emailError, 'Please enter a valid email address.');
    emailInput.focus();
    return;
  }

  setLoading(continueBtn, true);

  try {
    if (SUPABASE_CONFIGURED) {
      const { error } = await db
        .from('customer_registrations')
        .insert([{ email, marketing_consent: consent }]);
      if (error && error.code !== '23505') throw error;
    }
    registeredEmail = email;
    showStep(2);
  } catch (err) {
    console.error('Registration error:', err);
    setFormError(formError, 'Something went wrong. Please try again.');
  } finally {
    setLoading(continueBtn, false);
  }
});

emailInput.addEventListener('input', () => {
  setFieldError(emailInput, emailError, '');
  setFormError(formError, '');
});

// ─── STEP 2: Batch Lookup ─────────────────────────────────────────
const batchForm      = document.getElementById('batch-form');
const batchInput     = document.getElementById('batch-code');
const batchError     = document.getElementById('batch-error');
const batchFormError = document.getElementById('batch-form-error');
const traceBtn       = document.getElementById('trace-btn');

batchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  setFieldError(batchInput, batchError, '');
  setFormError(batchFormError, '');

  const code = batchInput.value.trim().toUpperCase();

  if (!code) {
    setFieldError(batchInput, batchError, 'Please enter your batch code.');
    batchInput.focus();
    return;
  }

  setLoading(traceBtn, true);

  try {
    if (!SUPABASE_CONFIGURED) {
      const demo = DEMO_BATCHES.find(b => b.batch_code.toUpperCase() === code);
      if (!demo) { showStep('notFound'); return; }
      renderResults(demo);
      showStep(3);
      return;
    }

    const { data, error } = await db
      .from('honey_batches')
      .select('*')
      .ilike('batch_code', code)
      .maybeSingle();

    if (error) throw error;
    if (!data) { showStep('notFound'); return; }
    renderResults(data);
    showStep(3);

  } catch (err) {
    console.error('Batch lookup error:', err);
    setFormError(batchFormError, 'Something went wrong. Please try again.');
  } finally {
    setLoading(traceBtn, false);
  }
});

batchInput.addEventListener('input', () => {
  setFieldError(batchInput, batchError, '');
  setFormError(batchFormError, '');
});

document.getElementById('back-to-1').addEventListener('click', () => showStep(1));

// ─── STEP 3: Render Results ───────────────────────────────────────
function renderResults(batch) {
  document.getElementById('result-batch-title').textContent = `Batch ${batch.batch_code}`;

  const grid = document.getElementById('result-grid');
  grid.innerHTML = '';

  const fields = [
    { label: 'Batch Code',          value: batch.batch_code,         full: false },
    { label: 'Honey Type',          value: batch.honey_type,         full: false },
    { label: 'Harvest Region',      value: batch.harvest_region,     full: false },
    { label: 'Harvest Date',        value: formatDate(batch.harvest_date), full: false },
    { label: 'Testing Laboratory',  value: batch.testing_laboratory, full: true  },
    { label: 'UMF Rating',          value: batch.umf_rating ? `UMF ${batch.umf_rating}+` : '—', full: false, rating: true },
    { label: 'MGO Rating',          value: batch.mgo_rating ? `MGO ${batch.mgo_rating}+` : '—', full: false, rating: true },
    { label: 'Authenticity Status', value: batch.authenticity_status, full: true, status: true },
    { label: 'Producer',            value: batch.producer,           full: true  },
  ];

  fields.forEach(({ label, value, full, rating, status }) => {
    if (!value) return;
    const item = document.createElement('div');
    item.className = `result-item${full ? ' full-width' : ''}`;
    const lbl = document.createElement('div');
    lbl.className = 'result-label';
    lbl.textContent = label;
    const val = document.createElement('div');
    val.className = 'result-value';
    if (rating) val.classList.add('rating');
    if (status) val.classList.add('status-verified');
    val.textContent = value;
    item.appendChild(lbl);
    item.appendChild(val);
    grid.appendChild(item);
  });

  const notesWrap = document.getElementById('result-notes-wrap');
  const notesEl   = document.getElementById('result-notes');
  if (batch.notes) {
    notesEl.textContent = batch.notes;
    notesWrap.classList.remove('hidden');
  } else {
    notesWrap.classList.add('hidden');
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-NZ', { year: 'numeric', month: 'long', day: 'numeric' });
}

document.getElementById('trace-another').addEventListener('click', () => {
  batchInput.value = '';
  showStep(2);
});

document.getElementById('try-again').addEventListener('click', () => {
  batchInput.value = '';
  showStep(2);
});