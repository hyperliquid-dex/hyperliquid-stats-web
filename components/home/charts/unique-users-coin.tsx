import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line,
} from 'recharts';
import { useEffect, useState } from 'react';
import { Box, Text, useMediaQuery } from '@chakra-ui/react';
import { useRequest } from '@/hooks/useRequest';
import { useIsMobile } from '@/hooks/isMobile';

import ChartWrapper, { CoinSelector } from '../../common/chartWrapper';
import { CHART_HEIGHT, YAXIS_WIDTH, BRIGHT_GREEN } from '../../../constants';
import {
  tooltipFormatter,
  tooltipLabelFormatter,
  xAxisFormatter,
  yaxisFormatterNumber,
  yaxisFormatterPercent,
} from '../../../helpers';
import { getTokenColor } from '../../../constants/tokens';
import {
  cumulative_new_users,
  daily_unique_users,
  daily_unique_users_by_coin,
} from '../../../constants/api';

type DailyUniqueUsersByCoin = {
  time: string;
  coin: string;
  daily_unique_users: number;
  percentage_of_total_users: number;
  all: number;
};

type UniqueUserTradeData = {
  time: string;
  daily_unique_users: number;
};

type CumulativeNewUsersData = {
  time: string;
  daily_new_users: number;
  cumulative_new_users: number;
};

type GroupedTradeData = {
  time: Date;
  daily_unique_users: number;
  cumulative_unique_users: number;
  unit: string;
  [key: string]: number | Date | { [key: string]: number } | string | undefined;
};

type TempGroupedTradeData = {
  time: Date;
  coins: { [key: string]: number };
  //all: number;
  daily_unique_users: number;
  cumulative_unique_users: number;
  unit: string;
  [key: string]: number | Date | { [key: string]: number } | string | undefined;
};

const REQUESTS = [cumulative_new_users, daily_unique_users, daily_unique_users_by_coin];

