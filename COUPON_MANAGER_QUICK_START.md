# Admin Coupon Manager - Quick Start Guide

## 🎯 What's New?
A complete coupon management system has been added to the Admin Dashboard. You can now create, edit, and delete discount coupons directly from the admin panel.

## 📍 Where to Find It?
1. Go to Admin Dashboard (http://localhost:3000/admin)
2. Click on the **Coupons** tab (with ticket icon)
3. The coupon manager interface will appear

## 🚀 Quick Actions

### Create a New Coupon
```
1. Click "New Coupon" button
2. Fill in the form:
   - Code: SAVE10 (must be unique)
   - Discount Type: Choose Percentage (%) or Fixed (₹)
   - Discount Value: 10 for 10% or ₹100 for fixed
   - Min Order Value: 500 (customers need to spend at least this)
   - Max Uses: 100 (leave empty for unlimited)
   - Expiry Date: Pick any date (optional)
   - Status: Active/Inactive
   - Description: What's this coupon for?
3. Click "Create Coupon"
4. Success! See it in the table below
```

### Edit a Coupon
```
1. Find the coupon in the table
2. Click the pencil icon (Edit)
3. Form opens with current details
4. Update what you need (code cannot be changed)
5. Click "Update Coupon"
6. Done! Changes saved immediately
```

### Delete a Coupon
```
1. Find the coupon in the table
2. Click the trash icon (Delete)
3. Confirm dialog appears
4. Click "Delete" to confirm
5. Coupon removed permanently
```

## 📋 Coupon Table Explained

| Column | Meaning |
|--------|---------|
| **Code** | The coupon code customers use |
| **Discount** | How much discount (e.g., 10%, ₹500) |
| **Min Order** | Minimum order amount to use coupon |
| **Uses** | Current uses / Max uses limit |
| **Expiry** | When coupon expires (Never = no expiry) |
| **Status** | Green badge = Active, Gray = Inactive |
| **Actions** | Edit or Delete buttons |

## 💡 Examples

### Example 1: Festival Sale
```
Code: FESTIVAL25
Type: Percentage (%)
Value: 25
Min Order: 2000
Max Uses: 500
Expiry: 31-12-2025
Description: 25% off during festival season
```

### Example 2: First Purchase
```
Code: WELCOME100
Type: Fixed (₹)
Value: 100
Min Order: 500
Max Uses: Unlimited (leave empty)
Expiry: (leave empty for no expiry)
Description: ₹100 off for first purchase
```

### Example 3: Loyalty Bonus
```
Code: LOYALTY50
Type: Fixed (₹)
Value: 50
Min Order: 1000
Max Uses: Unlimited
Expiry: (no expiry)
Description: Loyalty reward for regular customers
```

## ✅ Validation Rules

**For Percentage Discount**:
- Can be 0-100%
- Discount = (Order Amount × Percentage) / 100

**For Fixed Discount**:
- Discount = Fixed Amount
- Applied to entire order

**Coupon Validity**:
- Code must be unique
- Cannot be changed after creation
- Must be Active to use
- Cannot use if expired
- Customer's order must be ≥ minimum amount
- Cannot use if max uses reached

## 🔍 Status Indicators

| Badge Color | Meaning | Usable? |
|---|---|---|
| **Green** | Active | ✅ Yes |
| **Gray** | Inactive | ❌ No |

## 📊 Monitor Usage

In the table, the **Uses** column shows:
- `5/100` = Used 5 times out of 100 max uses
- `25/∞` = Used 25 times, unlimited uses available
- `∞` = Unlimited uses set from start

## ⚠️ Important Tips

1. **Coupon codes are case-insensitive** - SAVE10 works the same as save10
2. **Once created, code cannot be changed** - Create carefully!
3. **Expiry date is optional** - Leave empty for no expiry
4. **Max uses is optional** - Leave empty for unlimited uses
5. **Inactive coupons cannot be used** - Toggle Active/Inactive as needed
6. **Minimum order must be met** - Customers' order must be ≥ set amount

## 🔑 Key Features

✅ Create unlimited coupons  
✅ Multiple discount types (% and fixed ₹)  
✅ Set minimum order requirements  
✅ Limit usage count  
✅ Set expiry dates  
✅ Toggle active/inactive status  
✅ Real-time usage tracking  
✅ Edit any detail except code  
✅ Delete with confirmation  
✅ Responsive design (mobile friendly)  

## 🐛 Troubleshooting

**Q: Form not showing?**
A: Click "New Coupon" button at top right

**Q: Can't save coupon?**
A: Check all required fields are filled (marked with *)

**Q: Seeing error message?**
A: Check coupon code is unique, or review the error details

**Q: Coupon not working for customers?**
A: Verify coupon is Active, not expired, and order meets minimum amount

## 📱 Mobile Support

The coupon manager works on mobile! On smaller screens, the table scrolls horizontally to show all columns.

## 🎯 Common Tasks

### Temporarily Disable a Coupon
- Click Edit
- Change Status to Inactive
- Click Update
- Coupon won't work for customers (doesn't delete it)

### Check If Coupon Was Used
- Look at the Uses column
- Shows current uses / max uses
- If using more, consider increasing limit or extending expiry

### Create a Single-Use Coupon
- Set Max Uses to 1
- First customer to use it locks it
- Perfect for special promotions

### Make an Unlimited Coupon
- Leave Max Uses empty
- Leave Expiry Date empty
- Coupon works forever, unlimited times

---

**Need help?** Check the detailed documentation in `COUPON_ADMIN_MANAGER.md` or view the backend API docs for more technical details.
