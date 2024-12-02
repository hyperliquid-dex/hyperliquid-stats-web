import React, { useState } from 'react';
import strftime from 'strftime';

type Dates = {
  to: string | undefined;
  from: string | undefined;
};

export interface State {
  dates: Dates;
  setDates: (dates: Dates) => void;
}

const DATE_NOW = new Date();
const DATE_TO = strftime('%Y-%m-%d', DATE_NOW);

export const DataContext = React.createContext<State>({
  dates: {
    from: undefined,
    to: undefined,
  },
  setDates: (dates: Dates) => {},
});

export const DataContextProvider = (props: any) => {
  const setDates = (dates: Dates) => {
    setState({ ...state, dates });
  };

  const initState: State = {
    dates: {
      from: '2023-06-14',
      to: DATE_TO,
    },
    setDates: setDates,
  };

  const [state, setState] = useState(initState);

  return <DataContext.Provider value={state}>{props.children}</DataContext.Provider>;
};
