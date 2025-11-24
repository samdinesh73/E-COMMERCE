const nodemailer = require("nodemailer");

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Send order confirmation email to customer
const sendOrderConfirmationEmail = async (orderData) => {
  try {
    const {
      orderId,
      customerName,
      customerEmail,
      totalPrice,
      items,
      shippingAddress,
      city,
      pincode,
      paymentMethod,
    } = orderData;

    if (!customerEmail) {
      console.warn("No customer email provided for order confirmation");
      return false;
    }

    const itemsHTML = items
      .map(
        (item) => {
          const variationsHTML = item.selectedVariations && Object.keys(item.selectedVariations).length > 0
            ? `<tr style="background-color: #f0f0f0;">
                <td colspan="4" style="padding: 8px; font-size: 12px;">
                  <strong>Variations:</strong> ${Object.entries(item.selectedVariations)
                    .map(([type, variation]) => `${type}: ${variation.variation_value || variation.name}`)
                    .join(", ")}
                </td>
              </tr>`
            : '';
          
          return `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.product_name || item.name || "Unknown Product"}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${parseFloat(item.price).toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
      </tr>
      ${variationsHTML}
    `;
        }
      )
      .join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px; }
          .section { margin: 20px 0; }
          .section-title { font-size: 16px; font-weight: bold; color: #007bff; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th { background-color: #f8f9fa; padding: 10px; text-align: left; font-weight: bold; }
          .total-row { font-weight: bold; font-size: 18px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
            <p>Thank you for your order!</p>
          </div>

          <div class="section">
            <p>Dear ${customerName},</p>
            <p>Your order has been successfully placed. Here are your order details:</p>
          </div>

          <div class="section">
            <div class="section-title">Order Information</div>
            <table>
              <tr>
                <td><strong>Order ID:</strong></td>
                <td>#${orderId}</td>
              </tr>
              <tr>
                <td><strong>Order Date:</strong></td>
                <td>${new Date().toLocaleDateString()}</td>
              </tr>
              <tr>
                <td><strong>Payment Method:</strong></td>
                <td>${paymentMethod}</td>
              </tr>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Shipping Address</div>
            <p>
              ${shippingAddress}<br>
              ${city}, ${pincode}
            </p>
          </div>

          <div class="section">
            <div class="section-title">Order Items</div>
            <table>
              <tr style="background-color: #f8f9fa;">
                <th>Product Name</th>
                <th style="text-align: center;">Quantity</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
              ${itemsHTML}
              <tr class="total-row" style="border-top: 2px solid #007bff;">
                <td colspan="3" style="text-align: right;">Total Amount:</td>
                <td style="text-align: right; color: #007bff;">₹${parseFloat(totalPrice).toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div class="section">
            <p>
              <strong>What's Next?</strong><br>
              Your order is being prepared for shipment. You will receive a tracking update soon. If you have any questions, feel free to contact us.
            </p>
          </div>

          <div class="footer">
            <p>&copy; ${process.env.STORE_NAME || "ShopDB"}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: customerEmail,
      subject: `Order Confirmation - Order #${orderId}`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Order confirmation email sent to ${customerEmail}`);
    return true;
  } catch (err) {
    console.error("Error sending order confirmation email:", err);
    return false;
  }
};

// Send new order notification email to admin
const sendAdminNewOrderEmail = async (orderData) => {
  try {
    const {
      orderId,
      customerName,
      customerEmail,
      totalPrice,
      items,
      shippingAddress,
      city,
      pincode,
      paymentMethod,
      phone,
    } = orderData;

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.warn("Admin email not configured in environment variables");
      return false;
    }

    const itemsHTML = items
      .map(
        (item) => {
          const variationsHTML = item.selectedVariations && Object.keys(item.selectedVariations).length > 0
            ? `<tr style="background-color: #f0f0f0;">
                <td colspan="4" style="padding: 8px; font-size: 12px;">
                  <strong>Variations:</strong> ${Object.entries(item.selectedVariations)
                    .map(([type, variation]) => `${type}: ${variation.variation_value || variation.name}`)
                    .join(", ")}
                </td>
              </tr>`
            : '';
          
          return `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.product_name || item.name || "Unknown Product"}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${parseFloat(item.price).toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
      </tr>
      ${variationsHTML}
    `;
        }
      )
      .join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 5px; }
          .section { margin: 20px 0; }
          .section-title { font-size: 16px; font-weight: bold; color: #28a745; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th { background-color: #f8f9fa; padding: 10px; text-align: left; font-weight: bold; }
          .total-row { font-weight: bold; font-size: 18px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 10px; }
          .alert { background-color: #fff3cd; border: 1px solid #ffc107; padding: 10px; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 New Order Received!</h1>
          </div>

          <div class="section">
            <p>A new order has been placed on your store. Please find the details below:</p>
          </div>

          <div class="section">
            <div class="section-title">Customer Information</div>
            <table>
              <tr>
                <td><strong>Name:</strong></td>
                <td>${customerName}</td>
              </tr>
              <tr>
                <td><strong>Email:</strong></td>
                <td>${customerEmail || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Phone:</strong></td>
                <td>${phone || "N/A"}</td>
              </tr>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Order Information</div>
            <table>
              <tr>
                <td><strong>Order ID:</strong></td>
                <td>#${orderId}</td>
              </tr>
              <tr>
                <td><strong>Order Date:</strong></td>
                <td>${new Date().toLocaleString()}</td>
              </tr>
              <tr>
                <td><strong>Payment Method:</strong></td>
                <td>${paymentMethod}</td>
              </tr>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Shipping Address</div>
            <p>
              ${shippingAddress}<br>
              ${city}, ${pincode}
            </p>
          </div>

          <div class="section">
            <div class="section-title">Order Items</div>
            <table>
              <tr style="background-color: #f8f9fa;">
                <th>Product Name</th>
                <th style="text-align: center;">Quantity</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
              ${itemsHTML}
              <tr class="total-row" style="border-top: 2px solid #28a745;">
                <td colspan="3" style="text-align: right;">Total Amount:</td>
                <td style="text-align: right; color: #28a745;">₹${parseFloat(totalPrice).toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div class="alert">
            <strong>Action Required:</strong> Please review this order and update its status through the admin dashboard.
          </div>

          <div class="footer">
            <p>&copy; ${process.env.STORE_NAME || "ShopDB"} Admin Notification System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: adminEmail,
      subject: `🎉 New Order #${orderId} - ₹${parseFloat(totalPrice).toFixed(2)}`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ New order notification email sent to admin (${adminEmail})`);
    return true;
  } catch (err) {
    console.error("Error sending admin email:", err);
    return false;
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  sendAdminNewOrderEmail,
};
