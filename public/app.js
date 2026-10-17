/* ═══════════════════════════════════════════════════════════════
   KhamThong SinDad POS (ຄຳທອງ ຊິ້ນດາດ)
   Liquid Glass iOS Luxury Gold Application Logic
   ═══════════════════════════════════════════════════════════════ */

// ─── STATE MANAGEMENT ───
let currentLang = 'lo'; // 'lo' (Lao) or 'th' (Thai)
let currentView = 'staff'; // 'staff' or 'owner'
let currentOrderMode = 'dinein'; // 'dinein' or 'takeaway'
let currentPaymentMethod = 'BCEL One'; // 'BCEL One' | 'Cash'

let selectedGradeId = 'mixed';
let rawWeightInput = '';
let tareActive = false;
let customTareWeight = 0.15; // default 150g

let selectedTableId = 1;
let quickItemsAdded = {}; // { 'b1': qty, ... }

let globalServerState = {
  settings: {
    storeNameLo: 'ຄຳທອງ ຊິ້ນດາດ & ປິ້ງຍ່າງ',
    storeNameTh: 'คำทอง ชี้นดาด & ปิ้งย่าง',
    taglineLo: 'ຊີ້ນດາດຊັ່ງກິໂລ ນ້ຳແຈ່ວລົດເດັດ ວຽງຈັນ',
    taglineTh: 'หมูกระทะชั่งกิโล น้ำจิ้มรสเด็ด เวียงจันทน์',
    phone: '+856 20 5555 9999',
    exchangeRate: 630,
    defaultTareWeight: 0.15
  },
  menu: {
    meatGrades: [
      { id: 'mixed', nameLo: 'ຊີ້ນລວມ (ໝູ/ໄກ່/ລູກຊີ້ນ)', nameTh: 'หมูรวม (หมู/ไก่/ลูกชิ้น)', priceLAK: 95000, icon: 'drumstick' },
      { id: 'premium', nameLo: 'ຊີ້ນພຣີມ່ຽມ (ຊີ້ນງົວ/ຊີຟູດ)', nameTh: 'พรีเมียม (เนื้อวัว/ซีฟู้ด)', priceLAK: 145000, icon: 'gem' },
      { id: 'pork_belly', nameLo: 'ສາມຊັ້ນໝັກງາພິເສດ', nameTh: 'สามชั้นหมักงาพิเศษ', priceLAK: 110000, icon: 'layers' }
    ],
    categories: []
  },
  tables: [],
  dailyStats: { totalRevenueLAK: 0, totalMeatKg: 0, ordersCount: 0, paymentBreakdown: { bcelOneLAK: 0, cashLAK: 0 } },
  recentActivities: []
};

let currentModalTarget = null; // checkout target
let inspectingTableId = null;

// ─── DICTIONARY FOR LAO / THAI LOCALIZATION ───
const i18n = {
  lo: {
    brandName: "ຄຳທອງ ຊິ້ນດາດ",
    brandTagline: "ລະບົບຊັ່ງກິໂລ & POS ລະດັບ Luxury",
    tabStaffText: "ພະນັກງານ",
    tabOwnerText: "ເຈົ້າຂອງຮ້ານ",
    langLabel: "ລາວ",
    modeDineInTitle: "ກິນຢູ່ຮ້ານ",
    modeDineInSub: "ເລືອກໂຕະ & ສະສົມບິນ",
    modeTakeawayTitle: "ຊື້ກັບບ້ານ",
    modeTakeawaySub: "ຊັ່ງແລ້ວຄິດເງິນເລີຍ",
    tareBtnText: "ຫັກຊາມ (-0.15)",
    tareIndicator: "✓ ຫັກນ້ຳໜັກຊາມ -0.15 kg",
    voiceBtnText: "ສຽງ",
    chooseTableLabel: "ເລືອກໂຕະ (ກິນຢູ່ຮ້ານ)",
    beveragesLabel: "ເຄື່ອງດື່ມ & ຂອງແຖມ",
    stagedListLabel: "ລາຍການທີ່ກຽມບັນທຶກ",
    emptyStagedHint: "ຍັງບໍ່ມີລາຍການ (ກົດຊັ່ງກິໂລ ຫຼື ເລືອກເຄື່ອງດື່ມ)",
    submitOrderDineIn: "ບັນທຶກລົງ ",
    submitOrderTakeaway: "ຄິດເງິນຊື້ກັບບ້ານ (BCEL / ເງິນສົດ)",
    statRevLabel: "ຍອດຂາຍລວມມື້ນີ້",
    statMeatLabel: "ຊີ້ນຂາຍໄດ້ທັງໝົດ",
    statOrdersLabel: "ຈຳນວນບິນທີ່ສຳເລັດ",
    statPaymentLabel: "ແຍກການຊຳລະ",
    ownerTableGridLabel: "ຜັງໂຕະສົດ (Live Table Matrix)",
    liveFeedLabel: "ລາຍການອັບເດດສົດ (Live Real-time Feed)",
    qrPromptText: "ສະແກນຈ່າຍດ້ວຍ BCEL One ຫຼື ທຸກທະນາຄານ",
    confirmPayBtnText: "ຢືນຢັນຮັບເງິນສຳເລັດ",
    cashTabLabel: "ເງິນສົດ (Cash)",
    cashReceivedLabel: "ຈຳນວນເງິນສົດທີ່ໄດ້ຮັບ",
    changeTextLabel: "ເງິນທອນ (Change):",
    toastSuccess: "ບັນທຶກສຳເລັດແລ້ວ",
    emptyTable: "ວ່າງ",
    occupiedTable: "ກຳລັງກິນ",
    billCheckout: "ເຊັກບິນ",
    voidItemConfirm: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການຍົກເລີກລາຍການນີ້?"
  },
  th: {
    brandName: "คำทอง ชี้นดาด POS",
    brandTagline: "ระบบชั่งกิโล & POS หรูหราสไตล์ Luxury Gold",
    tabStaffText: "พนักงาน",
    tabOwnerText: "เจ้าของร้าน",
    langLabel: "ไทย",
    modeDineInTitle: "กินที่ร้าน",
    modeDineInSub: "เลือกโต๊ะ & สะสมบิล",
    modeTakeawayTitle: "ซื้อกลับบ้าน",
    modeTakeawaySub: "ชั่งแล้วคิดเงินทันที",
    tareBtnText: "หักกะละมัง (-0.15)",
    tareIndicator: "✓ หักน้ำหนักกะละมัง -0.15 kg",
    voiceBtnText: "สั่งด้วยเสียง",
    chooseTableLabel: "เลือกโต๊ะ (กินที่ร้าน)",
    beveragesLabel: "เครื่องดื่ม & ของแถม/บริการ",
    stagedListLabel: "รายการที่เตรียมบันทึก",
    emptyStagedHint: "ยังไม่มีรายการ (กดชั่งกิโล หรือเลือกเครื่องดื่ม)",
    submitOrderDineIn: "บันทึกลง ",
    submitOrderTakeaway: "คิดเงินกลับบ้าน (LAO QR / เงินสด)",
    statRevLabel: "ยอดขายรวมวันนี้",
    statMeatLabel: "เนื้อสัตว์ที่ขายได้ทั้งหมด",
    statOrdersLabel: "จำนวนบิลที่เสร็จสิ้น",
    statPaymentLabel: "แยกตามการชำระ",
    ownerTableGridLabel: "ผังโต๊ะสด (Live Table Matrix)",
    liveFeedLabel: "ความเคลื่อนไหวสด (Live Feed)",
    qrPromptText: "สแกนจ่ายด้วย BCEL One หรือ PromptPay",
    confirmPayBtnText: "ยืนยันรับเงินเรียบร้อย",
    cashTabLabel: "เงินสด (Cash)",
    cashReceivedLabel: "จำนวนเงินสดที่ได้รับ",
    changeTextLabel: "เงินทอน (Change):",
    toastSuccess: "บันทึกสำเร็จเรียบร้อย",
    emptyTable: "โต๊ะว่าง",
    occupiedTable: "มีลูกค้านั่ง",
    billCheckout: "เช็กบิล",
    voidItemConfirm: "คุณแน่ใจหรือไม่ว่าต้องการยกเลิกรายการนี้?"
  }
};

// ─── AUDIO SYNTHESIZER (LUXURY GOLD HAPTIC TONE) ───
let audioCtx = null;
function playGoldChime(type = 'tap') {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'tap') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(1174.66, audioCtx.currentTime + 0.25); // D6
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    }
  } catch (e) {}
}

// ─── PER-DEVICE LOCAL STORAGE + OFFLINE-FIRST ENGINE + WEBSOCKET SYNC ───
const LOCAL_STORE_KEY = 'khamthong_pos_store_v2';
const DEVICE_ID_KEY = 'khamthong_device_id';
let rawSocket = null;
let serverConceptPresets = null;
const posBroadcastChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('khamthong_pos_channel') : null;

function getOrCreateDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = 'DEV-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Date.now().toString().slice(-4);
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

function normalizeClientTableTimestamps(stateObj) {
  if (!stateObj || !Array.isArray(stateObj.tables)) return;
  const now = Date.now();
  const sampleOffsetsMins = [18, 54, 95];
  let occupiedIdx = 0;
  stateObj.tables.forEach(tb => {
    if (tb.status === 'occupied') {
      const ageMins = tb.seatedAt ? (now - tb.seatedAt) / 60000 : 999;
      if (ageMins > 140 || ageMins < 0) {
        const offset = sampleOffsetsMins[occupiedIdx % sampleOffsetsMins.length];
        tb.seatedAt = now - offset * 60 * 1000;
      }
      occupiedIdx++;
    }
  });
}

function saveStateToLocalDevice() {
  try {
    if (globalServerState && globalServerState.settings) {
      localStorage.setItem(LOCAL_STORE_KEY, JSON.stringify(globalServerState));
    }
  } catch (e) {
    console.warn('LocalStorage save warning:', e);
  }
}

// Resilient socket proxy so all existing socket.send() calls work 100% even offline!
let socket = {
  get readyState() {
    return 1; // Always WebSocket.OPEN (1) so offline/local mode works seamlessly
  },
  send(msgStr) {
    try {
      const parsed = JSON.parse(msgStr);
      applyClientPosMutation(parsed.type, parsed.payload);
    } catch (e) {
      console.error('Local mutation error:', e);
    }
    if (rawSocket && rawSocket.readyState === WebSocket.OPEN) {
      try {
        rawSocket.send(msgStr);
      } catch (e) {}
    }
  }
};

if (posBroadcastChannel) {
  posBroadcastChannel.onmessage = (ev) => {
    if (ev.data && ev.data.type === 'LOCAL_TAB_SYNC' && ev.data.state) {
      globalServerState = ev.data.state;
      renderAll();
    } else if (ev.data && ev.data.type === 'KITCHEN_ITEM_READY') {
      playGoldChime('success');
      showToast(`🔔 ${currentLang === 'lo' ? 'ໂຕະ' : 'โต๊ะ'} ${ev.data.payload.tableId}: "${ev.data.payload.itemName}" ${currentLang === 'lo' ? 'ພ້ອມເສີບແລ້ວ!' : 'พร้อมเสิร์ฟแล้ว!'}`);
    }
  };
}

function initWebSocket() {
  // 1. Immediately hydrate from per-device localStorage if available (Zero-Latency Offline-First)
  let hydrated = false;
  try {
    const savedRaw = localStorage.getItem(LOCAL_STORE_KEY);
    if (savedRaw) {
      const savedState = JSON.parse(savedRaw);
      if (savedState && savedState.settings && Array.isArray(savedState.tables)) {
        normalizeClientTableTimestamps(savedState);
        globalServerState = savedState;
        if (globalServerState.settings.defaultTareWeight) {
          customTareWeight = globalServerState.settings.defaultTareWeight;
        }
        const isScale = globalServerState.settings.scaleMode !== false;
        toggleStaffScaleView(isScale ? 'scale' : 'catalog', true);
        renderAll();
        hydrated = true;
      }
    }
  } catch (e) {}

  // 1b. If first visit (no localStorage yet), fetch ./default-store.json so 24/7 static cloud hosting works immediately
  if (!hydrated) {
    fetch('./default-store.json')
      .then(r => r.ok ? r.json() : null)
      .then(defaultData => {
        if (defaultData && defaultData.settings && Array.isArray(defaultData.tables)) {
          normalizeClientTableTimestamps(defaultData);
          globalServerState = defaultData;
          saveStateToLocalDevice();
          if (globalServerState.settings.defaultTareWeight) {
            customTareWeight = globalServerState.settings.defaultTareWeight;
          }
          const isScale = globalServerState.settings && globalServerState.settings.scaleMode !== false;
          toggleStaffScaleView(isScale ? 'scale' : 'catalog', true);
          renderAll();
        }
      })
      .catch(() => {});
  }

  // 2. Connect WebSocket for initial template & live sync
  try {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    rawSocket = new WebSocket(wsUrl);

    rawSocket.onopen = () => {
      console.log('Connected to KhamThong POS WebSocket server');
      sendUsageTelemetry('เปิดเข้าใช้งานระบบ POS');
    };

    rawSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.presets) {
          serverConceptPresets = data.presets;
        }
        if (data.type === 'INIT_STATE') {
          const hasLocalStore = !!localStorage.getItem(LOCAL_STORE_KEY);
          if (!hasLocalStore || !globalServerState || !globalServerState.settings) {
            globalServerState = data.payload;
            normalizeClientTableTimestamps(globalServerState);
            saveStateToLocalDevice();
          }
          if (globalServerState.settings && globalServerState.settings.defaultTareWeight) {
            customTareWeight = globalServerState.settings.defaultTareWeight;
          }
          const isScale = globalServerState.settings && globalServerState.settings.scaleMode !== false;
          toggleStaffScaleView(isScale ? 'scale' : 'catalog', true);
          renderAll();
        } else if (data.type === 'KITCHEN_ITEM_READY') {
          playGoldChime('success');
          showToast(`🔔 ${currentLang === 'lo' ? 'ໂຕະ' : 'โต๊ะ'} ${data.payload.tableId}: "${data.payload.itemName}" ${currentLang === 'lo' ? 'ພ້ອມເສີບແລ້ວ!' : 'พร้อมเสิร์ฟแล้ว!'}`);
        }
      } catch (err) {
        console.error(err);
      }
    };

    rawSocket.onclose = () => {
      setTimeout(initWebSocket, 5000);
    };
  } catch (e) {}
}

// ─── NUMPAD & WEIGHT CALCULATIONS ───
function tapNumpad(char) {
  playGoldChime('tap');
  if (char === '.' && rawWeightInput.includes('.')) return;
  if (rawWeightInput.length >= 5) return;
  rawWeightInput += char;
  calculateAndRenderWeight();
}

function tapBackspace() {
  playGoldChime('tap');
  rawWeightInput = rawWeightInput.slice(0, -1);
  calculateAndRenderWeight();
}

function tapClear() {
  playGoldChime('tap');
  rawWeightInput = '';
  calculateAndRenderWeight();
}

function applyPresetWeight(kg) {
  playGoldChime('tap');
  rawWeightInput = kg.toFixed(2);
  calculateAndRenderWeight();
}

function toggleTare() {
  playGoldChime('tap');
  tareActive = !tareActive;
  const tareBtn = document.getElementById('tareBtn');
  const tareIndicator = document.getElementById('tareLabelIndicator');
  
  if (tareActive) {
    tareBtn.classList.add('active');
    tareIndicator.innerHTML = icon('check', 'ic-xs') + ` ${currentLang === 'lo' ? 'ຫັກນ້ຳໜັກຊາມ' : 'หักน้ำหนักกะละมัง'} -${customTareWeight} kg`;
    tareIndicator.style.display = 'block';
  } else {
    tareBtn.classList.remove('active');
    tareIndicator.style.display = 'none';
  }
  calculateAndRenderWeight();
}

function selectGrade(gradeId) {
  playGoldChime('tap');
  selectedGradeId = gradeId;
  renderMeatGrades();
  calculateAndRenderWeight();
}

function getNetWeight() {
  let w = parseFloat(rawWeightInput) || 0;
  if (tareActive && w > 0) {
    w = Math.max(0, w - customTareWeight);
  }
  return +w.toFixed(2);
}

function getSelectedGradePrice() {
  const grades = (globalServerState.menu && globalServerState.menu.meatGrades) || [];
  const found = grades.find(g => g.id === selectedGradeId);
  return found ? found.priceLAK : 95000;
}

function calculateAndRenderWeight() {
  const netWeight = getNetWeight();
  const unitPrice = getSelectedGradePrice();
  const totalPriceLAK = Math.round(netWeight * unitPrice);
  const rate = (globalServerState.settings && globalServerState.settings.exchangeRate) || 630;
  const totalPriceTHB = Math.round(totalPriceLAK / rate);

  const displayVal = rawWeightInput ? parseFloat(rawWeightInput).toFixed(2) : '0.00';
  document.getElementById('displayWeight').textContent = displayVal;
  document.getElementById('displayPriceTotal').textContent = `${totalPriceLAK.toLocaleString()} ₭`;
  document.getElementById('displayPriceTHB').textContent = `≈ ${totalPriceTHB.toLocaleString()} บาท`;

  updateStagedOrderList();
}

// ─── QUICK ITEMS & KITCHEN NOTES HANDLING ───
let selectedKitchenNotes = [];

function toggleKitchenNote(btn) {
  playGoldChime('tap');
  if (!btn) return;
  btn.classList.toggle('active');
  const noteEl = btn.querySelector('.kn-t');
  const noteText = noteEl ? (currentLang === 'lo' ? noteEl.dataset.lo : noteEl.dataset.th) : btn.textContent.trim();
  const rawKey = btn.dataset.note || noteText;
  if (btn.classList.contains('active')) {
    if (!selectedKitchenNotes.includes(rawKey)) selectedKitchenNotes.push(rawKey);
  } else {
    selectedKitchenNotes = selectedKitchenNotes.filter(x => x !== rawKey);
  }
}

function clearKitchenNotes() {
  selectedKitchenNotes = [];
  document.querySelectorAll('.kn-chip').forEach(b => b.classList.remove('active'));
}

function addQuickItem(id, ev) {
  if (ev) ev.stopPropagation();
  playGoldChime('tap');
  quickItemsAdded[id] = (quickItemsAdded[id] || 0) + 1;
  renderQuickItemsMenu();
  renderStaffCatalog();
  updateStagedOrderList();
}

function removeQuickItem(id, ev) {
  if (ev) ev.stopPropagation();
  playGoldChime('tap');
  if (quickItemsAdded[id]) {
    quickItemsAdded[id]--;
    if (quickItemsAdded[id] <= 0) {
      delete quickItemsAdded[id];
    }
  }
  renderQuickItemsMenu();
  renderStaffCatalog();
  updateStagedOrderList();
}

function deleteQuickItemCompletely(id, ev) {
  if (ev) ev.stopPropagation();
  playGoldChime('tap');
  delete quickItemsAdded[id];
  renderQuickItemsMenu();
  renderStaffCatalog();
  updateStagedOrderList();
}

function findProductById(id) {
  if (!globalServerState.menu || !globalServerState.menu.categories) return null;
  for (const cat of globalServerState.menu.categories) {
    const item = cat.items.find(x => x.id === id);
    if (item) return { ...item, categoryId: cat.id };
  }
  return null;
}

