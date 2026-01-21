# 📦 PI-NAS: Raspberry Pi–Based Private Cloud Storage

PI-NAS is a **private, self-hosted cloud storage system** built using **Raspberry Pi and Node.js**, designed as a **secure, cost-effective alternative** to commercial cloud storage services and proprietary NAS devices.

This project implements a **web-based Network Attached Storage (NAS)** with modern cloud-like features such as authentication, REST APIs, file streaming, quota management, and trash recovery — while ensuring **full local control and data privacy**.

---

## 🧠 Problem Statement

Modern users store large volumes of data across multiple devices, leading to:
- Data fragmentation
- Dependency on third-party cloud providers
- Privacy and security concerns
- Recurring subscription costs
- Internet-dependent access

Commercial NAS systems, although local, are often expensive, proprietary, and limited in customization.

**PI-NAS** solves these issues by providing a **customizable, locally hosted private cloud** using a Raspberry Pi micro-server and a Node.js backend.

---

## 🎯 Objectives

- Design a **Node.js + Express.js** HTTP storage server
- Implement **secure authentication** (JWT, bcrypt, OAuth)
- Support file upload, download, listing, deletion, and restoration
- Integrate **external USB storage (ext4)**
- Provide high-speed **LAN-based access**
- Implement **quota management and trash system**
- Achieve **low power, 24×7 reliable operation**

---

## 🏗️ System Architecture

The system follows a **three-tier architecture**:

1. **Hardware Layer**
   - Raspberry Pi 4 / 5
   - External USB 3.0 HDD / SSD
   - Gigabit Ethernet

2. **Backend Application Layer**
   - Node.js runtime
   - Express.js REST APIs
   - Authentication & authorization modules
   - File system & metadata services

3. **Client Interaction Layer**
   - Web browsers
   - Mobile devices
   - HTTP clients (Postman, fetch, axios)

---

## ⚙️ Technologies Used

### Backend
- Node.js (LTS)
- Express.js
- Prisma ORM
- JSON Web Tokens (JWT)
- bcrypt
- Multer
- fs & stream APIs
- PM2 (process manager)

### Storage & OS
- Raspberry Pi OS Lite
- ext4 filesystem
- USB 3.0 external storage

### Security
- Helmet (secure headers)
- Rate limiting
- Token expiration
- Directory traversal protection
- Google OAuth

---

## ✨ Key Features

### 🔐 Authentication & Security
- User registration & login
- JWT access and refresh tokens
- Google OAuth login
- Rate limiting & secure headers

### 📁 File Management
- Stream-based file uploads
- Large file downloads via streaming
- Folder hierarchy (UUID-based)
- File metadata management

### 🗑️ Trash & Recovery
- Soft delete (Trash system)
- Restore deleted files
- Permanent hard delete
- Account deletion & recovery window

### 📊 Quota Management
- Per-user storage quota
- Upload validation against quota
- Storage usage APIs

---

## 🚀 Installation & Setup (Raspberry Pi)

### 1️⃣ Update System

- sudo apt update && sudo apt full-upgrade -y
- sudo apt install git curl build-essential -y

### 2️⃣ Install Node.js

- curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
- sudo apt install -y nodejs

### 3️⃣ Clone Repository

- git clone https://github.com/Aditya-1708/MajorProj.git
- cd MajorProj

### 4️⃣ Install Dependencies

- npm install

### 5️⃣ Configure Environment Variables

- Create a .env file:

- PORT=3000
- JWT_SECRET=your_secret_key
- STORAGE_PATH=/mnt/cloud_storage

### 6️⃣ Start Server

- 'npm start' or 'pm2 start app.js'

- Server runs at: http://<raspberry-pi-ip>:3000

### 📈 Performance Summary

- Metric	Value
- Upload Speed	~14–18 MB/s
- Download Speed	~18–20 MB/s
- API Response Time	20–60 ms (idle)
- Concurrent Users	Up to 20
- Power Consumption	< 10 W

### ⚠️ Limitations

- No built-in RAID support
- LAN-only by default (remote access requires VPN/HTTPS)
- HTTP slower than SMB/NFS
- Hardware limits under extreme concurrency

### 🔮 Future Enhancements

- HTTPS & secure remote access
- RAID / distributed storage
- Admin monitoring dashboard
- Android & iOS mobile apps
- AI-based file classification
- Database-backed metadata indexing
- Multi-user collaboration & versioning

### 👤 Team

- Abhishek Agarwal
- Aditya S Gowda
- Aditya Umesh
- Amruth Shirin KH

- Department of Electronics and Communication Engineering
- VTU Major Project (2025–2026)

### 📜 License

- This project is intended for academic and educational use.
- You are free to modify and extend it for learning and research purposes.
