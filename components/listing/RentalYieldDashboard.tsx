"use client";

import * as React from "react";
import { DollarSign, TrendingUp, Home, Activity } from "lucide-react";
import { useYieldDashboard } from "@/features/listings/queries/listing.queries";

export default function RentalYieldDashboard() {
  const { data, isLoading, error } = useYieldDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading yield dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500">Failed to load yield dashboard</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">No yield data available</div>
      </div>
    );
  }

  const metrics = [
    {
      label: "Total Listings",
      value: data.totalListings,
      icon: Home,
      color: "bg-blue-500",
    },
    {
      label: "Active Leases",
      value: data.activeLeaseCount,
      icon: Activity,
      color: "bg-green-500",
    },
    {
      label: "Gross Monthly Rent",
      value: `$${data.grossMonthlyRent.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-purple-500",
    },
    {
      label: "Realized Revenue",
      value: `$${data.realizedRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: "bg-orange-500",
    },
    {
      label: "Occupancy Rate",
      value: `${(data.occupancyRate * 100).toFixed(1)}%`,
      icon: Activity,
      color: "bg-teal-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Rental Yield Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                </div>
                <div className={`${metric.color} p-3 rounded-full`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
