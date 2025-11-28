import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { subjectsApi } from "../services/mockApi";
import type { Subject } from "../types";

const AdminSubjectsPage: React.FC = () => {
  const { user } = useAuth();

  // Admin data queries
  const { data: subjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: () => subjectsApi.getAllSubjects(),
  });

  // State for forms
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: "",
    topics: [""],
  });

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subject Catalog</h1>
          <p className="text-gray-600">Manage subjects and topics</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowSubjectForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <BookOpen className="h-4 w-4" />
            <span>Add Subject</span>
          </button>
        </div>
      </div>

      {/* Subjects Section */}
      <div className="space-y-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Subject Catalog
            </h3>
            <BookOpen className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {subjects?.map((subject) => (
              <div
                key={subject.id}
                className="p-3 rounded-lg border border-gray-200"
              >
                <div className="font-medium text-gray-900 mb-1">
                  {subject.name}
                </div>
                <div className="text-sm text-gray-600">
                  {subject.topics.length} topics
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {subject.topics.map((topic) => (
                    <span
                      key={topic.id}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                    >
                      {topic.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {!subjects?.length && (
              <p className="text-gray-500 text-sm">No subjects found</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Subject Modal */}
      {showSubjectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Subject</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  value={newSubject.name}
                  onChange={(e) =>
                    setNewSubject({ ...newSubject, name: e.target.value })
                  }
                  className="input-field"
                  placeholder="Enter subject name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topics (comma-separated)
                </label>
                <input
                  type="text"
                  value={newSubject.topics.join(", ")}
                  onChange={(e) =>
                    setNewSubject({
                      ...newSubject,
                      topics: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter((t) => t),
                    })
                  }
                  className="input-field"
                  placeholder="Enter topics separated by commas"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSubjectForm(false);
                    setNewSubject({ name: "", topics: [""] });
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubjectForm(false)}
                  className="btn-primary"
                >
                  Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubjectsPage;
