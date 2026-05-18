const axios = require("axios");

// Valid BC enum values for entityType
const VALID_ENTITY_TYPES = [
  "", "LLC", "FZE", "FZCO", "Sole Establishment", "Partnership",
  "Public Joint Stock", "Private Joint Stock", "Branch Office", "Other",
];

const sanitizeEntityType = (value) => {
  if (!value) return "";
  const match = VALID_ENTITY_TYPES.find(
    (v) => v.toLowerCase() === value.trim().toLowerCase()
  );
  return match !== undefined ? match : "Other";
};

// Business Central API Configuration
const BC_CONFIG = {
  baseUrl: process.env.BC_BASE_URL ,
  tenantId: process.env.BC_TENANT_ID ,
  environment: process.env.BC_ENVIRONMENT ,
  companyId: process.env.BC_COMPANY_ID ,
  clientId: process.env.BC_CLIENT_ID,
  clientSecret: process.env.BC_CLIENT_SECRET,
  tokenUrl: process.env.BC_TOKEN_URL,
  scope: process.env.BC_SCOPE ,
};

class BusinessCentralService {
  constructor() {
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  // Get OAuth2 Access Token
  async getAccessToken() {
    try {
      // Return cached token if still valid
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

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
      // Set expiry to 5 minutes before actual expiry
      this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

      return this.accessToken;
    } catch (error) {
      console.error("Error getting BC access token:", error.response?.data || error.message);
      throw new Error("Failed to authenticate with Business Central");
    }
  }

  // Generic API Call Method
  async callAPI(endpoint, method = "GET", data = null, expand = null, etag = null) {
    try {
      const token = await this.getAccessToken();
      
      let url = `${BC_CONFIG.baseUrl}/${BC_CONFIG.tenantId}/${BC_CONFIG.environment}/api/partnerPortal/partnerPortal/v2.0/companies(${BC_CONFIG.companyId})/${endpoint}`;
      
      if (expand) {
        url += `?$expand=${expand}`;
      }

      const config = {
        method,
        url,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...(etag && { "If-Match": etag }),
        },
      };

      if (data && (method === "POST" || method === "PATCH" || method === "PUT")) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error(`BC API Error [${method} ${endpoint}]:`, error.response?.data || error.message);
      throw error;
    }
  }

  // ─── Contact Staging ───────────────────────────────────
  async createContactStaging(contactData) {
    const bcData = {
      contactNo: contactData.contactNo || "",
      contactName: contactData.contactName,
      eMail: contactData.email || "",
      phoneNo: contactData.phone || "",
      mobilePhoneNo: contactData.mobilePhoneNo || "",
      companyNo: contactData.companyNo || "",
      companyName: contactData.companyName || "",
      portalUser: contactData.portalUser || false,
      portalAdmin: contactData.portalAdmin || false,
      partnerType: contactData.role || contactData.partnerType || "",
      partnerNo: contactData.partnerNo || "",
      shipToCode: contactData.shipToCode || "",
      locationCode: contactData.locationCode || contactData.vendorLocationCode || "",
      address: contactData.address || "",
      address2: contactData.address2 || "",
      city: contactData.city || "",
      postCode: contactData.postCode || "",
      countryRegionCode: contactData.countryRegionCode || "",
      jobTitle: contactData.jobTitle || "",
      department: contactData.department || "",
      faxNo: contactData.faxNo || "",
      homePage: contactData.homePage || "",
      languageCode: contactData.languageCode || "",
      syncStatus: contactData.syncStatus || "Pending",
      lastSyncedDateTime: contactData.lastSyncedDateTime || "0001-01-01T00:00:00Z",
    };

    return await this.callAPI("contactStagings", "POST", bcData);
  }

  // ─── Partner Location Links ────────────────────────────
  async createPartnerLocationLink(linkData) {
    const bcData = {
      partnerType: linkData.partnerType || "",
      partnerNo: linkData.partnerNo || "",
      description: linkData.description || "",
      addressCode: linkData.addressCode || "",
      addressName: linkData.addressName || "",
      locationCode: linkData.locationCode || "",
      address: linkData.address || "",
      address2: linkData.address2 || "",
      city: linkData.city || "",
      postCode: linkData.postCode || "",
      countryRegionCode: linkData.countryRegionCode || "",
      contact: linkData.contact || "",
      phoneNo: linkData.phoneNo || "",
      isDefault: linkData.isDefault || false,
      blocked: linkData.blocked || false,
    };

    return await this.callAPI("partnerLocationLinks", "POST", bcData);
  }

