# Frontend Integration Guide

## Getting User Permissions

### On Login/App Load
```javascript
// After successful login, fetch user permissions
const fetchUserPermissions = async (token) => {
  const response = await fetch('http://localhost:3000/api/permissions/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data.data; // Array of permissions
};

// Example response:
// [
//   {
//     "id": 1,
//     "screen_name": "Users Management",
//     "screen_code": "USERS",
//     "can_read": true,
//     "can_write": false,
//     "can_modify": false,
//     "can_delete": false
//   },
//   {
//     "id": 2,
//     "screen_name": "Items Management",
//     "screen_code": "ITEMS",
//     "can_read": true,
//     "can_write": true,
//     "can_modify": true,
//     "can_delete": false
//   }
// ]
```

### Store in State Management

#### React Context
```javascript
// PermissionContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserPermissions(token).then(perms => {
        setPermissions(perms);
        setLoading(false);
      });
    }
  }, []);

  const hasPermission = (screenCode, permissionType) => {
    const screen = permissions.find(p => p.screen_code === screenCode);
    if (!screen) return false;
    return screen[`can_${permissionType}`] === true;
  };

  const canRead = (screenCode) => hasPermission(screenCode, 'read');
  const canWrite = (screenCode) => hasPermission(screenCode, 'write');
  const canModify = (screenCode) => hasPermission(screenCode, 'modify');
  const canDelete = (screenCode) => hasPermission(screenCode, 'delete');

  return (
    <PermissionContext.Provider value={{ 
      permissions, 
      loading,
      canRead, 
      canWrite, 
      canModify, 
      canDelete 
    }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => useContext(PermissionContext);
```

#### Redux
```javascript
// permissionSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchPermissions = createAsyncThunk(
  'permissions/fetch',
  async (token) => {
    const response = await fetch('http://localhost:3000/api/permissions/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    return data.data;
  }
);

const permissionSlice = createSlice({
  name: 'permissions',
  initialState: {
    data: [],
    loading: false
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPermissions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      });
  }
});

export default permissionSlice.reducer;

// Selectors
export const selectCanRead = (screenCode) => (state) => {
  const screen = state.permissions.data.find(p => p.screen_code === screenCode);
  return screen?.can_read || false;
};

export const selectCanWrite = (screenCode) => (state) => {
  const screen = state.permissions.data.find(p => p.screen_code === screenCode);
  return screen?.can_write || false;
};

export const selectCanModify = (screenCode) => (state) => {
  const screen = state.permissions.data.find(p => p.screen_code === screenCode);
  return screen?.can_modify || false;
};

export const selectCanDelete = (screenCode) => (state) => {
  const screen = state.permissions.data.find(p => p.screen_code === screenCode);
  return screen?.can_delete || false;
};
```

## UI Implementation

### Hide/Show Buttons
```javascript
import { usePermissions } from './PermissionContext';

function ItemsPage() {
  const { canRead, canWrite, canModify, canDelete } = usePermissions();

  if (!canRead('ITEMS')) {
    return <div>Access Denied</div>;
  }

  return (
    <div>
      <h1>Items</h1>
      
      {canWrite('ITEMS') && (
        <button onClick={handleCreate}>Create New Item</button>
      )}

      <table>
        {/* ... table content ... */}
        <td>
          {canModify('ITEMS') && (
            <button onClick={handleEdit}>Edit</button>
          )}
          {canDelete('ITEMS') && (
            <button onClick={handleDelete}>Delete</button>
          )}
        </td>
      </table>
    </div>
  );
}
```

### Route Protection
```javascript
import { Navigate } from 'react-router-dom';
import { usePermissions } from './PermissionContext';

function ProtectedRoute({ children, screenCode, permissionType = 'read' }) {
  const { hasPermission, loading } = usePermissions();

  if (loading) return <div>Loading...</div>;

  if (!hasPermission(screenCode, permissionType)) {
    return <Navigate to="/access-denied" />;
  }

  return children;
}

// Usage in routes
<Route 
  path="/items" 
  element={
    <ProtectedRoute screenCode="ITEMS" permissionType="read">
      <ItemsPage />
    </ProtectedRoute>
  } 
/>
```