function inferItemStation(item) {
  if (item.station) return item.station;
  if (item.weight) return 'grill';
  const cat = (item.categoryId || '').toLowerCase();
  const ic = (item.icon || '').toLowerCase();
  const id = (item.id || '').toLowerCase();
  if (cat.includes('drink') || cat.includes('beer') || cat.includes('coffee') || ic === 'beer' || ic === 'coffee' || ic === 'soda' || id.startsWith('b') || id.startsWith('d') || id.startsWith('c')) {
    return 'bar';
  }
  if (ic === 'drumstick' || cat.includes('grill') || cat.includes('meat')) {
    return 'grill';
  }
  return 'kitchen';
}

function updateStagedOrderList() {
  const container = document.getElementById('stagedOrderBox');
  const netWeight = getNetWeight();
  let totalLAK = 0;
  let itemCount = 0;
  let html = '';

  // Meat item
  if (netWeight > 0) {
    itemCount += 1;
    const unitPrice = getSelectedGradePrice();
    const meatTotal = Math.round(netWeight * unitPrice);
    totalLAK += meatTotal;
    const grades = (globalServerState.menu && globalServerState.menu.meatGrades) || [];
    const grade = grades.find(g => g.id === selectedGradeId) || { nameLo: 'ຊີ້ນລວມ', nameTh: 'หมูรวม' };
    const gradeName = currentLang === 'lo' ? grade.nameLo : grade.nameTh;

    html += `
      <div class="staged-item-row meat-staged-row">
        <span class="staged-name">${icon(itemIconName(grade.icon), 'ic-sm')}${gradeName} (${netWeight} kg)</span>
        <div class="staged-controls-wrap">
          <span style="color:var(--gold-300); font-weight:700;">${meatTotal.toLocaleString()} ₭</span>
          <button class="staged-del-btn" onclick="tapClear()" title="ລຶບ/Clear">${icon('x', 'ic-xs')}</button>
        </div>
      </div>
    `;
  }

  // Quick items (beverages, addons, freebies, dishes)
  Object.keys(quickItemsAdded).forEach(id => {
    const qty = quickItemsAdded[id];
    const prod = findProductById(id);
    if (prod) {
      itemCount += qty;
      const sub = qty * prod.priceLAK;
      totalLAK += sub;
      const prodName = currentLang === 'lo' ? prod.nameLo : prod.nameTh;
      const isFree = prod.priceLAK === 0 || prod.isFreebie;
      const priceText = isFree
        ? `<span class="badge-freebie-sm">${currentLang === 'lo' ? 'ຟຣີ' : 'ฟรี'}</span>`
        : `${sub.toLocaleString()} ₭`;
      html += `
        <div class="staged-item-row" id="staged_row_${id}">
          <div class="staged-name-wrap">
            <span class="staged-name">${icon(itemIconName(prod.icon), 'ic-sm')}${prodName}</span>
          </div>
          <div class="staged-controls-wrap">
            <div class="staged-stepper">
              <button class="staged-step-btn minus" onclick="removeQuickItem('${id}', event)" title="ຫຼຸດ">${icon('minus', 'ic-xs')}</button>
              <span class="staged-step-qty">${qty}</span>
              <button class="staged-step-btn plus" onclick="addQuickItem('${id}', event)" title="ເພີ່ມ">${icon('plus', 'ic-xs')}</button>
            </div>
            <span class="staged-subtotal">${priceText}</span>
            <button class="staged-del-btn" onclick="deleteQuickItemCompletely('${id}', event)" title="ລຶບ">${icon('trash', 'ic-xs')}</button>
          </div>
        </div>
      `;
    }
  });

  if (!html) {
    container.innerHTML = `<div style="color: var(--text-muted); font-size: 0.75rem; text-align: center; padding: 10px;" id="emptyStagedHint">${i18n[currentLang].emptyStagedHint}</div>`;
  } else {
    container.innerHTML = html;
  }

  const clearMiniBtn = document.getElementById('clearCartMiniBtn');
  if (clearMiniBtn) clearMiniBtn.style.display = itemCount > 0 ? 'inline-flex' : 'none';

  document.getElementById('stagedTotalText').textContent = `${totalLAK.toLocaleString()} ₭`;
  updateSubmitButtonText(totalLAK, itemCount);
}

function updateSubmitButtonText(totalLAK, itemCount = 0) {
  const btnText = document.getElementById('submitOrderBtnText');
  const mfcSubmitText = document.getElementById('mfcSubmitText');
  let label = '';
  if (currentOrderMode === 'dinein') {
    const tbText = currentLang === 'lo' ? `ໂຕະ ${selectedTableId}` : `โต๊ะ ${selectedTableId}`;
    label = `${i18n[currentLang].submitOrderDineIn} ${tbText} (${totalLAK.toLocaleString()} ₭)`;
  } else {
    label = `${i18n[currentLang].submitOrderTakeaway} • ${totalLAK.toLocaleString()} ₭`;
  }
  if (btnText) btnText.textContent = label;
  if (mfcSubmitText) {
    mfcSubmitText.textContent = currentOrderMode === 'dinein'
      ? (currentLang === 'lo' ? `ບັນທຶກ ໂຕະ ${selectedTableId}` : `บันทึกลง โต๊ะ ${selectedTableId}`)
      : (currentLang === 'lo' ? 'ຄິດເງິນກັບບ້ານ' : 'คิดเงินกลับบ้าน');
  }

  // Update mobile floating cart bar
  const mfcBar = document.getElementById('mobileFloatingCartBar');
  if (mfcBar) {
    const shouldShow = itemCount > 0 && currentView === 'staff';
    mfcBar.classList.toggle('visible', shouldShow);
    mfcBar.style.display = shouldShow ? '' : 'none';
    const rate = (globalServerState.settings && globalServerState.settings.exchangeRate) || 630;
    const thb = Math.round(totalLAK / rate);
    const badgeEl = document.getElementById('mfcCountBadge');
    const lakEl = document.getElementById('mfcTotalLAK');
    const thbEl = document.getElementById('mfcTotalTHB');
    if (badgeEl) badgeEl.textContent = itemCount;
    if (lakEl) lakEl.textContent = `${totalLAK.toLocaleString()} ₭`;
    if (thbEl) thbEl.textContent = `≈ ${thb.toLocaleString()} ฿`;
  }
}

// ─── SUBMIT ORDER ACTION ───
function submitCurrentOrder() {
  const netWeight = getNetWeight();
  const items = [];
  const activeNotes = [];
  document.querySelectorAll('.kn-chip.active').forEach(chip => {
    const tEl = chip.querySelector('.kn-t');
    activeNotes.push(tEl ? (currentLang === 'lo' ? tEl.dataset.lo : tEl.dataset.th) : chip.textContent.trim());
  });
  const noteStr = activeNotes.join(', ');

  if (netWeight > 0) {
    const unitPrice = getSelectedGradePrice();
    const grades = (globalServerState.menu && globalServerState.menu.meatGrades) || [];
    const grade = grades.find(g => g.id === selectedGradeId) || { nameLo: 'ຊີ້ນລວມ', nameTh: 'หมูรวม' };
    items.push({
      id: `meat_${Date.now()}`,
      name: grade.nameLo,
      nameLo: grade.nameLo,
      nameTh: grade.nameTh,
      weight: netWeight,
      unitPrice,
      total: Math.round(netWeight * unitPrice),
      station: 'grill',
      note: noteStr
    });
  }

  Object.keys(quickItemsAdded).forEach(id => {
    const qty = quickItemsAdded[id];
    const prod = findProductById(id);
    if (prod) {
      items.push({
        id: `${id}_${Date.now()}`,
        name: prod.nameLo,
        nameLo: prod.nameLo,
        nameTh: prod.nameTh,
        qty,
        unitPrice: prod.priceLAK,
        total: qty * prod.priceLAK,
        station: inferItemStation(prod),
        note: noteStr
      });
    }
  });

  if (items.length === 0) {
    alert(currentLang === 'lo' ? 'ກະລຸນາໃສ່ນ້ຳໜັກ ຫຼື ເລືອກສິນຄ້າກ່ອນ' : 'กรุณาใส่น้ำหนัก หรือเลือกสินค้าก่อน');
    return;
  }

  playGoldChime('success');

  if (currentOrderMode === 'dinein') {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'ADD_ORDER_TO_TABLE',
        payload: {
          tableId: selectedTableId,
          items,
          createdBy: currentLang === 'lo' ? 'ພະນັກງານຈຸດຊັ່ງ' : 'พนักงานจุดชั่ง'
        }
      }));
    }
    const tbLabel = currentLang === 'lo' ? `ໂຕະ ${selectedTableId}` : `โต๊ะ ${selectedTableId}`;
    showToast(`${i18n[currentLang].toastSuccess} (${tbLabel})`);
    resetInputForm();
  } else {
    // Takeaway mode -> trigger checkout modal immediately
    const totalLAK = items.reduce((sum, item) => sum + item.total, 0);
    openCheckoutModal({
      type: 'takeaway',
      items,
      totalLAK,
      title: currentLang === 'lo' ? 'ຊື້ກັບບ້ານ (Takeaway)' : 'ซื้อกลับบ้าน'
    });
  }
}

function resetInputForm() {
  rawWeightInput = '';
  quickItemsAdded = {};
  clearKitchenNotes();
  renderQuickItemsMenu();
  renderStaffCatalog();
  calculateAndRenderWeight();
}

// ─── CHECKOUT & PAYMENT MODAL (BCEL ONE & CASH) ───
function openCheckoutModal(data) {
  currentModalTarget = data;
  currentPaymentMethod = 'BCEL One';
  switchPaymentTab('bcel');

  const modal = document.getElementById('checkoutModal');
  const amountLAK = data.totalLAK;
  const rate = (globalServerState.settings && globalServerState.settings.exchangeRate) || 630;
  const amountTHB = Math.round(amountLAK / rate);

  document.getElementById('modalTableOrOrderId').textContent = data.title;
  document.getElementById('modalAmountLAK').textContent = `${amountLAK.toLocaleString()} ₭`;
  document.getElementById('modalAmountTHB').textContent = `≈ ${amountTHB.toLocaleString()} บาท`;

  // Render QR Code & Bank Info
  const s = globalServerState.settings || {};
  const bankName = s.bankName || 'BCEL One / LAO QR';
  const bankAcc = s.bankAccountNumber || '01012-0000-8888-99';
  const accName = s.bankAccountName || 'KHAMTHONG SINDAD SHOP';

  const elBankTitle = document.getElementById('checkoutBankTitle');
  if (elBankTitle) elBankTitle.textContent = bankName;

  const elAccInfo = document.getElementById('checkoutAccInfo');
  if (elAccInfo) elAccInfo.textContent = `${bankAcc} • ${accName}`;

  const qrImg = document.getElementById('qrCodeImg');
  if (qrImg) {
    if (s.customQrImg) {
      qrImg.src = s.customQrImg;
    } else {
      const qrString = `LAOQR:${bankName}|ACC=${bankAcc}|NAME=${encodeURIComponent(accName)}|AMT=${amountLAK}|CUR=LAK|TIME=${Date.now()}`;
      const fallbackUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=4&data=${encodeURIComponent(qrString)}`;
      fetch(`/api/qr?text=${encodeURIComponent(qrString)}`)
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => {
          qrImg.src = (data && data.dataUrl) ? data.dataUrl : fallbackUrl;
        })
        .catch(() => {
          qrImg.src = fallbackUrl;
        });
    }
  }

  // Reset cash fields
  document.getElementById('cashReceivedInput').value = '';
  document.getElementById('changeAmountVal').textContent = '0 ₭';

  modal.classList.add('active');
}

function closeCheckoutModal() {
  playGoldChime('tap');
  document.getElementById('checkoutModal').classList.remove('active');
  currentModalTarget = null;
}

function switchPaymentTab(tab) {
  playGoldChime('tap');
  currentPaymentMethod = tab === 'bcel' ? 'BCEL One' : (tab === 'split' ? 'Smart Split' : 'Cash');
  const bcelBtn = document.getElementById('payTabBcel');
  const cashBtn = document.getElementById('payTabCash');
  const splitBtn = document.getElementById('payTabSplit');

  if (bcelBtn) bcelBtn.classList.toggle('active', tab === 'bcel');
  if (cashBtn) cashBtn.classList.toggle('active', tab === 'cash');
  if (splitBtn) splitBtn.classList.toggle('active', tab === 'split');

  const bcelSec = document.getElementById('bcelContentSection');
  const cashSec = document.getElementById('cashContentSection');
  const splitSec = document.getElementById('splitContentSection');

  if (bcelSec) bcelSec.style.display = tab === 'bcel' ? 'flex' : 'none';
  if (cashSec) cashSec.style.display = tab === 'cash' ? 'flex' : 'none';
  if (splitSec) splitSec.style.display = tab === 'split' ? 'flex' : 'none';

  if (tab === 'cash') {
    setCashExact();
  } else if (tab === 'split') {
    renderSplitBillDetails();
  }
}

// ─── VIP SMART SPLIT BILL LOGIC ───
let currentSplitCount = 2;
let splitPayerPaidStatus = {};

function setSplitCount(count) {
  playGoldChime('tap');
  currentSplitCount = count;
  splitPayerPaidStatus = {};
  [2, 3, 4, 5, 6].forEach(n => {
    const btn = document.getElementById(`splitBtn${n}`);
    if (btn) btn.classList.toggle('active', n === count);
  });
  renderSplitBillDetails();
}

function renderSplitBillDetails() {
  if (!currentModalTarget) return;
  const total = currentModalTarget.totalLAK || 0;
  const count = currentSplitCount || 2;
  const perPerson = Math.ceil(total / count);
  const rate = (globalServerState.settings && globalServerState.settings.exchangeRate) || 650;
  const perPersonTHB = Math.round(perPerson / rate);

  const lakEl = document.getElementById('splitPerPersonLAK');
  const thbEl = document.getElementById('splitPerPersonTHB');
  if (lakEl) lakEl.textContent = `${perPerson.toLocaleString()} ₭`;
  if (thbEl) thbEl.textContent = `≈ ${perPersonTHB.toLocaleString()} บาท / ${currentLang === 'lo' ? 'ຄົນ' : 'คน'}`;

  // Generate split QR
  const s = globalServerState.settings || {};
  const splitQrImg = document.getElementById('splitQrCodeImg');
  if (splitQrImg) {
    if (s.customQrImg) {
      splitQrImg.src = s.customQrImg;
    } else {
      const qrText = `LAOQR:SPLIT|ACC=${s.bankAccountNumber || '01012'}|AMT=${perPerson}|CUR=LAK|SHARE=${count}`;
      const fallbackUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=4&data=${encodeURIComponent(qrText)}`;
      fetch(`/api/qr?text=${encodeURIComponent(qrText)}`)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(d => { splitQrImg.src = (d && d.dataUrl) ? d.dataUrl : fallbackUrl; })
        .catch(() => { splitQrImg.src = fallbackUrl; });
    }
  }

  // Render checklist
  const listWrap = document.getElementById('splitChecklistWrap');
  if (!listWrap) return;
  let html = '';
  for (let i = 1; i <= count; i++) {
    const isPaid = !!splitPayerPaidStatus[i];
    html += `
      <div class="split-checklist-row ${isPaid ? 'paid' : ''}" onclick="toggleSplitPayerPaid(${i})">
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="font-weight:700;">${currentLang === 'lo' ? 'ຄົນທີ' : 'คนที่'} ${i}</span>
          <span style="color:var(--text-muted); font-size:0.68rem;">(${perPerson.toLocaleString()} ₭)</span>
        </div>
        <span class="split-status-tag ${isPaid ? 'paid' : 'waiting'}">
          ${isPaid ? (currentLang === 'lo' ? '✓ ຈ່າຍແລ້ວ' : '✓ จ่ายแล้ว') : (currentLang === 'lo' ? 'ລໍຖ້າຈ່າຍ' : 'รอชำระ')}
        </span>
      </div>
    `;
  }
  listWrap.innerHTML = html;
}

function toggleSplitPayerPaid(index) {
  playGoldChime('tap');
  splitPayerPaidStatus[index] = !splitPayerPaidStatus[index];
  renderSplitBillDetails();

  // Check if all payers completed
  let allDone = true;
  for (let i = 1; i <= currentSplitCount; i++) {
    if (!splitPayerPaidStatus[i]) {
      allDone = false;
      break;
    }
  }

  if (allDone) {
    playGoldChime('success');
    showToast(currentLang === 'lo' ? '🎉 ຊຳລະຄົບທຸກຄົນແລ້ວ! ປິດບິນສຳເລັດ' : '🎉 ชำระครบทุกคนแล้ว! ปิดบิลเรียบร้อย');
    setTimeout(() => {
      confirmCheckoutPayment();
    }, 700);
  }
}

// Cash Tender Calculations
function addCashPreset(addAmt) {
  playGoldChime('tap');
  const input = document.getElementById('cashReceivedInput');
  const current = parseInt(input.value) || 0;
  input.value = current + addAmt;
  calculateCashChange();
}

function setCashExact() {
  playGoldChime('tap');
  if (currentModalTarget) {
    document.getElementById('cashReceivedInput').value = currentModalTarget.totalLAK;
    calculateCashChange();
  }
}

function clearCashTender() {
  playGoldChime('tap');
  document.getElementById('cashReceivedInput').value = '';
  calculateCashChange();
}

function calculateCashChange() {
  if (!currentModalTarget) return;
  const received = parseInt(document.getElementById('cashReceivedInput').value) || 0;
  const total = currentModalTarget.totalLAK;
  const change = Math.max(0, received - total);
  document.getElementById('changeAmountVal').textContent = `${change.toLocaleString()} ₭`;
}

function confirmCheckoutPayment() {
  if (!currentModalTarget) return;
  playGoldChime('success');

  const received = parseInt(document.getElementById('cashReceivedInput').value) || currentModalTarget.totalLAK;
  const change = Math.max(0, received - currentModalTarget.totalLAK);

  if (currentModalTarget.type === 'takeaway') {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'CREATE_TAKEAWAY',
        payload: {
          items: currentModalTarget.items,
          totalLAK: currentModalTarget.totalLAK,
          paymentMethod: currentPaymentMethod,
          cashReceivedLAK: received,
          changeLAK: change,
          createdBy: 'ພະນັກງານ'
        }
      }));
    }
    showToast(currentLang === 'lo' ? 'ຊຳລະເງິນສຳເລັດແລ້ວ! ຂອບໃຈ' : 'ชำระเงินสำเร็จเรียบร้อย! ขอบคุณ');
    resetInputForm();
  } else if (currentModalTarget.type === 'table') {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'CHECKOUT_TABLE',
        payload: {
          tableId: currentModalTarget.tableId,
          paymentMethod: currentPaymentMethod,
          cashReceivedLAK: received,
          changeLAK: change
        }
      }));
    }
    showToast(currentLang === 'lo' ? `ເຊັກບິນ ໂຕະ ${currentModalTarget.tableId} ສຳເລັດ!` : `เช็กบิล โต๊ะ ${currentModalTarget.tableId} เรียบร้อย!`);
  }

  closeCheckoutModal();
}

