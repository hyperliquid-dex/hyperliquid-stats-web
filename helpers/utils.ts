import { CoinSelector } from '../components/common/chartWrapper';

const coinSelectorsSort = (a: CoinSelector, b: CoinSelector) => {
  if (a.isChecked !== b.isChecked) {
    return a.isChecked ? -1 : 1;
  }
  return a.name.localeCompare(b.name);
};

export const createCoinSelectors = (
  coinKeys: string[],
  coinsSelected: string[],
  setCoinsSelected: (arg: string[]) => any,
  formatData: ((arg: string[]) => any) | (() => any)
) => {
  return coinKeys
    .map((coinKey: string) => {
      return {
        name: coinKey,
        event: () => {
          let newCoinsSelected = coinsSelected;
          if (coinsSelected.includes(coinKey)) {
            newCoinsSelected = coinsSelected.filter((e) => {
              return e !== coinKey;
            });
          } else {
            newCoinsSelected.push(coinKey);
          }
          if (formatData.length > 0) {
            formatData(newCoinsSelected);
          } else {
            const noArgsFormatData = formatData as () => any;
            noArgsFormatData();
          }
          setCoinsSelected(newCoinsSelected);
        },
        isChecked: coinsSelected.includes(coinKey),
      };
    })
    .sort((a: CoinSelector, b: CoinSelector) => coinSelectorsSort(a, b));
};
