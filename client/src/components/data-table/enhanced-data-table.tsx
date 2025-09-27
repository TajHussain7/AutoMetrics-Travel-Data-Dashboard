import { useState, useMemo, Fragment } from "react";
import {
  Search,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useTravelData } from "@/contexts/travel-data-context";
import { useUpdateTravelData } from "@/hooks/use-travel-data";
import { filterTravelData, sortTravelData } from "@/lib/data-processing";
import { useQueryClient } from "@tanstack/react-query";
import { cn, getFlightStatus } from "@/lib/utils";
import type { TravelData } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useTravelDataBySession } from "@/hooks/use-travel-data";

export default function EnhancedDataTable() {
  const { travelData, currentSessionId } = useTravelData();
  const updateMutation = useUpdateTravelData();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { refetch } = useTravelDataBySession(currentSessionId);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<keyof TravelData>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Local edit state for smoother rate editing
  const [editedCustomerRates, setEditedCustomerRates] = useState<
    Record<string, string>
  >({});
  const [editedCompanyRates, setEditedCompanyRates] = useState<
    Record<string, string>
  >({});

  const filteredAndSortedData = useMemo(() => {
    let filtered = filterTravelData(travelData, {
      search,
      status: "All Status", // Default to show all
    });
    return sortTravelData(filtered, sortBy, sortOrder);
  }, [travelData, search, sortBy, sortOrder]);

  const handleSort = (column: keyof TravelData) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(filteredAndSortedData.map((item) => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedItems(newSelected);
  };

  const getRowColor = (index: number) => {
    return index % 2 === 0 ? "bg-white" : "bg-slate-50/50";
  };

  const formatCurrency = (value: number | undefined) => {
    if (typeof value !== "number" || isNaN(value)) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number | undefined) => {
    if (typeof value !== "number" || isNaN(value) || value === 0) return "0";
    return Math.round(value).toString();
  };

  const formatRoute = (route: string | null) => {
    if (!route) return null;
    const segments = route.split("-");
    return (
      <div className="inline-flex items-center space-x-1">
        {segments.map((segment, index) => (
          <Fragment key={`${index}-${segment}`}>
            <span className="font-mono">{segment}</span>
            {index < segments.length - 1 && (
              <ArrowRight className="h-3 w-3 text-blue-500" />
            )}
          </Fragment>
        ))}
      </div>
    );
  };

  const formatDate = (dateStr: string) => {
    try {
      // Try to create a date object from the input string
      const date = new Date(dateStr);

      // If it's a valid date
      if (!isNaN(date.getTime())) {
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }

      // If the date string is in DD/MM/YYYY format already
      if (dateStr.includes("/")) {
        const [day, month, year] = dateStr.split("/").map(Number);
        if (day && month && year) {
          return `${day.toString().padStart(2, "0")}/${month
            .toString()
            .padStart(2, "0")}/${year}`;
        }
      }

      // Return original string if parsing fails
      return dateStr;
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateStr; // Return original string if parsing fails
    }
  };

  const SortButton = ({
    column,
    children,
  }: {
    column: keyof TravelData;
    children: React.ReactNode;
  }) => (
    <button
      onClick={() => handleSort(column)}
      className="flex items-center gap-1.5 group hover:text-blue-50 transition-all duration-200 whitespace-nowrap w-full"
    >
      <span className="font-medium">{children}</span>
      <div className="flex flex-col -space-y-2">
        <ChevronUp
          className={cn(
            "w-4 h-4 transition-all duration-200",
            sortBy === column && sortOrder === "asc"
              ? "text-blue-200"
              : "text-slate-300 group-hover:text-slate-200"
          )}
        />
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-all duration-200",
            sortBy === column && sortOrder === "desc"
              ? "text-blue-200"
              : "text-slate-300 group-hover:text-slate-200"
          )}
        />
      </div>
    </button>
  );

  const getEffectiveCustomer = (row: TravelData) =>
    editedCustomerRates[row.id] ?? row.customer_rate?.toString() ?? "0";
  const getEffectiveCompany = (row: TravelData) =>
    editedCompanyRates[row.id] ?? row.company_rate?.toString() ?? "0";

  const commitRates = async (row: TravelData) => {
    try {
      // Parse edited values or use existing values
      const customer_rate = Math.max(
        0,
        parseFloat(editedCustomerRates[row.id] || "0")
      );
      const company_rate = Math.max(
        0,
        parseFloat(editedCompanyRates[row.id] || "0")
      );

      // Calculate profit (allowing negative values)
      const profit = customer_rate - company_rate;

      // Round all values - sending as numbers to match the schema
      const rounded_customer_rate = Math.round(customer_rate);
      const rounded_company_rate = Math.round(company_rate);
      const rounded_profit = Math.round(profit);

      console.log("Updating rates:", {
        customer_rate: rounded_customer_rate,
        company_rate: rounded_company_rate,
        profit: rounded_profit,
      });

      // Update the data with proper number types
      await updateMutation.mutateAsync({
        id: row.id,
        data: {
          customer_rate: rounded_customer_rate,
          company_rate: rounded_company_rate,
          profit: rounded_profit,
        },
      });

      // Clear edited states after successful update
      setEditedCustomerRates((prev: Record<string, string>) => {
        const next = { ...prev };
        delete next[row.id];
        return next;
      });
      setEditedCompanyRates((prev: Record<string, string>) => {
        const next = { ...prev };
        delete next[row.id];
        return next;
      });

      // Force a refresh of all related data
      await queryClient.invalidateQueries({ queryKey: ["/api/travel-data"] });
      await queryClient.invalidateQueries({
        queryKey: ["/api/travel-data", currentSessionId],
      });

      // Show success toast
      toast({
        title: "Rates Updated",
        description: `Successfully updated rates and profit calculation.`,
        duration: 2000,
      });
    } catch (error) {
      console.error("Error updating rates:", error);
      toast({
        title: "Error",
        description: "Failed to update rates. Please try again.",
        variant: "destructive",
        duration: 3000,
      });

      // Revert local state on error
      setEditedCustomerRates((prev: Record<string, string>) => ({
        ...prev,
        [row.id]: (row.customer_rate ?? 0).toString(),
      }));
      setEditedCompanyRates((prev: Record<string, string>) => ({
        ...prev,
        [row.id]: (row.company_rate ?? 0).toString(),
      }));
    }
  };

  const handleFlightStatusChange = async (row: TravelData, value: string) => {
    // Get the current actual status based on date
    const currentStatus = getFlightStatus(row);

    // If the flight is Gone, don't allow any changes
    if (currentStatus === "Gone") {
      toast({
        title: "Cannot Change Status",
        description:
          "Flight date has already passed. Status is locked to 'Gone'.",
        variant: "destructive",
      });
      return;
    }

    // For upcoming flights, allow toggling between Coming and Cancelled
    await updateMutation.mutateAsync({
      id: row.id,
      data: {
        flying_status: value === "Cancelled" ? "Cancelled" : undefined,
      },
    });
  };

  if (travelData.length === 0) {
    return (
      <Card className="shadow-xl border-0">
        <CardContent className="p-8">
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              No travel data available
            </h3>
            <p className="text-slate-500">
              Upload a CSV or Excel file to see your travel bookings here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Controls */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-1 items-center gap-2">
              <Badge
                variant="outline"
                className="px-3 py-1 whitespace-nowrap shadow-sm hover:shadow transition-shadow"
              >
                {filteredAndSortedData.length} entries
              </Badge>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search bookings, customers, routes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-full border-slate-200 focus:border-blue-500 focus:ring-blue-500 shadow-sm hover:shadow transition-shadow"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "border-slate-200 min-w-[100px] transition-all duration-500 shadow-sm hover:shadow",
                  isRefreshing && "bg-slate-50/50 cursor-wait"
                )}
                disabled={isRefreshing}
                onClick={async () => {
                  try {
                    setIsRefreshing(true);
                    await refetch();
                    toast({
                      title: "Refreshed",
                      description: "The data has been updated successfully.",
                      duration: 3000,
                    });
                  } catch (error) {
                    toast({
                      title: "Error",
                      description:
                        "Failed to refresh the data. Please try again.",
                      variant: "destructive",
                      duration: 3000,
                    });
                  } finally {
                    setIsRefreshing(false);
                  }
                }}
              >
                <div className="flex items-center justify-center w-full min-w-[100px]">
                  <RefreshCw
                    className={cn(
                      "w-4 h-4 mr-2 transition-all duration-700",
                      isRefreshing && "animate-spin"
                    )}
                  />
                  <span>Refresh</span>
                </div>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "border-slate-200 min-w-[100px] transition-all duration-200 shadow-sm hover:shadow",
                  selectedItems.size > 0
                    ? "text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    : "text-slate-500 bg-slate-50 border-slate-300 hover:bg-slate-100 hover:text-slate-600"
                )}
                disabled={selectedItems.size === 0}
                onClick={() => {
                  const itemsToDelete = Array.from(selectedItems);
                  const selectedCount = itemsToDelete.length;
                  const itemNames = itemsToDelete.map((id) => {
                    const item = filteredAndSortedData.find((d) => d.id === id);
                    return item?.customer_name || "Unknown";
                  });

                  const displayNames =
                    selectedCount === 1
                      ? itemNames[0]
                      : `${selectedCount} entries`;

                  toast({
                    title: "Confirm Deletion",
                    description: (
                      <div className="mt-2 space-y-2">
                        <p>Are you sure you want to delete {displayNames}?</p>
                        {selectedCount === 1 && (
                          <p className="font-medium text-slate-700">
                            This action cannot be undone.
                          </p>
                        )}
                        <div className="flex space-x-2 mt-4">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={async () => {
                              try {
                                // Here you would call your delete API
                                await Promise.all(
                                  itemsToDelete.map((id) =>
                                    updateMutation.mutateAsync({
                                      id,
                                      data: { booking_status: "Deleted" },
                                    })
                                  )
                                );
                                setSelectedItems(new Set());
                                toast({
                                  title: "Deleted Successfully",
                                  description: `${displayNames} ${
                                    selectedCount === 1 ? "has" : "have"
                                  } been deleted.`,
                                  duration: 3000,
                                });
                              } catch (error) {
                                toast({
                                  title: "Error",
                                  description:
                                    "Failed to delete entries. Please try again.",
                                  variant: "destructive",
                                  duration: 3000,
                                });
                              }
                            }}
                          >
                            Delete
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Cancelled",
                                description: "No entries were deleted.",
                                duration: 2000,
                              });
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ),
                    duration: 10000,
                  });
                }}
              >
                <div className="flex items-center justify-center w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  <span>Delete</span>
                </div>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Excel-style Data Table */}
      <Card className="shadow-xl border-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header */}
            <thead className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
              <tr>
                <th className="w-12 px-4 py-4 text-left">
                  <Checkbox
                    checked={
                      selectedItems.size === filteredAndSortedData.length &&
                      filteredAndSortedData.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                    className="border-white text-white"
                  />
                </th>
                <th className="px-4 py-4 text-left min-w-[100px]">
                  <SortButton column="date">Date</SortButton>
                </th>
                <th className="px-4 py-4 text-left min-w-[120px]">
                  <SortButton column="voucher">Voucher</SortButton>
                </th>
                <th className="px-4 py-4 text-left min-w-[140px]">
                  <SortButton column="customer_name">Customer</SortButton>
                </th>
                <th className="px-4 py-4 text-left min-w-[120px]">
                  <SortButton column="route">Route</SortButton>
                </th>
                <th className="px-4 py-4 text-left min-w-[100px]">
                  <SortButton column="pnr">PNR</SortButton>
                </th>
                <th className="px-4 py-4 text-left min-w-[120px]">
                  <SortButton column="flying_date">Flying Date</SortButton>
                </th>
                <th className="px-4 py-4 text-left min-w-[120px]">
                  Flight Status
                </th>
                <th className="px-4 py-4 text-right min-w-[100px]">
                  <SortButton column="debit">Debit</SortButton>
                </th>
                <th className="px-4 py-4 text-right min-w-[100px]">
                  <SortButton column="credit">Credit</SortButton>
                </th>
                <th className="px-4 py-4 text-right min-w-[100px]">
                  <SortButton column="balance">Balance</SortButton>
                </th>
                <th className="px-4 py-4 text-right min-w-[130px]">
                  <SortButton column="customer_rate">Customer Rate</SortButton>
                </th>
                <th className="px-4 py-4 text-right font-semibold">
                  <SortButton column="company_rate">Company Rate</SortButton>
                </th>
                <th className="px-4 py-4 text-right font-semibold">
                  <SortButton column="profit">Profit</SortButton>
                </th>
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {filteredAndSortedData.map((item, index) => {
                const effectiveCustomer = getEffectiveCustomer(item);
                const effectiveCompany = getEffectiveCompany(item);
                const c = parseFloat(effectiveCustomer || "0") || 0;
                const k = parseFloat(effectiveCompany || "0") || 0;
                const previewProfit = new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(c - k);
                const flightStatus = getFlightStatus(item);
                return (
                  <tr
                    key={item.id}
                    className={cn(
                      "border-b border-slate-100 hover:bg-blue-50/50 transition-colors duration-150",
                      getRowColor(index),
                      selectedItems.has(item.id) && "bg-blue-100/80"
                    )}
                  >
                    <td className="px-4 py-4">
                      <Checkbox
                        checked={selectedItems.has(item.id)}
                        onCheckedChange={(checked) =>
                          handleSelectItem(item.id, checked as boolean)
                        }
                      />
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-slate-700">
                      {formatDate(item.date)}
                    </td>
                    <td className="px-4 py-4">
                      <code className="bg-slate-200 text-slate-800 px-2 py-1 rounded text-sm font-mono">
                        {item.voucher}
                      </code>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-900">
                        {item.customer_name || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {item.route ? formatRoute(item.route) : "—"}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <code className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-mono">
                        {item.pnr || "—"}
                      </code>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">
                      {item.flying_date ? formatDate(item.flying_date) : "—"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {flightStatus === "Gone" ? (
                        // Past flights are locked to "Gone" status
                        <span className="w-28 h-8 text-sm font-medium text-amber-800 bg-amber-100 px-3 py-1 rounded shadow-sm inline-flex items-center justify-center">
                          Gone
                        </span>
                      ) : (
                        // Future flights can be toggled between Coming and Cancelled
                        <Select
                          value={flightStatus}
                          onValueChange={(v) =>
                            handleFlightStatusChange(item, v)
                          }
                        >
                          <SelectTrigger
                            className={cn(
                              flightStatus === "Cancelled"
                                ? "w-28 h-8 text-sm font-medium text-red-800 bg-red-100 px-3 py-1 rounded shadow-sm"
                                : "w-28 h-8 text-sm font-medium text-green-800 bg-green-100 px-3 py-1 rounded shadow-sm",
                              "border-0"
                            )}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Coming">Coming</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-sm">
                      <span
                        className={
                          item.debit
                            ? "text-red-600 font-semibold"
                            : "text-slate-400"
                        }
                      >
                        {formatCurrency(item.debit)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-sm">
                      <span
                        className={
                          item.credit
                            ? "text-green-600 font-semibold"
                            : "text-slate-400"
                        }
                      >
                        {formatCurrency(item.credit)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-sm font-semibold">
                      <span
                        className={cn(
                          item.balance !== undefined && item.balance > 0
                            ? "text-green-600"
                            : item.balance !== undefined && item.balance < 0
                            ? "text-red-600"
                            : "text-slate-400"
                        )}
                      >
                        {formatCurrency(item.balance)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={
                            editedCustomerRates[item.id] ??
                            (!item.customer_rate || item.customer_rate === 0
                              ? ""
                              : formatNumber(item.customer_rate))
                          }
                          onChange={(e) =>
                            setEditedCustomerRates(
                              (s: Record<string, string>) => ({
                                ...s,
                                [item.id]: e.target.value,
                              })
                            )
                          }
                          onBlur={() => commitRates(item)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter")
                              (e.target as HTMLInputElement).blur();
                          }}
                          className="w-24 text-right font-mono"
                          placeholder="0"
                          min="0"
                          step="1"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={
                            editedCompanyRates[item.id] ??
                            (!item.company_rate || item.company_rate === 0
                              ? ""
                              : item.company_rate.toString())
                          }
                          onChange={(e) =>
                            setEditedCompanyRates((s) => ({
                              ...s,
                              [item.id]: e.target.value,
                            }))
                          }
                          onBlur={() => commitRates(item)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter")
                              (e.target as HTMLInputElement).blur();
                          }}
                          className="w-24 text-right font-mono"
                          placeholder="0"
                          min="0"
                          step="1"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-sm">
                      <span
                        className={cn(
                          c - k === 0
                            ? "text-slate-400"
                            : c - k > 0
                            ? "text-green-600 font-semibold"
                            : "text-red-600 font-semibold"
                        )}
                      >
                        {previewProfit}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
