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
import { useRequest } from '@/hooks/useRequest';
import ChartWrapper from '../../common/chartWrapper';
import { CHART_HEIGHT } from '../../../constants';
import {
  tooltipFormatter,
  xAxisFormatter,
  formatterPercent,
  tooltipFormatterDate,
} from '../../../helpers';
import { createCoinSelectors } from '../../../helpers/utils';

import { getTokenColor, initialTokensSelected } from '../../../constants/tokens';
import { liquidity_by_coin } from '../../../constants/api';
import { Box, Text } from '@chakra-ui/react';

const REQUESTS = [liquidity_by_coin];

export default function Liquidity() {
  const [formattedData0, setFormattedData0] = useState<any[]>([]);
  const [formattedData1000, setFormattedData1000] = useState<any[]>([]);
  const [formattedData10000, setFormattedData10000] = useState<any[]>([]);
  const [formattedData30000, setFormattedData30000] = useState<any[]>([]);
  const [formattedData100000, setFormattedData100000] = useState<any[]>([]);

  const [coinKeys, setCoinKeys] = useState<any[]>([]);
  const [coinKeys0, setCoinKeys0] = useState<any[]>([]);
  const [coinKeys1000, setCoinKeys1000] = useState<any[]>([]);
  const [coinKeys10000, setCoinKeys10000] = useState<any[]>([]);
  const [coinKeys30000, setCoinKeys30000] = useState<any[]>([]);
  const [coinKeys100000, setCoinKeys100000] = useState<any[]>([]);

  const [dataMode, setDataMode] = useState<'0' | '1000' | '10000' | '30000' | '100000'>('0');
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
        text: '$10k',
        event: () => setDataMode('10000'),
        active: dataMode === '10000',
      },
      {
        text: '$30k',
        event: () => setDataMode('30000'),
        active: dataMode === '30000',
      },
      {
        text: '$100k',
        event: () => setDataMode('100000'),
        active: dataMode === '100000',
      },
    ],
  };

  type InputData = {
    [key: string]: {
      median_slippage_0: number;
      median_slippage_1000: number;
      median_slippage_10000: number;
      median_slippage_30000: number;
      median_slippage_100000: number;
      time: string;
    }[];
  };

  type OutputData = {
    median_slippage_0: { time: Date; [key: string]: number | Date | string }[];
    median_slippage_1000: { time: Date; [key: string]: number | Date | string }[];
    median_slippage_10000: { time: Date; [key: string]: number | Date | string }[];
    median_slippage_30000: { time: Date; [key: string]: number | Date | string }[];
    median_slippage_100000: { time: Date; [key: string]: number | Date | string }[];
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
      if (coinsSelected.includes(coin)) {
        filteredData[coin] = data[coin];
      }
    }

    const median_slippage_0 = new Map<
      string,
      { time: Date; [key: string]: number | Date | string }
    >();
    const median_slippage_1000 = new Map<
      string,
      { time: Date; [key: string]: number | Date | string }
    >();
    const median_slippage_10000 = new Map<
      string,
      { time: Date; [key: string]: number | Date | string }
    >();
    const median_slippage_30000 = new Map<
      string,
      { time: Date; [key: string]: number | Date | string }
    >();
    const median_slippage_100000 = new Map<
      string,
      { time: Date; [key: string]: number | Date | string }
    >();

    for (let key in filteredData) {
      if (!filteredData[key]) {
        continue;
      }
      filteredData[key].forEach((record) => {
        const {
          time,
          median_slippage_0: val_0,
          median_slippage_1000: val_1000,
          median_slippage_10000: val_10000,
          median_slippage_30000: val_30000,
          median_slippage_100000: val_100000,
        } = record;

        const map0 = median_slippage_0.get(time) || { time: new Date(time), unit: '%' };
        const map1000 = median_slippage_1000.get(time) || { time: new Date(time), unit: '%' };
        const map10000 = median_slippage_10000.get(time) || { time: new Date(time), unit: '%' };
        const map30000 = median_slippage_30000.get(time) || { time: new Date(time), unit: '%' };
        const map100000 = median_slippage_100000.get(time) || { time: new Date(time), unit: '%' };

        map0[key] = val_0 * 100;
        map1000[key] = val_1000 * 100;
        map10000[key] = val_10000 * 100;
        map30000[key] = val_30000 * 100;
        map100000[key] = val_100000 * 100;

        median_slippage_0.set(time, map0);
        median_slippage_1000.set(time, map1000);
        median_slippage_10000.set(time, map10000);
        median_slippage_30000.set(time, map30000);
        median_slippage_100000.set(time, map100000);
      });
    }

    const sortByDate = (a: Date, b: Date) => {
      return a.valueOf() - b.valueOf();
    };

    return {
      median_slippage_0: Array.from(median_slippage_0.values()).sort((a, b) =>
        sortByDate(a.time, b.time)
      ),
      median_slippage_1000: Array.from(median_slippage_1000.values()).sort((a, b) =>
        sortByDate(a.time, b.time)
      ),
      median_slippage_10000: Array.from(median_slippage_10000.values()).sort((a, b) =>
        sortByDate(a.time, b.time)
      ),
      median_slippage_30000: Array.from(median_slippage_30000.values()).sort((a, b) =>
        sortByDate(a.time, b.time)
      ),
      median_slippage_100000: Array.from(median_slippage_100000.values()).sort((a, b) =>
        sortByDate(a.time, b.time)
      ),
    };
  };

  const extractUniqueCoins = (
    data: OutputData['median_slippage_1000'] | OutputData['median_slippage_10000']
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
    setFormattedData10000(formattedData.median_slippage_10000);
    setFormattedData30000(formattedData.median_slippage_30000);
    setFormattedData100000(formattedData.median_slippage_100000);

    const formattedUniqueCoinKeys0 = extractUniqueCoins(formattedData.median_slippage_0);
    const formattedUniqueCoinKeys1000 = extractUniqueCoins(formattedData.median_slippage_1000);
    const formattedUniqueCoinKeys10000 = extractUniqueCoins(formattedData.median_slippage_10000);
    const formattedUniqueCoinKeys30000 = extractUniqueCoins(formattedData.median_slippage_30000);
    const formattedUniqueCoinKeys100000 = extractUniqueCoins(formattedData.median_slippage_100000);

    setCoinKeys0(formattedUniqueCoinKeys0);
    setCoinKeys1000(formattedUniqueCoinKeys1000);
    setCoinKeys10000(formattedUniqueCoinKeys10000);
    setCoinKeys30000(formattedUniqueCoinKeys30000);
    setCoinKeys100000(formattedUniqueCoinKeys100000);
  };

  useEffect(() => {
    if (!loading && !error) {
      formatData();
    }
  }, [loading, coinKeys]);

  let chartData;
  let chartDataCoinKeys;
  switch (dataMode) {
    case '0':
      chartData = formattedData0;
      chartDataCoinKeys = coinKeys0;
      break;
    case '1000':
      chartData = formattedData1000;
      chartDataCoinKeys = coinKeys1000;
      break;
    case '10000':
      chartData = formattedData10000;
      chartDataCoinKeys = coinKeys10000;
      break;
    case '30000':
      chartData = formattedData30000;
      chartDataCoinKeys = coinKeys30000;
      break;
    case '100000':
      chartData = formattedData100000;
      chartDataCoinKeys = coinKeys100000;
      break;
  }

  const coinSelectors = createCoinSelectors(
    coinKeys,
    coinsSelected,
    setCoinsSelected,
    formatData,
    true
  );

  return (
    <ChartWrapper
      title='Slippage'
      loading={loading}
      controls={controls}
      zIndex={8}
      coinSelectors={coinSelectors}
    >
      <ResponsiveContainer width='99%' height={CHART_HEIGHT}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray='15 15' opacity={0.1} />
          <XAxis
            dataKey='time'
            tickFormatter={xAxisFormatter}
            minTickGap={30}
            tick={{ fill: '#f9f9f9' }}
            tickMargin={10}
          />
          <YAxis width={45} tick={{ fill: '#f9f9f9' }} dx={6} tickFormatter={formatterPercent} />
          <Tooltip
            formatter={tooltipFormatter}
            labelFormatter={tooltipFormatterDate}
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
          {coinsSelected.map((coinName, i) => {
            return (
              <Line
                isAnimationActive={false}
                type='monotone'
                dataKey={`${coinName}`}
                name={coinName.toString()}
                stroke={getTokenColor(coinName.toString())}
                key={i}
                dot={false}
                connectNulls
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
      <Box w='100%' mt='3'>
        <Text color='#bbb'>Slippage percentage by tade size.</Text>
      </Box>
    </ChartWrapper>
  );
}
