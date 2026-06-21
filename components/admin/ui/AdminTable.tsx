import React from 'react';
import { cn } from '@/lib/utils';

/**
 * AdminTable — consistent table wrapper for all admin list views.
 *
 * Usage (simple):
 *   <AdminTable
 *     headers={['User', 'Status', 'Joined', '']}
 *     empty={<AdminEmptyState ... />}
 *     loading={isLoading}
 *   >
 *     {rows.map(row => <tr key={row.id}>...</tr>)}
 *   </AdminTable>
 */

interface AdminTableProps {
  headers: string[];
  children: React.ReactNode;
  loading?: boolean;
  empty?: React.ReactNode;
  className?: string;
  /** Column widths as Tailwind w-* classes, one per header */
  colWidths?: string[];
}

export function AdminTable({
  headers,
  children,
  loading,
  empty,
  className,
  colWidths,
}: AdminTableProps) {
  // Convert children to array to check count
  const childArray = React.Children.toArray(children);
  const hasRows = childArray.length > 0;

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm',
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {headers.map((h, i) => (
                <th
                  key={`${h}-${i}`}
                  className={cn(
                    'px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-gray-400',
                    colWidths?.[i]
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={headers.length}>
                  <div className="flex items-center justify-center py-16">
                    <div className="w-6 h-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                  </div>
                </td>
              </tr>
            ) : !hasRows && empty ? (
              <tr>
                <td colSpan={headers.length}>
                  {empty}
                </td>
              </tr>
            ) : (
              <>{children}</>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * AdminTableRow — standard <tr> with consistent hover state.
 */
interface AdminTableRowProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function AdminTableRow({ children, onClick, className }: AdminTableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        'border-b border-gray-100 last:border-b-0 transition-colors',
        onClick ? 'cursor-pointer hover:bg-gray-50' : 'hover:bg-gray-50/50',
        className
      )}
    >
      {children}
    </tr>
  );
}

/**
 * AdminTableCell — standard <td>.
 */
interface AdminTableCellProps {
  children: React.ReactNode;
  className?: string;
  muted?: boolean;
  mono?: boolean;
}

export function AdminTableCell({
  children,
  className,
  muted,
  mono,
}: AdminTableCellProps) {
  return (
    <td
      className={cn(
        'px-4 py-3 text-sm',
        muted ? 'text-gray-400' : 'text-gray-700',
        mono && 'font-mono text-xs',
        className
      )}
    >
      {children}
    </td>
  );
}
