// Check all coupons in database
const db = require("./backend/src/config/database");

async function checkCoupons() {
  try {
    console.log("=== ALL COUPONS IN DATABASE ===\n");
    const [coupons] = await db.query("SELECT * FROM coupons");
    
    if (coupons.length === 0) {
      console.log("No coupons found in database");
    } else {
      console.log(`Found ${coupons.length} coupon(s):\n`);
      coupons.forEach((coupon, index) => {
        console.log(`${index + 1}. ${coupon.code}`);
        console.log(`   ID: ${coupon.id}`);
        console.log(`   Type: ${coupon.discount_type}`);
        console.log(`   Discount: ${coupon.discount_value}${coupon.discount_type === 'percentage' ? '%' : '₹'}`);
        console.log(`   Active: ${coupon.is_active === 1 ? 'YES ✓' : 'NO ✗'}`);
        console.log(`   Min Order: ₹${coupon.min_order_value}`);
        console.log(`   Max Uses: ${coupon.max_uses || 'Unlimited'}`);
        console.log(`   Current Uses: ${coupon.current_uses}`);
        console.log(`   Expires: ${coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : 'Never'}`);
        console.log(`   Created: ${new Date(coupon.created_at).toLocaleString()}\n`);
      });
    }

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    process.exit(0);
  }
}

checkCoupons();
