import React, { useEffect, useState } from 'react';
import { Activity, Users, Settings, BarChart3, Plus, Edit2, Trash2 } from 'lucide-react';
import { DashboardStats } from '../types';
import { userService } from '../services/userService';

type Tab = 'overview' | 'users';

interface SuperAdminDashboardProps {
  onLogout: () => void;
  stats: DashboardStats;
}

interface SimpleUser {
  id: number;
  username: string;
  name: string;
  role: string;
  created_at: string;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ onLogout, stats }) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SimpleUser | null>(null);
  const [formData, setFormData] = useState<{ username: string; name: string; password: string; role: 'admin' | 'petugas' }>({
    username: '',
    name: '',
    password: '',
    role: 'petugas'
  });

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  async function loadUsers() {
    try {
      setLoading(true);
      const list = await userService.getUsers();
      setUsers(list);
    } catch (e) {
      console.error('Failed to load users', e);
      alert('Gagal memuat daftar user');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingUser(null);
    setFormData({ username: '', name: '', password: '', role: 'petugas' });
    setFormOpen(true);
  }

  function openEdit(user: SimpleUser) {
    setEditingUser(user);
    setFormData({ username: user.username, name: user.name, password: '', role: (user.role as 'admin' | 'petugas') });
    setFormOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingUser) {
        await userService.updateUser({
          id: editingUser.id,
          username: formData.username,
          name: formData.name,
          password: formData.password || undefined,
          role: formData.role
        });
      } else {
        await userService.createUser({
          username: formData.username,
          name: formData.name,
          password: formData.password,
          role: formData.role
        });
      }
      setFormOpen(false);
      await loadUsers();
    } catch (e) {
      console.error('Save user failed', e);
      alert('Gagal menyimpan user');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(user: SimpleUser) {
    if (!confirm(`Hapus user ${user.username}?`)) return;
    try {
      setLoading(true);
      await userService.deleteUser(user.id);
      await loadUsers();
    } catch (e) {
      console.error('Delete user failed', e);
      alert('Gagal menghapus user');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-800">Super Admin</span>
          </div>
          <button
            onClick={onLogout}
            className="px-3 py-1.5 border rounded text-sm hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded border text-sm ${activeTab === 'overview' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded border text-sm ${activeTab === 'users' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700'}`}
          >
            Manajemen User
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-4 rounded border">
              <div className="text-sm text-gray-500 mb-1">Total Gardu</div>
              <div className="text-2xl font-semibold">{stats.totalSubstations}</div>
            </div>
            <div className="bg-white p-4 rounded border">
              <div className="text-sm text-gray-500 mb-1">Gardu Aktif</div>
              <div className="text-2xl font-semibold">{stats.activeSubstations}</div>
            </div>
            <div className="bg-white p-4 rounded border">
              <div className="text-sm text-gray-500 mb-1">UGB Aktif</div>
              <div className="text-2xl font-semibold">{stats.ugbActive}</div>
            </div>
            <div className="bg-white p-4 rounded border">
              <div className="text-sm text-gray-500 mb-1">Issue Kritis</div>
              <div className="text-2xl font-semibold">{stats.criticalIssues}</div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white p-4 rounded border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-gray-600" />
                <span className="font-semibold">Daftar User</span>
              </div>
              <button
                onClick={openCreate}
                className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Tambah User
              </button>
            </div>

            {loading && <div className="text-sm text-gray-500 mb-3">Memuat...</div>}

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="py-2 pr-4">Username</th>
                    <th className="py-2 pr-4">Nama</th>
                    <th className="py-2 pr-4">Role</th>
                    <th className="py-2 pr-4">Dibuat</th>
                    <th className="py-2 pr-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-t">
                      <td className="py-2 pr-4">{u.username}</td>
                      <td className="py-2 pr-4">{u.name}</td>
                      <td className="py-2 pr-4">{u.role}</td>
                      <td className="py-2 pr-4">{new Date(u.created_at).toLocaleString()}</td>
                      <td className="py-2 pr-4 space-x-2">
                        <button
                          onClick={() => openEdit(u)}
                          className="inline-flex items-center px-2 py-1 border rounded hover:bg-gray-50"
                        >
                          <Edit2 className="w-4 h-4 mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          className="inline-flex items-center px-2 py-1 border rounded text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {formOpen && (
              <form onSubmit={handleSubmit} className="mt-6 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Username</label>
                    <input
                      className="w-full border rounded px-2 py-1.5"
                      value={formData.username}
                      onChange={e => setFormData({ ...formData, username: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Nama</label>
                    <input
                      className="w-full border rounded px-2 py-1.5"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Password {editingUser ? '(opsional)' : ''}</label>
                    <input
                      type="password"
                      className="w-full border rounded px-2 py-1.5"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      required={!editingUser}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Role</label>
                    <select
                      className="w-full border rounded px-2 py-1.5"
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value as 'admin' | 'petugas' })}
                    >
                      <option value="admin">admin</option>
                      <option value="petugas">petugas</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    disabled={loading}
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormOpen(false)}
                    className="px-3 py-1.5 border rounded text-sm hover:bg-gray-50"
                  >
                    Batal
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;


