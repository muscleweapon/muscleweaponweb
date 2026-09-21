import React from 'react';
import { cn } from '@/lib/cn';

export interface MWTableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  className?: string;
  containerClassName?: string;
}

export const MWTable: React.FC<MWTableProps> = ({
  className,
  containerClassName,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'w-full overflow-x-auto rounded-[16px] border border-[#DDE5EF] bg-white shadow-sm',
        containerClassName
      )}
    >
      <table
        className={cn('w-full border-collapse text-left text-sm text-[#0B1220]', className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

export const MWTableHead: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <thead
      className={cn('bg-[#F5F8FC] border-b border-[#DDE5EF] text-xs font-bold text-[#667085] uppercase tracking-wider', className)}
      {...props}
    >
      {children}
    </thead>
  );
};

export const MWTableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <tbody className={cn('divide-y divide-[#DDE5EF] bg-white', className)} {...props}>
      {children}
    </tbody>
  );
};

export const MWTableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <tr
      className={cn(
        'transition-colors hover:bg-[#F5F8FC]/60',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
};

export const MWTableHeaderCell: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <th className={cn('px-4 py-3.5 font-bold', className)} scope="col" {...props}>
      {children}
    </th>
  );
};

export const MWTableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <td className={cn('px-4 py-3.5 text-sm align-middle', className)} {...props}>
      {children}
    </td>
  );
};
