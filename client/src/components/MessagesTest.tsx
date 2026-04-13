import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  imageAssetId?: string;
  metadata?: object;
  createdAt: string;
  updatedAt: string;
}

interface MessagesResponse {
  data: {
    messages: Message[];
  };
}

const MessagesTest: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [role, setRole] = useState<'user' | 'assistant' | 'system'>('user');
  const [content, setContent] = useState('');
  const [imageAssetId, setImageAssetId] = useState('');

  const API_BASE_URL = 'http://localhost:4001/api/v1';

  // Get auth token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('thumbly_access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  // Fetch messages for a session
  const fetchMessages = async () => {
    if (!sessionId) {
      setError('Please enter a session ID');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/messages`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data: MessagesResponse = await response.json();
      setMessages(data.data.messages);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  // Create a new message
  const createMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!sessionId) {
      setError('Please enter a session ID');
      return;
    }

    try {
      const body: any = { role, content };
      if (imageAssetId) {
        body.imageAssetId = imageAssetId;
      }

      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create message');
      }

      setSuccess('Message created successfully!');
      setContent('');
      setImageAssetId('');
      fetchMessages();
    } catch (err: any) {
      setError(err.message || 'Failed to create message');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Messages Test</h2>
        <p className="text-gray-600">Please login to test messages.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6">Messages Test</h2>
      
      {/* Session ID Input */}
      <div className="mb-8 p-4 border rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Session ID</h3>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Enter session ID"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={fetchMessages}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Load Messages
          </button>
        </div>
      </div>

      {/* Create Message Form */}
      <div className="mb-8 p-4 border rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Create New Message</h3>
        <form onSubmit={createMessage} className="space-y-4">
          <div>
            <label className="block mb-2 font-medium">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full p-2 border rounded"
            >
              <option value="user">User</option>
              <option value="assistant">Assistant</option>
              <option value="system">System</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 font-medium">Content</label>
            <textarea
              placeholder="Message content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border rounded"
              rows={4}
              maxLength={5000}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Image Asset ID (Optional)</label>
            <input
              type="text"
              placeholder="Image asset ID"
              value={imageAssetId}
              onChange={(e) => setImageAssetId(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Create Message
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

      {/* Messages List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Messages</h3>
        {messages.length === 0 ? (
          <p className="text-gray-600">No messages found. Enter a session ID to load messages.</p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`p-4 border rounded-lg ${
              message.role === 'user' ? 'bg-blue-50' : 
              message.role === 'assistant' ? 'bg-green-50' : 'bg-gray-50'
            }`}>
              <div className="flex justify-between items-start mb-2">
                <span className={`font-semibold ${
                  message.role === 'user' ? 'text-blue-600' : 
                  message.role === 'assistant' ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {message.role.charAt(0).toUpperCase() + message.role.slice(1)}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(message.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-gray-800">{message.content}</p>
              {message.imageAssetId && (
                <div className="mt-2 text-sm text-gray-600">
                  <strong>Image Asset ID:</strong> {message.imageAssetId}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      {messages.length > 0 && (
        <div className="mt-6 text-center text-gray-600">
          Total messages: {messages.length}
        </div>
      )}
    </div>
  );
};

export default MessagesTest;
