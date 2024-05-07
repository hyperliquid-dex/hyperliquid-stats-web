import { useState, useEffect, useContext, useCallback } from 'react';
import { DataContext } from '../contexts/data';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useRequest(url: string, defaultValue: any, key?: string, dontRefetch?: boolean) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(defaultValue);
  const dataContext = useContext(DataContext);

  const init = useCallback(async () => {
    setLoading(true);
    const data = await fetcher(`${process.env.NEXT_PUBLIC_DAT_URL}/${url}`);
    const dataFromKey = key ? data[key] : data?.table_data || data?.chart_data || data;
    setData(
      dataFromKey.filter
        ? dataFromKey.filter((line: any) => {
            if (!line.time) {
              return true;
            }
            if (dataContext.dates.from && new Date(line.time) < new Date(dataContext.dates.from)) {
              return false;
            }
            if (dataContext.dates.to && new Date(line.time) > new Date(dataContext.dates.to)) {
              return false;
            }
            return true;
          })
        : dataFromKey
    );
    setLoading(false);
  }, [dataContext.dates.from, dataContext.dates.to, key, url]);

  useEffect(() => {
    init();
  }, [init, url]);

  useEffect(() => {
    if (dontRefetch) return;
    init();
  }, [dataContext.dates.from, dataContext.dates.to, dontRefetch, init]);

  return [data, loading];
}