  // ─── Item Request Staging ──────────────────────────────
  async createItemRequest(itemData) {
    const bcData = {
      batchNo: itemData.batchNo || "",
      itemName: itemData.itemName,
      description: itemData.description || "",
      itemCategoryCode: itemData.itemCategoryCode || "",
      baseUnitOfMeasure: itemData.baseUnitOfMeasure || "",
      netWeight: parseFloat(itemData.netWeight) || 0,
      grossWeight: parseFloat(itemData.grossWeight) || 0,
      specifications: itemData.specifications || "",
      ingredients: itemData.ingredients || "",
      allergenDeclaration: itemData.allergenDeclaration || "",
      shelfLifeDays: parseInt(itemData.shelfLifeDays) || 0,
      gtin: itemData.gtin || "",
      eanCode: itemData.eanCode || "",
      upcCode: itemData.UPCCode || itemData.upcCode || "",
      purchUnitOfMeasure: itemData.purchUnitOfMeasure || "",
      purchaseUnitPrice: parseFloat(itemData.purchaseUnitPrice || itemData.unitPrice) || 0,
      priceCurrencyCode: itemData.priceCurrencyCode || "",
      priceEffectiveDate: itemData.PriceEffectiveDate || itemData.priceEffectiveDate || null,
      partnerNo: itemData.partnerNo || "",
      status: itemData.status || "Created",
      rejectionReason: itemData.rejectionReason || "",
    };

    return await this.callAPI("itemRequests", "POST", bcData);
  }

  // ─── Order Staging ─────────────────────────────────────
  async createOrderStaging(orderData) {
    const bcData = {
      orderType: "Sales Order",
      partnerNo: orderData.partnerNo || "",
      partnerType: orderData.partnerType || "",
      shipToCode: orderData.shipToCode || "",
      locationCode: orderData.locationCode || "",
      orderDate: orderData.orderDate || new Date().toISOString().split('T')[0],
      requestedDeliveryDate: orderData.requestedDeliveryDate || null,
      currencyCode: orderData.currencyCode || "",
      externalDocumentNo: orderData.externalDocumentNo || "",
      partnerOrderNo: orderData.partnerOrderNo || "",
      partnerOrderStatus: "Confirmed",
      status: "Confirmed",
      direction: orderData.direction || "Portal_x002D_to_x002D_BC",
      submittedDate: orderData.submittedDate || new Date().toISOString(),
      orderStagingLines: (orderData.orderStagingLines || []).map(line => ({
        lineNo: parseInt(line.lineNo) || 0,
        itemNo: line.itemNo || "",
        description: line.description || "",
        quantity: parseFloat(line.quantity) || 0,
        unitOfMeasureCode: line.unitOfMeasureCode || "",
        unitPrice: parseFloat(line.unitPrice) || 0,
        lineDiscountPercent: parseFloat(line.lineDiscountPercent) || 0,
        lineDiscountAmount: parseFloat(line.lineDiscountAmount) || 0,
        lineAmount: parseFloat(line.lineAmountExclVat ?? line.lineAmount) || 0,
        locationCode: line.locationCode || "",
        deliveryDate: line.deliveryDate || null,
        variantCode: line.variantCode || "",
      })),
    };

    return await this.callAPI("orderStagings?$expand=orderStagingLines", "POST", bcData);
  }

