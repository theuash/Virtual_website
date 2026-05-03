export const generateClientId = (countryCode = 'IN', category = 'CR') => {
  const prefix = 'V';
  const year = new Date().getFullYear().toString().slice(-2);
  
  // Random digit 0-9
  const randomDigit = Math.floor(Math.random() * 10);
  
  // 4 random letters with no repetitions
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomLetters = '';
  const lettersArray = letters.split('');
  
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * lettersArray.length);
    randomLetters += lettersArray.splice(randomIndex, 1)[0];
  }
  
  return `${prefix}-${countryCode}${year}${category}${randomDigit}${randomLetters}`;
};
