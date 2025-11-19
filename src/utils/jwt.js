// utils/jwt.js
// Narzędzia do bezpiecznego zarządzania JWT tokenem

/**
 * Dekoduje JWT token (bez weryfikacji podpisu!)
 * Uwaga: To tylko parsuje payload, nie sprawdza autentyczności!
 */
export const decodeToken = (token) => {
    try {
      // JWT składa się z 3 części oddzielonych kropkami: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Nieprawidłowy format tokenu');
      }
  
      // Dekoduj payload (środkową część)
      const payload = parts[1];
      const decoded = JSON.parse(atob(payload));
      
      return decoded;
    } catch (error) {
      return null;
    }
  };
  

  export const isTokenValid = (token) => {
    if (!token) return false;
  
    try {
      const decoded = decodeToken(token);
      if (!decoded || !decoded.exp) return false;
  
      // exp jest w sekundach, Date.now() w milisekundach
      const currentTime = Date.now() / 1000;
      
      // Dodaj bufor 30 sekund przed wygaśnięciem
      return decoded.exp > (currentTime + 30);
    } catch {
      return false;
    }
  };
  
  /**
   * Pobiera email użytkownika z tokenu
   */
  export const getEmailFromToken = (token) => {
    const decoded = decodeToken(token);
    return decoded?.sub || decoded?.email || null;
  };
  
  /**
   * Pobiera role użytkownika z tokenu
   */
  export const getRolesFromToken = (token) => {
    const decoded = decodeToken(token);
    let roles = decoded?.roles || decoded?.authorities || [];
  
    // 🛡 NORMALIZACJA
    if (!roles) return [];
  
    // Jeśli backend zwraca STRING → zmień na TABLICĘ
    if (typeof roles === "string") return [roles];
  
    // Jeśli backend zwraca pojedyńczy obiekt → zmień na tablicę
    if (!Array.isArray(roles)) return [roles];
  
    return roles;
  };
  
  export const hasRole = (token, roleName) => {
    const roles = getRolesFromToken(token);
  
    return roles.some(role => {
      if (!role) return false;
  
      const roleStr = typeof role === "string"
        ? role
        : role.authority || role.role || JSON.stringify(role);
  
      return (
        roleStr === roleName ||
        roleStr.toUpperCase() === roleName.toUpperCase()
      );
    });
  };
  
  /**
   * Zwraca czas wygaśnięcia tokenu jako Date
   */
  export const getTokenExpiration = (token) => {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return null;
    
    return new Date(decoded.exp * 1000);
  };
  
  /**
   * Zwraca ile sekund zostało do wygaśnięcia
   */
  export const getTimeUntilExpiration = (token) => {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return 0;
    
    const currentTime = Date.now() / 1000;
    return Math.max(0, decoded.exp - currentTime);
  };
  
  /**
   * Formatuje czas do czytelnej postaci (np. "5 minut")
   */
  export const formatTimeRemaining = (seconds) => {
    if (seconds < 60) {
      return `${Math.floor(seconds)} sekund`;
    } else if (seconds < 3600) {
      return `${Math.floor(seconds / 60)} minut`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  };
  
  /**
   * Bezpiecznie pobiera token z localStorage
   */
  export const getStoredToken = () => {
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) return null;
      
      // Sprawdź czy token jest ważny
      if (!isTokenValid(token)) {
        // Token wygasł - usuń go
        removeStoredToken();
        return null;
      }
      
      return token;
    } catch {
      return null;
    }
  };
  
  /**
   * Bezpiecznie zapisuje token do localStorage
   */
  export const saveToken = (token) => {
    try {
      if (!token) {
        throw new Error('Token jest pusty');
      }
      
      // Sprawdź czy token ma prawidłowy format
      if (!isTokenValid(token)) {
        throw new Error('Token jest nieprawidłowy lub wygasł');
      }
      
      localStorage.setItem('jwtToken', token);
      
      // Zapisz też email jeśli jest w tokenie
      const email = getEmailFromToken(token);
      if (email) {
        localStorage.setItem('userEmail', email);
      }
      
      return true;
    } catch (error) {
      console.error('Błąd zapisywania tokenu:', error);
      return false;
    }
  };
  
  /**
   * Usuwa token z localStorage
   */
  export const removeStoredToken = () => {
    try {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('userEmail');
    } catch (error) {
      console.error('Błąd usuwania tokenu:', error);
    }
  };
  
  /**
   * Sprawdza czy użytkownik jest adminem
   */
  export const isAdmin = (token) => {
    return hasRole(token, 'ADMIN') || hasRole(token, 'ROLE_ADMIN');
  };
  

  export const startTokenExpirationCheck = (onExpired) => {
    const checkInterval = setInterval(() => {
      const token = getStoredToken();
      
      if (!token) {
        clearInterval(checkInterval);
        if (onExpired) onExpired();
        return;
      }
      
      const timeLeft = getTimeUntilExpiration(token);
      

      // Jeśli token wygasł
      if (timeLeft <= 0) {
        clearInterval(checkInterval);
        removeStoredToken();
        if (onExpired) onExpired();
      }
    }, 60000); 
    
    return checkInterval; 
  };
  
 