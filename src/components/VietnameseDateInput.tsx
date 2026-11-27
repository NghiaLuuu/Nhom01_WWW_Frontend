import React from 'react';

type Props = {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  required?: boolean;
  type?: 'date' | 'datetime-local';
};

export const VietnameseDateInput: React.FC<Props> = ({ value, onValueChange, className, required, type = 'date' }) => {
  const [date, time] = value.split('T');
  const parts = date?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const display = parts ? `${parts[3]}/${parts[2]}/${parts[1]}${type === 'datetime-local' && time ? ` ${time.slice(0, 5)}` : ''}` : 'dd/mm/yyyy';

  return (
    <div className="relative w-full">
      <div className={className} aria-hidden="true">{display}</div>
      <input
        type={type}
        lang="vi-VN"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        required={required}
        aria-label={type === 'date' ? 'Chọn ngày, tháng, năm' : 'Chọn ngày, tháng, năm và giờ'}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        onClick={(event) => {
          try { event.currentTarget.showPicker(); } catch { /* Browser may not support showPicker. */ }
        }}
      />
    </div>
  );
};
