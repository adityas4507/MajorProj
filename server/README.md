# Drive Clone Backend

A robust backend for a cloud storage service, built with Node.js, Express, TypeScript, and Prisma.

## Features

- **User Authentication**: Email/Password login & Google OAuth.
- **File Management**: Upload, download, delete (soft & hard), and restore files.
- **Folder Management**: Create folders and organize files hierarchically.
- **Quota System**: Track user storage usage.
- **Account Management**: Account deletion with retention window and restoration.
- **Security**: JWT authentication, rate limiting, and secure headers (Helmet).

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod
- **Authentication**: Passport.js, JWT, bcryptjs

## Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL database

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd server
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Configuration:**
    Create a `.env` file in the root directory with the following variables:

    ```env
    PORT=3000
    DATABASE_URL="postgresql://user:password@localhost:5432/drive_clone?schema=public"
    
    # JWT Secrets
    JWT_ACCESS_SECRET="your-access-secret"
    JWT_REFRESH_SECRET="your-refresh-secret"
    
    # Google OAuth (Optional)
    GOOGLE_CLIENT_ID="your-google-client-id"
    GOOGLE_CLIENT_SECRET="your-google-client-secret"
    GOOGLE_CALLBACK_URL="http://localhost:3000/auth/google/callback"
    
    # Storage Paths
    STORAGE_ROOT="/path/to/storage"
    TEMP_DIR="/path/to/temp"
    
    # CORS
    CORS_ORIGIN="http://localhost:5173"
    ```

4.  **Database Setup:**
    Run migrations to set up the database schema.
    ```bash
    npx prisma migrate dev
    ```

## Running the Project

-   **Development Mode:**
    ```bash
    npm run dev
    ```

-   **Production Build:**
    ```bash
    npm run build
    npm start
    ```

## Scripts

-   `npm run dev`: Start the development server with hot-reload.
-   `npm run build`: Compile TypeScript to JavaScript.
-   `npm start`: Run the compiled JavaScript.
-   `npm run prisma:migrate`: Run database migrations.
-   `npm run prisma:generate`: Generate Prisma client.
