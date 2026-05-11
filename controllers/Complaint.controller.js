const Complaint = require("../models/Complaint.model");
const NoSeries = require("../models/NoSeris.model");
const { sanitizeString } = require("../utils/validation.utils");

const validate = (body, strict = true) => {
  const errors = [];
  if (strict && !body.messageText) errors.push("messageText is required");
  if (body.documentType && !Complaint.VALID_DOCUMENT_TYPES.includes(body.documentType))
    errors.push(`Invalid documentType. Allowed: ${Complaint.VALID_DOCUMENT_TYPES.filter(v => v.trim()).join(", ")}`);
  if (body.category && !Complaint.VALID_CATEGORIES.includes(body.category))
    errors.push(`Invalid category. Allowed: ${Complaint.VALID_CATEGORIES.filter(v => v.trim()).join(", ")}`);
  if (body.senderType && !Complaint.VALID_SENDER_TYPES.includes(body.senderType))
    errors.push(`Invalid senderType. Allowed: ${Complaint.VALID_SENDER_TYPES.filter(v => v.trim()).join(", ")}`);
  if (body.partnerType && !Complaint.VALID_PARTNER_TYPES.includes(body.partnerType))
    errors.push(`Invalid partnerType. Allowed: ${Complaint.VALID_PARTNER_TYPES.filter(v => v.trim()).join(", ")}`);
  if (body.direction && !Complaint.VALID_DIRECTIONS.includes(body.direction))
    errors.push(`Invalid direction. Allowed: ${Complaint.VALID_DIRECTIONS.filter(v => v.trim()).join(", ")}`);
  if (body.status && !Complaint.VALID_STATUSES.includes(body.status))
    errors.push(`Invalid status. Allowed: ${Complaint.VALID_STATUSES.filter(v => v.trim()).join(", ")}`);
  return errors;
};

const createComplaint = async (req, res) => {
  try {
    const errors = validate(req.body);
    if (errors.length) return res.status(400).json({ success: false, message: errors[0], errors });

    const threadId = await NoSeries.getNextNumberByCode("COMP");
    const user = req.user || {};
    const role = user.role || "";
    const partnerType = role.toLowerCase().includes("vendor") ? "Vendor"
                      : role.toLowerCase().includes("customer") ? "Customer"
                      : req.body.partnerType || " ";

    const data = {
      ...req.body,
      threadId,
      senderId:   user.refNo || req.body.senderId || null,
      senderName: user.name || req.body.senderName || null,
      partnerType,
    };

    const complaint = await Complaint.create(data);

    // ─── Auto-sync to BC ───────────────────────────────────
    const { row, bcSynced, bcError } = await Complaint.syncToBC(complaint.id);

    res.status(201).json({
      success: true,
      message: bcSynced ? "Complaint created and synced to BC" : "Complaint created (BC sync failed)",
      data: row,
      bcSynced,
      ...(bcError && { bcError }),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createComplaintFromBC = async (req, res) => {
  try {
    const errors = validate(req.body, false);
    if (errors.length) return res.status(400).json({ success: false, message: errors[0], errors });
    const data = { ...req.body, threadId: req.body.threadId || `BC-${Date.now()}` };
    const complaint = await Complaint.create(data);
    res.status(201).json({ success: true, message: "Complaint received from BC", data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllComplaints = async (req, res) => {
  try {
    const threadId  = sanitizeString(req.query.threadId);
    const partnerNo = sanitizeString(req.query.partnerNo);
    let data;
    if (threadId)       data = await Complaint.findByThreadId(threadId);
    else if (partnerNo) data = await Complaint.findByPartnerNo(partnerNo);
    else                data = await Complaint.findAll();
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });
    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getComplaintsByPartner = async (req, res) => {
  try {
    const partnerNo = sanitizeString(req.params.partnerNo);
    if (!partnerNo) return res.status(400).json({ success: false, message: "Invalid partner number" });
    const data = await Complaint.findByPartnerNo(partnerNo);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getComplaintsByThread = async (req, res) => {
  try {
    const threadId = sanitizeString(req.params.threadId);
    if (!threadId) return res.status(400).json({ success: false, message: "Invalid thread ID" });
    const data = await Complaint.findByThreadId(threadId);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !Complaint.VALID_STATUSES.includes(status))
      return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${Complaint.VALID_STATUSES.filter(v => v.trim()).join(", ")}` });
    const updated = await Complaint.updateStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ success: false, message: "Complaint not found" });
    res.status(200).json({ success: true, message: "Status updated", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const syncComplaintToBC = async (req, res) => {
  try {
    const result = await Complaint.syncToBC(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: "Complaint not found" });
    if (!result.bcSynced)
      return res.status(502).json({ success: false, message: "BC sync failed", error: result.bcError, data: result.row });
    res.status(200).json({ success: true, message: "Complaint synced to Business Central", data: result.row });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteComplaint = async (req, res) => {
  try {
    const deleted = await Complaint.delete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Complaint not found" });
    res.status(200).json({ success: true, message: "Complaint deleted", data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createComplaint,
  createComplaintFromBC,
  getAllComplaints,
  getComplaintById,
  getComplaintsByPartner,
  getComplaintsByThread,
  updateComplaintStatus,
  syncComplaintToBC,
  deleteComplaint,
};
