SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT;
SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS;
SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION;


SET NAMES utf8mb4;

DROP DATABASE IF EXISTS food_order_system;
CREATE DATABASE food_order_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE food_order_system;


CREATE TABLE `customer` (
  `custid` int(11) NOT NULL,
  `custname` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `pass_hash_1` varchar(96) NOT NULL,
  `pass_hash_2` varchar(64) NOT NULL,
  `icon` varchar(255) DEFAULT NULL COMMENT 'Profile icon URL/path',
  `isValidate` tinyint(1) DEFAULT 1,
  `latestLoginDate` timestamp NULL DEFAULT NULL COMMENT 'Latest login timestamp',
  `change_log` text DEFAULT NULL,
  `created_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_time` datetime(6) DEFAULT NULL,
  `is_validate` bit(1) DEFAULT NULL,
  `latest_login_date` datetime(6) DEFAULT NULL,
  `updated_time` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 傾印資料表的資料 `customer`
--

INSERT INTO `customer` (`custid`, `custname`, `phone`, `email`, `pass_hash_1`, `pass_hash_2`, `icon`, `isValidate`, `latestLoginDate`, `change_log`, `created_time`, `deleted_time`, `is_validate`, `latest_login_date`, `updated_time`) VALUES
(1, 'Alice Wong', '12345678', 'alice@email.com', '648357a04407e0a73fe201d9aad9bec165cbf63b6db4311b28f7e256b214a0725e45069c0162232d31412580255c461e', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'https://example.com/icons/alice.png', 1, '2025-11-09 00:45:00', 'Initial registration. Email verified.', '2025-12-03 18:23:57', NULL, NULL, NULL, NULL),
(2, 'Bob Lee', '87654321', 'bob@email.com', '648357a04407e0a73fe201d9aad9bec165cbf63b6db4311b28f7e256b214a0725e45069c0162232d31412580255c461e', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'https://example.com/icons/bob.png', 1, '2025-11-09 01:15:00', 'Initial registration. Phone updated.', '2025-12-03 18:23:57', NULL, NULL, NULL, NULL),
(3, 'FM', '98765432', 'fm@gmail.com', '66b6aa56af08dc8caf7e001683058338244f436de61d40e342d0c69bda9f73cd6d167fdb29925db579923bdcef1fe5ae', '6cf615d5bcaac778352a8f1f3360d23f02f34ec182e259897fd6ce485d7870d4', NULL, 1, '2025-12-03 18:23:57', 'Seed test customer fm@gmail.com', '2025-12-03 18:23:57', NULL, NULL, '2025-12-04 10:39:29.000000', NULL);

-- --------------------------------------------------------

--
-- 資料表結構 `customer_addresses`
--

CREATE TABLE `customer_addresses` (
  `addressid` int(11) NOT NULL,
  `custid` int(11) NOT NULL,
  `address_line1` varchar(200) NOT NULL,
  `address_line2` varchar(200) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `country` varchar(50) DEFAULT 'Hong Kong',
  `is_default` tinyint(1) DEFAULT 0,
  `change_log` text DEFAULT NULL,
  `created_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_time` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 傾印資料表的資料 `customer_addresses`
--

INSERT INTO `customer_addresses` (`addressid`, `custid`, `address_line1`, `address_line2`, `city`, `postal_code`, `country`, `is_default`, `change_log`, `created_time`, `updated_time`, `deleted_time`) VALUES
(1, 1, '123 Main St', NULL, 'Central', '999077', 'Hong Kong', 1, 'Default address set.', '2025-12-03 18:23:57', '2025-12-03 18:23:57', NULL),
(2, 2, '456 Side St', NULL, 'Mong Kok', '999077', 'Hong Kong', 1, 'Default address set.', '2025-12-03 18:23:57', '2025-12-03 18:23:57', NULL),
(3, 3, '789 Main St', NULL, 'Wan Chai', '999077', 'Hong Kong', 1, 'Default address set.', '2025-12-03 18:23:57', '2025-12-03 18:23:57', NULL);

-- --------------------------------------------------------

--
-- 資料表結構 `deliveries`
--

CREATE TABLE `deliveries` (
  `deliveryid` int(11) NOT NULL,
  `orderid` int(11) NOT NULL,
  `driver_id` int(11) DEFAULT NULL,
  `eta` timestamp NULL DEFAULT NULL,
  `actual_delivery_time` timestamp NULL DEFAULT NULL,
  `delivery_status` enum('assigned','in_transit','delivered','failed') DEFAULT 'assigned',
  `created_time` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- 資料表結構 `delivery_staff`
--

CREATE TABLE `delivery_staff` (
  `staff_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `pass_hash_1` varchar(96) NOT NULL,
  `pass_hash_2` varchar(64) NOT NULL,
  `icon` varchar(255) DEFAULT NULL COMMENT 'Profile icon URL/path',
  `vehicle_type` enum('bike','scooter','car','van') DEFAULT 'bike',
  `license_number` varchar(50) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `isValidate` tinyint(1) DEFAULT 1,
  `latestLoginDate` timestamp NULL DEFAULT NULL COMMENT 'Latest login timestamp',
  `change_log` text DEFAULT NULL,
  `created_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_time` timestamp NULL DEFAULT NULL,
  `is_validate` bit(1) DEFAULT NULL,
  `latest_login_date` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 傾印資料表的資料 `delivery_staff`
--

INSERT INTO `delivery_staff` (`staff_id`, `name`, `phone`, `email`, `pass_hash_1`, `pass_hash_2`, `icon`, `vehicle_type`, `license_number`, `status`, `isValidate`, `latestLoginDate`, `change_log`, `created_time`, `updated_time`, `deleted_time`, `is_validate`, `latest_login_date`) VALUES
(1, 'John Driver', '98765432', 'john@delivery.com', '648357a04407e0a73fe201d9aad9bec165cbf63b6db4311b28f7e256b214a0725e45069c0162232d31412580255c461e', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'https://example.com/icons/john.png', 'bike', 'DL123456', 'active', 1, '2025-11-09 02:45:00', 'Initial onboarding. Vehicle verified.', '2025-12-03 18:23:57', '2025-12-03 18:23:57', NULL, NULL, NULL),
(2, 'Mary Rider', '11223344', 'mary@delivery.com', '648357a04407e0a73fe201d9aad9bec165cbf63b6db4311b28f7e256b214a0725e45069c0162232d31412580255c461e', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'https://example.com/icons/mary.png', 'scooter', 'DL789012', 'inactive', 0, '2025-11-09 01:00:00', 'Account frozen due to inactivity.', '2025-12-03 18:23:57', '2025-12-03 18:23:57', NULL, NULL, NULL),
(3, 'TSO', '65841254', 'tso@gmail.com', '66b6aa56af08dc8caf7e001683058338244f436de61d40e342d0c69bda9f73cd6d167fdb29925db579923bdcef1fe5ae', '6cf615d5bcaac778352a8f1f3360d23f02f34ec182e259897fd6ce485d7870d4', NULL, 'bike', 'DLTEST123', 'active', 1, '2025-12-03 18:23:57', 'Seed test delivery staff tso@gmail.com', '2025-12-03 18:23:57', '2025-12-03 18:23:57', NULL, NULL, '2025-12-04 09:17:39.000000');

-- --------------------------------------------------------

--
-- 資料表結構 `menu_items`
--

CREATE TABLE `menu_items` (
  `item_ID` int(11) NOT NULL,
  `restid` int(11) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `item_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `status` enum('active','inactive','out_of_stock') DEFAULT 'active',
  `created_time` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 傾印資料表的資料 `menu_items`
--

INSERT INTO `menu_items` (`item_ID`, `restid`, `category`, `item_name`, `description`, `price`, `status`, `created_time`) VALUES
(1, 1, 'Dim Sum', 'Har Gow', 'Shrimp dumplings', 25.00, 'active', '2025-12-03 18:23:57'),
(2, 1, 'Dim Sum', 'Siu Mai', 'Pork dumplings', 20.00, 'active', '2025-12-03 18:23:57'),
(3, 1, 'Dim Sum', 'Char Siu Bao', 'BBQ pork buns', 18.00, 'active', '2025-12-03 18:23:57'),
(4, 2, 'Main Course', 'Beef Noodles', 'Spicy beef noodle soup', 45.00, 'out_of_stock', '2025-12-03 18:23:57'),
(5, 2, 'Main Course', 'Chicken Rice', 'Steamed chicken with rice', 30.00, 'active', '2025-12-03 18:23:57'),
(6, 2, 'Main Course', 'Dan Dan Noodles', 'Sichuan spicy noodles with minced pork', 35.00, 'active', '2025-12-03 18:23:57'),
(7, 3, 'Test Item', 'Test Food 1', 'Test menu item for testing purposes', 10.00, 'active', '2025-12-03 18:23:57'),
(8, 3, 'Test Item', 'Test Food 2', 'Another test menu item', 15.00, 'active', '2025-12-03 18:23:57'),
(9, 4, 'Pizza', 'Pizza Margherita', 'Classic Italian pizza with tomato, mozzarella, and basil', 12.99, 'active', '2025-12-03 18:23:57'),
(10, 4, 'Pasta', 'Pasta Carbonara', 'Creamy pasta with bacon, eggs, and parmesan cheese', 14.99, 'active', '2025-12-03 18:23:57'),
(11, 4, 'Dessert', 'Tiramisu', 'Classic Italian dessert', 8.99, 'active', '2025-12-03 18:23:57'),
(12, 5, 'Burgers', 'Burger Deluxe', 'Juicy beef burger with cheese, lettuce, and special sauce', 9.99, 'active', '2025-12-03 18:23:57'),
(13, 5, 'Burgers', 'Chicken Burger', 'Crispy chicken burger with mayo', 8.99, 'active', '2025-12-03 18:23:57'),
(14, 5, 'Sides', 'French Fries', 'Crispy golden fries', 4.99, 'active', '2025-12-03 18:23:57'),
(15, 6, 'Sushi', 'Sushi Platter', 'Assorted fresh sushi with soy sauce and wasabi', 24.99, 'active', '2025-12-03 18:23:57'),
(16, 6, 'Sashimi', 'Salmon Sashimi', 'Fresh salmon sashimi', 18.99, 'active', '2025-12-03 18:23:57'),
(17, 6, 'Soup', 'Miso Soup', 'Traditional Japanese miso soup', 5.99, 'active', '2025-12-03 18:23:57'),
(18, 7, 'Noodles', 'Pad Thai', 'Traditional Thai stir-fried noodles with shrimp', 13.99, 'active', '2025-12-03 18:23:57'),
(19, 7, 'Soup', 'Tom Yum Soup', 'Spicy and sour Thai soup', 11.99, 'active', '2025-12-03 18:23:57'),
(20, 7, 'Curry', 'Green Curry', 'Thai green curry with chicken', 14.99, 'active', '2025-12-03 18:23:57');

-- --------------------------------------------------------

--
-- 資料表結構 `notifications`
--

CREATE TABLE `notifications` (
  `Notification_ID` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `content` text NOT NULL,
  `Receiver_ID` int(11) NOT NULL,
  `recipient_type` enum('customer','restaurant') NOT NULL,
  `type` enum('order_update','low_stock','promotion','delivery_alert','payment_issue') DEFAULT 'order_update',
  `created_time` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 傾印資料表的資料 `notifications`
--

INSERT INTO `notifications` (`Notification_ID`, `title`, `content`, `Receiver_ID`, `recipient_type`, `type`, `created_time`) VALUES
(1, 'Low Stock Alert', 'Beef Noodles stock is below threshold. Reorder recommended.', 2, 'restaurant', 'low_stock', '2025-12-03 18:23:57'),
(2, 'Special Offer', 'Get 20% off on your next noodle order!', 2, 'customer', 'promotion', '2025-12-03 18:23:57');

-- --------------------------------------------------------

--
-- 資料表結構 `orders`
--

CREATE TABLE `orders` (
  `orderid` int(11) NOT NULL,
  `custid` int(11) DEFAULT NULL,
  `restid` int(11) DEFAULT NULL,
  `addressid` int(11) DEFAULT NULL,
  `shipping_address` varchar(300) DEFAULT NULL,
  `deliver_man_ID` int(11) DEFAULT NULL,
  `start_deliver_time` timestamp NULL DEFAULT NULL,
  `end_deliver_time` timestamp NULL DEFAULT NULL,
  `status` enum('cancelled','delivered','delivering','out_for_delivery','pending','preparing','ready') DEFAULT NULL,
  `remark` text DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT 0.00,
  `discount_amount` decimal(10,2) DEFAULT 0.00,
  `change_log` text DEFAULT NULL,
  `created_time` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 傾印資料表的資料 `orders`
--

INSERT INTO `orders` (`orderid`, `custid`, `restid`, `addressid`, `shipping_address`, `deliver_man_ID`, `start_deliver_time`, `end_deliver_time`, `status`, `remark`, `total_amount`, `discount_amount`, `change_log`, `created_time`) VALUES
(1, 3, 1, 3, 'Address not set', NULL, NULL, NULL, 'pending', '', 25.00, 0.00, NULL, '2025-12-04 01:11:12'),
(2, 3, 3, 3, 'Address not set', 3, '2025-12-04 01:17:47', '2025-12-04 01:31:24', 'delivered', '', 25.00, 0.00, NULL, '2025-12-04 01:16:04');

-- --------------------------------------------------------

--
-- 資料表結構 `order_items`
--

CREATE TABLE `order_items` (
  `orderitemid` int(11) NOT NULL,
  `orderid` int(11) DEFAULT NULL,
  `item_ID` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT 1,
  `price` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 傾印資料表的資料 `order_items`
--

INSERT INTO `order_items` (`orderitemid`, `orderid`, `item_ID`, `quantity`, `price`) VALUES
(1, 1, 1, 1, 25.00),
(2, 2, 7, 1, 10.00),
(3, 2, 8, 1, 15.00);

-- --------------------------------------------------------

--
-- 資料表結構 `order_reviews`
--

CREATE TABLE `order_reviews` (
  `reviewid` int(11) NOT NULL,
  `orderid` int(11) NOT NULL,
  `custid` int(11) NOT NULL,
  `rest_rating` int(11) DEFAULT NULL CHECK (`rest_rating` between 1 and 5),
  `delivery_rating` int(11) DEFAULT NULL CHECK (`delivery_rating` between 1 and 5),
  `comment` text DEFAULT NULL,
  `created_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- 資料表結構 `payments`
--

CREATE TABLE `payments` (
  `invoiceID` int(11) NOT NULL,
  `orderid` int(11) NOT NULL,
  `payment_method` enum('credit_card','debit_card','paypal','cash_on_delivery') NOT NULL,
  `ext_ref_num` varchar(100) DEFAULT NULL,
  `receive_amount` decimal(10,2) NOT NULL,
  `payment_status` enum('pending','paid','failed','refunded') DEFAULT 'pending',
  `created_time` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- 資料表結構 `restaurant`
--

CREATE TABLE `restaurant` (
  `restid` int(11) NOT NULL,
  `restname` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `rating` decimal(38,2) DEFAULT NULL,
  `address` varchar(200) DEFAULT NULL,
  `pass_hash_1` varchar(96) NOT NULL,
  `pass_hash_2` varchar(64) NOT NULL,
  `icon` varchar(255) DEFAULT NULL COMMENT 'Restaurant icon/logo URL/path',
  `isValidate` tinyint(1) DEFAULT 1,
  `latestLoginDate` timestamp NULL DEFAULT NULL COMMENT 'Latest login timestamp',
  `change_log` text DEFAULT NULL,
  `created_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_time` datetime(6) DEFAULT NULL,
  `is_validate` bit(1) DEFAULT NULL,
  `latest_login_date` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 傾印資料表的資料 `restaurant`
--

INSERT INTO `restaurant` (`restid`, `restname`, `email`, `description`, `rating`, `address`, `pass_hash_1`, `pass_hash_2`, `icon`, `isValidate`, `latestLoginDate`, `change_log`, `created_time`, `updated_time`, `deleted_time`, `is_validate`, `latest_login_date`) VALUES
(1, 'Delicious Dim Sum', 'dimsum@restaurant.com', 'Authentic Cantonese dim sum restaurant with fresh ingredients and traditional recipes.', 5.00, 'Central, HK', '648357a04407e0a73fe201d9aad9bec165cbf63b6db4311b28f7e256b214a0725e45069c0162232d31412580255c461e', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', NULL, 1, '2025-11-09 02:30:00', 'Restaurant registered. Menu uploaded.', '2025-12-03 18:23:57', '2025-12-04 02:34:18', NULL, NULL, NULL),
(2, 'Spicy Noodles', 'spicynoodles@restaurant.com', 'Street-style noodle shop specializing in spicy Sichuan flavors and quick service.', 4.00, 'Mong Kok, HK', '648357a04407e0a73fe201d9aad9bec165cbf63b6db4311b28f7e256b214a0725e45069c0162232d31412580255c461e', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZmFzdCUyMGZvb2R8ZW58MHx8MHx8fDA%3D', 1, '2025-11-09 03:15:00', 'Delivery fee adjusted to 3.00.', '2025-12-03 18:23:57', '2025-12-04 02:05:51', NULL, NULL, NULL),
(3, 'Test Restaurant', 'restaurant@email.com', 'Test restaurant for login. Use \"restaurant@email.com\" as email and \"password123\" as password.', 5.00, 'Test Location, HK', '648357a04407e0a73fe201d9aad9bec165cbf63b6db4311b28f7e256b214a0725e45069c0162232d31412580255c461e', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'https://b.zmtcdn.com/data/pictures/chains/4/208504/c454ef92e055fff01dc3c4cb0cdf3fcf_o2_featured_v2.jpg', 1, NULL, 'Test restaurant account created.', '2025-12-03 18:23:57', '2025-12-04 02:32:49', NULL, NULL, '2025-12-04 09:16:57.000000'),
(4, 'Italian Bistro', 'italian@restaurant.com', 'Classic Italian cuisine with authentic recipes and fresh ingredients.', 5.00, 'Tsim Sha Tsui, HK', '648357a04407e0a73fe201d9aad9bec165cbf63b6db4311b28f7e256b214a0725e45069c0162232d31412580255c461e', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCkDlKknFDqLZueAYTduCxVFoti5zpFwxO0w&s', 1, '2025-11-09 04:00:00', 'Italian Bistro opened. Menu uploaded.', '2025-12-03 18:23:57', '2025-12-04 02:35:17', NULL, NULL, NULL),
(5, 'Burger House', 'burger@restaurant.com', 'Juicy burgers and crispy fries made with premium ingredients.', 4.00, 'Causeway Bay, HK', '648357a04407e0a73fe201d9aad9bec165cbf63b6db4311b28f7e256b214a0725e45069c0162232d31412580255c461e', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'https://cdn-imgix.headout.com/microbrands-content-image/image/cf0a8ab55e1de8849ec57f7f97f570f6-Chang%E2%80%99s%20Golden%20Dragon.jpg?auto=format&w=510.8727272727273&h=401.4&q=90&ar=14%3A11&crop=faces&fit=crop', 1, '2025-11-09 04:15:00', 'Burger House opened. Special promotions added.', '2025-12-03 18:23:57', '2025-12-04 02:36:15', NULL, NULL, NULL),
(6, 'Sushi Master', 'sushi@restaurant.com', 'Fresh sushi and Japanese cuisine prepared by experienced chefs.', 5.00, 'Central, HK', '648357a04407e0a73fe201d9aad9bec165cbf63b6db4311b28f7e256b214a0725e45069c0162232d31412580255c461e', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3Q1yVJYthrrCy01taylukssUnm1qn-_u_ag&s', 1, '2025-11-09 04:30:00', 'Sushi Master opened. Premium ingredients sourced.', '2025-12-03 18:23:57', '2025-12-04 02:43:06', NULL, NULL, NULL),
(7, 'Thai Garden', 'thai@restaurant.com', 'Authentic Thai flavors with spicy and aromatic dishes.', 4.00, 'Wan Chai, HK', '648357a04407e0a73fe201d9aad9bec165cbf63b6db4311b28f7e256b214a0725e45069c0162232d31412580255c461e', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWkvjvLbeaa9suuBJoup3zFTQdoP2_S87-IQ&s', 1, '2025-11-09 04:45:00', 'Thai Garden opened. Traditional recipes added.', '2025-12-03 18:23:57', '2025-12-04 02:43:22', NULL, NULL, NULL),
(8, 'TestRSOne', 'trs1@gmail.com', 'Test restaurant for login. Use \"trs1@gmail.com\" as email and \"password2\" as password.', 5.00, 'Test Location, HK', '66b6aa56af08dc8caf7e001683058338244f436de61d40e342d0c69bda9f73cd6d167fdb29925db579923bdcef1fe5ae', '6cf615d5bcaac778352a8f1f3360d23f02f34ec182e259897fd6ce485d7870d4', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_L0D-PK6njItqPk5QUSu8eAbXD-L3A7p3kA&s', 1, NULL, 'Test restaurant account created.', '2025-12-03 18:23:57', '2025-12-04 02:33:11', NULL, NULL, '2025-12-04 09:16:21.000000'),
(9, 'aaaaa', 'aa@gmail.com', 'food test', NULL, 'dsadsa', '66b6aa56af08dc8caf7e001683058338244f436de61d40e342d0c69bda9f73cd6d167fdb29925db579923bdcef1fe5ae', '6cf615d5bcaac778352a8f1f3360d23f02f34ec182e259897fd6ce485d7870d4', NULL, 1, NULL, NULL, '2025-12-04 02:38:35', '2025-12-04 02:38:35', NULL, b'1', NULL);

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`custid`),
  ADD KEY `idx_customer_email` (`email`),
  ADD KEY `idx_customer_isValidate` (`isValidate`),
  ADD KEY `idx_customer_latestLoginDate` (`latestLoginDate`);

--
-- 資料表索引 `customer_addresses`
--
ALTER TABLE `customer_addresses`
  ADD PRIMARY KEY (`addressid`),
  ADD KEY `idx_address_custid` (`custid`),
  ADD KEY `idx_address_default` (`is_default`);

--
-- 資料表索引 `deliveries`
--
ALTER TABLE `deliveries`
  ADD PRIMARY KEY (`deliveryid`),
  ADD KEY `driver_id` (`driver_id`),
  ADD KEY `idx_delivery_orderid` (`orderid`),
  ADD KEY `idx_delivery_status` (`delivery_status`);

--
-- 資料表索引 `delivery_staff`
--
ALTER TABLE `delivery_staff`
  ADD PRIMARY KEY (`staff_id`),
  ADD KEY `idx_delivery_status` (`status`),
  ADD KEY `idx_delivery_isValidate` (`isValidate`),
  ADD KEY `idx_delivery_latestLoginDate` (`latestLoginDate`),
  ADD KEY `idx_delivery_deleted` (`deleted_time`);

--
-- 資料表索引 `menu_items`
--
ALTER TABLE `menu_items`
  ADD PRIMARY KEY (`item_ID`),
  ADD KEY `idx_menu_restid` (`restid`),
  ADD KEY `idx_menu_category` (`category`),
  ADD KEY `idx_menu_status` (`status`);

--
-- 資料表索引 `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`Notification_ID`),
  ADD KEY `idx_notif_Receiver_ID` (`recipient_type`,`Receiver_ID`),
  ADD KEY `idx_notif_type` (`type`);

--
-- 資料表索引 `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`orderid`),
  ADD KEY `restid` (`restid`),
  ADD KEY `addressid` (`addressid`),
  ADD KEY `deliver_man_ID` (`deliver_man_ID`),
  ADD KEY `idx_orders_status` (`status`),
  ADD KEY `idx_orders_custid` (`custid`),
  ADD KEY `idx_orders_deliver_time` (`start_deliver_time`,`end_deliver_time`);

--
-- 資料表索引 `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`orderitemid`),
  ADD KEY `item_ID` (`item_ID`),
  ADD KEY `idx_oi_orderid` (`orderid`);

--
-- 資料表索引 `order_reviews`
--
ALTER TABLE `order_reviews`
  ADD PRIMARY KEY (`reviewid`),
  ADD UNIQUE KEY `uk_review_order` (`orderid`),
  ADD KEY `idx_review_custid` (`custid`);

--
-- 資料表索引 `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`invoiceID`),
  ADD KEY `idx_payment_orderid` (`orderid`),
  ADD KEY `idx_payment_status` (`payment_status`);

--
-- 資料表索引 `restaurant`
--
ALTER TABLE `restaurant`
  ADD PRIMARY KEY (`restid`),
  ADD UNIQUE KEY `uk_rest_email` (`email`),
  ADD KEY `idx_rest_email` (`email`),
  ADD KEY `idx_rest_isValidate` (`isValidate`),
  ADD KEY `idx_rest_latestLoginDate` (`latestLoginDate`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `customer`
--
ALTER TABLE `customer`
  MODIFY `custid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `customer_addresses`
--
ALTER TABLE `customer_addresses`
  MODIFY `addressid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `deliveries`
--
ALTER TABLE `deliveries`
  MODIFY `deliveryid` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `delivery_staff`
--
ALTER TABLE `delivery_staff`
  MODIFY `staff_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `menu_items`
--
ALTER TABLE `menu_items`
  MODIFY `item_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `notifications`
--
ALTER TABLE `notifications`
  MODIFY `Notification_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `orders`
--
ALTER TABLE `orders`
  MODIFY `orderid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `order_items`
--
ALTER TABLE `order_items`
  MODIFY `orderitemid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `order_reviews`
--
ALTER TABLE `order_reviews`
  MODIFY `reviewid` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `payments`
--
ALTER TABLE `payments`
  MODIFY `invoiceID` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `restaurant`
--
ALTER TABLE `restaurant`
  MODIFY `restid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- 已傾印資料表的限制式
--

--
-- 資料表的限制式 `customer_addresses`
--
ALTER TABLE `customer_addresses`
  ADD CONSTRAINT `customer_addresses_ibfk_1` FOREIGN KEY (`custid`) REFERENCES `customer` (`custid`) ON DELETE CASCADE;

--
-- 資料表的限制式 `deliveries`
--
ALTER TABLE `deliveries`
  ADD CONSTRAINT `deliveries_ibfk_1` FOREIGN KEY (`orderid`) REFERENCES `orders` (`orderid`) ON DELETE CASCADE,
  ADD CONSTRAINT `deliveries_ibfk_2` FOREIGN KEY (`driver_id`) REFERENCES `delivery_staff` (`staff_id`) ON DELETE SET NULL;

--
-- 資料表的限制式 `menu_items`
--
ALTER TABLE `menu_items`
  ADD CONSTRAINT `menu_items_ibfk_1` FOREIGN KEY (`restid`) REFERENCES `restaurant` (`restid`) ON DELETE CASCADE;

--
-- 資料表的限制式 `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`custid`) REFERENCES `customer` (`custid`) ON DELETE CASCADE,
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`restid`) REFERENCES `restaurant` (`restid`) ON DELETE CASCADE,
  ADD CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`addressid`) REFERENCES `customer_addresses` (`addressid`) ON DELETE SET NULL,
  ADD CONSTRAINT `orders_ibfk_4` FOREIGN KEY (`deliver_man_ID`) REFERENCES `delivery_staff` (`staff_id`) ON DELETE SET NULL;

--
-- 資料表的限制式 `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`orderid`) REFERENCES `orders` (`orderid`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`item_ID`) REFERENCES `menu_items` (`item_ID`) ON DELETE CASCADE;

--
-- 資料表的限制式 `order_reviews`
--
ALTER TABLE `order_reviews`
  ADD CONSTRAINT `order_reviews_ibfk_1` FOREIGN KEY (`orderid`) REFERENCES `orders` (`orderid`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_reviews_ibfk_2` FOREIGN KEY (`custid`) REFERENCES `customer` (`custid`);

--
-- 資料表的限制式 `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`orderid`) REFERENCES `orders` (`orderid`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
