# Login Integration Guide

Base URL: `http://localhost:3000` (dev) — replace with production URL when deployed.

---

## 1. Login

**POST** `/api/auth/login`

No auth header required.

### Request Body
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

### Success Response `200`
```json
{
  "success": true,
  "message": "customer logged in successfully",
  "role": "customer",
  "token": "<access_token>",
  "refreshToken": "<refresh_token>",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "customer",
    "ref_no": "CUST001",
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

### Error Responses
| Status | Message |
|--------|---------|
| `400` | Email and password are required |
| `401` | Invalid email or password |

### What to store after login
```js
localStorage.setItem("token", data.token);
localStorage.setItem("refreshToken", data.refreshToken);
localStorage.setItem("role", data.role);
```

---

## 2. Using the Token (Authenticated Requests)

Add the access token to every protected API call:

```
Authorization: Bearer <access_token>
```

**Example (fetch):**
```js
const res = await fetch("/api/users/me", {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});
```

---

## 3. Verify Token

**POST** `/api/auth/verify-token`

Use on app load to check if the stored token is still valid and restore the session.

### Request Header
```
Authorization: Bearer <access_token>
```

### Success Response `200`
```json
{
  "success": true,
  "message": "Token is valid",
  "role": "customer",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "customer"
  }
}
```

### Error Responses
| Status | Message |
|--------|---------|
| `401` | Token expired |
| `401` | Invalid token |

---

## 4. Refresh Token

**POST** `/api/auth/refresh-token`

Access tokens expire in 1 day. Call this when you receive a `401 Token expired` to get a new access token without forcing the user to log in again.

### Request Body
```json
{
  "refreshToken": "<refresh_token>"
}
```

### Success Response `200`
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "token": "<new_access_token>"
}
```

### Error Responses
| Status | Message |
|--------|---------|
| `400` | Refresh token is required |
| `401` | Invalid refresh token |
| `401` | Refresh token expired. Please log in again |

**Recommended pattern:**
```js
async function apiFetch(url, options = {}) {
  let res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (res.status === 401) {
    const refreshRes = await fetch("/api/auth/refresh-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: localStorage.getItem("refreshToken") }),
    });

    if (refreshRes.ok) {
      const { token } = await refreshRes.json();
      localStorage.setItem("token", token);
      // Retry original request
      res = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      });
    } else {
      // Refresh token expired — force logout
      localStorage.clear();
      window.location.href = "/login";
    }
  }

  return res;
}
```

---

## 5. Logout

**POST** `/api/auth/logout`

### Request Header
```
Authorization: Bearer <access_token>
```

### Request Body
```json
{
  "refreshToken": "<refresh_token>"
}
```

### Success Response `200`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**After logout:**
```js
localStorage.removeItem("token");
localStorage.removeItem("refreshToken");
localStorage.removeItem("role");
window.location.href = "/login";
```

---

## 6. Change Password

**POST** `/api/auth/change-password`

### Request Header
```
Authorization: Bearer <access_token>
```

### Request Body
```json
{
  "oldPassword": "currentpassword",
  "newPassword": "newpassword123"
}
```

### Success Response `200`
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Error Responses
| Status | Message |
|--------|---------|
| `400` | Old password and new password are required |
| `400` | New password must be at least 6 characters |
| `401` | Old password is incorrect |
| `401` | Not authorized, no token |

---

## Token Lifetimes

| Token | Lifetime |
|-------|----------|
| Access token | 1 day |
| Refresh token | 30 days |

---

## User Roles

| Role | Description |
|------|-------------|
| `customer` | Regular customer user |
| `vendor` | Regular vendor user |
| `customer_admin` | Admin managing customers |
| `vendor_admin` | Admin managing vendors |
| `super_admin` | Full access |
