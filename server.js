// server.js
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const path = require("path"); // ✅ Required for static files

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, "public")));

// ✅ Environment variables for email credentials
const OWNER_EMAIL = process.env.OWNER_EMAIL;
const OWNER_PASS = process.env.OWNER_PASS;

// Validate env variables
if (!OWNER_EMAIL || !OWNER_PASS) {
  console.error("Error: OWNER_EMAIL or OWNER_PASS not set in environment variables.");
  process.exit(1); // Stop the server if credentials are missing
}

// ✅ Gmail SMTP configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: OWNER_EMAIL,
    pass: OWNER_PASS
  }
});

// ✅ Order API
app.post("/api/order", async (req, res) => {
  try {
    const o = req.body;

    // Basic validation
    if (!o.name || !o.phone || !o.address || !o.items || !Array.isArray(o.items) || o.items.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid order data" });
    }

    const orderId = "DPS-" + Date.now();

    let html = `
      <h2>New Order - ${orderId}</h2>
      <p><b>Name:</b> ${o.name}</p>
      <p><b>Phone:</b> ${o.phone}</p>
      <p><b>Address:</b> ${o.address}</p>
      <p><b>Email:</b> ${o.email || 'Not provided'}</p>
      <p><b>Notes:</b> ${o.notes || '-'}</p>
      <h3>Items:</h3>
      <ul>
    `;

    let total = 0;
    o.items.forEach(i => {
      html += `<li>${i.name} x${i.qty} = ₹${i.qty * i.price}</li>`;
      total += i.qty * i.price;
    });

    html += `</ul><h3>Total: ₹${total}</h3>`;

    // Send email
    await transporter.sendMail({
      from: `"Dhara Pustak Sadan" <${OWNER_EMAIL}>`,
      to: OWNER_EMAIL,
      subject: `New Order Received - ${orderId}`,
      html
    });

    res.json({ success: true, orderId });

  } catch (err) {
    console.error("SMTP ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Serve index.html for all other routes (SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Start server on Render's port or fallback to 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