  async getPurchaseOrderConfirmByDocumentNo(documentNo) {
    if (!documentNo) {
      throw new Error("documentNo is required to lookup purchase order confirmation");
    }
    const escapedDocumentNo = documentNo.replace(/'/g, "''");
    const filter = `documentNo eq '${escapedDocumentNo}'`;
    return await this.callAPI(`purchaseOrderConfirms?$filter=${encodeURIComponent(filter)}`);
  }

  async patchPurchaseOrderConfirm(bcConfirmId, data, etag = "*") {
    if (!bcConfirmId) {
      throw new Error("BC confirm ID is required to patch purchase order confirmation");
    }
    return await this.callAPI(`purchaseOrderConfirms(${bcConfirmId})`, "PATCH", data, null, etag);
  }

  async patchPurchaseOrderConfirmByGuid(bcGuid, data, etag = "*") {
    if (!bcGuid) {
      throw new Error("BC confirm GUID is required to patch purchase order confirmation");
    }
    // Fetch fresh ETag if not provided
    let resolvedEtag = etag;
    if (etag === "*") {
      try {
        const record = await this.callAPI(`purchaseOrderConfirms(${bcGuid})`);
        resolvedEtag = record["@odata.etag"] || "*";
      } catch {
        resolvedEtag = "*";
      }
    }
    return await this.callAPI(`purchaseOrderConfirms(${bcGuid})`, "PATCH", data, null, resolvedEtag);
  }

  // ─── Delivery Staging ──────────────────────────────────
  async createDeliveryStaging(deliveryData) {
    const toDate = (val) => (val && val !== '' && val !== '0001-01-01') ? String(val).split('T')[0] : null;

    const bcData = {
      deliveryOrderNo:      deliveryData.deliveryOrderNo      || "",
      deliveryType:         deliveryData.deliveryType         || "ASN",
      partnerNo:            deliveryData.partnerNo            || "",
      partnerType:          deliveryData.partnerType          || "",
      direction:            "Portal_x002D_to_x002D_BC",
      shipmentDate:         toDate(deliveryData.shipmentDate) || new Date().toISOString().split('T')[0],
      expectedDeliveryDate: toDate(deliveryData.expectedDeliveryDate) || "0001-01-01",
      actualDeliveryDate:   toDate(deliveryData.actualDeliveryDate)   || "0001-01-01",
      deliveryDateTime:     deliveryData.deliveryDateTime     || "0001-01-01T00:00:00Z",
      linkedOrderNo:        deliveryData.linkedOrderNo        || "",
      shipmentNo:           deliveryData.shipmentNo           || "",
      trackingNo:           deliveryData.trackingNo           || "",
      carrierCode:          deliveryData.carrierCode          || "",
      locationCode:         deliveryData.locationCode         || "",
      shipToCode:           deliveryData.shipToCode           || "",
      warehouseLocation:    deliveryData.warehouseLocation    || "",
      totalAmount:          deliveryData.totalAmount          || 0,
      currencyCode:         deliveryData.currencyCode         || "",
      shipAddress:          deliveryData.shipAddress          || "",
      shipCity:             deliveryData.shipCity             || "",
      shipState:            deliveryData.shipState            || "",
      shipPostCode:         deliveryData.shipPostCode         || "",
      shipCountryCode:      deliveryData.shipCountryCode      || "",
      deliveryStagingsLine: (deliveryData.deliveryStagingsLine || []).map(line => ({
        lineNo:            line.lineNo            || 0,
        poNo:              line.poNo              || "",
        poLineNo:          line.poLineNo          || 0,
        poDateTime:        "0001-01-01T00:00:00Z",
        poTotalAmount:     line.poTotalAmount     || 0,
        itemNo:            line.itemNo            || "",
        description:       line.description       || "",
        orderedQuantity:   line.orderedQuantity   || 0,
        shippedQuantity:   line.shippedQuantity   || 0,
        remainingQuantity: line.remainingQuantity || 0,
        serialNo:          line.serialNo          || "",
        lotNo:             line.lotNo             || "",
        unitOfMeasureCode: line.unitOfMeasureCode || "",
        unitPrice:         line.unitPrice         || 0,
        lineAmount:        line.lineAmount        || 0,
        variantCode:       line.variantCode       || "",
        expirationDate:    toDate(line.expirationDate) || "0001-01-01",
      })),
      documents: (deliveryData.documents || []).map((d, i) => ({
        regNo:   deliveryData.deliveryOrderNo || "",
        lineNo:  (i + 1) * 10000,
        name:    d.name || "",
        url:     d.url  || "",
        size:    d.size || 0,
      })),
    };

    return await this.callAPI("deliveryStagings?$expand=deliveryStagingsLine,documents", "POST", bcData);
  }

  // ─── Invoice Staging ───────────────────────────────────
  async createInvoiceStaging(invoiceData) {
    const bcData = {
      invoiceType: invoiceData.invoiceType || "",
      invoiceNo: invoiceData.invoiceNo || "",
      invoiceDate: invoiceData.invoiceDate || new Date().toISOString().split('T')[0],
      dueDate: invoiceData.dueDate || null,
      partnerNo: invoiceData.partnerNo || "",
      partnerType: invoiceData.partnerType || "",
      totalAmount: invoiceData.totalAmount || 0,
      currencyCode: invoiceData.currencyCode || "",
      outstandingAmount: invoiceData.outstandingAmount || 0,
      status: invoiceData.status || "",
      bcInvoiceNo: invoiceData.bcInvoiceNo || "",
      linkedOrderNo: invoiceData.linkedOrderNo || "",
      portalInvoiceLine: (invoiceData.portalInvoiceLine || []).map(line => ({
        lineNo: line.lineNo || 0,
        itemNo: line.itemNo || "",
        description: line.description || "",
        lineAmount: line.lineAmount || 0,
        lineDiscount: line.lineDiscount || 0,
        lineDiscountAmount: line.lineDiscountAmount || 0,
        quantity: line.quantity || 0,
        unitPrice: line.unitPrice || 0,
        unitOfMeasureCode: line.unitOfMeasureCode || "",
        vat: line.vat || 0,
        vatAmount: line.vatAmount || 0,
        variantCode: line.variantCode || "",
      })),
    };

    return await this.callAPI("portalInvoices?$expand=portalInvoiceLine", "POST", bcData);
  }

  // ─── Partner Messages ──────────────────────────────────
  async createMessage(messageData) {
    const bcData = {
      threadId:         messageData.threadId        || "",
      documentType:     messageData.documentType    || "",
      category:         messageData.category        || "General",
      linkedDocType:    messageData.linkedDocType   || "",
      linkedDocNo:      messageData.linkedDocNo     || "",
      senderType:       messageData.senderType      || "",
      PartnerType:      messageData.PartnerType     || messageData.partnerType || "",
      senderId:         messageData.senderId        || "",
      senderName:       messageData.senderName      || "",
      messageText:      messageData.messageText     || "",
      changeDetails:    messageData.changeDetails   || "",
      messageTimestamp: messageData.messageTimestamp || new Date().toISOString(),
      direction:        messageData.direction       || "Portal-to-BC",
      status:           messageData.status          || "Created",
    };

    return await this.callAPI("messages", "POST", bcData);
  }

  // ─── Notification Log ──────────────────────────────────
  async createNotification(notificationData) {
    const bcData = {
      partnerNo: notificationData.partnerNo || "",
      notificationType: notificationData.notificationType || "",
      subject: notificationData.subject || "",
      body: notificationData.body || "",
      status: notificationData.status || "Queued",
      isRead: notificationData.isRead || false,
      eventTimestamp: notificationData.eventTimestamp || new Date().toISOString(),
      linkedDocumentType: notificationData.linkedDocumentType || "",
      linkedDocumentNo: notificationData.linkedDocumentNo || "",
      channel: notificationData.channel || "Email",
    };

    return await this.callAPI("notifications", "POST", bcData);
  }

  // ─── Purchase Item Request ──────────────────────────────
  async createPurchaseItemRequest(data) {
    const bcData = {
      changeDescription: data.changeDescription || data.description || "",
      changeType:        data.changeType        || "",
      itemNo:            data.itemNo            || "",
      newValue:          data.newValue          || "",
      oldValue:          data.oldValue          || "",
      partnerNo:         data.partnerNo         || "",
      partnerType:       data.partnerType       || "Vendor",
      rejectionReason:   data.rejectionReason   || "",
      status:            data.status            || "_x0020_",
      submittedDate:     data.submittedDate      || new Date().toISOString(),
      approvedDate:      data.approvedDate       || "0001-01-01T00:00:00Z",
    };

    return await this.callAPI("ItemChangeRequest", "POST", bcData);
  }

  // ─── Item Change Request ───────────────────────────────
  async createItemChangeRequest(changeData) {
    const bcData = {
      approvedDate: changeData.approvedDate || "0001-01-01T00:00:00Z",
      changeDescription: changeData.changeDescription || "",
      changeType: changeData.changeType || "",
      itemNo: changeData.itemNo || "",
      newValue: changeData.newValue || "",
      oldValue: changeData.oldValue || "",
      partnerNo: changeData.partnerNo || "",
      partnerType: changeData.partnerType || "_x0020_",
      rejectionReason: changeData.rejectionReason || "",
      status: changeData.status || "_x0020_",
      submittedDate: changeData.submittedDate || "0001-01-01T00:00:00Z",
    };

    return await this.callAPI("ItemChangeRequest", "POST", bcData);
  }

  // ─── Locations ──────────────────────────────────────────
  async getLocations() {
    const token = await this.getAccessToken();
    const url = `${BC_CONFIG.baseUrl}/${BC_CONFIG.tenantId}/${BC_CONFIG.environment}/api/partnerPortal/partnerPortal/v2.0/companies(${BC_CONFIG.companyId})/locations`;
    const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
    return response.data.value || [];
  }

  // ─── Item Category API ─────────────────────────────────
  async getItemCategories() {
    const token = await this.getAccessToken();
    const url = `${BC_CONFIG.baseUrl}/${BC_CONFIG.tenantId}/${BC_CONFIG.environment}/api/partnerPortal/registration/v2.0/companies(${BC_CONFIG.companyId})/ItemCategoryAPI`;
    const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
    return response.data.value || [];
  }

  // ─── Item Price Submissions ────────────────────────────
  async createPriceSubmission(priceData) {
    const bcData = {
      itemNo: priceData.itemNo || "",
      variantCode: priceData.variantCode || "",
      newPrice: priceData.newPrice || 0,
      oldPrice: priceData.oldPrice || 0,
      effectiveDate: priceData.effectiveDate || new Date().toISOString().split('T')[0],
      endingDate: priceData.endingDate || null,
      currencyCode: priceData.currencyCode || "",
      unitOfMeasureCode: priceData.unitOfMeasureCode || "",
      minimumQuantity: priceData.minimumQuantity || 0,
      partnerNo: priceData.partnerNo || "",
      status: priceData.status || "_x0020_",
      rejectionReason: priceData.rejectionReason || "",
    };

    return await this.callAPI("priceSubmissions", "POST", bcData);
  }

  // ─── Partner Announcement ──────────────────────────────
  async createAnnouncement(announcementData) {
    const bcData = {
      title: announcementData.title || "",
      body: announcementData.body || "",
      publishDate: announcementData.publishDate || new Date().toISOString().split('T')[0],
      expiryDate: announcementData.expiryDate || null,
      priority: announcementData.priority || "Medium",
      status: announcementData.status || "Draft",
      targetPartnerType: announcementData.targetPartnerType || "_x0020_",
    };

    return await this.callAPI("announcements", "POST", bcData);
  }

  // ─── Vendor Registration ───────────────────────────────
  async createVendorRegistration(vendorData) {
    const bcData = {
      regType: vendorData.regType || "Create",
      scope: vendorData.scope || "Current_x0020_Company",
      status: vendorData.status || "Draft",
      name: vendorData.name || "",
      name2: vendorData.name2 || "",
      address: vendorData.address || "",
      address2: vendorData.address2 || "",
      city: vendorData.city || "",
      postCode: vendorData.postCode || "",
      countryRegionCode: vendorData.countryRegionCode || "",
      phoneNo: vendorData.phoneNo || "",
      email: vendorData.email || "",
      vatRegistrationNo: vendorData.vatRegistrationNo || "",
      currencyCode: vendorData.currencyCode || "",
      paymentTermsCode: vendorData.paymentTermsCode || "",
      paymentMethodCode: vendorData.paymentMethodCode || "",
      vendorPostingGroup: vendorData.vendorPostingGroup || "",
      genBusPostingGroup: vendorData.genBusPostingGroup || "",
      vatBusPostingGroup: vendorData.vatBusPostingGroup || "",
      businessJustification: vendorData.businessJustification || "",
    };

    const url = `${BC_CONFIG.baseUrl}/${BC_CONFIG.tenantId}/${BC_CONFIG.environment}/api/partnerPortal/registration/v2.0/companies(${BC_CONFIG.companyId})/vendorRegistrations`;
    
    const token = await this.getAccessToken();
    const response = await axios.post(url, bcData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  }

  // ─── Get Partner Registration by no (e.g. VRG-000118) ────────
  async getPartnerRegistration(no) {
    const token = await this.getAccessToken();
    const url = `${BC_CONFIG.baseUrl}/${BC_CONFIG.tenantId}/${BC_CONFIG.environment}/api/partnerPortal/partnerPortal/v2.0/companies(${BC_CONFIG.companyId})/partnerRegistrations('${no}')?$expand=partnerRegContactLines,partnerRegBankLines`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
    return response.data;
  }

  // ─── Patch Partner Registration by no ─────────────────────────
  async patchPartnerRegistration(no, etag, data) {
    const token = await this.getAccessToken();
    const url = `${BC_CONFIG.baseUrl}/${BC_CONFIG.tenantId}/${BC_CONFIG.environment}/api/partnerPortal/partnerPortal/v2.0/companies(${BC_CONFIG.companyId})/partnerRegistrations('${no}')`;
    console.log("🔍 PATCH URL:", url);
    const response = await axios.patch(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "If-Match": etag || "*",
      },
    });
    return response.data;
  }

