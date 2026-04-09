const { pool } = require("../config/db");

async function seedBCUserRegistrations() {
  const client = await pool.connect();
  try {
    console.log("🔄 Seeding BC User Registrations...");

    // Sample registration data
    const registrations = [
      {
        partnerType: "Customer",
        regType: "Create",
        scope: "Current_x0020_Company",
        status: "Draft",
        partnerNo: "",
        centralPartnerNo: "",
        resultPartnerNo: "",
        requesterUserId: 1,
        businessJustification: "New customer registration for retail business",
        name: "ABC Trading LLC",
        name2: "ABC Trading",
        address: "123 Business Street",
        address2: "Building A, Floor 3",
        city: "Dubai",
        postCode: "12345",
        countryRegionCode: "AE",
        phoneNo: "+971-4-1234567",
        email: "info@abctrading.ae",
        vatRegistrationNo: "100123456700003",
        currencyCode: "AED",
        paymentTermsCode: "NET30",
        paymentMethodCode: "BANK",
        partnerPostingGroup: "DOMESTIC",
        genBusPostingGroup: "DOMESTIC",
        vatBusPostingGroup: "DOMESTIC",
        partnerEmail: "accounts@abctrading.ae",
        tradeName: "ABC Trading",
        tradeLicenseNumber: "TL-123456",
        tradeLicenseExpiryDate: "2027-12-31",
        companyRegNumber: "CR-789012",
        entityType: "LLC",
        countryOfIncorporation: "UAE",
        placeOfRegistration: "Dubai",
        website: "www.abctrading.ae",
        partnerCategory: "RETAIL",
        contacts: [
          {
            lineNo: 10000,
            fullName: "Ahmed Al Mansoori",
            designation: "General Manager",
            mobileNumber: "+971-50-1234567",
            emailAddress: "ahmed@abctrading.ae",
          },
          {
            lineNo: 20000,
            fullName: "Sara Mohammed",
            designation: "Finance Manager",
            mobileNumber: "+971-50-7654321",
            emailAddress: "sara@abctrading.ae",
          },
        ],
        banks: [
          {
            lineNo: 10000,
            bankCode: "ENBD",
            name: "Emirates NBD",
            bankBranchNo: "001",
            bankAccountNo: "1234567890",
            iban: "AE070331234567890123456",
            swiftCode: "EBILAEAD",
            currencyCode: "AED",
            isPrimary: true,
          },
        ],
      },
      {
        partnerType: "Vendor",
        regType: "Create",
        scope: "Current_x0020_Company",
        status: "Submitted",
        partnerNo: "",
        centralPartnerNo: "",
        resultPartnerNo: "",
        requesterUserId: 1,
        businessJustification: "New vendor registration for office supplies",
        name: "Office Supplies Co.",
        name2: "OSC",
        address: "456 Industrial Area",
        address2: "Warehouse 12",
        city: "Sharjah",
        postCode: "54321",
        countryRegionCode: "AE",
        phoneNo: "+971-6-9876543",
        email: "contact@officesupplies.ae",
        vatRegistrationNo: "100987654300003",
        currencyCode: "AED",
        paymentTermsCode: "NET45",
        paymentMethodCode: "BANK",
        partnerPostingGroup: "VENDOR",
        genBusPostingGroup: "DOMESTIC",
        vatBusPostingGroup: "DOMESTIC",
        partnerEmail: "billing@officesupplies.ae",
        tradeName: "Office Supplies Co.",
        tradeLicenseNumber: "TL-654321",
        tradeLicenseExpiryDate: "2028-06-30",
        companyRegNumber: "CR-456789",
        entityType: "LLC",
        countryOfIncorporation: "UAE",
        placeOfRegistration: "Sharjah",
        website: "www.officesupplies.ae",
        partnerCategory: "SUPPLIER",
        contacts: [
          {
            lineNo: 10000,
            fullName: "Mohammed Hassan",
            designation: "Sales Director",
            mobileNumber: "+971-55-1112233",
            emailAddress: "mohammed@officesupplies.ae",
          },
        ],
        banks: [
          {
            lineNo: 10000,
            bankCode: "ADCB",
            name: "Abu Dhabi Commercial Bank",
            bankBranchNo: "002",
            bankAccountNo: "9876543210",
            iban: "AE070021234567890987654",
            swiftCode: "ADCBAEAA",
            currencyCode: "AED",
            isPrimary: true,
          },
        ],
      },
      {
        partnerType: "Customer",
        regType: "Create",
        scope: "Current_x0020_Company",
        status: "Approved",
        partnerNo: "",
        centralPartnerNo: "",
        resultPartnerNo: "CUS001234",
        requesterUserId: 1,
        businessJustification: "Approved customer for wholesale distribution",
        name: "Global Distribution FZE",
        name2: "GD FZE",
        address: "789 Free Zone",
        address2: "Office 501",
        city: "Dubai",
        postCode: "99999",
        countryRegionCode: "AE",
        phoneNo: "+971-4-5556677",
        email: "info@globaldist.ae",
        vatRegistrationNo: "100555666700003",
        currencyCode: "AED",
        paymentTermsCode: "NET60",
        paymentMethodCode: "BANK",
        partnerPostingGroup: "EXPORT",
        genBusPostingGroup: "EXPORT",
        vatBusPostingGroup: "EXPORT",
        partnerEmail: "finance@globaldist.ae",
        tradeName: "Global Distribution",
        tradeLicenseNumber: "TL-999888",
        tradeLicenseExpiryDate: "2029-03-15",
        companyRegNumber: "CR-111222",
        entityType: "FZE",
        countryOfIncorporation: "UAE",
        placeOfRegistration: "Dubai",
        website: "www.globaldist.ae",
        partnerCategory: "WHOLESALE",
        contacts: [
          {
            lineNo: 10000,
            fullName: "John Smith",
            designation: "CEO",
            mobileNumber: "+971-50-9998877",
            emailAddress: "john@globaldist.ae",
          },
          {
            lineNo: 20000,
            fullName: "Lisa Chen",
            designation: "CFO",
            mobileNumber: "+971-50-7778899",
            emailAddress: "lisa@globaldist.ae",
          },
        ],
        banks: [
          {
            lineNo: 10000,
            bankCode: "HSBC",
            name: "HSBC Bank Middle East",
            bankBranchNo: "003",
            bankAccountNo: "5555666677",
            iban: "AE070041234567890555666",
            swiftCode: "BBMEAEAD",
            currencyCode: "AED",
            isPrimary: true,
          },
          {
            lineNo: 20000,
            bankCode: "SCB",
            name: "Standard Chartered Bank",
            bankBranchNo: "004",
            bankAccountNo: "7777888899",
            iban: "AE070051234567890777888",
            swiftCode: "SCBLAEAD",
            currencyCode: "USD",
            isPrimary: false,
          },
        ],
      },
      {
        partnerType: "Vendor",
        regType: "Create",
        scope: "Current_x0020_Company",
        status: "Rejected",
        partnerNo: "",
        centralPartnerNo: "",
        resultPartnerNo: "",
        requesterUserId: 1,
        businessJustification: "Vendor registration - incomplete documentation",
        name: "Tech Solutions Ltd",
        name2: "Tech Solutions",
        address: "321 Tech Park",
        address2: "",
        city: "Abu Dhabi",
        postCode: "11111",
        countryRegionCode: "AE",
        phoneNo: "+971-2-3334455",
        email: "info@techsolutions.ae",
        vatRegistrationNo: "",
        currencyCode: "AED",
        paymentTermsCode: "NET30",
        paymentMethodCode: "BANK",
        partnerPostingGroup: "",
        genBusPostingGroup: "",
        vatBusPostingGroup: "",
        partnerEmail: "contact@techsolutions.ae",
        tradeName: "Tech Solutions",
        tradeLicenseNumber: "",
        tradeLicenseExpiryDate: null,
        companyRegNumber: "",
        entityType: "LLC",
        countryOfIncorporation: "UAE",
        placeOfRegistration: "Abu Dhabi",
        website: "",
        partnerCategory: "IT",
        contacts: [
          {
            lineNo: 10000,
            fullName: "Ali Rashid",
            designation: "Manager",
            mobileNumber: "+971-55-4445566",
            emailAddress: "ali@techsolutions.ae",
          },
        ],
        banks: [],
      },
      {
        partnerType: "Customer",
        regType: "Create",
        scope: "Current_x0020_Company",
        status: "In Review",
        partnerNo: "",
        centralPartnerNo: "",
        resultPartnerNo: "",
        requesterUserId: 1,
        businessJustification: "New customer for food & beverage sector",
        name: "Fresh Foods Trading",
        name2: "FFT",
        address: "555 Market Street",
        address2: "Shop 10",
        city: "Ajman",
        postCode: "22222",
        countryRegionCode: "AE",
        phoneNo: "+971-6-7778899",
        email: "info@freshfoods.ae",
        vatRegistrationNo: "100222333400003",
        currencyCode: "AED",
        paymentTermsCode: "NET15",
        paymentMethodCode: "CASH",
        partnerPostingGroup: "DOMESTIC",
        genBusPostingGroup: "DOMESTIC",
        vatBusPostingGroup: "DOMESTIC",
        partnerEmail: "orders@freshfoods.ae",
        tradeName: "Fresh Foods",
        tradeLicenseNumber: "TL-222333",
        tradeLicenseExpiryDate: "2027-09-30",
        companyRegNumber: "CR-333444",
        entityType: "LLC",
        countryOfIncorporation: "UAE",
        placeOfRegistration: "Ajman",
        website: "www.freshfoods.ae",
        partnerCategory: "F&B",
        contacts: [
          {
            lineNo: 10000,
            fullName: "Fatima Ali",
            designation: "Owner",
            mobileNumber: "+971-50-2223344",
            emailAddress: "fatima@freshfoods.ae",
          },
        ],
        banks: [
          {
            lineNo: 10000,
            bankCode: "RAK",
            name: "RAK Bank",
            bankBranchNo: "005",
            bankAccountNo: "3334445555",
            iban: "AE070061234567890333444",
            swiftCode: "NRAKAEAK",
            currencyCode: "AED",
            isPrimary: true,
          },
        ],
      },
    ];

    let insertedCount = 0;

    for (const reg of registrations) {
      // Insert registration header
      const headerResult = await client.query(
        `INSERT INTO bc_user_registrations (
          partner_type, reg_type, scope, status, partner_no,
          central_partner_no, result_partner_no, requester_user_id,
          business_justification, name, name2, address, address2,
          city, post_code, country_region_code, phone_no, email,
          vat_registration_no, currency_code, payment_terms_code,
          payment_method_code, partner_posting_group, gen_bus_posting_group,
          vat_bus_posting_group, partner_email, trade_name,
          trade_license_number, trade_license_expiry_date, company_reg_number,
          entity_type, country_of_incorporation, place_of_registration,
          website, partner_category
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
          $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
          $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,
          $31,$32,$33,$34,$35
        ) RETURNING id`,
        [
          reg.partnerType,
          reg.regType,
          reg.scope,
          reg.status,
          reg.partnerNo,
          reg.centralPartnerNo,
          reg.resultPartnerNo,
          reg.requesterUserId,
          reg.businessJustification,
          reg.name,
          reg.name2,
          reg.address,
          reg.address2,
          reg.city,
          reg.postCode,
          reg.countryRegionCode,
          reg.phoneNo,
          reg.email,
          reg.vatRegistrationNo,
          reg.currencyCode,
          reg.paymentTermsCode,
          reg.paymentMethodCode,
          reg.partnerPostingGroup,
          reg.genBusPostingGroup,
          reg.vatBusPostingGroup,
          reg.partnerEmail,
          reg.tradeName,
          reg.tradeLicenseNumber,
          reg.tradeLicenseExpiryDate,
          reg.companyRegNumber,
          reg.entityType,
          reg.countryOfIncorporation,
          reg.placeOfRegistration,
          reg.website,
          reg.partnerCategory,
        ]
      );

      const registrationId = headerResult.rows[0].id;

      // Insert contacts
      for (const contact of reg.contacts) {
        await client.query(
          `INSERT INTO bc_user_registration_contacts (
            registration_id, line_no, full_name, designation,
            mobile_number, email_address
          ) VALUES ($1,$2,$3,$4,$5,$6)`,
          [
            registrationId,
            contact.lineNo,
            contact.fullName,
            contact.designation,
            contact.mobileNumber,
            contact.emailAddress,
          ]
        );
      }

      // Insert banks
      for (const bank of reg.banks) {
        await client.query(
          `INSERT INTO bc_user_registration_banks (
            registration_id, line_no, bank_code, name,
            bank_branch_no, bank_account_no, iban, swift_code,
            currency_code, is_primary
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [
            registrationId,
            bank.lineNo,
            bank.bankCode,
            bank.name,
            bank.bankBranchNo,
            bank.bankAccountNo,
            bank.iban,
            bank.swiftCode,
            bank.currencyCode,
            bank.isPrimary,
          ]
        );
      }

      insertedCount++;
      console.log(`✅ Inserted registration: ${reg.name} (${reg.status})`);
    }

    console.log(`\n📈 Summary:`);
    console.log(`   ✅ Inserted: ${insertedCount} registrations`);
    console.log(`   👥 Total contacts: ${registrations.reduce((sum, r) => sum + r.contacts.length, 0)}`);
    console.log(`   🏦 Total banks: ${registrations.reduce((sum, r) => sum + r.banks.length, 0)}`);
    console.log("\n🎉 BC User Registrations seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding registrations:", error.message);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  seedBCUserRegistrations()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = seedBCUserRegistrations;