// ─── THERMAL RECEIPT PRINTING (58mm / 80mm) ───
function printReceiptForCurrentOrder() {
  if (!currentModalTarget) return;
  
  const settings = globalServerState.settings || {};
  const isVip = settings.isVipLicensed;
  const vipBadgeEl = document.getElementById('receiptVipBadge');
  if (vipBadgeEl) {
    vipBadgeEl.style.display = isVip ? 'block' : 'none';
  }
  document.getElementById('receiptStoreName').textContent = currentLang === 'lo' ? settings.storeNameLo : settings.storeNameTh;
  document.getElementById('receiptStoreTagline').textContent = currentLang === 'lo' ? settings.taglineLo : settings.taglineTh;
  document.getElementById('receiptStorePhone').textContent = `ໂທ: ${settings.phone || '+856 20 5555 9999'}`;
  document.getElementById('receiptDateTime').textContent = new Date().toLocaleString('th-TH');
  
  const orderTitle = currentModalTarget.title;
  document.getElementById('receiptTableName').textContent = orderTitle;
  document.getElementById('receiptBillNo').textContent = `ບິນເລກທີ: #${Date.now().toString().slice(-6)}`;
  document.getElementById('receiptPaymentMethod').textContent = currentPaymentMethod;

  // Render receipt items
  let itemsHtml = '';
  let itemsToPrint = [];

  if (currentModalTarget.type === 'takeaway') {
    itemsToPrint = currentModalTarget.items;
  } else if (currentModalTarget.type === 'table') {
    const table = globalServerState.tables.find(t => t.id === currentModalTarget.tableId);
    if (table) itemsToPrint = table.items;
  }

  itemsToPrint.forEach(item => {
    const desc = item.weight ? `${item.name} (${item.weight} kg)` : `${item.name} x${item.qty}`;
    itemsHtml += `
      <div class="receipt-line">
        <span>${desc}</span>
        <span>${item.total.toLocaleString()} ₭</span>
      </div>
    `;
  });

  document.getElementById('receiptItemsList').innerHTML = itemsHtml;
  document.getElementById('receiptTotalLAK').textContent = `${currentModalTarget.totalLAK.toLocaleString()} ₭`;
  const rate = settings.exchangeRate || 630;
  document.getElementById('receiptTotalTHB').textContent = `≈ ${Math.round(currentModalTarget.totalLAK / rate).toLocaleString()} บาท`;

  window.print();
}

// ─── TABLE INSPECTOR MODAL ───
function openTableInspector(tableId) {
  playGoldChime('tap');
  inspectingTableId = tableId;
  const table = globalServerState.tables.find(t => t.id === tableId);
  if (!table) return;

  document.getElementById('inspectModalTitle').textContent = `${currentLang === 'lo' ? 'ລາຍລະອຽດ' : 'รายละเอียด'} ${currentLang === 'lo' ? table.nameLo : table.nameTh}`;
  document.getElementById('inspectTableStatusBadge').textContent = table.status === 'occupied' 
    ? (currentLang === 'lo' ? 'ກຳລັງກິນ' : 'มีลูกค้านั่ง') 
    : (currentLang === 'lo' ? 'ວ່າງ' : 'โต๊ะว่าง');

  let html = '';
  if (table.items.length === 0) {
    html = `<div style="color:var(--text-muted); font-size:0.8rem; text-align:center; padding:16px;">ບໍ່ມີລາຍການສິນຄ້າ</div>`;
  } else {
    table.items.forEach((item, idx) => {
      const desc = item.weight ? `${item.name} (${item.weight} kg)` : `${item.name} x${item.qty}`;
      html += `
        <div class="inspect-item-row">
          <div>
            <div style="font-weight:700; color:#FFF;">${desc}</div>
            <div style="font-size:0.7rem; color:var(--text-muted);">${item.time || ''} • ${item.total.toLocaleString()} ₭</div>
          </div>
          <button class="btn-void" onclick="voidItemFromTable(${tableId}, ${idx})">
            ${currentLang === 'lo' ? 'ຍົກເລີກ' : 'ยกเลิก'}
          </button>
        </div>
      `;
    });
  }

  document.getElementById('inspectItemsList').innerHTML = html;
  document.getElementById('inspectModalTotal').textContent = `${table.subtotalLAK.toLocaleString()} ₭`;
  document.getElementById('tableInspectModal').classList.add('active');
}

function closeTableInspector() {
  playGoldChime('tap');
  document.getElementById('tableInspectModal').classList.remove('active');
  inspectingTableId = null;
}

function voidItemFromTable(tableId, itemIndex) {
  const isVip = globalServerState.settings && globalServerState.settings.isVipLicensed;
  let managerPin = null;

  if (isVip) {
    managerPin = prompt(currentLang === 'lo' 
      ? '🛡️ VIP Anti-Theft Security:\nກະລຸນາໃສ່ລະຫັດ PIN ຜູ້ຈັດການເພື່ອຍົກເລີກລາຍການ (Default PIN: 8888):' 
      : '🛡️ VIP Anti-Theft Security:\nกรุณากรอกรหัส PIN ผู้จัดการเพื่อยกเลิกรายการ (Default PIN: 8888):');
    if (!managerPin) return;
  } else {
    if (!confirm(i18n[currentLang].voidItemConfirm)) return;
  }

  playGoldChime('tap');
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'VOID_TABLE_ITEM',
      payload: { tableId, itemIndex, managerPin }
    }));
  }
  setTimeout(() => {
    openTableInspector(tableId);
  }, 200);
}

function checkoutFromInspector() {
  if (!inspectingTableId) return;
  const table = globalServerState.tables.find(t => t.id === inspectingTableId);
  closeTableInspector();
  if (table && table.status === 'occupied') {
    openCheckoutModal({
      type: 'table',
      tableId: table.id,
      totalLAK: table.subtotalLAK,
      title: `${currentLang === 'lo' ? 'ເຊັກບິນ' : 'เช็กบิล'} ${currentLang === 'lo' ? table.nameLo : table.nameTh}`
    });
  }
}

// ─── STORE SETTINGS MODAL ───
function openSettingsModal() {
  playGoldChime('tap');
  const settings = globalServerState.settings || {};
  document.getElementById('settingStoreNameLo').value = settings.storeNameLo || 'ຄຳທອງ ຊິ້ນດາດ & ປິ້ງຍ່າງ';
  const elPhone = document.getElementById('settingPhone');
  if (elPhone) elPhone.value = settings.phone || '+856 20 5555 9999';
  const elLocation = document.getElementById('settingLocation');
  if (elLocation) elLocation.value = settings.addressTh || settings.addressLo || 'ນະຄອນຫຼວງວຽງຈັນ';
  document.getElementById('settingExchangeRate').value = settings.exchangeRate || 630;
  document.getElementById('settingTareWeight').value = settings.defaultTareWeight || 0.15;

  // Bank & QR Code settings
  const elBank = document.getElementById('settingBankName');
  if (elBank) elBank.value = settings.bankName || 'BCEL One / LAO QR';
  const elAcc = document.getElementById('settingBankAccountNumber');
  if (elAcc) elAcc.value = settings.bankAccountNumber || '01012-0000-8888-99';
  const elAccName = document.getElementById('settingBankAccountName');
  if (elAccName) elAccName.value = settings.bankAccountName || 'KHAMTHONG SINDAD SHOP';
  const elCustomQr = document.getElementById('settingCustomQrImg');
  if (elCustomQr) {
    elCustomQr.value = settings.customQrImg || '';
    updateQrPreviewState(settings.customQrImg);
  }

  const grades = (globalServerState.menu && globalServerState.menu.meatGrades) || [];
  const mixed = grades.find(g => g.id === 'mixed');
  const premium = grades.find(g => g.id === 'premium');
  if (mixed) document.getElementById('settingPriceMixed').value = mixed.priceLAK;
  if (premium) document.getElementById('settingPricePremium').value = premium.priceLAK;

  const isScale = settings.scaleMode !== false;
  const pMixedGrp = document.getElementById('settingPriceMixedGroup');
  if (pMixedGrp) pMixedGrp.style.display = isScale ? 'flex' : 'none';
  const pPremGrp = document.getElementById('settingPricePremGroup');
  if (pPremGrp) pPremGrp.style.display = isScale ? 'flex' : 'none';

  document.getElementById('settingsModal').classList.add('active');
}

function updateQrPreviewState(url) {
  const wrap = document.getElementById('qrPreviewWrap');
  const img = document.getElementById('qrPreviewImg');
  const badge = document.getElementById('qrStatusBadge');
  if (url && url.trim()) {
    if (wrap) wrap.style.display = 'flex';
    if (img) img.src = url.trim();
    if (badge) {
      badge.textContent = currentLang === 'lo' ? 'Custom QR ຮ້ານ' : 'Custom QR ร้าน';
      badge.style.color = 'var(--gold-300)';
    }
  } else {
    if (wrap) wrap.style.display = 'none';
    if (badge) {
      badge.textContent = 'Auto Dynamic QR';
      badge.style.color = 'var(--text-muted)';
    }
  }
}

function handleQrFileUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert(currentLang === 'lo' ? 'ກະລຸນາເລືອກໄຟລ໌ຮູບພາບ' : 'กรุณาเลือกไฟล์รูปภาพ');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    const input = document.getElementById('settingCustomQrImg');
    if (input) input.value = dataUrl;
    updateQrPreviewState(dataUrl);
    playGoldChime('success');
    showToast(currentLang === 'lo' ? 'ໂຫຼດຮູບ QR ສຳເລັດແລ້ວ' : 'โหลดรูป QR เรียบร้อยแล้ว');
  };
  reader.readAsDataURL(file);
}

function clearCustomQrImage() {
  playGoldChime('tap');
  const input = document.getElementById('settingCustomQrImg');
  if (input) input.value = '';
  const fileInput = document.getElementById('settingCustomQrFileInput');
  if (fileInput) fileInput.value = '';
  updateQrPreviewState('');
  showToast(currentLang === 'lo' ? 'ປ່ຽນກັບມາໃຊ້ BCEL One ອັດຕະໂນມັດ' : 'เปลี่ยนกลับมาใช้ BCEL One อัตโนมัติ');
}

function closeSettingsModal() {
  playGoldChime('tap');
  document.getElementById('settingsModal').classList.remove('active');
}

function saveStoreSettings() {
  playGoldChime('success');
  const storeNameLo = document.getElementById('settingStoreNameLo').value;
  const phone = document.getElementById('settingPhone') ? document.getElementById('settingPhone').value.trim() : '+856 20 5555 9999';
  const location = document.getElementById('settingLocation') ? document.getElementById('settingLocation').value.trim() : 'ນະຄອນຫຼວງວຽງຈັນ';
  const exchangeRate = parseInt(document.getElementById('settingExchangeRate').value) || 630;
  const defaultTareWeight = parseFloat(document.getElementById('settingTareWeight').value) || 0.15;

  const bankName = document.getElementById('settingBankName') ? document.getElementById('settingBankName').value : 'BCEL One / LAO QR';
  const bankAccountNumber = document.getElementById('settingBankAccountNumber') ? document.getElementById('settingBankAccountNumber').value : '01012-0000-8888-99';
  const bankAccountName = document.getElementById('settingBankAccountName') ? document.getElementById('settingBankAccountName').value : 'KHAMTHONG SINDAD SHOP';
  const customQrImg = document.getElementById('settingCustomQrImg') ? document.getElementById('settingCustomQrImg').value.trim() : '';

  const priceMixed = parseInt(document.getElementById('settingPriceMixed').value) || 95000;
  const pricePremium = parseInt(document.getElementById('settingPricePremium').value) || 145000;

  customTareWeight = defaultTareWeight;

  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'UPDATE_SETTINGS',
      payload: {
        settings: {
          storeNameLo,
          storeNameTh: storeNameLo,
          phone,
          addressLo: location,
          addressTh: location,
          exchangeRate,
          defaultTareWeight,
          bankName,
          bankAccountNumber,
          bankAccountName,
          customQrImg
        },
        meatPrices: { mixed: priceMixed, premium: pricePremium }
      }
    }));
  }

  showToast(currentLang === 'lo' ? 'ບັນທຶກການຕັ້ງຄ່າຮ້ານລົງເຄື່ອງສຳເລັດ' : 'บันทึกการตั้งค่าร้านลงเครื่องเรียบร้อย');
  closeSettingsModal();
}

function closeDailyRegister() {
  if (confirm(currentLang === 'lo' ? 'ທ່ານຕ້ອງການປິດຍອດປະຈຳວັນ ແລະ ເລີ່ມຮອບໃໝ່ແທ້ບໍ່?' : 'คุณต้องการปิดยอดประจำวันและเริ่มรอบใหม่จริงหรือไม่?')) {
    playGoldChime('success');
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'CLOSE_DAILY_REGISTER' }));
    }
    showToast('ປິດຍອດປະຈຳວັນຮຽບຮ້ອຍແລ້ວ');
    closeSettingsModal();
  }
}

// ─── VOICE ORDER SIMULATION & SPEECH RECOGNITION ───
let isVoiceListening = false;
let recognition = null;

function toggleVoiceOrder() {
  playGoldChime('tap');
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognition) {
    if (isVoiceListening) {
      if (recognition) recognition.stop();
      setVoiceListeningState(false);
      return;
    }

    try {
      recognition = new SpeechRecognition();
      recognition.lang = currentLang === 'lo' ? 'lo-LA' : 'th-TH';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setVoiceListeningState(true);
        showToast(currentLang === 'lo' ? 'ກຳລັງຟັງສຽງ... ເຊັ່ນ: "ໂຕະ 3 ໝູ 1 ໂລ ເບຍ 2"' : 'กำลังฟังเสียง... เช่น "โต๊ะ 3 หมู 1 โล เบียร์ 2"');
      };

      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        parseVoiceCommand(transcript);
        setVoiceListeningState(false);
      };

      recognition.onerror = () => {
        simulateVoiceCommand();
        setVoiceListeningState(false);
      };

      recognition.onend = () => {
        setVoiceListeningState(false);
      };

      recognition.start();
    } catch (err) {
      simulateVoiceCommand();
    }
  } else {
    simulateVoiceCommand();
  }
}

function setVoiceListeningState(listening) {
  isVoiceListening = listening;
  const btn = document.getElementById('voiceBtn');
  btn.classList.toggle('listening', listening);
}

function simulateVoiceCommand() {
  const samplePhrase = currentLang === 'lo' ? 'ໂຕະ 3 • ຊີ້ນ 1.2 kg • ເບຍລາວ 2' : 'โต๊ะ 3 • หมู 1.2 kg • เบียร์ลาว 2';
  showToast(`"${samplePhrase}"`);

  selectedTableId = 3;
  rawWeightInput = '1.20';
  quickItemsAdded['b1'] = 2;
  const badge = document.getElementById('count_b1');
  if (badge) {
    badge.textContent = '2';
    badge.style.display = 'flex';
  }

  calculateAndRenderWeight();
  renderStaffTablePills();
}

function parseVoiceCommand(text) {
  showToast(`"${text}"`);
  if (text.includes('1') || text.includes('ໜຶ່ງ') || text.includes('หนึ่ง')) rawWeightInput = '1.00';
  if (text.includes('2') || text.includes('ສອງ') || text.includes('สอง')) rawWeightInput = '2.00';
  if (text.includes('ເຄິ່ງ') || text.includes('ครึ่ง')) rawWeightInput = '0.50';
  if (text.includes('ເບຍ') || text.includes('เบียร์')) {
    quickItemsAdded['b1'] = (quickItemsAdded['b1'] || 0) + 1;
    const badge = document.getElementById('count_b1');
    if (badge) {
      badge.textContent = quickItemsAdded['b1'];
      badge.style.display = 'flex';
    }
  }
  calculateAndRenderWeight();
}

// ─── VIEW & LANGUAGE TOGGLING ───
function switchView(view) {
  playGoldChime('tap');
  currentView = view;
  const staffBtn = document.getElementById('viewStaffBtn');
  const kitchenBtn = document.getElementById('viewKitchenBtn');
  const ownerBtn = document.getElementById('viewOwnerBtn');

  if (staffBtn) staffBtn.classList.toggle('active', view === 'staff');
  if (kitchenBtn) kitchenBtn.classList.toggle('active', view === 'kitchen');
  if (ownerBtn) ownerBtn.classList.toggle('active', view === 'owner');

  const staffView = document.getElementById('staffView');
  const kitchenView = document.getElementById('kitchenView');
  const ownerView = document.getElementById('ownerView');
  const qcBar = document.getElementById('quickConceptBar');

  if (staffView) staffView.style.display = view === 'staff' ? 'grid' : 'none';
  if (kitchenView) kitchenView.style.display = view === 'kitchen' ? 'flex' : 'none';
  if (ownerView) ownerView.style.display = view === 'owner' ? 'flex' : 'none';
  if (qcBar) qcBar.style.display = view === 'staff' ? 'flex' : 'none';

  renderAll();
  if (view === 'kitchen') {
    renderKdsView();
  }
}

function setOrderMode(mode) {
  playGoldChime('tap');
  currentOrderMode = mode;
  document.getElementById('modeDineIn').classList.toggle('active', mode === 'dinein');
  document.getElementById('modeTakeaway').classList.toggle('active', mode === 'takeaway');
  document.getElementById('tableSelectorContainer').style.display = mode === 'dinein' ? 'flex' : 'none';
  calculateAndRenderWeight();
}

