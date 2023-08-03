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
  xAxisFormatter,
  yaxisFormatterNumber,
  tooltipFormatter,
  tooltipFormatterDate,
} from '../../../helpers';
import {
  cumulative_new_users,
  daily_unique_users,
  daily_unique_users_by_coin,
} from '../../../constants/api';

const REQUESTS = [cumulative_new_users, daily_unique_users, daily_unique_users_by_coin];

export default function CumulativeUsers() {
  const [formattedData, setFormattedData] = useState<any[]>([]);

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

  const loading = loadingCumulativeNewUsers || loadingDailyUniqueUsers;
  const error = errorCumulativeNewUsers || errorDailyUniqueUsers;

  type CumulativeUniqueUsers = {
    time: string;
    cumulative_new_users: number;
    daily_new_users: number;
  };

  const formatdataCumulativeUniqueUsers = (
    dataCumulativeUsdVolume: CumulativeUniqueUsers[]
  ): any[] => {
    return dataCumulativeUsdVolume.map((item: CumulativeUniqueUsers) => ({
      ...item,
      time: new Date(item.time),
    }));
  };

  const formatData = () => {
    const formattedData = formatdataCumulativeUniqueUsers(dataCumulativeNewUsers);
    setFormattedData(formattedData);
  };

  useEffect(() => {
    if (!loading || !error) {
      formatData();
    }
  }, [loading, error]);

  return (
    <ChartWrapper title='Cumulative New Users' loading={loading}>
      <ResponsiveContainer width='100%' height={CHART_HEIGHT}>
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
            dataKey='daily_new_users'
            interval='preserveStartEnd'
            tickCount={7}
            tickFormatter={yaxisFormatterNumber}
            width={YAXIS_WIDTH}
            tick={{ fill: '#f9f9f9' }}
          />
          <YAxis
            dataKey='cumulative_new_users'
            orientation='right'
            yAxisId='right'
            tickFormatter={yaxisFormatterNumber}
            width={YAXIS_WIDTH}
            tick={{ fill: '#f9f9f9' }}
          />
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
              return Number(item.value) * -1;
            }}
            filterNull={true}
          />
          <Legend wrapperStyle={{ bottom: -5 }} />
          <Bar
            isAnimationActive={false}
            type='monotone'
            dataKey={'daily_new_users'}
            name={'Daily new users'}
            fill={GREEN}
            maxBarSize={20}
          />
          <Line
            isAnimationActive={false}
            type='monotone'
            dot={false}
            unit=''
            strokeWidth={1}
            stroke={BRIGHT_GREEN}
            dataKey='cumulative_new_users'
            yAxisId='right'
            name='Cumulative new users'
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
