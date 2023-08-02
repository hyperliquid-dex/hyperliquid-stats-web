import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  LineChart,
} from 'recharts';
import { useEffect, useState } from 'react';
import { Box, Text, useMediaQuery } from '@chakra-ui/react';
import { useRequest } from '@/hooks/useRequest';
import ChartWrapper, { CoinSelector } from '../../common/chartWrapper';
import { useIsMobile } from '@/hooks/isMobile';
import { CHART_HEIGHT } from '../../../constants';
import {
  tooltipFormatter,
  tooltipLabelFormatter,
  xAxisFormatter,
  formatterPercent,
} from '../../../helpers';
import { getTokenColor, initialTokensSelected } from '../../../constants/tokens';
import { liquidity_by_coin } from '../../../constants/api';

const REQUESTS = [liquidity_by_coin];

export default function Liquidity() {
  const [isMobile] = useIsMobile();

  const [formattedData0, setFormattedData0] = useState<any[]>([]);
  const [formattedData1000, setFormattedData1000] = useState<any[]>([]);
  const [formattedData3000, setFormattedData3000] = useState<any[]>([]);
  const [formattedData10000, setFormattedData10000] = useState<any[]>([]);

  const [coinKeys, setCoinKeys] = useState<any[]>([]);
  const [coinKeys0, setCoinKeys0] = useState<any[]>([]);
  const [coinKeys1000, setCoinKeys1000] = useState<any[]>([]);
  const [coinKeys3000, setCoinKeys3000] = useState<any[]>([]);
  const [coinKeys10000, setCoinKeys10000] = useState<any[]>([]);

  const [dataMode, setDataMode] = useState<'0' | '1000' | '3000' | '10000'>('0');
  const [coinsSelected, setCoinsSelected] = useState<string[]>(initialTokensSelected);

  const [dataLiqudity, loadingLiqudity, errorLiqudity] = useRequest(REQUESTS[0], [], 'chart_data');
  const loading = loadingLiqudity;
  const error = errorLiqudity;

  const controls = {
    toggles: [
      {
        text: 'Half Spread',
        event: () => setDataMode('0'),
        active: dataMode === '0',
      },
      {
        text: '$1k',
        event: () => setDataMode('1000'),
        active: dataMode === '1000',
      },
      {
        text: '$3k',
        event: () => setDataMode('3000'),
        active: dataMode === '3000',
      },
      {
        text: '$10k',
        event: () => setDataMode('10000'),
        active: dataMode === '10000',
      },
    ],
  };

  type InputData = {
    [key: string]: {
      median_slippage_0: number;
      median_slippage_1000: number;
      median_slippage_3000: number;
      median_slippage_10000: number;
      time: string;
    }[];
  };

  type OutputData = {
    median_slippage_0: { time: Date; [key: string]: number | Date | string }[];
    median_slippage_1000: { time: Date; [key: string]: number | Date | string }[];
    median_slippage_3000: { time: Date; [key: string]: number | Date | string }[];
    median_slippage_10000: { time: Date; [key: string]: number | Date | string }[];
  };

  const extractCoins = (data: InputData): string[] => {
    let coins = [];
    for (let coin of Object.keys(data)) {
      coins.push(coin);
    }
    return coins;
  };

  const transformData = (data: InputData): OutputData => {
    // Filter data for each category by top 10 coins
    const filteredData: InputData = {};
    for (let coin of coinsSelected) {
      filteredData[coin] = data[coin];
    }

    const median_slippage_0 = new Map<
      string,
      { time: Date; [key: string]: number | Date | string }
    >();
    const median_slippage_1000 = new Map<
      string,
      { time: Date; [key: string]: number | Date | string }
    >();
    const median_slippage_3000 = new Map<
      string,
      { time: Date; [key: string]: number | Date | string }
    >();
    const median_slippage_10000 = new Map<
      string,
      { time: Date; [key: string]: number | Date | string }
    >();

    for (let key in filteredData) {
      filteredData[key].forEach((record) => {
        const {
          time,
          median_slippage_0: val_0,
          median_slippage_1000: val_1000,
          median_slippage_3000: val_3000,
          median_slippage_10000: val_10000,
        } = record;

        const map0 = median_slippage_0.get(time) || { time: new Date(time), unit: '%' };
        const map1000 = median_slippage_1000.get(time) || { time: new Date(time), unit: '%' };
        const map3000 = median_slippage_3000.get(time) || { time: new Date(time), unit: '%' };
        const map10000 = median_slippage_10000.get(time) || { time: new Date(time), unit: '%' };

        map0[key] = val_0 * 100;
        map1000[key] = val_1000 * 100;
        map3000[key] = val_3000 * 100;
        map10000[key] = val_10000 * 100;

        median_slippage_0.set(time, map0);
        median_slippage_1000.set(time, map1000);
        median_slippage_3000.set(time, map3000);
        median_slippage_10000.set(time, map10000);
      });
    }

    return {
      median_slippage_0: Array.from(median_slippage_0.values()),
      median_slippage_1000: Array.from(median_slippage_1000.values()),
      median_slippage_3000: Array.from(median_slippage_3000.values()),
      median_slippage_10000: Array.from(median_slippage_10000.values()),
    };
  };

  const extractUniqueCoins = (
    data:
      | OutputData['median_slippage_1000']
      | OutputData['median_slippage_10000']
      | OutputData['median_slippage_3000']
  ): string[] => {
    const coinSet = new Set<string>();
    data.forEach((record) => {
      Object.keys(record).forEach((key) => {
        if (key !== 'time' && key !== 'unit') {
          coinSet.add(key);
        }
      });
    });
    return Array.from(coinSet);
  };

  const formatData = () => {
    const extractedCoinKeys = extractCoins(dataLiqudity);
    setCoinKeys(extractedCoinKeys);
    const formattedData = transformData(dataLiqudity);
    setFormattedData0(formattedData.median_slippage_0);
    setFormattedData1000(formattedData.median_slippage_1000);
    setFormattedData3000(formattedData.median_slippage_3000);
    setFormattedData10000(formattedData.median_slippage_10000);
    const formattedUniqueCoinKeys0 = extractUniqueCoins(formattedData.median_slippage_0);
    const formattedUniqueCoinKeys1000 = extractUniqueCoins(formattedData.median_slippage_1000);
    const formattedUniqueCoinKeys3000 = extractUniqueCoins(formattedData.median_slippage_3000);
    const formattedUniqueCoinKeys10000 = extractUniqueCoins(formattedData.median_slippage_10000);

    setCoinKeys0(formattedUniqueCoinKeys0);
    setCoinKeys1000(formattedUniqueCoinKeys1000);
    setCoinKeys3000(formattedUniqueCoinKeys3000);
    setCoinKeys10000(formattedUniqueCoinKeys10000);
  };

  useEffect(() => {
    if (!loading && !error) {
      formatData();
    }
  }, [loading]);

  const chartData =
    dataMode === '0'
      ? formattedData0
      : dataMode === '1000'
      ? formattedData1000
      : dataMode === '3000'
      ? formattedData3000
      : formattedData10000;

  const chartDataCoinKeys =
    dataMode === '0'
      ? coinKeys0
      : dataMode === '1000'
      ? coinKeys1000
      : dataMode === '3000'
      ? coinKeys3000
      : coinKeys10000;

  const coinSelectorsSort = (a: CoinSelector, b: CoinSelector) => {
    if (a.isChecked !== b.isChecked) {
      return a.isChecked ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  };

  const coinSelectors = coinKeys
    .map((coinKey: string) => {
      return {
        name: coinKey,
        event: () =>
          setCoinsSelected((coinsSelected) => {
            let newCoinsSelected = coinsSelected;
            if (coinsSelected.includes(coinKey)) {
              newCoinsSelected = coinsSelected.filter((e) => {
                return e !== coinKey;
              });
            } else {
              newCoinsSelected.push(coinKey);
            }
            formatData();
            return newCoinsSelected;
          }),
        isChecked: coinsSelected.includes(coinKey),
      };
    })
    .sort((a: CoinSelector, b: CoinSelector) => coinSelectorsSort(a, b));
  return (
    <ChartWrapper
      title='Slippage % by Trade Size'
      loading={loading}
      data={chartData}
      controls={controls}
      zIndex={8}
      coinSelectors={coinSelectors}
      isMobile={isMobile}
    >
      <ResponsiveContainer width='100%' height={CHART_HEIGHT}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray='15 15' opacity={0.1} />
          <XAxis
            dataKey='time'
            tickFormatter={xAxisFormatter}
            minTickGap={30}
            tick={{ fill: '#f9f9f9', fontSize: isMobile ? 14 : 15 }}
            tickMargin={10}
          />
          <YAxis
            width={45}
            tick={{ fill: '#f9f9f9', fontSize: isMobile ? 14 : 15 }}
            dx={6}
            tickFormatter={formatterPercent}
          />
          <Tooltip
            formatter={tooltipFormatter}
            labelFormatter={tooltipLabelFormatter}
            contentStyle={{
              textAlign: 'left',
              background: '#0A1F1B',
              borderColor: '#061412',
              boxShadow: '0px 0px 7px rgb(0 0 0 / 20%)',
              borderRadius: '26px',
              maxHeight: '500px',
            }}
            itemSorter={(item) => {
              return Number(item.value);
            }}
          />
          <Legend wrapperStyle={{ bottom: -5 }} />
          {chartDataCoinKeys.map((coinName, i) => {
            return (
              <Line
                isAnimationActive={false}
                type='monotone'
                dataKey={`${coinName}`}
                name={coinName.toString()}
                stroke={getTokenColor(coinName.toString())}
                key={i}
                dot={false}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
