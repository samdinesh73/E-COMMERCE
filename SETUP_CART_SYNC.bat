@echo off
REM Cart & Wishlist Sync Setup Script

echo.
echo ========================================
echo Cart & Wishlist Sync - Database Setup
echo ========================================
echo.

REM Get MySQL credentials
set /p DB_USER="Enter MySQL Username (default: root): " || set DB_USER=root
set /p DB_PASS="Enter MySQL Password: "
set /p DB_HOST="Enter MySQL Host (default: 127.0.0.1): " || set DB_HOST=127.0.0.1

echo.
echo Running migration...

REM Run the migration
mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASS% shop_db < backend/create-cart-wishlist-tables.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ Database migration completed successfully!
    echo.
    echo Tables created:
    echo   - carts (stores cart items per user)
    echo   - wishlists (stores wishlist items per user)
    echo.
    echo Next steps:
    echo   1. Start the backend server
    echo   2. Log in to the frontend
    echo   3. Add items to cart/wishlist
    echo   4. Check different device - items will sync!
    echo.
) else (
    echo.
    echo ✗ Migration failed. Check your credentials and try again.
    echo.
)

pause
