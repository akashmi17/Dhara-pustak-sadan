// server.js
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));

const OWNER_EMAIL = 'dharapustaksadan@gmail.com'
const OWNER_PASS = 'uttseeuzjvysweub';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: false,
  auth: {
    user: OWNER_EMAIL,
    pass: OWNER_PASS
  },
  tls: { rejectUnauthorized: false }
});

app.post("/api/order", async (req, res) => {
  try {
    const o = req.body;

    if (!o.name || !o.phone || !o.address || !Array.isArray(o.items) || o.items.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid order data" });
    }

    const orderId = "DPS-" + Date.now();
    let html = `<h2>New Order - ${orderId}</h2>`;

    o.items.forEach(i => {
      html += `<p>${i.name} x${i.qty} = ₹${i.qty * i.price}</p>`;
    });

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

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
