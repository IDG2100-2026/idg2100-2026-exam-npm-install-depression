import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../src/api/apiClient';

const EMPTY_FORM = {
  title: '',
  description: '',
  startDate: '',
  rounds: 3,
  eloMin: 0,
  eloMax: 9999,
  buyIn: 0,
  maxParticipants: 16,
  trophyTitle: ''
};

export default function AdminTournamentsPage() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const isEdit = !!editId;
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // If editing, pre-fill form with existing tournament data
  useEffect(() => {
    if (!editId) return;
    async function load() {
      try {
        const res = await apiFetch(`/tournaments/${editId}`);
        const data = await res.json();
        const t = data.tournament || data;
        setForm({
          title: t.title || '',
          description: t.description || '',
          startDate: t.startDate ? t.startDate.slice(0, 16) : '',
          rounds: t.format?.rounds ?? 3,
          eloMin: t.rules?.eloMin ?? 0,
          eloMax: t.rules?.eloMax ?? 9999,
          buyIn: t.rules?.buyIn ?? 0,
          maxParticipants: t.rules?.maxParticipants ?? 16,
          trophyTitle: t.trophy?.title || ''
        });
      } catch {
        setError('Failed to load tournament');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [editId]);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const body = {
      title: form.title,
      description: form.description,
      startDate: form.startDate,
      format: { rounds: Number(form.rounds) },
      rules: {
        eloMin: Number(form.eloMin),
        eloMax: Number(form.eloMax),
        buyIn: Number(form.buyIn),
        maxParticipants: Number(form.maxParticipants)
      },
      trophy: { title: form.trophyTitle }
    };

    try {
      let res;
      if (isEdit) {
        res = await apiFetch(`/tournaments/${editId}`, {
          method: 'PATCH',
          body: JSON.stringify(body)
        });
      } else {
        res = await apiFetch('/tournaments', {
          method: 'POST',
          body: JSON.stringify(body)
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      const id = data.tournament?._id || data._id || editId;
      navigate(`/tournaments/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to save tournament');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <main>
      <h1>{isEdit ? 'Edit tournament' : 'Create tournament'}</h1>
      <p><Link to="/admin">← Back to dashboard</Link></p>

      <form onSubmit={handleSubmit} style={{ maxWidth: 560 }}>

        <section>
          <h2>Basic info</h2>
          <div className="form-group">
            <label>Title</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea rows={3} value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Describe the tournament..." />
          </div>
          <div className="form-group">
            <label>Start date and time</label>
            <input type="datetime-local" value={form.startDate}
              onChange={e => set('startDate', e.target.value)} required />
          </div>
        </section>

        <section>
          <h2>Format</h2>
          <div className="form-group">
            <label>Number of rounds</label>
            <select value={form.rounds} onChange={e => set('rounds', e.target.value)}>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={5}>5</option>
            </select>
          </div>
          <div className="form-group">
            <label>Max participants</label>
            <select value={form.maxParticipants} onChange={e => set('maxParticipants', e.target.value)}>
              {[4, 8, 16, 32].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </section>

        <section>
          <h2>Rules</h2>
          <div className="form-group">
            <label>Buy-in (points)</label>
            <select value={form.buyIn} onChange={e => set('buyIn', e.target.value)}>
              <option value={0}>Free (0)</option>
              <option value={1}>1 point</option>
              <option value={10}>10 points</option>
              <option value={50}>50 points</option>
            </select>
          </div>
          <div className="form-group">
            <label>Min ELO <span className="text-muted">(0 = no minimum)</span></label>
            <input type="number" min={0} value={form.eloMin}
              onChange={e => set('eloMin', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Max ELO <span className="text-muted">(9999 = no maximum)</span></label>
            <input type="number" min={0} value={form.eloMax}
              onChange={e => set('eloMax', e.target.value)} />
          </div>
        </section>

        <section>
          <h2>Trophy</h2>
          <div className="form-group">
            <label>Trophy name</label>
            <input value={form.trophyTitle} onChange={e => set('trophyTitle', e.target.value)}
              placeholder="e.g. Summer Cup 2026 Trophy" />
          </div>
        </section>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create tournament'}
        </button>
      </form>
    </main>
  );
}
