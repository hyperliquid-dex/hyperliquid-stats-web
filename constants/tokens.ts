import * as CryptoJS from 'crypto-js';


export const initialTokensSelected = ['ETH', 'BTC', 'ARB', 'APE', 'ATOM', 'AVAX', 'BNB', 'COMP', 'CRV', 'DOGE']; 
export const initialTokensSelectedWithOther = ['ETH', 'BTC', 'ARB', 'APE', 'ATOM', 'AVAX', 'BNB', 'COMP', 'CRV', 'DOGE','Other']; 

export function getTokenColor(inputString: string): string {
    if (inputString == "Other") {
      return "pink";
    }
    // Use the CryptoJS library to get the MD5 hash of the string
    let hash = CryptoJS.MD5("col"+inputString);

    // Convert the hash into a hex string
    let color = hash.toString(CryptoJS.enc.Hex).substr(0, 6);
    
    return "#" + color;
}
