import { ChevronUpDownIcon } from '@heroicons/react/24/outline';
import { useMemo, useState } from 'react';

export type DataTableColumn<T> = {
  key: keyof T;
  header: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  searchPlaceholder?: string;
};

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  searchPlaceholder = 'Filter records...'
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredData = useMemo(() => {
    const loweredSearch = search.toLowerCase();
    const baseRows = data.filter((row) =>
      !loweredSearch
        ? true
        : columns.some((column) => String(row[column.key] ?? '').toLowerCase().includes(loweredSearch))
    );

    if (!sortKey) {
      return baseRows;
    }

    return [...baseRows].sort((left, right) => {
      const leftValue = left[sortKey];
      const rightValue = right[sortKey];
      const normalizedLeft = typeof leftValue === 'number' ? leftValue : String(leftValue ?? '').toLowerCase();
      const normalizedRight = typeof rightValue === 'number' ? rightValue : String(rightValue ?? '').toLowerCase();

      if (normalizedLeft < normalizedRight) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (normalizedLeft > normalizedRight) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [columns, data, search, sortDirection, sortKey]);

  const toggleSort = (columnKey: keyof T) => {
    if (sortKey === columnKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(columnKey);
    setSortDirection('asc');
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <input
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary-400"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th key={String(column.key)} className="px-5 py-3 font-semibold text-slate-700">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2"
                    onClick={() => column.sortable && toggleSort(column.key)}
                  >
                    <span>{column.header}</span>
                    {column.sortable ? <ChevronUpDownIcon className="h-4 w-4 text-slate-400" /> : null}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.map((row, index) => (
              <tr key={index} className="hover:bg-slate-50/80">
                {columns.map((column) => (
                  <td key={String(column.key)} className="px-5 py-4 text-slate-600">
                    {column.render ? column.render(row) : String(row[column.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
