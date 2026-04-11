import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Session {
  id: string;
  userId: string;
  title: string;
  platform: 'youtube' | 'instagram-post' | 'instagram-reel';
  status: 'active' | 'archived' | 'deleted';
  createdAt: string;
  updatedAt: string;
}

interface SessionsResponse {
  sessions: Session[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const SessionsTest: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState<'youtube' | 'instagram-post' | 'instagram-reel'>('youtube');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const API_BASE_URL = 'http://localhost:4001/api/v1';

  // Get auth token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('thumbly_access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  // Fetch sessions
  const fetchSessions = async (page = 1, search = '') => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (search) params.append('q', search);
      
      const response = await fetch(`${API_BASE_URL}/sessions?${params}`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const data: SessionsResponse = await response.json();
      setSessions(data.sessions);
      setPagination(data.pagination);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  // Create session
  const createSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/sessions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title, platform })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create session');
      }

      setSuccess('Session created successfully!');
      setTitle('');
      fetchSessions(currentPage, searchQuery);
    } catch (err: any) {
      setError(err.message || 'Failed to create session');
    }
  };

  // Update session
  const updateSessionStatus = async (sessionId: string, status: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update session');
      }

      setSuccess('Session updated successfully!');
      fetchSessions(currentPage, searchQuery);
    } catch (err: any) {
      setError(err.message || 'Failed to update session');
    }
  };

  // Delete session
  const deleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to delete session');
      }

      setSuccess('Session deleted successfully!');
      fetchSessions(currentPage, searchQuery);
    } catch (err: any) {
      setError(err.message || 'Failed to delete session');
    }
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSessions(1, searchQuery);
  };

  // Load sessions on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchSessions();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Sessions Test</h2>
        <p className="text-gray-600">Please login to test sessions.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6">Design Sessions Test</h2>
      
      {/* Create Session Form */}
      <div className="mb-8 p-4 border rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Create New Session</h3>
        <form onSubmit={createSession} className="flex gap-4">
          <input
            type="text"
            placeholder="Session title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as any)}
            className="p-2 border rounded"
          >
            <option value="youtube">YouTube</option>
            <option value="instagram-post">Instagram Post</option>
            <option value="instagram-reel">Instagram Reel</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create Session
          </button>
        </form>
      </div>

      {/* Search */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => fetchSessions(1, '')}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear
          </button>
        </form>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="mb-4 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Sessions List */}
      <div className="space-y-4">
        {sessions.map((session) => (
          <div key={session.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-lg">{session.title}</h4>
                <p className="text-gray-600">Platform: {session.platform}</p>
                <p className="text-gray-600">Status: {session.status}</p>
                <p className="text-sm text-gray-500">
                  Created: {new Date(session.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                {session.status === 'active' && (
                  <button
                    onClick={() => updateSessionStatus(session.id, 'archived')}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Archive
                  </button>
                )}
                {session.status === 'archived' && (
                  <button
                    onClick={() => updateSessionStatus(session.id, 'active')}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Activate
                  </button>
                )}
                <button
                  onClick={() => deleteSession(session.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            disabled={!pagination.hasPrev}
            onClick={() => fetchSessions(currentPage - 1, searchQuery)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {currentPage} of {pagination.pages}
          </span>
          <button
            disabled={!pagination.hasNext}
            onClick={() => fetchSessions(currentPage + 1, searchQuery)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      )}

      {/* Stats */}
      {pagination && (
        <div className="mt-6 text-center text-gray-600">
          Total sessions: {pagination.total}
        </div>
      )}
    </div>
  );
};

export default SessionsTest;
