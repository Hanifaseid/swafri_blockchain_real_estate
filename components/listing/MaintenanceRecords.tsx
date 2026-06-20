"use client";

import * as React from "react";
import { Plus, Wrench, Calendar, DollarSign, FileText } from "lucide-react";
import { useMaintenanceRecords, useCreateMaintenanceRecord } from "@/features/listings/queries/listing.queries";
import type { MaintenanceRecord, CreateMaintenanceInput } from "@/features/listings/types/listing.types";
import toast from "react-hot-toast";

interface MaintenanceRecordsProps {
  listingId: string;
}

export default function MaintenanceRecords({ listingId }: MaintenanceRecordsProps) {
  const { data, isLoading, error } = useMaintenanceRecords(listingId);
  const createMutation = useCreateMaintenanceRecord();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [formData, setFormData] = React.useState<CreateMaintenanceInput>({
    type: 'maintenance',
    amount: 0,
    currency: 'USD',
    incurredAt: new Date().toISOString().split('T')[0],
    note: '',
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading maintenance records...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500">Failed to load maintenance records</div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      { listingId, input: formData },
      {
        onSuccess: () => {
          setIsFormOpen(false);
          setFormData({
            type: 'maintenance',
            amount: 0,
            currency: 'USD',
            incurredAt: new Date().toISOString().split('T')[0],
            note: '',
          });
        },
      }
    );
  };

  const typeColors: Record<string, string> = {
    maintenance: 'bg-blue-100 text-blue-800',
    repair: 'bg-orange-100 text-orange-800',
    utility: 'bg-yellow-100 text-yellow-800',
    tax: 'bg-red-100 text-red-800',
    insurance: 'bg-purple-100 text-purple-800',
    management: 'bg-green-100 text-green-800',
    other: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Maintenance Records</h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Record
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Add Maintenance Record</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="maintenance">Maintenance</option>
                <option value="repair">Repair</option>
                <option value="utility">Utility</option>
                <option value="tax">Tax</option>
                <option value="insurance">Insurance</option>
                <option value="management">Management</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Incurred</label>
              <input
                type="date"
                value={formData.incurredAt}
                onChange={(e) => setFormData({ ...formData, incurredAt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {createMutation.isPending ? 'Adding...' : 'Add Record'}
              </button>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {data?.items && data.items.length > 0 ? (
          data.items.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Wrench className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeColors[record.type]}`}>
                        {record.type}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(record.incurredAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="font-semibold">
                          {record.currency} {record.amount.toLocaleString()}
                        </span>
                      </div>
                      {record.note && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <FileText className="h-4 w-4" />
                          <span>{record.note}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No maintenance records found
          </div>
        )}
      </div>
    </div>
  );
}
