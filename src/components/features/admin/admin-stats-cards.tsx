import { Card, CardContent } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatItem {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  change: string;
}

interface AdminStatsCardsProps {
  stats: StatItem[];
  loading: boolean;
}

export function AdminStatsCards({ stats, loading }: AdminStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={stat.title} className="hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={cn("p-3 rounded-lg bg-accent/10", stat.color)}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground font-medium">
                  {stat.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-2xl font-bold">
                    {loading ? "..." : stat.value}
                  </p>
                  <Badge 
                    variant={
                      stat.change.startsWith('+') ? 'default' :
                      stat.change.startsWith('-') ? 'destructive' :
                      'secondary'
                    }
                    className="text-xs"
                  >
                    {stat.change}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
