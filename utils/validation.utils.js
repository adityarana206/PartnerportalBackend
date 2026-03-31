// Validate numeric DB id (integer or UUID)
const isValidId = (id) => {
  if (!id) return false;
  return /^\d+$/.test(id) || /^[0-9a-f-]{36}$/i.test(id);
};

// Strip leading/trailing whitespace from a string, return null if empty
const sanitizeString = (val) => {
  if (typeof val !== "string") return null;
  const trimmed = val.trim();
  return trimmed.length > 0 ? trimmed : null;
};

module.exports = { isValidId, sanitizeString };
