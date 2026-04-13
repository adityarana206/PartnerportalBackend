const ItemRequest = require("../models/Item.model");
const NoSeries = require("../models/NoSeris.model");
const UnitOfMeasure = require("../models/UnitOfMeasure.model");
const bcService = require("../services/businessCentral.service");
const { pool } = require("../config/db");
const { isValidId, sanitizeString } = require("../utils/validation.utils");

// ─── Create Item Request ───────────────────────────────────
// POST /api/items
const createItemRequestfrombc = async (req, res) => {
  
  try {
    if (!req.body.itemName) {
      return res.status(400).json({
        success: false,
        message: "Item name is required",
      });
    }

    // if (!req.body.partnerPortalNo || !req.body.partnerNo || !req.body.batchNo) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "partnerPortalNo, partnerNo, and batchNo are required",
    //   });
    // }

     const userId = req.user ? req.user.id : null;
     const partnerNo = req.body.partnerNo || (req.user ? req.user.refNo : null);
     const partnerPortalNo = await NoSeries.getNextNumberByCode("PORTAL");

    const item = await ItemRequest.create({ ...req.body, partnerNo, partnerPortalNo }, userId);

    res.status(201).json({
      success: true,
      message: "Item request created successfully",
      data: item,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



const createItemRequest = async (req, res) => {
  try {
    if (!req.body.itemName)
      return res.status(400).json({ success: false, message: "Item name is required" });

    const batchNo = await NoSeries.getNextNumberByCode("BATCH");
    const partnerNo = req.body.partnerNo || (req.user ? req.user.refNo : null);

    let bcResponse = null;
    let bcError = null;
    try {
      bcResponse = await bcService.createItemRequest({ ...req.body, batchNo, partnerNo, status: "Created" });
      console.log("✅ Item synced to Business Central:", bcResponse);
    } catch (bcErr) {
      bcError = bcErr.response?.data || bcErr.message;
      console.error("⚠️  Failed to sync to Business Central:", bcError);
    }
    // const item = await ItemRequest.create({ ...req.body, partnerNo }, userId);

    res.status(201).json({
      success: true,
      message: "Item request created successfully",
      //  data: item,
      businessCentral: { synced: !!bcResponse, response: bcResponse, error: bcError },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/items?status=Created
// GET /api/items?partnerNo=VNR000001
const getAllItemRequests = async (req, res) => {
  try {
    const status = sanitizeString(req.query.status);
    const partnerNo = sanitizeString(req.query.partnerNo);

    let items;
    if (status) {
      items = await ItemRequest.findByStatus(status);
    } else if (partnerNo) {
      items = await ItemRequest.findByPartnerNo(partnerNo);
    } else {
      items = await ItemRequest.findAll();
    }

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Item Request by ID ────────────────────────────────
// GET /api/items/:id
const getItemRequestById = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });
    const item = await ItemRequest.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item request not found",
      });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Items by Partner No ───────────────────────────────
// GET /api/items/partner/:partnerNo
const getItemsByPartner = async (req, res) => {
  try {
    const partnerNo = sanitizeString(req.params.partnerNo);
    if (!partnerNo)
      return res.status(400).json({ success: false, message: "Invalid partner number" });
    const items = await ItemRequest.findByPartnerNo(partnerNo);
    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getItemsByPartnerPortalNo = async (req, res) => {
  try {
    const partnerPortalNo = sanitizeString(req.params.partnerPortalNo);
    if (!partnerPortalNo)
      return res.status(400).json({ success: false, message: "Invalid partner portal number" });
    const items = await ItemRequest.findByPartnerPortalNo(partnerPortalNo);
    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getItemByKey = async (req, res) => {
  try {
    const { partnerPortalNo, partnerNo, batchNo } = req.params;
    const item = await ItemRequest.findByKey(partnerPortalNo, partnerNo, batchNo);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item request not found",
      });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Item Request ───────────────────────────────────
// PUT /api/items/:id
const updateItemRequest = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });
    const item = await ItemRequest.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item request not found",
      });
    }

    // ─── Only allow update if status is Created ────────────
    if (item.status !== "Created") {
      return res.status(400).json({
        success: false,
        message: `Cannot update item with status: ${item.status}. Only 'Created' items can be updated`,
      });
    }

    // ─── Check duplicate batchNo if changed ────────────────
    if (req.body.batchNo && req.body.batchNo !== item.batch_no) {
      const existing = await ItemRequest.findByBatchNo(req.body.batchNo);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Batch number already exists",
        });
      }
    }

    const updated = await ItemRequest.update(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Item request updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Item Status ────────────────────────────────────
// PATCH /api/items/:id/status
const updateItemStatus = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });
    const { status, rejectionReason } = req.body;

    // ─── Validate status ───────────────────────────────────
    const validStatuses = ["Created", "Pending", "Approved", "Rejected"];
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${validStatuses.join(", ")}`,
      });
    }

    // ─── Rejection reason required if rejected ─────────────
    if (status === "Rejected" && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required when rejecting an item",
      });
    }

    // ─── Check item exists ─────────────────────────────────
    const item = await ItemRequest.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item request not found",
      });
    }

    const updated = await ItemRequest.updateStatus(
      req.params.id,
      status,
      rejectionReason || null,
    );

    res.status(200).json({
      success: true,
      message: `Item status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Block / Unblock Item ──────────────────────────────────
// PATCH /api/items/:id/block
const updateItemBlock = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });
    const { block } = req.body;

    if (typeof block !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Block must be true or false",
      });
    }

    const item = await ItemRequest.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item request not found",
      });
    }

    const updated = await ItemRequest.updateBlock(req.params.id, block);
    res.status(200).json({
      success: true,
      message: `Item ${block ? "blocked" : "unblocked"} successfully`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete Item Request ───────────────────────────────────
// DELETE /api/items/:id
const deleteItemRequest = async (req, res) => {
  try {
    if (!isValidId(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });
    const item = await ItemRequest.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item request not found",
      });
    }

    // ─── Only allow delete if status is Created ────────────
    if (item.status !== "Created") {
      return res.status(400).json({
        success: false,
        message: `Cannot delete item with status: ${item.status}. Only 'Created' items can be deleted`,
      });
    }

    const deleted = await ItemRequest.delete(req.params.id);
    res.status(200).json({
      success: true,
      message: "Item request deleted successfully",
      data: deleted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUnitOfMeasures = async (req, res) => {
  try {
    const units = await UnitOfMeasure.findAll();
    res.status(200).json({ success: true, count: units.length, data: units });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createItemChangeRequest = async (req, res) => {
  try {
    const {
      itemNo, changeType, changeDescription,
      oldValue, newValue, partnerType, rejectionReason,
    } = req.body;

    if (!itemNo)
      return res.status(400).json({ success: false, message: "itemNo is required" });
    if (!newValue)
      return res.status(400).json({ success: false, message: "newValue is required" });

    const userId = req.user ? req.user.id : null;
    const partnerNo = req.body.partnerNo || (req.user ? req.user.refNo : null);
    const submittedDate = new Date().toISOString();

    // ─── Save to local DB ─────────────────────────────────
    const result = await pool.query(
      `INSERT INTO item_change_requests (
        item_no, change_type, change_description,
        old_value, new_value, partner_no, partner_type,
        status, rejection_reason, submitted_date,
        approved_date, created_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,'_x0020_',$8,$9,'0001-01-01T00:00:00Z',$10) RETURNING *`,
      [
        itemNo,
        changeType || "",
        changeDescription || "",
        oldValue || "",
        newValue,
        partnerNo,
        partnerType || "_x0020_",
        rejectionReason || "",
        submittedDate,
        userId,
      ]
    );

    // ─── Sync to Business Central ──────────────────────────
    let bcResponse = null;
    let bcError = null;
    try {
      bcResponse = await bcService.createItemChangeRequest({
        itemNo,
        changeType: changeType || "",
        changeDescription: changeDescription || "",
        oldValue: oldValue || "",
        newValue,
        partnerNo,
        partnerType: partnerType || "_x0020_",
        status: "_x0020_",
        rejectionReason: rejectionReason || "",
        submittedDate: "0001-01-01T00:00:00Z",
        approvedDate: "0001-01-01T00:00:00Z",
      });
      console.log("✅ Item change request synced to Business Central:", bcResponse);
    } catch (bcErr) {
      bcError = bcErr.response?.data || bcErr.message;
      console.error("⚠️  Failed to sync item change to Business Central:", bcError);
    }

    res.status(201).json({
      success: true,
      message: "Item change request submitted successfully",
      data: result.rows[0],
      businessCentral: { synced: !!bcResponse, response: bcResponse, error: bcError },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createPriceChange = async (req, res) => {
  try {
    const {
      itemNo, variantCode, newPrice, oldPrice,
      effectiveDate, endingDate, currencyCode,
      unitOfMeasureCode, minimumQuantity,
      partnerNo, rejectionReason,
    } = req.body;

    if (!itemNo)
      return res.status(400).json({ success: false, message: "itemNo is required" });
    if (newPrice === undefined || newPrice === null)
      return res.status(400).json({ success: false, message: "newPrice is required" });

    const resolvedPartnerNo = partnerNo || (req.user ? req.user.refNo : null);

    let bcResponse = null;
    let bcError = null;
    try {
      bcResponse = await bcService.createPriceSubmission({
        itemNo,
        variantCode: variantCode || "",
        newPrice,
        oldPrice: oldPrice || 0,
        effectiveDate,
        endingDate,
        currencyCode: currencyCode || "AED",
        unitOfMeasureCode: unitOfMeasureCode || "",
        minimumQuantity: minimumQuantity || 0,
        partnerNo: resolvedPartnerNo,
        status: "_x0020_",
        rejectionReason: rejectionReason || "",
      });
      console.log("✅ Price submission synced to Business Central:", bcResponse);
    } catch (bcErr) {
      bcError = bcErr.response?.data || bcErr.message;
      console.error("⚠️  Failed to sync price to Business Central:", bcError);
    }

    res.status(201).json({
      success: true,
      message: "Price change request submitted successfully",
      businessCentral: { synced: !!bcResponse, response: bcResponse, error: bcError },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createItemRequest,
  getAllItemRequests,
  getItemRequestById,
  getItemsByPartner,
  getItemsByPartnerPortalNo,
  getItemByKey,
  updateItemRequest,
  updateItemStatus,
  updateItemBlock,
  deleteItemRequest,
  createItemRequestfrombc,
  createItemChangeRequest,
  createPriceChange,
  getUnitOfMeasures,
};

const XLSX = require("xlsx");
const csv = require("csv-parser");
const { Readable } = require("stream");

// ─── Import Items from CSV/Excel ───────────────────────────
// POST /api/items/import
const importItems = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const fileBuffer = req.file.buffer;
    const fileExtension = req.file.originalname.split(".").pop().toLowerCase();
    let items = [];

    // Parse Excel file
    if (fileExtension === "xlsx" || fileExtension === "xls") {
      const workbook = XLSX.read(fileBuffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      items = XLSX.utils.sheet_to_json(worksheet);
    }
    // Parse CSV file
    else if (fileExtension === "csv") {
      const stream = Readable.from(fileBuffer.toString());
      items = await new Promise((resolve, reject) => {
        const results = [];
        stream
          .pipe(csv())
          .on("data", (data) => results.push(data))
          .on("end", () => resolve(results))
          .on("error", (error) => reject(error));
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid file format. Only CSV and Excel files are supported",
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No data found in the file",
      });
    }

    // Validate and process items
    const results = {
      total: items.length,
      success: 0,
      failed: 0,
      errors: [],
    };

    const userId = req.user ? req.user.id : null;

    for (let i = 0; i < items.length; i++) {
      const row = items[i];
      const rowNumber = i + 2; // +2 because row 1 is header and array is 0-indexed

      try {
        // Validate required fields
        if (!row.itemName && !row.item_name) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            error: "Item name is required",
            data: row,
          });
          continue;
        }

        if (!row.partnerPortalNo && !row.partner_portal_no) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            error: "Partner portal number is required",
            data: row,
          });
          continue;
        }

        if (!row.partnerNo && !row.partner_no) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            error: "Partner number is required",
            data: row,
          });
          continue;
        }

        if (!row.batchNo && !row.batch_no) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            error: "Batch number is required",
            data: row,
          });
          continue;
        }

        // Map CSV/Excel columns to database fields
        const itemData = {
          partnerPortalNo: row.partnerPortalNo || row.partner_portal_no,
          partnerNo: row.partnerNo || row.partner_no,
          batchNo: row.batchNo || row.batch_no,
          variantCode: row.variantCode || row.variant_code || null,
          itemName: row.itemName || row.item_name,
          description: row.description || null,
          itemCategoryCode: row.itemCategoryCode || row.item_category_code || null,
          baseUnitOfMeasure: row.baseUnitOfMeasure || row.base_unit_of_measure || null,
          netWeight: row.netWeight || row.net_weight || null,
          grossWeight: row.grossWeight || row.gross_weight || null,
          specifications: row.specifications || null,
          ingredients: row.ingredients || null,
          allergenDeclaration: row.allergenDeclaration || row.allergen_declaration || null,
          shelfLifeDays: row.shelfLifeDays || row.shelf_life_days || null,
          gtin: row.gtin || null,
          eanCode: row.eanCode || row.ean_code || null,
          unitPrice: row.unitPrice || row.unit_price || null,
          priceCurrencyCode: row.priceCurrencyCode || row.price_currency_code || null,
          block: row.block === "true" || row.block === true || false,
          status: row.status || "Created",
          rejectionReason: row.rejectionReason || row.rejection_reason || null,
        };

        // Check if partner exists
        const partnerExists = await ItemRequest.checkPartnerExists(itemData.partnerNo);
        if (!partnerExists) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            error: `Partner number '${itemData.partnerNo}' does not exist`,
            data: row,
          });
          continue;
        }

        // Check for duplicate
        const existing = await ItemRequest.findByKey(
          itemData.partnerPortalNo,
          itemData.partnerNo,
          itemData.batchNo
        );

        if (existing) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            error: "Item with this key already exists",
            data: row,
          });
          continue;
        }

        // Create item
        await ItemRequest.create(itemData, userId);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: rowNumber,
          error: error.message,
          data: row,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Import completed. ${results.success} items imported successfully, ${results.failed} failed`,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Download Sample Import Template ───────────────────────
// GET /api/items/import/template
const downloadImportTemplate = async (req, res) => {
  try {
    const format = req.query.format || "csv";

    const sampleData = [
      {
        partner_portal_no: "PORTAL000001",
        partner_no: "CUST001",
        batch_no: "BATCH001",
        variant_code: "",
        item_name: "Sample Product",
        description: "Sample product description",
        item_category_code: "COFFEE",
        base_unit_of_measure: "KG",
        net_weight: "1.5",
        gross_weight: "1.6",
        specifications: "Premium quality",
        ingredients: "Coffee beans, sugar",
        allergen_declaration: "None",
        shelf_life_days: "365",
        gtin: "1234567890123",
        ean_code: "1234567890123",
        unit_price: "25.50",
        price_currency_code: "AED",
        block: "false",
        status: "Created",
        rejection_reason: "",
      },
    ];

    if (format === "xlsx" || format === "xls") {
      const worksheet = XLSX.utils.json_to_sheet(sampleData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Items");

      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=items_import_template.xlsx"
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.send(buffer);
    } else {
      // CSV format
      const headers = Object.keys(sampleData[0]);
      const csvContent = [
        headers.join(","),
        sampleData.map((row) => headers.map((h) => row[h]).join(",")).join("\n"),
      ].join("\n");

      res.setHeader("Content-Disposition", "attachment; filename=items_import_template.csv");
      res.setHeader("Content-Type", "text/csv");
      res.send(csvContent);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createItemRequest,
  getAllItemRequests,
  getItemRequestById,
  getItemsByPartner,
  getItemsByPartnerPortalNo,
  getItemByKey,
  updateItemRequest,
  updateItemStatus,
  updateItemBlock,
  deleteItemRequest,
  createItemRequestfrombc,
  createItemChangeRequest,
  createPriceChange,
  getUnitOfMeasures,
  importItems,
  downloadImportTemplate,
};
