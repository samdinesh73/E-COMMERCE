const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const db = require("../config/database");

// Configure email transporter - optional
let transporter = null;

// Check both EMAIL_PASS and SMTP_PASS for compatibility
const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;

console.log("Email Config Check:");
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("SMTP_USER:", process.env.SMTP_USER);
console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);
console.log("SMTP_PASS exists:", !!process.env.SMTP_PASS);

if (emailUser && emailPass) {
  try {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
    console.log("✓ Email transporter configured successfully");
  } catch (err) {
    console.error("✗ Email transporter setup error:", err);
  }
} else {
  console.warn("⚠ Email credentials not found in environment variables");
}

// POST /contact - Submit contact form
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    console.log("Contact form received:", { name, email, subject });

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Try to send email if configured
    if (transporter) {
      try {
        // Prepare email content
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: "dineshsellerrocket@gmail.com", // Send to your email
          replyTo: email,
          subject: `New Contact Form Submission: ${subject}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, "<br>")}</p>
          `,
        };

        // Send email
        await transporter.sendMail(mailOptions);
        console.log("Admin email sent successfully to dineshsellerrocket@gmail.com");

        // Send confirmation email to user
        const confirmationEmail = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: "We received your message",
          html: `
            <h2>Thank you for contacting us!</h2>
            <p>Hi ${name},</p>
            <p>We have received your message and will get back to you as soon as possible.</p>
            <p>Best regards,<br>The Sellerrocket Team</p>
          `,
        };

        await transporter.sendMail(confirmationEmail);
        console.log("Confirmation email sent to user");
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Don't fail the request if email fails
      }
    } else {
      console.log("Email not configured, but message received and saved");
    }

    // Save to database
    try {
      db.query(
        "INSERT INTO contact_messages (name, email, subject, message, created_at) VALUES (?, ?, ?, ?, NOW())",
        [name, email, subject, message],
        (err, results) => {
          if (err) {
            console.error("Error saving contact message to database:", err);
          } else {
            console.log("✓ Contact message saved to database with ID:", results.insertId);
          }
        }
      );
    } catch (dbError) {
      console.error("Database error:", dbError);
    }

    res.status(200).json({ message: "Message received successfully. We'll get back to you soon!" });
  } catch (error) {
    console.error("Error processing contact form:", error);
    res.status(500).json({ error: "Failed to process your message. Please try again." });
  }
});

module.exports = router;
