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
  Cell,
} from 'recharts';
import { useEffect, useState } from 'react';
import { useRequest } from '@/hooks/useRequest';
import ChartWrapper from '../../common/chartWrapper';
import { CHART_HEIGHT, YAXIS_WIDTH, BRIGHT_GREEN, GREEN, RED } from '../../../constants';
import {
  yaxisFormatter,
  xAxisFormatter,
  tooltipFormatterCurrency,
  tooltipFormatterDate,
} from '../../../helpers';
import { daily_inflow, cumulative_inflow } from '../../../constants/api';
import useScreenSize from '@/hooks/useScreenSize';

const REQUESTS = [daily_inflow, cumulative_inflow];

export default function CumulativeInflow() {
  const { isMobile } = useScreenSize();

  const [formattedData, setFormattedData] = useState<any[]>([]);
  const [dataDailyInflow, loadingDailyInflow, errorDailyInflow] = useRequest(
    REQUESTS[0],
    [],
    'chart_data'
  );
  const [dataCumulativeInflow, loadingCumulativeInflow, errorCumulativeInflow] = useRequest(
    REQUESTS[1],
    [],
    'chart_data'
  );

  const loading = loadingDailyInflow || loadingCumulativeInflow;
  const error = errorCumulativeInflow || errorCumulativeInflow;

  interface DailyInflowData {
    time: string;
    inflow: number;
  }

  interface CumulativeInflowData {
    time: string;
    cumulative_inflow: number;
  }

  interface MergedData {
    time: Date;
    inflow?: number;
    cumulative_inflow?: number;
    unit: string;
  }

  const mergeInflows = (
    dailyInflows: DailyInflowData[],
    cumulativeInflows: CumulativeInflowData[]
  ): MergedData[] => {
    const map = new Map<string, MergedData>();

    dailyInflows.forEach((item) => {
      map.set(item.time, {
        ...map.get(item.time),
        time: new Date(item.time),
        inflow: item.inflow,
        unit: 'single',
      });
    });

    cumulativeInflows.forEach((item) => {
      map.set(item.time, {
        ...map.get(item.time),
        time: new Date(item.time),
        cumulative_inflow: item.cumulative_inflow,
        unit: 'single',
      });
    });

    return Array.from(map.values());
  };

  const formatData = () => {
    const formattedData = mergeInflows(dataDailyInflow, dataCumulativeInflow);
    setFormattedData(formattedData);
  };

  useEffect(() => {
    if (!loading && !errorDailyInflow) {
      formatData();
    }
  }, [loading, errorDailyInflow]);

  return (
    <ChartWrapper title='Inflows' loading={loading} data={formattedData} isMobile={isMobile}>
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
            dataKey='inflow'
            interval='preserveStartEnd'
            tickCount={7}
            tickFormatter={yaxisFormatter}
            width={70}
            tick={{ fill: '#f9f9f9', fontSize: isMobile ? 14 : 15 }}
          />
          <YAxis
            dataKey='cumulative_inflow'
            orientation='right'
            yAxisId='right'
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
          <Bar
            isAnimationActive={false}
            type='monotone'
            dataKey={'inflow'}
            name={'Inflow'}
            fill={'#fff'}
            maxBarSize={20}
          >
            {(formattedData || []).map((item: any, i: number) => {
              return <Cell key={`cell-${i}`} fill={item.inflow > 0 ? GREEN : RED} />;
            })}
          </Bar>
          <Line
            isAnimationActive={false}
            type='monotone'
            dot={false}
            strokeWidth={1}
            stroke={BRIGHT_GREEN}
            dataKey='cumulative_inflow'
            yAxisId='right'
            name='Cumulative Inflow'
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
