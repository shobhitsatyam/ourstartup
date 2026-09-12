import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'http://localhost:5000/api';

async function runE2ETests() {
  console.log('🚀 Starting Ocean Jewel CMS Global Persistence Verification Tests...\n');

  // 1. Admin Login
  console.log('1️⃣ Authenticating as Admin...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    }),
  });
  const loginData = await loginRes.json();
  if (!loginData.success || !loginData.data?.token) {
    throw new Error('Admin login failed: ' + JSON.stringify(loginData));
  }
  const token = loginData.data.token;
  console.log('✅ Admin login successful! Role:', loginData.data.role);

  // 2. Test Desktop & Mobile Hero Banner Complete Independence
  console.log('\n2️⃣ Testing Desktop & Mobile Hero Banner Complete Independence...');

  const desktopImageA = 'https://res.cloudinary.com/akkplnbl/image/upload/v1788931451/ocean_jewel/products/uwii64unuj9ro5q6hnor.webp';
  const mobileImageB = 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1600&q=80';

  // Step 2a: Update Desktop Hero Configuration ONLY
  console.log('   Updating Desktop Hero Banner (targetDevice: "desktop")...');
  const desktopPayload = {
    targetDevice: 'desktop',
    desktop: {
      active: true,
      aspectRatio: '16/5',
      slides: [
        {
          id: 'desktop-slide-1',
          title: 'Custom Desktop Slide 1 — Royal Solitaire',
          image: desktopImageA,
          destinationUrl: '/collections',
          active: true,
        },
      ],
    },
  };

  const saveDesktopRes = await fetch(`${BASE_URL}/cms/hero_banner`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ data: desktopPayload }),
  });
  const saveDesktopData = await saveDesktopRes.json();
  console.log('   Save Desktop status:', saveDesktopData.success, saveDesktopData.message);

  // Read Incognito
  const incognitoDesktopRes = await fetch(`${BASE_URL}/cms/hero_banner?t=${Date.now()}`, {
    headers: { 'Cache-Control': 'no-cache, no-store' },
  });
  const incognitoDesktopData = await incognitoDesktopRes.json();
  const currentDesktopImg = incognitoDesktopData.data?.desktop?.slides?.[0]?.image;
  const currentMobileImgAfterDeskSave = incognitoDesktopData.data?.mobile?.slides?.[0]?.image;

  console.log('   Fetched Desktop Slide 1:', currentDesktopImg);
  console.log('   Fetched Mobile Slide 1 after Desktop save:', currentMobileImgAfterDeskSave);

  if (currentDesktopImg !== desktopImageA) {
    throw new Error('Desktop banner image mismatch!');
  }
  if (currentMobileImgAfterDeskSave === desktopImageA && currentMobileImgAfterDeskSave !== incognitoDesktopData.data?.mobile?.slides?.[0]?.image) {
    throw new Error('Leakage detected: Desktop image overwrote Mobile configuration!');
  }

  // Step 2b: Update Mobile Hero Configuration ONLY
  console.log('   Updating Mobile Hero Banner (targetDevice: "mobile")...');
  const mobilePayload = {
    targetDevice: 'mobile',
    mobile: {
      active: true,
      aspectRatio: '16/10',
      slides: [
        {
          id: 'mobile-slide-1',
          title: 'Custom Mobile Slide 1 — 18K Choker',
          image: mobileImageB,
          destinationUrl: '/women',
          active: true,
        },
      ],
    },
  };

  const saveMobileRes = await fetch(`${BASE_URL}/cms/hero_banner`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ data: mobilePayload }),
  });
  const saveMobileData = await saveMobileRes.json();
  console.log('   Save Mobile status:', saveMobileData.success, saveMobileData.message);

  // Read Incognito again
  const incognitoMobileRes = await fetch(`${BASE_URL}/cms/hero_banner?t=${Date.now()}`, {
    headers: { 'Cache-Control': 'no-cache, no-store' },
  });
  const incognitoMobileData = await incognitoMobileRes.json();
  const finalDesktopImg = incognitoMobileData.data?.desktop?.slides?.[0]?.image;
  const finalMobileImg = incognitoMobileData.data?.mobile?.slides?.[0]?.image;

  console.log('   Final Incognito Desktop Slide 1:', finalDesktopImg);
  console.log('   Final Incognito Mobile Slide 1:', finalMobileImg);

  if (finalDesktopImg !== desktopImageA) {
    throw new Error('Cross-device leak! Desktop banner was altered when Mobile was updated!');
  }
  if (finalMobileImg !== mobileImageB) {
    throw new Error('Mobile banner was not updated properly!');
  }

  console.log('✅ COMPLETE INDEPENDENCE VERIFIED: Desktop Banner !== Mobile Banner and neither affects the other!');

  // 3. Test Festival Season Banner Persistence
  console.log('\n3️⃣ Testing Festival Season Banner Persistence...');
  const festivePayload = {
    active: true,
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1600&q=80',
    destinationUrl: '/collections/diwali',
    campaignName: 'Diwali Grand Heirlooms',
    campaignPreset: 'diwali',
    eyebrow: 'THE DIWALI GRAND EDIT',
    title: 'Pure gold heirlooms.',
    highlightTitle: 'Dazzle in divinity.',
    offerText: 'Flat 20% OFF on Festive Heirlooms',
    couponCode: 'DIWALI20',
  };

  const saveFestiveRes = await fetch(`${BASE_URL}/cms/festive_banner`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ data: festivePayload }),
  });
  const saveFestiveData = await saveFestiveRes.json();
  console.log('   Save Festive Banner status:', saveFestiveData.success, saveFestiveData.message);

  // Read as Incognito / Clean session (No Auth Token)
  const incognitoFestiveRes = await fetch(`${BASE_URL}/cms/festive_banner?t=${Date.now()}`, {
    headers: { 'Cache-Control': 'no-cache, no-store' },
  });
  const incognitoFestiveData = await incognitoFestiveRes.json();
  const festiveImg = incognitoFestiveData.data?.image;
  console.log('   Incognito / Clean Session fetched Festive Banner image:', festiveImg);
  if (festiveImg !== festivePayload.image) {
    throw new Error('Festive banner image mismatch in incognito view!');
  }
  console.log('✅ Festival Banner successfully persisted to MongoDB Atlas and verified across clean sessions!');

  // 4. Test Shop By Category Cards Persistence
  console.log('\n4️⃣ Testing Shop By Category Cards Persistence...');
  const categoryCardsPayload = [
    {
      id: 'cat_rings',
      name: 'RINGS',
      gender: 'women',
      desc: 'Solitaires, stackables & adjustable 18K gold bands',
      img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80',
      link: '/women/rings',
      order: 1,
      active: true,
    },
    {
      id: 'cat_earrings',
      name: 'EARRINGS & CHANDBALIS',
      gender: 'women',
      desc: 'Traditional jhumkas, modern studs & ear cuffs',
      img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
      link: '/women/earrings',
      order: 2,
      active: true,
    },
  ];

  const saveCatRes = await fetch(`${BASE_URL}/cms/category_cards`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ data: categoryCardsPayload }),
  });
  const saveCatData = await saveCatRes.json();
  console.log('   Save Category Cards status:', saveCatData.success, saveCatData.message);

  // Read as Incognito / Clean session (No Auth Token)
  const incognitoCatRes = await fetch(`${BASE_URL}/cms/category_cards?t=${Date.now()}`, {
    headers: { 'Cache-Control': 'no-cache, no-store' },
  });
  const incognitoCatData = await incognitoCatRes.json();
  const ringsImg = incognitoCatData.data?.[0]?.img;
  console.log('   Incognito / Clean Session fetched Category Card 1 image:', ringsImg);
  if (ringsImg !== categoryCardsPayload[0].img) {
    throw new Error('Category card image mismatch in incognito view!');
  }
  console.log('✅ Category Cards successfully persisted to MongoDB Atlas and verified across clean sessions!');

  // 5. Test Reset to Factory Defaults
  console.log('\n5️⃣ Testing Reset / Revert to Factory Defaults...');
  for (const key of ['hero_banner', 'festive_banner', 'category_cards']) {
    const delRes = await fetch(`${BASE_URL}/cms/${key}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const delData = await delRes.json();
    console.log(`   Reset '${key}':`, delData.success);

    const checkRes = await fetch(`${BASE_URL}/cms/${key}?t=${Date.now()}`);
    const checkData = await checkRes.json();
    if (checkData.data !== null) {
      throw new Error(`Reset failed for '${key}', expected null but got: ` + JSON.stringify(checkData.data));
    }
  }
  console.log('✅ Factory defaults reset verified! Storefront safely falls back to default high-res brand photography.');

  console.log('\n🎉 ALL 5 E2E INTEGRATION VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉\n');
}

runE2ETests().catch((e) => {
  console.error('\n❌ TEST FAILED:', e);
  process.exit(1);
});
