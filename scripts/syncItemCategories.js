const axios = require("axios");
const { pool } = require("../config/db");
require("dotenv").config();

const BC_CONFIG = {
  baseUrl: process.env.BC_BASE_URL,
  tenantId: process.env.BC_TENANT_ID,
  environment: process.env.BC_ENVIRONMENT,
  companyId: process.env.BC_COMPANY_ID,
  clientId: process.env.BC_CLIENT_ID,
  clientSecret: process.env.BC_CLIENT_SECRET,
  tokenUrl: process.env.BC_TOKEN_URL,
  scope: process.env.BC_SCOPE,
};

class BCService {
  constructor() {
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  async getAccessToken() {
    try {
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        console.log("✅ Using cached token");
        return this.accessToken;
      }

      console.log("🔄 Fetching new BC access token...");
      const params = new URLSearchParams();
      params.append("client_id", BC_CONFIG.clientId);
      params.append("client_secret", BC_CONFIG.clientSecret);
      params.append("scope", BC_CONFIG.scope);
      params.append("grant_type", "client_credentials");

      const response = await axios.post(BC_CONFIG.tokenUrl, params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;
      console.log("✅ Access token obtained successfully");
      return this.accessToken;
    } catch (error) {
      console.error("❌ Error getting BC access token:", error.response?.data || error.message);
      throw new Error("Failed to authenticate with Business Central");
    }
  }

  async getItemCategories() {
    try {
      const token = await this.getAccessToken();
      const url = `${BC_CONFIG.baseUrl}/${BC_CONFIG.tenantId}/${BC_CONFIG.environment}/api/partnerPortal/registration/v2.0/companies(${BC_CONFIG.companyId})/ItemCategoryAPI`;
      
      console.log(`📡 Fetching item categories from BC API...`);
      console.log(`   URL: ${url}`);
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const categories = response.data.value || [];
      console.log(`✅ Fetched ${categories.length} item categories from Business Central`);
      return categories;
    } catch (error) {
      console.error("❌ Error fetching item categories from BC:", error.response?.data || error.message);
      throw error;
    }
  }
}

async function syncItemCategories() {
  const client = await pool.connect();
  try {
    const bcService = new BCService();
    
    console.log("\n=== SYNCING ITEM CATEGORIES FROM BUSINESS CENTRAL ===\n");
    
    // Fetch from BC
    const categories = await bcService.getItemCategories();
    
    if (categories.length === 0) {
      console.log("⚠️  No item categories found in Business Central");
      return;
    }

    // Insert or update in local DB
    console.log("\n📝 Inserting/Updating categories in database...");
    let inserted = 0;
    let updated = 0;

    for (const cat of categories) {
      if (!cat.code) {
        console.log(`⏭️  Skipping category - no code provided`);
        continue;
      }

      const result = await client.query(
        `INSERT INTO item_categories (code, description, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (code) DO UPDATE SET description = $2, updated_at = NOW()
         RETURNING id, code, xmax`,
        [cat.code, cat.description || null]
      );

      // xmax is 0 on INSERT, non-zero on UPDATE
      if (result.rows[0].xmax === 0) {
        inserted++;
        console.log(`   ✅ INSERT: ${cat.code} - ${cat.description}`);
      } else {
        updated++;
        console.log(`   🔄 UPDATE: ${cat.code} - ${cat.description}`);
      }
    }

    console.log(`\n✅ SYNC COMPLETED`);
    console.log(`   Inserted: ${inserted}`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Total: ${inserted + updated}\n`);

  } catch (error) {
    console.error("\n❌ SYNC FAILED:", error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

syncItemCategories()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
