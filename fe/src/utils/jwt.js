/**
 * Decode JWT token without verification (client-side only)
 * Note: This only decodes the payload, it does NOT verify the signature
 * For security, always verify tokens on the server side
 */
export const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

/**
 * Get user info from JWT token
 */
export const getUserFromToken = (token) => {
  const payload = decodeJWT(token);
  if (!payload) return null;

  return {
    user_id: payload.sub,
    email: payload.email,
    // Generate avatar from email
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(payload.email.split('@')[0])}&background=4F46E5&color=fff`,
    name: payload.email.split('@')[0], // Use email prefix as name temporarily
  };
};

