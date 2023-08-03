import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Bar,
  Cell,
  Line,
  ComposedChart,
} from 'recharts';
import { Box, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useRequest } from '@/hooks/useRequest';

import ChartWrapper from '../../common/chartWrapper';
import { BLUE, BRIGHT_GREEN, CHART_HEIGHT, GREEN, ORANGE, RED } from '../../../constants';
import {
  tooltipFormatterDate,
  tooltipFormatterCurrency,
  xAxisFormatter,
  yaxisFormatter,
  tooltipFormatterLongShort,
} from '../../../helpers';

import { getTokenColor } from '@/constants/tokens';
import { asset_ctxs, hlp_liquidator_pnl, hlp_positions } from '@/constants/api';
const REQUESTS = [hlp_positions, asset_ctxs, hlp_liquidator_pnl];

export default function Hlp() {
  const [dataHlpPositions, loadingDataHlpPositions, errorDataHlpPositions] = useRequest(
    REQUESTS[0],
    [],
    'chart_data'
  );
  const [assetCtxs, loadingAssetCtxs, errorAssetCtxs] = useRequest(REQUESTS[1], [], 'chart_data');
  const [dataHlpPnL, loadingHlpLiquidatorPNL, errorHlpLiquidatorPNL] = useRequest(
    REQUESTS[2],
    [],
    'chart_data'
  );
  const [dataMode, setDataMode] = useState<'COINS' | 'NET' | 'PNL' | 'HEDGED'>('PNL');
  const [coins, setCoins] = useState<string[]>([]);

  const [formattedHlpPnL, setFormattedHlpPnL] = useState<HlpPnl[]>([]);
  const [formattedData, setFormattedData] = useState<GroupedData[]>([]);

  const loading = loadingAssetCtxs | loadingDataHlpPositions | loadingHlpLiquidatorPNL;
  const error = errorAssetCtxs | errorDataHlpPositions | errorHlpLiquidatorPNL;

  type HlpPosition = {
    time: string;
    coin: string;
    daily_ntl: number;
    daily_ntl_abs: number;
  };

  type AssetCtx = {
    time: string;
    coin: string;
    avg_oracle_px: number;
    first_oracle_px: number;
    avg_open_interest: number;
  };

  type HlpPnl = {
    time: Date;
    pnl: number;
    cumulativePnl: number;
  };

  type GroupedData = {
    time: Date;
    daily_ntl: number;
    [coin: string]: any;
    hedged_pnl: number;
  };

  const getOraclePxs = (assetCtxs: AssetCtx[]): Map<string, number> => {
    const map = new Map<string, number>();
    assetCtxs.forEach((item) => {
      map.set(item.coin + item.time, item.first_oracle_px);
    });
    return map;
  };

  const makeHlpPnl = (
    dataHlpPnL: {
      time: string;
      total_pnl: number;
    }[]
  ): Map<string, HlpPnl> => {
    const map = new Map<string, HlpPnl>();
    let cumulativePnl = 0;
    dataHlpPnL.forEach((item) => {
      cumulativePnl += item.total_pnl;
      map.set(item.time, {
        time: new Date(item.time),
        pnl: item.total_pnl,
        cumulativePnl,
      });
    });
    return map;
  };

  function getNextTime(time: string) {
    const date = new Date(time);
    date.setDate(date.getDate() + 1);

    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = date.getFullYear();

    return yyyy + '-' + mm + '-' + dd + 'T00:00:00';
  }

  const makeFormattedData = (
    hlpPositions: HlpPosition[],
    hlpPnL: Map<string, HlpPnl>
  ): [GroupedData[], string[]] => {
    const map = new Map<string, GroupedData>();
    const uniqueTopCoins = new Set<string>();

    let prevTime: string | null = null;
    let hedgedCumulativePnl = 0;
    const oraclePxs = getOraclePxs(assetCtxs);

    hlpPositions.forEach((item: HlpPosition) => {
      let { time, coin, daily_ntl } = item;
      if (!map.has(time)) {
        const pnl = hlpPnL.get(time)?.pnl || 0;
        hedgedCumulativePnl += pnl;
        map.set(time, {
          time: new Date(time),
          daily_ntl: 0,
          hedged_pnl: pnl,
          hedged_cumulative_pnl: hedgedCumulativePnl,
          Other: 0,
        });
        prevTime = time;
      }

      const existingEntry = map.get(time)!;
      existingEntry[`${coin}`] = (existingEntry[`${coin}`] || 0) + daily_ntl;
      existingEntry.daily_ntl += daily_ntl;

      const oraclePx = oraclePxs.get(coin + time);
      let hedgedPnl = 0;
      const nextTime = getNextTime(time);
      let oraclePxNext = oraclePxs.get(coin + nextTime);
      let prevTimeData = prevTime ? map.get(prevTime) : null;
      let prevDayNtlPosition = prevTimeData ? prevTimeData[`${coin}`] : null;

      if (oraclePxNext && oraclePx && prevDayNtlPosition) {
        const pxChange = 1 - oraclePx / oraclePxNext;
        const pnl = -1 * prevDayNtlPosition * pxChange;
        hedgedPnl += pnl;
      }

      existingEntry.hedged_pnl += hedgedPnl;
      hedgedCumulativePnl += hedgedPnl;
      existingEntry.hedged_cumulative_pnl = hedgedCumulativePnl;
    });

    map.forEach((entry) => {
      const coinEntries = Object.entries(entry).filter(
        ([key]) =>
          key !== 'time' &&
          key !== 'daily_ntl' &&
          key !== 'hedged_pnl' &&
          key !== 'other' &&
          key !== 'hedged_cumulative_pnl'
      );
      const sortedCoinEntries = coinEntries.sort(
        (a, b) => Math.abs(Number(b[1])) - Math.abs(Number(a[1]))
      );
      const topCoins = sortedCoinEntries.slice(0, 10).map(([coin]) => coin);
      const otherCoins = sortedCoinEntries.slice(10);

      topCoins.forEach((coin) => uniqueTopCoins.add(coin));

      let otherTotal = 0;
      otherCoins.forEach(([coin, value]) => {
        otherTotal += value;
        delete entry[coin];
      });
      entry.Other = otherTotal;
    });

    const result = Array.from(map.values());
    uniqueTopCoins.add('Other');
    return [result, Array.from(uniqueTopCoins)];
  };

  const controls = {
    toggles: [
      {
        text: 'PnL',
        event: () => setDataMode('PNL'),
        active: dataMode === 'PNL',
      },
      {
        text: 'Hedged PnL',
        event: () => setDataMode('HEDGED'),
        active: dataMode === 'HEDGED',
      },
      {
        text: 'Net position',
        event: () => setDataMode('NET'),
        active: dataMode === 'NET',
      },
      {
        text: 'Coin positions',
        event: () => setDataMode('COINS'),
        active: dataMode === 'COINS',
      },
    ],
  };

  const formatData = () => {
    if (dataHlpPositions && assetCtxs && dataHlpPnL) {
      const newHlpPnL = makeHlpPnl(dataHlpPnL);
      setFormattedHlpPnL(Array.from(newHlpPnL.values()));
      const [groupedData, coins] = makeFormattedData(dataHlpPositions, newHlpPnL);
      setCoins(coins);
      setFormattedData(groupedData);
    }
  };

  useEffect(() => {
    if (!loading && !error) {
      formatData();
    }
  }, [loading, error]);

  return (
    <ChartWrapper title='HLP' loading={false} controls={controls}>
      <ResponsiveContainer width='100%' height={CHART_HEIGHT}>
        <ComposedChart data={dataMode === 'PNL' ? formattedHlpPnL : formattedData}>
          <CartesianGrid strokeDasharray='15 15' opacity={0.1} />
          <XAxis
            dataKey='time'
            tickFormatter={xAxisFormatter}
            minTickGap={30}
            tick={{ fill: '#f9f9f9' }}
            tickMargin={10}
          />
          <YAxis tick={{ fill: '#f9f9f9' }} dx={6} width={75} tickFormatter={yaxisFormatter} />
          <Tooltip
            formatter={dataMode === 'NET' ? tooltipFormatterLongShort : tooltipFormatterCurrency}
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
            cursor={{ fill: '#0A1F1B' }}
            itemSorter={(item) => {
              return Math.abs(Number(item.value)) * -1;
            }}
          />
          {dataMode === 'NET' && (
            <Bar
              isAnimationActive={false}
              type='monotone'
              dataKey={'daily_ntl'}
              name={'Daily net notional position'}
              fill={'#fff'}
              maxBarSize={20}
            >
              {(formattedData || []).map((item: GroupedData, i: number) => {
                return <Cell key={`cell-${i}`} fill={item.daily_ntl > 0 ? BLUE : ORANGE} />;
              })}
            </Bar>
          )}
          {dataMode === 'COINS' &&
            coins.map((coin, i) => {
              return (
                <Bar
                  unit={''}
                  isAnimationActive={false}
                  type='monotone'
                  dataKey={coin}
                  stackId='a'
                  name={coin.toString()}
                  fill={getTokenColor(coin.toString())}
                  key={i}
                  maxBarSize={20}
                />
              );
            })}
          {dataMode === 'HEDGED' && (
            <>
              <Line
                type='monotone'
                strokeWidth={1}
                stroke={BRIGHT_GREEN}
                dataKey='hedged_cumulative_pnl'
                name='Cumulative PnL'
              />
              <Bar
                isAnimationActive={false}
                type='monotone'
                dataKey={'hedged_pnl'}
                name={'Daily hedged PnL'}
                fill={'#fff'}
                maxBarSize={20}
              >
                {(formattedData || []).map((item: GroupedData, i: number) => {
                  return <Cell key={`cell-${i}`} fill={item.hedged_pnl > 0 ? GREEN : RED} />;
                })}
              </Bar>
            </>
          )}
          {dataMode === 'PNL' && (
            <>
              <Line
                type='monotone'
                strokeWidth={1}
                stroke={BRIGHT_GREEN}
                dataKey='cumulativePnl'
                name='Cumulative PnL'
                dot={false}
              />
              <Bar
                isAnimationActive={false}
                type='monotone'
                dataKey={'pnl'}
                name={'PnL'}
                fill={'#fff'}
                maxBarSize={20}
              >
                {formattedHlpPnL.map((item: HlpPnl, i: number) => {
                  return <Cell key={`cell-${i}`} fill={item.pnl > 0 ? GREEN : RED} />;
                })}
              </Bar>
            </>
          )}
          <Legend wrapperStyle={{ bottom: -5 }} />
        </ComposedChart>
      </ResponsiveContainer>
      <Box w='100%' mt='3'>
        {dataMode === 'COINS' && (
          <Text color='#bbb'>Top 10 Coins grouped daily and remaining coins grouped by Other</Text>
        )}
      </Box>
      <Box w='100%' mt='3'>
        {dataMode === 'PNL' && <Text color='#bbb'>PNL over time</Text>}
      </Box>

      <Box w='100%' mt='3'>
        {dataMode === 'HEDGED' && (
          <Text color='#bbb'>
            Hedged PNL over time. Hedge the previous day&apos;s position and add to today&apos;s
            PNL.
          </Text>
        )}
      </Box>

      <Box w='100%' mt='3'>
        {dataMode === 'NET' && <Text color='#bbb'>Net notional position over time</Text>}
      </Box>
    </ChartWrapper>
  );
}
