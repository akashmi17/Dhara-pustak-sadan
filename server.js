const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// OWNER EMAIL
const OWNER_EMAIL = "dharapustaksadan@gmail.com";

// ✅ Correct Gmail SMTP config
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: OWNER_EMAIL,
    pass: "kkylvajzylmjejnx"   // ✅ Gmail App Password
  }
});

app.post("/api/order", async (req, res) => {
  try {
    const o = req.body;
    const orderId = "DPS-" + Date.now();

    let html = `
      <h2>New Order - ${orderId}</h2>
      <p><b>Name:</b> ${o.name}</p>
      <p><b>Phone:</b> ${ o.phone}</p>
      <p><b>Address:</b> ${ o.address}</p>
      <p><b>Email:</b> ${ o.email || 'Not provided'}</p>
      <p><b>Notes:</b> ${ o.notes || '-'}</p>
      <h3>Items:</h3>
      <ul>
    `;

    let total = 0;
    o.items.forEach(i => {
      html += `<li>${i.name} x${i.qty} = ₹${i.qty * i.price}</li>`;
      total += i.qty * i.price;
    });

    html += `</ul><h3>Total: ₹${total}</h3>`;

    await transporter.sendMail({
      from: `"Dhara Pustak Sadan" <${OWNER_EMAIL}>`,
      to: OWNER_EMAIL,
      subject: `New Order Received - ${orderId}`,
      html
    });

    res.json({ success: true, orderId });

  } catch (err) {
    console.error("SMTP ERROR:", err);
    res.json({ success: false, message: err.message });
  }
});

// ✅ run backend
app.listen(3000, () => console.log("✅ Backend running at http://localhost:3000"));
