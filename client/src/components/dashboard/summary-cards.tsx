import { TrendingUp, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTravelData } from "@/contexts/travel-data-context";
import { calculateDashboardMetrics } from "@/lib/data-processing";

export default function SummaryCards() {
  const { travelData } = useTravelData();
  const metrics = calculateDashboardMetrics(travelData);

  const cards = [
    {
      title: "Total Bookings",
      value: metrics.totalBookings.toLocaleString(),
      icon: TrendingUp,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-1000",
    },
    {
      title: "Total Profit",
      value:
        travelData.length > 0
          ? new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(metrics.totalProfit)
          : "$0.00",
      icon: BarChart3,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-1000",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card
            key={index}
            className="border-0 shadow-md hover:shadow-lg transition-all duration-200 bg-white"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 mb-1">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {card.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center`}
                >
                  <Icon className={`${card.iconColor} h-6 w-6`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
