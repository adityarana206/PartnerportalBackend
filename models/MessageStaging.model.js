const { pool } = require("../config/db");

const VALID_DOCUMENT_TYPES = [" ", "Message", "Return Request", "Amendment Request", "Concern"];
const VALID_CATEGORIES = [" ", "General", "Pricing Dispute", "Quality Issue", "Delivery Concern", "Invoice Dispute", "Return Request", "Amendment Request", "Credit Request"];
const VALID_SENDER_TYPES = [" ", "Partner", "Company"];
const VALID_DIRECTIONS = [" ", "Portal-to-BC", "BC-to-Portal"];
const VALID_STATUSES = [" ", "Sent", "Delivered", "Read", "Open", "In Progress", "Resolved", "Closed", "Escalated"];

const MessageStaging = {
  VALID_DOCUMENT_TYPES,
  VALID_CATEGORIES,
  VALID_SENDER_TYPES,
  VALID_DIRECTIONS,
  VALID_STATUSES,

  async create(data) {
    const result = await pool.query(
      `INSERT INTO message_staging (
        thread_id, document_type, category, linked_doc_type, linked_doc_no,
        sender_type, sender_id, sender_name, message_text, change_details,
        message_timestamp, direction, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [
        data.threadId || null,
        data.documentType || " ",
        data.category || " ",
        data.linkedDocType || null,
        data.linkedDocNo || null,
        data.senderType || " ",
        data.senderId || null,
        data.senderName || null,
        data.messageText || null,
        data.changeDetails || null,
        data.messageTimestamp || new Date().toISOString(),
        data.direction || " ",
        data.status || " ",
      ]
    );
    return result.rows[0];
  },

  async findAll() {
    const result = await pool.query("SELECT * FROM message_staging ORDER BY message_timestamp DESC");
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query("SELECT * FROM message_staging WHERE id = $1", [id]);
    return result.rows[0] || null;
  },

  async findByPartnerNo(partnerNo) {
    const result = await pool.query(
      "SELECT * FROM message_staging WHERE sender_id = $1 ORDER BY message_timestamp DESC",
      [partnerNo]
    );
    return result.rows;
  },

  async findByThreadId(threadId) {
    const result = await pool.query(
      "SELECT * FROM message_staging WHERE thread_id = $1 ORDER BY message_timestamp ASC",
      [threadId]
    );
    return result.rows;
  },

  async updateStatus(id, status) {
    const result = await pool.query(
      "UPDATE message_staging SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *",
      [status, id]
    );
    return result.rows[0] || null;
  },

  async delete(id) {
    const result = await pool.query("DELETE FROM message_staging WHERE id=$1 RETURNING *", [id]);
    return result.rows[0] || null;
  },

  async syncToBC(id) {
    const bcService = require("../services/businessCentral.service");
    const msg = await this.findById(id);
    if (!msg) return null;

    let bcSynced = false;
    let bcError  = null;
    try {
      await bcService.createMessage({
        threadId:         msg.thread_id,
        documentType:     msg.document_type,
        category:         msg.category,
        linkedDocType:    msg.linked_doc_type  || "",
        linkedDocNo:      msg.linked_doc_no    || "",
        senderType:       msg.sender_type,
        senderId:         msg.sender_id,
        senderName:       msg.sender_name      || "",
        messageText:      msg.message_text     || "",
        changeDetails:    msg.change_details   || "",
        messageTimestamp: msg.message_timestamp,
        direction:        msg.direction,
        status:           msg.status,
      });
      bcSynced = true;
      console.log(`✅ Message ${id} synced to BC`);
    } catch (err) {
      bcError = err.response?.data || err.message;
      console.error(`⚠️  Message ${id} BC sync failed:`, bcError);
    }

    const result = await pool.query(
      `UPDATE message_staging SET bc_synced=$1, bc_error=$2 WHERE id=$3 RETURNING *`,
      [bcSynced, bcSynced ? null : JSON.stringify(bcError), id]
    );
    return { row: result.rows[0], bcSynced, bcError };
  },
};

module.exports = MessageStaging;
