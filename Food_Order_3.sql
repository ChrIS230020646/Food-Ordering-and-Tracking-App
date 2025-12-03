DROP DATABASE IF EXISTS food_order_system;
CREATE DATABASE food_order_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE food_order_system;

-- Drop tables in reverse order to avoid FK issues
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS order_reviews;
DROP TABLE IF EXISTS deliveries;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS customer_addresses;
DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS delivery_staff;
DROP TABLE IF EXISTS restaurant;
DROP TABLE IF EXISTS customer;

-- Customer table (enhanced with basic timestamps)
CREATE TABLE customer (
    custid INT PRIMARY KEY AUTO_INCREMENT,
    custname VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    pass_hash_1 CHAR(96) NOT NULL COMMENT 'sha384',
    pass_hash_2 CHAR(64) NOT NULL COMMENT 'sha-256',
    icon VARCHAR(255) NULL COMMENT 'Profile icon URL/path',
    isValidate BOOLEAN DEFAULT TRUE, -- 凍結或停用帳號
    latestLoginDate TIMESTAMP NULL COMMENT 'Latest login timestamp',
    change_log TEXT NULL, 
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_customer_email (email),
    INDEX idx_customer_isValidate (isValidate),
    INDEX idx_customer_latestLoginDate (latestLoginDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Customer Addresses table
CREATE TABLE customer_addresses (
    addressid INT PRIMARY KEY AUTO_INCREMENT,
    custid INT NOT NULL,
    address_line1 VARCHAR(200) NOT NULL,
    address_line2 VARCHAR(200),
    city VARCHAR(100), 
    postal_code VARCHAR(20), -- 郵遞區號
    country VARCHAR(50) DEFAULT 'Hong Kong',
    is_default BOOLEAN DEFAULT FALSE,
    change_log TEXT NULL,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_time TIMESTAMP NULL,
    FOREIGN KEY (custid) REFERENCES customer(custid) ON DELETE CASCADE,
    INDEX idx_address_custid (custid),
    INDEX idx_address_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Restaurant table
CREATE TABLE restaurant (
    restid INT PRIMARY KEY AUTO_INCREMENT,
    restname VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL, -- Restaurant email for login
    description TEXT,
    rating INT CHECK (rating >= 1 AND rating <= 5), -- 餐廳評級
    address VARCHAR(200), -- 餐廳地址
    pass_hash_1 CHAR(96) NOT NULL COMMENT 'sha384',
    pass_hash_2 CHAR(64) NOT NULL COMMENT 'sha-256',
    icon VARCHAR(255) NULL COMMENT 'Restaurant icon/logo URL/path',
    isValidate BOOLEAN DEFAULT TRUE,
    latestLoginDate TIMESTAMP NULL COMMENT 'Latest login timestamp',
    change_log TEXT NULL,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_rest_email (email),
    INDEX idx_rest_isValidate (isValidate),
    INDEX idx_rest_latestLoginDate (latestLoginDate),
    UNIQUE KEY uk_rest_email (email) -- Ensure email is unique
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Delivery Staff table
CREATE TABLE delivery_staff (
    staff_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    pass_hash_1 CHAR(96) NOT NULL COMMENT 'sha384',
    pass_hash_2 CHAR(64) NOT NULL COMMENT 'sha-256',
    icon VARCHAR(255) NULL COMMENT 'Profile icon URL/path',
    vehicle_type ENUM('bike', 'scooter', 'car', 'van') DEFAULT 'bike', -- 騎手的交通工具
    license_number VARCHAR(50), -- 交通工具牌照／駕駛執照編號
    status ENUM('active', 'inactive') DEFAULT 'active', --
    isValidate BOOLEAN DEFAULT TRUE, -- 停用/凍結
    latestLoginDate TIMESTAMP NULL COMMENT 'Latest login timestamp',
    change_log TEXT NULL,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_time TIMESTAMP NULL,
    INDEX idx_delivery_status (status),
    INDEX idx_delivery_isValidate (isValidate),
    INDEX idx_delivery_latestLoginDate (latestLoginDate),
    INDEX idx_delivery_deleted (deleted_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Menu Items table
CREATE TABLE menu_items (
    item_ID INT PRIMARY KEY AUTO_INCREMENT,
    restid INT,
    category VARCHAR(100), -- 菜式類型
    item_name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    status ENUM('active', 'inactive', 'out_of_stock') DEFAULT 'active', -- 菜式狀態
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restid) REFERENCES restaurant(restid) ON DELETE CASCADE,
    INDEX idx_menu_restid (restid),
    INDEX idx_menu_category (category),
    INDEX idx_menu_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders table
CREATE TABLE orders (
    orderid INT PRIMARY KEY AUTO_INCREMENT,
    custid INT,
    restid INT,
    addressid INT,
    shipping_address VARCHAR(300) NULL, -- 送貨地址
    deliver_man_ID INT NULL, -- 騎手id
    start_deliver_time TIMESTAMP NULL, -- 開始送貨時間
    end_deliver_time TIMESTAMP NULL, -- 結束送貨時間
    status ENUM('pending', 'preparing', 'ready', 'out_for_delivery', 'delivering', 'delivered', 'cancelled') DEFAULT 'pending', -- 外賣狀態
    remark TEXT NULL, -- 訂單備註(我覺得應該係customer寫嘅)
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00, -- discount幾多錢, 冇嘅話應該係零
    change_log TEXT,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (custid) REFERENCES customer(custid) ON DELETE CASCADE,
    FOREIGN KEY (restid) REFERENCES restaurant(restid) ON DELETE CASCADE,
    FOREIGN KEY (addressid) REFERENCES customer_addresses(addressid) ON DELETE SET NULL,
    FOREIGN KEY (deliver_man_ID) REFERENCES delivery_staff(staff_id) ON DELETE SET NULL,
    INDEX idx_orders_status (status),
    INDEX idx_orders_custid (custid),
    INDEX idx_orders_deliver_time (start_deliver_time, end_deliver_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order Items table
CREATE TABLE order_items (
    orderitemid INT PRIMARY KEY AUTO_INCREMENT,
    orderid INT,
    item_ID INT,
    quantity INT DEFAULT 1,
    price DECIMAL(10,2),
    FOREIGN KEY (orderid) REFERENCES orders(orderid) ON DELETE CASCADE,
    FOREIGN KEY (item_ID) REFERENCES menu_items(item_ID) ON DELETE CASCADE,
    INDEX idx_oi_orderid (orderid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payments table
CREATE TABLE payments (
    invoiceID INT PRIMARY KEY AUTO_INCREMENT,
    orderid INT NOT NULL,
    payment_method ENUM('credit_card', 'debit_card', 'paypal', 'cash_on_delivery') NOT NULL, -- 付款方法
    ext_ref_num VARCHAR(100) NULL, -- 記錄第三方付款程式收據編碼(例如支付寶自己產生的帳單號碼)
    receive_amount DECIMAL(10,2) NOT NULL, -- 付款金額
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending', -- 交易狀態
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (orderid) REFERENCES orders(orderid) ON DELETE CASCADE,
    INDEX idx_payment_orderid (orderid),
    INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Deliveries table
CREATE TABLE deliveries (
    deliveryid INT PRIMARY KEY AUTO_INCREMENT,
    orderid INT NOT NULL,
    driver_id INT,
    eta TIMESTAMP NULL, -- 預計到達時間
    actual_delivery_time TIMESTAMP NULL, -- 實際到達時間
    delivery_status ENUM('assigned', 'in_transit', 'delivered', 'failed') DEFAULT 'assigned',
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (orderid) REFERENCES orders(orderid) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES delivery_staff(staff_id) ON DELETE SET NULL,
    INDEX idx_delivery_orderid (orderid),
    INDEX idx_delivery_status (delivery_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order Reviews table
CREATE TABLE order_reviews (
    reviewid INT PRIMARY KEY AUTO_INCREMENT,
    orderid INT NOT NULL,
    custid INT NOT NULL,
    rest_rating INT CHECK (rest_rating BETWEEN 1 AND 5),
    delivery_rating INT CHECK (delivery_rating BETWEEN 1 AND 5),
    comment TEXT,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_review_order (orderid),
    INDEX idx_review_custid (custid),
    FOREIGN KEY (orderid) REFERENCES orders(orderid) ON DELETE CASCADE,
    FOREIGN KEY (custid) REFERENCES customer(custid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications table
CREATE TABLE notifications (
    Notification_ID INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    Receiver_ID INT NOT NULL,
    recipient_type ENUM('customer', 'restaurant') NOT NULL, -- 收件者類型
    type ENUM('order_update', 'low_stock', 'promotion', 'delivery_alert', 'payment_issue') DEFAULT 'order_update',
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notif_Receiver_ID (recipient_type, Receiver_ID),
    INDEX idx_notif_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data
-- Customers (isValidate=TRUE, sample hashes for "password123", sample icon, recent latestLoginDate, sample change_log)
INSERT INTO customer (custname, phone, email, pass_hash_1, pass_hash_2, icon, isValidate, latestLoginDate, change_log) VALUES
('Alice Wong', '12345678', 'alice@email.com', '648357a04407e0a73fe201d9aad9bec165cbf63b6db4311b28f7e256b214a0725e45069c0162232d31412580255c461e', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'https://example.com/icons/alice.png', TRUE, '2025-11-09 08:45:00', 'Initial registration. Email verified.'),
('Bob Lee', '87654321', 'bob@email.com', '648357a04407e0a73fe201d9aad9bec165cbf63b6db4311b28f7e256b214a0725e45069c0162232d31412580255c461e', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'https://example.com/icons/bob.png', TRUE, '2025-11-09 09:15:00', 'Initial registration. Phone updated.'),
('FM', '98765432', 'fm@gmail.com', '66b6aa56af08dc8caf7e001683058338244f436de61d40e342d0c69bda9f73cd6d167fdb29925db579923bdcef1fe5ae', '6cf615d5bcaac778352a8f1f3360d23f02f34ec182e259897fd6ce485d7870d4', NULL, TRUE, NOW(), 'Seed test customer fm@gmail.com');

-- Sample customer addresses
INSERT INTO customer_addresses (custid, address_line1, city, postal_code, is_default, change_log) VALUES
(1, '123 Main St', 'Central', '999077', TRUE, 'Default address set.'),
(2, '456 Side St', 'Mong Kok', '999077', TRUE, 'Default address set.'),
(3, '789 Main St', 'Wan Chai', '999077', TRUE, 'Default address set.');

-- Restaurants (with description and inventory, isValidate=TRUE, sample hashes, sample icon, recent latestLoginDate, sample change_log)
-- Note: For restaurant login, use email field in the login form
-- Password for all restaurants below: password123
INSERT INTO restaurant (restname, email, description, address, rating, pass_hash_1, pass_hash_2, icon, isValidate, latestLoginDate, change_log) VALUES
('Delicious Dim Sum', 'dimsum@restaurant.com', 'Authentic Cantonese dim sum restaurant with fresh ingredients and traditional recipes.', 'Central, HK', 5, 
'648357a04407e0a73fe201d9aad9bec165cbf63b6db4311b28f7e256b214a0725e45069c0162232d31412580255c461e', 
'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 
'https://example.com/icons/dimsum.png', TRUE, '2025-11-09 10:30:00', 
'Restaurant registered. Menu uploaded.'),

('Spicy Noodles', 'spicynoodles@restaurant.com', 'Street-style noodle shop specializing in spicy Sichuan flavors and quick service.', 'Mong Kok, HK', 4,
'648357a04407e0a73fe201d9aad9bec165cbf63b6db4311b28f7e256b214a0725e45069c0162232d31412580255c461e',
'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
'https://example.com/icons/noodles.png', TRUE, '2025-11-09 11:15:00', 
'Delivery fee adjusted to 3.00.'),

('Test Restaurant', 'restaurant@email.com', 'Test restaurant for login. Use "restaurant@email.com" as email and "password123" as password.', 'Test Location, HK', 5,
'648357a04407e0a73fe201d9aad9bec165cbf63b6db4311b28f7e256b214a0725e45069c0162232d31412580255c461e',
'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
'https://example.com/icons/test.png', TRUE, NULL, 
'Test restaurant account created.'),

('Italian Bistro', 'italian@restaurant.com', 'Classic Italian cuisine with authentic recipes and fresh ingredients.', 'Tsim Sha Tsui, HK', 5,
'648357a04407e0a73fe201d9aad9bec165cbf63b6db4311b28f7e256b214a0725e45069c0162232d31412580255c461e',
'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
'https://example.com/icons/italian.png', TRUE, '2025-11-09 12:00:00', 
'Italian Bistro opened. Menu uploaded.'),

('Burger House', 'burger@restaurant.com', 'Juicy burgers and crispy fries made with premium ingredients.', 'Causeway Bay, HK', 4,
'648357a04407e0a73fe201d9aad9bec165cbf63b6db4311b28f7e256b214a0725e45069c0162232d31412580255c461e',
'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
'https://example.com/icons/burger.png', TRUE, '2025-11-09 12:15:00', 
'Burger House opened. Special promotions added.'),

('Sushi Master', 'sushi@restaurant.com', 'Fresh sushi and Japanese cuisine prepared by experienced chefs.', 'Central, HK', 5,
'648357a04407e0a73fe201d9aad9bec165cbf63b6db4311b28f7e256b214a0725e45069c0162232d31412580255c461e',
'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
'https://example.com/icons/sushi.png', TRUE, '2025-11-09 12:30:00', 
'Sushi Master opened. Premium ingredients sourced.'),

('Thai Garden', 'thai@restaurant.com', 'Authentic Thai flavors with spicy and aromatic dishes.', 'Wan Chai, HK', 4,
'648357a04407e0a73fe201d9aad9bec165cbf63b6db4311b28f7e256b214a0725e45069c0162232d31412580255c461e',
'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
'https://example.com/icons/thai.png', TRUE, '2025-11-09 12:45:00', 
'Thai Garden opened. Traditional recipes added.'),

('TestRSOne', 'trs1@gmail.com', 'Test restaurant for login. Use "trs1@gmail.com" as email and "password2" as password.', 'Test Location, HK', 5,
'66b6aa56af08dc8caf7e001683058338244f436de61d40e342d0c69bda9f73cd6d167fdb29925db579923bdcef1fe5ae',
'6cf615d5bcaac778352a8f1f3360d23f02f34ec182e259897fd6ce485d7870d4',
'https://example.com/icons/test.png', TRUE, NULL, 
'Test restaurant account created.');

-- Delivery Staff (sample: one with isValidate=FALSE for demo, sample hashes, sample icon, recent latestLoginDate, sample change_log)
INSERT INTO delivery_staff (name, phone, email, pass_hash_1, pass_hash_2, icon, vehicle_type, license_number, status, isValidate, latestLoginDate, change_log) VALUES
('John Driver', '98765432', 'john@delivery.com', '648357a04407e0a73fe201d9aad9bec165cbf63b6db4311b28f7e256b214a0725e45069c0162232d31412580255c461e', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'https://example.com/icons/john.png', 'bike', 'DL123456', 'active', TRUE, '2025-11-09 10:45:00', 'Initial onboarding. Vehicle verified.'),
('Mary Rider', '11223344', 'mary@delivery.com', '648357a04407e0a73fe201d9aad9bec165cbf63b6db4311b28f7e256b214a0725e45069c0162232d31412580255c461e', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'https://example.com/icons/mary.png', 'scooter', 'DL789012', 'inactive', FALSE, '2025-11-09 09:00:00', 'Account frozen due to inactivity.'),
('TSO', '65841254', 'tso@gmail.com', '66b6aa56af08dc8caf7e001683058338244f436de61d40e342d0c69bda9f73cd6d167fdb29925db579923bdcef1fe5ae', '6cf615d5bcaac778352a8f1f3360d23f02f34ec182e259897fd6ce485d7870d4', NULL, 'bike', 'DLTEST123', 'active', TRUE, NOW(), 'Seed test delivery staff tso@gmail.com');

-- Menu items (dedicated table: with category, status)
-- Note: item_ID is auto-generated by AUTO_INCREMENT, so we don't specify it here
-- The restid values correspond to the restaurants inserted above:
-- restid 1 = Delicious Dim Sum
-- restid 2 = Spicy Noodles
-- restid 3 = Test Restaurant
-- restid 4 = Italian Bistro
-- restid 5 = Burger House
-- restid 6 = Sushi Master
-- restid 7 = Thai Garden
INSERT INTO menu_items (restid, category, item_name, description, price, status) VALUES
-- Delicious Dim Sum (restid = 1)
(1, 'Dim Sum', 'Har Gow', 'Shrimp dumplings', 25.00, 'active'),
(1, 'Dim Sum', 'Siu Mai', 'Pork dumplings', 20.00, 'active'),
(1, 'Dim Sum', 'Char Siu Bao', 'BBQ pork buns', 18.00, 'active'),
-- Spicy Noodles (restid = 2)
(2, 'Main Course', 'Beef Noodles', 'Spicy beef noodle soup', 45.00, 'out_of_stock'),
(2, 'Main Course', 'Chicken Rice', 'Steamed chicken with rice', 30.00, 'active'),
(2, 'Main Course', 'Dan Dan Noodles', 'Sichuan spicy noodles with minced pork', 35.00, 'active'),
-- Test Restaurant (restid = 3)
(3, 'Test Item', 'Test Food 1', 'Test menu item for testing purposes', 10.00, 'active'),
(3, 'Test Item', 'Test Food 2', 'Another test menu item', 15.00, 'active'),
-- Italian Bistro (restid = 4)
(4, 'Pizza', 'Pizza Margherita', 'Classic Italian pizza with tomato, mozzarella, and basil', 12.99, 'active'),
(4, 'Pasta', 'Pasta Carbonara', 'Creamy pasta with bacon, eggs, and parmesan cheese', 14.99, 'active'),
(4, 'Dessert', 'Tiramisu', 'Classic Italian dessert', 8.99, 'active'),
-- Burger House (restid = 5)
(5, 'Burgers', 'Burger Deluxe', 'Juicy beef burger with cheese, lettuce, and special sauce', 9.99, 'active'),
(5, 'Burgers', 'Chicken Burger', 'Crispy chicken burger with mayo', 8.99, 'active'),
(5, 'Sides', 'French Fries', 'Crispy golden fries', 4.99, 'active'),
-- Sushi Master (restid = 6)
(6, 'Sushi', 'Sushi Platter', 'Assorted fresh sushi with soy sauce and wasabi', 24.99, 'active'),
(6, 'Sashimi', 'Salmon Sashimi', 'Fresh salmon sashimi', 18.99, 'active'),
(6, 'Soup', 'Miso Soup', 'Traditional Japanese miso soup', 5.99, 'active'),
-- Thai Garden (restid = 7)
(7, 'Noodles', 'Pad Thai', 'Traditional Thai stir-fried noodles with shrimp', 13.99, 'active'),
(7, 'Soup', 'Tom Yum Soup', 'Spicy and sour Thai soup', 11.99, 'active'),
(7, 'Curry', 'Green Curry', 'Thai green curry with chicken', 14.99, 'active');

-- Orders: No hardcoded orders - all orders should be created through the API
-- Order items: No hardcoded order items - all order items should be created through the API
-- Payments: No hardcoded payments - all payments should be created through the API
-- Deliveries: No hardcoded deliveries - all deliveries should be created through the API
-- Order Reviews: No hardcoded reviews - all reviews should be created through the API

-- Sample notifications (simplified - only non-order related notifications)
INSERT INTO notifications (title, content, Receiver_ID, recipient_type, type) VALUES
('Low Stock Alert', 'Beef Noodles stock is below threshold. Reorder recommended.', 2, 'restaurant', 'low_stock'),
('Special Offer', 'Get 20% off on your next noodle order!', 2, 'customer', 'promotion');