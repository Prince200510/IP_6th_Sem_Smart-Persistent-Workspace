import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import {
  Pin, Archive as ArchiveIcon, Trash2, Pencil, RotateCcw, Search,
  LogOut, Loader2, CheckCircle2, Folder, Plus, X,
  FileText, Sparkles, User, Mail, Smartphone, MapPin,
  AtSign, Lock, Shield, StickyNote, History, Save, Clock
} from 'lucide-react';
import { AppStateProvider, useAppState } from './AppStateContext';
import CrashRecoveryModal from './CrashRecoveryModal';
import VersionHistoryPanel from './VersionHistoryPanel';

const API = import.meta.env.VITE_API_BASE_URL || 'https://ip-oops-js-backend.onrender.com' || 'http://localhost:5000';
const CATS = ['General', 'Work', 'Personal', 'Ideas', 'Todo'];
const CAT_DOT = { General: 'bg-sky-500', Work: 'bg-violet-500', Personal: 'bg-rose-500', Ideas: 'bg-amber-500', Todo: 'bg-emerald-500' };

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    if (token) localStorage.setItem('token', token);
    else { localStorage.removeItem('token'); localStorage.removeItem('notes'); localStorage.removeItem('ipb20_state'); }
  }, [token]);

  if (!token) return <AuthScreen onAuth={setToken} />;

  return (
    <AppStateProvider token={token}>
      <Dashboard token={token} onLogout={() => setToken(null)} />
    </AppStateProvider>
  );
}

