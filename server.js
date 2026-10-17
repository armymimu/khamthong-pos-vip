const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'store.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// QR Code generation endpoint (100% offline, standalone)
app.get('/api/qr', async (req, res) => {
  try {
    if (storeData.settings && storeData.settings.customQrImg && !req.query.text) {
      return res.json({ dataUrl: storeData.settings.customQrImg });
    }

    const text = req.query.text || 'BCEL-ONE-PAYMENT';
    const dataUrl = await QRCode.toDataURL(text, {
      margin: 1,
      width: 200,
      color: {
        dark: '#1A1305',
        light: '#FFFFFF'
      }
    });
    res.json({ dataUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Built-in Concept Presets for all types of food & beverage businesses
// Built-in Concept Presets for all types of food & beverage businesses
const CONCEPT_PRESETS = {
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
          id: 'drinks',
          nameLo: 'ເຄື່ອງດື່ມ',
          nameTh: 'เครื่องดื่ม',
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
          id: 'addons',
          nameLo: 'ເຄື່ອງຄຽງ & ບໍລິການ',
          nameTh: 'เครื่องเคียง & บริการ',
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
          id: 'freebies',
          nameLo: 'ຂອງແຖມ',
          nameTh: 'ของแถม',
          items: [
            { id: 'f1', nameLo: 'ຊຸດຜັກສົດ & ວຸ້ນເສັ້ນ (ຟຣີ)', nameTh: 'ชุดผักสด & วุ้นเส้น (ฟรี)', priceLAK: 0, isFreebie: true, icon: 'leaf' },
            { id: 'f2', nameLo: 'ນ້ຳຊຸບກະດູກໝູເຕີມ (ຟຣີ)', nameTh: 'น้ำซุปกระดูกหมูเติม (ฟรี)', priceLAK: 0, isFreebie: true, icon: 'pot' },
            { id: 'f3', nameLo: 'ນ້ຳແຈ່ວສູດເດັດເຕີມ (ຟຣີ)', nameTh: 'น้ำจิ้มสูตรเด็ดเติม (ฟรี)', priceLAK: 0, isFreebie: true, icon: 'flame' },
            { id: 'f4', nameLo: 'ມັນໝູທາກະທະ (ຟຣີ)', nameTh: 'มันหมูทากระทะ (ฟรี)', priceLAK: 0, isFreebie: true, icon: 'drumstick' }
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
          id: 'main_dishes',
          nameLo: 'ອາຫານຈານຫຼັກ',
          nameTh: 'อาหารจานหลัก / กับข้าว',
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
          id: 'soups',
          nameLo: 'ແກງ & ຕົ້ມ',
          nameTh: 'ต้ม & แกง',
          items: [
            { id: 's10', nameLo: 'ຕົ້ມຍຳກຸ້ງນ້ຳຂົ້ນ (ໝໍ້ໄຟ)', nameTh: 'ต้มยำกุ้งน้ำข้น หม้อไฟ', priceLAK: 65000, icon: 'pot' },
            { id: 's11', nameLo: 'ຕົ້ມແຊ່ບກະດູກອ່ອນ', nameTh: 'ต้มแซ่บกระดูกอ่อน', priceLAK: 50000, icon: 'flame' },
            { id: 's12', nameLo: 'ແກງສົ້ມຊະອົມກຸ້ງສົດ', nameTh: 'แกงส้มชะอมกุ้งสด', priceLAK: 55000, icon: 'pot' },
            { id: 's13', nameLo: 'ແກງຈືດເຕົ້າຮູ້ໝູສັບສາຫຼ່າຍ', nameTh: 'แกงจืดเต้าหู้หมูสับสาหร่าย', priceLAK: 35000, icon: 'bowl' }
          ]
        },
        {
          id: 'drinks',
          nameLo: 'ເຄື່ອງດື່ມ',
          nameTh: 'เครื่องดื่ม',
          items: [
            { id: 'b1', nameLo: 'ເບຍລາວ ໃຫຍ່ (Beerlao)', nameTh: 'เบียร์ลาว ขวดใหญ่', priceLAK: 18000, icon: 'beer' },
            { id: 'b4', nameLo: 'ເບຍສິງ / ໄຮເນເກ້ນ', nameTh: 'เบียร์สิงห์ / ไฮเนเก้น', priceLAK: 25000, icon: 'beer' },
            { id: 'w1', nameLo: 'ນ້ຳດື່ມ (Water)', nameTh: 'น้ำดื่มบริสุทธิ์', priceLAK: 5000, icon: 'droplet' },
            { id: 's1', nameLo: 'ໂຄ້ກ / ແປັບຊີ', nameTh: 'โค้ก / แป๊ปซี่', priceLAK: 10000, icon: 'soda' },
            { id: 'j1', nameLo: 'ນ້ຳໝາກໂມປັ່ນສົດ', nameTh: 'น้ำแตงโมปั่นสด', priceLAK: 20000, icon: 'soda' },
            { id: 'i1', nameLo: 'ນ້ຳກ້ອນ ຖັງໃຫຍ່', nameTh: 'น้ำแข็ง ถังใหญ่', priceLAK: 10000, icon: 'cube' }
          ]
        },
        {
          id: 'freebies',
          nameLo: 'ຂອງແຖມ',
          nameTh: 'ของแถม',
          items: [
            { id: 'f10', nameLo: 'ໝາກໂມລ້າງປາກ (ຟຣີ)', nameTh: 'แตงโมล้างปาก (ฟรี)', priceLAK: 0, isFreebie: true, icon: 'sparkles' },
            { id: 'f11', nameLo: 'ນ້ຳຊຸບຮ້ອນ (ຟຣີ)', nameTh: 'น้ำซุปกระดูก (ฟรี)', priceLAK: 0, isFreebie: true, icon: 'pot' }
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
          id: 'coffee',
          nameLo: 'ກາເຟສົດ',
          nameTh: 'กาแฟสด Specialty',
          items: [
            { id: 'c1', nameLo: 'Iced Americano (House Blend)', nameTh: 'อเมริกาโน่เย็น พิเศษ', priceLAK: 22000, icon: 'coffee' },
            { id: 'c2', nameLo: 'Dirty Coffee (Signature)', nameTh: 'เดอร์ตี้คอฟฟี่ ซิกเนเจอร์', priceLAK: 30000, icon: 'coffee' },
            { id: 'c3', nameLo: 'Iced Latte (Fresh Milk)', nameTh: 'ลาเต้เย็น นมสดฮอกไกโด', priceLAK: 25000, icon: 'coffee' },
            { id: 'c4', nameLo: 'Caramel Macchiato', nameTh: 'คาราเมลมัคคิอาโต้', priceLAK: 28000, icon: 'coffee' },
            { id: 'c5', nameLo: 'Coconut Americano (ໝາກພ້າວ)', nameTh: 'อเมริกาโน่น้ำมะพร้าวสด', priceLAK: 28000, icon: 'coffee' },
            { id: 'c6', nameLo: 'Espresso Double Shot', nameTh: 'เอสเปรสโซ่ ดับเบิ้ลช็อต', priceLAK: 18000, icon: 'coffee' }
          ]
        },
        {
          id: 'tea_drinks',
          nameLo: 'ຊາ & ສະມູດຕີ້',
          nameTh: 'ชา & สมูทตี้',
          items: [
            { id: 't1', nameLo: 'Uji Matcha Latte (Kyoto Japan)', nameTh: 'มัทฉะลาเต้ อูจิเกียวโตแท้', priceLAK: 30000, icon: 'leaf' },
            { id: 't2', nameLo: 'Thai Milk Tea (ຊາໄທບູຮານ)', nameTh: 'ชาไทยเย็น สูตรเข้มข้น', priceLAK: 22000, icon: 'droplet' },
            { id: 't3', nameLo: 'Yuzu Sparkling Soda', nameTh: 'ยูซุโซดา สปาร์คกลิ้ง', priceLAK: 25000, icon: 'soda' },
            { id: 't4', nameLo: 'Strawberry Yogurt Smoothie', nameTh: 'สตรอว์เบอร์รี่โยเกิร์ตสมูทตี้', priceLAK: 30000, icon: 'soda' },
            { id: 't5', nameLo: 'Honey Lemon Iced Tea', nameTh: 'ชามะนาวน้ำผึ้งแท้', priceLAK: 22000, icon: 'droplet' }
          ]
        },
        {
          id: 'bakery',
          nameLo: 'ເບເກີຣີ່ & ຂອງຫວານ',
          nameTh: 'เบเกอรี่ & ของหวาน',
          items: [
            { id: 'bk1', nameLo: 'Butter Croissant (France)', nameTh: 'ครัวซองต์ เนยสดฝรั่งเศส', priceLAK: 25000, icon: 'layers' },
            { id: 'bk2', nameLo: 'Basque Burnt Cheesecake', nameTh: 'ชีสเค้กหน้าไหม้ บาสก์', priceLAK: 35000, icon: 'gem' },
            { id: 'bk3', nameLo: 'Choco Fudge Cake (ໜ້ານິ່ມ)', nameTh: 'เค้กช็อกโกแลตหน้านิ่ม', priceLAK: 32000, icon: 'sparkles' },
            { id: 'bk4', nameLo: 'Hong Kong Waffle + Ice Cream', nameTh: 'วาฟเฟิลฮ่องกง + ไอศกรีม', priceLAK: 35000, icon: 'sparkles' }
          ]
        },
        {
          id: 'freebies',
          nameLo: 'ຂອງແຖມ',
          nameTh: 'ของแถม',
          items: [
            { id: 'f20', nameLo: 'ນ້ຳຊາເຢັນຕ້ອນຮັບ (ຟຣີ)', nameTh: 'ชาเย็นเวลคัมดริ้งก์ (ฟรี)', priceLAK: 0, isFreebie: true, icon: 'droplet' },
            { id: 'f21', nameLo: 'ຄຸກກີ້ຄາຣາເມລ (ຟຣີ)', nameTh: 'บิสกิตคาราเมล (ฟรี)', priceLAK: 0, isFreebie: true, icon: 'gift' }
          ]
        }
      ]
    }
  },
  bar: {
    storeNameLo: 'ຄຳທອງ Beer Garden & Lounge',
    storeNameTh: 'คำทอง บาร์ & เบียร์การ์เด้น',
    taglineLo: 'ດົນຕີສົດ ເບຍເຢັນ & ກັບແກ້ມລົດເດັດ',
    taglineTh: 'ดนตรีสด เบียร์เย็นเฉียบ กับแกล้มรสเด็ด',
    storeConcept: 'bar',
    scaleMode: false,
    menu: {
      meatGrades: [],
      categories: [
        {
          id: 'beer_towers',
          nameLo: 'ເບຍ & ທາວເວີ',
          nameTh: 'เบียร์ & ทาวเวอร์',
          items: [
            { id: 'bar1', nameLo: 'Beerlao Tower (3 Litres)', nameTh: 'เบียร์ลาว ทาวเวอร์ (3 ลิตร)', priceLAK: 95000, icon: 'beer' },
            { id: 'bar2', nameLo: 'Beerlao Gold Bucket (5 Bottles)', nameTh: 'เบียร์ลาว โกลด์ บักเก็ต 5 ขวด', priceLAK: 100000, icon: 'beer' },
            { id: 'bar3', nameLo: 'Hoegaarden Rosée Tower (3L)', nameTh: 'โฮการ์เด้น โรเซ่ ทาวเวอร์', priceLAK: 180000, icon: 'beer' },
            { id: 'bar4', nameLo: 'Heineken Bucket (5 Bottles)', nameTh: 'ไฮเนเก้น บักเก็ต 5 ขวด', priceLAK: 120000, icon: 'beer' },
            { id: 'bar5', nameLo: 'Craft IPA Beer Can', nameTh: 'คราฟต์เบียร์ IPA กระป๋อง', priceLAK: 45000, icon: 'beer' }
          ]
        },
        {
          id: 'cocktails_spirits',
          nameLo: 'ຄັອກເທວ & ວິສກີ້',
          nameTh: 'ค็อกเทล & วิสกี้',
          items: [
            { id: 'c10', nameLo: 'Signature Cocktail 24K Gold', nameTh: 'ค็อกเทลซิกเนเจอร์ 24K Gold', priceLAK: 55000, icon: 'wine' },
            { id: 'c11', nameLo: 'Mojito Fresh Mint', nameTh: 'โมฮิโต้ มิ้นต์สด', priceLAK: 45000, icon: 'wine' },
            { id: 'c12', nameLo: 'Long Island Iced Tea', nameTh: 'ลองไอส์แลนด์ ไอซ์ที', priceLAK: 55000, icon: 'wine' },
            { id: 'w20', nameLo: 'Red Label Set (+Mixer 4+ນ້ຳກ້ອນ)', nameTh: 'เซ็ตเรดเลเบิล (+มิกเซอร์ 4 + น้ำแข็ง)', priceLAK: 290000, icon: 'wine' },
            { id: 'w21', nameLo: 'Black Label Set (+Mixer 4+ນ້ຳກ້ອນ)', nameTh: 'เซ็ตแบล็คเลเบิล (+มิกเซอร์ 4 + น้ำแข็ง)', priceLAK: 450000, icon: 'wine' }
          ]
        },
        {
          id: 'bar_snacks',
          nameLo: 'ກັບແກ້ມລົດເດັດ',
          nameTh: 'กับแกล้มยอดนิยม',
          items: [
            { id: 'sn1', nameLo: 'ເອັນໄກ່ທອດງາກອບ', nameTh: 'เอ็นข้อไก่ทอดงากรอบ', priceLAK: 35000, icon: 'drumstick' },
            { id: 'sn2', nameLo: 'ຂໍ້ໄກ່ທອດສະໝຸນໄພ', nameTh: 'ข้อไก่ทอดสมุนไพร', priceLAK: 35000, icon: 'drumstick' },
            { id: 'sn3', nameLo: 'ເຟຣນຟຣາຍທຣັບເຟິລຊີດ', nameTh: 'เฟรนช์ฟรายส์ทรัฟเฟิลชีส', priceLAK: 35000, icon: 'sparkles' },
            { id: 'sn4', nameLo: 'ຊີ້ນແດດດຽວທອດ', nameTh: 'เนื้อแดดเดียวทอด', priceLAK: 45000, icon: 'drumstick' },
            { id: 'sn5', nameLo: 'ຍຳຖົ່ວດິນ & ໝາກມ່ວງຫິມະພານ', nameTh: 'ยำถั่วลิสง & เม็ดมะม่วงหิมพานต์', priceLAK: 30000, icon: 'leaf' },
            { id: 'sn6', nameLo: 'ແໜມຂໍ້ໄກ່ທອດ', nameTh: 'แหนมข้อไก่ทอด', priceLAK: 38000, icon: 'drumstick' }
          ]
        },
        {
          id: 'drinks',
          nameLo: 'ມິກເຊີ & ເຄື່ອງດື່ມ',
          nameTh: 'มิกเซอร์ & ซอฟต์ดริงก์',
          items: [
            { id: 'i1', nameLo: 'ນ້ຳກ້ອນ ຖັງໃຫຍ່', nameTh: 'น้ำแข็ง ถังใหญ่', priceLAK: 10000, icon: 'cube' },
            { id: 's1', nameLo: 'ໂຄ້ກ / ໂຊດາ', nameTh: 'โค้ก / โซดา', priceLAK: 10000, icon: 'soda' },
            { id: 'w1', nameLo: 'ນ້ຳດື່ມ (Water)', nameTh: 'น้ำดื่ม', priceLAK: 5000, icon: 'droplet' }
          ]
        },
        {
          id: 'freebies',
          nameLo: 'ຂອງແຖມ',
          nameTh: 'ของแถม',
          items: [
            { id: 'f30', nameLo: 'ຖົ່ວແກ້ມເບຍຈານທຳອິດ (ຟຣີ)', nameTh: 'ถั่วแกล้มเบียร์จานแรก (ฟรี)', priceLAK: 0, isFreebie: true, icon: 'gift' },
            { id: 'f31', nameLo: 'ປັອບຄອນເນີຍສົດ (ຟຣີ)', nameTh: 'ป๊อปคอร์นเนยสด (ฟรี)', priceLAK: 0, isFreebie: true, icon: 'gift' }
          ]
        }
      ]
    }
  }
};

// Default store state
const defaultStoreData = {
  settings: {
    storeNameLo: 'ຄຳທອງ ຊິ້ນດາດ & ປິ້ງຍ່າງ',
    storeNameTh: 'คำทอง ชี้นดาด & ปิ้งย่าง',
    taglineLo: 'ຊີ້ນດາດຊັ່ງກິໂລ ນ້ຳແຈ່ວລົດເດັດ ວຽງຈັນ',
    taglineTh: 'หมูกระทะชั่งกิโล น้ำจิ้มรสเด็ด เวียงจันทน์',
    phone: '+856 20 5555 9999',
    addressLo: 'ຖະໜົນ ໄກສອນ ພົມວິຫານ, ນະຄອນຫຼວງວຽງຈັນ',
    addressTh: 'ถนน ไกรสอน พรหมวิหาร, นครหลวงเวียงจันทน์',
    currency: 'LAK',
    exchangeRate: 630, // 1 THB = 630 LAK
    defaultTareWeight: 0.15, // 150 grams bowl
    bankAccountName: 'KHAMTHONG SINDAD SHOP',
    bankAccountNumber: '01012-0000-8888-99',
    bankName: 'BCEL One / LAO QR',
    storeConcept: 'sindad',
    scaleMode: true,
    customQrPayload: '',
    customQrImg: '',
    isVipLicensed: false
  },
  menu: {
    meatGrades: [
      { id: 'mixed', nameLo: 'ຊີ້ນລວມ (ໝູ/ໄກ່/ລູກຊີ້ນ)', nameTh: 'หมูรวม (หมู/ไก่/ลูกชิ้น)', priceLAK: 95000, unit: 'kg', icon: 'drumstick' },
      { id: 'premium', nameLo: 'ຊີ້ນພຣີມ່ຽມ (ຊີ້ນງົວ/ຊີຟູດ)', nameTh: 'พรีเมียม (เนื้อวัว/ซีฟู้ด)', priceLAK: 145000, unit: 'kg', icon: 'gem' },
      { id: 'pork_belly', nameLo: 'ສາມຊັ້ນໝັກງາພິເສດ', nameTh: 'สามชั้นหมักงาพิเศษ', priceLAK: 110000, unit: 'kg', icon: 'layers' }
    ],
    categories: [
      {
        id: 'drinks',
        nameLo: 'ເຄື່ອງດື່ມ',
        nameTh: 'เครื่องดื่ม',
        items: [
          { id: 'b1', nameLo: 'ເບຍລາວ ຂວດໃຫຍ່ (Beerlao)', nameTh: 'เบียร์ลาว ขวดใหญ่', priceLAK: 18000, icon: 'beer' },
          { id: 'b2', nameLo: 'ເບຍລາວ Gold (Beerlao Gold)', nameTh: 'เบียร์ลาว โกลด์', priceLAK: 22000, icon: 'beer-star' },
          { id: 'b3', nameLo: 'ເບຍລາວ Dark (Beerlao Dark)', nameTh: 'เบียร์ลาว ดำ', priceLAK: 22000, icon: 'beer' },
          { id: 'w1', nameLo: 'ນ້ຳດື່ມບໍລິສຸດ (Water)', nameTh: 'น้ำดื่มบริสุทธิ์', priceLAK: 5000, icon: 'droplet' },
          { id: 's1', nameLo: 'ໂຄ້ກ / ແປັບຊີ (Soft Drinks)', nameTh: 'โค้ก / แป๊ปซี่', priceLAK: 10000, icon: 'soda' }
        ]
      },
      {
        id: 'addons',
        nameLo: 'ເຄື່ອງຄຽງ & ບໍລິການ',
        nameTh: 'เครื่องเคียง & บริการ',
        items: [
          { id: 'i1', nameLo: 'ນ້ຳກ້ອນ ຖັງໃຫຍ່ (Ice Bucket)', nameTh: 'น้ำแข็ง ถังใหญ่', priceLAK: 10000, icon: 'cube' },
          { id: 'c1', nameLo: 'ຖ່ານເຕົາ ຄຸນນະພາບສູງ (Charcoal)', nameTh: 'ถ่านเตา ไร้ควัน', priceLAK: 10000, icon: 'flame' },
          { id: 's2', nameLo: 'ນ້ຳແຈ່ວຂວດ ສູດຄຳທອງ (Special Sauce)', nameTh: 'น้ำจิ้มขวด สูตรคำทอง', priceLAK: 15000, icon: 'sauce' },
          { id: 'v1', nameLo: 'ຊຸດຜັກລວມ & ວຸ້ນເສັ້ນ (Veggie Set)', nameTh: 'ชุดผักรวม & วุ้นเส้น', priceLAK: 15000, icon: 'leaf' },
          { id: 'p1', nameLo: 'ຄ່າເປີດເຕົາ/ໝໍ້ເພີ່ມ (Extra Stove)', nameTh: 'ค่าเปิดเตา/กระทะเพิ่ม', priceLAK: 20000, icon: 'pot' }
        ]
      }
    ]
  },
  tables: Array.from({ length: 16 }, (_, i) => ({
    id: i + 1,
    nameLo: `ໂຕະ ${i + 1}`,
    nameTh: `โต๊ะ ${i + 1}`,
    status: 'empty', // 'empty' | 'occupied' | 'paying'
    seatedAt: null,
    items: [],
    subtotalLAK: 0
  })),
  ordersHistory: [],
  dailyStats: {
    date: new Date().toISOString().split('T')[0],
    totalRevenueLAK: 0,
    totalMeatKg: 0,
    ordersCount: 0,
    dineInCount: 0,
    takeawayCount: 0,
    paymentBreakdown: {
      bcelOneLAK: 0,
      cashLAK: 0
    }
  },
  recentActivities: []
};

// Debounced save
let saveTimeout = null;
function saveData() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(storeData, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving data:', e);
    }
  }, 250);
}

