README.md`:

```markdown
# 🏪 MegaStore Database 

## 📖 Project 

This is a project that show a complete database migration from a flat CSV file to a modern, scalable architecture using both SQL (PostgreSQL) and NoSQL (MongoDB) databases, with a RESTful API built with Express.js.


### Database Distribution

#### PostgreSQL (Relational)
- **customers**: Master customer data
- **suppliers**: Supplier information
- **categories**: Product categories
- **products**: Product catalog with references

#### MongoDB (NoSQL)
- **orders**: Transactional data with embedded items
- **audit_logs**: Deletion audit trail

### Justification

**SQL for Master Data:**
- Strong referential integrity required
- ACID compliance for critical data
- Complex relationships (products → categories, suppliers)
- Normalization to 3NF eliminates redundancy

**NoSQL for Transactions:**
- High write volume for orders
- Embedded items optimize read performance
- Flexible schema for evolving requirements
- Audit logs are append-only (perfect for MongoDB)

## Installation & Setup

### Prerequisites
```bash
- Node.js >= 18.x
- PostgreSQL >= 14.x
- MongoDB >= 6.x
- npm or yarn
```

### 1. Clone Repository
```bash
git clone <repository-url>
cd megastore-project
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Create `.env` file:
```env
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=db_megastore_exam
PG_USER=megastore_user
PG_PASSWORD=megastore_pass

MONGO_URI=mongodb://localhost:27017/db_megastore_exam

PORT=3000
NODE_ENV=development
```

### 4. Setup Databases

**PostgreSQL:**
```bash
sudo -u postgres psql
CREATE USER megastore_user WITH PASSWORD 'megastore_pass';
CREATE DATABASE db_megastore_exam OWNER megastore_user;
\q

psql -h localhost -U megastore_user -d db_megastore_exam -f docs/sql-schema.sql
```

**MongoDB:**
```bash
mongosh < docs/mongodb-schema.js
```

### 5. Run Data Migration
```bash
npm run migrate
```

### 6. Start Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Data Model

### SQL Schema (3NF)

**1NF:** All attributes are atomic
**2NF:** No partial dependencies (all non-key attributes depend on the whole primary key)
**3NF:** No transitive dependencies (non-key attributes don't depend on other non-key attributes)

### MongoDB Schema

**Embedding Strategy:**
- Order items are embedded (read optimization)
- Customer/Product IDs are referenced (data consistency)

**Indexing:**
- `transaction_id`: Unique index
- `customer_id`: Regular index for customer queries
- `order_date`: Descending index for recent orders

## API Endpoints

### Products (CRUD)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get product by ID |
| POST | `/api/products` | Create new product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product (with audit) |
| GET | `/api/products/audit/:id` | Get audit logs for product |

### Analytics (Business Intelligence)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/suppliers` | Supplier performance analysis |
| GET | `/api/analytics/customers/:id/history` | Customer purchase history |
| GET | `/api/analytics/products/top-by-category/:category` | Best-selling products |

##  Migration Process

The migration script (`scripts/migrate-data.js`) implements **idempotency**:

1. **Check existence** before creating customers/suppliers/products
2. **Reuse existing IDs** for duplicate entities
3. **Skip duplicate orders** using unique transaction_id

Example:
```javascript
// If "lucas mortigo" appears in 10 transactions:
// 1. Create customer once (first occurrence)
// 2. Reuse customer_id for remaining 9 orders
```

##  Testing with Postman

Import the collection:
```bash
docs/MegaStore-API.postman_collection.json
```


Test scenarios included:
- CRUD operations
- Supplier analysis queries
- Customer purchase history
- Category-based product rankings

## Project Structure

```
megastore_lucas/
├── src/
│   ├── config/
│   │   ├── database.js          # PostgreSQL connection
│   │   └── mongodb.js            # MongoDB connection
│   ├── models/
│   │   └── product.model.js      # Product data access
│   ├── controllers/
│   │   ├── product.controller.js # Product endpoints
│   │   └── analytics.controller.js # Analytics endpoints
│   ├── routes/
│   │   ├── product.routes.js
│   │   └── analytics.routes.js
│   ├── services/
│   │   └── audit.service.js      # Audit logging
│   ├── app.js                    # Express app setup
│   └── server.js                 # Server entry point
├── scripts/
│   └── migrate-data.js           # Data migration script
├── docs/
│   ├── sql-schema.sql            # PostgreSQL DDL
│   ├── mongodb-schema.js         # MongoDB validation
│   ├── data-model-diagram.drawio # ER diagram
│   └── MegaStore-API.postman_collection.json
├── data/
│   └── raw-transactions.csv      # Sample data
├── .env                          # Environment variables
├── .gitignore
├── package.json
└── README.md
```

##  Key Features


**Error Handling**: Comprehensive error responses  
**Idempotent Migration**: Prevents duplicate entities  
**Audit Logging**: All deletions tracked in MongoDB  
**3NF Normalization**: Optimized SQL schema  
**Embedded Documents**: Fast reads in MongoDB  
**Referential Integrity**: Foreign keys enforced  
**Schema Validation**: MongoDB document validation 