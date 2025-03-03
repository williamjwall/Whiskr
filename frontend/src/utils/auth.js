// frontend/src/utils/auth.js

// Store user authentication data
export function storeUserAuth(token, userId, email) {
  console.log('Storing auth data:', { token: !!token, userId, email });
  
  if (!token || !userId) {
    console.error('Invalid auth data provided:', { token: !!token, userId });
    
    // If we have a token but no userId, try to extract it from the JWT
    if (token && !userId) {
      try {
        // JWT format: header.payload.signature
        const payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload));
        userId = decodedPayload.id;
        console.log('Extracted userId from token:', userId);
        
        if (!userId) {
          console.error('Failed to extract valid userId from token');
          return false;
        }
      } catch (err) {
        console.error('Failed to extract userId from token:', err);
        return false;
      }
    } else if (!token) {
      return false;
    }
  }
  
  try {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('userEmail', email || '');
    
    // Verify storage worked
    const storedUserId = localStorage.getItem('userId');
    console.log('Stored userId verification:', storedUserId);
    
    return storedUserId === userId;
  } catch (error) {
    console.error('Error storing auth data:', error);
    return false;
  }
}

// Get user authentication data
export function getUserAuth() {
  try {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const email = localStorage.getItem('userEmail');
    
    console.log('Retrieved auth data:', { 
      hasToken: !!token, 
      userId, 
      email 
    });
    
    return { token, userId, email };
  } catch (error) {
    console.error('Error retrieving auth data:', error);
    return { token: null, userId: null, email: null };
  }
}

// Clear user authentication data
export function clearUserAuth() {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    return true;
  } catch (error) {
    console.error('Error clearing auth data:', error);
    return false;
  }
}

// Check if user is authenticated
export function isAuthenticated() {
  const { token, userId } = getUserAuth();
  return !!token && !!userId;
} 