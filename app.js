const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const listEndpoints = require("express-list-endpoints");
require("dotenv").config();
const { router: AuthRoutes } = require("./routes/auth.routes"); // ← destructure router
const UserRoutes = require("./routes/user.routes");
const ItemRoutes = require("./routes/item.routes");
const ContactRoutes = require("./routes/contact.routes");
const PurchaseOrderRoutes = require("./routes/purchaseOrder.routes");
const SalesOrderRoutes = require("./routes/salesOrder.routes");

const InvoiceRoutes = require("./routes/invoice.routes");
const PurchaseInvoiceRoutes = require("./routes/purchaseInvoice.routes");

const PurchaseReceiptRoutes = require("./routes/purchaseReceipt.routes");
const PartnerLocationLinkRoutes = require("./routes/partnerLocationLink.routes");
const NoSeirs = require("./routes/NoSeries.route.js")
const app = express();

/* =======================
   Database
======================= */
const { connectDB } = require("./config/db");

/* =======================
   Middleware
======================= */
app.use(helmet());
app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* =======================
   Health Check
======================= */
app.get("/", (req, res) => {
  res.send("You are connected to partner server");
});

/* =======================
   API Routes
======================= */

app.use("/api/auth", AuthRoutes);
app.use("/api/users", UserRoutes);
app.use("/api/vendor/item", ItemRoutes);
app.use("/api/contact", ContactRoutes);

app.use("/api/purchase-orders", PurchaseOrderRoutes);
app.use("/api/sales-orders", SalesOrderRoutes);

app.use("/api/invoices", InvoiceRoutes);

app.use("/api/purchase-invoices", PurchaseInvoiceRoutes);

app.use("/api/purchase-receipts", PurchaseReceiptRoutes);

app.use("/api/partner-location-links", PartnerLocationLinkRoutes);
app.use("/api/no-series", NoSeirs);
/* =======================
   Route Listing API (DEV ONLY)
======================= */
if (process.env.NODE_ENV !== "production") {
  app.get("/api/routes", (req, res) => {
    res.json(listEndpoints(app));
  });
}

/* =======================
   Server Start
======================= */
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Connect to PostgreSQL first
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Base URL: http://localhost:${PORT}`);

      if (process.env.NODE_ENV !== "production") {
        console.log("\n📂 ========== AVAILABLE ROUTES ==========\n");

        const routes = listEndpoints(app);
        routes.forEach((route, index) => {
          console.log(
            `${index + 1}. ${route.methods.join(", ").padEnd(8)} ${route.path}`,
          );
        });

        console.log(`\n✅ Total Routes: ${routes.length}`);
        console.log("\n========================================\n");
      }
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
