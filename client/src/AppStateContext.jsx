import React, { createContext, useContext, useRef, useCallback, useEffect, useState } from 'react';

const AppStateContext = createContext(null);

function generateSessionId() {
  return 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
}

export function AppStateProvider({ children, token }) {
  const [sessionId] = useState(() => {
    const existing = sessionStorage.getItem('ipb20_session_id');
    if (existing) return existing;
    const id = generateSessionId();
    sessionStorage.setItem('ipb20_session_id', id);
    return id;
  });

  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem('ipb20_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.notes || [];
      }
      return JSON.parse(localStorage.getItem('notes')) || [];
    } catch { return []; }
  });

  const [view, setView] = useState(() => {
    try {
      const saved = localStorage.getItem('ipb20_state');
      if (saved) return JSON.parse(saved).view || 'Active';
    } catch {}
    return 'Active';
  });

  const [cat, setCat] = useState(() => {
    try {
      const saved = localStorage.getItem('ipb20_state');
      if (saved) return JSON.parse(saved).cat || 'All';
    } catch {}
    return 'All';
  });

  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [recs, setRecs] = useState([]);
  const [authMode, setAuthMode] = useState('login');
  const EMPTY_AUTH = { name: '', email: '', username: '', password: '', confirmPassword: '', phone: '', city: '', country: '' };
  const [af, setAf] = useState(EMPTY_AUTH);
  const [nf, setNf] = useState(() => {
    try {
      const saved = localStorage.getItem('ipb20_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.nf || { title: '', content: '', category: 'General', isPinned: false };
      }
    } catch {}
    return { title: '', content: '', category: 'General', isPinned: false };
  });

  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sync, setSync] = useState('');
  const [err, setErr] = useState(null);
  const [composer, setComposer] = useState(() => {
    try {
      const saved = localStorage.getItem('ipb20_state');
      if (saved) return JSON.parse(saved).composer || false;
    } catch {}
    return false;
  });

  const [scrollY, setScrollY] = useState(0);
  const [showCrashModal, setShowCrashModal] = useState(false);
  const [crashData, setCrashData] = useState(null);
  const [showVersionPanel, setShowVersionPanel] = useState(false);
  const [versions, setVersions] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [snapshotSaving, setSnapshotSaving] = useState(false);

  const mainRef = useRef(null);
  const autoSaveTimerRef = useRef(null);
  const API = import.meta.env.VITE_API_BASE_URL || 'https://ip-oops-js-backend.onrender.com' || 'http://localhost:5000';

  const req = useCallback(async (ep, opts = {}) => {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`${API}${ep}`, {
        ...opts,
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
          ...opts.headers
        }
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Failed');
      return d;
    } catch (e) {
      setErr(e.message?.includes('fetch') ? `Cannot reach ${API}` : e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token, API]);

  const reqSilent = useCallback(async (ep, opts = {}) => {
    try {
      const r = await fetch(`${API}${ep}`, {
        ...opts,
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
          ...opts.headers
        }
      });
      const d = await r.json();
      if (!r.ok) return null;
      return d;
    } catch {
      return null;
    }
  }, [token, API]);

  const getStateSnapshot = useCallback(() => {
    return {
      notes,
      view,
      cat,
      composer,
      nf,
      scrollY,
      timestamp: Date.now()
    };
  }, [notes, view, cat, composer, nf, scrollY]);

  const saveToLocalStorage = useCallback((state) => {
    try {
      localStorage.setItem('ipb20_state', JSON.stringify(state));
    } catch {}
  }, []);

  const saveSnapshotToBackend = useCallback(async (state, label = 'Auto-save') => {
    if (!token) return;
    setSnapshotSaving(true);
    const result = await reqSilent('/state/snapshot', {
      method: 'POST',
      body: JSON.stringify({ state, sessionId, label })
    });
    if (result?.version) {
      setCurrentVersion(result.version);
    }
    setSnapshotSaving(false);
    return result;
  }, [token, sessionId, reqSilent]);

  const performAutoSave = useCallback(() => {
    const state = getStateSnapshot();
    saveToLocalStorage(state);
    if (token) {
      setSync('saving');
      saveSnapshotToBackend(state).then(() => {
        setSync('saved');
        setTimeout(() => setSync(''), 2500);
      });
    }
  }, [getStateSnapshot, saveToLocalStorage, saveSnapshotToBackend, token]);

  useEffect(() => {
    if (!token) return;
    autoSaveTimerRef.current = setInterval(performAutoSave, 5000);
    return () => clearInterval(autoSaveTimerRef.current);
  }, [token, performAutoSave]);

  useEffect(() => {
    if (!token) return;
    const checkCrash = async () => {
      const result = await reqSilent(`/state/crash-check/${sessionId}`);
      if (result?.crashed && result.data) {
        setCrashData(result.data);
        setShowCrashModal(true);
      }
    };
    checkCrash();
  }, [token, sessionId, reqSilent]);

  const restoreCrashedSession = useCallback(() => {
    if (!crashData?.snapshot) return;
    const snap = crashData.snapshot;
    if (snap.notes) setNotes(snap.notes);
    if (snap.view) setView(snap.view);
    if (snap.cat) setCat(snap.cat);
    if (snap.composer !== undefined) setComposer(snap.composer);
    if (snap.nf) setNf(snap.nf);
    if (snap.scrollY && mainRef.current) {
      setTimeout(() => {
        mainRef.current.scrollTop = snap.scrollY;
      }, 100);
    }
    setShowCrashModal(false);
    setCrashData(null);
  }, [crashData]);

  const discardCrashedSession = useCallback(async () => {
    if (crashData?.sessionId) {
      await reqSilent('/state/clean-exit', {
        method: 'POST',
        body: JSON.stringify({ sessionId: crashData.sessionId })
      });
    }
    setShowCrashModal(false);
    setCrashData(null);
  }, [crashData, reqSilent]);

  const loadVersionHistory = useCallback(async () => {
    const result = await req('/state/versions');
    if (result?.versions) {
      setVersions(result.versions);
    }
  }, [req]);

  const restoreVersion = useCallback(async (version) => {
    const result = await req('/state/restore', {
      method: 'POST',
      body: JSON.stringify({ version })
    });
    if (result?.state) {
      const snap = result.state;
      if (snap.notes) setNotes(snap.notes);
      if (snap.view) setView(snap.view);
      if (snap.cat) setCat(snap.cat);
      if (snap.composer !== undefined) setComposer(snap.composer);
      if (snap.nf) setNf(snap.nf);
      setCurrentVersion(version);
      saveToLocalStorage(snap);
      if (snap.scrollY && mainRef.current) {
        setTimeout(() => {
          mainRef.current.scrollTop = snap.scrollY;
        }, 100);
      }
      setShowVersionPanel(false);
    }
  }, [req, saveToLocalStorage]);

  useEffect(() => {
    if (!token) return;
    const handleBeforeUnload = () => {
      const state = getStateSnapshot();
      saveToLocalStorage(state);
      const payload = JSON.stringify({ sessionId });
      navigator.sendBeacon(
        `${API}/state/clean-exit`,
        new Blob([payload], { type: 'application/json' })
      );
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [token, sessionId, getStateSnapshot, saveToLocalStorage, API]);

  const handleScroll = useCallback((e) => {
    setScrollY(e.target.scrollTop);
  }, []);

  useEffect(() => {
    if (!token) return;
    const el = mainRef.current;
    if (!el) return;
    let timeout;
    const debouncedScroll = (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => handleScroll(e), 200);
    };
    el.addEventListener('scroll', debouncedScroll);
    return () => {
      el.removeEventListener('scroll', debouncedScroll);
      clearTimeout(timeout);
    };
  }, [token, handleScroll]);

  useEffect(() => {
    if (!token) return;
    try {
      const saved = localStorage.getItem('ipb20_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.scrollY && mainRef.current) {
          setTimeout(() => {
            mainRef.current.scrollTop = parsed.scrollY;
          }, 300);
        }
      }
    } catch {}
  }, [token]);

  const value = {
    notes, setNotes,
    view, setView,
    cat, setCat,
    q, setQ,
    results, setResults,
    recs, setRecs,
    authMode, setAuthMode,
    af, setAf, EMPTY_AUTH,
    nf, setNf,
    editing, setEditing,
    loading, setLoading,
    sync, setSync,
    err, setErr,
    composer, setComposer,
    scrollY,
    sessionId,
    showCrashModal, setShowCrashModal,
    crashData,
    showVersionPanel, setShowVersionPanel,
    versions,
    currentVersion,
    snapshotSaving,
    mainRef,
    req,
    reqSilent,
    restoreCrashedSession,
    discardCrashedSession,
    loadVersionHistory,
    restoreVersion,
    performAutoSave,
    saveToLocalStorage,
    getStateSnapshot
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}

export default AppStateContext;
