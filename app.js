const STORAGE_KEY = 'ziyocrm_vscode_v1';

const DEFAULT_DATA = {
  page: 'groups',
  cabinet: 'admin',
  dayFilter: 'all', // 'all' | 'DCHJ' | 'SPSH'
  darkMode: false,
  groups: [
    {
      id: 'g1',
      name: 'Frontend-24',
      courseName: 'Frontend React',
      days: 'GCHJ',
      time: '14:00 - 16:00',
      fee: 1400000,
      maxStudents: 15,
      teacher: 'Alisher Karimov',
      color: 'rose',
    },
    {
      id: 'g2',
      name: 'IELTS-Master 09',
      courseName: 'IELTS Intensive',
      days: 'SPSH',
      time: '09:00 - 11:00',
      fee: 1100000,
      maxStudents: 12,
      teacher: 'Madina Sobirova',
      color: 'amber',
    },
    {
      id: 'g3',
      name: 'Python-18',
      courseName: 'Backend Python',
      days: 'GCHJ',
      time: '18:30 - 20:30',
      fee: 1350000,
      maxStudents: 16,
      teacher: 'Javohir Tursunov',
      color: 'blue',
    },
  ],
  students: [
    { id: 's1', fullName: 'Azizbek Qodirov', phone: '+998 90 123 45 67', groupId: 'g1', balance: 0, attendance: 'present' },
    { id: 's2', fullName: 'Malika Raximova', phone: '+998 91 234 56 78', groupId: 'g1', balance: -350000, attendance: 'late' },
    { id: 's3', fullName: 'Sardorbek Olimov', phone: '+998 93 345 67 89', groupId: 'g2', balance: 200000, attendance: 'present' },
    { id: 's4', fullName: 'Dilshodbek Umarov', phone: '+998 94 456 78 90', groupId: 'g3', balance: -500000, attendance: 'absent' },
  ],
  deleted: [],
};

