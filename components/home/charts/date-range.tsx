import { useState, useEffect, useContext } from 'react';
import Select from 'react-dropdown-select';
import { Box } from '@chakra-ui/react';
import moment from 'moment';
import { DateRange } from 'react-date-range';
import strftime, { timezone } from 'strftime';
import { DataContext } from '../../../contexts/data';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const ALL_TIME_ID = 4;
const DATA_START_DATE = new Date('2023-06-14T20:00:00.000');
const DATE_NOW = new Date();

export const DateRangeSelect = () => {
  const { setDates } = useContext(DataContext);

  const [selectedDateRangeOption, setSelectedDateRangeOption] = useState<number | null>(null);
  const [rangeState, setRangeState] = useState<
    { startDate: Date | undefined; endDate: Date | undefined; key: string }[]
  >([
    {
      startDate: DATA_START_DATE,
      endDate: DATE_NOW,
      key: 'selection',
    },
  ]);

  console.log({
    startDate: DATA_START_DATE,
    endDate: new Date(),
    key: 'selection',
  });

  const [dataRange, setDataRange] = useState({ fromValue: DATA_START_DATE, toValue: DATE_NOW });

  const onChange = (selectedDates: any) => {
    const [start, end] = selectedDates;
    const from = start ? strftime('%Y-%m-%d', new Date(start)) : undefined;
    const to = end ? strftime('%Y-%m-%d', end) : undefined;
    if (from === to) return;
    setDataRange({ fromValue: start, toValue: end });
    setDates({ from, to });
  };

  const dateRangeOptions = [
    {
      label: 'Last Month',
      id: 1,
    },
    {
      label: 'All Time',
      id: 4,
      isDefault: true,
    },
  ];

  useEffect(() => {
    setRangeState([
      {
        startDate: dataRange.fromValue,
        endDate: dataRange.toValue,
        key: 'selection',
      },
    ]);
  }, [dataRange.fromValue, dataRange.toValue]);

  const onSelectItem = (option: { id: number; label: string; isDefault?: boolean }) => {
    if (option.id == ALL_TIME_ID) {
      onChange([null, null]);
      return;
    }
    const end = new Date();
    const start = moment().subtract(option.id, 'month').toDate();
    setSelectedDateRangeOption(option.id);
    if (option.id == ALL_TIME_ID) {
      onChange([null, null]);
    } else {
      onChange([start, end]);
    }
  };

  useEffect(() => {
    let selected = false;
    for (const option of dateRangeOptions) {
      if (option.isDefault) {
        selected = true;
        onSelectItem(option);
        break;
      }
    }
    if (!selected) {
      onSelectItem(dateRangeOptions[0]);
    }
  }, []);

  const onDateRangeChange = (item: any) => {
    setRangeState([item.selection]);
    if (item.selection.startDate == item.selection.endDate) {
      return;
    }
    onChange([item.selection.startDate, item.selection.endDate]);
  };

  const customContentRenderer = () => {
    return (
      <div style={{ cursor: 'pointer' }}>
        {dataRange.fromValue &&
          dataRange.toValue &&
          `${strftime('%m-%d-%y', dataRange.fromValue)} to ${strftime(
            '%m-%d-%y',
            dataRange.toValue
          )}`}
        {(!dataRange.fromValue || !dataRange.toValue) && 'All time'}
      </div>
    );
  };

  const customDropdownRenderer = ({ props, state }: any) => {
    return (
      <Box className='react-datepicker'>
        <Box className='date-range-custom' color={props.color}>
          <DateRange
            editableDateInputs={true}
            onChange={onDateRangeChange}
            moveRangeOnFirstSelection={false}
            ranges={rangeState}
            showDateDisplay={false}
            fixedHeight={false}
            minDate={DATA_START_DATE}
            maxDate={DATE_NOW}
            rangeColors={['#194D44', '#194D44', '#194D44']}
          />
        </Box>
      </Box>
    );
  };

  const selectedOption = dateRangeOptions.find((option) => option.id === selectedDateRangeOption);
  const values = selectedOption ? [selectedOption] : [];

  const handleSelectChange = () => {
    // console.log('handleSelectChange')
  };

  return (
    <Box className='date-range-selector-wrapper' w='340px'>
      <Select
        placeholder='Select'
        multi
        contentRenderer={customContentRenderer}
        dropdownRenderer={customDropdownRenderer}
        labelField='label'
        options={dateRangeOptions}
        closeOnSelect={true}
        closeOnScroll={true}
        values={values}
        onChange={handleSelectChange}
      />
    </Box>
  );
};
