import React, { useEffect, useState } from 'react';
import { Rss, Plus, Pencil, Trash2, RefreshCcw, Search } from 'lucide-react';
import dataService from '../utils/dataService';

const emptyForm = { name: '', url: '' };

const RssFeedsCard = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingName, setEditingName] = useState('');
  const [saving, setSaving] = useState(false);

  const loadBlogs = async () => {
    setError('');
    try {
      const data = await dataService.fetchRssBlogs();
      setBlogs(data.blogs || []);
    } catch (err) {
      setError('載入 RSS 清單失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingName('');
  };

  const saveBlog = async () => {
    if (!form.name.trim() || !form.url.trim()) return;
    setSaving(true);
    setError('');
    try {
      if (editingName) {
        await dataService.updateRssBlog(editingName, {
          name: form.name.trim(),
          url: form.url.trim(),
        });
      } else {
        await dataService.createRssBlog({
          name: form.name.trim(),
          url: form.url.trim(),
        });
      }
      await loadBlogs();
      resetForm();
    } catch (err) {
      setError('儲存 RSS 失敗，可能名稱重複或網址格式錯誤');
    } finally {
      setSaving(false);
    }
  };

  const editBlog = (blog) => {
    setEditingName(blog.name);
    setForm({ name: blog.name, url: blog.url });
  };

  const removeBlog = async (name) => {
    if (!window.confirm(`確定要移除「${name}」嗎？`)) return;
    try {
      await dataService.deleteRssBlog(name);
      await loadBlogs();
      if (editingName === name) resetForm();
    } catch (err) {
      setError('移除 RSS 失敗');
    }
  };

  const scanNow = async () => {
    try {
      setError('');
      await dataService.scanRssNow();
      await loadBlogs();
    } catch (err) {
      setError('立即掃描失敗');
    }
  };

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Rss className="text-orange-400" size={20} />
          <h2 className="text-xl font-semibold">RSS 追蹤清單</h2>
          <span className="text-xs text-slate-400">({blogs.length} feeds)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadBlogs}
            className="px-3 py-2 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-700 text-sm flex items-center gap-1"
          >
            <RefreshCcw size={14} />
            Refresh
          </button>
          <button
            type="button"
            onClick={scanNow}
            className="px-3 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm flex items-center gap-1"
          >
            <Search size={14} />
            立即掃描
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg p-2">{error}</p>}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 bg-slate-900/70 border border-slate-700 rounded-xl p-4">
          {loading ? (
            <p className="text-sm text-slate-400">載入中...</p>
          ) : blogs.length === 0 ? (
            <p className="text-sm text-slate-400">目前沒有追蹤 RSS。</p>
          ) : (
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {blogs.map((blog) => (
                <div key={blog.name} className="rounded-lg border border-slate-700 p-3 bg-slate-950/50">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-100">{blog.name}</p>
                      <p className="text-xs text-cyan-300 break-all">{blog.url}</p>
                      <p className="text-[11px] text-slate-500 mt-1">Last scanned: {blog.lastScanned || 'N/A'}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="p-2 rounded hover:bg-slate-700" onClick={() => editBlog(blog)}>
                        <Pencil size={14} />
                      </button>
                      <button className="p-2 rounded hover:bg-rose-500/20" onClick={() => removeBlog(blog.name)}>
                        <Trash2 size={14} className="text-rose-300" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-4 space-y-3">
          <h3 className="font-medium">{editingName ? '編輯 RSS' : '新增 RSS'}</h3>
          <label className="text-xs text-slate-400 block">
            名稱
            <input
              className="mt-1 w-full bg-slate-800 border border-slate-600 rounded px-2 py-2 text-sm"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </label>
          <label className="text-xs text-slate-400 block">
            URL
            <input
              className="mt-1 w-full bg-slate-800 border border-slate-600 rounded px-2 py-2 text-sm"
              value={form.url}
              onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))}
            />
          </label>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={saveBlog}
              disabled={saving || !form.name.trim() || !form.url.trim()}
              className="flex-1 px-3 py-2 rounded bg-orange-600 hover:bg-orange-500 disabled:bg-slate-700 disabled:text-slate-500 flex items-center justify-center gap-1"
            >
              <Plus size={14} />
              {saving ? '儲存中…' : editingName ? '更新 RSS' : '新增 RSS'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-3 py-2 rounded border border-slate-600 hover:bg-slate-700"
            >
              清除
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RssFeedsCard;