let state = loadState();
let selectedDayForForm = 'GCHJ';
let activeInspectGroupId = null;

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_DATA, ...JSON.parse(raw) } : structuredClone(DEFAULT_DATA);
  } catch {
    return structuredClone(DEFAULT_DATA);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatUZS(num) {
  return new Intl.NumberFormat('uz-UZ').format(num) + " so'm";
}

function render() {
  document.body.classList.toggle('dark', state.darkMode);
  document.getElementById('themeBtn').textContent = state.darkMode ? 'Kunduzgi rejim' : 'Tungi rejim';
  document.getElementById('cabinetSelect').value = state.cabinet;

  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.page === state.page);
  });

  const titles = {
    dashboard: 'Dashboard',
    groups: 'Guruhlar',
    courses: 'Kurslar',
    students: "O'quvchilar",
    payments: "To'lovlar",
    debtors: 'Qarzdorlar',
    payroll: 'Oylik maoshlar',
    deleted: "O'chirilganlar",
    profile: 'Profil — Rahmiddinov Ibrohimjon',
  };
  document.getElementById('pageTitle').textContent = titles[state.page] || 'ZiyoCRM';

  const content = document.getElementById('contentArea');

  if (state.page === 'groups') {
    const filteredGroups = state.groups.filter((g) => {
      if (state.dayFilter === 'DCHJ') return g.days === 'GCHJ';
      if (state.dayFilter === 'SPSH') return g.days === 'SPSH';
      return true;
    });

    content.innerHTML = `
      <div class="toolbar">
        <div class="day-filters">
          <button class="filter-pill ${state.dayFilter === 'all' ? 'active' : ''}" onclick="setDayFilter('all')">Barchasi</button>
          <button class="filter-pill ${state.dayFilter === 'DCHJ' ? 'active' : ''}" onclick="setDayFilter('DCHJ')">DCHJ</button>
          <button class="filter-pill ${state.dayFilter === 'SPSH' ? 'active' : ''}" onclick="setDayFilter('SPSH')">SPSH</button>
        </div>
        <span class="subtitle">Jami ${filteredGroups.length} ta guruh · Karta ustiga bosing</span>
      </div>

      <div class="cards-grid">
        ${filteredGroups
          .map((g) => {
            const count = state.students.filter((s) => s.groupId === g.id).length;
            const dayLabel = g.days === 'GCHJ' ? 'DCHJ' : 'SPSH';
            return `
              <div class="group-card-wrap cap-${g.color}" onclick="openFullGroupModal('${g.id}')">
                <div class="group-cap">${g.courseName.toUpperCase()}</div>
                <div class="group-card">
                  <h4>${g.name}</h4>
                  <p>${dayLabel} · ${g.time} · Ustoz: ${g.teacher}</p>
                  <div class="group-footer">
                    <span>${count}/${g.maxStudents} o‘quvchi</span>
                    <strong>${formatUZS(g.fee)}</strong>
                  </div>
                </div>
              </div>
            `;
          })
          .join('')}
      </div>
    `;
    return;
  }

  if (state.page === 'students' || state.page === 'debtors') {
    const list =
      state.page === 'debtors'
        ? state.students.filter((s) => s.balance < 0)
        : state.students;

    content.innerHTML = `
      <div class="panel">
        <div class="panel-head">
          <h3>${state.page === 'debtors' ? 'Qarzdor o‘quvchilar' : 'Barcha o‘quvchilar'}</h3>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>F.I.O.</th><th>Telefon</th><th>Guruh</th><th>Balans</th></tr>
            </thead>
            <tbody>
              ${list
                .map((s) => {
                  const grp = state.groups.find((g) => g.id === s.groupId);
                  return `
                    <tr>
                      <td><strong>${s.fullName}</strong></td>
                      <td>${s.phone}</td>
                      <td>${grp ? grp.name : '—'}</td>
                      <td class="${s.balance < 0 ? 'text-red' : 'text-green'}"><strong>${formatUZS(s.balance)}</strong></td>
                    </tr>
                  `;
                })
                .join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
    return;
  }

  // Dashboard va boshqa bo'limlar uchun umumiy ko'rinish
  const debtors = state.students.filter((s) => s.balance < 0);
  content.innerHTML = `
    <div class="kpi-grid">
      <div class="kpi-card"><span>Jami guruhlar</span><strong>${state.groups.length} ta</strong></div>
      <div class="kpi-card"><span>Jami o‘quvchilar</span><strong>${state.students.length} nafar</strong></div>
      <div class="kpi-card"><span>Qarzdorlar</span><strong class="text-red">${debtors.length} nafar</strong></div>
      <div class="kpi-card"><span>Kabinet</span><strong>${state.cabinet.toUpperCase()}</strong></div>
    </div>
    <div class="panel">
      <div class="panel-head">
        <h3>${titles[state.page]}</h3>
        <button class="btn-primary" onclick="goToGroups()">Guruhlarni ko‘rish</button>
      </div>
      <div style="padding:20px;color:var(--muted);font-size:13px;">
        Barcha ma’lumotlar brauzerning <strong>localStorage</strong> xotirasida saqlanadi. Guruh kartasiga bosib to‘liq ekranli modalni ochishingiz mumkin.
      </div>
    </div>
  `;
}

window.setDayFilter = function (filter) {
  state.dayFilter = filter;
  saveState();
  render();
};

window.goToGroups = function () {
  state.page = 'groups';
  saveState();
  render();
};

window.openFullGroupModal = function (groupId) {
  activeInspectGroupId = groupId;
  const grp = state.groups.find((g) => g.id === groupId);
  if (!grp) return;

  const enrolled = state.students.filter((s) => s.groupId === grp.id);
  const dayText = grp.days === 'GCHJ' ? 'DCHJ (Dush-Chor-Juma)' : 'SPSH (Sesh-Pay-Shan)';

  document.getElementById('fsGroupName').textContent = grp.name;
  document.getElementById('fsGroupMeta').textContent = `${grp.courseName} · ${dayText} · ${grp.time}`;
  document.getElementById('fsCardName').textContent = grp.name;
  document.getElementById('fsCardDays').textContent = `${dayText} · ${grp.time}`;
  document.getElementById('fsCardPrice').textContent = formatUZS(grp.fee) + ' / oy';
  document.getElementById('fsCardCapacity').textContent = `${grp.teacher} (${enrolled.length}/${grp.maxStudents})`;

  const tbody = document.getElementById('fsStudentsBody');
  tbody.innerHTML =
    enrolled.length === 0
      ? `<tr><td colspan="4" style="text-align:center;color:var(--muted);">Bu guruhga hali o‘quvchi biriktirilmagan</td></tr>`
      : enrolled
          .map(
            (st) => `
          <tr>
            <td><strong>${st.fullName}</strong></td>
            <td>${st.phone}</td>
            <td class="${st.balance < 0 ? 'text-red' : 'text-green'}"><strong>${formatUZS(st.balance)}</strong></td>
            <td>
              <div class="att-group">
                <button class="att-btn ${st.attendance === 'present' ? 'present' : ''}" onclick="setAttendance('${st.id}','present')">Keldi</button>
                <button class="att-btn ${st.attendance === 'late' ? 'late' : ''}" onclick="setAttendance('${st.id}','late')">Kechikdi</button>
                <button class="att-btn ${st.attendance === 'absent' ? 'absent' : ''}" onclick="setAttendance('${st.id}','absent')">Kelmadi</button>
              </div>
            </td>
          </tr>
        `
          )
          .join('');

  document.getElementById('fullGroupModal').classList.add('open');
};

window.setAttendance = function (studentId, status) {
  const st = state.students.find((s) => s.id === studentId);
  if (!st) return;
  st.attendance = status;
  saveState();
  openFullGroupModal(activeInspectGroupId);
};

// Event Listeners
document.querySelectorAll('.nav-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    state.page = btn.dataset.page;
    saveState();
    render();
    document.getElementById('sidebar').classList.remove('open');
  });
});

document.getElementById('cabinetSelect').addEventListener('change', (e) => {
  state.cabinet = e.target.value;
  saveState();
  render();
});

document.getElementById('themeBtn').addEventListener('click', () => {
  state.darkMode = !state.darkMode;
  saveState();
  render();
});

document.getElementById('menuBtn').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

// Create Group Modal Events
const groupModal = document.getElementById('groupModal');
document.getElementById('openGroupModalBtn').onclick = () => groupModal.classList.add('open');
document.getElementById('closeGroupModal').onclick = () => groupModal.classList.remove('open');
document.getElementById('cancelGroupModal').onclick = () => groupModal.classList.remove('open');
document.getElementById('closeFullModal').onclick = () => {
  document.getElementById('fullGroupModal').classList.remove('open');
};

document.querySelectorAll('.day-opt').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.day-opt').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    selectedDayForForm = btn.dataset.day;
  });
});

document.getElementById('groupForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const newGroup = {
    id: 'g' + Date.now(),
    name: document.getElementById('gName').value.trim(),
    courseName: document.getElementById('gCourse').value.trim(),
    days: selectedDayForForm,
    time: document.getElementById('gTime').value.trim(),
    fee: Number(document.getElementById('gFee').value),
    maxStudents: Number(document.getElementById('gMax').value),
    teacher: document.getElementById('gTeacher').value.trim(),
    color: document.getElementById('gColor').value,
  };
  state.groups.unshift(newGroup);
  state.page = 'groups';
  saveState();
  groupModal.classList.remove('open');
  e.target.reset();
  render();
});

document.getElementById('addStudentInlineForm').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!activeInspectGroupId) return;
  const fullName = document.getElementById('inlineStudentName').value.trim();
  const phone = document.getElementById('inlineStudentPhone').value.trim();
  if (!fullName) return;

  state.students.unshift({
    id: 's' + Date.now(),
    fullName,
    phone,
    groupId: activeInspectGroupId,
    balance: 0,
    attendance: 'present',
  });
  saveState();
  document.getElementById('inlineStudentName').value = '';
  openFullGroupModal(activeInspectGroupId);
  render();
});

render();