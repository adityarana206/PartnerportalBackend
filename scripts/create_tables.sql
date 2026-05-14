-- ============================================================
-- Partner Portal — Full Schema (PostgreSQL)
-- Run this once on a fresh database to create all tables.
-- ============================================================

-- ─── Core Auth ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id                    SERIAL PRIMARY KEY,
  ref_no                VARCHAR(50),
  name                  VARCHAR(255) NOT NULL,
  name2                 VARCHAR(255),
  address               VARCHAR(255),
  address2              VARCHAR(255),
  city                  VARCHAR(100),
  post_code             VARCHAR(20),
  country_region_code   VARCHAR(10),
  phone_no              VARCHAR(50),
  email                 VARCHAR(255) UNIQUE,
  vat_registration_no   VARCHAR(50),
  currency_code         VARCHAR(10),
  payment_terms_code    VARCHAR(50),
  password              VARCHAR(255),
  role                  VARCHAR(50),
  vendor_name           VARCHAR(255),
  location_code         VARCHAR(50),
  created_at            TIMESTAMP DEFAULT NOW(),
  updated_at            TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS login_users (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER REFERENCES users(id) ON DELETE CASCADE,
  partner_no   VARCHAR(50),
  email        VARCHAR(255) UNIQUE NOT NULL,
  password     VARCHAR(255) NOT NULL,
  role         VARCHAR(50) NOT NULL,
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);

-- ─── Permissions ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS screens (
  id          SERIAL PRIMARY KEY,
  screen_name VARCHAR(255) UNIQUE NOT NULL,
  screen_code VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
  id         SERIAL PRIMARY KEY,
  screen_id  INTEGER NOT NULL REFERENCES screens(id) ON DELETE CASCADE,
  role       VARCHAR(50) NOT NULL,
  can_read   BOOLEAN DEFAULT false,
  can_write  BOOLEAN DEFAULT false,
  can_modify BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (screen_id, role)
);

CREATE TABLE IF NOT EXISTS user_permissions (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  screen_id  INTEGER NOT NULL REFERENCES screens(id) ON DELETE CASCADE,
  can_read   BOOLEAN DEFAULT false,
  can_write  BOOLEAN DEFAULT false,
  can_modify BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, screen_id)
);

CREATE TABLE IF NOT EXISTS permission_groups (
  id          SERIAL PRIMARY KEY,
  group_name  VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_permissions (
  id         SERIAL PRIMARY KEY,
  group_id   INTEGER NOT NULL REFERENCES permission_groups(id) ON DELETE CASCADE,
  screen_id  INTEGER NOT NULL REFERENCES screens(id) ON DELETE CASCADE,
  can_read   BOOLEAN DEFAULT false,
  can_write  BOOLEAN DEFAULT false,
  can_modify BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (group_id, screen_id)
);

CREATE TABLE IF NOT EXISTS user_group_assignments (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id    INTEGER NOT NULL REFERENCES permission_groups(id) ON DELETE CASCADE,
  assigned_by INTEGER,
  assigned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, group_id)
);

