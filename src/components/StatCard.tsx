import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "primary" | "accent" | "success" | "default";
}

export function StatCard({ title, value, subtitle, icon: Icon, variant = "default" }: StatCardProps) {
  return (
    <Card className={cn(
      "relative overflow-hidden",
      variant === "primary" && "border-primary/20 bg-primary/5",
      variant === "accent" && "border-accent/20 bg-accent/5",
      variant === "success" && "border-success/20 bg-success/5"
    )}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={cn(
            "rounded-xl p-3",
            variant === "primary" && "bg-primary/10 text-primary",
            variant === "accent" && "bg-accent/10 text-accent-foreground",
            variant === "success" && "bg-success/10 text-success",
            variant === "default" && "bg-secondary text-muted-foreground"
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