### Disable Form Fields
```javascript
function ItemForm({ item }) {
  const { canModify } = usePermissions();
  const isReadOnly = !canModify('ITEMS');

  return (
    <form>
      <input 
        name="itemName" 
        value={item.itemName}
        disabled={isReadOnly}
      />
      <input 
        name="price" 
        value={item.price}
        disabled={isReadOnly}
      />
      {canModify('ITEMS') && (
        <button type="submit">Save</button>
      )}
    </form>
  );
}
```

## Screen Codes Reference

```javascript
const SCREENS = {
  USERS: 'USERS',
  ITEMS: 'ITEMS',
  CONTACTS: 'CONTACTS',
  PURCHASE_ORDERS: 'PURCHASE_ORDERS',
  SALES_ORDERS: 'SALES_ORDERS',
  INVOICES: 'INVOICES',
  PURCHASE_INVOICES: 'PURCHASE_INVOICES',
  PURCHASE_RECEIPTS: 'PURCHASE_RECEIPTS',
  PURCHASE_PRICES: 'PURCHASE_PRICES',
  ITEM_CATEGORIES: 'ITEM_CATEGORIES',
  PAYMENTS: 'PAYMENTS',
  UNIT_OF_MEASURES: 'UNIT_OF_MEASURES',
  PARTNER_LOCATIONS: 'PARTNER_LOCATIONS',
  NO_SERIES: 'NO_SERIES',
  VAT_MASTER: 'VAT_MASTER'
};

export default SCREENS;
```

## Complete Example

```javascript
// App.js
import { PermissionProvider } from './PermissionContext';

function App() {
  return (
    <PermissionProvider>
      <Router>
        <Routes>
          <Route path="/items" element={<ItemsPage />} />
          <Route path="/orders" element={<OrdersPage />} />
        </Routes>
      </Router>
    </PermissionProvider>
  );
}

// ItemsPage.js
import { usePermissions } from './PermissionContext';
import SCREENS from './constants/screens';

function ItemsPage() {
  const { canRead, canWrite, canModify, canDelete } = usePermissions();

  // Check access
  if (!canRead(SCREENS.ITEMS)) {
    return <AccessDenied />;
  }

  return (
    <div>
      <h1>Items Management</h1>
      
      {canWrite(SCREENS.ITEMS) && (
        <button onClick={handleCreate}>+ New Item</button>
      )}

      <ItemList 
        canEdit={canModify(SCREENS.ITEMS)}
        canDelete={canDelete(SCREENS.ITEMS)}
      />
    </div>
  );
}
```

## Admin Panel (Super Admin Only)

```javascript
function UserPermissionManager() {
  const [userId, setUserId] = useState('');
  const [permissions, setPermissions] = useState([]);

  const loadUserPermissions = async () => {
    const response = await fetch(`/api/permissions/user/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setPermissions(data.data);
  };

  const updatePermission = async (screenId, permType, value) => {
    const screen = permissions.find(p => p.id === screenId);
    const updated = { ...screen, [permType]: value };
    
    await fetch(`/api/permissions/user/${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        screen_id: screenId,
        can_read: updated.can_read,
        can_write: updated.can_write,
        can_modify: updated.can_modify,
        can_delete: updated.can_delete
      })
    });
    
    loadUserPermissions(); // Reload
  };

  return (
    <div>
      <input 
        placeholder="User ID" 
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <button onClick={loadUserPermissions}>Load</button>

      <table>
        <thead>
          <tr>
            <th>Screen</th>
            <th>Read</th>
            <th>Write</th>
            <th>Modify</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {permissions.map(perm => (
            <tr key={perm.id}>
              <td>{perm.screen_name}</td>
              <td>
                <input 
                  type="checkbox" 
                  checked={perm.can_read}
                  onChange={(e) => updatePermission(perm.id, 'can_read', e.target.checked)}
                />
              </td>
              <td>
                <input 
                  type="checkbox" 
                  checked={perm.can_write}
                  onChange={(e) => updatePermission(perm.id, 'can_write', e.target.checked)}
                />
              </td>
              <td>
                <input 
                  type="checkbox" 
                  checked={perm.can_modify}
                  onChange={(e) => updatePermission(perm.id, 'can_modify', e.target.checked)}
                />
              </td>
              <td>
                <input 
                  type="checkbox" 
                  checked={perm.can_delete}
                  onChange={(e) => updatePermission(perm.id, 'can_delete', e.target.checked)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```