// Load or initialize store data
let storeData = defaultStoreData;
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    storeData = JSON.parse(raw);
    console.log('✅ Loaded existing store state from data/store.json');
  } else {
    // Seed sample occupied tables for immediate demonstration
    storeData.tables[1].status = 'occupied';
    storeData.tables[1].seatedAt = Date.now() - 40 * 60 * 1000;
    storeData.tables[1].items = [
      { id: 'm1', name: 'ຊີ້ນລວມ (ໝູ/ໄກ່/ລູກຊີ້ນ)', weight: 1.15, unitPrice: 95000, total: 109250, time: '18:15' },
      { id: 'b1', name: 'ເບຍລາວ ຂວດໃຫຍ່ (Beerlao)', qty: 3, unitPrice: 18000, total: 54000, time: '18:17' },
      { id: 'i1', name: 'ນ້ຳກ້ອນ ຖັງໃຫຍ່', qty: 1, unitPrice: 10000, total: 10000, time: '18:17' }
    ];
    storeData.tables[1].subtotalLAK = 173250;

    storeData.tables[4].status = 'occupied';
    storeData.tables[4].seatedAt = Date.now() - 20 * 60 * 1000;
    storeData.tables[4].items = [
      { id: 'm2', name: 'ຊີ້ນພຣີມ່ຽມ (ຊີ້ນງົວ/ຊີຟູດ)', weight: 1.45, unitPrice: 145000, total: 210250, time: '18:35' },
      { id: 'b2', name: 'ເບຍລາວ Gold', qty: 2, unitPrice: 22000, total: 44000, time: '18:36' }
    ];
    storeData.tables[4].subtotalLAK = 254250;

    storeData.dailyStats.totalRevenueLAK = 1250000;
    storeData.dailyStats.totalMeatKg = 12.80;
    storeData.dailyStats.ordersCount = 8;
    storeData.dailyStats.dineInCount = 5;
    storeData.dailyStats.takeawayCount = 3;
    storeData.dailyStats.paymentBreakdown.bcelOneLAK = 980000;
    storeData.dailyStats.paymentBreakdown.cashLAK = 270000;

    saveData();
  }
} catch (err) {
  console.error('Error loading data/store.json:', err);
  storeData = defaultStoreData;
}

