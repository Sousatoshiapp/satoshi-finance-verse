import { memo, forwardRef } from 'react';
import { useVirtualList } from '@/hooks/use-virtual-list';
import { cn } from '@/lib/utils';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  height: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
}

export const VirtualList = memo(
  forwardRef<HTMLDivElement, VirtualListProps<any>>(
    ({ items, itemHeight, height, renderItem, className, overscan = 5 }, ref) => {
      const {
        visibleItems,
        totalHeight,
        handleScroll,
        offsetY
      } = useVirtualList(items, {
        itemHeight,
        containerHeight: height,
        overscan
      });

      return (
        <div
          ref={ref}
          className={cn("overflow-auto", className)}
          style={{ height }}
          onScroll={handleScroll}
        >
          <div style={{ height: totalHeight, position: 'relative' }}>
            <div
              style={{
                transform: `translateY(${offsetY}px)`,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0
              }}
            >
              {visibleItems.map(({ item, index }) => (
                <div
                  key={index}
                  style={{
                    height: itemHeight,
                    overflow: 'hidden'
                  }}
                >
                  {renderItem(item, index)}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
  )
);

VirtualList.displayName = 'VirtualList';