function toggleLanguage() {
  playGoldChime('tap');
  currentLang = currentLang === 'lo' ? 'th' : 'lo';
  const flagCode = currentLang === 'lo' ? 'la' : 'th';
  document.getElementById('langFlag').innerHTML = window.flag(flagCode);
  document.getElementById('langLabel').textContent = i18n[currentLang].langLabel;

  const t = i18n[currentLang];
  const s = globalServerState.settings || {};
  document.getElementById('brandName').textContent = currentLang === 'lo' ? (s.storeNameLo || t.brandName) : (s.storeNameTh || t.brandName);
  document.getElementById('brandTagline').textContent = currentLang === 'lo' ? (s.taglineLo || t.brandTagline) : (s.taglineTh || t.brandTagline);
  document.getElementById('tabStaffText').textContent = t.tabStaffText;
  document.getElementById('tabOwnerText').textContent = t.tabOwnerText;
  document.getElementById('modeDineInTitle').textContent = t.modeDineInTitle;
  document.getElementById('modeDineInSub').textContent = t.modeDineInSub;
  document.getElementById('modeTakeawayTitle').textContent = t.modeTakeawayTitle;
  document.getElementById('modeTakeawaySub').textContent = t.modeTakeawaySub;
  document.getElementById('tareBtnText').textContent = t.tareBtnText;
  document.getElementById('voiceBtnText').textContent = t.voiceBtnText;
  document.getElementById('chooseTableLabel').textContent = t.chooseTableLabel;
  document.getElementById('beveragesLabel').textContent = t.beveragesLabel;
  document.getElementById('stagedListLabel').textContent = t.stagedListLabel;
  document.getElementById('statRevLabel').textContent = t.statRevLabel;
  document.getElementById('statMeatLabel').textContent = t.statMeatLabel;
  document.getElementById('statOrdersLabel').textContent = t.statOrdersLabel;
  document.getElementById('statPaymentLabel').textContent = t.statPaymentLabel;
  document.getElementById('ownerTableGridLabel').textContent = t.ownerTableGridLabel;
  document.getElementById('liveFeedLabel').textContent = t.liveFeedLabel;
  document.getElementById('qrPromptText').textContent = t.qrPromptText;
  document.getElementById('confirmPayBtnText').textContent = t.confirmPayBtnText;
  document.getElementById('cashTabLabel').textContent = t.cashTabLabel;
  document.getElementById('cashReceivedLabel').textContent = t.cashReceivedLabel;
  document.getElementById('changeTextLabel').textContent = t.changeTextLabel;

  const elModalTitle = document.getElementById('settingsModalTitle');
  if (elModalTitle) elModalTitle.textContent = currentLang === 'lo' ? 'ການຕັ້ງຄ່າຮ້ານ (Settings)' : 'ตั้งค่าร้านค้า (Settings)';
  const elSettingName = document.getElementById('settingLabelStoreName');
  if (elSettingName) elSettingName.textContent = currentLang === 'lo' ? 'ຊື່ຮ້ານ (Store Name)' : 'ชื่อร้าน (Store Name)';
  const elPriceMixed = document.getElementById('settingLabelPriceMixed');
  if (elPriceMixed) elPriceMixed.textContent = currentLang === 'lo' ? 'ລາຄາຊີ້ນລວມ (₭ / kg)' : 'ราคาเนื้อรวม (₭ / kg)';
  const elPricePrem = document.getElementById('settingLabelPricePremium');
  if (elPricePrem) elPricePrem.textContent = currentLang === 'lo' ? 'ລາຄາພຣີມ່ຽມ (₭ / kg)' : 'ราคาพรีเมียม (₭ / kg)';
  const elTare = document.getElementById('settingLabelTare');
  if (elTare) elTare.textContent = currentLang === 'lo' ? 'ຫັກຊາມ (Tare kg)' : 'หักกะละมัง (Tare kg)';
  const elRate = document.getElementById('settingLabelRate');
  if (elRate) elRate.textContent = currentLang === 'lo' ? 'ອັດຕາແລກປ່ຽນ (1฿ = ?₭)' : 'อัตราแลกเปลี่ยน (1฿ = ?₭)';
  const elSaveBtn = document.getElementById('saveSettingsBtnText');
  if (elSaveBtn) elSaveBtn.textContent = currentLang === 'lo' ? 'ບັນທຶກການຕັ້ງຄ່າ' : 'บันทึกการตั้งค่า';
  const elCloseReg = document.getElementById('closeRegisterBtnText');
  if (elCloseReg) elCloseReg.textContent = currentLang === 'lo' ? 'ປິດຍອດປະຈຳວັນ' : 'ปิดยอดประจำวัน';

  const elMenuModalTitle = document.getElementById('menuModalTitle');
  if (elMenuModalTitle) elMenuModalTitle.textContent = currentLang === 'lo' ? 'ຈັດການເມນູ & ຮູບແບບຮ້ານ (Menu Manager)' : 'จัดการเมนู & รูปแบบร้าน (Menu Manager)';
  const elTabConcept = document.getElementById('tabConceptLabel');
  if (elTabConcept) elTabConcept.textContent = currentLang === 'lo' ? 'ຮູບແບບຮ້ານ (Concepts)' : 'รูปแบบร้าน (Concepts)';
  const elTabItems = document.getElementById('tabItemsLabel');
  if (elTabItems) elTabItems.textContent = currentLang === 'lo' ? 'ລາຍການເມນູ (Menu Items)' : 'รายการเมนู (Menu Items)';
  const elSaveRate = document.getElementById('saveRateBtnText');
  if (elSaveRate) elSaveRate.textContent = currentLang === 'lo' ? 'ອັບເດດຄ່າເງິນທັນທີ' : 'อัปเดตอัตราแลกเปลี่ยนทันที';
  const elContactVip = document.getElementById('contactVipBtnText');
  if (elContactVip) elContactVip.textContent = currentLang === 'lo' ? 'ຕິດຕໍ່ອັບເກຣດຜ່ານ Mason BizApp Facebook' : 'ติดต่ออัปเกรดผ่าน Mason BizApp Facebook';
  const elConceptDesc = document.getElementById('conceptDescText');
  if (elConceptDesc) elConceptDesc.textContent = currentLang === 'lo' ? 'ເລືອກຮູບແບບຮ້ານເພື່ອໂຫຼດເມນູ ແລະ ລະບົບທີ່ເໝາະສົມທັນທີ (1-Click Switch):' : 'เลือกรูปแบบร้านเพื่อโหลดเมนูและระบบที่เหมาะสมทันที (1-Click Switch):';
  const elQrLabel = document.getElementById('settingLabelCustomQr');
  if (elQrLabel) elQrLabel.textContent = currentLang === 'lo' ? 'ຮູບພາບ QR Code ຮັບເງິນຂອງຮ້ານ (Custom QR Code)' : 'รูปภาพ QR Code รับเงินของร้าน (Custom QR Code)';
  const elBankHeader = document.getElementById('settingHeaderBank');
  if (elBankHeader) elBankHeader.textContent = currentLang === 'lo' ? 'ຕັ້ງຄ່າບັນຊີທະນາຄານ & QR Code ຮັບເງິນ' : 'ตั้งค่าบัญชีธนาคาร & QR Code รับเงิน';
  const elEodBtn = document.getElementById('eodReportBtnText');
  if (elEodBtn) elEodBtn.textContent = currentLang === 'lo' ? 'ສະຫຼຸບຍອດ EOD Report' : 'สรุปยอด EOD Report';

  // Quick Concept Switcher Bar & Kitchen Notes translations
  const qcBarLabel = document.getElementById('qcBarLabel');
  if (qcBarLabel) qcBarLabel.textContent = currentLang === 'lo' ? 'ຮູບແບບຮ້ານ (1-Tap):' : 'รูปแบบร้าน (1-Tap):';
  const qcSindad = document.getElementById('qcText_sindad');
  if (qcSindad) qcSindad.textContent = currentLang === 'lo' ? 'ຊີ້ນດາດ & ຊັ່ງໂລ' : 'หมูกระทะ & ชั่งโล';
  const qcRest = document.getElementById('qcText_restaurant');
  if (qcRest) qcRest.textContent = currentLang === 'lo' ? 'ຮ້ານອາຫານ & ຕາມສັ່ງ' : 'ร้านอาหาร & ตามสั่ง';
  const qcCafe = document.getElementById('qcText_cafe');
  if (qcCafe) qcCafe.textContent = currentLang === 'lo' ? 'ຄາເຟ່ & ກາເຟ' : 'คาเฟ่ & กาแฟ';
  const qcBar = document.getElementById('qcText_bar');
  if (qcBar) qcBar.textContent = currentLang === 'lo' ? 'ບາ & ຮ້ານເຫຼົ້າ' : 'บาร์ & ร้านเหล้า';
  const qcEdit = document.getElementById('qcText_edit');
  if (qcEdit) qcEdit.textContent = currentLang === 'lo' ? 'ເພີ່ມ/ແກ້ເມນູ' : 'เพิ่ม/แก้เมนู';
  const qcReg = document.getElementById('qcText_register');
  if (qcReg) qcReg.textContent = currentLang === 'lo' ? 'ຕັ້ງຊື່ຮ້ານຂອງທ່ານ (Save ລົງເຄື່ອງ)' : 'ตั้งชื่อร้านคุณ (เซฟลงเครื่อง)';

  const clearCartMiniText = document.getElementById('clearCartMiniText');
  if (clearCartMiniText) clearCartMiniText.textContent = currentLang === 'lo' ? 'ລ້າງ' : 'ล้าง';
  const knLabelText = document.getElementById('knLabelText');
  if (knLabelText) knLabelText.textContent = currentLang === 'lo' ? '📝 ສົ່ງຄົວ:' : '📝 ส่งครัว:';
  document.querySelectorAll('.kn-t').forEach(el => {
    el.textContent = currentLang === 'lo' ? el.dataset.lo : el.dataset.th;
  });

  const elKitchenTab = document.getElementById('tabKitchenText');
  if (elKitchenTab) elKitchenTab.textContent = currentLang === 'lo' ? 'ຫ້ອງຄົວ (KDS)' : 'ห้องครัว (KDS)';
  const elKdsTitle = document.getElementById('kdsTitleText');
  if (elKdsTitle) elKdsTitle.textContent = currentLang === 'lo' ? 'ໜ້າຈໍຫ້ອງຄົວ & ປຸງແຕ່ງ (Kitchen Display System)' : 'หน้าจอห้องครัว & ปรุงอาหาร (Kitchen Display System)';
  const elKdsFilterAll = document.getElementById('kdsFilterAll');
  if (elKdsFilterAll) elKdsFilterAll.textContent = currentLang === 'lo' ? 'ທັງໝົດ' : 'ทั้งหมด';
  const elSplitTab = document.getElementById('splitTabLabel');
  if (elSplitTab) elSplitTab.textContent = currentLang === 'lo' ? '👑 ຫານບິນ (Smart Split)' : '👑 หารบิล (Smart Split)';
  const elSplitPayer = document.getElementById('splitPayerLabel');
  if (elSplitPayer) elSplitPayer.textContent = currentLang === 'lo' ? 'ເລືອກຈຳນວນຄົນຫານ (Split Payers)' : 'เลือกจำนวนคนหาร (Split Payers)';
  const elSplitPerPerson = document.getElementById('splitPerPersonLabel');
  if (elSplitPerPerson) elSplitPerPerson.textContent = currentLang === 'lo' ? 'ຍອດຈ່າຍສະເລ່ຍຕໍ່ຄົນ:' : 'ยอดจ่ายเฉลี่ยต่อคน:';
  const elSplitQr = document.getElementById('splitQrLabel');
  if (elSplitQr) elSplitQr.textContent = currentLang === 'lo' ? 'ສະແກນຈ່າຍຍອດຄົນດຽວ' : 'สแกนจ่ายยอดคนเดียว';
  [2, 3, 4, 5, 6].forEach(n => {
    const btn = document.getElementById(`splitBtn${n}`);
    if (btn) btn.textContent = currentLang === 'lo' ? `${n} ຄົນ` : `${n} คน`;
  });

  const toggleBtnText = document.getElementById('toggleScaleViewText');
  if (toggleBtnText) toggleBtnText.textContent = staffLeftView === 'scale' ? (currentLang === 'lo' ? 'ສັ່ງຕາມເມນູ (Menu Mode)' : 'โหมดสั่งตามเมนู') : (currentLang === 'lo' ? 'ໂໝດຊັ່ງກິໂລ (Scale Mode)' : 'โหมดชั่งกิโล');

  renderAll();
}

function showToast(msg) {
  const toast = document.getElementById('toastBanner');
  document.getElementById('toastMsg').textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
}

// ─── RENDERING FUNCTIONS (120FPS V-SYNC OPTIMIZED) ───
function renderAll() {
  window.requestAnimationFrame(() => {
    renderHeaderRate();
    renderMeatGrades();
    renderQuickItemsMenu();
    renderStaffCatalog();
    renderStaffTablePills();
    renderOwnerMetrics();
    renderOwnerTablesGrid();
    renderActivityFeed();
    calculateAndRenderWeight();
    updateConceptBadge();
    updateVipBadgeState();
    if (currentView === 'kitchen') {
      renderKdsView();
    }
  });
}

function renderHeaderRate() {
  const rate = (globalServerState.settings && globalServerState.settings.exchangeRate) || 630;
  document.getElementById('rateBadge').textContent = `1฿ = ${rate.toLocaleString()}₭`;
}

function renderMeatGrades() {
  const container = document.getElementById('meatGradesContainer');
  if (!container || !globalServerState.menu) return;

  const grades = globalServerState.menu.meatGrades || [];
  let html = '';
  grades.forEach(grade => {
    const isActive = grade.id === selectedGradeId;
    const name = currentLang === 'lo' ? grade.nameLo : grade.nameTh;
    html += `
      <button class="grade-btn ${isActive ? 'active' : ''}" onclick="selectGrade('${grade.id}')">
        <div class="grade-name">${icon(itemIconName(grade.icon), 'ic-sm')}<span>${name}</span></div>
        <div class="grade-rate">${grade.priceLAK.toLocaleString()} ₭ / kg</div>
      </button>
    `;
  });
  container.innerHTML = html;
}

let activeQuickCategory = 'all';

function renderCategoryTabs() {
  const container = document.getElementById('categoryTabsStrip');
  if (!container || !globalServerState.menu || !globalServerState.menu.categories) return;

  const cats = globalServerState.menu.categories;
  if (activeQuickCategory !== 'all' && !cats.find(c => c.id === activeQuickCategory)) {
    activeQuickCategory = 'all';
  }

  let html = `
    <button class="cat-tab-btn ${activeQuickCategory === 'all' ? 'active' : ''}" data-cat="all" onclick="switchQuickCategory('all')">
      <i data-icon="grid"></i><span class="cat-label">${currentLang === 'lo' ? 'ທັງໝົດ' : 'ทั้งหมด'}</span>
    </button>
  `;

  cats.forEach(cat => {
    const isActive = activeQuickCategory === cat.id;
    const catName = currentLang === 'lo' ? cat.nameLo : cat.nameTh;
    let ic = 'tag';
    if (cat.id.includes('drink') || cat.id.includes('beer')) ic = 'beer';
    else if (cat.id.includes('coffee')) ic = 'coffee';
    else if (cat.id.includes('dish') || cat.id.includes('food')) ic = 'pot';
    else if (cat.id.includes('soup')) ic = 'flame';
    else if (cat.id.includes('bake') || cat.id.includes('dessert')) ic = 'sparkles';
    else if (cat.id.includes('free')) ic = 'gift';
    else if (cat.id.includes('addon')) ic = 'cube';

    html += `
      <button class="cat-tab-btn ${isActive ? 'active' : ''}" data-cat="${cat.id}" onclick="switchQuickCategory('${cat.id}')">
        <i data-icon="${ic}"></i><span class="cat-label">${catName}</span>
      </button>
    `;
  });

  container.innerHTML = html;
  hydrateIcons();
}

function switchQuickCategory(catId) {
  playGoldChime('tap');
  activeQuickCategory = catId;
  document.querySelectorAll('#categoryTabsStrip .cat-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cat === catId);
  });
  renderQuickItemsMenu();
}