export default function UniqueUsers() {
  const [isMobile] = useIsMobile();
  const [coinsSelected, setCoinsSelected] = useState<string[]>(['ETH', 'BTC', 'ARB', 'APE', 'ATOM', 'AVAX', 'BNB', 'COMP', 'CRV', 'DOGE','Other']);

  const [formattedData, setFormattedData] = useState<any[]>([]);
  const [coinKeys, setCoinKeys] = useState<any[]>([]);

  const [dataCumulativeNewUsers, loadingCumulativeNewUsers, errorCumulativeNewUsers] = useRequest(
    REQUESTS[0],
    [],
    'chart_data'
  );
  const [dataDailyUniqueUsers, loadingDailyUniqueUsers, errorDailyUniqueUsers] = useRequest(
    REQUESTS[1],
    [],
    'chart_data'
  );
  const [dataDailyUniqueUsersByCoin, loadingDailyUniqueUsersByCoin, errorDailyUniqueUsersByCoin] =
    useRequest(REQUESTS[2], [], 'chart_data');

  const loading =
    loadingCumulativeNewUsers || loadingDailyUniqueUsers || loadingDailyUniqueUsersByCoin;
  const error = errorCumulativeNewUsers || errorDailyUniqueUsers || errorDailyUniqueUsersByCoin;

  const formatTradesByCoinAndTime = (
    CoinsSelected: string[], 
    dataDailyUniqueUsersByCoin: DailyUniqueUsersByCoin[],
    uniqueUserTradeData: UniqueUserTradeData[],
    dataCumulativeNewUsers: CumulativeNewUsersData[]
  ): GroupedTradeData[] => {
    const temp: { [key: string]: TempGroupedTradeData } = {};
    const uniqueUserTradeDataMap: { [key: string]: number } = {};
    const cumulativeUniqueUserTradeDataMap: { [key: string]: number } = {};

    uniqueUserTradeData.forEach((item) => {
      uniqueUserTradeDataMap[item.time] = item.daily_unique_users;
    });

    dataCumulativeNewUsers.forEach((item) => {
      cumulativeUniqueUserTradeDataMap[item.time] = item.cumulative_new_users;
    });

    dataDailyUniqueUsersByCoin.forEach(
      ({ time, coin, daily_unique_users, percentage_of_total_users }) => {
        if (!temp[time]) {
          temp[time] = {
            time: new Date(time),
            coins: {},
            daily_unique_users: uniqueUserTradeDataMap[time] || 0,
            cumulative_unique_users: cumulativeUniqueUserTradeDataMap[time] || 0,
            unit: '%',
          };
        }
        temp[time].coins[coin] = (temp[time].coins[coin] || 0) + percentage_of_total_users * 100;
        temp[time][`${coin}_daily_unique_users`] = daily_unique_users;
      }
    );

    const selectedCoinData = (obj: { [coin: string]: number }) => {
      const selectedEntries = Object.entries(obj).filter(([coin]) => CoinsSelected.includes(coin) || coin==="all"); 
      const otherEntries = Object.entries(obj).filter(([coin]) => (!(CoinsSelected.includes(coin))) && (coin !== "all")); 
      const otherVolume = otherEntries.reduce((total, [, volume]) => total + volume, 0);
      return {
        ...Object.fromEntries(selectedEntries),
        Other: otherVolume,
      };
    };

    return Object.values(temp).map(({ time, coins, ...rest }) => {
      return {
        time: new Date(time),
        ...selectedCoinData(coins),
        ...rest,
        unit: '%',
      };
    });
  };

  const extractUniqueCoins = (CoinData: any): string[] => {
    const coinSet = new Set<string>();
    for (const data of CoinData) {
      coinSet.add(data.coin); 
    }
    const coinsArray = Array.from(coinSet);
    return coinsArray;
  };

  const formatData = (CoinsSelector: string[]) => {
    const formattedData = formatTradesByCoinAndTime(
      CoinsSelector,
      dataDailyUniqueUsersByCoin,
      dataDailyUniqueUsers,
      dataCumulativeNewUsers
    );
    const formattedUniqueCoinKeys = extractUniqueCoins(dataDailyUniqueUsersByCoin);
    setFormattedData(formattedData);
    setCoinKeys(formattedUniqueCoinKeys);
  };

  useEffect(() => {
    if (!loading && !error) {
      formatData(coinsSelected);
    }
  }, [loading]);

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
        {
          setCoinsSelected((coinsSelected) => {
            let newCoinsSelected = coinsSelected;
            if (coinsSelected.includes(coinKey)) {
              newCoinsSelected = coinsSelected.filter((e) => {
                return e !== coinKey;
              });
            } else {
              newCoinsSelected.pop(); 
              newCoinsSelected.push(coinKey);
              newCoinsSelected.push('Other'); 
            }
            formatData(newCoinsSelected); 
            return newCoinsSelected;
          });
        },
        isChecked: coinsSelected.includes(coinKey),
      };
    })
    .sort((a: CoinSelector, b: CoinSelector) => coinSelectorsSort(a, b));

  return (
    <ChartWrapper
      title='Unique Users Percentage By Coin'
      loading={loading}
      data={formattedData}
      zIndex={8}
      isMobile={isMobile}
      coinSelectors={coinSelectors}
    >
      <ResponsiveContainer width='100%' height={CHART_HEIGHT}>
        <ComposedChart data={formattedData}>
          <CartesianGrid strokeDasharray='15 15' opacity={0.1} />
          <XAxis
            dataKey='time'
            tickFormatter={xAxisFormatter}
            minTickGap={30}
            tick={{ fill: '#f9f9f9', fontSize: isMobile ? 14 : 15 }}
            tickMargin={10}
          />
          <YAxis
            domain={[0, 'auto']}
            interval='preserveStartEnd'
            tickCount={undefined}
            tickFormatter={yaxisFormatterPercent}
            width={55}
            tick={{ fill: '#f9f9f9', fontSize: isMobile ? 14 : 15 }}
          />
          <YAxis
            dataKey='daily_unique_users'
            orientation='right'
            yAxisId='right'
            tickFormatter={yaxisFormatterNumber}
            width={YAXIS_WIDTH}
            tick={{ fill: '#f9f9f9', fontSize: isMobile ? 14 : 15 }}
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
              return Number(item.value) * -1;
            }}
          />
          <Legend wrapperStyle={{ bottom: -5 }} />
          {coinsSelected.map((coinName, i) => {
            return (
              <Bar
                unit={''}
                isAnimationActive={false}
                type='monotone'
                dataKey={`${coinName}`}
                stackId='a'
                name={coinName.toString()}
                fill={getTokenColor(coinName.toString())}
                key={i}
                maxBarSize={14}
              />
            );
          })}
          <Line
            isAnimationActive={false}
            type='monotone'
            dot={false}
            strokeWidth={1}
            stroke={BRIGHT_GREEN}
            dataKey='daily_unique_users'
            yAxisId='right'
            name='Daily Unique Users'
          />
        </ComposedChart>
      </ResponsiveContainer>
      <Box w='100%' mt='3'>
        <Text color='#bbb'>
          The line is the number of unique addresses who used Hyperliquid each day, bars represent
          proportion of users who traded specific coins. Total exceeds 100% as users can trade
          multiple coins. Top 10 coins are shown separately and the rest are grouped as Other.
        </Text>
      </Box>
    </ChartWrapper>
  );
}
