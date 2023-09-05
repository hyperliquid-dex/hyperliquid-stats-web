import { CoinSelector } from '../components/common/chartWrapper';

const coinSelectorsSort = (a: CoinSelector, b: CoinSelector, specialKey?: string) => {
  if (a.name === specialKey) {
    return -1;
  }
  if (b.name === specialKey) {
    return 1;
  }
  if (a.isChecked !== b.isChecked) {
    return a.isChecked ? -1 : 1;
  }
  return a.name.localeCompare(b.name);
};

export const createCoinSelectors = (
  coinKeys: string[],
  coinsSelected: string[],
  setCoinsSelected: (arg: string[]) => any,
  formatData: ((arg: string[]) => any) | (() => any),
  noOtherOption?: boolean,
  specialKey?: string
) => {
  const emptySelection = noOtherOption ? [] : ['Other'];
  const deselectAll = {
    name: 'Deselect All',
    event: () => {
      setCoinsSelected(emptySelection);
    },
    isChecked: coinsSelected.length === 0,
  };

  const coinSelectors = coinKeys.map((coinKey: string) => {
    return {
      name: coinKey,
      event: () => {
        let newCoinsSelected = [...coinsSelected];
        if (coinsSelected.includes(coinKey)) {
          newCoinsSelected = newCoinsSelected.filter((e) => e !== coinKey);
        } else {
          newCoinsSelected.push(coinKey);
        }

        if (typeof formatData === 'function') {
          if (formatData.length > 0) {
            formatData(newCoinsSelected);
          } else {
            const noArgsFormatData = formatData as () => any;
            noArgsFormatData();
          }
        }
        setCoinsSelected(newCoinsSelected);
      },
      isChecked: coinsSelected.includes(coinKey),
    };
  });

  const sortedCoinSelectors = coinSelectors.sort((a, b) => coinSelectorsSort(a, b, specialKey));

  return [deselectAll, ...sortedCoinSelectors];
};