function renderQuickItemsMenu() {
  renderCategoryTabs();
  const container = document.getElementById('quickItemsContainer');
  if (!container || !globalServerState.menu || !globalServerState.menu.categories) return;

  let allItems = [];
  globalServerState.menu.categories.forEach(cat => {
    if (activeQuickCategory === 'all' || activeQuickCategory === cat.id) {
      allItems = allItems.concat(cat.items);
    }
  });

  let html = '';
  allItems.forEach(item => {
    const name = currentLang === 'lo' ? item.nameLo : item.nameTh;
    const count = quickItemsAdded[item.id] || 0;
    const isFree = item.priceLAK === 0 || item.isFreebie;
    const priceDisplay = isFree
      ? `<span class="badge-freebie">${currentLang === 'lo' ? 'ຟຣີ' : 'ฟรี'}</span>`
      : `<span class="bev-price">${item.priceLAK.toLocaleString()} ₭</span>`;

    let actionControls = '';
    if (count > 0) {
      actionControls = `
        <div class="bev-stepper-ctrl" onclick="event.stopPropagation()">
          <button class="bev-stepper-btn minus" onclick="removeQuickItem('${item.id}', event)" aria-label="Decrease" title="ຫຼຸດ -1">
            ${icon('minus', 'ic-xs')}
          </button>
          <span class="bev-stepper-val" id="count_${item.id}">${count}</span>
          <button class="bev-stepper-btn plus" onclick="addQuickItem('${item.id}', event)" aria-label="Increase" title="ເພີ່ມ +1">
            ${icon('plus', 'ic-xs')}
          </button>
        </div>
      `;
    } else {
      actionControls = `
        <button class="bev-add-initial-btn" onclick="addQuickItem('${item.id}', event)" aria-label="Add" title="ເພີ່ມ/Add">
          ${icon('plus', 'ic-xs')}
        </button>
      `;
    }

    html += `
      <div id="bev_btn_${item.id}" class="bev-item-btn ${count > 0 ? 'has-items' : ''}" onclick="addQuickItem('${item.id}', event)">
        <div class="bev-info-left">
          <span class="bev-emoji">${icon(itemIconName(item.icon))}</span>
          <div class="bev-text-col">
            <div class="bev-name">${name}</div>
            <div class="bev-price-row">${priceDisplay}</div>
          </div>
        </div>
        <div class="bev-action-right">
          ${actionControls}
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

function renderStaffTablePills() {
  const container = document.getElementById('tablePillList');
  if (!container || !globalServerState.tables) return;

  const t = i18n[currentLang];
  let html = '';
  globalServerState.tables.forEach(table => {
    const isActive = table.id === selectedTableId;
    const isOccupied = table.status === 'occupied';
    const statusText = isOccupied ? `${table.subtotalLAK.toLocaleString()} ₭` : t.emptyTable;

    html += `
      <div class="table-pill ${isActive ? 'active' : ''} ${isOccupied ? 'occupied' : ''}" onclick="selectTable(${table.id})">
        <div class="tb-name">${currentLang === 'lo' ? table.nameLo : table.nameTh}</div>
        <div class="tb-status">${statusText}</div>
      </div>
    `;
  });
  container.innerHTML = html;
  document.getElementById('selectedTableBadge').textContent = currentLang === 'lo' ? `ໂຕະ ${selectedTableId}` : `โต๊ะ ${selectedTableId}`;

  // Update contextual Selected Table Quick Bar if the selected table is occupied
  const quickBar = document.getElementById('selectedTableQuickBar');
  const activeTable = globalServerState.tables.find(tb => tb.id === selectedTableId);
  if (quickBar && activeTable && activeTable.status === 'occupied' && currentOrderMode === 'dinein') {
    quickBar.style.display = 'flex';
    const sumEl = document.getElementById('stqSummaryText');
    const inspectBtnEl = document.getElementById('stqInspectBtnText');
    const checkoutBtnEl = document.getElementById('stqCheckoutBtnText');
    const tbName = currentLang === 'lo' ? activeTable.nameLo : activeTable.nameTh;
    const itemCnt = (activeTable.items && activeTable.items.length) || 0;
    if (sumEl) {
      sumEl.textContent = currentLang === 'lo'
        ? `${tbName} ມີບິນສະສົມ: ${activeTable.subtotalLAK.toLocaleString()} ₭ (${itemCnt} ລາຍການ)`
        : `${tbName} มีบิลค้าง: ${activeTable.subtotalLAK.toLocaleString()} ₭ (${itemCnt} รายการ)`;
    }
    if (inspectBtnEl) inspectBtnEl.textContent = currentLang === 'lo' ? '👁️ ດູບິນ/ແກ້ໄຂ' : '👁️ ดูบิล/แก้ไข';
    if (checkoutBtnEl) checkoutBtnEl.textContent = currentLang === 'lo' ? '💳 ເຊັກບິນດ່ວນ' : '💳 เช็กบิลด่วน';
  } else if (quickBar) {
    quickBar.style.display = 'none';
  }
}

function selectTable(id) {
  playGoldChime('tap');
  selectedTableId = id;
  renderStaffTablePills();
  calculateAndRenderWeight();
}

function renderOwnerMetrics() {
  const stats = globalServerState.dailyStats || { totalRevenueLAK: 0, totalMeatKg: 0, ordersCount: 0, paymentBreakdown: { bcelOneLAK: 0, cashLAK: 0 } };
  const revLAK = stats.totalRevenueLAK;
  const rate = (globalServerState.settings && globalServerState.settings.exchangeRate) || 630;
  const revTHB = Math.round(revLAK / rate);

  document.getElementById('statRevVal').textContent = `${revLAK.toLocaleString()} ₭`;
  document.getElementById('statRevTHB').textContent = `≈ ${revTHB.toLocaleString()} บาท`;
  document.getElementById('statMeatVal').textContent = `${stats.totalMeatKg.toFixed(2)} kg`;
  document.getElementById('statOrdersVal').textContent = `${stats.ordersCount} ${currentLang === 'lo' ? 'ບິນ' : 'บิล'}`;

  const bcel = (stats.paymentBreakdown && stats.paymentBreakdown.bcelOneLAK) || 0;
  const cash = (stats.paymentBreakdown && stats.paymentBreakdown.cashLAK) || 0;
  const cashLabel = currentLang === 'lo' ? 'ເງິນສົດ' : 'เงินสด';
  document.getElementById('statPaymentVal').textContent = `QR: ${(bcel / 1000).toFixed(0)}k | ${cashLabel}: ${(cash / 1000).toFixed(0)}k`;
}

function renderOwnerTablesGrid() {
  const container = document.getElementById('ownerTablesGrid');
  if (!container || !globalServerState.tables) return;

  const t = i18n[currentLang];
  let html = '';
  globalServerState.tables.forEach(table => {
    const isOccupied = table.status === 'occupied';
    let durationMins = 0;
    let radarClass = 'normal';
    let radarText = '';
    if (table.seatedAt) {
      durationMins = Math.max(1, Math.round((Date.now() - table.seatedAt) / (60 * 1000)));
      if (durationMins < 45) {
        radarClass = 'normal';
        radarText = currentLang === 'lo' ? `🟢 ${durationMins} ນາທີ (ປົກກະຕິ)` : `🟢 ${durationMins} นาที (ปกติ)`;
      } else if (durationMins < 90) {
        radarClass = 'warn';
        radarText = currentLang === 'lo' ? `🟡 ${durationMins} ນາທີ (ນັ່ງດົນ)` : `🟡 ${durationMins} นาที (นั่งนาน)`;
      } else {
        radarClass = 'overstay';
        radarText = currentLang === 'lo' ? `🔴 ${durationMins} ນາທີ (ເກີນ 90m ບຸບເຟ່)` : `🔴 ${durationMins} นาที (เกิน 90น. บุฟเฟต์)`;
      }
    }

    html += `
      <div class="table-box ${isOccupied ? 'occupied' : ''} ${radarClass === 'overstay' ? 'overstay-box' : ''}" onclick="openTableInspector(${table.id})">
        <div class="tb-header">
          <span class="tb-title">${currentLang === 'lo' ? table.nameLo : table.nameTh}</span>
          <span class="status-dot"></span>
        </div>
        
        ${isOccupied ? `
          <div class="tb-amount">${table.subtotalLAK.toLocaleString()} ₭</div>
          <div class="table-radar-tag ${radarClass}">${radarText}</div>
          <div class="tb-time">${icon('clock', 'ic-xs')} ${table.items.length} ${currentLang === 'lo' ? 'ລາຍການ' : 'รายการ'}</div>
          <button class="gold-primary-btn" style="padding:6px; font-size:0.75rem; border-radius:8px; margin-top:4px;" onclick="event.stopPropagation(); triggerTableCheckout(${table.id})">
            ${t.billCheckout}
          </button>
        ` : `
          <div style="color:var(--text-muted); font-size:0.8rem; margin:auto 0;">${t.emptyTable}</div>
        `}
      </div>
    `;
  });
  container.innerHTML = html;
  document.getElementById('tableCountBadge').textContent = `${globalServerState.tables.length} ${currentLang === 'lo' ? 'ໂຕະ' : 'โต๊ะ'}`;
}

function triggerTableCheckout(tableId) {
  playGoldChime('tap');
  const table = globalServerState.tables.find(t => t.id === tableId);
  if (!table || table.status === 'empty') return;

  openCheckoutModal({
    type: 'table',
    tableId: table.id,
    totalLAK: table.subtotalLAK,
    title: `${currentLang === 'lo' ? 'ເຊັກບິນ' : 'เช็กบิล'} ${currentLang === 'lo' ? table.nameLo : table.nameTh}`
  });
}

function renderActivityFeed() {
  const container = document.getElementById('activityList');
  if (!container) return;

  const acts = globalServerState.recentActivities || [];
  if (acts.length === 0) {
    container.innerHTML = `<div style="color:var(--text-muted); font-size:0.75rem; padding:10px;">ຍັງບໍ່ມີຄວາມເຄື່ອນໄຫວ</div>`;
    return;
  }

  let html = '';
  acts.forEach(act => {
    const text = currentLang === 'lo' ? act.textLo : act.textTh;
    html += `
      <div class="activity-item">
        <span class="act-text">${icon('sparkles', 'ic-xs')}<span>${text}</span></span>
        <span class="act-time">${act.time}</span>
      </div>
    `;
  });
  container.innerHTML = html;
}

// ─── STAFF SCALE VS CATALOG DUAL VIEW SWITCHER ───
let staffLeftView = 'scale'; // 'scale' | 'catalog'
let activeCatalogCategory = 'all';

function toggleStaffScaleView(forcedMode, silent = false) {
  if (!silent) playGoldChime('tap');
  if (forcedMode) {
    staffLeftView = forcedMode;
  } else {
    staffLeftView = staffLeftView === 'scale' ? 'catalog' : 'scale';
  }

  const scaleSec = document.getElementById('staffScaleSection');
  const catSec = document.getElementById('staffCatalogSection');
  const toggleBtnText = document.getElementById('toggleScaleViewText');
  const modeTitle = document.getElementById('scaleModeTitle');

  if (staffLeftView === 'scale') {
    if (scaleSec) scaleSec.style.display = 'flex';
    if (catSec) catSec.style.display = 'none';
    if (toggleBtnText) toggleBtnText.textContent = currentLang === 'lo' ? 'ສັ່ງຕາມເມນູ (Menu Mode)' : 'โหมดสั่งตามเมนู';
    if (modeTitle) modeTitle.innerHTML = `${icon('weight', 'ic-xs')}<span>${currentLang === 'lo' ? 'ຊັ່ງກິໂລ (Weighing Scale)' : 'ชั่งกิโล (Weighing Scale)'}</span>`;
  } else {
    if (scaleSec) scaleSec.style.display = 'none';
    if (catSec) catSec.style.display = 'flex';
    if (toggleBtnText) toggleBtnText.textContent = currentLang === 'lo' ? 'ໂໝດຊັ່ງກິໂລ (Scale Mode)' : 'โหมดชั่งกิโล';
    if (modeTitle) modeTitle.innerHTML = `${icon('pot', 'ic-xs')}<span>${currentLang === 'lo' ? 'ລາຍການອາຫານ (A La Carte)' : 'รายการอาหารจานเดี่ยว'}</span>`;
    renderStaffCatalog();
  }
}

function switchCatalogCategory(catId) {
  playGoldChime('tap');
  activeCatalogCategory = catId;
  renderStaffCatalog();
}

function clearCatalogSearch() {
  playGoldChime('tap');
  const input = document.getElementById('catalogSearchInput');
  if (input) input.value = '';
  renderStaffCatalog();
}

function renderStaffCatalog() {
  const container = document.getElementById('catalogFeaturedContainer');
  const catStrip = document.getElementById('catalogCategoryStrip');
  if (!container || !globalServerState.menu) return;

  const cats = globalServerState.menu.categories || [];
  if (activeCatalogCategory !== 'all' && !cats.find(c => c.id === activeCatalogCategory)) {
    activeCatalogCategory = 'all';
  }

  if (catStrip) {
    let stripHtml = `
      <button type="button" class="cat-tab-btn ${activeCatalogCategory === 'all' ? 'active' : ''}" onclick="switchCatalogCategory('all')">
        <span>${currentLang === 'lo' ? 'ທັງໝົດ' : 'ทั้งหมด'}</span>
      </button>
    `;
    cats.forEach(c => {
      const cName = currentLang === 'lo' ? c.nameLo : c.nameTh;
      stripHtml += `
        <button type="button" class="cat-tab-btn ${activeCatalogCategory === c.id ? 'active' : ''}" onclick="switchCatalogCategory('${c.id}')">
          <span>${cName}</span>
        </button>
      `;
    });
    catStrip.innerHTML = stripHtml;
  }

  const searchInput = document.getElementById('catalogSearchInput');
  const clearBtn = document.getElementById('catalogSearchClearBtn');
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
  if (clearBtn) clearBtn.style.display = query ? 'flex' : 'none';

  let items = [];
  cats.forEach(cat => {
    if (activeCatalogCategory === 'all' || activeCatalogCategory === cat.id) {
      cat.items.forEach(item => {
        if (!query || (item.nameLo && item.nameLo.toLowerCase().includes(query)) || (item.nameTh && item.nameTh.toLowerCase().includes(query))) {
          items.push({ ...item, catNameLo: cat.nameLo, catNameTh: cat.nameTh });
        }
      });
    }
  });

  if (items.length === 0) {
    container.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:var(--text-muted); font-size:0.8rem; padding:20px;">${currentLang === 'lo' ? 'ບໍ່ພົບລາຍການເມນູທີ່ຄົ້ນຫາ' : 'ไม่พบรายการเมนูที่ค้นหา'}</div>`;
    return;
  }

  let html = '';
  const rate = (globalServerState.settings && globalServerState.settings.exchangeRate) || 630;
  items.forEach(item => {
    const count = quickItemsAdded[item.id] || 0;
    const name = currentLang === 'lo' ? item.nameLo : item.nameTh;
    const isFree = item.priceLAK === 0 || item.isFreebie;
    const approxTHB = Math.round(item.priceLAK / rate);

    html += `
      <div class="catalog-card ${count > 0 ? 'selected' : ''}" onclick="addQuickItem('${item.id}', event)">
        <div class="catalog-card-top">
          <div class="catalog-card-icon">${icon(itemIconName(item.icon), 'ic-sm')}</div>
          ${count > 0 ? `
            <div class="bev-stepper-ctrl" onclick="event.stopPropagation()">
              <button type="button" class="bev-stepper-btn minus" onclick="removeQuickItem('${item.id}', event)">${icon('minus', 'ic-xs')}</button>
              <span class="bev-stepper-val">${count}</span>
              <button type="button" class="bev-stepper-btn plus" onclick="addQuickItem('${item.id}', event)">${icon('plus', 'ic-xs')}</button>
            </div>
          ` : `
            <span class="bev-add-initial-btn" style="width:24px;height:24px;">${icon('plus', 'ic-xs')}</span>
          `}
        </div>
        <div class="catalog-card-name">${name}</div>
        <div class="catalog-card-bottom">
          <div class="catalog-card-price">
            ${isFree ? `<span class="badge-freebie">${currentLang === 'lo' ? 'ຟຣີ' : 'ฟรี'}</span>` : `${item.priceLAK.toLocaleString()} ₭`}
          </div>
          ${!isFree ? `<div class="catalog-card-price-thb">≈ ${approxTHB.toLocaleString()} ฿</div>` : ''}
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

function updateConceptBadge() {
  const s = globalServerState.settings || {};
  const concept = s.storeConcept || 'sindad';
  const badge = document.getElementById('currentConceptBadge');
  if (badge) {
    const conceptNames = {
      sindad: currentLang === 'lo' ? 'ຊີ້ນດາດ & ປິ້ງຍ່າງ' : 'หมูกระทะ & ปิ้งย่าง',
      restaurant: currentLang === 'lo' ? 'ຮ້ານອາຫານ & ຕາມສັ່ງ' : 'ร้านอาหาร & ตามสั่ง',
      cafe: currentLang === 'lo' ? 'ຄາເຟ່ & ເຄື່ອງດື່ມ' : 'คาเฟ่ & เบเกอรี่',
      bar: currentLang === 'lo' ? 'ບາ & ເບຍກາດເດັນ' : 'บาร์ & เบียร์การ์เดน'
    };
    badge.textContent = conceptNames[concept] || 'ຊີ້ນດາດ';
  }

  // Highlight active 1-Tap Concept Switcher pill
  ['sindad', 'restaurant', 'cafe', 'bar'].forEach(cId => {
    const qcBtn = document.getElementById(`qcBtn_${cId}`);
    if (qcBtn) {
      qcBtn.classList.toggle('active', cId === concept);
    }
  });

  // Dynamically update Brand Header title & tagline
  const brandEl = document.getElementById('brandName');
  const tagEl = document.getElementById('brandTagline');
  if (brandEl && (s.storeNameLo || s.storeNameTh)) {
    brandEl.textContent = currentLang === 'lo' ? (s.storeNameLo || brandEl.textContent) : (s.storeNameTh || brandEl.textContent);
  }
  if (tagEl && (s.taglineLo || s.taglineTh)) {
    tagEl.textContent = currentLang === 'lo' ? (s.taglineLo || tagEl.textContent) : (s.taglineTh || tagEl.textContent);
  }
}

function updateVipBadgeState() {
  const isVip = globalServerState.settings && globalServerState.settings.isVipLicensed;
  const vipBtn = document.getElementById('vipBadgeBtn');
  if (!vipBtn) return;
  if (isVip) {
    vipBtn.classList.add('active-vip');
    vipBtn.innerHTML = `${icon('crown', 'ic-xs')}<span style="color:#FFF; font-weight:800;">VIP PRO ACTIVE</span>`;
    vipBtn.title = 'VIP PRO Active - ລະບົບປົດລັອກພຣີມ່ຽມຄົບຖ້ວນ';
  } else {
    vipBtn.classList.remove('active-vip');
    vipBtn.innerHTML = `${icon('crown', 'ic-xs')}<span>VIP PRO</span>`;
    vipBtn.title = 'VIP PRO Edition - ກົດເພື່ອອັບເກຣດ';
  }
}

// ─── QUICK EXCHANGE RATE POPOVER / MODAL ───
function openExchangeRateModal() {
  playGoldChime('tap');
  const modal = document.getElementById('exchangeRateModal');
  if (!modal) return;
  const rate = (globalServerState.settings && globalServerState.settings.exchangeRate) || 630;
  const input = document.getElementById('quickExchangeRateInput');
  if (input) input.value = rate;

  highlightRateChip(rate);
  modal.classList.add('active');
  if (input) {
    setTimeout(() => {
      input.focus();
      input.select();
    }, 100);
  }
}

function closeExchangeRateModal() {
  const modal = document.getElementById('exchangeRateModal');
  if (modal) modal.classList.remove('active');
}

function setQuickRate(val) {
  playGoldChime('tap');
  const input = document.getElementById('quickExchangeRateInput');
  if (input) input.value = val;
  highlightRateChip(val);
}

function highlightRateChip(rate) {
  document.querySelectorAll('.rate-chip-btn').forEach(btn => {
    const text = btn.textContent.replace(/[^0-9]/g, '');
    btn.classList.toggle('active', parseInt(text) === rate);
  });
}

function saveExchangeRateQuick() {
  playGoldChime('success');
  const input = document.getElementById('quickExchangeRateInput');
  const newRate = parseInt(input ? input.value : 0);
  if (!newRate || newRate <= 0) {
    alert(currentLang === 'lo' ? 'ກະລຸນາໃສ່ອັດຕາແລກປ່ຽນທີ່ຖືກຕ້ອງ' : 'กรุณาใส่อัตราแลกเปลี่ยนที่ถูกต้อง');
    return;
  }

  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'UPDATE_SETTINGS',
      payload: {
        settings: {
          exchangeRate: newRate
        }
      }
    }));
  }

  showToast(currentLang === 'lo' ? `ອັບເດດອັດຕາ 1฿ = ${newRate.toLocaleString()}₭ ສຳເລັດ` : `อัปเดตอัตรา 1฿ = ${newRate.toLocaleString()}₭ สำเร็จ`);
  closeExchangeRateModal();
}

// ─── MULTI-CONCEPT & MENU MANAGER ───
function openMenuManager() {
  playGoldChime('tap');
  const modal = document.getElementById('menuManagerModal');
  if (!modal) return;
  switchMenuManagerTab('concepts');
  renderMenuConceptCards();
  renderMenuEditorItems();
  modal.classList.add('active');
}

function closeMenuManager() {
  const modal = document.getElementById('menuManagerModal');
  if (modal) modal.classList.remove('active');
}

function switchMenuManagerTab(tab) {
  playGoldChime('tap');
  const btnConcepts = document.getElementById('menuTabConceptBtn');
  const btnItems = document.getElementById('menuTabItemsBtn');
  const secConcepts = document.getElementById('menuConceptSection');
  const secItems = document.getElementById('menuItemsSection');

  if (tab === 'concepts') {
    if (btnConcepts) btnConcepts.classList.add('active');
    if (btnItems) btnItems.classList.remove('active');
    if (secConcepts) secConcepts.style.display = 'flex';
    if (secItems) secItems.style.display = 'none';
    renderMenuConceptCards();
  } else {
    if (btnConcepts) btnConcepts.classList.remove('active');
    if (btnItems) btnItems.classList.add('active');
    if (secConcepts) secConcepts.style.display = 'none';
    if (secItems) secItems.style.display = 'flex';
    renderMenuEditorItems();
  }
}

function renderMenuConceptCards() {
  const currentConcept = (globalServerState.settings && globalServerState.settings.storeConcept) || 'sindad';
  ['sindad', 'restaurant', 'cafe', 'bar'].forEach(cId => {
    const card = document.getElementById(`conceptCard_${cId}`);
    if (card) {
      card.classList.toggle('active', card.id === `conceptCard_${currentConcept}`);
    }
  });
}

function applyStorePreset(presetId) {
  playGoldChime('success');
  const conceptNames = {
    sindad: currentLang === 'lo' ? 'ຊີ້ນດາດ & ປິ້ງຍ່າງ' : 'หมูกระทะ & ปิ้งย่าง',
    restaurant: currentLang === 'lo' ? 'ຮ້ານອາຫານ & ຕາມສັ່ງ' : 'ร้านอาหาร & ตามสั่ง',
    cafe: currentLang === 'lo' ? 'ຄາເຟ່ & ເຄື່ອງດື່ມ' : 'คาเฟ่ & เบเกอรี่',
    bar: currentLang === 'lo' ? 'ບາ & ເບຍກາດເດັນ' : 'บาร์ & เบียร์การ์เดน'
  };

  const name = conceptNames[presetId] || presetId;

  // Send both presetId and conceptId to guarantee server match
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'APPLY_CONCEPT_PRESET',
      payload: { presetId, conceptId: presetId }
    }));
  }

  // Switch left view automatically according to concept
  if (presetId === 'sindad') {
    toggleStaffScaleView('scale');
  } else {
    toggleStaffScaleView('catalog');
  }

  // Highlight active card immediately in UI
  ['sindad', 'restaurant', 'cafe', 'bar'].forEach(cId => {
    const card = document.getElementById(`conceptCard_${cId}`);
    if (card) {
      card.classList.toggle('active', cId === presetId);
    }
  });

  showToast(currentLang === 'lo' ? `ປ່ຽນຮູບແບບຮ້ານເປັນ "${name}" ສຳເລັດແລ້ວ!` : `เปลี่ยนรูปแบบร้านเป็น "${name}" เรียบร้อยแล้ว!`);

  // Close menu manager modal automatically so user sees the change right away
  setTimeout(() => {
    closeMenuManager();
  }, 350);
}

function generateEodReport() {
  playGoldChime('success');
  const isVip = globalServerState.settings && globalServerState.settings.isVipLicensed;
  const s = globalServerState.settings || {};
  const stats = globalServerState.dailyStats || { totalRevenueLAK: 0, totalMeatKg: 0, ordersCount: 0, paymentBreakdown: { bcelOneLAK: 0, cashLAK: 0 } };
  const rate = s.exchangeRate || 630;
  const revLAK = stats.totalRevenueLAK;
  const revTHB = Math.round(revLAK / rate);
  const now = new Date().toLocaleString(currentLang === 'lo' ? 'lo-LA' : 'th-TH');
  const storeName = currentLang === 'lo' ? s.storeNameLo : s.storeNameTh;

  const bcel = (stats.paymentBreakdown && stats.paymentBreakdown.bcelOneLAK) || 0;
  const cash = (stats.paymentBreakdown && stats.paymentBreakdown.cashLAK) || 0;

  const reportText = `👑 *KHAMTHONG POS - ບົດສະຫຼຸບຍອດຂາຍປະຈຳວັນ (EOD Report)*\n📅 ວັນທີ/ເວລາ: ${now}\n🏪 ຮ້ານ: ${storeName}\n-------------------------------------\n💰 ຍອດຂາຍລວມມື້ນີ້: *${revLAK.toLocaleString()} ₭* (≈ ${revTHB.toLocaleString()} ฿)\n🧾 ຈຳນວນບິນທີ່ສຳເລັດ: ${stats.ordersCount} ບິນ\n🥩 ຊີ້ນ/ສິນຄ້າຂາຍໄດ້: ${stats.totalMeatKg.toFixed(2)} kg\n📱 ຍອດໂອນ BCEL One / QR: ${bcel.toLocaleString()} ₭\n💵 ຍອດເງິນສົດ (Cash): ${cash.toLocaleString()} ₭\n-------------------------------------\n${isVip ? '✓ VIP PRO CERTIFIED SYSTEM - ຖືກຕ້ອງ 100%' : 'KhamThong SinDad & Universal POS'}`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(reportText).then(() => {
      showToast(currentLang === 'lo' ? '✅ ສຳເນົາບົດສະຫຼຸບ EOD ແລ້ວ! ພ້ອມສົ່ງຕໍ່ WhatsApp/Facebook' : '✅ คัดลอกสรุปยอดขาย EOD แล้ว! พร้อมส่งต่อ WhatsApp/Facebook');
    }).catch(() => {
      alert(reportText);
    });
  } else {
    alert(reportText);
  }
}

function renderMenuEditorItems() {
  const container = document.getElementById('menuEditorItemsList');
  if (!container || !globalServerState.menu || !globalServerState.menu.categories) return;

  let html = '';
  globalServerState.menu.categories.forEach(cat => {
    const catName = currentLang === 'lo' ? cat.nameLo : cat.nameTh;
    html += `
      <div style="font-weight:700; font-size:0.75rem; color:var(--gold-300); margin-top:8px; border-bottom:1px solid rgba(245,208,97,0.2); padding-bottom:2px;">
        ${catName} (${cat.items.length})
      </div>
    `;

    cat.items.forEach(item => {
      const isFree = item.priceLAK === 0 || item.isFreebie;
      const priceText = isFree ? (currentLang === 'lo' ? 'ຟຣີ' : 'ฟรี') : `${item.priceLAK.toLocaleString()} ₭`;
      const name = currentLang === 'lo' ? item.nameLo : item.nameTh;

      html += `
        <div class="menu-item-row">
          <div class="menu-item-info">
            <span class="menu-item-icon">${icon(itemIconName(item.icon), 'ic-sm')}</span>
            <div class="menu-item-names">
              <span class="name-main">${name}</span>
              <span class="name-sub">${item.nameTh || ''} • ${cat.id}</span>
            </div>
          </div>
          <div class="menu-item-actions">
            <span class="menu-item-price-tag">${priceText}</span>
            <button class="menu-item-del-btn" onclick="deleteMenuItem('${item.id}')" title="Delete">
              ${icon('trash', 'ic-xs')}
            </button>
          </div>
        </div>
      `;
    });
  });

  container.innerHTML = html;
}

function addNewMenuItemFromForm() {
  const nameLo = document.getElementById('newItemNameLo').value.trim();
  const nameTh = document.getElementById('newItemNameTh').value.trim() || nameLo;
  const priceLAK = parseInt(document.getElementById('newItemPrice').value) || 0;
  const categoryId = document.getElementById('newItemCategory').value;
  const iconVal = document.getElementById('newItemIcon').value || 'pot';

  if (!nameLo) {
    alert(currentLang === 'lo' ? 'ກະລຸນາໃສ່ຊື່ເມນູ' : 'กรุณาใส่ชื่อเมนู');
    return;
  }

  playGoldChime('success');
  const isFreebie = priceLAK === 0 || categoryId === 'freebies';

  const newItem = {
    id: `item_${Date.now()}`,
    nameLo,
    nameTh,
    priceLAK,
    icon: iconVal,
    isFreebie
  };

  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'SAVE_MENU_ITEM',
      payload: {
        categoryId,
        item: newItem
      }
    }));
  }

  // Clear inputs
  document.getElementById('newItemNameLo').value = '';
  document.getElementById('newItemNameTh').value = '';
  document.getElementById('newItemPrice').value = '';

  showToast(currentLang === 'lo' ? `ເພີ່ມເມນູ "${nameLo}" ສຳເລັດ` : `เพิ่มเมนู "${nameLo}" เรียบร้อย`);
}

function deleteMenuItem(itemId) {
  playGoldChime('tap');
  const confirmMsg = currentLang === 'lo' ? 'ທ່ານຕ້ອງການລຶບເມນູນີ້ແທ້ບໍ່?' : 'คุณต้องการลบเมนูนี้จริงหรือไม่?';
  if (confirm(confirmMsg)) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'DELETE_MENU_ITEM',
        payload: { itemId }
      }));
    }
    showToast(currentLang === 'lo' ? 'ລຶບເມນູຮຽບຮ້ອຍ' : 'ลบเมนูเรียบร้อย');
  }
}

// ─── VIP PRO UPGRADE & LICENSING ───
function openVipUpgradeModal() {
  playGoldChime('tap');
  const modal = document.getElementById('vipUpgradeModal');
  if (!modal) return;
  const isVip = globalServerState.settings && globalServerState.settings.isVipLicensed;
  const sub = document.getElementById('vipModalSubtitle');
  if (isVip && sub) {
    sub.innerHTML = `<span style="color:#10B981; font-weight:700;">✓ ທ່ານເປັນສະມາຊິກ VIP PRO ແລ້ວ (Active License)</span>`;
  }
  modal.classList.add('active');
  sendUsageTelemetry('กดเปิดดูแพ็กเกจ VIP PRO (สนใจอัปเกรด)', { incrementVipClick: true });
}

function closeVipUpgradeModal() {
  const modal = document.getElementById('vipUpgradeModal');
  if (modal) modal.classList.remove('active');
}

function activateVipLicense() {
  const input = document.getElementById('vipLicenseKeyInput');
  const key = input ? input.value.trim().toUpperCase() : '';

  if (!key) {
    alert(currentLang === 'lo' ? 'ກະລຸນາໃສ່ລະຫັດ VIP License Key' : 'กรุณากรอกรหัส VIP License Key');
    return;
  }

  // Accept VIP keys, test keys or promo keys
  const validKeys = ['VIP888', 'VIP999', 'GOLD2026', 'KHAMTHONG', 'PRO2026'];
  const isValid = validKeys.includes(key) || key.startsWith('VIP-') || key.length >= 6;

  if (isValid) {
    playGoldChime('success');
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'UPDATE_SETTINGS',
        payload: {
          settings: {
            isVipLicensed: true,
            vipLicenseKey: key
          }
        }
      }));
    }
    showToast(currentLang === 'lo' ? '👑 ຍິນດີຕ້ອນຮັບສູ່ VIP PRO! ປົດລັອກຄຸນສົມບັດພຣີມ່ຽມຄົບຖ້ວນ' : '👑 ยินดีต้อนรับสู่ VIP PRO! ปลดล็อกฟีเจอร์พรีเมียมเรียบร้อย');
    if (input) input.value = '';
    closeVipUpgradeModal();
  } else {
    alert(currentLang === 'lo' ? 'ລະຫັດ License ບໍ່ຖືກຕ້ອງ ກະລຸນາຕິດຕໍ່ຜູ້ພັດທະນາຜ່ານ Mason BizApp Facebook' : 'รหัส License ไม่ถูกต้อง กรุณาติดต่อผู้พัฒนาผ่าน Mason BizApp Facebook');
  }
}

// ─── VIP KITCHEN DISPLAY SYSTEM (KDS) ───
let currentKdsFilter = 'all';

function setKdsStationFilter(station) {
  playGoldChime('tap');
  currentKdsFilter = station;
  ['all', 'grill', 'kitchen', 'bar'].forEach(s => {
    const btn = document.getElementById(`kdsTab${s.charAt(0).toUpperCase() + s.slice(1)}`);
    if (btn) btn.classList.toggle('active', s === station);
  });
  renderKdsView();
}

function renderKdsView() {
  const container = document.getElementById('kdsTicketsGrid');
  if (!container || !globalServerState || !globalServerState.tables) return;

  const occupiedTables = globalServerState.tables.filter(t => t.status === 'occupied' && t.items && t.items.length > 0);

  // Filter items per table based on currentKdsFilter while keeping original item index
  const filteredTables = occupiedTables.map(table => {
    const indexedItems = table.items
      .map((item, idx) => ({ item, idx, station: inferItemStation(item) }))
      .filter(entry => currentKdsFilter === 'all' || entry.station === currentKdsFilter);
    return { table, indexedItems };
  }).filter(entry => entry.indexedItems.length > 0);

  if (filteredTables.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:50px 20px; color:var(--text-muted);">
        <div style="font-size:2.8rem; margin-bottom:12px;">👨‍🍳</div>
        <div style="font-size:1.05rem; font-weight:800; color:var(--gold-200); margin-bottom:4px;">
          ${currentLang === 'lo' ? 'ຍັງບໍ່ມີອໍເດີ້ຄ້າງໃນໝວດນີ້' : 'ยังไม่มีออเดอร์ค้างในสถานีนี้'}
        </div>
        <div style="font-size:0.75rem;">
          ${currentLang === 'lo' ? 'ເມື່ອພະນັກງານສັ່ງອາຫານ ໃບສັ່ງຈະຂຶ້ນທີ່ນີ້ແບບ Real-time 120fps ພ້ອມສຽງແຈ້ງເຕືອນ' : 'เมื่อพนักงานสั่งอาหาร ใบสั่งจะเด้งขึ้นที่นี่แบบ Real-time 120fps พร้อมเสียงกระดิ่ง'}
        </div>
      </div>
    `;
    return;
  }

  let html = '';
  filteredTables.forEach(({ table, indexedItems }) => {
    const elapsedMins = table.seatedAt ? Math.max(1, Math.floor((Date.now() - table.seatedAt) / 60000)) : 1;
    const isUrgent = elapsedMins >= 25;
    const timerClass = elapsedMins < 15 ? 'normal' : (elapsedMins < 25 ? 'warning' : 'alert');
    const allReady = indexedItems.every(({ item }) => item.status === 'ready');

    html += `
      <div class="kds-ticket-card ${isUrgent ? 'urgent' : ''} ${allReady ? 'all-ready' : ''}">
        <div class="kds-ticket-header">
          <span class="kds-table-title">${currentLang === 'lo' ? table.nameLo : table.nameTh}</span>
          <span class="kds-timer-badge ${timerClass}">
            ${icon('clock', 'ic-xs')} <span>${elapsedMins} ${currentLang === 'lo' ? 'ນາທີ' : 'นาที'}</span>
          </span>
        </div>

        <div class="kds-items-list">
    `;

    indexedItems.forEach(({ item, idx }) => {
      const isReady = item.status === 'ready';
      const displayName = currentLang === 'lo' ? (item.nameLo || item.name) : (item.nameTh || item.name);
      const desc = item.weight ? `${displayName} (${item.weight} kg)` : `${displayName} x${item.qty || 1}`;
      const noteHtml = item.note
        ? `<div class="kds-item-note">📌 ${item.note}</div>`
        : '';

      html += `
        <div class="kds-item-row ${isReady ? 'ready' : ''}">
          <div class="kds-item-info">
            <span class="kds-item-name">${desc}</span>
            ${noteHtml}
          </div>
          <button class="kds-item-btn ${isReady ? 'btn-ready' : 'btn-cook'}" onclick="toggleKdsItemStatus(${table.id}, ${idx}, '${isReady ? 'cooking' : 'ready'}')">
            ${isReady ? (currentLang === 'lo' ? '✓ ເສີບແລ້ວ' : '✓ เสิร์ฟแล้ว') : (currentLang === 'lo' ? '👨‍🍳 ກຳລັງປຸງ' : '👨‍🍳 กำลังทำ')}
          </button>
        </div>
      `;
    });

    html += `
        </div>

        <button class="gold-primary-btn kds-all-ready-btn" onclick="markTableKitchenAllReady(${table.id})">
          ${icon('check', 'ic-xs')} <span>${currentLang === 'lo' ? 'ພ້ອມເສີບທັງໝົດ' : 'พร้อมเสิร์ฟทั้งหมด'}</span>
        </button>
      </div>
    `;
  });

  container.innerHTML = html;
}

function toggleKdsItemStatus(tableId, itemIndex, newStatus) {
  playGoldChime('tap');
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'UPDATE_KITCHEN_ITEM_STATUS',
      payload: { tableId, itemIndex, status: newStatus }
    }));
  }
}

