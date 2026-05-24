'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const AI_TOOLS = ['Harvey', 'Legora', 'ChatGPT', 'Co-Pilot', 'CoCounsel', 'Other']

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [matters, setMatters] = useState<any[]>([])
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ title: '', client_ref: '', ai_tool: '' })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
      else {
        setUser(data.user)
        loadMatters(data.user.id)
      }
    })
  }, [])

  async function loadMatters(userId: string) {
    const supabase = createClient()
    const { data } = await supabase
      .from('matters')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
    setMatters(data || [])
  }

  async function createMatter() {
    if (!form.title || !user) return
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.from('matters').insert({
      title: form.title,
      client_ref: form.client_ref,
      ai_tool: form.ai_tool,
      created_by: user.id,
      status: 'active'
    }).select().single()
    if (!error && data) {
      setMatters(prev => [data, ...prev])
      setForm({ title: '', client_ref: '', ai_tool: '' })
      setShowNew(false)
    }
    setLoading(false)
  }

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const input = {
    width: '100%', background: '#0f172a', border: '1px solid #1e293b',
    borderRadius: '8px', color: '#e2e8f0', padding: '11px 14px',
    fontSize: '13px', outline: 'none', marginBottom: '12px'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050509', fontFamily: "'DM Sans',sans-serif", color: '#e2e8f0' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap')`}</style>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #0f172a', padding: '0 40px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(5,5,9,0.95)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '24px', height: '24px', background: 'linear-gradient(135deg,#c9a84c,#7a5c20)', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>⚖</div>
          <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: '16px' }}>LexAudit</span>
          <span style={{ color: '#1e293b', margin: '0 4px' }}>|</span>
          <span style={{ color: '#475569', fontSize: '13px' }}>Dashboard</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ color: '#334155', fontSize: '12px' }}>{user?.email}</span>
          <button onClick={signOut} style={{ background: 'none', border: '1px solid #1e293b', color: '#64748b', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', fontSize: '12px' }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '26px', marginBottom: '4px' }}>Your Matters</h1>
            <p style={{ color: '#475569', fontSize: '13px' }}>{matters.length} active matter{matters.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setShowNew(true)}
            style={{ background: 'linear-gradient(135deg,#c9a84c,#a07830)', color: '#0a0a0f', border: 'none', borderRadius: '8px', padding: '12px 22px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
            + New Matter
          </button>
        </div>

        {/* New Matter Modal */}
        {showNew && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div style={{ background: '#0a0a0f', border: '1px solid #1e293b', borderRadius: '14px', padding: '36px', width: '100%', maxWidth: '480px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '20px' }}>New Matter</h2>
                <button onClick={() => setShowNew(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '20px' }}>✕</button>
              </div>
              <label style={{ color: '#64748b', fontSize: '11px', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>DOCUMENT TITLE *</label>
              <input style={input} placeholder="e.g. Share Purchase Agreement — Acme GmbH" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <label style={{ color: '#64748b', fontSize: '11px', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>CLIENT REFERENCE</label>
              <input style={input} placeholder="e.g. CLT-2026-0042" value={form.client_ref} onChange={e => setForm(f => ({ ...f, client_ref: e.target.value }))} />
              <label style={{ color: '#64748b', fontSize: '11px', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>AI TOOL USED</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                {AI_TOOLS.map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, ai_tool: t }))}
                    style={{ padding: '7px 14px', borderRadius: '100px', background: form.ai_tool === t ? '#c9a84c' : '#0f172a', color: form.ai_tool === t ? '#0a0a0f' : '#64748b', border: `1px solid ${form.ai_tool === t ? '#c9a84c' : '#1e293b'}`, cursor: 'pointer', fontSize: '13px' }}>
                    {t}
                  </button>
                ))}
              </div>
              <button onClick={createMatter} disabled={!form.title || loading}
                style={{ width: '100%', background: form.title ? 'linear-gradient(135deg,#c9a84c,#a07830)' : '#1e293b', color: form.title ? '#0a0a0f' : '#475569', border: 'none', borderRadius: '8px', padding: '14px', fontWeight: 700, fontSize: '14px', cursor: form.title ? 'pointer' : 'not-allowed' }}>
                {loading ? 'Creating...' : 'Create Matter →'}
              </button>
            </div>
          </div>
        )}

        {/* Matters List */}
        {matters.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#080810', border: '1px solid #1a1a2e', borderRadius: '14px' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>📁</div>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '20px', marginBottom: '8px' }}>No matters yet</h3>
            <p style={{ color: '#475569', fontSize: '14px', marginBottom: '24px' }}>Create your first matter to start logging AI usage.</p>
            <button onClick={() => setShowNew(true)}
              style={{ background: 'linear-gradient(135deg,#c9a84c,#a07830)', color: '#0a0a0f', border: 'none', borderRadius: '8px', padding: '12px 24px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
              + Create First Matter
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {matters.map(m => (
              <Link key={m.id} href={`/matter/${m.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#080810', border: '1px solid #1a1a2e', borderRadius: '12px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#f1f5f9', marginBottom: '4px' }}>{m.title}</div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#475569' }}>
                      {m.client_ref && <span>Ref: {m.client_ref}</span>}
                      {m.ai_tool && <span>Tool: {m.ai_tool}</span>}
                      <span>{new Date(m.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ background: m.status === 'attested' ? '#0a1a0a' : '#0f172a', color: m.status === 'attested' ? '#22c55e' : '#64748b', border: `1px solid ${m.status === 'attested' ? '#166534' : '#1e293b'}`, borderRadius: '100px', padding: '4px 12px', fontSize: '11px' }}>
                      {m.status === 'attested' ? '✓ Attested' : 'Pending'}
                    </span>
                    <span style={{ color: '#334155', fontSize: '18px' }}>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
