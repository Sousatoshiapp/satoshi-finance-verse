import React, { memo, useMemo } from 'react';
import { VirtualList } from './virtual-list';
import { cn } from '@/lib/utils';

interface VirtualTableProps<T> {
  data: T[];
  columns: {
    key: string;
    header: string;
    render: (item: T, index: number) => React.ReactNode;
    width?: string;
  }[];
  itemHeight?: number;
  height?: number;
  className?: string;
  headerClassName?: string;
  rowClassName?: string;
}

export const VirtualTable = memo(<T,>({
  data,
  columns,
  itemHeight = 60,
  height = 400,
  className,
  headerClassName,
  rowClassName
}: VirtualTableProps<T>) => {
  const renderRow = useMemo(() => (item: T, index: number) => (
    <div 
      className={cn(
        "flex items-center border-b border-border hover:bg-muted/50 transition-colors",
        rowClassName
      )}
      style={{ height: itemHeight }}
    >
      {columns.map((column, colIndex) => (
        <div
          key={column.key}
          className="px-4 py-2 flex-1"
          style={{ width: column.width }}
        >
          {column.render(item, index)}
        </div>
      ))}
    </div>
  ), [columns, itemHeight, rowClassName]);

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <div 
        className={cn(
          "flex items-center bg-muted/50 border-b border-border font-medium",
          headerClassName
        )}
        style={{ height: itemHeight }}
      >
        {columns.map((column) => (
          <div
            key={column.key}
            className="px-4 py-2 flex-1 text-sm font-medium"
            style={{ width: column.width }}
          >
            {column.header}
          </div>
        ))}
      </div>
      
      <VirtualList
        items={data}
        itemHeight={itemHeight}
        height={height}
        renderItem={renderRow}
      />
    </div>
  );
});

VirtualTable.displayName = 'VirtualTable';