function normalizeTableTimestamps() {
  if (!storeData || !storeData.tables) return;
  const now = Date.now();
  const sampleOffsetsMins = [18, 54, 95, 32, 70];
  let occupiedIdx = 0;
  let changed = false;
  storeData.tables.forEach(tb => {
    if (tb.status === 'occupied') {
      const ageMins = tb.seatedAt ? (now - tb.seatedAt) / 60000 : 999;
      if (ageMins > 140 || ageMins < 0) {
        const offset = sampleOffsetsMins[occupiedIdx % sampleOffsetsMins.length];
        tb.seatedAt = now - offset * 60 * 1000;
        changed = true;
      }
      occupiedIdx++;
    }
  });
  if (changed) saveData();
}

normalizeTableTimestamps();

function broadcast(type, payload) {
  const message = JSON.stringify({ type, payload });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

function addActivity(textLo, textTh) {
  const activity = {
    id: Date.now(),
    time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    textLo,
    textTh
  };
  storeData.recentActivities.unshift(activity);
  if (storeData.recentActivities.length > 25) storeData.recentActivities.pop();
}

// ─── CUSTOMER LEADS & USAGE TELEMETRY DATABASE (data/leads.json) ───
const LEADS_FILE = path.join(__dirname, 'data', 'leads.json');
let leadsData = [];
if (fs.existsSync(LEADS_FILE)) {
  try {
    leadsData = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
  } catch (e) {
    leadsData = [];
  }
} else {
  // Seed realistic sample leads so the Admin CRM dashboard demonstrates how tracked shops appear
  leadsData = [
    {
      deviceId: 'DEV-VTE-8821',
      storeName: 'ຮ້ານຊີ້ນດາດ ອ້າຍຄຳ (เวียงจันทน์)',
      ownerName: 'ອ້າຍຄຳ (อ้ายคำ)',
      phone: '+856 20 5588 1234',
      location: 'นครหลวงเวียงจันทน์',
      storeConcept: 'sindad',
      ordersCount: 42,
      totalRevenueLAK: 14850000,
      vipClicks: 3,
      isVipLicensed: false,
      lastEvent: 'กดดูแพ็กเกจ VIP PRO (สนใจอัปเกรด)',
      firstSeenAt: Date.now() - 86400000 * 3,
      lastActiveAt: Date.now() - 1000 * 60 * 14
    },
    {
      deviceId: 'DEV-PKS-3910',
      storeName: 'Laos Soul Cafe & Roastery',
      ownerName: 'คุณเมย์ (May)',
      phone: '+856 20 9911 4567',
      location: 'ปากเซ (จำปาสัก)',
      storeConcept: 'cafe',
      ordersCount: 28,
      totalRevenueLAK: 3420000,
      vipClicks: 1,
      isVipLicensed: false,
      lastEvent: 'เช็กบิลสำเร็จ (BCEL One)',
      firstSeenAt: Date.now() - 86400000 * 2,
      lastActiveAt: Date.now() - 1000 * 60 * 48
    },
    {
      deviceId: 'DEV-LPB-7742',
      storeName: 'ครัวริมโขง หลวงพระบาง',
      ownerName: 'เฮียตี๋',
      phone: '081-998-7766 / +856 20 2233 8899',
      location: 'หลวงพระบาง',
      storeConcept: 'restaurant',
      ordersCount: 85,
      totalRevenueLAK: 29600000,
      vipClicks: 5,
      isVipLicensed: true,
      lastEvent: 'เปิดใช้งาน VIP PRO License สำเร็จ',
      firstSeenAt: Date.now() - 86400000 * 5,
      lastActiveAt: Date.now() - 1000 * 60 * 5
    }
  ];
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leadsData, null, 2), 'utf8');
}

