require("dotenv").config({ path: "../.env" });
const { pool } = require("../config/db");

const firstNames = ["James","John","Robert","Michael","William","David","Richard","Joseph","Thomas","Charles","Mary","Patricia","Jennifer","Linda","Barbara","Elizabeth","Susan","Jessica","Sarah","Karen","Ahmed","Mohammed","Ali","Omar","Hassan","Fatima","Aisha","Layla","Nour","Rania","Raj","Priya","Amit","Neha","Vikram","Anita","Sanjay","Pooja","Arjun","Deepa"];
const lastNames = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Wilson","Taylor","Anderson","Thomas","Jackson","White","Harris","Martin","Thompson","Moore","Allen","Clark","Khan","Ahmed","Hassan","Ali","Sheikh","Patel","Shah","Kumar","Singh","Sharma"];
const companies = ["Novasoft LLC","TechCorp","Global Traders","Alpha Industries","Beta Solutions","Gamma Foods","Delta Supplies","Omega Group","Prime Ventures","Star Enterprises"];
const partnerNos = ["VEN000001","VEN000002","VEN000003","VNR000001","VRG-000001","VRG-000002"];
const partnerTypes = ["Vendor","Customer"];
const cities = ["Dubai","Abu Dhabi","Sharjah","Ajman","Riyadh","Doha","Kuwait City","Muscat","Manama","Cairo"];
const countries = ["AE","SA","QA","KW","OM","BH","EG","JO","LB","IN"];
const jobTitles = ["Manager","Director","Supervisor","Coordinator","Executive","Officer","Analyst","Consultant","Specialist","Administrator"];
const languages = ["ENG","ARA","HIN","URD","FRA"];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (let i = 1; i <= 100; i++) {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[i % lastNames.length];
      const contactName = `${firstName} ${lastName}`;
      const contactNo = `CONT${String(i).padStart(6, "0")}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
      const phoneNo = `+971${String(500000000 + i)}`;
      const mobilePhoneNo = `+971${String(550000000 + i)}`;
      const company = companies[i % companies.length];
      const partnerNo = partnerNos[i % partnerNos.length];
      const partnerType = partnerTypes[i % partnerTypes.length];
      const city = cities[i % cities.length];
      const country = countries[i % countries.length];
      const jobTitle = jobTitles[i % jobTitles.length];
      const language = languages[i % languages.length];
      const postCode = String(10000 + i);
      const address = `${i} Main Street`;

      await client.query(
        `INSERT INTO contacts (
          contact_no, contact_name, email, phone_no, mobile_phone_no,
          company_no, company_name, portal_user, portal_admin,
          partner_type, partner_no, address, city, post_code,
          country_region_code, job_title, language_code,
          sync_status, last_synced_date_time
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,NOW())`,
        [
          contactNo, contactName, email, phoneNo, mobilePhoneNo,
          `COMP${String(i).padStart(4,"0")}`, company,
          i % 3 === 0, i % 10 === 0,
          partnerType, partnerNo, address, city, postCode,
          country, jobTitle, language, "Synced",
        ]
      );
      console.log(`✅ ${contactNo} - ${contactName}`);
    }

    await client.query("COMMIT");
    console.log("\n🎉 100 contacts seeded successfully");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seed failed:", err.message);
  } finally {
    client.release();
    process.exit(0);
  }
}

seed();
