# Food Order

A full-stack food delivery platform with three user roles: Customers, Restaurant Owners, and Delivery Staff.

## Features

### Functional Requirements
- **Customer Features**
  - User registration and login
  - Browse restaurant menus
  - Place food orders
  - View order history
  - Manage personal information

- **Restaurant Owner Features**
  - Add and manage menu items
  - View incoming orders
  - Process and confirm orders for delivery

- **Delivery Staff Features**
  - View available delivery orders
  - Accept or decline delivery requests
  - View delivery details with map integration
  - Update delivery status

### Non-Functional Requirements
- **Security**: JWT-based authentication with encryption
- **Scalability**: Support for multiple concurrent users
- **Data Persistence**: Temporary session storage and MySQL database

## Tech Stack

### Backend
- **Framework**: Spring Boot
- **Database**: MySQL
- **Security**: JWT Authentication
- **Build Tool**: Maven
- **Java Version**: 11+

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: npm
- **Development Server**: Vite

## Project Structure

### Backend (`/backend`)
```
backend/
├── controller/      # API endpoints for frontend and system control
├── dto/             # Data Transfer Objects (getters/setters)
├── models/          # MySQL entity models for data rows
├── repositories/    # Database operations (SELECT, INSERT, etc.)
├── services/
│   └── JwtService.java  # Temporary session storage and JWT management
└── src/main/resources/
    └── application.properties  # Database configuration
```

### Frontend (`/frontend`)
```
frontend/
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Page-level components
│   ├── services/
│   │   └── api.ts     # Backend API communication
│   └── app.tsx        # Main application entry point
└── package.json       # Dependencies and scripts
```

## Prerequisites

- **Java 21.0.1+**
- **Node.js v22.20.0+**
- **MySQL 8.0+**
- **Maven** (or use provided Maven Wrapper)
- **npm** or **yarn**

## Setup Instructions

3. Update database credentials in `backend/src/main/resources/application.properties`

### 3. Backend Setup (Spring Boot)

#### Windows:
```bash
cd backend
mvnw.cmd spring-boot:run
```

#### macOS/Linux:
```bash
cd backend
chmod +x mvnw  # Grant execution permission
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`

### 4. Frontend Setup (React)

#### Option 1: Separate terminals
```bash
# In a new terminal
cd frontend
npm install
npm run dev
```

#### Option 2: Combined commands (from project root)
```bash
npm run install:all
npm run dev
```

The frontend will start on `http://localhost:5173` (or another available port)

# Food Delivery Platform API Documentation

## Authentication

### Login
- **Endpoint**: `POST http://localhost:8080/api/auth/login`
- **Description**: Authenticate user and obtain JWT token
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "userType": "customer|restaurant|delivery"
}
```
- **Sample Request**:
```json
{
  "email": "trs1@gmail.com",
  "password": "password2",
  "userType": "restaurant"
}
```

## Restaurant APIs

### Get All Restaurants
- **Endpoint**: `GET http://localhost:8080/api/restaurants`
- **Description**: Retrieve list of all restaurants
- **Authentication**: Required
- **User Types**: Customer, Restaurant

### Add Menu Item
- **Endpoint**: `POST http://localhost:8080/api/restaurant/menu`
- **Description**: Add new item to restaurant menu
- **Authentication**: Required (Restaurant only)
- **Request Body**:
```json
{
  "item_name": "Food Item Name",
  "description": "Food description",
  "price": 99.99
}
```
- **Sample Request**:
```json
{
  "item_name": "TestFoodOne",
  "description": "TestFoodOne",
  "price": 45.00
}
```

### Get Restaurant Menu
- **Endpoint**: `GET http://localhost:8080/api/restaurants/{restaurantId}/menu`
- **Description**: Retrieve menu for specific restaurant
- **Parameters**: `restaurantId` - ID of the restaurant
- **Authentication**: Required
- **User Types**: Customer, Restaurant
- **Example**: `GET http://localhost:8080/api/restaurants/8/menu`

## Customer APIs

### Place Order
- **Endpoint**: `POST http://localhost:8080/api/orders`
- **Description**: Create a new food order
- **Authentication**: Required (Customer only)
- **Request Body**:
```json
{
  "restid": 8,
  "totalAmount": 130.00,
  "address": "123 Test Street, HK",
  "phone": "98765432",
  "items": [
    {
      "itemId": 21,
      "itemName": "TestFoodOne",
      "quantity": 1,
      "price": 45.00
    },
    {
      "itemId": 22,
      "itemName": "TestFoodTwo",
      "quantity": 1,
      "price": 85.00
    }
  ]
}
```

## Delivery Staff APIs

### Get Pending Orders
- **Endpoint**: `GET http://localhost:8080/api/orders/pending`
- **Description**: Retrieve all pending delivery orders
- **Authentication**: Required (Delivery staff only)

### Update Order Status
- **Endpoint**: `PUT http://localhost:8080/api/orders/{orderId}/status`
- **Description**: Update delivery status of an order
- **Parameters**: `orderId` - ID of the order
- **Authentication**: Required (Delivery staff only)
- **Request Body**:
```json
{
  "status": "delivered"
}
```
- **Example**: `PUT http://localhost:8080/api/orders/3/status`


## Error Responses
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Testing with cURL

### Login as Restaurant:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"trs1@gmail.com","password":"password2","userType":"restaurant"}'
```

### Get Restaurant Menu:
```bash
curl -X GET http://localhost:8080/api/restaurants/8/menu \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Place an Order:
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"restid":8,"totalAmount":130.00,"address":"123 Test Street, HK","phone":"98765432","items":[{"itemId":21,"itemName":"TestFoodOne","quantity":1,"price":45.00}]}'
```

## Default Test Users
1. **Restaurant**: Email: `trs1@gmail.com`, Password: `password2`
2. **Delivery Staff**: Email: `tso@gmail.com`, Password: `password2`
3. **Customer**: Use registration endpoint to create account

## Environment Configuration

### Backend (`backend/src/main/resources/application.properties`)
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/food_delivery_db
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
jwt.secret=your_jwt_secret_key
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## Development Notes

- **JWT Tokens**: Automatically stored in browser localStorage
- **Session Management**: Temporary storage handled by JwtService
- **Database**: MySQL with JPA/Hibernate for ORM
- **CORS**: Configured for frontend-backend communication
- **Error Handling**: Comprehensive error responses for API calls

## Troubleshooting

### Common Issues

1. **Backend won't start**
   - Check if MySQL is running
   - Verify database credentials in application.properties
   - Ensure port 8080 is not in use

2. **Frontend connection errors**
   - Ensure backend is running before starting frontend
   - Check CORS configuration in backend
   - Verify API base URL in frontend

3. **Database connection issues**
   - Verify MySQL service is running
   - Check database name and credentials
   - Ensure user has proper permissions

### macOS/Linux Specific
- If `mvnw` permission denied, run: `chmod +x mvnw`
- Ensure Java 11+ is installed and configured
