import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';

export interface SearchableSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SearchableSelectProps {
  value: string | number;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  'aria-label'?: string;
}

const normalizeSearchText = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/Đ/g, 'D')
  .toLocaleLowerCase('vi-VN')
  .trim();

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Chọn một lựa chọn',
  emptyMessage = 'Không tìm thấy kết quả',
  disabled = false,
  className = '',
  id,
  name,
  'aria-label': ariaLabel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const listboxId = id ?? `searchable-select-${generatedId}`;
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  const selectedOption = options.find(option => String(option.value) === String(value));
  const filteredOptions = useMemo(() => {
    const keyword = normalizeSearchText(debouncedSearchTerm);
    return keyword
      ? options.filter(option => normalizeSearchText(option.label).includes(keyword))
      : options;
  }, [debouncedSearchTerm, options]);

  const closeDropdown = () => {
    setIsOpen(false);
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setActiveIndex(-1);
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setActiveIndex(filteredOptions.findIndex(option => String(option.value) === String(value)));
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [isOpen]);

  useEffect(() => {
    if (activeIndex >= filteredOptions.length) setActiveIndex(filteredOptions.length - 1);
  }, [activeIndex, filteredOptions.length]);

  const selectOption = (option: SearchableSelectOption) => {
    if (option.disabled) return;
    onChange({ target: { value: String(option.value) }, currentTarget: { value: String(option.value) } } as React.ChangeEvent<HTMLSelectElement>);
    closeDropdown();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement | HTMLButtonElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeDropdown();
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex(current => {
        const next = current + direction;
        if (next < 0) return filteredOptions.length - 1;
        if (next >= filteredOptions.length) return 0;
        return next;
      });
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else if (activeIndex >= 0) {
        selectOption(filteredOptions[activeIndex]);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        name={name}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => setIsOpen(open => !open)}
        onKeyDown={handleKeyDown}
        className={`${className} flex items-center justify-between gap-3 text-left`}
      >
        <span className={selectedOption ? 'truncate' : 'truncate text-gray-400'}>
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown size={16} className={`shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
          <div className="border-b border-gray-100 p-2">
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
              <Search size={15} className="shrink-0 text-gray-400" />
              <input
                ref={inputRef}
                type="search"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Tìm kiếm..."
                className="h-9 min-w-0 flex-1 bg-transparent text-xs font-medium text-gray-800 outline-none placeholder:text-gray-400"
              />
            </div>
          </div>
          <ul id={listboxId} role="listbox" className="max-h-56 overflow-y-auto py-1">
            {filteredOptions.length ? filteredOptions.map((option, index) => {
              const isSelected = String(option.value) === String(value);
              return (
                <li key={option.value} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    disabled={option.disabled}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectOption(option)}
                    className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-xs transition-colors ${
                      index === activeIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    } ${option.disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <span className="min-w-0 flex-1 truncate">{option.label}</span>
                    {isSelected && <Check size={15} className="shrink-0 text-blue-600" />}
                  </button>
                </li>
              );
            }) : (
              <li className="px-3 py-5 text-center text-xs text-gray-500">{emptyMessage}</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
