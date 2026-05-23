import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Shield, Bell, Search, TrendingUp,
  FileText, Video, Flame, Star, Ban, CheckCircle, XCircle,
  Send, Eye, BarChart3, Activity, Zap, ChevronRight, AlertTriangle,
  UserCheck, UserX, BookOpen, Award, UploadCloud
} from 'lucide-react';
import {
  getAdminAnalytics, getAdminUsers, adminUserAction,
  getModerationQueue, moderationAction,
  broadcastNotification, uploadAdminResource
} from '../api/adminAPI';
import { getPendingExams, reviewPendingExam } from '../api/examsAPI';

/* ═══════════════════════════════════════════════════════════════
   ADMIN SIDEBAR
═══════════════════════════════════════════════════════════════ */
const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'content', label: 'Content CMS', icon: UploadCloud },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'moderation', label: 'Moderation', icon: Shield },
  { id: 'exams', label: 'Pending Exams', icon: FileText },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

const Sidebar = ({ activeTab, setActiveTab }) => (
  <aside className="w-64 bg-gray-900 min-h-screen fixed left-0 top-0 pt-20 z-40 border-r border-gray-800">
    <div className="px-4 py-6">
      <div className="flex items-center gap-3 mb-8 px-3">
        <div className="p-2 bg-india-saffron rounded-xl">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-white font-black text-lg">Control Room</h2>
          <p className="text-gray-500 text-xs font-medium">Super Admin</p>
        </div>
      </div>
      <nav className="space-y-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-india-saffron text-white shadow-lg shadow-orange-900/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  </aside>
);

