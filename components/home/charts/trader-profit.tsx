import React, { useEffect, useState } from 'react';
import {
  Bar,
  Cell,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { sortBy, maxBy, minBy } from 'lodash';
import { useRequest } from '@/hooks/useRequest';
import { Box, Text, useMediaQuery } from '@chakra-ui/react';
import { cumulative_user_pnl, user_pnl } from '../../../constants/api';
import ChartWrapper from '../../common/chartWrapper';
import { CHART_HEIGHT, YAXIS_WIDTH, BRIGHT_GREEN, GREEN, RED } from '../../../constants';
import {
  yaxisFormatter,
  xAxisFormatter,
  tooltipFormatterCurrency,
  tooltipFormatterDate,
} from '../../../helpers';
import useScreenSize from '@/hooks/useScreenSize';

const REQUESTS = [cumulative_user_pnl, user_pnl];

export default function TradersProfitLossChart() {
  const { isMobile } = useScreenSize();

  const [data, setData] = useState<any>(null);
  const [dataCumulativeUserPNL, loadingCumulativeUserPNL, errorCumulativeUserPNL] = useRequest(
    REQUESTS[0],
    [],
    'chart_data'
  );
  const [dataUserPNL, loadingUserPNL, errorUserPNL] = useRequest(REQUESTS[1], [], 'chart_data');

  const loading = loadingUserPNL || loadingCumulativeUserPNL;
  const error = errorUserPNL || errorCumulativeUserPNL;
  const formatTradingData = () => {
    let currentProfitCumulative = 0;
    let currentLossCumulative = 0;

    dataUserPNL.shift();
    dataCumulativeUserPNL.shift();

    if (
      !dataCumulativeUserPNL ||
      !dataCumulativeUserPNL.length ||
      !dataUserPNL ||
      !dataUserPNL.length
    )
      return;

    let data: any[] = sortBy(dataCumulativeUserPNL, (i: any) => Date.parse(i.time)).map(
      (dataItem: any, index: number) => ({
        cumulative_pnl: dataItem.cumulative_pnl,
        user_pnl: dataUserPNL && dataUserPNL[index] ? dataUserPNL[index].total_pnl : 0,
        timestamp: new Date(dataItem.time),
        profit_cumulative: dataItem.cumulative_pnl > 0 ? dataItem.cumulative_pnl : 0,
        loss_cumulative: dataItem.cumulative_pnl < 0 ? dataItem.cumulative_pnl : 0,
        unit: 'single',
      })
    );

    const maxProfit = maxBy(data, (item) => item.profit_cumulative).profit_cumulative;
    const maxLoss = minBy(data, (item) => item.loss_cumulative).loss_cumulative;

    const maxPnl = maxBy(data, (item) => item.user_pnl).user_pnl;
    const minPnl = minBy(data, (item) => item.user_pnl).user_pnl;

    const maxCurrentCumulativePnl = maxBy(data, (item) => item.cumulative_pnl).cumulative_pnl;
    const minCurrentCumulativePnl = minBy(data, (item) => item.cumulative_pnl).cumulative_pnl;

    const stats = {
      maxProfit,
      maxLoss,
      currentProfitCumulative,
      currentLossCumulative,
      maxCurrentCumulativeProfitLoss: Math.max(currentProfitCumulative, -currentLossCumulative),

      maxAbsPnl: Math.max(Math.abs(maxPnl), Math.abs(minPnl)),
      maxAbsCumulativePnl: Math.max(
        Math.abs(maxCurrentCumulativePnl),
        Math.abs(minCurrentCumulativePnl)
      ),
    };

    setData({
      data,
      stats,
    });
  };

  useEffect(() => {
    if (!loading && !error) {
      formatTradingData();
    }
  }, [loading, error]);

  return (
    <ChartWrapper
      title='Traders Net PnL'
      loading={loading}
      data={data ? data.data : []}
      isMobile={isMobile}
    >
      <ResponsiveContainer width='100%' height={CHART_HEIGHT}>
        <ComposedChart data={data ? data.data : []}>
          <CartesianGrid strokeDasharray='15 15' opacity={0.1} />
          <XAxis
            dataKey='timestamp'
            tickFormatter={xAxisFormatter}
            minTickGap={30}
            tick={{ fill: '#f9f9f9', fontSize: isMobile ? 14 : 15 }}
            tickMargin={10}
          />
          <YAxis
            domain={[-data?.stats.maxAbsCumulativePnl * 1.1, data?.stats.maxAbsCumulativePnl * 1.1]}
            orientation='right'
            yAxisId='right'
            tickFormatter={yaxisFormatter}
            width={YAXIS_WIDTH}
            tick={{ fill: '#f9f9f9', fontSize: isMobile ? 14 : 15 }}
          />
          <YAxis
            domain={[-data?.stats.maxAbsPnl * 1.1, data?.stats.maxAbsPnl * 1.1]}
            tickFormatter={yaxisFormatter}
            width={YAXIS_WIDTH}
            tick={{ fill: '#f9f9f9', fontSize: isMobile ? 14 : 15 }}
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
          <Bar type='monotone' fill={'#FFF'} dataKey='user_pnl' name='Net PnL' maxBarSize={20}>
            {((data && data.data) || []).map((item: any, i: number) => {
              return <Cell key={`cell-${i}`} fill={item.user_pnl > 0 ? GREEN : RED} />;
            })}
          </Bar>
          <Line
            type='monotone'
            strokeWidth={1}
            stroke={BRIGHT_GREEN}
            dataKey='cumulative_pnl'
            name='Cumulative PnL'
            dot={false}
            yAxisId='right'
          />
        </ComposedChart>
      </ResponsiveContainer>
      <Box w='100%' mt='3'>
        <Text color='#bbb'>This is computed as negative of (HLP + liquidator)</Text>
      </Box>
    </ChartWrapper>
  );
}
