"use client";

import * as React from "react";
import { MessageSquare, Plus, Trash2, Calendar, User } from "lucide-react";
import { useComplianceNotes, useCreateComplianceNote, useDeleteComplianceNote } from "@/features/compliance/queries/compliance.queries";
import toast from "react-hot-toast";

interface ComplianceNotesProps {
  caseId: string;
}

export default function ComplianceNotes({ caseId }: ComplianceNotesProps) {
  const { data, isLoading } = useComplianceNotes(caseId);
  const createMutation = useCreateComplianceNote();
  const deleteMutation = useDeleteComplianceNote();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [noteBody, setNoteBody] = React.useState('');

  const handleCreateNote = () => {
    if (!noteBody.trim()) {
      toast.error('Please enter a note');
      return;
    }

    createMutation.mutate(
      { caseId, input: { body: noteBody } },
      {
        onSuccess: () => {
          setNoteBody('');
          setIsFormOpen(false);
        },
      }
    );
  };

  const handleDeleteNote = (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      deleteMutation.mutate({ caseId, noteId });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading notes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Case Notes</h3>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus className="h-4 w-4" />
          Add Note
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <textarea
            value={noteBody}
            onChange={(e) => setNoteBody(e.target.value)}
            placeholder="Enter your note..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleCreateNote}
              disabled={createMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
            >
              {createMutation.isPending ? 'Adding...' : 'Add Note'}
            </button>
            <button
              onClick={() => {
                setIsFormOpen(false);
                setNoteBody('');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {data && data.length > 0 ? (
          data.map((note) => (
            <div
              key={note.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{note.author}</span>
                  <span className="text-gray-400">•</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(note.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <p className="text-gray-900 whitespace-pre-wrap">{note.body}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
            No notes yet. Add a note to track case progress.
          </div>
        )}
      </div>
    </div>
  );
}
