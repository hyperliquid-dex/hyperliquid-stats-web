import strftime from 'strftime';

import { excluded_percentage_tooltip } from '../constants';

const numberFmt0: Intl.NumberFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const numberFmt1: Intl.NumberFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});
const numberFmt2: Intl.NumberFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});
const currencyFmt0: Intl.NumberFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const currencyFmt1: Intl.NumberFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const currencyFmt2: Intl.NumberFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function getNumberFormatBasedOnValue(value: number): Intl.NumberFormat {
  const absValue = Math.abs(value);
  if (absValue < 10) {
    return numberFmt2;
  } else if (absValue < 1000) {
    return numberFmt1;
  } else {
    return numberFmt0;
  }
}

function getCurrencyFormatBasedOnValue(value: number): Intl.NumberFormat {
  const absValue = Math.abs(value);
  if (absValue < 10) {
    return currencyFmt2;
  } else if (absValue < 1000) {
    return currencyFmt1;
  } else {
    return currencyFmt0;
  }
}

interface FormatNumberOpts {
  currency?: boolean;
  compact?: boolean;
}

export const formatNumberWithOptions = (value: number, opts: FormatNumberOpts = {}): string => {
  const currency = !!opts.currency;
  const compact = !!opts.compact;

  if (currency && !compact) {
    return getCurrencyFormatBasedOnValue(value).format(value);
  }

  const display = compact
    ? formatNumberToCompactForm(value)
    : getNumberFormatBasedOnValue(value).format(value);
  if (currency) {
    return `$${display}`;
  }
  return display;
};

export const formatNumberToCompactForm = (value: number): string => {
  const abs = Math.abs(value);
  if (abs >= 1e9) {
    return `${(value / 1e9).toFixed(abs < 1e10 ? 2 : 1)}B`;
  }
  if (abs >= 1e6) {
    return `${(value / 1e6).toFixed(abs < 1e7 ? 2 : 1)}M`;
  }
  if (abs >= 1e3) {
    return `${(value / 1e3).toFixed(abs < 1e4 ? 2 : 1)}K`;
  }
  return `${value.toFixed(1)}`;
};

export const tooltipLabelFormatterPercent = (label: any, args: any): any => {
  const hide =
    args &&
    args[0] &&
    args[0].payload &&
    args[0].payload.unit &&
    (args[0].payload.unit === '%' || args[0].payload.unit === 'single');
  if (hide) return '';
  if (!label) return;
  if (label.constructor !== Date) {
    label = new Date(label * 1000);
  }
  const item = args && args[0] && args[0].payload && args[0];
  const date = `Total ${label.toLocaleDateString()} : `;
  const all = item && item.payload.all;
  if (all) {
    return `${date} ${formatNumberWithOptions(all, { compact: true })}%`;
  }
  return date;
};

export const tooltipLabelFormatter = (label: any, args: any, key?: string): any => {
  const hide =
    args &&
    args[0] &&
    args[0].payload &&
    args[0].payload.unit &&
    (args[0].payload.unit === '%' || args[0].payload.unit === 'single');
  if (hide) return '';

  if (!label) return;
  if (label.constructor !== Date) {
    label = new Date(label * 1000);
  }
  const item = args && args[0] && args[0].payload && args[0];
  const date = `Total ${label.toLocaleDateString()} : `;

  let value;
  if (key) {
    value = item && item.payload[key];
  } else {
    value = item && item.payload.all;
  }
  if (value) {
    if ((item && item.unit === '$') || (item.payload && item.payload.unit === '$')) {
      return `${date} ${formatNumberWithOptions(value, { currency: true, compact: true })}`;
    }
    return `${date} ${formatNumberWithOptions(value, { compact: true })}`;
  }
  return date;
};

export const xAxisFormatter = (label: any, args: any): any => {
  if (!label) return;
  if (label.constructor !== Date) {
    label = new Date(label * 1000);
  }
  const item = args && args[0] && args[0].payload && args[0];
  const dateFmtString = '%d-%m';
  const date = strftime(dateFmtString, label);
  const all = item && item.payload.all;
  if (all) {
    if ((item && item.unit === '%') || (item.payload && item.payload.unit === '%')) {
      return `${date} ${formatNumberWithOptions(all, { compact: true })}%`;
    }
    if ((item && item.unit === '$') || (item.payload && item.payload.unit === '$')) {
      return `${date} ${formatNumberWithOptions(all, { currency: true, compact: true })}`;
    }
    return `${date} ${formatNumberWithOptions(all, { compact: true })}`;
  }

  return date;
};

export const yaxisFormatterPercent = (value: number): string => {
  return value.toFixed(0) + '%';
};

export const formatterPercent = (value: number): string => {
  return value.toFixed(2) + '%';
};

export const yaxisFormatterNumber = (value: number): string => {
  return formatNumberToCompactForm(value);
};

export const yaxisFormatter = (value: number): string => {
  return formatNumberWithOptions(value, { currency: true, compact: true });
};

export const tooltipFormatterNumber = (value: number | string): string => {
  return formatNumberWithOptions(Number(value), { compact: true });
};

export const tooltipFormatterCurrency = (value: number | string): string => {
  return formatNumberWithOptions(Number(value), { currency: true, compact: true });
};

export const tooltipFormatterLongShort = (value: number | string): string => {
  let formattedNumber = formatNumberToCompactForm(Math.abs(+value));
  if (+value < 0) {
    return `Short $${formattedNumber}`;
  } else {
    return `Long $${formattedNumber}`;
  }
};

export const tooltipFormatterDate = (label: any) => {
  const date = new Date(label);
  return `Date : ${date.toLocaleDateString()}`;
};

export const tooltipFormatterPercent = (value: number): string => {
  return value.toFixed(2) + '%';
};

export const tooltipFormatter = (value: any, name: any, item: any) => {
  if (excluded_percentage_tooltip.indexOf(item.dataKey) > -1) {
    return `${value}`;
  }
  if ((item && item.unit === '%') || (item.payload && item.payload.unit === '%')) {
    return `${value.toFixed(2)}%`;
  }
  if (item && !item.unit) {
    return formatNumberWithOptions(item.value, { currency: false });
  }
  return formatNumberWithOptions(value, { currency: true });
};

export const tooltipLabelFormatterUnits = (
  label: number | Date,
  args?: any[]
): string | undefined => {
  if (!label) {
    return label as any | undefined;
  }

  if (label.constructor !== Date) {
    label = new Date((label as number) * 1000);
    if (!label.getDate()) {
      return label.toString();
    }
  }

  const date = strftime('%d.%m', label);
  const item = args && args[0];
  if (item && item.unit === '%') {
    return date;
  }

  const all = item && item.payload.all;
  if (label.constructor !== Date) {
    return all ? `${label}, total: ${all}` : label.toString();
  }

  return all ? `${date}, total: ${all}` : date;
};