/* ═══════════════════════════════════════════════════════════════
   KPI CARD
═══════════════════════════════════════════════════════════════ */
const KPICard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 hover:border-gray-600 transition-colors">
    <div className="flex items-center justify-between mb-3">
      <div className={`p-2.5 rounded-xl ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
    <div className="text-3xl font-black text-white mb-1">{value}</div>
    <div className="text-sm text-gray-400 font-medium">{label}</div>
    {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD TAB
═══════════════════════════════════════════════════════════════ */
const DashboardTab = ({ analytics }) => {
  if (!analytics) return <LoadingState />;

  const { kpis, streak_distribution, weak_heatmap, content_stats } = analytics;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-white mb-6">Platform Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard label="Total Users" value={kpis.total_users} icon={Users} color="bg-blue-600" />
          <KPICard label="Active Today (DAU)" value={kpis.dau} icon={Activity} color="bg-green-600" sub={`WAU: ${kpis.wau}`} />
          <KPICard label="Avg XP / User" value={kpis.avg_xp} icon={Star} color="bg-purple-600" sub={`Total: ${kpis.total_xp?.toLocaleString()}`} />
          <KPICard label="Avg Streak" value={`${kpis.avg_streak} days`} icon={Flame} color="bg-orange-600" />
        </div>
      </div>

      {/* Content Stats */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Content Library</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <KPICard label="Total Resources" value={content_stats.total_resources} icon={BookOpen} color="bg-emerald-600" />
          <KPICard label="PDFs" value={content_stats.pdfs} icon={FileText} color="bg-teal-600" />
          <KPICard label="Videos" value={content_stats.videos} icon={Video} color="bg-indigo-600" />
          <KPICard label="Community Uploads" value={content_stats.community_uploads} icon={Users} color="bg-pink-600" />
        </div>
      </div>

      {/* Streak Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" /> Streak Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(streak_distribution || {}).map(([key, val]) => {
              const labels = { '0_days': '0 days', '1_3_days': '1-3 days', '4_7_days': '4-7 days', '8_14_days': '8-14 days', '15_plus': '15+ days' };
              const colors = { '0_days': 'bg-gray-600', '1_3_days': 'bg-yellow-500', '4_7_days': 'bg-orange-500', '8_14_days': 'bg-green-500', '15_plus': 'bg-emerald-400' };
              const total = Object.values(streak_distribution).reduce((a, b) => a + b, 1);
              const pct = Math.round((val / total) * 100);
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400 font-medium">{labels[key]}</span>
                    <span className="text-white font-bold">{val} users ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className={`${colors[key]} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weak Subject Heatmap */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" /> Weak Subject Heatmap
          </h3>
          {weak_heatmap?.length > 0 ? (
            <div className="space-y-3">
              {weak_heatmap.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400 font-medium">{item.topic}</span>
                    <span className="text-red-400 font-bold">{item.percentage}% users weak</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No weak topic data yet. Students need to take quizzes first.</p>
          )}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   USERS TAB
═══════════════════════════════════════════════════════════════ */
const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, total_pages: 1 });
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getAdminUsers(page, search);
      setUsers(res.data.users);
      setMeta({ total: res.data.total, total_pages: res.data.total_pages });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page, search]);

  const handleAction = async (userId, action) => {
    try {
      await adminUserAction(userId, action);
      fetchUsers();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white">User Management</h2>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-india-saffron outline-none w-72"
          />
        </div>
      </div>

      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-xs text-gray-500 font-bold uppercase px-5 py-4">User</th>
                <th className="text-left text-xs text-gray-500 font-bold uppercase px-5 py-4">Email</th>
                <th className="text-center text-xs text-gray-500 font-bold uppercase px-5 py-4">XP</th>
                <th className="text-center text-xs text-gray-500 font-bold uppercase px-5 py-4">Level</th>
                <th className="text-center text-xs text-gray-500 font-bold uppercase px-5 py-4">Streak</th>
                <th className="text-center text-xs text-gray-500 font-bold uppercase px-5 py-4">Status</th>
                <th className="text-center text-xs text-gray-500 font-bold uppercase px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-700/50 hover:bg-gray-750 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {(u.first_name?.[0] || u.username[0]).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-semibold text-sm">{u.first_name || u.username} {u.last_name}</div>
                        <div className="text-gray-500 text-xs">@{u.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-sm">{u.email || '—'}</td>
                  <td className="px-5 py-4 text-center">
                    <span className="text-yellow-400 font-bold text-sm">{u.xp}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="bg-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded-lg text-xs font-bold">Lv.{u.level}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="text-orange-400 font-bold text-sm flex items-center justify-center gap-1">
                      <Flame className="w-3.5 h-3.5" /> {u.streak}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    {u.is_active ? (
                      <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-lg text-xs font-bold">Active</span>
                    ) : (
                      <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-lg text-xs font-bold">Blocked</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {u.is_active ? (
                        <button onClick={() => handleAction(u.id, 'block')} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Block User">
                          <Ban className="w-4 h-4" />
                        </button>
                      ) : (
                        <button onClick={() => handleAction(u.id, 'unblock')} className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors" title="Unblock User">
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-700">
          <span className="text-gray-500 text-sm">{meta.total} users total</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm font-semibold disabled:opacity-40 hover:bg-gray-600 transition-colors">Prev</button>
            <span className="px-4 py-2 text-gray-400 text-sm">{page} / {meta.total_pages}</span>
            <button disabled={page >= meta.total_pages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm font-semibold disabled:opacity-40 hover:bg-gray-600 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MODERATION TAB
═══════════════════════════════════════════════════════════════ */
const ModerationTab = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const res = await getModerationQueue();
      setQueue(res.data.resources || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchQueue(); }, []);

  const handleAction = async (resourceId, action) => {
    try {
      await moderationAction(resourceId, action);
      setQueue(prev => prev.filter(r => r.id !== resourceId));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-white">Community Moderation</h2>
      
      {queue.length === 0 ? (
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-12 text-center">
          <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400 mb-2">All Clear!</h3>
          <p className="text-gray-500">No community uploads to review right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {queue.map((item) => (
            <div key={item.id} className="bg-gray-800 rounded-2xl border border-gray-700 p-5 hover:border-gray-600 transition-colors">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl flex-shrink-0 ${item.resource_type === 'pdf' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/20 text-purple-400'}`}>
                  {item.resource_type === 'pdf' ? <FileText className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-bold text-sm line-clamp-2 mb-1">{item.title}</h4>
                  <p className="text-gray-500 text-xs mb-2">Uploaded by <span className="text-gray-300 font-semibold">{item.uploaded_by}</span></p>
                  {item.description && <p className="text-gray-500 text-xs line-clamp-2 mb-3">{item.description}</p>}
                  
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleAction(item.id, 'approve')} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs font-bold hover:bg-green-500/30 transition-colors">
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button onClick={() => handleAction(item.id, 'reject')} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/30 transition-colors">
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-500/30 transition-colors ml-auto">
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   CONTENT CMS TAB
═══════════════════════════════════════════════════════════════ */
const ContentTab = () => {
  const [formData, setFormData] = useState({
    title: '', description: '', url: '', resource_type: 'video'
  });
  const [file, setFile] = useState(null);
  const [uploadMethod, setUploadMethod] = useState('url');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || (uploadMethod === 'url' && !formData.url) || (uploadMethod === 'file' && !file)) {
      setMessage({ type: 'error', text: 'Title and URL/File are required.' });
      return;
    }
    
    setUploading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('resource_type', formData.resource_type);
    if (uploadMethod === 'url' && formData.url) data.append('url', formData.url);
    if (uploadMethod === 'file' && file) data.append('file', file);

    try {
      await uploadAdminResource(data);
      setMessage({ type: 'success', text: 'Resource uploaded and published successfully!' });
      setFormData({ title: '', description: '', url: '', resource_type: 'video' });
      setFile(null);
    } catch (err) {
      setMessage({ type: 'error', text: 'Upload failed. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-black text-white">Content CMS (Direct Upload)</h2>
      
      <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8">
        {message && (
          <div className={`p-4 rounded-xl text-sm font-medium mb-6 ${
            message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-sm font-bold text-gray-400 mb-2">Resource Title</label>
              <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-india-saffron outline-none"
                placeholder="E.g., Quantum Physics Masterclass" />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-bold text-gray-400 mb-2">Resource Type & Upload Method</label>
              <select 
                value={uploadMethod === 'url' && formData.resource_type === 'video' ? 'video_url' : uploadMethod === 'file' && formData.resource_type === 'video' ? 'video_file' : 'pdf_file'} 
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'video_url') {
                    setFormData({...formData, resource_type: 'video'});
                    setUploadMethod('url');
                  } else if (val === 'video_file') {
                    setFormData({...formData, resource_type: 'video'});
                    setUploadMethod('file');
                  } else {
                    setFormData({...formData, resource_type: 'pdf'});
                    setUploadMethod('file');
                  }
                }}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-india-saffron outline-none">
                <option value="video_url">Video URL (YouTube)</option>
                <option value="video_file">Upload Video File</option>
                <option value="pdf_file">Upload PDF Document</option>
              </select>
            </div>
            
            {uploadMethod === 'url' ? (
              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-400 mb-2">{formData.resource_type === 'video' ? 'Video' : 'Document'} URL</label>
                <input type="url" value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-india-saffron outline-none"
                  placeholder="https://..." />
              </div>
            ) : (
              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-400 mb-2">Upload {formData.resource_type === 'video' ? 'Video' : 'PDF'} File</label>
                <input type="file" accept={formData.resource_type === 'video' ? "video/*" : ".pdf"} onChange={(e) => setFile(e.target.files[0])}
                  className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-india-saffron outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-gray-800 file:text-white hover:file:bg-gray-700" />
              </div>
            )}
            
            <div className="col-span-2">
              <label className="block text-sm font-bold text-gray-400 mb-2">Description (Optional)</label>
              <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-india-saffron outline-none resize-none"
                placeholder="Brief description of the resource..." />
            </div>
          </div>
          
          <button type="submit" disabled={uploading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-500 transition-colors disabled:opacity-50">
            <UploadCloud className="w-5 h-5" />
            {uploading ? 'Publishing Resource...' : 'Publish to Platform directly'}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   NOTIFICATIONS TAB
═══════════════════════════════════════════════════════════════ */
const NotificationsTab = () => {
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const res = await broadcastNotification(message, target);
      setResult({ type: 'success', text: `Notification sent to ${res.data.recipients} users!` });
      setMessage('');
    } catch (err) {
      setResult({ type: 'error', text: 'Failed to send notification.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-black text-white">Global Notifications</h2>

      <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 space-y-5">
        <div>
          <label className="block text-sm font-bold text-gray-400 mb-2">Target Audience</label>
          <div className="flex gap-3">
            {[
              { id: 'all', label: 'All Users' },
              { id: 'active', label: 'Active Users (7d)' },
              { id: 'staff', label: 'Staff Only' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTarget(t.id)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  target === t.id
                    ? 'bg-india-saffron text-white shadow-lg shadow-orange-900/30'
                    : 'bg-gray-700 text-gray-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-400 mb-2">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your notification message here..."
            rows={4}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-india-saffron outline-none resize-none placeholder-gray-600"
          />
        </div>

        {result && (
          <div className={`p-4 rounded-xl text-sm font-medium ${
            result.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {result.text}
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={sending || !message.trim()}
          className="w-full flex items-center justify-center gap-2 bg-india-saffron text-white font-bold py-3 rounded-xl hover:bg-orange-500 transition-colors disabled:opacity-50 shadow-lg shadow-orange-900/20"
        >
          <Send className="w-5 h-5" />
          {sending ? 'Sending...' : 'Broadcast Notification'}
        </button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   LOADING STATE
═══════════════════════════════════════════════════════════════ */
const LoadingState = () => (
  <div className="flex items-center justify-center py-20">
    <div className="text-center">
      <div className="relative w-12 h-12 mx-auto mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-gray-700" />
        <div className="absolute inset-0 rounded-full border-4 border-t-india-saffron animate-spin" />
      </div>
      <p className="text-gray-500 font-semibold text-sm">Loading data...</p>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   PENDING EXAMS TAB
═══════════════════════════════════════════════════════════════ */
const PendingExamsTab = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await getPendingExams();
      setExams(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExams(); }, []);

  const handleAction = async (examId, action) => {
    try {
      await reviewPendingExam(examId, action);
      fetchExams();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white">Pending Exams Review</h2>
        <p className="text-gray-400 text-sm mt-1">Review user-submitted exams before publishing to the directory.</p>
      </div>

      {exams.length === 0 ? (
        <div className="bg-gray-800 rounded-2xl p-10 border border-gray-700 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">All Caught Up!</h3>
          <p className="text-gray-400">There are no pending exams requiring your approval.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {exams.map((exam) => (
            <div key={exam.id} className="bg-gray-800 rounded-2xl p-5 border border-gray-700 flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {exam.category_name || 'General'}
                  </span>
                  <span className="text-gray-500 text-sm">Submitted by User</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{exam.name}</h3>
                <p className="text-sm font-medium text-gray-400 mb-4">{exam.conducting_body}</p>
                
                <div className="space-y-2 text-sm text-gray-300">
                  <p><strong>Eligibility:</strong> {exam.eligibility}</p>
                  <p><strong>Syllabus:</strong> {exam.syllabus}</p>
                </div>
              </div>
              
              <div className="flex flex-row md:flex-col gap-3 justify-center border-t md:border-t-0 md:border-l border-gray-700 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                <button
                  onClick={() => handleAction(exam.id, 'approve')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-600/30 rounded-xl font-bold transition-all"
                >
                  <CheckCircle className="w-4 h-4" /> Approve
                </button>
                <button
                  onClick={() => handleAction(exam.id, 'reject')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white border border-red-600/30 rounded-xl font-bold transition-all"
                >
                  <Ban className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN ADMIN PANEL PAGE
═══════════════════════════════════════════════════════════════ */
const AdminPanel = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    // Only staff users can access
    if (user && !user.is_staff) {
      navigate('/');
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      getAdminAnalytics()
        .then(res => setAnalytics(res.data))
        .catch(err => console.error('Analytics error:', err));
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="ml-64 pt-20 p-8">
        {activeTab === 'dashboard' && <DashboardTab analytics={analytics} />}
        {activeTab === 'content' && <ContentTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'moderation' && <ModerationTab />}
        {activeTab === 'exams' && <PendingExamsTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
      </main>
    </div>
  );
};

export default AdminPanel;
