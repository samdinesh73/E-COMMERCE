// Activate all coupons
const db = require("./backend/src/config/database");

async function activateAllCoupons() {
  try {
    console.log("Activating all coupons...\n");
    
    const [result] = await db.query("UPDATE coupons SET is_active = 1");
    
    console.log(`✅ Updated ${result.affectedRows} coupon(s) to ACTIVE\n`);

    // Show all coupons
    const [coupons] = await db.query("SELECT id, code, is_active FROM coupons ORDER BY created_at DESC");
    
    console.log("Current coupons:\n");
    coupons.forEach((coupon, index) => {
      console.log(`${index + 1}. ${coupon.code} - ${coupon.is_active ? '✓ ACTIVE' : '✗ INACTIVE'}`);
    });

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    process.exit(0);
  }
}

activateAllCoupons();
