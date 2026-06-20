"use client";

import * as React from "react";
import { Activity, CheckCircle, XCircle, Clock } from "lucide-react";
import { useLiveness, useReadiness } from "@/features/health/queries/health.queries";

export default function HealthPanel() {
  const { data: livenessData, isLoading: livenessLoading } = useLiveness();
  const { data: readinessData, isLoading: readinessLoading } = useReadiness();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-red-600" />;
      default:
        return <Clock className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'error':
        return 'bg-red-100 border-red-300 text-red-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const HealthCard = ({ title, data, isLoading }: { title: string; data: any; isLoading: boolean }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {isLoading ? (
          <Clock className="h-6 w-6 text-gray-400 animate-spin" />
        ) : (
          getStatusIcon(data?.status || 'unknown')
        )}
      </div>
      
      {isLoading ? (
        <div className="text-sm text-gray-500">Loading...</div>
      ) : data ? (
        <div className="space-y-3">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border-2 ${getStatusColor(data.status)}`}>
            {data.status.toUpperCase()}
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Timestamp:</span>
              <span className="text-gray-900">{new Date(data.timestamp).toLocaleString()}</span>
            </div>
            
            {data.uptime !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-600">Uptime:</span>
                <span className="text-gray-900">{Math.floor(data.uptime)}s</span>
              </div>
            )}
            
            {data.version && (
              <div className="flex justify-between">
                <span className="text-gray-600">Version:</span>
                <span className="text-gray-900">{data.version}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-sm text-red-500">Failed to load data</div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Activity className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">System Health</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <HealthCard
          title="Liveness"
          data={livenessData}
          isLoading={livenessLoading}
        />
        <HealthCard
          title="Readiness"
          data={readinessData}
          isLoading={readinessLoading}
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Health Check Information</p>
            <p className="text-sm text-blue-700 mt-1">
              Liveness checks if the service is running. Readiness checks if the service is ready to accept traffic.
              Both endpoints are polled every 30 seconds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
