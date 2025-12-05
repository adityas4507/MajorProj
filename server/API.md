# API Documentation

Base URL: `http://localhost:3000`

## Authentication

### Register
`POST /auth/register`
- **Body**: `{ "email": "user@example.com", "password": "password123" }`
- **Response**: User object + tokens

### Login
`POST /auth/login`
- **Body**: `{ "email": "user@example.com", "password": "password123" }`
- **Response**: User object + tokens

### Refresh Token
`POST /auth/refresh`
- **Body**: `{ "refreshToken": "..." }`
- **Response**: New access token

### Logout
`POST /auth/logout`
- **Body**: `{ "refreshToken": "..." }`
- **Response**: `{ "success": true }`

### Get Current User
`GET /auth/me`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: User profile

### Request Account Deletion
`POST /auth/request-account-deletion`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: Deletion schedule details

### Restore Account
`POST /auth/restore-account`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: Restoration success

## OAuth (Google)

### Initiate Login
`GET /auth/google`
- Redirects to Google login.

### Callback
`GET /auth/google/callback`
- Handles Google response and redirects to frontend with tokens.

## Account

### Get Quota
`GET /account/quota`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: `{ "used": 1024, "total": 10737418240 }`

## Files

### List Files/Folders
`GET /files/list`
- **Headers**: `Authorization: Bearer <access_token>`
- **Query Params**: `folderId` (optional) - ID of the folder to list. If omitted, lists root.
- **Response**: `{ "folders": [...], "files": [...] }`

### Upload File
`POST /files/upload`
- **Headers**: `Authorization: Bearer <access_token>`, `Content-Type: multipart/form-data`
- **Body**: `file` (binary), `folderId` (optional string)
- **Response**: File object

### Download File
`GET /files/:id/download`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: File stream (download)

### Delete File (Soft)
`DELETE /files/:id`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: `{ "success": true }`

### Hard Delete File
`DELETE /files/:id/hard`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: `{ "success": true }`

### Restore File
`POST /files/:id/restore`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: `{ "success": true }`

### List Trash
`GET /files/trash/list`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: List of deleted files

## Folders

### Create Folder
`POST /folders`
- **Headers**: `Authorization: Bearer <access_token>`
- **Body**: `{ "name": "New Folder", "parentId": "optional-uuid" }`
- **Response**: Folder object

### Get Folder Details
`GET /folders/:id`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: Folder object

### List Folder Contents
`GET /folders/:id/list`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: `{ "folders": [...], "files": [...] }`
