// src/components/common/MoneyInput.jsx
import { NumericFormat } from 'react-number-format';

export const CurrencyInput = ({ value, onValueChange, className, required = false, disabled = false }) => {
  return (
    <NumericFormat
      thousandSeparator="."
      decimalSeparator=","
      value={value}
      onValueChange={(values) => {
        onValueChange(values.floatValue || '');
      }}
      className={className}
      required={required}
      disabled={disabled}
      allowNegative={false}
      decimalScale={0}
    />
  );
};