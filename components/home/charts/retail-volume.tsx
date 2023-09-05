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
import { Box, Text } from '@chakra-ui/react';
import { useRequest } from '@/hooks/useRequest';
import ChartWrapper from '../../common/chartWrapper';
import {
  CHART_HEIGHT,
  YAXIS_WIDTH,
  BRIGHT_GREEN,
  BRAND_GREEN_2,
  BRAND_GREEN_3,
} from '../../../constants';
import {
  tooltipFormatterCurrency,
  tooltipLabelFormatter,
  yaxisFormatter,
  xAxisFormatter,
} from '../../../helpers';
import { createCoinSelectors } from '../../../helpers/utils';

import { getTokenColor, initialTokensSelectedWithOther } from '../../../constants/tokens';
import {
  cumulative_usd_volume,
  daily_usd_volume,
  daily_usd_volume_by_coin,
  daily_usd_volume_by_crossed,
  daily_usd_volume_by_user,
} from '../../../constants/api';

const REQUESTS = [
  cumulative_usd_volume,
  daily_usd_volume,
  daily_usd_volume_by_coin,
  daily_usd_volume_by_crossed,
  daily_usd_volume_by_user,
];

export default function RetailVolumeChart() {
  const [dataMode, setDataMode] = useState<'COINS' | 'MARGIN'>('COINS');
  const [formattedDataCoins, setFormattedDataCoins] = useState<any[]>([]);
  const [formattedDataMargin, setFormattedDataMargin] = useState<any[]>([]);
  const initialTokensSelected = [...initialTokensSelectedWithOther, 'Cumulative'];
  const [coinsSelected, setCoinsSelected] = useState<string[]>(initialTokensSelected);
  const [coinKeys, setCoinKeys] = useState<any[]>([]);
  const [dataCumulativeUsdVolume, loadingCumulativeUsdVolume, errorCumulativeUsdVolume] =
    useRequest(REQUESTS[0], [], 'chart_data');
  const [dataDailyUsdVolume, loadingDailyUsdVolume, errorDailyUsdVolume] = useRequest(
    REQUESTS[1],
    [],
    'chart_data'
  );
  const [dataDailyUsdVolumeByCoin, loadingDailyUsdVolumeByCoin, errorDailyUsdVolumeByCoin] =
    useRequest(REQUESTS[2], [], 'chart_data');
  const [
    dataDailyUsdVolumeByCrossed,
    loadingDailyUsdVolumeByCrossed,
    errorDailyUsdVolumeByCrossed,
  ] = useRequest(REQUESTS[3], [], 'chart_data');
  const [dataDailyUsdVolumeByUser, loadingDailyUsdVolumeByUser, errorDailyUsdVolumeByUser] =
    useRequest(REQUESTS[4], [], 'chart_data');

  const loading =
    loadingCumulativeUsdVolume ||
    loadingDailyUsdVolume ||
    loadingDailyUsdVolumeByCoin ||
    loadingDailyUsdVolumeByCrossed ||
    loadingDailyUsdVolumeByUser;
  const error =
    errorCumulativeUsdVolume ||
    errorDailyUsdVolume ||
    errorDailyUsdVolumeByCoin ||
    errorDailyUsdVolumeByCrossed ||
    errorDailyUsdVolumeByUser;

  type CumulativeVolumeData = { cumulative: number; time: string };

  const formatCumulativeVolumeByTime = (
    dataCumulativeUsdVolume: CumulativeVolumeData[]
  ): { [key: string]: number } => {
    const result: { [key: string]: number } = {};
    for (const data of dataCumulativeUsdVolume) {
      result[data.time] = data.cumulative;
    }
    return result;
  };

  type FormattedDailyVolumeData = { time: string; daily_usd_volume: number };

  const formatDailyVolumeByTime = (
    dataCumulativeUsdVolume: FormattedDailyVolumeData[]
  ): { [key: string]: number } => {
    const result: { [key: string]: number } = {};
    for (const data of dataCumulativeUsdVolume) {
      result[data.time] = data.daily_usd_volume;
    }
    return result;
  };

  type VolumeData = { coin: string; daily_usd_volume: number; time: string };
  type FormattedVolumeData = any[]; //{ time: string, all: number, [coin: string]: number };

  const formatVolumeByCoins = (
    CoinsSelected: string[],
    dataDailyUsdVolumeByCoin: VolumeData[],
    formattedCumulativeUsdVolume: { [key: string]: number },
    formattedDailyVolumeByTime: { [key: string]: number }
  ): FormattedVolumeData[] => {
    const temp: { [key: string]: { all: number; [coin: string]: number } } = {};
    for (const data of dataDailyUsdVolumeByCoin) {
      if (!temp[data.time]) {
        temp[data.time] = { all: 0 };
      }
      temp[data.time][data.coin] = data.daily_usd_volume;
      temp[data.time].all += data.daily_usd_volume;
    }

    const selectedCoinData = (obj: { [coin: string]: number }) => {
      const selectedEntries = Object.entries(obj).filter(
        ([coin]) => CoinsSelected.includes(coin) && coin !== 'all'
      );
      const otherEntries = Object.entries(obj).filter(
        ([coin]) => !CoinsSelected.includes(coin) && coin !== 'all'
      );
      const otherVolume = otherEntries.reduce((total, [, volume]) => total + volume, 0);
      return {
        ...Object.fromEntries(selectedEntries),
        Other: otherVolume,
      };
    };

    const result: any[] = Object.entries(temp).map(([time, volumes]) => {
      const selectedVolumes = selectedCoinData(volumes);
      return {
        time: new Date(time),
        ...selectedVolumes,
        Cumulative: formattedCumulativeUsdVolume[time as any],
        all: formattedDailyVolumeByTime[time as any],
        unit: '$',
      };
    });

    return result;
  };

  const extractUniqueCoins = (formattedVolumeData: VolumeData[]): string[] => {
    const coinSet = new Set<string>();
    for (const data of formattedVolumeData) {
      coinSet.add(data.coin);
    }
    const coinsArray = ['Other', 'Cumulative', ...Array.from(coinSet)];
    return coinsArray;
  };

  type VolumeCrossedData = { crossed: boolean; daily_usd_volume: number; time: string };

  const formatVolumeByCrossed = (
    dataDailyUsdVolumeByCrossed: VolumeCrossedData[],
    formattedCumulativeUsdVolume: { [key: string]: number },
    formattedDailyVolumeByTime: { [key: string]: number }
  ): any[] => {
    // Create a temporary object to collect the data
    const temp: { [key: string]: any } = {};

    for (const data of dataDailyUsdVolumeByCrossed) {
      if (!temp[data.time]) {
        temp[data.time] = { all: 0, maker: 0, taker: 0 };
      }
      // Assigning daily_usd_volume to 'maker' if crossed is true, else assign to 'taker'
      if (data.crossed) {
        temp[data.time].taker = data.daily_usd_volume;
      } else {
        temp[data.time].maker = data.daily_usd_volume;
      }
      temp[data.time].all += data.daily_usd_volume;
    }
    // Convert the collected data into an array
    const result: any[] = Object.entries(temp).map((item: any) => {
      console.log(
        '1111',
        formattedCumulativeUsdVolume,
        formattedCumulativeUsdVolume[item[0]],
        item[0]
      );
      return {
        time: new Date(item[0]),
        maker: item[1].maker || 0,
        taker: item[1].taker || 0,
        Cumulative: formattedCumulativeUsdVolume[item[0]],
        all: formattedDailyVolumeByTime[item[0]],
        unit: '$',
      };
    });
    return result;
  };

  const formatData = (CoinsSelected: string[]) => {
    const formattedCumulativeVolumeByTime = formatCumulativeVolumeByTime(dataCumulativeUsdVolume);
    const formattedDailyVolumeByTime = formatDailyVolumeByTime(dataDailyUsdVolume);
    const formattedVolumeByCoins = formatVolumeByCoins(
      CoinsSelected,
      dataDailyUsdVolumeByCoin,
      formattedCumulativeVolumeByTime,
      formattedDailyVolumeByTime
    );
    const formattedVolumeByCrossed = formatVolumeByCrossed(
      dataDailyUsdVolumeByCrossed,
      formattedCumulativeVolumeByTime,
      formattedDailyVolumeByTime
    );
    setCoinKeys(extractUniqueCoins(dataDailyUsdVolumeByCoin));
    setFormattedDataCoins(formattedVolumeByCoins);
    setFormattedDataMargin(formattedVolumeByCrossed);
  };

  const controls = {
    toggles: [
      {
        text: 'Coins',
        event: () => setDataMode('COINS'),
        active: dataMode === 'COINS',
      },
      {
        text: 'Maker / Taker',
        event: () => setDataMode('MARGIN'),
        active: dataMode === 'MARGIN',
      },
    ],
  };

  useEffect(() => {
    if (!loading || error) {
      formatData(coinsSelected);
    }
  }, [loading, error]);

  const coinSelectors = createCoinSelectors(
    coinKeys,
    coinsSelected,
    setCoinsSelected,
    formatData,
    false,
    'Cumulative'
  );
  console.log('***', formattedDataCoins);
  return (
    <ChartWrapper
      title='Retail Volume'
      loading={loading}
      zIndex={9}
      controls={controls}
      coinSelectors={dataMode === 'COINS' ? coinSelectors : undefined}
    >
      <ResponsiveContainer width='99%' height={CHART_HEIGHT}>
        <ComposedChart
          data={dataMode === 'COINS' ? formattedDataCoins : formattedDataMargin}
          syncId='retailSync'
        >
          <CartesianGrid strokeDasharray='15 15' opacity={0.1} />
          <XAxis
            dataKey='time'
            tickFormatter={xAxisFormatter}
            minTickGap={30}
            tick={{ fill: '#f9f9f9' }}
            tickMargin={10}
          />
          <YAxis
            interval='preserveStartEnd'
            tickCount={7}
            tickFormatter={yaxisFormatter}
            width={YAXIS_WIDTH}
            tick={{ fill: '#f9f9f9' }}
          />
          <Tooltip
            formatter={tooltipFormatterCurrency}
            labelFormatter={tooltipLabelFormatter}
            contentStyle={{
              textAlign: 'left',
              background: '#0A1F1B',
              borderColor: '#061412',
              boxShadow: '0px 0px 7px rgb(0 0 0 / 20%)',
              borderRadius: '26px',
              color: '#fff',
              maxHeight: '500px',
            }}
            itemSorter={(item) => {
              return Number(item.value) * -1;
            }}
          />
          <Legend wrapperStyle={{ bottom: -5 }} />
          {dataMode === 'COINS' && (
            <>
              {coinsSelected.map((coinName, i) => {
                if (coinName !== 'Cumulative') {
                  return (
                    <Bar
                      unit={''}
                      isAnimationActive={false}
                      type='monotone'
                      dataKey={coinName}
                      stackId='a'
                      name={coinName.toString()}
                      fill={getTokenColor(coinName.toString())}
                      key={i}
                      maxBarSize={20}
                    />
                  );
                }
              })}
            </>
          )}
          {dataMode === 'MARGIN' && (
            <>
              <Bar
                unit={''}
                isAnimationActive={false}
                type='monotone'
                dataKey={'maker'}
                stackId='a'
                name={'Maker'}
                fill={BRAND_GREEN_2}
                maxBarSize={20}
              />
              <Bar
                unit={''}
                isAnimationActive={false}
                type='monotone'
                dataKey={'taker'}
                stackId='a'
                name={'Taker'}
                fill={BRAND_GREEN_3}
                maxBarSize={20}
              />
            </>
          )}
          {coinsSelected.includes('Cumulative') && (
            <>
              <YAxis
                dataKey='Cumulative'
                orientation='right'
                yAxisId='right'
                tickFormatter={yaxisFormatter}
                width={YAXIS_WIDTH}
                tick={{ fill: '#f9f9f9' }}
              />
              <Line
                isAnimationActive={false}
                type='monotone'
                dot={false}
                strokeWidth={1}
                stroke={BRIGHT_GREEN}
                dataKey='Cumulative'
                yAxisId='right'
                opacity={0.7}
                name='Cumulative'
              />
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>
      <Box w='100%' mt='3'>
        <Text color='#bbb'>
          This measures two-sided volume, i.e. each side of a trade is counted once if that side is
          retail.
        </Text>
      </Box>
    </ChartWrapper>
  );
}
