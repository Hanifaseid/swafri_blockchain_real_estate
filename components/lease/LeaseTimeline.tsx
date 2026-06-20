"use client";

import * as React from "react";
import { CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { useLeaseTimeline } from "@/features/leases/queries/lease.queries";

interface LeaseTimelineProps {
  leaseId: string;
}

export default function LeaseTimeline({ leaseId }: LeaseTimelineProps) {
  const { data, isLoading, error } = useLeaseTimeline(leaseId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500">Failed to load lease timeline</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">No timeline data available</div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'active':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-gray-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-300';
      case 'active':
        return 'bg-blue-100 border-blue-300';
      case 'pending':
        return 'bg-gray-100 border-gray-300';
      default:
        return 'bg-orange-100 border-orange-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Lease Timeline</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Status:</span>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {data.currentStatus}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          {data.events.map((event, index) => (
            <div key={event.key} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`p-2 rounded-full border-2 ${getStatusColor(event.status)}`}>
                  {getStatusIcon(event.status)}
                </div>
                {index < data.events.length - 1 && (
                  <div className="w-0.5 h-12 bg-gray-200 mt-2" />
                )}
              </div>
              <div className="flex-1 pb-6">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900">{event.label}</h3>
                  {event.at && (
                    <span className="text-sm text-gray-500">
                      {new Date(event.at).toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 capitalize">
                  Status: {event.status}
                </p>
                {event.metadata && Object.keys(event.metadata).length > 0 && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-700 mb-1">Details:</p>
                    <div className="text-xs text-gray-600 space-y-1">
                      {Object.entries(event.metadata).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium">{key}:</span>{' '}
                          <span>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-900">Escrow State</p>
            <p className="text-sm text-blue-700">{data.escrowState}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
