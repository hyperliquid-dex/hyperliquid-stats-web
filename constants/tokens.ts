import * as CryptoJS from 'crypto-js';

export const initialTokensSelected = [
  'ARB',
  'ATOM',
  'AVAX',
  'BNB',
  'BTC',
  'COMP',
  'CRV',
  'DOGE',
  'ETH',
];
export const initialTokensSelectedWithOther = [...initialTokensSelected, 'Other'];

export function getTokenColor(token: string): string {
  if (token == 'Other') {
    return 'pink';
  }
  // Use the CryptoJS library to get the MD5 hash of the string
  let hash = CryptoJS.MD5('col' + token);

  // Convert the hash into a hex string
  let color = hash.toString(CryptoJS.enc.Hex).substr(0, 6);

  return '#' + color;
}
