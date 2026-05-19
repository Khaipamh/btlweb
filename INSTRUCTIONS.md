# INSTRUCTIONS - Development Guide for Sahafa BookStore

## 1. Project Overview

Project Name: Sahafa BookStore - E-Commerce Book Platform
Goal: Build a complete online book sales platform with admin management and user experience similar to major e-commerce sites.

---

## 2. Important Assessments & Warnings

### Server Warning (Critical)
- Issue: Low resource servers (e.g., e2-micro with 1GB RAM) running Docker and MySQL may overload.
- Mandatory Solution:
  - Create SWAP Memory (2-4GB).
  - Use an external database (Supabase, Aiven, Railway) to reduce load.
  - If running MySQL locally: configure for minimal memory usage.

### Payment System
- Solution: Use Sepay.
- Flow: User transfers money -> Bank notifies Sepay -> Webhook to Backend -> Order confirmation.

### AI Chatbot
- Restriction: Do not run local AI models on low-spec servers.
- Solution: Call Google Gemini via Backend middleware.

---

## 3. Technology Stack

### Frontend (Vue 3 + Vite)
- vue
- vue-router
- pinia
- axios
- element-plus (Admin Dashboard UI)
- tailwindcss (User Frontend UI)
- chart.js (Statistics)

### Backend (Node.js + Express)
- express
- sequelize (ORM)
- sqlite3 / mysql2
- jsonwebtoken (JWT Auth)
- bcryptjs (Password hashing)
- joi (Validation)
- multer (File upload)
- cors
- dotenv
- helmet (Security)

### Database
- SQLite3 (Dev) / MySQL (Prod)
- Managed by Sequelize migrations.

---

## 4. Detailed Roadmap

### Phase 1: Setup & Infrastructure
- Initialize GitHub repo with standard structure.
- Setup Vite project (Frontend).
- Setup Express server (Backend).
- Configure environment variables (.env).
- Create Docker Compose configuration.
- Setup SWAP Memory on VPS.

### Phase 2: Database Design & ORM Setup
Tables (18):
- User, Address, Book, BookImage, Author, Genre, Publisher, Category, Post, Cart, CartItem, Voucher, Order, OrderItem, Transaction, Review, ImportReceipt, ImportItem.

Tasks:
- Design ER Diagram.
- Create Sequelize models.
- Setup database connection & migrations.
- Seed test data.

### Phase 3: Backend API - Authentication & Authorization
- JWT middleware & token refresh logic.
- User registration, login, logout.
- Role-based access control (RBAC).
- User profile endpoints.
- Error handling standardization.
- Security headers (Helmet, CORS).

### Phase 4: Backend API - Core Resources
- Categories (CRUD).
- Suppliers (CRUD).
- Books (List, Detail, CRUD).
- Cart (Add, List, Update, Remove).
- Orders (Checkout, List, Detail, Status Update).
- Input Validation (Joi).

### Phase 5: Backend - Advanced Features
- File Upload (Multer).
- Payment Integration (Sepay).
- Reviews & Ratings.
- Analytics (Revenue, Stats).
- AI Chatbot Middleware.

### Phase 6: Frontend - User Storefront
- Home Page, Books Listing, Book Detail.
- User Auth (Login/Register).
- User Profile, Shopping Cart, Checkout.
- Responsive design.

### Phase 7: Frontend - Admin Dashboard
- Dashboard (Stats).
- Books, Categories, Suppliers Management.
- Orders, Users, Staff Management.
- Analytics & Reports.

### Phase 8: Frontend - Advanced Features
- AI Chatbot Widget.
- Book Recommendations.
- Wishlist.
- Notifications.

### Phase 9: Deployment & DevOps
- Docker Compose setup.
- VPS configuration (Nginx, SSL, Firewall).
- CI/CD with GitHub Actions.
- Domain & DNS setup.

### Phase 10: Testing & Polish
- End-to-end testing.
- Bug fixing & Optimization.
- Final Documentation.

---

## 5. Development Checklist

Before starting each phase:
- Create feature branch.
- Pull latest from master.
- Update .env if needed.

During development:
- Follow naming conventions.
- Write meaningful commit messages.
- Test locally before pushing.
- No hardcoded secrets.

Before merging:
- All tests pass.
- No console.log in production code.
- Code review.
- Update documentation.