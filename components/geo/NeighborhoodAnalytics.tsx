"use client";

import * as React from "react";
import { MapPin, TrendingUp, Home, DollarSign, BarChart3 } from "lucide-react";
import { useGeoNeighborhoodStats } from "@/features/listings/queries/listing.queries";

interface NeighborhoodAnalyticsProps {
  region?: string;
}

export default function NeighborhoodAnalytics({ region }: NeighborhoodAnalyticsProps) {
  const { data, isLoading, error } = useGeoNeighborhoodStats(region ? { region } : undefined);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading neighborhood analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500">Failed to load neighborhood analytics</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">No neighborhood data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Neighborhood Analytics</h2>
        {region && (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {region}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((neighborhood) => (
          <div
            key={`${neighborhood.city}-${neighborhood.region}`}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">{neighborhood.city}</h3>
                  <p className="text-sm text-gray-500">{neighborhood.region}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{neighborhood.count}</p>
                <p className="text-xs text-gray-500">Listings</p>
              </div>
            </div>

            <div className="space-y-3">
              {neighborhood.avgPrice !== null && (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-700">Avg Price</span>
                  </div>
                  <span className="font-semibold text-green-700">
                    ${neighborhood.avgPrice.toLocaleString()}
                  </span>
                </div>
              )}

              {neighborhood.avgMonthlyRent !== null && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-700">Avg Rent</span>
                  </div>
                  <span className="font-semibold text-blue-700">
                    ${neighborhood.avgMonthlyRent.toLocaleString()}/mo
                  </span>
                </div>
              )}

              {neighborhood.minPrice !== null && neighborhood.maxPrice !== null && (
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-gray-700">Price Range</span>
                  </div>
                  <span className="font-semibold text-purple-700">
                    ${neighborhood.minPrice.toLocaleString()} - ${neighborhood.maxPrice.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {neighborhood.availability && Object.keys(neighborhood.availability).length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Availability</span>
                </div>
                <div className="space-y-1">
                  {Object.entries(neighborhood.availability).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 capitalize">{status.replace(/_/g, ' ')}</span>
                      <span className="font-medium text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