function markTableKitchenAllReady(tableId) {
  playGoldChime('success');
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'MARK_TABLE_KITCHEN_ALL_READY',
      payload: { tableId }
    }));
  }
}

// ─── CLIENT-SIDE STANDALONE POS ENGINE (PER-DEVICE LOCAL STORAGE) ───
const FALLBACK_CONCEPT_PRESETS = {
  sindad: {
    storeNameLo: 'ຄຳທອງ ຊິ້ນດາດ & ປິ້ງຍ່າງ',
    storeNameTh: 'คำทอง ชี้นดาด & ปิ้งย่าง',
    taglineLo: 'ຊີ້ນດາດຊັ່ງກິໂລ ນ້ຳແຈ່ວລົດເດັດ ວຽງຈັນ',
    taglineTh: 'หมูกระทะชั่งกิโล น้ำจิ้มรสเด็ด เวียงจันทน์',
    storeConcept: 'sindad',
    scaleMode: true,
    menu: {
      meatGrades: [
        { id: 'mixed', nameLo: 'ຊີ້ນລວມ (ໝູ/ໄກ່/ລູກຊີ້ນ)', nameTh: 'หมูหมักรวม (หมู/ไก่/ตับ/ลูกชิ้น)', priceLAK: 95000, unit: 'kg', icon: 'drumstick' },
        { id: 'premium', nameLo: 'ຊີ້ນງົວພຣີມ່ຽມ & ຊີຟູດ', nameTh: 'เนื้อวัวพรีเมียม & ซีฟู้ดกุ้งหมึก', priceLAK: 145000, unit: 'kg', icon: 'gem' },
        { id: 'pork_belly', nameLo: 'ສາມຊັ້ນໝັກງາພິເສດ', nameTh: 'สามชั้นสไลซ์หมักงาเกาหลี', priceLAK: 115000, unit: 'kg', icon: 'layers' },
        { id: 'seafood_fresh', nameLo: 'ກຸ້ງແມ່ນ້ຳ & ປາໝຶກສົດ', nameTh: 'กุ้งแม่น้ำ & หมึกกล้วยสด', priceLAK: 160000, unit: 'kg', icon: 'fish' }
      ],
      categories: [
        {
          id: 'drinks', nameLo: 'ເຄື່ອງດື່ມ', nameTh: 'เครื่องดื่ม',
          items: [
            { id: 'b1', nameLo: 'ເບຍລາວ ໃຫຍ່ (Beerlao 640ml)', nameTh: 'เบียร์ลาว ขวดใหญ่', priceLAK: 18000, icon: 'beer' },
            { id: 'b2', nameLo: 'ເບຍລາວ Gold (ຂວດ)', nameTh: 'เบียร์ลาว โกลด์', priceLAK: 22000, icon: 'beer' },
            { id: 'b3', nameLo: 'ເບຍລາວ Dark (ດຳ)', nameTh: 'เบียร์ลาว ดำ', priceLAK: 22000, icon: 'beer' },
            { id: 'w1', nameLo: 'ນ້ຳດື່ມຫົວເສືອ (Tigerhead)', nameTh: 'น้ำดื่มตราหัวเสือ', priceLAK: 5000, icon: 'droplet' },
            { id: 's1', nameLo: 'ໂຄ້ກ / ແປັບຊີ (Coke/Pepsi)', nameTh: 'โค้ก / แป๊ปซี่', priceLAK: 10000, icon: 'soda' },
            { id: 's2', nameLo: 'ນ້ຳສົ້ມ ມິຣິນດ້າ (Mirinda)', nameTh: 'น้ำส้ม มิรินด้า', priceLAK: 10000, icon: 'soda' }
          ]
        },
        {
          id: 'addons', nameLo: 'ເຄື່ອງຄຽງ & ບໍລິການ', nameTh: 'เครื่องเคียง & บริการ',
          items: [
            { id: 'i1', nameLo: 'ນ້ຳກ້ອນ ຖັງໃຫຍ່', nameTh: 'น้ำแข็ง ถังใหญ่', priceLAK: 10000, icon: 'cube' },
            { id: 'c1', nameLo: 'ຖ່ານເຕົາ ຄຸນນະພາບສູງ', nameTh: 'ถ่านเตา ไร้ควันเกรด A', priceLAK: 10000, icon: 'flame' },
            { id: 's3', nameLo: 'ນ້ຳແຈ່ວຂວດ ສູດຄຳທອງ (ກັບບ້ານ)', nameTh: 'น้ำจิ้มขวด สูตรคำทอง', priceLAK: 20000, icon: 'flame' },
            { id: 'v1', nameLo: 'ຊຸດຜັກລວມ & ວຸ້ນເສັ້ນ', nameTh: 'ชุดผักรวม & วุ้นเส้น', priceLAK: 15000, icon: 'leaf' },
            { id: 't1', nameLo: 'ເຕົ້າຮູ້ຊີດ / ປູອັດ', nameTh: 'เต้าหู้ชีส / ปูอัด', priceLAK: 15000, icon: 'gem' },
            { id: 'm1', nameLo: 'ໝີ່ຫຍົກ 2 ກ້ອນ', nameTh: 'บะหมี่หยก 2 ก้อน', priceLAK: 10000, icon: 'bowl' },
            { id: 'p1', nameLo: 'ຄ່າເປີດເຕົາ/ໝໍ້ເພີ່ມ', nameTh: 'ค่าเปิดเตา/กระทะเพิ่ม', priceLAK: 20000, icon: 'pot' }
          ]
        },
        {
          id: 'freebies', nameLo: 'ຂອງແຖມ', nameTh: 'ของแถม',
          items: [
            { id: 'f1', nameLo: 'ຊຸດຜັກສົດ & ວຸ້ນເສັ້ນ (ຟຣີ)', nameTh: 'ชุดผักสด & วุ้นเส้น (ฟรี)', priceLAK: 0, isFreebie: true, icon: 'leaf' },
            { id: 'f2', nameLo: 'ນ້ຳຊຸບກະດູກໝູເຕີມ (ຟຣີ)', nameTh: 'น้ำซุปกระดูกหมูเติม (ฟรี)', priceLAK: 0, isFreebie: true, icon: 'pot' },
            { id: 'f3', nameLo: 'ນ້ຳແຈ່ວສູດເດັດເຕີມ (ຟຣີ)', nameTh: 'น้ำจิ้มสูตรเด็ดเติม (ฟรี)', priceLAK: 0, isFreebie: true, icon: 'flame' }
          ]
        }
      ]
    }
  },
  restaurant: {
    storeNameLo: 'ຄຳທອງ ອາຫານ & ຕາມສັ່ງ',
    storeNameTh: 'คำทอง ครัวไทย-ลาว & อาหารตามสั่ง',
    taglineLo: 'ອາຫານແຊບ ວັດຖຸດິບສົດໃໝ່ ທຸກມື້',
    taglineTh: 'อาหารรสเด็ด วัตถุดิบสดใหม่ทุกวัน',
    storeConcept: 'restaurant',
    scaleMode: false,
    menu: {
      meatGrades: [],
      categories: [
        {
          id: 'main_dishes', nameLo: 'ອາຫານຈານຫຼັກ', nameTh: 'อาหารจานหลัก / กับข้าว',
          items: [
            { id: 'r1', nameLo: 'ເຂົ້າຜັດໝູ / ໄກ່ ຈານໃຫຍ່', nameTh: 'ข้าวผัดหมู / ไก่ จานใหญ่', priceLAK: 35000, icon: 'pot' },
            { id: 'r2', nameLo: 'ເຂົ້າຜັດລວມມິດຊີຟູດ', nameTh: 'ข้าวผัดรวมมิตรซีฟู้ด จานใหญ่', priceLAK: 45000, icon: 'fish' },
            { id: 'r3', nameLo: 'ຜັດກະເພົາໝູກອບ + ໄຂ່ດາວ', nameTh: 'ผัดกะเพราหมูกรอบ + ไข่ดาว', priceLAK: 40000, icon: 'flame' },
            { id: 'r4', nameLo: 'ປາກະພົງທອດນ້ຳປາ (ໂຕໃຫຍ່)', nameTh: 'ปลากะพงทอดน้ำปลา ตัวใหญ่', priceLAK: 110000, icon: 'fish' },
            { id: 'r5', nameLo: 'ຄໍໝູຍ່າງ ນ້ຳແຈ່ວເພ້ຍ', nameTh: 'คอหมูย่าง น้ำจิ้มแจ่วเพี้ย', priceLAK: 45000, icon: 'drumstick' },
            { id: 'r6', nameLo: 'ປີກໄກ່ທອດນ້ຳປາ ກອບ', nameTh: 'ปีกไก่ทอดน้ำปลา กรอบ', priceLAK: 35000, icon: 'drumstick' },
            { id: 'r7', nameLo: 'ຍຳວຸ້ນເສັ້ນລວມມິດທະເລ', nameTh: 'ยำวุ้นเส้นรวมมิตรทะเล', priceLAK: 45000, icon: 'flame' },
            { id: 'r8', nameLo: 'ໄຂ່ຈຽວປູຟູກອບ', nameTh: 'ไข่เจียวปูฟูกรอบ', priceLAK: 45000, icon: 'sparkles' },
            { id: 'r9', nameLo: 'ເຂົ້າຈ້າວ 1 ໂຖ', nameTh: 'ข้าวสวย 1 โถ', priceLAK: 15000, icon: 'bowl' }
          ]
        },
        {
          id: 'soups', nameLo: 'ແກງ & ຕົ້ມ', nameTh: 'ต้ม & แกง',
          items: [
            { id: 's10', nameLo: 'ຕົ້ມຍຳກຸ້ງນ້ຳຂົ້ນ (ໝໍ້ໄຟ)', nameTh: 'ต้มยำกุ้งน้ำข้น หม้อไฟ', priceLAK: 65000, icon: 'pot' },
            { id: 's11', nameLo: 'ຕົ້ມແຊ່ບກະດູກອ່ອນ', nameTh: 'ต้มแซ่บกระดูกอ่อน', priceLAK: 50000, icon: 'flame' },
            { id: 's12', nameLo: 'ແກງສົ້ມຊະອົມກຸ້ງສົດ', nameTh: 'แกงส้มชะอมกุ้งสด', priceLAK: 55000, icon: 'pot' },
            { id: 's13', nameLo: 'ແກງຈືດເຕົ້າຮູ້ໝູສັບສາຫຼ່າຍ', nameTh: 'แกงจืดเต้าหู้หมูสับสาหร่าย', priceLAK: 35000, icon: 'bowl' }
          ]
        },
        {
          id: 'drinks', nameLo: 'ເຄື່ອງດື່ມ', nameTh: 'เครื่องดื่ม',
          items: [
            { id: 'b1', nameLo: 'ເບຍລາວ ໃຫຍ່ (Beerlao)', nameTh: 'เบียร์ลาว ขวดใหญ่', priceLAK: 18000, icon: 'beer' },
            { id: 'w1', nameLo: 'ນ້ຳດື່ມ (Water)', nameTh: 'น้ำดื่มบริสุทธิ์', priceLAK: 5000, icon: 'droplet' },
            { id: 's1', nameLo: 'ໂຄ້ກ / ແປັບຊີ', nameTh: 'โค้ก / แป๊ปซี่', priceLAK: 10000, icon: 'soda' },
            { id: 'j1', nameLo: 'ນ້ຳໝາກໂມປັ່ນສົດ', nameTh: 'น้ำแตงโมปั่นสด', priceLAK: 20000, icon: 'soda' }
          ]
        }
      ]
    }
  },
  cafe: {
    storeNameLo: 'KhamThong Golden Cafe',
    storeNameTh: 'คำทอง คาเฟ่ & เบเกอรี่',
    taglineLo: 'ກາເຟສົດ ຄຸນນະພາບພຣີມ່ຽມ & ເບເກີຣີ່',
    taglineTh: 'กาแฟสเปเชียลตี้ & เบเกอรี่โฮมเมด',
    storeConcept: 'cafe',
    scaleMode: false,
    menu: {
      meatGrades: [],
      categories: [
        {
          id: 'coffee', nameLo: 'ກາເຟສົດ', nameTh: 'กาแฟสด Specialty',
          items: [
            { id: 'c1', nameLo: 'Iced Americano (House Blend)', nameTh: 'อเมริกาโน่เย็น พิเศษ', priceLAK: 22000, icon: 'coffee' },
            { id: 'c2', nameLo: 'Dirty Coffee (Signature)', nameTh: 'เดอร์ตี้คอฟฟี่ ซิกเนเจอร์', priceLAK: 30000, icon: 'coffee' },
            { id: 'c3', nameLo: 'Iced Latte (Fresh Milk)', nameTh: 'ลาเต้เย็น นมสดฮอกไกโด', priceLAK: 25000, icon: 'coffee' },
            { id: 'c4', nameLo: 'Caramel Macchiato', nameTh: 'คาราเมลมัคคิอาโต้', priceLAK: 28000, icon: 'coffee' },
            { id: 'c5', nameLo: 'Coconut Americano (ໝາກພ້າວ)', nameTh: 'อเมริกาโน่น้ำมะพร้าวสด', priceLAK: 28000, icon: 'coffee' }
          ]
        },
        {
          id: 'tea_drinks', nameLo: 'ຊາ & ສະມູດຕີ້', nameTh: 'ชา & สมูทตี้',
          items: [
            { id: 't1', nameLo: 'Uji Matcha Latte (Kyoto Japan)', nameTh: 'มัทฉะลาเต้ อูจิเกียวโตแท้', priceLAK: 30000, icon: 'leaf' },
            { id: 't2', nameLo: 'Thai Milk Tea (ຊາໄທບູຮານ)', nameTh: 'ชาไทยเย็น สูตรเข้มข้น', priceLAK: 22000, icon: 'droplet' },
            { id: 't3', nameLo: 'Yuzu Sparkling Soda', nameTh: 'ยูซุโซดา สปาร์คกลิ้ง', priceLAK: 25000, icon: 'soda' }
          ]
        },
        {
          id: 'bakery', nameLo: 'ເບເກີຣີ່ & ຂອງຫວານ', nameTh: 'เบเกอรี่ & ของหวาน',
          items: [
            { id: 'bk1', nameLo: 'Butter Croissant (France)', nameTh: 'ครัวซองต์ เนยสดฝรั่งเศส', priceLAK: 25000, icon: 'layers' },
            { id: 'bk2', nameLo: 'Basque Burnt Cheesecake', nameTh: 'ชีสเค้กหน้าไหม้ บาสก์', priceLAK: 35000, icon: 'gem' },
            { id: 'bk3', nameLo: 'Choco Fudge Cake (ໜ້ານິ່ມ)', nameTh: 'เค้กช็อกโกแลตหน้านิ่ม', priceLAK: 32000, icon: 'sparkles' }
          ]
        }
      ]
    }
  },
  bar: {
    storeNameLo: 'KhamThong Golden Lounge & Bar',
    storeNameTh: 'คำทอง บาร์ & เบียร์การ์เด้น',
    taglineLo: 'ເບຍສົດ ຄັອກເທວ & ອາຫານກັບແກ້ມ ດົນຕີສົດ',
    taglineTh: 'เบียร์สดวุ้น ค็อกเทล & กับแกล้มรสเด็ด',
    storeConcept: 'bar',
    scaleMode: false,
    menu: {
      meatGrades: [],
      categories: [
        {
          id: 'beer_alcohol', nameLo: 'ເບຍສົດ & ເຄື່ອງດື່ມແອລກໍຮໍ', nameTh: 'เบียร์สด & แอลกอฮอล์',
          items: [
            { id: 'ba1', nameLo: 'Beerlao ທາວເວີ້ 3L (Tower)', nameTh: 'เบียร์ลาว ทาวเวอร์ 3 ลิตร', priceLAK: 110000, icon: 'beer' },
            { id: 'ba2', nameLo: 'ໂປຣ ເບຍລາວ Gold 3 ຂວດ', nameTh: 'โปร เบียร์ลาวโกลด์ 3 ขวด', priceLAK: 60000, icon: 'beer' },
            { id: 'ba3', nameLo: 'Hoegaarden / Budweiser (Pint)', nameTh: 'โฮการ์เด้น / บัดไวเซอร์', priceLAK: 48000, icon: 'beer' }
          ]
        },
        {
          id: 'bar_snacks', nameLo: 'ກັບແກ້ມຍອດຮິດ', nameTh: 'กับแกล้มยอดฮิต',
          items: [
            { id: 'bs1', nameLo: 'ເອັນໄກ່ທອດງາ ກອບ', nameTh: 'เอ็นไก่ทอดงา กรอบ', priceLAK: 35000, icon: 'drumstick' },
            { id: 'bs2', nameLo: 'ໝູແດດດຽວທອດ + ແຈ່ວບອງ', nameTh: 'หมูแดดเดียวทอด + แจ่วบอง', priceLAK: 40000, icon: 'flame' },
            { id: 'bs3', nameLo: 'ກຸ້ງແຊ່ນ້ຳປາ ວາຊາບິສົດ', nameTh: 'กุ้งแช่น้ำปลา วาซาบิสด', priceLAK: 50000, icon: 'fish' }
          ]
        }
      ]
    }
  }
};