function saveLeads() {
  try {
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leadsData, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving leads:', e);
  }
}

// REST API
app.get('/api/state', (req, res) => {
  normalizeTableTimestamps();
  res.json(storeData);
});

app.get('/api/presets', (req, res) => {
  res.json(CONCEPT_PRESETS);
});

app.get('/api/leads', (req, res) => {
  const sorted = [...leadsData].sort((a, b) => (b.lastActiveAt || 0) - (a.lastActiveAt || 0));
  res.json({
    totalShops: sorted.length,
    hotLeadsCount: sorted.filter(l => !l.isVipLicensed && ((l.ordersCount || 0) >= 5 || (l.vipClicks || 0) > 0)).length,
    vipShopsCount: sorted.filter(l => l.isVipLicensed).length,
    leads: sorted
  });
});

app.post('/api/telemetry', (req, res) => {
  try {
    const body = req.body || {};
    const deviceId = (body.deviceId || '').trim();
    if (!deviceId) return res.status(400).json({ error: 'Missing deviceId' });

    const now = Date.now();
    let lead = leadsData.find(l => l.deviceId === deviceId);
    if (!lead) {
      lead = {
        deviceId,
        storeName: body.storeName || 'ร้านค้าทดลองใช้ใหม่',
        ownerName: body.ownerName || '-',
        phone: body.phone || '-',
        location: body.location || '-',
        storeConcept: body.storeConcept || 'sindad',
        ordersCount: 0,
        totalRevenueLAK: 0,
        vipClicks: 0,
        isVipLicensed: false,
        lastEvent: body.lastEvent || 'เข้าใช้งานครั้งแรก',
        firstSeenAt: now,
        lastActiveAt: now
      };
      leadsData.unshift(lead);
    }

    if (body.storeName) lead.storeName = body.storeName;
    if (body.ownerName) lead.ownerName = body.ownerName;
    if (body.phone) lead.phone = body.phone;
    if (body.location) lead.location = body.location;
    if (body.storeConcept) lead.storeConcept = body.storeConcept;
    if (typeof body.ordersCount === 'number') lead.ordersCount = Math.max(lead.ordersCount || 0, body.ordersCount);
    if (typeof body.totalRevenueLAK === 'number') lead.totalRevenueLAK = Math.max(lead.totalRevenueLAK || 0, body.totalRevenueLAK);
    if (body.incrementVipClick) lead.vipClicks = (lead.vipClicks || 0) + 1;
    if (typeof body.isVipLicensed === 'boolean') lead.isVipLicensed = body.isVipLicensed;
    if (body.lastEvent) lead.lastEvent = body.lastEvent;
    lead.lastActiveAt = now;

    saveLeads();
    res.json({ ok: true, lead });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/report/daily', (req, res) => {
  res.json({
    date: storeData.dailyStats.date,
    stats: storeData.dailyStats,
    recentOrders: storeData.ordersHistory.slice(0, 50)
  });
});

// WebSocket Handling
wss.on('connection', (ws) => {
  normalizeTableTimestamps();
  // Send state immediately on connect
  ws.send(JSON.stringify({ type: 'INIT_STATE', payload: storeData, presets: CONCEPT_PRESETS }));

  ws.on('message', (messageRaw) => {
    try {
      const data = JSON.parse(messageRaw);
      const { type, payload } = data;

      if (type === 'ADD_ORDER_TO_TABLE') {
        const { tableId, items, createdBy } = payload;
        const table = storeData.tables.find(t => t.id === tableId);
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
              storeData.dailyStats.totalMeatKg = +(storeData.dailyStats.totalMeatKg + item.weight).toFixed(2);
            }
          });

          addActivity(
            `ໂຕະ ${tableId}: ເພີ່ມ ${items.length} ລາຍການ (${items.reduce((s, x) => s + x.total, 0).toLocaleString()} ₭) [ສົ່ງເຂົ້າຄົວ KDS]`,
            `โต๊ะ ${tableId}: เพิ่ม ${items.length} รายการ (${items.reduce((s, x) => s + x.total, 0).toLocaleString()} ₭) [ส่งเข้าครัว KDS]`
          );
          saveData();
          broadcast('STATE_UPDATED', storeData);
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

        storeData.ordersHistory.unshift(order);
        storeData.dailyStats.totalRevenueLAK += totalLAK;
        storeData.dailyStats.ordersCount += 1;
        storeData.dailyStats.takeawayCount += 1;

        if (paymentMethod === 'Cash' || paymentMethod === 'ເງິນສົດ') {
          storeData.dailyStats.paymentBreakdown.cashLAK += totalLAK;
        } else {
          storeData.dailyStats.paymentBreakdown.bcelOneLAK += totalLAK;
        }

        items.forEach(item => {
          if (item.weight) {
            storeData.dailyStats.totalMeatKg = +(storeData.dailyStats.totalMeatKg + item.weight).toFixed(2);
          }
        });

        addActivity(
          `ຊື້ກັບບ້ານ (${orderId}): ${totalLAK.toLocaleString()} ₭ (${paymentMethod})`,
          `ซื้อกลับบ้าน (${orderId}): ${totalLAK.toLocaleString()} ₭ (${paymentMethod})`
        );
        saveData();
        broadcast('STATE_UPDATED', storeData);
      } else if (type === 'CHECKOUT_TABLE') {
        const { tableId, paymentMethod, cashReceivedLAK, changeLAK } = payload;
        const table = storeData.tables.find(t => t.id === tableId);
        if (table && table.status !== 'empty') {
          const totalPaid = table.subtotalLAK;
          const orderId = `TB${tableId}-${Date.now().toString().slice(-4)}`;

          const order = {
            id: orderId,
            type: 'dinein',
            tableId,
            tableName: table.nameLo,
            time: Date.now(),
            seatedDurationMins: Math.round((Date.now() - table.seatedAt) / 60000),
            items: [...table.items],
            totalLAK: totalPaid,
            paymentMethod: paymentMethod || 'BCEL One',
            cashReceivedLAK: cashReceivedLAK || totalPaid,
            changeLAK: changeLAK || 0
          };

          storeData.ordersHistory.unshift(order);
          storeData.dailyStats.totalRevenueLAK += totalPaid;
          storeData.dailyStats.ordersCount += 1;
          storeData.dailyStats.dineInCount += 1;

          if (paymentMethod === 'Cash' || paymentMethod === 'ເງິນສົດ') {
            storeData.dailyStats.paymentBreakdown.cashLAK += totalPaid;
          } else {
            storeData.dailyStats.paymentBreakdown.bcelOneLAK += totalPaid;
          }

          addActivity(
            `ໂຕະ ${tableId}: ເຊັກບິນສຳເລັດ ${totalPaid.toLocaleString()} ₭ (${paymentMethod})`,
            `โต๊ะ ${tableId}: เช็กบิลเรียบร้อย ${totalPaid.toLocaleString()} ₭ (${paymentMethod})`
          );

          // Reset table
          table.status = 'empty';
          table.seatedAt = null;
          table.items = [];
          table.subtotalLAK = 0;

          saveData();
          broadcast('STATE_UPDATED', storeData);
        }
      } else if (type === 'VOID_TABLE_ITEM') {
        const { tableId, itemIndex, managerPin } = payload;
        const isVip = storeData.settings && storeData.settings.isVipLicensed;
        // If VIP is active, check manager PIN (default 8888 or custom)
        if (isVip) {
          const expectedPin = storeData.settings.managerPin || '8888';
          if (managerPin !== expectedPin) {
            addActivity(
              `⚠️ ໂຕະ ${tableId}: ພະຍາຍາມຍົກເລີກລາຍການ ແຕ່ລະຫັດ PIN ບໍ່ຖືກຕ້ອງ`,
              `⚠️ โต๊ะ ${tableId}: พยายามยกเลิกรายการ แต่รหัส PIN ไม่ถูกต้อง`
            );
            broadcast('STATE_UPDATED', storeData);
            return;
          }
        }
        const table = storeData.tables.find(t => t.id === tableId);
        if (table && table.items[itemIndex]) {
          const removed = table.items.splice(itemIndex, 1)[0];
          table.subtotalLAK -= removed.total;
          addActivity(
            `ໂຕະ ${tableId}: ຍົກເລີກ "${removed.name}" (-${removed.total.toLocaleString()} ₭)${isVip ? ' [VIP PIN Verified]' : ''}`,
            `โต๊ะ ${tableId}: ยกเลิก "${removed.name}" (-${removed.total.toLocaleString()} ₭)${isVip ? ' [ยืนยัน PIN ผ่าน]' : ''}`
          );
          saveData();
          broadcast('STATE_UPDATED', storeData);
        }
      } else if (type === 'UPDATE_KITCHEN_ITEM_STATUS') {
        const { tableId, itemIndex, status } = payload;
        const table = storeData.tables.find(t => t.id === tableId);
        if (table && table.items[itemIndex]) {
          table.items[itemIndex].status = status;
          const itemName = table.items[itemIndex].name;
          const statusTextLo = status === 'ready' ? 'ພ້ອມເສີບແລ້ວ' : (status === 'cooking' ? 'ກຳລັງປຸງແຕ່ງ' : 'ລໍຖ້າ');
          const statusTextTh = status === 'ready' ? 'พร้อมเสิร์ฟแล้ว' : (status === 'cooking' ? 'กำลังปรุง' : 'รอทำ');
          addActivity(
            `🔔 ໂຕະ ${tableId}: "${itemName}" ${statusTextLo}`,
            `🔔 โต๊ะ ${tableId}: "${itemName}" ${statusTextTh}`
          );
          saveData();
          broadcast('STATE_UPDATED', storeData);
          if (status === 'ready') {
            broadcast('KITCHEN_ITEM_READY', { tableId, itemName });
          }
        }
      } else if (type === 'MARK_TABLE_KITCHEN_ALL_READY') {
        const { tableId } = payload;
        const table = storeData.tables.find(t => t.id === tableId);
        if (table && table.items) {
          table.items.forEach(it => { it.status = 'ready'; });
          addActivity(
            `🔔 ໂຕະ ${tableId}: ທຸກລາຍການອາຫານພ້ອມເສີບແລ້ວ!`,
            `🔔 โต๊ะ ${tableId}: อาหารทุกรายการพร้อมเสิร์ฟแล้ว!`
          );
          saveData();
          broadcast('STATE_UPDATED', storeData);
          broadcast('KITCHEN_ITEM_READY', { tableId, itemName: 'ທຸກລາຍການ' });
        }
      } else if (type === 'UPDATE_SETTINGS') {
        const { settings, meatPrices } = payload;
        if (settings) {
          storeData.settings = { ...storeData.settings, ...settings };
        }
        if (meatPrices) {
          storeData.menu.meatGrades.forEach(grade => {
            if (meatPrices[grade.id] !== undefined) {
              grade.priceLAK = meatPrices[grade.id];
            }
          });
        }
        addActivity('ອັບເດດການຕັ້ງຄ່າຮ້ານສຳເລັດ', 'อัปเดตการตั้งค่าร้านค้าเรียบร้อย');
        saveData();
        broadcast('STATE_UPDATED', storeData);
      } else if (type === 'APPLY_CONCEPT_PRESET') {
        const conceptKey = payload.conceptId || payload.presetId;
        const preset = CONCEPT_PRESETS[conceptKey];
        if (preset) {
          storeData.settings.storeNameLo = preset.storeNameLo;
          storeData.settings.storeNameTh = preset.storeNameTh;
          storeData.settings.taglineLo = preset.taglineLo;
          storeData.settings.taglineTh = preset.taglineTh;
          storeData.settings.storeConcept = preset.storeConcept;
          storeData.settings.scaleMode = preset.scaleMode;
          storeData.menu = JSON.parse(JSON.stringify(preset.menu));
          addActivity(
            `ປ່ຽນຮູບແບບຮ້ານເປັນ: ${preset.storeNameLo}`,
            `เปลี่ยนรูปแบบร้านเป็น: ${preset.storeNameTh}`
          );
          saveData();
          broadcast('STATE_UPDATED', storeData);
        }
      } else if (type === 'SAVE_MENU_ITEM') {
        const { item, categoryId } = payload;
        if (!storeData.menu) storeData.menu = { meatGrades: [], categories: [] };
        if (!storeData.menu.categories) storeData.menu.categories = [];
        
        let cat = storeData.menu.categories.find(c => c.id === categoryId);
        if (!cat) {
          cat = {
            id: categoryId || 'general',
            nameLo: categoryId === 'drinks' ? 'ເຄື່ອງດື່ມ' : (categoryId === 'freebies' ? 'ຂອງແຖມ' : 'ທົ່ວໄປ'),
            nameTh: categoryId === 'drinks' ? 'เครื่องดื่ม' : (categoryId === 'freebies' ? 'ของแถม' : 'ทั่วไป'),
            items: []
          };
          storeData.menu.categories.push(cat);
        }
        
        const existingIdx = cat.items.findIndex(i => i.id === item.id);
        if (existingIdx >= 0) {
          cat.items[existingIdx] = { ...cat.items[existingIdx], ...item };
        } else {
          item.id = item.id || `item_${Date.now()}`;
          cat.items.push(item);
        }
        addActivity(
          `ບັນທຶກເມນູ "${item.nameLo}" (${(item.priceLAK || 0).toLocaleString()} ₭)`,
          `บันทึกเมนู "${item.nameTh || item.nameLo}" (${(item.priceLAK || 0).toLocaleString()} ₭)`
        );
        saveData();
        broadcast('STATE_UPDATED', storeData);
      } else if (type === 'DELETE_MENU_ITEM') {
        const { itemId, categoryId } = payload;
        let removedName = '';
        if (storeData.menu && storeData.menu.categories) {
          storeData.menu.categories.forEach(cat => {
            if (!categoryId || cat.id === categoryId) {
              const idx = cat.items.findIndex(i => i.id === itemId);
              if (idx >= 0) {
                removedName = cat.items[idx].nameLo;
                cat.items.splice(idx, 1);
              }
            }
          });
        }
        addActivity(
          `ລຶບເມນູ "${removedName || itemId}" ອອກຈາກລະບົບ`,
          `ลบเมนู "${removedName || itemId}" ออกจากระบบ`
        );
        saveData();
        broadcast('STATE_UPDATED', storeData);
      } else if (type === 'CLOSE_DAILY_REGISTER') {
        // Daily register closing
        const summary = {
          date: storeData.dailyStats.date,
          totalRev: storeData.dailyStats.totalRevenueLAK,
          totalMeat: storeData.dailyStats.totalMeatKg,
          orders: storeData.dailyStats.ordersCount
        };
        addActivity(
          `ປິດຍອດປະຈຳວັນ: ${summary.totalRev.toLocaleString()} ₭ (${summary.orders} ບິນ)`,
          `ปิดยอดประจำวัน: ${summary.totalRev.toLocaleString()} ₭ (${summary.orders} บิล)`
        );
        // Reset daily counters
        storeData.dailyStats = {
          date: new Date().toISOString().split('T')[0],
          totalRevenueLAK: 0,
          totalMeatKg: 0,
          ordersCount: 0,
          dineInCount: 0,
          takeawayCount: 0,
          paymentBreakdown: { bcelOneLAK: 0, cashLAK: 0 }
        };
        saveData();
        broadcast('STATE_UPDATED', storeData);
      }
    } catch (err) {
      console.error('Error handling WebSocket message:', err);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✨ KhamThong SinDad POS (Luxury Gold) running on http://localhost:${PORT}`);
});
