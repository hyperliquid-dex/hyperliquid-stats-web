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
import { useRequest } from '@/hooks/useRequest';
import ChartWrapper from '../../common/chartWrapper';
import { CHART_HEIGHT, YAXIS_WIDTH, BRIGHT_GREEN, GREEN } from '../../../constants';
import {
  yaxisFormatter,
  xAxisFormatter,
  tooltipFormatterCurrency,
  tooltipFormatterDate,
} from '../../../helpers';
import { total_accrued_fees } from '../../../constants/api';

const REQUESTS = [total_accrued_fees];

export default function Fees() {
  const [formattedData, setFormattedData] = useState<any[]>([]);
  const [dailyFeesAccrued, loading, error] = useRequest(REQUESTS[0], [], 'chart_data');

  interface DailyFeesAccrued {
    time: Date;
    daily_accrued_fees: number;
  }

  interface MergedData {
    time: Date;
    daily_accrued_fees: number;
    cumulative_accrued_fees: number;
  }

  const makeFormattedData = (dailyFeesAccrued: DailyFeesAccrued[]): MergedData[] => {
    const result = [];
    let cumulativeFees = 0;
    for (let i = 0; i < dailyFeesAccrued.length; i++) {
      const dailyFeeAccrued = dailyFeesAccrued[i].daily_accrued_fees ?? 0;
      cumulativeFees += dailyFeeAccrued;
      result.push({
        time: new Date(dailyFeesAccrued[i].time),
        daily_accrued_fees: dailyFeeAccrued,
        cumulative_accrued_fees: cumulativeFees,
      });
    }

    return result;
  };

  const formatData = () => {
    const newFormattedData = makeFormattedData(dailyFeesAccrued);
    setFormattedData(newFormattedData);
  };

  useEffect(() => {
    if (!loading && !error) {
      formatData();
    }
  }, [loading, error]);

  return (
    <ChartWrapper title='Fees Accrued' loading={loading}>
      <ResponsiveContainer width='99%' height={CHART_HEIGHT}>
        <ComposedChart data={formattedData}>
          <CartesianGrid strokeDasharray='15 15' opacity={0.1} />
          <XAxis
            dataKey='time'
            tickFormatter={xAxisFormatter}
            minTickGap={30}
            tick={{ fill: '#f9f9f9' }}
            tickMargin={10}
          />
          <YAxis
            dataKey='daily_accrued_fees'
            interval='preserveStartEnd'
            tickCount={7}
            tickFormatter={yaxisFormatter}
            width={70}
            tick={{ fill: '#f9f9f9' }}
          />
          <YAxis
            dataKey='cumulative_accrued_fees'
            orientation='right'
            yAxisId='right'
            tickFormatter={yaxisFormatter}
            width={YAXIS_WIDTH}
            tick={{ fill: '#f9f9f9' }}
          />
          <Legend wrapperStyle={{ bottom: -5 }} />
          <Bar
            isAnimationActive={false}
            type='monotone'
            data={formattedData}
            dataKey={'daily_accrued_fees'}
            name={'Daily fees accrued'}
            fill={GREEN}
            maxBarSize={20}
          />
          <Line
            isAnimationActive={false}
            type='monotone'
            dot={false}
            strokeWidth={1}
            stroke={BRIGHT_GREEN}
            dataKey='cumulative_accrued_fees'
            yAxisId='right'
            name='Cumulative fees accrued'
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
        </ComposedChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