function addLocalActivity(textLo, textTh) {
  if (!globalServerState.recentActivities) globalServerState.recentActivities = [];
  globalServerState.recentActivities.unshift({
    id: Date.now(),
    time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    textLo,
    textTh
  });
  if (globalServerState.recentActivities.length > 25) globalServerState.recentActivities.pop();
}

function applyClientPosMutation(type, payload) {
  if (!globalServerState || !globalServerState.settings) return;
  let telemetryEvent = null;

  if (type === 'ADD_ORDER_TO_TABLE') {
    const { tableId, items } = payload;
    const table = (globalServerState.tables || []).find(t => t.id === tableId);
    if (table) {
      if (table.status === 'empty') {
        table.status = 'occupied';
        table.seatedAt = Date.now();
        table.items = [];
        table.subtotalLAK = 0;
      }
      const timeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
      items.forEach(item => {
        table.items.push({ ...item, time: timeStr, status: item.status || 'cooking' });
        table.subtotalLAK += item.total;
        if (item.weight) {
          globalServerState.dailyStats.totalMeatKg = +((globalServerState.dailyStats.totalMeatKg || 0) + item.weight).toFixed(2);
        }
      });
      const addedSum = items.reduce((s, x) => s + x.total, 0);
      addLocalActivity(
        `ໂຕະ ${tableId}: ເພີ່ມ ${items.length} ລາຍການ (${addedSum.toLocaleString()} ₭) [ສົ່ງເຂົ້າຄົວ KDS]`,
        `โต๊ะ ${tableId}: เพิ่ม ${items.length} รายการ (${addedSum.toLocaleString()} ₭) [ส่งเข้าครัว KDS]`
      );
      telemetryEvent = `เปิดออเดอร์ โต๊ะ ${tableId} (+${addedSum.toLocaleString()} ₭)`;
    }
  } else if (type === 'CREATE_TAKEAWAY') {
    const { items, totalLAK, paymentMethod, cashReceivedLAK, changeLAK, customerName } = payload;
    const orderId = `TA-${Date.now().toString().slice(-4)}`;
    const order = {
      id: orderId,
      type: 'takeaway',
      time: Date.now(),
      customerName: customerName || 'ລູກຄ້າຊື້ກັບບ້ານ',
      items,
      totalLAK,
      paymentMethod: paymentMethod || 'BCEL One',
      cashReceivedLAK: cashReceivedLAK || totalLAK,
      changeLAK: changeLAK || 0
    };
    if (!globalServerState.ordersHistory) globalServerState.ordersHistory = [];
    globalServerState.ordersHistory.unshift(order);
    globalServerState.dailyStats.totalRevenueLAK = (globalServerState.dailyStats.totalRevenueLAK || 0) + totalLAK;
    globalServerState.dailyStats.ordersCount = (globalServerState.dailyStats.ordersCount || 0) + 1;
    globalServerState.dailyStats.takeawayCount = (globalServerState.dailyStats.takeawayCount || 0) + 1;
    if (paymentMethod === 'Cash') {
      globalServerState.dailyStats.paymentBreakdown.cashLAK += totalLAK;
    } else {
      globalServerState.dailyStats.paymentBreakdown.bcelOneLAK += totalLAK;
    }
    items.forEach(item => {
      if (item.weight) {
        globalServerState.dailyStats.totalMeatKg = +((globalServerState.dailyStats.totalMeatKg || 0) + item.weight).toFixed(2);
      }
    });
    addLocalActivity(
      `ຊື້ກັບບ້ານ (${orderId}): ${totalLAK.toLocaleString()} ₭ (${order.paymentMethod})`,
      `ซื้อกลับบ้าน (${orderId}): ${totalLAK.toLocaleString()} ₭ (${order.paymentMethod})`
    );
    telemetryEvent = `เช็กบิลซื้อกลับบ้าน ${totalLAK.toLocaleString()} ₭`;
  } else if (type === 'CHECKOUT_TABLE') {
    const { tableId, paymentMethod, cashReceivedLAK, changeLAK } = payload;
    const table = (globalServerState.tables || []).find(t => t.id === tableId);
    if (table && table.status === 'occupied') {
      const total = table.subtotalLAK;
      const orderId = `TB${tableId}-${Date.now().toString().slice(-4)}`;
      const order = {
        id: orderId,
        type: 'dinein',
        tableId,
        tableName: table.nameLo,
        time: Date.now(),
        seatedDurationMins: table.seatedAt ? Math.floor((Date.now() - table.seatedAt) / 60000) : 0,
        items: [...table.items],
        totalLAK: total,
        paymentMethod: paymentMethod || 'BCEL One',
        cashReceivedLAK: cashReceivedLAK || total,
        changeLAK: changeLAK || 0
      };
      if (!globalServerState.ordersHistory) globalServerState.ordersHistory = [];
      globalServerState.ordersHistory.unshift(order);
      globalServerState.dailyStats.totalRevenueLAK = (globalServerState.dailyStats.totalRevenueLAK || 0) + total;
      globalServerState.dailyStats.ordersCount = (globalServerState.dailyStats.ordersCount || 0) + 1;
      globalServerState.dailyStats.dineInCount = (globalServerState.dailyStats.dineInCount || 0) + 1;
      if (paymentMethod === 'Cash') {
        globalServerState.dailyStats.paymentBreakdown.cashLAK += total;
      } else {
        globalServerState.dailyStats.paymentBreakdown.bcelOneLAK += total;
      }
      addLocalActivity(
        `ໂຕະ ${tableId}: ເຊັກບິນສຳເລັດ ${total.toLocaleString()} ₭ (${order.paymentMethod})`,
        `โต๊ะ ${tableId}: เช็กบิลเรียบร้อย ${total.toLocaleString()} ₭ (${order.paymentMethod})`
      );
      table.status = 'empty';
      table.seatedAt = null;
      table.items = [];
      table.subtotalLAK = 0;
      telemetryEvent = `เช็กบิล โต๊ะ ${tableId} (${total.toLocaleString()} ₭)`;
    }
  } else if (type === 'VOID_TABLE_ITEM') {
    const { tableId, itemIndex } = payload;
    const table = (globalServerState.tables || []).find(t => t.id === tableId);
    if (table && table.items[itemIndex]) {
      const removed = table.items.splice(itemIndex, 1)[0];
      table.subtotalLAK = Math.max(0, table.subtotalLAK - removed.total);
      if (table.items.length === 0) {
        table.status = 'empty';
        table.seatedAt = null;
      }
      addLocalActivity(
        `ໂຕະ ${tableId}: ຍົກເລີກລາຍການ "${removed.name}"`,
        `โต๊ะ ${tableId}: ยกเลิกรายการ "${removed.name}"`
      );
    }
  } else if (type === 'UPDATE_KITCHEN_ITEM_STATUS') {
    const { tableId, itemIndex, status } = payload;
    const table = (globalServerState.tables || []).find(t => t.id === tableId);
    if (table && table.items && table.items[itemIndex]) {
      table.items[itemIndex].status = status;
      if (posBroadcastChannel && status === 'ready') {
        posBroadcastChannel.postMessage({
          type: 'KITCHEN_ITEM_READY',
          payload: { tableId, itemName: table.items[itemIndex].name }
        });
      }
    }
  } else if (type === 'MARK_TABLE_KITCHEN_ALL_READY') {
    const { tableId } = payload;
    const table = (globalServerState.tables || []).find(t => t.id === tableId);
    if (table && table.items) {
      table.items.forEach(it => { it.status = 'ready'; });
    }
  } else if (type === 'UPDATE_SETTINGS') {
    if (payload.settings) {
      globalServerState.settings = { ...globalServerState.settings, ...payload.settings };
    }
    if (payload.meatPrices && globalServerState.menu && Array.isArray(globalServerState.menu.meatGrades)) {
      const mixed = globalServerState.menu.meatGrades.find(g => g.id === 'mixed');
      const prem = globalServerState.menu.meatGrades.find(g => g.id === 'premium');
      if (mixed && payload.meatPrices.mixed) mixed.priceLAK = payload.meatPrices.mixed;
      if (prem && payload.meatPrices.premium) prem.priceLAK = payload.meatPrices.premium;
    }
    addLocalActivity('ອັບເດດການຕັ້ງຄ່າຮ້ານສຳເລັດ', 'อัปเดตการตั้งค่าร้านค้าเรียบร้อย');
    telemetryEvent = payload.settings && payload.settings.isVipLicensed
      ? 'เปิดใช้งาน VIP PRO License สำเร็จ'
      : `อัปเดตการตั้งค่าร้าน (${globalServerState.settings.storeNameLo || ''})`;
  } else if (type === 'APPLY_CONCEPT_PRESET') {
    const { concept } = payload;
    const presetsSource = serverConceptPresets || FALLBACK_CONCEPT_PRESETS;
    const preset = presetsSource[concept] || FALLBACK_CONCEPT_PRESETS[concept];
    if (preset) {
      globalServerState.settings.storeNameLo = preset.storeNameLo;
      globalServerState.settings.storeNameTh = preset.storeNameTh;
      globalServerState.settings.taglineLo = preset.taglineLo;
      globalServerState.settings.taglineTh = preset.taglineTh;
      globalServerState.settings.storeConcept = preset.storeConcept;
      globalServerState.settings.scaleMode = preset.scaleMode;
      globalServerState.menu = JSON.parse(JSON.stringify(preset.menu));
      addLocalActivity(
        `ປ່ຽນຮູບແບບຮ້ານເປັນ: ${preset.storeNameLo}`,
        `เปลี่ยนรูปแบบร้านเป็น: ${preset.storeNameTh}`
      );
      const isScale = preset.scaleMode !== false;
      toggleStaffScaleView(isScale ? 'scale' : 'catalog', true);
      telemetryEvent = `สลับโหมดร้านเป็น: ${preset.storeNameTh}`;
    }
  } else if (type === 'SAVE_MENU_ITEM') {
    const { item, categoryId } = payload;
    if (!globalServerState.menu) globalServerState.menu = { meatGrades: [], categories: [] };
    if (!globalServerState.menu.categories) globalServerState.menu.categories = [];
    let cat = globalServerState.menu.categories.find(c => c.id === categoryId);
    if (!cat) {
      cat = {
        id: categoryId || 'general',
        nameLo: categoryId === 'drinks' ? 'ເຄື່ອງດື່ມ' : (categoryId === 'freebies' ? 'ຂອງແຖມ' : 'ທົ່ວໄປ'),
        nameTh: categoryId === 'drinks' ? 'เครื่องดื่ม' : (categoryId === 'freebies' ? 'ของแถม' : 'ทั่วไป'),
        items: []
      };
      globalServerState.menu.categories.push(cat);
    }
    const existingIdx = cat.items.findIndex(i => i.id === item.id);
    if (existingIdx >= 0) {
      cat.items[existingIdx] = { ...cat.items[existingIdx], ...item };
    } else {
      item.id = item.id || `item_${Date.now()}`;
      cat.items.push(item);
    }
    addLocalActivity(
      `ບັນທຶກເມນູ "${item.nameLo}" (${(item.priceLAK || 0).toLocaleString()} ₭)`,
      `บันทึกเมนู "${item.nameTh || item.nameLo}" (${(item.priceLAK || 0).toLocaleString()} ₭)`
    );
    telemetryEvent = `เพิ่ม/แก้เมนู: ${item.nameTh || item.nameLo}`;
  } else if (type === 'DELETE_MENU_ITEM') {
    const { itemId, categoryId } = payload;
    if (globalServerState.menu && globalServerState.menu.categories) {
      globalServerState.menu.categories.forEach(cat => {
        if (!categoryId || cat.id === categoryId) {
          const idx = cat.items.findIndex(i => i.id === itemId);
          if (idx >= 0) cat.items.splice(idx, 1);
        }
      });
    }
  } else if (type === 'CLOSE_DAILY_REGISTER') {
    const summary = {
      totalRev: globalServerState.dailyStats.totalRevenueLAK || 0,
      orders: globalServerState.dailyStats.ordersCount || 0
    };
    addLocalActivity(
      `ປິດຍອດປະຈຳວັນ: ${summary.totalRev.toLocaleString()} ₭ (${summary.orders} ບິນ)`,
      `ปิดยอดประจำวัน: ${summary.totalRev.toLocaleString()} ₭ (${summary.orders} บิล)`
    );
    globalServerState.dailyStats = {
      date: new Date().toISOString().split('T')[0],
      totalRevenueLAK: 0,
      totalMeatKg: 0,
      ordersCount: 0,
      dineInCount: 0,
      takeawayCount: 0,
      paymentBreakdown: { bcelOneLAK: 0, cashLAK: 0 }
    };
    telemetryEvent = `ปิดยอดประจำวัน (${summary.totalRev.toLocaleString()} ₭)`;
  }

  // Save to per-device localStorage and sync across local browser tabs
  saveStateToLocalDevice();
  if (posBroadcastChannel) {
    posBroadcastChannel.postMessage({ type: 'LOCAL_TAB_SYNC', state: globalServerState });
  }
  renderAll();
  if (inspectingTableId && document.getElementById('tableInspectModal') && document.getElementById('tableInspectModal').classList.contains('active')) {
    openTableInspector(inspectingTableId);
  }
  if (document.getElementById('menuManagerModal') && document.getElementById('menuManagerModal').classList.contains('active')) {
    renderMenuEditorItems();
  }
  if (telemetryEvent) {
    sendUsageTelemetry(telemetryEvent);
  }
}

