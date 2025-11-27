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
    status ENUM('pending', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled') DEFAULT 'pending', -- 外賣狀態
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
    rating INT CHECK (rating >= 1 AND rating <= 5), -- 評價
    review_text TEXT,
    reviewed_by INT,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (orderid) REFERENCES orders(orderid) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES customer(custid),
    INDEX idx_review_orderid (orderid),
    INDEX idx_review_rating (rating)
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
('Bob Lee', '87654321', 'bob@email.com', '648357a04407e0a73fe201d9aad9bec165cbf63b6db4311b28f7e256b214a0725e45069c0162232d31412580255c461e', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'https://example.com/icons/bob.png', TRUE, '2025-11-09 09:15:00', 'Initial registration. Phone updated.');

-- Sample customer addresses
INSERT INTO customer_addresses (custid, address_line1, city, postal_code, is_default, change_log) VALUES
(1, '123 Main St', 'Central', '999077', TRUE, 'Default address set.'),
(2, '456 Side St', 'Mong Kok', '999077', TRUE, 'Default address set.');

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
'Test restaurant account created.');

-- Delivery Staff (sample: one with isValidate=FALSE for demo, sample hashes, sample icon, recent latestLoginDate, sample change_log)
INSERT INTO delivery_staff (name, phone, email, pass_hash_1, pass_hash_2, icon, vehicle_type, license_number, status, isValidate, latestLoginDate, change_log) VALUES
('John Driver', '98765432', 'john@delivery.com', '648357a04407e0a73fe201d9aad9bec165cbf63b6db4311b28f7e256b214a0725e45069c0162232d31412580255c461e', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'https://example.com/icons/john.png', 'bike', 'DL123456', 'active', TRUE, '2025-11-09 10:45:00', 'Initial onboarding. Vehicle verified.'),
('Mary Rider', '11223344', 'mary@delivery.com', '648357a04407e0a73fe201d9aad9bec165cbf63b6db4311b28f7e256b214a0725e45069c0162232d31412580255c461e', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'https://example.com/icons/mary.png', 'scooter', 'DL789012', 'inactive', FALSE, '2025-11-09 09:00:00', 'Account frozen due to inactivity.');

-- Menu items (dedicated table: with category, status, change_log sample)
INSERT INTO menu_items (restid, category, item_name, description, price, status) VALUES
(1, 'Dim Sum', 'Har Gow', 'Shrimp dumplings', 25.00, 'active'),
(1, 'Dim Sum', 'Siu Mai', 'Pork dumplings', 20.00, 'active'),
(2, 'Main Course', 'Beef Noodles', 'Spicy beef noodle soup', 45.00, 'out_of_stock'),
(2, 'Main Course', 'Chicken Rice', 'Steamed chicken with rice', 30.00, 'active');

-- Orders (with merged fields: remark sample, deliver_man_ID now references staff_id 1/2; total auto-calculated later)
INSERT INTO orders (custid, restid, addressid, shipping_address, deliver_man_ID, discount_amount, remark, change_log) VALUES
(1, 1, 1, '123 Main St, Central, HK 999077', 1, 5.00, 'Extra spicy please', 'Order placed. Discount applied.'), -- Alice's order (John Driver)
(2, 2, 2, '456 Side St, Mong Kok, HK 999077', 2, 0.00, 'No onions', 'Order placed. Special remark added.'); -- Bob's order (Mary Rider, but she's inactive for demo)

-- Order items (triggers will calc total and update audit; references item_ID)
INSERT INTO order_items (orderid, item_ID, quantity, price) VALUES
(1, 1, 1, 25.00),
(1, 2, 1, 20.00),
(2, 3, 1, 45.00),
(2, 4, 1, 30.00);

-- Payments (sample with merged fields: invoiceID auto, ext_ref_num, receive_amount)
INSERT INTO payments (orderid, payment_method, ext_ref_num, receive_amount, payment_status) VALUES
(1, 'credit_card', 'STRIPE_TXN12345', 40.00, 'paid'), -- After discount
(2, 'paypal', 'PAYPAL_TXN67890', 75.00, 'paid');

-- Deliveries (sample: driver_id now references staff_id)
INSERT INTO deliveries (orderid, driver_id, eta) VALUES
(1, 1, '2025-11-09 14:00:00'), -- John Driver
(2, 2, '2025-11-09 15:00:00'); -- Mary Rider

-- Order Reviews (sample, post-delivery)
INSERT INTO order_reviews (orderid, rating, review_text, reviewed_by) VALUES
(1, 5, 'Excellent dim sum!', 1),
(2, 4, 'Noodles were spicy but good.', 2);

-- Sample notifications (simplified)
INSERT INTO notifications (title, content, Receiver_ID, recipient_type, type) VALUES
('Low Stock Alert', 'Beef Noodles stock is below threshold. Reorder recommended.', 2, 'restaurant', 'low_stock'),
('Order Confirmed', 'Your order #1 has been confirmed and is being prepared.', 1, 'customer', 'order_update'),
('Special Offer', 'Get 20% off on your next noodle order!', 2, 'customer', 'promotion');