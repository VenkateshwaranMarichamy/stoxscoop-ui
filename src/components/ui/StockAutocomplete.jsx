import React, { useState, useRef, useEffect } from 'react';
import { useStocks } from '../../hooks/useApi';
import { Input } from './Input';
import { cn } from '../../utils/cn';
import { Search } from 'lucide-react';

export function StockAutocomplete({ value, onChange, placeholder = "Search stock...", returnType = 'id', className, showIcon = false }) {
  const { data: stocks, isLoading } = useStocks();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  
  // Track if we are currently displaying a selected option vs free typing
  const [selectedStock, setSelectedStock] = useState(null);

  useEffect(() => {
    if (stocks && value) {
      const found = returnType === 'id' 
         ? stocks.find(s => s.id === parseInt(value) || s.id === value)
         : stocks.find(s => s.symbol === value);
      
      setSelectedStock(found || null);
      if (found) {
        setSearchTerm(`${found.symbol} - ${found.name}`);
      } else {
         setSearchTerm(returnType === 'symbol' ? value : '');
      }
    } else {
        setSearchTerm('');
        setSelectedStock(null);
    }
  }, [value, stocks, returnType]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    setIsOpen(true);
    setSelectedStock(null);
    
    if (returnType === 'symbol') {
       onChange(val);
    } else {
       if (val.trim() === '') onChange('');
    }
  };

  const handleSelect = (stock) => {
    setSelectedStock(stock);
    setSearchTerm(`${stock.symbol} - ${stock.name}`);
    setIsOpen(false);
    onChange(returnType === 'id' ? stock.id : stock.symbol);
  };

  const filteredStocks = searchTerm.length >= 2 && !selectedStock && stocks 
    ? stocks.filter(s => 
        s.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 50)
    : [];

  return (
    <div className={cn("relative w-full", className)} ref={wrapperRef}>
      {showIcon && <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />}
      <Input
        type="text"
        placeholder={isLoading ? "Loading stocks..." : placeholder}
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => { if (searchTerm.length >= 2 && !selectedStock) setIsOpen(true) }}
        className={cn("w-full bg-white", showIcon && "pl-9")}
      />
      {isOpen && searchTerm.length >= 2 && !selectedStock && (
        <ul className="absolute z-[100] w-full mt-1 max-h-60 overflow-auto rounded-md bg-white border border-slate-200 shadow-lg text-sm">
          {filteredStocks.length > 0 ? (
            filteredStocks.map((stock) => (
              <li
                key={stock.id}
                onClick={() => handleSelect(stock)}
                className="cursor-pointer px-4 py-2 hover:bg-slate-50 border-b border-slate-50 last:border-0 text-slate-700 flex flex-col"
              >
                <span className="font-bold text-slate-900">{stock.symbol}</span> 
                <span className="text-slate-500 text-xs truncate">{stock.name}</span>
              </li>
            ))
          ) : (
            <li className="px-4 py-3 text-slate-500 text-center text-xs">No matching stocks found</li>
          )}
        </ul>
      )}
    </div>
  );
}
