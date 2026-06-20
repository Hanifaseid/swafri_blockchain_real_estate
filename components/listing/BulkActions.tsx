"use client";

import * as React from "react";
import { CheckSquare, Square, Play, Trash2, Archive, AlertCircle } from "lucide-react";
import { useExecuteBulkActions } from "@/features/listings/queries/listing.queries";
import toast from "react-hot-toast";

interface BulkActionsProps {
  listingIds: string[];
  onComplete?: () => void;
}

export default function BulkActions({ listingIds, onComplete }: BulkActionsProps) {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [action, setAction] = React.useState<string>('');
  const [reason, setReason] = React.useState('');
  const [note, setNote] = React.useState('');
  const executeMutation = useExecuteBulkActions();

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === listingIds.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(listingIds));
    }
  };

  const handleExecute = () => {
    if (selectedIds.size === 0) {
      toast.error('Please select at least one listing');
      return;
    }

    if (!action) {
      toast.error('Please select an action');
      return;
    }

    const actions = Array.from(selectedIds).map(id => ({
      id,
      action,
      reason: reason || undefined,
      note: note || undefined,
    }));

    executeMutation.mutate(actions, {
      onSuccess: () => {
        setSelectedIds(new Set());
        setAction('');
        setReason('');
        setNote('');
        onComplete?.();
      },
    });
  };

  const actionOptions = [
    { value: 'approve', label: 'Approve', icon: CheckSquare },
    { value: 'reject', label: 'Reject', icon: AlertCircle },
    { value: 'archive', label: 'Archive', icon: Archive },
    { value: 'delete', label: 'Delete', icon: Trash2 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            {selectedIds.size === listingIds.length ? (
              <CheckSquare className="h-4 w-4" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            {selectedIds.size === listingIds.length ? 'Deselect All' : 'Select All'}
          </button>
          <span className="text-sm text-gray-500">
            {selectedIds.size} of {listingIds.length} selected
          </span>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Actions</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Action</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {actionOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setAction(option.value)}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                        action === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Policy violation, User request"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Additional notes or context..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleExecute}
                disabled={executeMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Play className="h-4 w-4" />
                {executeMutation.isPending ? 'Executing...' : 'Execute Action'}
              </button>
              <button
                onClick={() => {
                  setSelectedIds(new Set());
                  setAction('');
                  setReason('');
                  setNote('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          <strong>Selected IDs:</strong> {Array.from(selectedIds).join(', ') || 'None'}
        </p>
      </div>
    </div>
  );
}