  // ─── Update Registration: PATCH directly using registration no ─
  async updateRegistration(registrationNo, data) {
    console.log("🔧 BC Service - updateRegistration received:");
    console.log("   registrationNo:", registrationNo);
    console.log("   data.partnerRegContactLines:", JSON.stringify(data.partnerRegContactLines, null, 2));
    console.log("   data.partnerRegBankLines:", JSON.stringify(data.partnerRegBankLines, null, 2));

    const safeCountryCode = (val) =>
      val && /^[A-Z]{2}$/i.test(val.trim()) ? val.trim().toUpperCase() : "";
    const safePostCode = (val) =>
      val && val !== "000000" && val !== "00000" && val !== "0" ? val : "";

    const header = {
      partnerType:            data.partnerType            || "",
      tradeName:              data.tradeName              || "",
      partnerEmail:           data.partnerEmail           || "",
      tradeLicenseNumber:     data.tradeLicenseNumber     || "",
      tradeLicenseExpiryDate: data.tradeLicenseExpiryDate || "0001-01-01",
      companyRegNumber:       data.companyRegNumber       || "",
      entityType:             sanitizeEntityType(data.entityType),
      countryOfIncorporation: safeCountryCode(data.countryOfIncorporation),
      placeOfRegistration:    data.placeOfRegistration    || "",
      website:                data.website                || "",
      phoneNo:                data.phoneNo                || "",
      address:                data.address                || "",
      address2:               data.address2               || "",
      city:                   data.city                   || "",
      postCode:               safePostCode(data.postCode),
      countryRegionCode:      safeCountryCode(data.countryRegionCode),
      vatRegistrationNo:      data.vatRegistrationNo      || "",
      currencyCode:           data.currencyCode           || "",
      paymentMethodCode:      data.paymentMethodCode      || "",
      paymentTermsCode:       data.paymentTermsCode       || "",
      partnerCategory:        data.partnerCategory        || "",
    };

    const contactLines = (data.partnerRegContactLines || []).map((c, i) => ({
      lineNo:       c.lineNo       || (i + 1) * 10000,
      fullName:     c.fullName     || "",
      designation:  c.designation  || "",
      mobileNumber: c.mobileNumber || "",
      emailAddress: c.emailAddress || "",
    }));

    const bankLines = (data.partnerRegBankLines || []).map((b, i) => ({
      lineNo:        b.lineNo        || (i + 1) * 10000,
      bankCode:      b.bankCode      || "",
      name:          b.name          || "",
      bankBranchNo:  b.bankBranchNo  || "",
      bankAccountNo: b.bankAccountNo || "",
      iban:          b.iban          || "",
      swiftCode:     b.swiftCode     || "",
      currencyCode:  b.currencyCode  || "",
      isPrimary:     b.isPrimary     || false,
    }));

    const payload = JSON.stringify({ header, contactLines, bankLines });
    console.log("📤 BC Service - Custom Action payload:", payload);

    return await this.callAPI(
      `partnerRegistrations('${registrationNo}')/Microsoft.NAV.updateRegistration`,
      "POST",
      { payload }
    );
  }