function AuthScreen({ onAuth }) {
  const [authMode, setAuthMode] = useState('login');
  const EMPTY_AUTH = { name: '', email: '', username: '', password: '', confirmPassword: '', phone: '', city: '', country: '' };
  const [af, setAf] = useState(EMPTY_AUTH);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const handleAuth = async (type) => {
    if (type === 'register' && af.password !== af.confirmPassword) { setErr('Passwords do not match'); return; }
    setLoading(true); setErr(null);
    try {
      const body = type === 'register' ? af : { username: af.username, password: af.password };
      const r = await fetch(`${API}/auth/${type}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Failed');
      if (d?.token) { onAuth(d.token); setAf(EMPTY_AUTH); }
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="h-full w-full flex bg-white">
      <div className="hidden lg:flex w-1/2 bg-slate-900 flex-col items-center justify-center text-center p-16 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/[0.06] blur-[120px]" />
        <div className="relative z-10 flex flex-col items-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mb-8 shadow-lg shadow-indigo-500/20">
            <Sparkles size={24} className="text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            Your workspace<br />for everything.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-xs">
            Capture ideas, organize projects, and find anything instantly — all synced across your devices.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Real-time sync', 'Smart search', 'Auto-save', 'Crash recovery'].map(f => (
              <span key={f} className="text-[10px] font-medium text-slate-500 border border-slate-700 rounded-full px-3 py-1 uppercase tracking-widest">{f}</span>
            ))}
          </div>
        </div>
        <p className="absolute bottom-8 text-slate-700 text-xs">© 2026 IP-B20 Workspace</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-slate-900 font-bold text-xl tracking-tight">IP-B20</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-1 tracking-tight">
              {authMode === 'register' ? 'Create your account' : 'Sign in to IP-B20'}
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              {authMode === 'register' ? 'Fill in your details to get started.' : 'Enter your credentials below.'}
            </p>

            {err && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2.5 rounded-lg mb-5 flex items-center gap-2">
                <X size={14} className="shrink-0" /> {err}
              </div>
            )}

            <div className="space-y-3">
              {authMode === 'register' && (
                <>
                  <FormInput icon={User} placeholder="Full Name" value={af.name} onChange={v => setAf({ ...af, name: v })} />
                  <FormInput icon={Mail} type="email" placeholder="Email address" value={af.email} onChange={v => setAf({ ...af, email: v })} />
                </>
              )}
              <FormInput icon={AtSign} placeholder="Username" value={af.username} onChange={v => setAf({ ...af, username: v })} />
              {authMode === 'register' && (
                <>
                  <FormInput icon={Smartphone} placeholder="Phone number" value={af.phone} onChange={v => setAf({ ...af, phone: v })} />
                  <div className="grid grid-cols-2 gap-3">
                    <FormInput icon={MapPin} placeholder="City" value={af.city} onChange={v => setAf({ ...af, city: v })} />
                    <FormInput icon={MapPin} placeholder="Country" value={af.country} onChange={v => setAf({ ...af, country: v })} />
                  </div>
                </>
              )}
              <FormInput icon={Lock} type="password" placeholder="Password" value={af.password} onChange={v => setAf({ ...af, password: v })} />
              {authMode === 'register' && (
                <FormInput icon={Shield} type="password" placeholder="Confirm password" value={af.confirmPassword} onChange={v => setAf({ ...af, confirmPassword: v })} />
              )}
            </div>

            <button
              onClick={() => handleAuth(authMode)}
              disabled={loading}
              className="w-full mt-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Processing</> : authMode === 'register' ? 'Create Account' : 'Sign In'}
            </button>
          </div>

          <p className="text-center mt-5 text-sm text-slate-500">
            {authMode === 'register' ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => { setAuthMode(authMode === 'register' ? 'login' : 'register'); setErr(null); }} className="text-indigo-600 font-semibold hover:underline">
              {authMode === 'register' ? 'Sign in' : 'Create one'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ token, onLogout }) {
  const {
    notes, setNotes,
    view, setView,
    cat, setCat,
    q, setQ,
    results, setResults,
    recs, setRecs,
    nf, setNf,
    editing, setEditing,
    loading,
    sync,
    err,
    composer, setComposer,
    sessionId,
    showCrashModal,
    crashData,
    showVersionPanel, setShowVersionPanel,
    versions,
    currentVersion,
    snapshotSaving,
    mainRef,
    req,
    restoreCrashedSession,
    discardCrashedSession,
    loadVersionHistory,
    restoreVersion,
    performAutoSave,
    getStateSnapshot,
    saveToLocalStorage
  } = useAppState();

  useEffect(() => {
    load();
    loadRecsData();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { if (q.trim()) doSearch(q); else setResults([]); }, 400);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
    if (notes.length > 0) {
      const t = setTimeout(() => { save(notes); loadRecsData(); }, 1000);
      return () => clearTimeout(t);
    }
  }, [notes]);

  const load = async () => { const d = await req('/state/load'); if (d?.notes) setNotes(d.notes); };
  const save = async n => { await req('/state/save', { method: 'POST', body: JSON.stringify({ notes: n }) }); };
  const loadRecsData = async () => { const d = await req('/notes/recommend'); if (d?.recommendations) setRecs(d.recommendations); };
  const doSearch = async query => { const d = await req(`/notes/search?q=${encodeURIComponent(query)}`); if (d?.results) setResults(d.results); };

  const saveNote = () => {
    if (!nf.title.trim() || !nf.content.trim()) return;
    setNotes(p => {
      const c = [...p];
      if (editing !== null) c[editing] = { ...c[editing], ...nf };
      else c.push({ ...nf, usageCount: 0, isArchived: false });
      return c.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
    });
    setNf({ title: '', content: '', category: 'General', isPinned: false }); setEditing(null); setComposer(false);
  };

  const editN = i => { const n = notes[i]; setNf({ title: n.title, content: n.content, category: n.category || 'General', isPinned: !!n.isPinned }); setEditing(i); setComposer(true); };
  const pinN = i => setNotes(p => { const c = [...p]; c[i] = { ...c[i], isPinned: !c[i].isPinned }; return c.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)); });
  const archN = i => setNotes(p => { const c = [...p]; c[i] = { ...c[i], isArchived: true, isPinned: false }; return c; });
  const restN = i => setNotes(p => { const c = [...p]; c[i] = { ...c[i], isArchived: false }; return c; });
  const delN = i => setNotes(p => p.filter((_, j) => j !== i));
  const trackN = i => setNotes(p => { const c = [...p]; c[i] = { ...c[i], usageCount: (c[i].usageCount || 0) + 1 }; return c; });

  const handleLogout = async () => {
    const state = getStateSnapshot();
    saveToLocalStorage(state);
    try {
      await fetch(`${API}/state/clean-exit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sessionId })
      });
    } catch {}
    sessionStorage.removeItem('ipb20_session_id');
    onLogout();
  };

  const openVersionHistory = async () => {
    setShowVersionPanel(true);
    await loadVersionHistory();
  };

  const handleManualSave = () => {
    performAutoSave();
  };

  const filtered = notes.filter(n => {
    if (view === 'Archive') return n.isArchived;
    if (n.isArchived) return false;
    return cat === 'All' || n.category === cat;
  });

  return (
    <div className="h-full w-full flex bg-slate-50 text-slate-800">
      <aside className="w-56 shrink-0 bg-white border-r border-slate-200 flex flex-col">
        <div className="h-14 flex items-center gap-2 px-5 border-b border-slate-100">
          <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
            <Sparkles size={12} className="text-white" />
          </div>
          <span className="font-semibold text-sm text-slate-900 tracking-tight">IP-B20</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.12em] mb-1.5 px-2">Views</p>
            <SideBtn active={view === 'Active'} onClick={() => setView('Active')} icon={StickyNote} label="Notes" count={notes.filter(n => !n.isArchived).length} />
            <SideBtn active={view === 'Archive'} onClick={() => setView('Archive')} icon={ArchiveIcon} label="Archive" count={notes.filter(n => n.isArchived).length} />
          </div>

          {view === 'Active' && (
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.12em] mb-1.5 px-2">Categories</p>
              <CatBtn active={cat === 'All'} onClick={() => setCat('All')} label="All" />
              {CATS.map(c => <CatBtn key={c} active={cat === c} onClick={() => setCat(c)} label={c} dot={CAT_DOT[c]} />)}
            </div>
          )}

          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.12em] mb-1.5 px-2">Search</p>
            <div className="relative px-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
              <input type="text" value={q} onChange={e => setQ(e.target.value)} placeholder="Find..." className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/20 placeholder-slate-400 transition-all" />
            </div>
            {q && results.length > 0 && (
              <div className="mt-1.5 px-1 space-y-0.5">
                {results.map((r, i) => <div key={i} className="px-2 py-1.5 text-xs text-slate-600 truncate rounded-md hover:bg-slate-100 cursor-pointer transition-colors">{r.title}</div>)}
              </div>
            )}
          </div>

          {!q && recs.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.12em] mb-1.5 px-2">Frequent</p>
              <div className="px-1 space-y-0.5">
                {recs.map((r, i) => <div key={i} className="px-2 py-1.5 text-xs text-slate-600 truncate rounded-md hover:bg-slate-100 cursor-pointer transition-colors">{r.title} <span className="text-slate-400">·{r.usageCount}</span></div>)}
              </div>
            </div>
          )}

          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.12em] mb-1.5 px-2">Session</p>
            <SideBtn active={false} onClick={openVersionHistory} icon={History} label="Version History" />
            <SideBtn active={false} onClick={handleManualSave} icon={Save} label="Save Now" />
          </div>
        </nav>

        <div className="p-3 border-t border-slate-100 space-y-1">
          {currentVersion && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] text-slate-400">
              <Clock size={10} />
              <span>Snapshot v{currentVersion}</span>
            </div>
          )}
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 shrink-0 flex items-center justify-between px-7 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-slate-900">{view === 'Active' ? 'Notes' : 'Archive'}</h1>
            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">{filtered.length}</span>
          </div>
          <div className="flex items-center gap-3">
            {snapshotSaving && (
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Loader2 size={12} className="animate-spin" /> Snapshotting
              </span>
            )}
            {sync === 'saved' && <span className="text-[11px] text-emerald-600 flex items-center gap-1"><CheckCircle2 size={12} /> Synced</span>}
            {sync === 'saving' && <span className="text-[11px] text-slate-400 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Saving</span>}
            <button
              onClick={openVersionHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors"
            >
              <History size={14} /> History
            </button>
            {view === 'Active' && (
              <button onClick={() => { setComposer(!composer); if (composer) { setEditing(null); setNf({ title: '', content: '', category: 'General', isPinned: false }); } }} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors">
                {composer ? <X size={14} /> : <Plus size={14} />} {composer ? 'Close' : 'New Note'}
              </button>
            )}
          </div>
        </header>

        <div ref={mainRef} className="flex-1 overflow-y-auto p-7 bg-slate-50">
          <div className="max-w-5xl mx-auto">
            {composer && view === 'Active' && (
              <div className="mb-8 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-5 py-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${CAT_DOT[nf.category]}`} />
                    <select value={nf.category} onChange={e => setNf({ ...nf, category: e.target.value })} className="bg-transparent text-xs text-slate-500 font-medium outline-none cursor-pointer">
                      {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <button onClick={() => setNf({ ...nf, isPinned: !nf.isPinned })} className={`p-1.5 rounded-md transition-colors ${nf.isPinned ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
                    <Pin size={14} fill={nf.isPinned ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <div className="p-5">
                  <input value={nf.title} onChange={e => setNf({ ...nf, title: e.target.value })} placeholder="Title" className="w-full bg-transparent text-lg font-bold text-slate-900 outline-none placeholder-slate-300 mb-2" />
                  <textarea value={nf.content} onChange={e => setNf({ ...nf, content: e.target.value })} placeholder="Start writing..." className="w-full bg-transparent text-sm text-slate-600 outline-none placeholder-slate-300 resize-none min-h-[80px] leading-relaxed" />
                </div>
                <div className="flex justify-end gap-2 px-5 py-2.5 border-t border-slate-100 bg-slate-50">
                  {editing !== null && <button onClick={() => { setEditing(null); setNf({ title: '', content: '', category: 'General', isPinned: false }); setComposer(false); }} className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-200 rounded-md transition-colors">Cancel</button>}
                  <button onClick={saveNote} className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md transition-colors">{editing !== null ? 'Update' : 'Save'}</button>
                </div>
              </div>
            )}

            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((note, idx) => {
                  const ai = notes.indexOf(note);
                  const pinned = note.isPinned;
                  return (
                    <div key={note._id || idx} onClick={() => trackN(ai)} className={`group bg-white border rounded-xl flex flex-col overflow-hidden cursor-default transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${pinned ? 'border-indigo-200 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>
                      <div className={`h-0.5 ${CAT_DOT[note.category] || CAT_DOT.General}`} />
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex items-start gap-2 mb-2">
                          {pinned && <Pin size={12} className="text-indigo-500 mt-1 shrink-0" fill="currentColor" />}
                          <h3 className="text-sm font-semibold text-slate-900 leading-snug break-words">{note.title}</h3>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap flex-1 line-clamp-4 mb-3">{note.content}</p>
                        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 mt-auto">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${CAT_DOT[note.category] || CAT_DOT.General}`} />
                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{note.category || 'General'}</span>
                          </div>
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {view === 'Active' ? (
                              <>
                                <IconBtn onClick={e => { e.stopPropagation(); pinN(ai); }} tip="Pin" active={pinned}><Pin size={12} fill={pinned ? 'currentColor' : 'none'} /></IconBtn>
                                <IconBtn onClick={e => { e.stopPropagation(); editN(ai); }} tip="Edit"><Pencil size={12} /></IconBtn>
                                <IconBtn onClick={e => { e.stopPropagation(); archN(ai); }} tip="Archive" hc="hover:text-amber-600"><ArchiveIcon size={12} /></IconBtn>
                              </>
                            ) : (
                              <>
                                <IconBtn onClick={e => { e.stopPropagation(); restN(ai); }} tip="Restore" hc="hover:text-emerald-600"><RotateCcw size={12} /></IconBtn>
                                <IconBtn onClick={e => { e.stopPropagation(); delN(ai); }} tip="Delete" hc="hover:text-red-600"><Trash2 size={12} /></IconBtn>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-28 text-slate-400">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <FileText size={28} className="opacity-30" />
                </div>
                <p className="text-sm font-medium text-slate-500 mb-0.5">No documents</p>
                <p className="text-xs">Click "New Note" to create one.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {showCrashModal && crashData && (
        <CrashRecoveryModal
          crashData={crashData}
          onRestore={restoreCrashedSession}
          onDiscard={discardCrashedSession}
        />
      )}

      {showVersionPanel && (
        <VersionHistoryPanel
          versions={versions}
          currentVersion={currentVersion}
          onRestore={restoreVersion}
          onClose={() => setShowVersionPanel(false)}
          loading={loading}
        />
      )}
    </div>
  );
}

function FormInput({ icon: I, placeholder, value, onChange, type = 'text' }) {
  return (
    <div className="relative group">
      <I size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
      <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg pl-9 pr-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder-slate-400" />
    </div>
  );
}

function SideBtn({ active, onClick, icon: I, label, count }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${active ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
      <span className="flex items-center gap-2"><I size={14} /> {label}</span>
      {count > 0 && <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full">{count}</span>}
    </button>
  );
}

function CatBtn({ active, onClick, label, dot }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs transition-colors ${active ? 'bg-slate-100 text-slate-800 font-medium' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot || 'bg-slate-300'}`} /> {label}
    </button>
  );
}

function IconBtn({ onClick, tip, children, active, hc = '' }) {
  return (
    <button onClick={onClick} title={tip} className={`p-1 rounded-md transition-colors ${active ? 'text-indigo-600' : `text-slate-400 ${hc || 'hover:text-indigo-600'} hover:bg-slate-100`}`}>
      {children}
    </button>
  );
}