-- ─── BC User Registration ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS bc_user_registrations (
  id                        SERIAL PRIMARY KEY,
  partner_type              VARCHAR(50)  DEFAULT 'Customer',
  reg_type                  VARCHAR(50)  DEFAULT 'Create',
  scope                     VARCHAR(100) DEFAULT 'Current_x0020_Company',
  status                    VARCHAR(50)  DEFAULT 'Draft',
  partner_no                VARCHAR(50),
  central_partner_no        VARCHAR(50),
  result_partner_no         VARCHAR(50),
  requester_user_id         VARCHAR(100),
  business_justification    TEXT,
  name                      VARCHAR(255),
  name2                     VARCHAR(255),
  address                   VARCHAR(255),
  address2                  VARCHAR(255),
  city                      VARCHAR(100),
  post_code                 VARCHAR(20),
  country_region_code       VARCHAR(10),
  phone_no                  VARCHAR(50),
  email                     VARCHAR(255),
  vat_registration_no       VARCHAR(50),
  currency_code             VARCHAR(10),
  payment_terms_code        VARCHAR(50),
  payment_method_code       VARCHAR(50),
  partner_posting_group     VARCHAR(50),
  gen_bus_posting_group     VARCHAR(50),
  vat_bus_posting_group     VARCHAR(50),
  partner_email             VARCHAR(255),
  trade_name                VARCHAR(255),
  trade_license_number      VARCHAR(100),
  trade_license_expiry_date DATE,
  company_reg_number        VARCHAR(100),
  entity_type               VARCHAR(100),
  country_of_incorporation  VARCHAR(100),
  place_of_registration     VARCHAR(100),
  website                   VARCHAR(255),
  partner_category          VARCHAR(100),
  created_at                TIMESTAMP DEFAULT NOW(),
  updated_at                TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bc_user_registration_contacts (
  id              SERIAL PRIMARY KEY,
  registration_id INTEGER NOT NULL REFERENCES bc_user_registrations(id) ON DELETE CASCADE,
  line_no         INTEGER,
  full_name       VARCHAR(255),
  designation     VARCHAR(100),
  mobile_number   VARCHAR(50),
  email_address   VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS bc_user_registration_banks (
  id              SERIAL PRIMARY KEY,
  registration_id INTEGER NOT NULL REFERENCES bc_user_registrations(id) ON DELETE CASCADE,
  line_no         INTEGER,
  bank_code       VARCHAR(50),
  name            VARCHAR(255),
  bank_branch_no  VARCHAR(50),
  bank_account_no VARCHAR(100),
  iban            VARCHAR(50),
  swift_code      VARCHAR(20),
  currency_code   VARCHAR(10),
  is_primary      BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS bc_user_registration_documents (
  id              SERIAL PRIMARY KEY,
  registration_id INTEGER NOT NULL REFERENCES bc_user_registrations(id) ON DELETE CASCADE,
  name            VARCHAR(255),
  url             TEXT,
  size            BIGINT  DEFAULT 0,
  doc_type        VARCHAR(100),
  uploaded_at     TIMESTAMP DEFAULT NOW()
);

-- ─── Lookup / Master Tables ───────────────────────────────────

CREATE TABLE IF NOT EXISTS countries (
  id            SERIAL PRIMARY KEY,
  code          VARCHAR(10) UNIQUE NOT NULL,
  name          VARCHAR(255) NOT NULL,
  currency_code VARCHAR(10),
  is_active     BOOLEAN DEFAULT false,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vat_masters (
  id           SERIAL PRIMARY KEY,
  vat_code     VARCHAR(50) UNIQUE NOT NULL,
  description  VARCHAR(255),
  vat_percent  NUMERIC(10,4) DEFAULT 0,
  vat_type     VARCHAR(50),
  is_inclusive BOOLEAN DEFAULT false,
  status       VARCHAR(50) DEFAULT 'Active',
  created_by   INTEGER,
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS unit_of_measures (
  id                         SERIAL PRIMARY KEY,
  code                       VARCHAR(20) UNIQUE NOT NULL,
  description                VARCHAR(255),
  international_standard_code VARCHAR(20),
  created_at                 TIMESTAMP DEFAULT NOW(),
  updated_at                 TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_methods (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255),
  code        VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(255),
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_terms (
  id            SERIAL PRIMARY KEY,
  code          VARCHAR(50) UNIQUE NOT NULL,
  description   VARCHAR(255),
  due_days      INTEGER DEFAULT 0,
  discount_days INTEGER DEFAULT 0,
  discount_pct  NUMERIC(10,4) DEFAULT 0.0,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS no_series (
  id              SERIAL PRIMARY KEY,
  code            VARCHAR(50) UNIQUE NOT NULL,
  description     VARCHAR(255),
  starting_no     INTEGER DEFAULT 1,
  ending_no       INTEGER DEFAULT 999999,
  last_no_used    INTEGER DEFAULT 0,
  warning_no      INTEGER,
  increment_by_no INTEGER DEFAULT 1,
  allow_gaps      BOOLEAN DEFAULT false,
  date_order      BOOLEAN DEFAULT false,
  created_by      INTEGER,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS post_codes (
  id           SERIAL PRIMARY KEY,
  code         VARCHAR(20),
  city         VARCHAR(100),
  country_code VARCHAR(10),
  county       VARCHAR(100),
  system_id    VARCHAR(100),
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW(),
  UNIQUE (code, country_code)
);

CREATE TABLE IF NOT EXISTS partner_location_links (
  id                   SERIAL PRIMARY KEY,
  system_id            VARCHAR(100),
  partner_type         VARCHAR(50),
  partner_no           VARCHAR(50),
  description          VARCHAR(255),
  address_code         VARCHAR(50),
  address_name         VARCHAR(255),
  location_code        VARCHAR(50),
  name                 VARCHAR(255),
  address              VARCHAR(255),
  address2             VARCHAR(255),
  city                 VARCHAR(100),
  post_code            VARCHAR(20),
  country_region_code  VARCHAR(10),
  contact              VARCHAR(255),
  phone_no             VARCHAR(50),
  fax_no               VARCHAR(50),
  e_mail               VARCHAR(255),
  home_page            VARCHAR(255),
  county               VARCHAR(100),
  use_as_in_transit    BOOLEAN DEFAULT false,
  is_default           BOOLEAN DEFAULT false,
  blocked              BOOLEAN DEFAULT false,
  created_by           INTEGER,
  created_at           TIMESTAMP DEFAULT NOW(),
  updated_at           TIMESTAMP DEFAULT NOW()
);

-- ─── Contacts ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS contacts (
  id                    SERIAL PRIMARY KEY,
  contact_no            VARCHAR(50),
  portal_contact_no     VARCHAR(50),
  contact_name          VARCHAR(255) NOT NULL,
  email                 VARCHAR(255),
  phone_no              VARCHAR(50),
  mobile_phone_no       VARCHAR(50),
  company_no            VARCHAR(50),
  company_name          VARCHAR(255),
  portal_user           BOOLEAN DEFAULT false,
  portal_admin          BOOLEAN DEFAULT false,
  partner_type          VARCHAR(50),
  partner_no            VARCHAR(50),
  ship_to_code          VARCHAR(50),
  vendor_location_code  VARCHAR(50),
  location_code         VARCHAR(50),
  address               VARCHAR(255),
  address2              VARCHAR(255),
  city                  VARCHAR(100),
  post_code             VARCHAR(20),
  country_region_code   VARCHAR(10),
  job_title             VARCHAR(100),
  language_code         VARCHAR(10),
  department            VARCHAR(100),
  fax_no                VARCHAR(50),
  home_page             VARCHAR(255),
  sync_status           VARCHAR(50) DEFAULT 'Pending',
  last_synced_date_time TIMESTAMP,
  created_by            INTEGER,
  created_at            TIMESTAMP DEFAULT NOW(),
  updated_at            TIMESTAMP DEFAULT NOW()
);

-- ─── Messages / Complaints ────────────────────────────────────

CREATE TABLE IF NOT EXISTS complaints (
  id                SERIAL PRIMARY KEY,
  thread_id         VARCHAR(100),
  document_type     VARCHAR(50)  DEFAULT ' ',
  category          VARCHAR(100) DEFAULT ' ',
  linked_doc_type   VARCHAR(50),
  linked_doc_no     VARCHAR(100),
  sender_type       VARCHAR(50)  DEFAULT ' ',
  partner_type      VARCHAR(50)  DEFAULT ' ',
  sender_id         VARCHAR(100),
  sender_name       VARCHAR(255),
  message_text      TEXT,
  change_details    TEXT,
  message_timestamp TIMESTAMP    DEFAULT NOW(),
  direction         VARCHAR(50)  DEFAULT ' ',
  status            VARCHAR(50)  DEFAULT ' ',
  bc_synced         BOOLEAN      DEFAULT false,
  bc_error          TEXT,
  created_at        TIMESTAMP    DEFAULT NOW(),
  updated_at        TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS message_staging (
  id                SERIAL PRIMARY KEY,
  thread_id         VARCHAR(100),
  document_type     VARCHAR(50)  DEFAULT ' ',
  category          VARCHAR(100) DEFAULT ' ',
  linked_doc_type   VARCHAR(50),
  linked_doc_no     VARCHAR(100),
  sender_type       VARCHAR(50)  DEFAULT ' ',
  partner_type      VARCHAR(50)  DEFAULT 'Vendor',
  sender_id         VARCHAR(100),
  sender_name       VARCHAR(255),
  message_text      TEXT,
  change_details    TEXT,
  message_timestamp TIMESTAMP    DEFAULT NOW(),
  direction         VARCHAR(50)  DEFAULT ' ',
  status            VARCHAR(50)  DEFAULT ' ',
  bc_synced         BOOLEAN      DEFAULT false,
  bc_error          TEXT,
  created_at        TIMESTAMP    DEFAULT NOW(),
  updated_at        TIMESTAMP    DEFAULT NOW()
);

-- ─── Item Requests ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS item_requests (
  id                   SERIAL PRIMARY KEY,
  partner_portal_no    VARCHAR(100),
  partner_no           VARCHAR(50),
  batch_no             VARCHAR(100),
  variant_code         VARCHAR(50),
  item_name            VARCHAR(255) NOT NULL,
  description          TEXT,
  item_category_code   VARCHAR(50),
  base_unit_of_measure VARCHAR(20),
  net_weight           NUMERIC(15,4),
  gross_weight         NUMERIC(15,4),
  specifications       TEXT,
  ingredients          TEXT,
  allergen_declaration TEXT,
  shelf_life_days      INTEGER,
  gtin                 VARCHAR(50),
  ean_code             VARCHAR(50),
  unit_price           NUMERIC(15,4),
  price_currency_code  VARCHAR(10),
  block                BOOLEAN DEFAULT false,
  status               VARCHAR(50) DEFAULT 'Created',
  rejection_reason     TEXT,
  created_by           INTEGER,
  created_at           TIMESTAMP DEFAULT NOW(),
  updated_at           TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_item_requests (
  id                   SERIAL PRIMARY KEY,
  batch_no             VARCHAR(100) UNIQUE,
  item_name            VARCHAR(255) NOT NULL,
  description          TEXT,
  item_category_code   VARCHAR(50),
  base_unit_of_measure VARCHAR(20),
  purch_unit_of_measure VARCHAR(20),
  net_weight           NUMERIC(15,4),
  gross_weight         NUMERIC(15,4),
  specifications       TEXT,
  ingredients          TEXT,
  allergen_declaration TEXT,
  shelf_life_days      INTEGER DEFAULT 0,
  gtin                 VARCHAR(50),
  ean_code             VARCHAR(50),
  upc_code             VARCHAR(50),
  purchase_unit_price  NUMERIC(15,4) DEFAULT 0,
  price_currency_code  VARCHAR(10) DEFAULT 'AED',
  partner_no           VARCHAR(50),
  status               VARCHAR(50) DEFAULT 'Submitted',
  rejection_reason     TEXT,
  price_effective_date DATE,
  created_by           INTEGER,
  created_at           TIMESTAMP DEFAULT NOW(),
  updated_at           TIMESTAMP DEFAULT NOW()
);

-- ─── Purchase Prices ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS purchase_prices (
  id                   SERIAL PRIMARY KEY,
  batch_no             VARCHAR(100),
  item_name            VARCHAR(255),
  description          TEXT,
  item_category_code   VARCHAR(50),
  base_unit_of_measure VARCHAR(20),
  net_weight           NUMERIC(15,4),
  gross_weight         NUMERIC(15,4),
  specifications       TEXT,
  ingredients          TEXT,
  allergen_declaration TEXT,
  shelf_life_days      INTEGER,
  gtin                 VARCHAR(50),
  ean_code             VARCHAR(50),
  new_price            NUMERIC(15,4) NOT NULL,
  old_price            NUMERIC(15,4) DEFAULT 0,
  effective_date       DATE,
  ending_date          DATE,
  currency_code        VARCHAR(10) DEFAULT 'AED',
  unit_of_measure_code VARCHAR(20),
  minimum_quantity     NUMERIC(15,4) DEFAULT 1,
  partner_no           VARCHAR(50),
  status               VARCHAR(50) DEFAULT '_x0020_',
  rejection_reason     TEXT,
  created_by           INTEGER,
  created_at           TIMESTAMP DEFAULT NOW(),
  updated_at           TIMESTAMP DEFAULT NOW()
);

-- ─── Invoices ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS invoices (
  id                 SERIAL PRIMARY KEY,
  invoice_type       VARCHAR(50),
  invoice_no         VARCHAR(100) UNIQUE,
  invoice_date       DATE,
  due_date           DATE,
  partner_no         VARCHAR(50),
  partner_type       VARCHAR(50),
  total_amount       NUMERIC(15,4) DEFAULT 0,
  currency_code      VARCHAR(10),
  outstanding_amount NUMERIC(15,4) DEFAULT 0,
  status             VARCHAR(50),
  bc_invoice_no      VARCHAR(100),
  linked_order_no    VARCHAR(100),
  location_code      VARCHAR(50),
  created_by         INTEGER,
  created_at         TIMESTAMP DEFAULT NOW(),
  updated_at         TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_lines (
  id                   SERIAL PRIMARY KEY,
  invoice_id           INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  line_no              INTEGER,
  item_no              VARCHAR(50),
  description          VARCHAR(255),
  line_amount          NUMERIC(15,4) DEFAULT 0,
  line_discount        NUMERIC(10,4) DEFAULT 0,
  line_discount_amount NUMERIC(15,4) DEFAULT 0,
  quantity             NUMERIC(15,4) DEFAULT 0,
  unit_price           NUMERIC(15,4) DEFAULT 0,
  unit_of_measure_code VARCHAR(20),
  vat                  NUMERIC(10,4) DEFAULT 0,
  vat_amount           NUMERIC(15,4) DEFAULT 0,
  variant_code         VARCHAR(50)
);

-- ─── Purchase Invoices ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS purchase_invoices (
  id                 SERIAL PRIMARY KEY,
  invoice_type       VARCHAR(50),
  invoice_no         VARCHAR(100) UNIQUE,
  invoice_date       DATE,
  due_date           DATE,
  partner_no         VARCHAR(50),
  partner_type       VARCHAR(50),
  total_amount       NUMERIC(15,4) DEFAULT 0,
  currency_code      VARCHAR(10),
  outstanding_amount NUMERIC(15,4) DEFAULT 0,
  status             VARCHAR(50),
  bc_invoice_no      VARCHAR(100),
  linked_order_no    VARCHAR(100),
  vendor_invoice_no  VARCHAR(100),
  location_code      VARCHAR(50),
  created_by         INTEGER,
  created_at         TIMESTAMP DEFAULT NOW(),
  updated_at         TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_invoice_lines (
  id                   SERIAL PRIMARY KEY,
  invoice_id           INTEGER NOT NULL REFERENCES purchase_invoices(id) ON DELETE CASCADE,
  line_no              INTEGER,
  item_no              VARCHAR(50),
  description          VARCHAR(255),
  line_amount          NUMERIC(15,4) DEFAULT 0,
  line_discount        NUMERIC(10,4) DEFAULT 0,
  line_discount_amount NUMERIC(15,4) DEFAULT 0,
  quantity             NUMERIC(15,4) DEFAULT 0,
  unit_price           NUMERIC(15,4) DEFAULT 0,
  unit_of_measure_code VARCHAR(20),
  vat                  NUMERIC(10,4) DEFAULT 0,
  vat_amount           NUMERIC(15,4) DEFAULT 0,
  variant_code         VARCHAR(50)
);

-- ─── Purchase Orders ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS purchase_orders (
  id                       SERIAL PRIMARY KEY,
  order_type               VARCHAR(50),
  no                       VARCHAR(100),
  partner_no               VARCHAR(50),
  partner_type             VARCHAR(50),
  ship_to_code             VARCHAR(50),
  location_code            VARCHAR(50),
  order_date               DATE,
  requested_delivery_date  DATE,
  currency_code            VARCHAR(10),
  external_document_no     VARCHAR(100),
  status                   VARCHAR(50),
  direction                VARCHAR(50),
  submitted_date           DATE,
  portal_document_no       VARCHAR(100),
  portal_status            VARCHAR(50),
  created_by               INTEGER,
  created_at               TIMESTAMP DEFAULT NOW(),
  updated_at               TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_order_lines (
  id                    SERIAL PRIMARY KEY,
  order_id              INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  line_document_no      VARCHAR(100),
  line_no               INTEGER,
  item_no               VARCHAR(50),
  description           VARCHAR(255),
  quantity              NUMERIC(15,4) DEFAULT 0,
  unit_of_measure_code  VARCHAR(20),
  unit_price            NUMERIC(15,4) DEFAULT 0,
  line_discount_percent NUMERIC(10,4) DEFAULT 0,
  line_discount_amount  NUMERIC(15,4) DEFAULT 0,
  line_amount           NUMERIC(15,4) DEFAULT 0,
  location_code         VARCHAR(50),
  delivery_date         DATE,
  variant_code          VARCHAR(50),
  vat_code              VARCHAR(50),
  vat_percent           NUMERIC(10,4) DEFAULT 0,
  vat_amount            NUMERIC(15,4) DEFAULT 0,
  line_amount_incl_vat  NUMERIC(15,4) DEFAULT 0,
  shipped_qty           NUMERIC(15,4) DEFAULT 0,
  created_at            TIMESTAMP DEFAULT NOW(),
  updated_at            TIMESTAMP DEFAULT NOW()
);

-- ─── Purchase Receipts ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS purchase_receipts (
  id                      SERIAL PRIMARY KEY,
  delivery_type           VARCHAR(50),
  partner_no              VARCHAR(50),
  partner_type            VARCHAR(50),
  linked_order_no         VARCHAR(100),
  shipment_no             VARCHAR(100) UNIQUE,
  tracking_no             VARCHAR(100),
  carrier_code            VARCHAR(50),
  shipment_date           DATE,
  expected_delivery_date  DATE,
  location_code           VARCHAR(50),
  ship_to_code            VARCHAR(50),
  status                  VARCHAR(50) DEFAULT 'Processed',
  direction               VARCHAR(50),
  bc_document_no          VARCHAR(100),
  created_by              INTEGER,
  created_at              TIMESTAMP DEFAULT NOW(),
  updated_at              TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_receipt_lines (
  id                   SERIAL PRIMARY KEY,
  receipt_id           INTEGER NOT NULL REFERENCES purchase_receipts(id) ON DELETE CASCADE,
  line_no              INTEGER,
  item_no              VARCHAR(50),
  description          VARCHAR(255),
  expiration_date      DATE,
  lot_no               VARCHAR(100),
  ordered_quantity     NUMERIC(15,4) DEFAULT 0,
  remaining_quantity   NUMERIC(15,4) DEFAULT 0,
  serial_no            VARCHAR(100),
  shipped_quantity     NUMERIC(15,4) DEFAULT 0,
  unit_of_measure_code VARCHAR(20),
  variant_code         VARCHAR(50)
);

-- ─── Sales Orders ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sales_orders (
  id                      SERIAL PRIMARY KEY,
  order_type              VARCHAR(50),
  partner_no              VARCHAR(50),
  partner_type            VARCHAR(50),
  ship_to_code            VARCHAR(50),
  location_code           VARCHAR(50),
  order_date              DATE,
  requested_delivery_date DATE,
  currency_code           VARCHAR(10),
  external_document_no    VARCHAR(100),
  document_no             VARCHAR(100),
  status                  VARCHAR(50) DEFAULT 'Confirmed',
  direction               VARCHAR(50),
  submitted_date          DATE,
  partner_order_no        VARCHAR(100),
  partner_order_status    VARCHAR(50) DEFAULT 'Confirmed',
  created_by              INTEGER,
  created_at              TIMESTAMP DEFAULT NOW(),
  updated_at              TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales_order_lines (
  id                    SERIAL PRIMARY KEY,
  order_id              INTEGER NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
  line_no               INTEGER,
  item_no               VARCHAR(50),
  description           VARCHAR(255),
  quantity              NUMERIC(15,4) DEFAULT 0,
  unit_of_measure_code  VARCHAR(20),
  unit_price            NUMERIC(15,4) DEFAULT 0,
  line_discount_percent NUMERIC(10,4) DEFAULT 0,
  line_discount_amount  NUMERIC(15,4) DEFAULT 0,
  line_amount           NUMERIC(15,4) DEFAULT 0,
  line_amount_excl_vat  NUMERIC(15,4) DEFAULT 0,
  line_amount_incl_vat  NUMERIC(15,4) DEFAULT 0,
  vat_code              VARCHAR(50),
  vat_amount            NUMERIC(15,4) DEFAULT 0,
  vat_percent           NUMERIC(10,4) DEFAULT 0,
  location_code         VARCHAR(50),
  delivery_date         DATE,
  variant_code          VARCHAR(50),
  line_document_no      VARCHAR(100),
  created_at            TIMESTAMP DEFAULT NOW(),
  updated_at            TIMESTAMP DEFAULT NOW()
);

-- ─── Sales Shipments ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sales_shipments (
  id                     SERIAL PRIMARY KEY,
  portal_document_no     VARCHAR(100),
  shipment_no            VARCHAR(100),
  delivery_type          VARCHAR(50) DEFAULT 'Shipment',
  partner_no             VARCHAR(50),
  partner_type           VARCHAR(50) DEFAULT 'Customer',
  linked_order_no        VARCHAR(100),
  tracking_no            VARCHAR(100),
  carrier_code           VARCHAR(50),
  shipment_date          DATE,
  expected_delivery_date DATE,
  location_code          VARCHAR(50),
  ship_to_code           VARCHAR(50),
  status                 VARCHAR(50) DEFAULT 'Inserted',
  direction              VARCHAR(100),
  bc_document_no         VARCHAR(100),
  created_at             TIMESTAMP DEFAULT NOW(),
  updated_at             TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales_shipment_lines (
  id                   SERIAL PRIMARY KEY,
  shipment_id          INTEGER NOT NULL REFERENCES sales_shipments(id) ON DELETE CASCADE,
  line_no              INTEGER,
  item_no              VARCHAR(50),
  description          VARCHAR(255),
  expiration_date      DATE,
  lot_no               VARCHAR(100),
  ordered_quantity     NUMERIC(15,4) DEFAULT 0,
  remaining_quantity   NUMERIC(15,4) DEFAULT 0,
  serial_no            VARCHAR(100),
  shipped_quantity     NUMERIC(15,4) DEFAULT 0,
  unit_of_measure_code VARCHAR(20),
  variant_code         VARCHAR(50)
);

-- ─── Delivery Orders ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS delivery_orders (
  id                     SERIAL PRIMARY KEY,
  delivery_order_no      VARCHAR(100),
  partner_no             VARCHAR(50),
  partner_name           VARCHAR(255),
  partner_type           VARCHAR(50),
  erp_po_nos             TEXT[] DEFAULT '{}',
  delivery_date_time     TIMESTAMP,
  delivery_type          VARCHAR(50),
  direction              VARCHAR(50),
  shipment_date          DATE,
  expected_delivery_date DATE,
  actual_delivery_date   DATE,
  location_code          VARCHAR(50),
  warehouse_location     VARCHAR(100),
  carrier_name           VARCHAR(100),
  transport_mode         VARCHAR(50),
  total_amount           NUMERIC(15,4),
  currency_code          VARCHAR(10),
  ship_address           VARCHAR(255),
  ship_city              VARCHAR(100),
  ship_state             VARCHAR(100),
  ship_post_code         VARCHAR(20),
  ship_country_code      VARCHAR(10),
  status                 VARCHAR(50) DEFAULT 'Created',
  remarks                TEXT,
  bc_synced              BOOLEAN DEFAULT false,
  bc_error               TEXT,
  created_by             INTEGER,
  created_at             TIMESTAMP DEFAULT NOW(),
  updated_at             TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS delivery_order_lines (
  id                SERIAL PRIMARY KEY,
  delivery_order_id INTEGER NOT NULL REFERENCES delivery_orders(id) ON DELETE CASCADE,
  line_no           INTEGER,
  po_id             INTEGER,
  po_line_id        INTEGER,
  po_no             VARCHAR(100),
  po_line_no        INTEGER,
  po_date_time      TIMESTAMP,
  po_total_amount   NUMERIC(15,4),
  item_no           VARCHAR(50),
  variant_code      VARCHAR(50),
  description       VARCHAR(255),
  order_qty         NUMERIC(15,4) DEFAULT 0,
  ordered_quantity  NUMERIC(15,4) DEFAULT 0,
  to_be_shipped     NUMERIC(15,4) DEFAULT 0,
  shipped_quantity  NUMERIC(15,4) DEFAULT 0,
  remaining         NUMERIC(15,4) DEFAULT 0,
  remaining_quantity NUMERIC(15,4) DEFAULT 0,
  unit_of_measure   VARCHAR(20) DEFAULT 'PCS',
  unit_price        NUMERIC(15,4),
  lot_no            VARCHAR(100),
  serial_no         VARCHAR(100),
  expiration_date   DATE,
  created_at        TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS delivery_order_documents (
  id                SERIAL PRIMARY KEY,
  delivery_order_id INTEGER NOT NULL REFERENCES delivery_orders(id) ON DELETE CASCADE,
  name              VARCHAR(255),
  url               TEXT,
  size              BIGINT DEFAULT 0,
  doc_type          VARCHAR(100),
  uploaded_at       TIMESTAMP DEFAULT NOW()
);

-- ─── Payments ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payments (
  id                   SERIAL PRIMARY KEY,
  payment_number       VARCHAR(100),
  invoice_id           INTEGER,
  invoice_no           VARCHAR(100),
  order_no             VARCHAR(100),
  partner_no           VARCHAR(50),
  amount               NUMERIC(15,4) DEFAULT 0,
  amount_lcy           NUMERIC(15,4),
  remaining_amount     NUMERIC(15,4),
  payment_date         DATE,
  due_date             DATE,
  posting_date         DATE,
  document_date        DATE,
  currency_code        VARCHAR(10),
  method               VARCHAR(50),
  reference_no         VARCHAR(100),
  status               VARCHAR(50) DEFAULT 'Pending',
  description          TEXT,
  transaction_type     VARCHAR(50),
  document_type        VARCHAR(50),
  document_no          VARCHAR(100),
  vendor_name          VARCHAR(255),
  customer_name        VARCHAR(255),
  applies_to_doc_no    VARCHAR(100),
  applies_to_doc_type  VARCHAR(50),
  open                 BOOLEAN,
  closed               BOOLEAN,
  closed_by_entry_no   VARCHAR(100),
  closed_at_date       DATE,
  bal_account_no       VARCHAR(100),
  created_by           INTEGER,
  created_at           TIMESTAMP DEFAULT NOW(),
  updated_at           TIMESTAMP DEFAULT NOW(),
  UNIQUE (payment_number, partner_no)
);

-- ─── Locations ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS locations (
  id                  SERIAL PRIMARY KEY,
  system_id           VARCHAR(100) UNIQUE NOT NULL,
  code                VARCHAR(50)  UNIQUE NOT NULL,
  name                VARCHAR(255),
  address             VARCHAR(255),
  address2            VARCHAR(255),
  city                VARCHAR(100),
  post_code           VARCHAR(20),
  country_region_code VARCHAR(10),
  phone_no            VARCHAR(50),
  fax_no              VARCHAR(50),
  contact             VARCHAR(100),
  e_mail              VARCHAR(100),
  home_page           VARCHAR(255),
  county              VARCHAR(100),
  use_as_in_transit   BOOLEAN DEFAULT false,
  created_at          TIMESTAMP DEFAULT NOW(),
  updated_at          TIMESTAMP DEFAULT NOW()
);

-- ─── Item Categories ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS item_categories (
  id          SERIAL PRIMARY KEY,
  code        VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(255),
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- ─── Item Change Requests ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS item_change_requests (
  id                 SERIAL PRIMARY KEY,
  item_no            VARCHAR(50),
  change_type        VARCHAR(100),
  change_description TEXT,
  old_value          TEXT,
  new_value          TEXT,
  partner_no         VARCHAR(50),
  partner_type       VARCHAR(50) DEFAULT '_x0020_',
  status             VARCHAR(50) DEFAULT '_x0020_',
  rejection_reason   TEXT,
  submitted_date     TIMESTAMP,
  approved_date      TIMESTAMP,
  created_by         INTEGER,
  created_at         TIMESTAMP DEFAULT NOW(),
  updated_at         TIMESTAMP DEFAULT NOW()
);

-- ─── Registration Invites ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS registration_invites (
  id         SERIAL PRIMARY KEY,
  token      VARCHAR(255) UNIQUE NOT NULL,
  role       VARCHAR(50) NOT NULL,
  partner_no VARCHAR(50),
  email      VARCHAR(255),
  payload    JSONB,
  reg_type   VARCHAR(50),
  expires_at TIMESTAMP NOT NULL,
  used       BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_registration_invites_token      ON registration_invites(token);
CREATE INDEX IF NOT EXISTS idx_registration_invites_expires_at ON registration_invites(expires_at);

-- ─── Auth Tokens ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blacklisted_tokens (
  id         SERIAL PRIMARY KEY,
  token      TEXT UNIQUE NOT NULL,
  user_id    INTEGER,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ─── System Settings ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS system_settings (
  id              SERIAL PRIMARY KEY,
  theme_primary   VARCHAR(7)  DEFAULT '#1976d2',
  theme_secondary VARCHAR(7)  DEFAULT '#dc004e',
  logo_url        TEXT,
  updated_by      INTEGER,
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- ─── Seed Data ────────────────────────────────────────────────

-- Number series required by the app
INSERT INTO no_series (code, description, starting_no, ending_no, last_no_used, increment_by_no)
VALUES
  ('DO',    'Delivery Order',         1, 999999, 0, 1),
  ('PO',    'Purchase Order',         1, 999999, 0, 1),
  ('SO',    'Sales Order',            1, 999999, 0, 1),
  ('BATCH', 'Purchase Item Requests', 1, 999999, 0, 1)
ON CONFLICT (code) DO NOTHING;

-- Default system settings row
INSERT INTO system_settings (theme_primary, theme_secondary)
SELECT '#1976d2', '#dc004e'
WHERE NOT EXISTS (SELECT 1 FROM system_settings);

-- ─── Super Admin ──────────────────────────────────────────────
-- Default credentials:  admin@partnerportal.com  /  Admin@1234
-- Uses pgcrypto (bcrypt $2a$) — verified compatible with bcryptjs.
-- Change the password after first login via the change-password API.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_hash    TEXT;
  v_user_id INTEGER;
BEGIN
  v_hash := crypt('Admin@1234', gen_salt('bf', 10));

  INSERT INTO users (name, email, password, role)
  VALUES ('Super Admin', 'admin@partnerportal.com', v_hash, 'super_admin')
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO v_user_id;

  IF v_user_id IS NOT NULL THEN
    INSERT INTO login_users (user_id, email, password, role)
    VALUES (v_user_id, 'admin@partnerportal.com', v_hash, 'super_admin')
    ON CONFLICT (email) DO NOTHING;
  END IF;
END $$;