  // ─── Post/Patch Contacts and Banks for Registration ─────────────────────
  async postContactsAndBanksForRegistration(regNo, contacts, banks) {
    const token = await this.getAccessToken();
    const results = { contacts: [], banks: [] };

    // PATCH contacts individually (update existing)
    if (contacts && contacts.length > 0) {
      console.log("📇 Patching", contacts.length, "contacts...");
      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        const lineNo = contact.lineNo || (i + 1) * 10000;
        const contactPayload = {
          fullName: contact.fullName || "",
          designation: contact.designation || "",
          mobileNumber: contact.mobileNumber || "",
          emailAddress: contact.emailAddress || "",
        };

        try {
          // POST as new record first
          const postUrl = `${BC_CONFIG.baseUrl}/${BC_CONFIG.tenantId}/${BC_CONFIG.environment}/api/partnerPortal/partnerPortal/v2.0/companies(${BC_CONFIG.companyId})/partnerRegistrations('${regNo}')/partnerRegContactLines`;
          const postPayload = { ...contactPayload, lineNo };
          const response = await axios.post(postUrl, postPayload, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          });
          console.log(`✅ Contact ${i + 1} created:`, lineNo);
          results.contacts.push({ lineNo, status: 'created' });
        } catch (postErr) {
          // If record exists, fall back to PATCH
          const errorCode = postErr.response?.data?.error?.code;
          const errorMessage = postErr.response?.data?.error?.message || '';
          if (errorCode === 'Internal_EntityWithSameKeyExists' || 
              errorMessage.includes('already exists')) {
            try {
              // Use direct entity endpoint for PATCH
              const patchUrl = `${BC_CONFIG.baseUrl}/${BC_CONFIG.tenantId}/${BC_CONFIG.environment}/api/partnerPortal/partnerPortal/v2.0/companies(${BC_CONFIG.companyId})/partnerRegContactLines(regNo='${regNo}',lineNo=${lineNo})`;
              const response = await axios.patch(patchUrl, contactPayload, {
                headers: { 
                  Authorization: `Bearer ${token}`, 
                  "Content-Type": "application/json",
                  "If-Match": "*"
                },
              });
              console.log(`✅ Contact ${i + 1} patched:`, lineNo);
              results.contacts.push({ lineNo, status: 'patched' });
            } catch (patchErr) {
              console.error(`❌ Contact ${i + 1} patch failed:`, patchErr.response?.data || patchErr.message);
              results.contacts.push({ lineNo, status: 'failed', error: patchErr.response?.data });
            }
          } else {
            console.error(`❌ Contact ${i + 1} failed:`, postErr.response?.data || postErr.message);
            results.contacts.push({ lineNo, status: 'failed', error: postErr.response?.data });
          }
        }
      }
    }

    // PATCH banks individually (update existing)
    if (banks && banks.length > 0) {
      console.log("🏦 Patching", banks.length, "banks...");
      for (let i = 0; i < banks.length; i++) {
        const bank = banks[i];
        const lineNo = bank.lineNo || (i + 1) * 10000;
        const bankPayload = {
          bankCode: bank.bankCode || "",
          name: bank.name || "",
          bankBranchNo: bank.bankBranchNo || "",
          bankAccountNo: bank.bankAccountNo || "",
          iban: bank.iban || "",
          swiftCode: bank.swiftCode || "",
          currencyCode: bank.currencyCode || "",
          isPrimary: bank.isPrimary || false,
        };

        try {
          // POST as new record first
          const postUrl = `${BC_CONFIG.baseUrl}/${BC_CONFIG.tenantId}/${BC_CONFIG.environment}/api/partnerPortal/partnerPortal/v2.0/companies(${BC_CONFIG.companyId})/partnerRegistrations('${regNo}')/partnerRegBankLines`;
          const postPayload = { ...bankPayload, lineNo };
          const response = await axios.post(postUrl, postPayload, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          });
          console.log(`✅ Bank ${i + 1} created:`, lineNo);
          results.banks.push({ lineNo, status: 'created' });
        } catch (postErr) {
          // If record exists, fall back to PATCH
          const errorCode = postErr.response?.data?.error?.code;
          const errorMessage = postErr.response?.data?.error?.message || '';
          if (errorCode === 'Internal_EntityWithSameKeyExists' || 
              errorMessage.includes('already exists')) {
            try {
              // Use direct entity endpoint for PATCH
              const patchUrl = `${BC_CONFIG.baseUrl}/${BC_CONFIG.tenantId}/${BC_CONFIG.environment}/api/partnerPortal/partnerPortal/v2.0/companies(${BC_CONFIG.companyId})/partnerRegBankLines(regNo='${regNo}',lineNo=${lineNo})`;
              const response = await axios.patch(patchUrl, bankPayload, {
                headers: { 
                  Authorization: `Bearer ${token}`, 
                  "Content-Type": "application/json",
                  "If-Match": "*"
                },
              });
              console.log(`✅ Bank ${i + 1} patched:`, lineNo);
              results.banks.push({ lineNo, status: 'patched' });
            } catch (patchErr) {
              console.error(`❌ Bank ${i + 1} patch failed:`, patchErr.response?.data || patchErr.message);
              results.banks.push({ lineNo, status: 'failed', error: patchErr.response?.data });
            }
          } else {
            console.error(`❌ Bank ${i + 1} failed:`, postErr.response?.data || postErr.message);
            results.banks.push({ lineNo, status: 'failed', error: postErr.response?.data });
          }
        }
      }
    }

    return results;
  }

  // ─── Post Documents/Contacts/Banks for Registration ─────────────────────
  async postDocumentsForRegistration(regNo, documents, contacts, banks) {
    const token = await this.getAccessToken();
    
    console.log("📎 Attempting to PATCH for:", regNo);
    console.log("   Documents:", documents?.length || 0);
    console.log("   Contacts:", contacts?.length || 0);
    console.log("   Banks:", banks?.length || 0);
    
    const results = { contacts: null, banks: null, documents: [] };
    
    // ─── PATCH contacts and banks together ───
    const patchPayload = {};
    
    if (contacts && contacts.length > 0) {
      patchPayload.partnerRegContactLines = contacts.map((c, i) => ({
        lineNo: c.lineNo || (i + 1) * 10000,
        fullName: c.fullName || "",
        designation: c.designation || "",
        mobileNumber: c.mobileNumber || "",
        emailAddress: c.emailAddress || "",
      }));
    }
    
    if (banks && banks.length > 0) {
      patchPayload.partnerRegBankLines = banks.map((b, i) => ({
        lineNo: b.lineNo || (i + 1) * 10000,
        bankCode: b.bankCode || "",
        name: b.name || "",
        bankBranchNo: b.bankBranchNo || "",
        bankAccountNo: b.bankAccountNo || "",
        iban: b.iban || "",
        swiftCode: b.swiftCode || "",
        currencyCode: b.currencyCode || "",
        isPrimary: b.isPrimary || false,
      }));
    }
    
    if (Object.keys(patchPayload).length > 0) {
      console.log("📋 PATCH payload (contacts/banks):", JSON.stringify(patchPayload, null, 2));
      
      try {
        const expandParams = [];
        if (patchPayload.partnerRegContactLines) expandParams.push('partnerRegContactLines');
        if (patchPayload.partnerRegBankLines) expandParams.push('partnerRegBankLines');
        
        const patchUrl = `${BC_CONFIG.baseUrl}/${BC_CONFIG.tenantId}/${BC_CONFIG.environment}/api/partnerPortal/partnerPortal/v2.0/companies(${BC_CONFIG.companyId})/partnerRegistrations('${regNo}')?$expand=${expandParams.join(',')}`;
        console.log("🔗 PATCH URL:", patchUrl);
        
        const response = await axios.patch(patchUrl, patchPayload, {
          headers: { 
            Authorization: `Bearer ${token}`, 
            "Content-Type": "application/json",
            "If-Match": "*"
          },
        });
        
        console.log("✅ Contacts/Banks PATCH successful:", response.status);
        results.contacts = patchPayload.partnerRegContactLines ? 'success' : null;
        results.banks = patchPayload.partnerRegBankLines ? 'success' : null;
      } catch (patchErr) {
        console.error("❌ Contacts/Banks PATCH failed:");
        console.error("   Status:", patchErr.response?.status);
        console.error("   Data:", JSON.stringify(patchErr.response?.data, null, 2));
        results.contacts = patchPayload.partnerRegContactLines ? 'failed' : null;
        results.banks = patchPayload.partnerRegBankLines ? 'failed' : null;
      }
    }
    
    // ─── POST documents individually ───
    if (documents && documents.length > 0) {
      console.log("📄 Posting", documents.length, "documents individually...");
      
      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        const timestamp = Date.now();
        const uniqueName = `${regNo}_${i + 1}_${timestamp}_${doc.name}`;
        
        const docPayload = {
          regNo: regNo,
          name: uniqueName,
          url: doc.url || "",
          size: doc.size || 0,
        };
        
        console.log(`📄 Posting document ${i + 1}/${documents.length}:`, uniqueName);
        
        try {
          const docUrl = `${BC_CONFIG.baseUrl}/${BC_CONFIG.tenantId}/${BC_CONFIG.environment}/api/partnerPortal/partnerPortal/v2.0/companies(${BC_CONFIG.companyId})/documents`;
          
          const response = await axios.post(docUrl, docPayload, {
            headers: { 
              Authorization: `Bearer ${token}`, 
              "Content-Type": "application/json"
            },
          });
          
          console.log(`✅ Document ${i + 1} posted successfully:`, response.status);
          results.documents.push({ name: uniqueName, originalName: doc.name, status: 'success' });
        } catch (docErr) {
          console.error(`❌ Document ${i + 1} failed:`, uniqueName);
          console.error("   Status:", docErr.response?.status);
          console.error("   Error:", JSON.stringify(docErr.response?.data, null, 2));
          results.documents.push({ name: uniqueName, originalName: doc.name, status: 'failed', error: docErr.response?.data });
        }
      }
    }
    
    return { success: true, results };
  }

  // ─── Partner Registration ──────────────────────────────
  async createPartnerRegistration(data) {
    const safeCountryCode = (val) =>
      val && /^[A-Z]{2}$/i.test(val.trim()) ? val.trim().toUpperCase() : "";

    const safePostCode = (val) =>
      val && val !== "000000" && val !== "00000" && val !== "0" ? val : "";

    console.log("🔧 BC Service - createPartnerRegistration received:");
    console.log("   data.partnerRegContactLines:", JSON.stringify(data.partnerRegContactLines, null, 2));
    console.log("   data.partnerRegBankLines:", JSON.stringify(data.partnerRegBankLines, null, 2));

    const bcData = {
      no:                     data.partnerNo             || "",
      regType:                data.regType               || "Create",
      scope:                  data.scope                 || "Current_x0020_Company",
      status:                 data.status                || "Draft",
      partnerType:            data.partnerType           || "Customer",
      name:                   data.name                  || data.tradeName || "",
      name2:                  data.name2                 || "",
      tradeName:              data.tradeName             || "",
      partnerEmail:           data.partnerEmail          || "",
      tradeLicenseNumber:     data.tradeLicenseNumber    || "",
      tradeLicenseExpiryDate: data.tradeLicenseExpiryDate || "0001-01-01",
      companyRegNumber:       data.companyRegNumber      || "",
      entityType:             sanitizeEntityType(data.entityType),
      countryOfIncorporation: safeCountryCode(data.countryOfIncorporation),
      placeOfRegistration:    data.placeOfRegistration   || "",
      website:                data.website               || "",
      phoneNo:                data.phoneNo               || "",
      address:                data.address               || "",
      address2:               data.address2              || "",
      city:                   data.city                  || "",
      postCode:               safePostCode(data.postCode),
      countryRegionCode:      safeCountryCode(data.countryRegionCode),
      vatRegistrationNo:      data.vatRegistrationNo     || "",
      currencyCode:           data.currencyCode          || "",
      paymentMethodCode:      data.paymentMethodCode     || "",
      paymentTermsCode:       data.paymentTermsCode      || "",
      partnerCategory:        data.partnerCategory       || "",
      partnerRegContactLines: (data.partnerRegContactLines || []).map((c, i) => ({
        lineNo:       c.lineNo       || (i + 1) * 10000,
        fullName:     c.fullName     || "",
        designation:  c.designation  || "",
        mobileNumber: c.mobileNumber || "",
        emailAddress: c.emailAddress || "",
      })),
      partnerRegBankLines: (data.partnerRegBankLines || []).map((b, i) => ({
        lineNo:        b.lineNo        || (i + 1) * 10000,
        bankCode:      b.bankCode      || "",
        name:          b.name          || "",
        bankBranchNo:  b.bankBranchNo  || "",
        bankAccountNo: b.bankAccountNo || "",
        iban:          b.iban          || "",
        swiftCode:     b.swiftCode     || "",
        currencyCode:  b.currencyCode  || "",
        isPrimary:     b.isPrimary     || false,
      })),
    };

    const token = await this.getAccessToken();
    const url = `${BC_CONFIG.baseUrl}/${BC_CONFIG.tenantId}/${BC_CONFIG.environment}/api/partnerPortal/partnerPortal/v2.0/companies(${BC_CONFIG.companyId})/partnerRegistrations?$expand=partnerRegContactLines,partnerRegBankLines`;

    const response = await axios.post(url, bcData, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });

    const createdReg = response.data;
    console.log("✅ Registration created:", createdReg.no);

    return createdReg;
  }

  // ─── Post Codes ─────────────────────────────────────────
  async getPostCodes(filter = null) {
    const endpoint = filter
      ? `postCodes?$filter=${encodeURIComponent(filter)}`
      : `postCodes`;
    return await this.callAPI(endpoint);
  }

  // ─── Customer Payment History ───────────────────────────
  async getCustomerPaymentHistory(customerNo) {
    if (!customerNo) throw new Error("customerNo is required");
    const escapedCustomerNo = customerNo.replace(/'/g, "''");
    const filter = `customerNo eq '${escapedCustomerNo}'`;
    return await this.callAPI(`customerPaymentHistories?$filter=${encodeURIComponent(filter)}`);
  }

  // ─── Vendor Payment History ────────────────────────────
  async getVendorPaymentHistory(vendorNo) {
    if (!vendorNo) throw new Error("vendorNo is required");
    const escapedVendorNo = vendorNo.replace(/'/g, "''");
    const filter = `vendorNo eq '${escapedVendorNo}'`;
    return await this.callAPI(`vendorPaymentHistories?$filter=${encodeURIComponent(filter)}`);
  }

  // ─── Customer Registration ─────────────────────────────
  async createCustomerRegistration(customerData) {
    const bcData = {
      regType: customerData.regType || "Create",
      scope: customerData.scope || "Current_x0020_Company",
      status: customerData.status || "Draft",
      customerNo: customerData.customerNo || "",
      name: customerData.name || "",
      name2: customerData.name2 || "",
      address: customerData.address || "",
      address2: customerData.address2 || "",
      city: customerData.city || "",
      postCode: customerData.postCode || "",
      countryRegionCode: customerData.countryRegionCode || "",
      phoneNo: customerData.phoneNo || "",
      email: customerData.email || "",
      vatRegistrationNo: customerData.vatRegistrationNo || "",
      currencyCode: customerData.currencyCode || "",
      paymentTermsCode: customerData.paymentTermsCode || "",
      paymentMethodCode: customerData.paymentMethodCode || "",
      customerPostingGroup: customerData.customerPostingGroup || "",
      genBusPostingGroup: customerData.genBusPostingGroup || "",
      vatBusPostingGroup: customerData.vatBusPostingGroup || "",
      businessJustification: customerData.businessJustification || "",
    };

    const url = `${BC_CONFIG.baseUrl}/${BC_CONFIG.tenantId}/${BC_CONFIG.environment}/api/partnerPortal/registration/v2.0/companies(${BC_CONFIG.companyId})/customerRegistrations`;
    
    const token = await this.getAccessToken();
    const response = await axios.post(url, bcData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  }
}

module.exports = new BusinessCentralService();
