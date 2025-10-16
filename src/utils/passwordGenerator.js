// src/utils/passwordGenerator.js
export const generateSecurePassword = (length = 12) => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '@$!%*?&';
    const all = lowercase + uppercase + numbers + symbols;
    
    let password = '';
    
    // Ensure at least one of each character type
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += symbols.charAt(Math.floor(Math.random() * symbols.length));
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += all.charAt(Math.floor(Math.random() * all.length));
    }
    
    // Shuffle the password
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  };