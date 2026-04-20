const axios = require("axios");

const BASE_URL = "http://localhost:3000/api/users/register";
const PARTNER_NO = "VENDOR-001"; // same vendor for all 10

const users = [
  { name: "James Carter",   email: "james.carter@vendormail.com"   },
  { name: "Sophia Patel",   email: "sophia.patel@vendormail.com"   },
  { name: "Liam Hassan",    email: "liam.hassan@vendormail.com"    },
  { name: "Amira Nour",     email: "amira.nour@vendormail.com"     },
  { name: "Carlos Mendes",  email: "carlos.mendes@vendormail.com"  },
  { name: "Yuki Tanaka",    email: "yuki.tanaka@vendormail.com"    },
  { name: "Fatima Al-Ali",  email: "fatima.alali@vendormail.com"   },
  { name: "Noah Williams",  email: "noah.williams@vendormail.com"  },
  { name: "Elena Russo",    email: "elena.russo@vendormail.com"    },
  { name: "Omar Khalid",    email: "omar.khalid@vendormail.com"    },
].map((u, i) => ({
  role: "vendor",
  name: u.name,
  email: u.email,
  password: "Test@1234",
  partnerno: PARTNER_NO,
  phoneNo: `+9715000000${String(i + 1).padStart(2, "0")}`,
  address: `Address ${i + 1}, Dubai`,
  city: "Dubai",
  countryRegionCode: "AE",
}));

async function seed() {
  console.log(`\n🚀 Registering 10 vendor users for partner: ${PARTNER_NO}\n`);
  let passed = 0;
  let failed = 0;

  for (const user of users) {
    try {
      const res = await axios.post(BASE_URL, user);
      console.log(`✅ [${user.email}] registered — id: ${res.data.data.id}`);
      passed++;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.log(`❌ [${user.email}] failed — ${msg}`);
      failed++;
    }
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`✅ Passed: ${passed}  ❌ Failed: ${failed}`);
  console.log(`${"=".repeat(50)}\n`);
}

seed();
