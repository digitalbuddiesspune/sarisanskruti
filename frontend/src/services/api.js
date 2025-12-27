const API_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:7000'}/api`;

// Simple cache for API responses (30 seconds TTL)
const cache = new Map();
const CACHE_TTL = 30 * 1000; // 30 seconds

const getCacheKey = (url) => url;

const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCachedData = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

export const fetchSarees = async (category) => {
  try {
    const url = `${API_URL}/products${category ? `?category=${encodeURIComponent(category)}` : ''}`;
    const cacheKey = getCacheKey(url);
    
    // Check cache first
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch sarees');
    }
    const data = await response.json();
    
    // Cache the response
    setCachedData(cacheKey, data);
    
    return data;
  } catch (error) {
    console.error('Error fetching sarees:', error);
    throw error;
  }
};

export const fetchSareeById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/products/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch saree details');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching saree details:', error);
    throw error;
  }
};

export const fetchCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/header`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    const data = await response.json();
    return data.navigation.categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Fetch COLLECTION categories
export const fetchCollectionCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/header/categories/collection`);
    if (!response.ok) {
      throw new Error('Failed to fetch COLLECTION categories');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching COLLECTION categories:', error);
    throw error;
  }
};

// Fetch MEN categories
export const fetchMenCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/header/categories/men`);
    if (!response.ok) {
      throw new Error('Failed to fetch MEN categories');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching MEN categories:', error);
    throw error;
  }
};

// Fetch WOMEN categories
export const fetchWomenCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/header/categories/women`);
    if (!response.ok) {
      throw new Error('Failed to fetch WOMEN categories');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching WOMEN categories:', error);
    throw error;
  }
};

// Fetch BOYS categories
export const fetchBoysCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/header/categories/boys`);
    if (!response.ok) {
      throw new Error('Failed to fetch BOYS categories');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching BOYS categories:', error);
    throw error;
  }
};

// Fetch GIRLS categories
export const fetchGirlsCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/header/categories/girls`);
    if (!response.ok) {
      throw new Error('Failed to fetch GIRLS categories');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching GIRLS categories:', error);
    throw error;
  }
};

// Fetch SISHU categories
export const fetchSishuCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/header/categories/sishu`);
    if (!response.ok) {
      throw new Error('Failed to fetch SISHU categories');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching SISHU categories:', error);
    throw error;
  }
};

export const searchProducts = async (query) => {
  try {
    const response = await fetch(`${API_URL}/header/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Failed to search products');
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

const authHeaders = () => {
  const token = (() => { try { return localStorage.getItem('auth_token'); } catch { return null; } })();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getMyAddress = async () => {
  const res = await fetch(`${API_URL}/address/me`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch address');
  return res.json();
};

export const saveMyAddress = async (payload) => {
  const res = await fetch(`${API_URL}/address`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to save address');
  return res.json();
};

export const updateAddressById = async (id, payload) => {
  const res = await fetch(`${API_URL}/address/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to update address');
  return res.json();
};

export const deleteAddressById = async (id) => {
  const res = await fetch(`${API_URL}/address/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to delete address');
  return res.json();
};

export const createPayUTxn = async (amount, name, email, phone) => {
  const res = await fetch(`${API_URL}/payment/payu/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ amount, name, email, phone }),
    credentials: 'include',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || 'Failed to create PayU transaction');
  }
  return res.json();
};

export const verifyPayment = async (payload) => {
  const res = await fetch(`${API_URL}/payment/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to verify payment');
  return res.json();
};

export const createCODOrder = async () => {
  const res = await fetch(`${API_URL}/payment/cod/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    credentials: 'include',
  });
  if (!res.ok) {
    let errorMessage = 'Failed to create COD order';
    try {
      const errorData = await res.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch (e) {
      // If response is not JSON, try to get text
      try {
        const text = await res.text();
        errorMessage = text || errorMessage;
      } catch (textErr) {
        errorMessage = `HTTP ${res.status}: ${res.statusText}`;
      }
    }
    throw new Error(errorMessage);
  }
  return res.json();
};

export const getMyOrders = async () => {
  const res = await fetch(`${API_URL}/orders`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
};
