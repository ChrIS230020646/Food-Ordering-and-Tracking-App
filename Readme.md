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

### 1. Clone the Repository
```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Database Setup
1. Start MySQL server
2. Create a database for the application:
```sql
CREATE DATABASE food_delivery_db;
```
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

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Customer
- `GET /api/customer/restaurants` - List all restaurants
- `GET /api/customer/menu/{restaurantId}` - Get restaurant menu
- `POST /api/customer/order` - Place an order
- `GET /api/customer/orders/history` - Order history

### Restaurant
- `POST /api/restaurant/menu` - Add menu item
- `GET /api/restaurant/orders` - View incoming orders
- `PUT /api/restaurant/order/{orderId}/confirm` - Confirm order for delivery

### Delivery
- `GET /api/delivery/available-orders` - View available delivery orders
- `POST /api/delivery/order/{orderId}/accept` - Accept delivery order
- `PUT /api/delivery/order/{orderId}/status` - Update delivery status

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

## License

This project is for educational purposes.
