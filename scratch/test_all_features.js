const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runTests() {
  console.log('🚀 Launching Edge browser for comprehensive POS feature testing...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    defaultViewport: { width: 1024, height: 554 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err.message));
  page.on('dialog', async dialog => {
    console.log('DIALOG OPENED:', dialog.message());
    await dialog.accept();
  });

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    console.log('✅ Page loaded');
    await new Promise(r => setTimeout(r, 1000));

    // Screenshot 1: Default Staff View (BBQ By Weight)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_default_staff_view.png') });
    console.log('📸 01_default_staff_view.png saved');

    // Test 1: Quick Exchange Rate Switcher
    console.log('Testing Exchange Rate Quick Switcher...');
    await page.click('#rateBadge');
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_exchange_rate_modal.png') });
    console.log('📸 02_exchange_rate_modal.png saved');

    // Click 700₭ chip using evaluate
    await page.evaluate(() => {
      const chips = Array.from(document.querySelectorAll('.rate-chip-btn'));
      const target = chips.find(c => c.textContent.includes('700'));
      if (target) target.click();
    });
    console.log('Selected 700 ₭ chip');
    await new Promise(r => setTimeout(r, 400));

    // Click Save Rate
    await page.evaluate(() => saveExchangeRateQuick());
    await new Promise(r => setTimeout(r, 800));

    const updatedRateText = await page.$eval('#rateBadge', el => el.textContent.trim());
    console.log('Updated Rate Badge:', updatedRateText);

    // Test 2: Multi-Concept POS & Menu Manager
    console.log('Testing Menu Manager & Multi-Concept Presets...');
    await page.evaluate(() => openMenuManager());
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_menu_manager_concepts.png') });
    console.log('📸 03_menu_manager_concepts.png saved');

    // Switch to Restaurant preset
    await page.click('#conceptCard_restaurant');
    await new Promise(r => setTimeout(r, 1000));
    console.log('Switched concept to Restaurant (ຮ້ານອາຫານ & ຕາມສັ່ງ)');

    // Close Menu Manager
    await page.evaluate(() => closeMenuManager());
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_restaurant_catalog_mode.png') });
    console.log('📸 04_restaurant_catalog_mode.png saved');

    // Test adding dishes from restaurant catalog
    await page.evaluate(() => {
      const cards = document.querySelectorAll('.catalog-card');
      if (cards.length > 0) {
        cards[0].click();
        cards[0].click();
      }
      if (cards.length > 1) {
        cards[1].click();
      }
    });
    console.log('Added dishes to staged order');
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_dishes_ordered.png') });
    console.log('📸 05_dishes_ordered.png saved');

    // Test 3: Custom Bank & QR Setup & Checkout Modal
    console.log('Testing Settings Modal Bank & Custom QR configuration...');
    await page.evaluate(() => openSettingsModal());
    await new Promise(r => setTimeout(r, 600));

    // Update Bank Name & Account
    await page.$eval('#settingBankName', el => el.value = 'BCEL One VIP (ທະນາຄານການຄ້າຕ່າງປະເທດລາວ)');
    await page.$eval('#settingBankAccountNumber', el => el.value = '01012-7777-9999-01');
    await page.$eval('#settingBankAccountName', el => el.value = 'KHAMTHONG LUXURY RESTAURANT');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_settings_bank_qr.png') });
    console.log('📸 06_settings_bank_qr.png saved');

    // Save Settings
    await page.evaluate(() => saveStoreSettings());
    await new Promise(r => setTimeout(r, 800));

    // Submit Order to Table 1
    console.log('Submitting order to Table 1...');
    await page.click('#submitOrderBtn');
    await new Promise(r => setTimeout(r, 800));

    // Switch to Owner view to inspect checkout
    await page.evaluate(() => switchView('owner'));
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_owner_view.png') });
    console.log('📸 07_owner_view.png saved');

    // Trigger checkout for Table 1
    await page.evaluate(() => {
      const occupiedBox = document.querySelector('.table-box.occupied button');
      if (occupiedBox) occupiedBox.click();
    });
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_checkout_bank_qr_modal.png') });
    console.log('📸 08_checkout_bank_qr_modal.png saved');

    const bankTitle = await page.$eval('#checkoutBankTitle', el => el.textContent.trim());
    const accInfo = await page.$eval('#checkoutAccInfo', el => el.textContent.trim());
    console.log('Rendered Bank Info in Checkout Modal:', bankTitle, '|', accInfo);

    // Close checkout modal
    await page.evaluate(() => closeCheckoutModal());
    await new Promise(r => setTimeout(r, 500));

    // Switch back to Staff view
    await page.evaluate(() => switchView('staff'));
    await new Promise(r => setTimeout(r, 500));

    // Test 4: VIP PRO Modal & License Activation
    console.log('Testing VIP PRO Upgrade Modal & Activation...');
    await page.evaluate(() => openVipUpgradeModal());
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_vip_upgrade_modal.png') });
    console.log('📸 09_vip_upgrade_modal.png saved');

    // Activate VIP license
    await page.$eval('#vipLicenseKeyInput', el => el.value = 'VIP888');
    await page.evaluate(() => activateVipLicense());
    await new Promise(r => setTimeout(r, 1000));
    console.log('VIP license key submitted');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_vip_active_staff_view.png') });
    console.log('📸 10_vip_active_staff_view.png saved');

    // Test 5: Switch to Cafe / Drinks Concept
    console.log('Testing Cafe concept switch...');
    await page.evaluate(() => openMenuManager());
    await new Promise(r => setTimeout(r, 600));
    await page.click('#conceptCard_cafe');
    await new Promise(r => setTimeout(r, 800));
    await page.evaluate(() => closeMenuManager());
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11_cafe_concept_view.png') });
    console.log('📸 11_cafe_concept_view.png saved');

    console.log('🎉 ALL AUTOMATED TESTS COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test failed with error:', err);
  } finally {
    await browser.close();
  }
}

runTests();