// ─── SILENT CUSTOMER TELEMETRY & LEAD CAPTURE (SENDS USAGE STATS TO DEVELOPER) ───
const LOCAL_CRM_LEADS_KEY = 'khamthong_crm_leads_v1';

function upsertLocalCrmLead(payload) {
  try {
    const raw = localStorage.getItem(LOCAL_CRM_LEADS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const now = Date.now();
    let item = list.find(x => x.deviceId === payload.deviceId);
    if (!item) {
      item = {
        deviceId: payload.deviceId,
        storeName: payload.storeName,
        ownerName: payload.ownerName || '-',
        phone: payload.phone || '-',
        location: payload.location || '-',
        storeConcept: payload.storeConcept || 'sindad',
        ordersCount: 0,
        totalRevenueLAK: 0,
        vipClicks: 0,
        isVipLicensed: false,
        lastEvent: payload.lastEvent,
        firstSeenAt: now,
        lastActiveAt: now
      };
      list.unshift(item);
    }
    if (payload.storeName) item.storeName = payload.storeName;
    if (payload.ownerName) item.ownerName = payload.ownerName;
    if (payload.phone) item.phone = payload.phone;
    if (payload.location) item.location = payload.location;
    if (payload.storeConcept) item.storeConcept = payload.storeConcept;
    if (typeof payload.ordersCount === 'number') item.ordersCount = Math.max(item.ordersCount || 0, payload.ordersCount);
    if (typeof payload.totalRevenueLAK === 'number') item.totalRevenueLAK = Math.max(item.totalRevenueLAK || 0, payload.totalRevenueLAK);
    if (payload.incrementVipClick) item.vipClicks = (item.vipClicks || 0) + 1;
    if (typeof payload.isVipLicensed === 'boolean') item.isVipLicensed = payload.isVipLicensed;
    if (payload.lastEvent) item.lastEvent = payload.lastEvent;
    item.lastActiveAt = now;
    localStorage.setItem(LOCAL_CRM_LEADS_KEY, JSON.stringify(list));
  } catch (e) {}
}

function sendUsageTelemetry(eventDescription, extra = {}) {
  try {
    const s = (globalServerState && globalServerState.settings) || {};
    const stats = (globalServerState && globalServerState.dailyStats) || {};
    const payload = {
      deviceId: getOrCreateDeviceId(),
      storeName: s.storeNameTh || s.storeNameLo || 'ร้านค้าทดลองใช้',
      ownerName: s.ownerName || localStorage.getItem('khamthong_owner_name') || '-',
      phone: s.phone || '-',
      location: s.addressTh || s.addressLo || '-',
      storeConcept: s.storeConcept || 'sindad',
      ordersCount: stats.ordersCount || 0,
      totalRevenueLAK: stats.totalRevenueLAK || 0,
      isVipLicensed: !!s.isVipLicensed,
      lastEvent: eventDescription || 'ใช้งานระบบ',
      ...extra
    };
    upsertLocalCrmLead(payload);
    fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {});
  } catch (e) {}
}

// ─── QUICK SHOP REGISTRATION MODAL (PER-DEVICE SETUP + LEAD CAPTURE) ───
function openShopRegisterModal() {
  playGoldChime('tap');
  const s = (globalServerState && globalServerState.settings) || {};
  const nameIn = document.getElementById('regStoreNameInput');
  if (nameIn) nameIn.value = s.storeNameLo || '';
  const ownerIn = document.getElementById('regOwnerNameInput');
  if (ownerIn) ownerIn.value = s.ownerName || localStorage.getItem('khamthong_owner_name') || '';
  const phoneIn = document.getElementById('regPhoneInput');
  if (phoneIn) phoneIn.value = s.phone || '';
  const locIn = document.getElementById('regLocationInput');
  if (locIn) locIn.value = s.addressTh || s.addressLo || '';
  const conceptSel = document.getElementById('regConceptSelect');
  if (conceptSel) conceptSel.value = s.storeConcept || 'sindad';

  const modal = document.getElementById('shopRegisterModal');
  if (modal) modal.classList.add('active');
}

function closeShopRegisterModal() {
  playGoldChime('tap');
  const modal = document.getElementById('shopRegisterModal');
  if (modal) modal.classList.remove('active');
}

function submitShopRegistration() {
  const storeName = (document.getElementById('regStoreNameInput').value || '').trim();
  const ownerName = (document.getElementById('regOwnerNameInput').value || '').trim();
  const phone = (document.getElementById('regPhoneInput').value || '').trim();
  const location = (document.getElementById('regLocationInput').value || '').trim();
  const concept = document.getElementById('regConceptSelect').value || 'sindad';

  if (!storeName) {
    alert(currentLang === 'lo' ? 'ກະລຸນາໃສ່ຊື່ຮ້ານຄ້າຂອງທ່ານ' : 'กรุณากรอกชื่อร้านค้าของคุณ');
    return;
  }

  playGoldChime('success');
  if (ownerName) localStorage.setItem('khamthong_owner_name', ownerName);

  // If concept changed, load preset first
  if (globalServerState.settings && globalServerState.settings.storeConcept !== concept) {
    applyClientPosMutation('APPLY_CONCEPT_PRESET', { concept });
  }

  // Update store settings on this device
  applyClientPosMutation('UPDATE_SETTINGS', {
    settings: {
      storeNameLo: storeName,
      storeNameTh: storeName,
      ownerName: ownerName || '-',
      phone: phone || '-',
      addressLo: location || 'ນະຄອນຫຼວງວຽງຈັນ',
      addressTh: location || 'นครหลวงเวียงจันทน์'
    }
  });

  sendUsageTelemetry(`ลงทะเบียนร้านใหม่: ${storeName} (${phone || 'ไม่ระบุเบอร์'})`);
  closeShopRegisterModal();
  showToast(currentLang === 'lo' ? `💾 ບັນທຶກຮ້ານ "${storeName}" ລົງເຄື່ອງນີ້ສຳເລັດ!` : `💾 บันทึกข้อมูลร้าน "${storeName}" ลงเครื่องนี้เรียบร้อย!`);
}

function resetLocalDeviceStore() {
  const msg = currentLang === 'lo'
    ? 'ທ່ານຕ້ອງການລ້າງຂໍ້ມູນທີ່ບັນທຶກໃນເຄື່ອງນີ້ ແລະ ກັບຄືນສູ່ຄ່າເລີ່ມຕົ້ນແທ້ບໍ່?'
    : 'คุณต้องการล้างข้อมูลที่บันทึกไว้ในเครื่องนี้ และกลับสู่ค่าเริ่มต้นใช่หรือไม่?';
  if (confirm(msg)) {
    localStorage.removeItem(LOCAL_STORE_KEY);
    window.location.reload();
  }
}

// ─── MASON BIZAPP DEVELOPER / ADMIN LEAD CRM DASHBOARD ───
let cachedCrmLeads = [];

async function openLeadsCrmModal() {
  playGoldChime('tap');
  const modal = document.getElementById('leadsCrmModal');
  if (!modal) return;
  modal.classList.add('active');
  await renderLeadsCrmModal();
}

function closeLeadsCrmModal() {
  playGoldChime('tap');
  const modal = document.getElementById('leadsCrmModal');
  if (modal) modal.classList.remove('active');
}

async function renderLeadsCrmModal() {
  const container = document.getElementById('crmLeadsListContainer');
  if (!container) return;

  let loadedFromServer = false;
  try {
    const resp = await fetch('/api/leads');
    if (resp.ok) {
      const data = await resp.json();
      cachedCrmLeads = data.leads || [];
      document.getElementById('crmTotalShopsVal').textContent = `${data.totalShops || cachedCrmLeads.length} ร้าน`;
      document.getElementById('crmHotLeadsVal').textContent = `${data.hotLeadsCount || 0} ร้าน`;
      document.getElementById('crmVipShopsVal').textContent = `${data.vipShopsCount || 0} ร้าน`;
      loadedFromServer = true;
    }
  } catch (e) {}

  if (!loadedFromServer) {
    try {
      const seedResp = await fetch('./default-leads.json');
      const seedLeads = seedResp.ok ? await seedResp.json() : [];
      const localRaw = localStorage.getItem(LOCAL_CRM_LEADS_KEY);
      const localLeads = localRaw ? JSON.parse(localRaw) : [];
      const mergedMap = new Map();
      [...localLeads, ...seedLeads].forEach(l => {
        if (l && l.deviceId && !mergedMap.has(l.deviceId)) mergedMap.set(l.deviceId, l);
      });
      cachedCrmLeads = Array.from(mergedMap.values()).sort((a, b) => (b.lastActiveAt || 0) - (a.lastActiveAt || 0));
      const hotCount = cachedCrmLeads.filter(l => !l.isVipLicensed && ((l.ordersCount || 0) >= 5 || (l.vipClicks || 0) > 0)).length;
      const vipCount = cachedCrmLeads.filter(l => l.isVipLicensed).length;
      document.getElementById('crmTotalShopsVal').textContent = `${cachedCrmLeads.length} ร้าน`;
      document.getElementById('crmHotLeadsVal').textContent = `${hotCount} ร้าน`;
      document.getElementById('crmVipShopsVal').textContent = `${vipCount} ร้าน`;
    } catch (e) {}
  }

  if (!cachedCrmLeads || cachedCrmLeads.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:24px; color:var(--text-muted);">ยังไม่มีข้อมูลร้านค้า</div>`;
    return;
  }

  const conceptNames = {
    sindad: '🥩 หมูกระทะ/ชั่งโล',
    restaurant: '🍲 ร้านอาหารตามสั่ง',
    cafe: '☕ คาเฟ่ & กาแฟ',
    bar: '🍺 บาร์ & ร้านเหล้า'
  };

  let html = '';
  cachedCrmLeads.forEach(lead => {
    const isHot = !lead.isVipLicensed && ((lead.ordersCount || 0) >= 5 || (lead.vipClicks || 0) > 0);
    const badgeHtml = lead.isVipLicensed
      ? `<span style="background:rgba(16,185,129,0.2); border:1px solid #10B981; color:#34D399; padding:2px 8px; border-radius:999px; font-size:0.65rem; font-weight:800;">👑 ลูกค้า VIP PRO</span>`
      : (isHot
        ? `<span style="background:rgba(245,158,11,0.22); border:1px solid #F59E0B; color:#FCD34D; padding:2px 8px; border-radius:999px; font-size:0.65rem; font-weight:800;">🔥 Hot Lead (พร้อมปิดการขาย!)</span>`
        : `<span style="background:rgba(255,255,255,0.08); color:var(--text-muted); padding:2px 8px; border-radius:999px; font-size:0.65rem;">🟢 ทดลองใช้ฟรี</span>`);

    const minsAgo = lead.lastActiveAt ? Math.max(1, Math.floor((Date.now() - lead.lastActiveAt) / 60000)) : 1;
    const timeText = minsAgo < 60 ? `${minsAgo} นาทีที่แล้ว` : `${Math.floor(minsAgo / 60)} ชม. ที่แล้ว`;

    html += `
      <div style="background:rgba(24,19,12,0.85); border:1px solid ${isHot ? 'rgba(245,158,11,0.5)' : 'rgba(245,208,97,0.2)'}; border-radius:10px; padding:10px 12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <div style="display:flex; flex-direction:column; gap:3px; min-width:220px; flex:1;">
          <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
            <span style="font-size:0.9rem; font-weight:800; color:#FFF;">${lead.storeName || 'ร้านค้าทดลองใช้'}</span>
            ${badgeHtml}
            <span style="font-size:0.68rem; color:var(--gold-300);">${conceptNames[lead.storeConcept] || '🥩 หมูกระทะ'}</span>
          </div>
          <div style="font-size:0.74rem; color:var(--gold-200); font-weight:600;">
            👤 ผู้ติดต่อ: ${lead.ownerName || '-'} &nbsp;|&nbsp; 📞 โทร/WhatsApp: <span style="color:#34D399;">${lead.phone || '-'}</span> &nbsp;|&nbsp; 📍 ${lead.location || '-'}
          </div>
          <div style="font-size:0.68rem; color:var(--text-muted);">
            🕒 ล่าสุด (${timeText}): ${lead.lastEvent || '-'} &nbsp;•&nbsp; รหัสเครื่อง: ${lead.deviceId}
          </div>
        </div>
        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:2px; background:rgba(0,0,0,0.35); padding:6px 10px; border-radius:8px; border:1px solid rgba(255,255,255,0.06);">
          <div style="font-size:0.78rem; font-weight:800; color:var(--gold-300);">🧾 เปิดบิลแล้ว: ${lead.ordersCount || 0} บิล</div>
          <div style="font-size:0.72rem; color:#FFF;">💰 ยอดขายสะสม: ${(lead.totalRevenueLAK || 0).toLocaleString()} ₭</div>
          <div style="font-size:0.65rem; color:#FBBF24;">👑 กดดูหน้าอัปเกรด VIP: ${lead.vipClicks || 0} ครั้ง</div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function exportLeadsToCsv() {
  playGoldChime('success');
  if (!cachedCrmLeads || cachedCrmLeads.length === 0) {
    alert('ยังไม่มีข้อมูลร้านค้าสำหรับส่งออก');
    return;
  }
  const headers = ['DeviceID', 'StoreName', 'OwnerName', 'Phone_WhatsApp', 'Location', 'Concept', 'OrdersCount', 'TotalRevenueLAK', 'VipClicks', 'IsVIP', 'LastEvent'];
  const rows = cachedCrmLeads.map(l => [
    l.deviceId || '',
    `"${(l.storeName || '').replace(/"/g, '""')}"`,
    `"${(l.ownerName || '').replace(/"/g, '""')}"`,
    `"${(l.phone || '').replace(/"/g, '""')}"`,
    `"${(l.location || '').replace(/"/g, '""')}"`,
    l.storeConcept || '',
    l.ordersCount || 0,
    l.totalRevenueLAK || 0,
    l.vipClicks || 0,
    l.isVipLicensed ? 'YES' : 'NO',
    `"${(l.lastEvent || '').replace(/"/g, '""')}"`
  ]);
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `MasonBizApp_POS_Leads_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('📥 ดาวน์โหลดไฟล์รายชื่อร้านค้า (CSV/Excel) เรียบร้อย!');
}

// ─── INITIALIZATION ON LOAD ───
window.addEventListener('DOMContentLoaded', () => {
  hydrateIcons();
  initWebSocket();
  calculateAndRenderWeight();
});
