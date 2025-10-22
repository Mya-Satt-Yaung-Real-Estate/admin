// Debug utility to test API connection
export const debugApi = {
  async testNotifications() {
    try {
      console.log('🔍 Testing API connection...');
      
      // Check auth token
      const adminToken = localStorage.getItem('admin_token');
      const authStorage = localStorage.getItem('auth-storage');
      
      console.log('🔑 Admin token:', adminToken ? 'Found' : 'Not found');
      console.log('🔑 Auth storage:', authStorage ? 'Found' : 'Not found');
      
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        console.log('🔑 Parsed auth storage:', parsed);
      }
      
      // Test API call
      const response = await fetch('/api/admin-notifications', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': adminToken ? `Bearer ${adminToken}` : '',
        },
      });
      
      console.log('📡 API Response status:', response.status);
      console.log('📡 API Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Response data:', data);
      } else {
        const errorText = await response.text();
        console.log('❌ API Error:', errorText);
      }
      
    } catch (error) {
      console.error('💥 API Test failed:', error);
    }
  }
};

// Make it available globally for debugging
(window as any).debugApi = debugApi;
