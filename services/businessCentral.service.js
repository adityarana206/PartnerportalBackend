const axios = require("axios");

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
  async callAPI(endpoint, method = "GET", data = null, expand = null) {
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
      eMail: contactData.eMail || contactData.email || "",
      phoneNo: contactData.phoneNo || "",
      mobilePhoneNo: contactData.mobilePhoneNo || "",
      companyNo: contactData.companyNo || "",
      companyName: contactData.companyName || "",
      portalUser: contactData.portalUser || false,
      portalAdmin: contactData.portalAdmin || false,
      partnerType: contactData.partnerType || "",
      partnerNo: contactData.partnerNo || "",
      shipToCode: contactData.shipToCode || "",
      vendorLocationCode: contactData.vendorLocationCode || "",
      locationCode: contactData.locationCode || "",
      address: contactData.address || "",
      address2: contactData.address2 || "",
      city: contactData.city || "",
      postCode: contactData.postCode || "",
      countryRegionCode: contactData.countryRegionCode || "",
      jobTitle: contactData.jobTitle || "",
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
      unitPrice: parseFloat(itemData.unitPrice) || 0,
      priceCurrencyCode: itemData.priceCurrencyCode || "",
      partnerNo: itemData.partnerNo || "",
      status: itemData.status || "Created",
      rejectionReason: itemData.rejectionReason || "",
    };

    return await this.callAPI("itemRequests", "POST", bcData);
  }

  // ─── Order Staging ─────────────────────────────────────
  async createOrderStaging(orderData) {
    const bcData = {
      orderType: orderData.orderType || "",
      partnerNo: orderData.partnerNo || "",
      partnerType: orderData.partnerType || "",
      shipToCode: orderData.shipToCode || "",
      locationCode: orderData.locationCode || "",
      orderDate: orderData.orderDate || new Date().toISOString().split('T')[0],
      requestedDeliveryDate: orderData.requestedDeliveryDate || "",
      currencyCode: orderData.currencyCode || "",
      externalDocumentNo: orderData.externalDocumentNo || "",
      status: orderData.status || "Processed",
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
        lineAmount: parseFloat(line.lineAmount) || 0,
        locationCode: line.locationCode || "",
        deliveryDate: line.deliveryDate || "",
        variantCode: line.variantCode || "",
      })),
    };

    return await this.callAPI("orderStagings?$expand=orderStagingLines", "POST", bcData);
  }

  // ─── Delivery Staging ──────────────────────────────────
  async createDeliveryStaging(deliveryData) {
    const bcData = {
      deliveryType: deliveryData.deliveryType || "Shipment",
      partnerNo: deliveryData.partnerNo || "",
      partnerType: deliveryData.partnerType || "",
      linkedOrderNo: deliveryData.linkedOrderNo || "",
      shipmentNo: deliveryData.shipmentNo || "",
      trackingNo: deliveryData.trackingNo || "",
      carrierCode: deliveryData.carrierCode || "",
      shipmentDate: deliveryData.shipmentDate || new Date().toISOString().split('T')[0],
      expectedDeliveryDate: deliveryData.expectedDeliveryDate || "",
      locationCode: deliveryData.locationCode || "",
      shipToCode: deliveryData.shipToCode || "",
      status: deliveryData.status || "Processed",
      direction: deliveryData.direction || "Portal_x002D_to_x002D_BC",
      bcDocumentNo: deliveryData.bcDocumentNo || "",
      deliveryStagingsLine: (deliveryData.deliveryStagingsLine || []).map(line => ({
        lineNo: line.lineNo || 0,
        itemNo: line.itemNo || "",
        description: line.description || "",
        expirationDate: line.expirationDate || "0001-01-01",
        lotNo: line.lotNo || "",
        orderedQuantity: line.orderedQuantity || 0,
        remainingQuantity: line.remainingQuantity || 0,
        serialNo: line.serialNo || "",
        shippedQuantity: line.shippedQuantity || 0,
        unitOfMeasureCode: line.unitOfMeasureCode || "",
        variantCode: line.variantCode || "",
      })),
    };

    return await this.callAPI("deliveryStagings?$expand=deliveryStagingsLine", "POST", bcData);
  }

  // ─── Invoice Staging ───────────────────────────────────
  async createInvoiceStaging(invoiceData) {
    const bcData = {
      invoiceType: invoiceData.invoiceType || "",
      invoiceNo: invoiceData.invoiceNo || "",
      invoiceDate: invoiceData.invoiceDate || new Date().toISOString().split('T')[0],
      dueDate: invoiceData.dueDate || "",
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
      threadId: messageData.threadId || "",
      documentType: messageData.documentType || "",
      category: messageData.category || "General",
      linkedDocType: messageData.linkedDocType || "",
      linkedDocNo: messageData.linkedDocNo || "",
      senderType: messageData.senderType || "",
      senderId: messageData.senderId || "",
      senderName: messageData.senderName || "",
      messageText: messageData.messageText || "",
      changeDetails: messageData.changeDetails || "",
      messageTimestamp: messageData.messageTimestamp || new Date().toISOString(),
      direction: messageData.direction || "Portal-to-BC",
      status: messageData.status || "Open",
      returnItemNo: messageData.returnItemNo || "",
      returnQuantity: messageData.returnQuantity || 0,
      returnReasonCode: messageData.returnReasonCode || "",
      hasAttachments: messageData.hasAttachments || false,
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

  // ─── Item Price Submissions ────────────────────────────
  async createPriceSubmission(priceData) {
    const bcData = {
      itemNo: priceData.itemNo || "",
      variantCode: priceData.variantCode || "",
      newPrice: priceData.newPrice || 0,
      oldPrice: priceData.oldPrice || 0,
      effectiveDate: priceData.effectiveDate || new Date().toISOString().split('T')[0],
      endingDate: priceData.endingDate || "",
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
      expiryDate: announcementData.expiryDate || "",
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
