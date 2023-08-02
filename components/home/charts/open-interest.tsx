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
import { Box, Text, useMediaQuery } from '@chakra-ui/react';
import { useRequest } from '@/hooks/useRequest';
import ChartWrapper, { CoinSelector } from '../../common/chartWrapper';
import { BRIGHT_GREEN, CHART_HEIGHT, GREEN, YAXIS_WIDTH } from '../../../constants';
import {
  xAxisFormatter,
  tooltipLabelFormatter,
  yaxisFormatter,
  tooltipFormatterCurrency,
  tooltipFormatterDate,
} from '../../../helpers';
import { coinSelectorsSort } from "../../../helpers/utils"; 

import { getTokenColor } from '../../../constants/tokens';
import { open_interest } from '../../../constants/api';
import { useIsMobile } from '@/hooks/isMobile';

const REQUESTS = [open_interest];

export default function VolumeChart() {
  const [isMobile] = useIsMobile();
  const [coinKeys, setCoinKeys] = useState<any[]>([]);

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
    all: number;
    [key: string]: number | Date | string;
  };

  const groupByTime = (data: OpenInterestData[]): GroupedOpenInterestData[] => {
    const map = new Map<string, any>();
    const totalOpenInterestMap = new Map<string, number>();

    data.forEach((item) => {
      const key = item.time;
      if (!map.has(key)) {
        map.set(key, {
          time: new Date(key),
          Other: 0, // Initialize the 'Other' property
          all: 0, // Initialize the 'all' property
          unit: '$', // Initialize the 'unit' property
        });
      }
      const existingEntry = map.get(key);
      existingEntry[item.coin] = (existingEntry[item.coin] || 0) + item.open_interest;
      existingEntry.all += item.open_interest; // Aggregate total open interest for 'all' property

      // Aggregate total open interest for each coin
      totalOpenInterestMap.set(
        item.coin,
        (totalOpenInterestMap.get(item.coin) || 0) + item.open_interest
      );
    });

    // Get top 10 coins by total open interest
    const top10Coins = Array.from(totalOpenInterestMap.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([coin]) => coin);

    // Filter out the coins that are not in the top 10 and calculate 'Other'
    return Array.from(map.values()).map((record: any) => {
      let otherSum = 0;
      Object.keys(record).forEach((coin) => {
        if (coin !== 'time' && coin !== 'unit' && coin !== 'all' && !top10Coins.includes(coin)) {
          // Exclude 'unit' and 'all' from calculations
          otherSum += record[coin];
          delete record[coin];
        }
      });
      record.Other = otherSum; // Update 'Other' property with sum of other coins
      return record as GroupedOpenInterestData;
    });
  };

  const extractUniqueCoins = (formattedVolumeData: GroupedOpenInterestData[]): string[] => {
    const coinSet = new Set<string>();
    for (const data of formattedVolumeData) {
      Object.keys(data).forEach((coin) => {
        if (coin !== 'all' && coin !== 'time' && coin !== 'unit') {
          coinSet.add(coin);
        }
      });
    }
    const coinsArray = Array.from(coinSet);
    if (coinsArray.includes('Other')) {
      const index = coinsArray.indexOf('Other');
      coinsArray.splice(index, 1);
      coinsArray.push('Other');
    }
    return coinsArray;
  };

  const formatData = () => {
    const groupedData = groupByTime(dataOpenInterest);
    const uniqueCoins = extractUniqueCoins(groupedData);
    setFormattedData(groupedData);
    setCoinKeys(uniqueCoins);
  };

  useEffect(() => {
    if (!loading && !error) {
      formatData();
    }
  }, [loading]);

  return (
    <ChartWrapper title='Open Interest' loading={loading} data={formattedData} isMobile={isMobile}>
      <ResponsiveContainer width='100%' height={CHART_HEIGHT}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray='15 15' opacity={0.1} />
          <XAxis
            dataKey='time'
            tickFormatter={xAxisFormatter}
            minTickGap={30}
            tick={{ fill: '#f9f9f9', fontSize: isMobile ? 14 : 15 }}
            tickMargin={10}
          />
          <YAxis
            tickFormatter={yaxisFormatter}
            domain={[0, 'all']}
            width={YAXIS_WIDTH}
            tick={{ fill: '#f9f9f9', fontSize: isMobile ? 14 : 15 }}
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
          {coinKeys.map((coinName, i) => {
            return (
              <Line
                unit={''}
                isAnimationActive={false}
                dataKey={coinName}
                dot={false}
                name={coinName.toString()}
                stroke={getTokenColor(coinName.toString())}
                key={'open-i-rate-line-' + i}
              />
            );
          })}
          <Line
            unit={''}
            isAnimationActive={false}
            dataKey={'all'}
            dot={false}
            name={'Total open interest'}
            stroke={BRIGHT_GREEN}
            key={'total-open-interest'}
          />
        </LineChart>
      </ResponsiveContainer>
      <Box w='100%' mt='3'>
        <Text color='#bbb'>
          Top 10 Coins grouped by total volume over time and remaining coins grouped by Other
        </Text>
      </Box>
    </ChartWrapper>
  );
}
