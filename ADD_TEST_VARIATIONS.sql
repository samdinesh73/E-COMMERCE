-- Add test variations for product 32 (Prasanna)
INSERT INTO product_variations (product_id, variation_type, variation_value, price_adjustment, stock_quantity) VALUES 
(32, 'Size', 'S', 0, 10),
(32, 'Size', 'M', 0, 10),
(32, 'Size', 'L', 0, 10),
(32, 'Size', 'XL', 0, 10);

-- Add color variations for product 32
INSERT INTO product_variations (product_id, variation_type, variation_value, price_adjustment, stock_quantity) VALUES 
(32, 'Color', 'Red', 0, 10),
(32, 'Color', 'Blue', 0, 10),
(32, 'Color', 'Black', 0, 10);

-- Add test variations for product 33 (Prince)
INSERT INTO product_variations (product_id, variation_type, variation_value, price_adjustment, stock_quantity) VALUES 
(33, 'Size', 'M', 0, 5),
(33, 'Size', 'L', 0, 5),
(33, 'Color', 'Red', 0, 5),
(33, 'Color', 'Green', 0, 5);

-- Add test variations for product 34 (Martin)
INSERT INTO product_variations (product_id, variation_type, variation_value, price_adjustment, stock_quantity) VALUES 
(34, 'Size', 'S', 0, 8),
(34, 'Size', 'M', 0, 8),
(34, 'Color', 'Black', 0, 8),
(34, 'Color', 'White', 0, 8);

-- Add test variations for product 35
INSERT INTO product_variations (product_id, variation_type, variation_value, price_adjustment, stock_quantity) VALUES 
(35, 'Size', 'One Size', 0, 15),
(35, 'Color', 'Gold', 0, 15),
(35, 'Color', 'Silver', 0, 15);
