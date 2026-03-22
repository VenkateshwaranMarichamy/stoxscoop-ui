import React from 'react';
import { cn } from '../../utils/cn';

const Select = React.forwardRef(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors cursor-pointer',
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = 'Select';

export { Select };
