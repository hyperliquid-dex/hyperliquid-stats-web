import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  ResponsiveContainer,
  Line,
} from 'recharts';
import { useEffect, useState } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { useRequest } from '@/hooks/useRequest';
import ChartWrapper from '../../common/chartWrapper';
import { BRIGHT_GREEN, CHART_HEIGHT, YAXIS_WIDTH } from '../../../constants';
import {
  xAxisFormatter,
  yaxisFormatter,
  tooltipFormatterCurrency,
  tooltipFormatterDate,
} from '../../../helpers';

import { getTokenColor, initialTokensSelectedWithOther } from '../../../constants/tokens';
import { open_interest } from '../../../constants/api';
import { createCoinSelectors } from '@/helpers/utils';

const REQUESTS = [open_interest];

export default function OpenInterestChart() {
  const [coins, setCoins] = useState<any[]>([]);
  const initialTokensSelected = [...initialTokensSelectedWithOther, 'All'];
  const [coinsSelected, setCoinsSelected] = useState<string[]>(initialTokensSelected);

  const [formattedData, setFormattedData] = useState<any[]>([]);
  const [dataOpenInterest, loadingOpenInterest, errorOpenInterest] = useRequest(
    REQUESTS[0],
    [],
    'chart_data'
  );

  const loading = loadingOpenInterest;
  const error = errorOpenInterest;

  type OpenInterestData = { time: string; coin: string; open_interest: number };
  type GroupedOpenInterestData = {
    time: Date;
    unit: string;
    All: number;
    [key: string]: number | Date | string;
  };

  const groupByTime = (data: OpenInterestData[]): [GroupedOpenInterestData[], string[]] => {
    const map = new Map<string, any>();
    const totalOpenInterestMap = new Map<string, number>();
    const uniqueCoins = new Set<string>();

    data.forEach((item) => {
      const key = item.time;
      if (!map.has(key)) {
        map.set(key, {
          time: new Date(key),
          All: 0,
          unit: '$',
        });
      }
      const existingEntry = map.get(key);
      existingEntry[item.coin] = (existingEntry[item.coin] || 0) + item.open_interest;
      existingEntry.All += item.open_interest;

      totalOpenInterestMap.set(
        item.coin,
        (totalOpenInterestMap.get(item.coin) || 0) + item.open_interest
      );
    });

    map.forEach((entry) => {
      const coinEntries = Object.entries(entry).filter(
        ([key]) =>
          key !== 'time' &&
          key !== 'total' &&
          key !== 'cumulative' &&
          key !== 'other' &&
          key !== 'unit' &&
          key !== 'Other'
      );
      coinEntries.forEach(([coin]) => uniqueCoins.add(coin));
    });
    const result = Array.from(map.values());
    return [result, Array.from(uniqueCoins)];
  };

  const formatData = () => {
    const [groupedData, coins] = groupByTime(dataOpenInterest);
    setCoins(coins);
    setFormattedData(groupedData);
  };

  useEffect(() => {
    if (!loading && !error) {
      formatData();
    }
  }, [loading]);

  const coinSelectors = createCoinSelectors(
    coins,
    coinsSelected,
    setCoinsSelected,
    formatData,
    true,
    'All'
  );

  return (
    <ChartWrapper title='Open Interest' loading={loading} coinSelectors={coinSelectors}>
      <ResponsiveContainer width='99%' height={CHART_HEIGHT}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray='15 15' opacity={0.1} />
          <XAxis
            dataKey='time'
            tickFormatter={xAxisFormatter}
            minTickGap={30}
            tick={{ fill: '#f9f9f9' }}
            tickMargin={10}
          />
          <YAxis
            tickFormatter={yaxisFormatter}
            domain={[0, 'All']}
            width={YAXIS_WIDTH}
            tick={{ fill: '#f9f9f9' }}
            dx={6}
          />
          <Tooltip
            formatter={tooltipFormatterCurrency}
            labelFormatter={tooltipFormatterDate}
            contentStyle={{
              textAlign: 'left',
              background: '#0A1F1B',
              borderColor: '#061412',
              color: '#fff',
              boxShadow: '0px 0px 7px rgb(0 0 0 / 20%)',
              borderRadius: '26px',
              maxHeight: '500px',
            }}
            itemSorter={(item) => {
              return Number(item.value) * -1;
            }}
          />
          <Legend wrapperStyle={{ bottom: -5 }} />
          {coinsSelected.map((coinName, i) => {
            return (
              <Line
                unit={''}
                isAnimationActive={false}
                dataKey={coinName}
                dot={false}
                name={coinName === 'All' ? 'Total open interest' : coinName.toString()}
                stroke={coinName === 'All' ? BRIGHT_GREEN : getTokenColor(coinName.toString())}
                key={'open-i-rate-line-' + i}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
