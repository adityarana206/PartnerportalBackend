const MessageStaging = require("../models/MessageStaging.model");
const { sanitizeString } = require("../utils/validation.utils");

const validate = (body, strict = true) => {
  const errors = [];
  if (strict && !body.senderId)    errors.push("senderId is required");
  if (strict && !body.messageText) errors.push("messageText is required");
  if (body.documentType && !MessageStaging.VALID_DOCUMENT_TYPES.includes(body.documentType))
    errors.push(`Invalid documentType. Allowed: ${MessageStaging.VALID_DOCUMENT_TYPES.filter(v => v.trim()).join(", ")}`);
  if (body.category && !MessageStaging.VALID_CATEGORIES.includes(body.category))
    errors.push(`Invalid category. Allowed: ${MessageStaging.VALID_CATEGORIES.filter(v => v.trim()).join(", ")}`);
  if (body.senderType && !MessageStaging.VALID_SENDER_TYPES.includes(body.senderType))
    errors.push(`Invalid senderType. Allowed: ${MessageStaging.VALID_SENDER_TYPES.filter(v => v.trim()).join(", ")}`);
  if (body.direction && !MessageStaging.VALID_DIRECTIONS.includes(body.direction))
    errors.push(`Invalid direction. Allowed: ${MessageStaging.VALID_DIRECTIONS.filter(v => v.trim()).join(", ")}`);
  if (body.status && !MessageStaging.VALID_STATUSES.includes(body.status))
    errors.push(`Invalid status. Allowed: ${MessageStaging.VALID_STATUSES.filter(v => v.trim()).join(", ")}`);
  return errors;
};

const createMessage = async (req, res) => {
  try {
    const errors = validate(req.body);
    if (errors.length) return res.status(400).json({ success: false, message: errors[0], errors });
    const message = await MessageStaging.create(req.body);
    res.status(201).json({ success: true, message: "Message created successfully", data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createMessageFromBC = async (req, res) => {
  try {
    const errors = validate(req.body, false);
    if (errors.length) return res.status(400).json({ success: false, message: errors[0], errors });
    const data = { ...req.body, threadId: req.body.threadId || `BC-${Date.now()}` };
    const message = await MessageStaging.create(data);
    res.status(201).json({ success: true, message: "Message received from BC", data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllMessages = async (req, res) => {
  try {
    const threadId  = sanitizeString(req.query.threadId);
    const partnerNo = sanitizeString(req.query.partnerNo);
    let data;
    if (threadId)       data = await MessageStaging.findByThreadId(threadId);
    else if (partnerNo) data = await MessageStaging.findByPartnerNo(partnerNo);
    else                data = await MessageStaging.findAll();
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMessageById = async (req, res) => {
  try {
    const msg = await MessageStaging.findById(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: "Message not found" });
    res.status(200).json({ success: true, data: msg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMessagesByPartner = async (req, res) => {
  try {
    const partnerNo = sanitizeString(req.params.partnerNo);
    if (!partnerNo) return res.status(400).json({ success: false, message: "Invalid partner number" });
    const data = await MessageStaging.findByPartnerNo(partnerNo);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMessagesByThread = async (req, res) => {
  try {
    const threadId = sanitizeString(req.params.threadId);
    if (!threadId) return res.status(400).json({ success: false, message: "Invalid thread ID" });
    const data = await MessageStaging.findByThreadId(threadId);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !MessageStaging.VALID_STATUSES.includes(status))
      return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${MessageStaging.VALID_STATUSES.filter(v => v.trim()).join(", ")}` });
    const updated = await MessageStaging.updateStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ success: false, message: "Message not found" });
    res.status(200).json({ success: true, message: "Status updated", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const syncMessageToBC = async (req, res) => {
  try {
    const result = await MessageStaging.syncToBC(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: "Message not found" });
    if (!result.bcSynced)
      return res.status(502).json({ success: false, message: "BC sync failed", error: result.bcError, data: result.row });
    res.status(200).json({ success: true, message: "Message synced to Business Central", data: result.row });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const deleted = await MessageStaging.delete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Message not found" });
    res.status(200).json({ success: true, message: "Message deleted", data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createMessage,
  createMessageFromBC,
  getAllMessages,
  getMessageById,
  getMessagesByPartner,
  getMessagesByThread,
  updateMessageStatus,
  syncMessageToBC,
  deleteMessage,
};
