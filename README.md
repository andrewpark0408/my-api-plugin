# **My API Plugin**

*A robust API integration tool for QuickBooks Online, built with Next.js, Prisma, PostgreSQL, and SWR.*

## **🚀 Overview**

My API Plugin is a **Next.js-based API integration tool** designed to **fetch, store, and manage QuickBooks invoices** efficiently. It leverages **Prisma ORM** with PostgreSQL for structured database management and SWR for optimized data fetching in the frontend.

This project features:

- **QuickBooks API Integration:** Securely fetch and store invoices.
- **Admin Panel:** Manage invoices, create new entries, and auto-fill fields.
- **SWR for Data Fetching:** Avoid unnecessary reloads and ensure real-time updates.
- **Prisma ORM & PostgreSQL:** Manage invoices with structured relational data.
- **NextAuth Authentication:** Secure access with role-based authorization.

---

## **🛠️ Tech Stack**

| **Technology** | **Usage** |
| --- | --- |
| **Next.js 14** | Frontend & Backend API routes |
| **Prisma ORM** | Database schema & transactions |
| **PostgreSQL** | Database storage |
| **QuickBooks API** | Invoice management |
| **SWR** | Data fetching & caching |
| **Tailwind CSS** | UI styling |
| **NextAuth.js** | Authentication |
| **TypeScript** | Type safety |

---

## **📦 Installation & Setup**

### **1️⃣ Clone the Repository**

```
git clone https://github.com/andrewpark0408/my-api-plugin.git
cd my-api-plugin
```

### **2️⃣ Install Dependencies**

```
npm install
```

### **3️⃣ Configure Environment Variables**

Create a `.env` file in the root directory and fill in the required credentials:

```
DATABASE_URL=postgres://username:password@localhost:5432/mydatabase
NEXTAUTH_SECRET=your_secret_key
QUICKBOOKS_CLIENT_ID=your_client_id
QUICKBOOKS_CLIENT_SECRET=your_client_secret
QUICKBOOKS_REDIRECT_URI=http://localhost:3000/api/quickbooks/callback

```

### **4️⃣ Migrate the Database**

Ensure PostgreSQL is running, then execute:

```
npx prisma migrate dev --name init
```

### **5️⃣ Start the Development Server**

```
npm run dev

```

The app will be live at: [http://localhost:3000](http://localhost:3000/)

---

## **🔌 API Endpoints**

### **1️⃣ QuickBooks Authentication**

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/quickbooks/auth` | Connect to QuickBooks and get an access token. |
| `GET` | `/api/quickbooks/callback` | Callback for QuickBooks OAuth authentication. |

### **2️⃣ QuickBooks Invoices**

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/quickbooks/get` | Fetch invoices from QuickBooks API. |
| `POST` | `/api/quickbooks/store` | Store QuickBooks invoices in the database. |

### **3️⃣ Local Invoice Management**

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/invoices` | Retrieve stored invoices. |
| `POST` | `/api/invoices` | Create a new invoice. |
| `PUT` | `/api/invoices/:id` | Update an invoice. |
| `DELETE` | `/api/invoices/:id` | Delete an invoice. |

---

## **🖥️ Admin Dashboard**

The **Admin Panel** allows users with the `admin` role to:
✅ View all invoices

✅ Create new invoices (with QuickBooks auto-fill)

✅ Edit existing invoices

✅ Delete invoices

> To access the admin panel, log in as an admin user and visit:
> 
> 
> http://localhost:3000/admin
> 

---

## **📌 Key Features**

### ✅ **QuickBooks API Integration**

- Securely connects to QuickBooks Online.
- Fetches invoices and stores them in PostgreSQL.
- Handles token authentication and refresh.

### ✅ **Smart Admin Dashboard**

- Auto-fills invoices from QuickBooks.
- Inline editing for invoice details.
- Optimized pagination and sorting.

### ✅ **Optimized with SWR**

- No manual page refreshes needed.
- Fast data updates with real-time mutations.

### ✅ **Secure & Scalable**

- Role-based authentication via NextAuth.
- Structured database with Prisma ORM.
- Fully scalable with PostgreSQL backend.

---

## **🚀 Future Enhancements**

- ✅ Add more filtering options in the admin panel.
- ✅ Improve error handling for QuickBooks API failures.
- ✅ Optimize database queries for better performance.

---

## **🤝 Contributing**

We welcome contributions! Please follow these steps:

1️⃣ Fork the repo

2️⃣ Create a new branch: `git checkout -b feature-branch`

3️⃣ Commit your changes: `git commit -m "Added a new feature"`

4️⃣ Push to GitHub: `git push origin feature-branch`

5️⃣ Open a PR 🚀

---

## **🛠️ Troubleshooting**

### 🔹 Database Migration Issues?

- Run: `npx prisma migrate reset`
- Ensure PostgreSQL is running.

### 🔹 QuickBooks API Errors?

- Verify credentials in `.env`
- Check logs with `console.error()`.

### 🔹 SWR Not Updating Data?

- Use `mutate()` after API changes.

---

## **📜 License**

This project is licensed under the **MIT License**.
