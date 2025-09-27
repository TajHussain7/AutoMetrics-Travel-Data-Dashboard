import { Card, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useTravelData } from "@/contexts/travel-data-context";
import { prepareChartData } from "@/lib/data-processing";
import { getFlightStatus } from "@/lib/utils";

const COLORS = {
  blue: "hsl(207, 90%, 54%)",
  green: "hsl(159, 67%, 52%)",
  orange: "hsl(27, 87%, 55%)",
  red: "hsl(0, 84%, 60%)",
  purple: "hsl(262, 83%, 58%)",
  slate: "hsl(215, 13%, 65%)",
  amber: "hsl(42, 95%, 60%)",
};

export default function ChartsGrid() {
  const { travelData } = useTravelData();
  const chartData = prepareChartData(travelData);

  if (travelData.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="text-center py-12">
              <p className="text-lg text-slate-600 mb-2">
                No data available for analytics
              </p>
              <p className="text-sm text-slate-500">
                Upload travel data to see charts and analytics here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const flightStatusData = [
    {
      name: "Coming",
      value: travelData.filter((r) => getFlightStatus(r) === "Coming").length,
      color: COLORS.green,
    },
    {
      name: "Gone",
      value: travelData.filter((r) => getFlightStatus(r) === "Gone").length,
      color: COLORS.amber,
    },
    {
      name: "Cancelled",
      value: travelData.filter((r) => getFlightStatus(r) === "Cancelled")
        .length,
      color: COLORS.red,
    },
  ];

  return (
    <div id="analytics-content" className="space-y-6">
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <h3 className="text-lg font-semibold text-slate-800">
              Analytics & Reports
            </h3>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-4 md:p-6">
            <h4 className="text-lg font-semibold text-slate-800 mb-4">
              Rates Comparison by Month
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.monthlyRevenue}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(210, 40%, 96%)"
                  />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(215, 13%, 65%)"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(215, 13%, 65%)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid hsl(210, 40%, 90%)",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => [`$${value}`, ""]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="customer_rate"
                    stroke={COLORS.blue}
                    strokeWidth={2}
                    name="Customer Rate"
                  />
                  <Line
                    type="monotone"
                    dataKey="company_rate"
                    stroke={COLORS.orange}
                    strokeWidth={2}
                    name="Company Rate"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <h4 className="text-lg font-semibold text-slate-800 mb-4">
              Flight Status Overview
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={flightStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label
                  >
                    {flightStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardContent className="p-4 md:p-6">
            <h4 className="text-lg font-semibold text-slate-800 mb-4">
              Top Profitable Bookings by PNR
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.profitTrends}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(210, 40%, 96%)"
                  />
                  <XAxis
                    dataKey="pnr"
                    stroke="hsl(215, 13%, 65%)"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(215, 13%, 65%)"
                    fontSize={12}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid hsl(210, 40%, 90%)",
                      borderRadius: "8px",
                    }}
                    formatter={(value, name) => [`$${value}`, "Profit"]}
                    labelFormatter={(label) => `PNR: ${label}`}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    fill="hsl(159, 67%, 52%, 0.3)"
                    stroke={COLORS.green}
                    strokeWidth={2}
                    name="Profit"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
