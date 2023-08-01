import * as CryptoJS from 'crypto-js';

export function getTokenColor(inputString: string): string {
    if (inputString == "Other") {
      return "pink";
    }
    // Use the CryptoJS library to get the MD5 hash of the string
    let hash = CryptoJS.MD5(inputString);

    // Convert the hash into a hex string
    let color = hash.toString(CryptoJS.enc.Hex).substr(0, 6);
    
    return "#" + color;
}

// export const getTokenColor = (token: string) => {
//   let char_sum = 0;
//   for (let char of token) {
//     char_sum += char.charCodeAt(0); 
//   }
//   char_sum %= COLORS.length; 
//   return COLORS[char_sum]; 
// };
