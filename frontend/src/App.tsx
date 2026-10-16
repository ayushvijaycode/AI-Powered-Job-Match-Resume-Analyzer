import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react'
import { Activity, ArrowRight, BriefcaseBusiness, Check, ChevronRight, CircleHelp, Clock3, FileText, Gauge, History, LoaderCircle, Plus, Sparkles, Target, Trash2, UploadCloud, X } from 'lucide-react'
import type { Analysis } from './types'

const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
const sampleJob = `Junior Python Developer Intern

We are looking for a student with Python, SQL, Git, REST API, and problem-solving skills.
Responsibilities include building backend services with FastAPI, working with PostgreSQL,
writing unit tests with pytest, and collaborating through GitHub. Familiarity with Docker,
Pandas, data structures and algorithms, and React is a plus. Applicants should demonstrate
a relevant academic project and clear communication.`

function prettyDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
function ScoreRing({ value }: { value: number }) {
  return <div className="score-ring" style={{ '--score': `${Math.min(100, Math.max(0, value))}%` } as React.CSSProperties}>
    <div className="ring-inner"><strong>{Math.round(value)}<small>%</small></strong><span>match score</span></div>
  </div>
}
function Metric({ title, value, detail, icon }: { title: string; value: number; detail: string; icon: React.ReactNode }) {
  return <div className="metric-card"><div className="metric-top"><span>{title}</span><span className="metric-icon">{icon}</span></div><strong>{Math.round(value)}<small>%</small></strong><div className="meter"><span style={{ width: `${Math.min(100, value)}%` }} /></div><p>{detail}</p></div>
}
export default function App() {
  const [file, setFile] = useState<File | null>(null)
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [active, setActive] = useState<Analysis | null>(null)
  const [history, setHistory] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'overview' | 'skills' | 'plan'>('overview')
  const [showForm, setShowForm] = useState(true)
  const [apiReady, setApiReady] = useState(false)

  async function loadHistory() {
    try {
      const response = await fetch(`${API}/api/analyses`)
      if (!response.ok) throw new Error('API unavailable')
      setHistory(await response.json())
      setApiReady(true)
    } catch { setApiReady(false) }
  }
  useEffect(() => { void loadHistory() }, [])
  const average = useMemo(() => history.length ? history.reduce((sum, item) => sum + item.match_score, 0) / history.length : 0, [history])
  const best = useMemo(() => history.length ? Math.max(...history.map(item => item.match_score)) : 0, [history])

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]
    if (selected && selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a PDF file.'); setFile(null); return
    }
    if (selected && selected.size > 5 * 1024 * 1024) {
      setError('Please choose a PDF smaller than 5 MB.'); setFile(null); return
    }
    setError(''); setFile(selected || null)
  }
  async function analyze(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (!file) { setError('Upload your resume PDF to continue.'); return }
    if (jobDescription.trim().length < 40) { setError('Paste a job description with at least 40 characters.'); return }
    const body = new FormData()
    body.append('resume', file)
    body.append('job_title', jobTitle.trim() || 'Untitled role')
    body.append('job_description', jobDescription)
    setLoading(true)
    try {
      const response = await fetch(`${API}/api/analyze`, { method: 'POST', body })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.detail || 'Analysis failed. Please try again.')
      setActive(payload)
      setTab('overview')
      setShowForm(false)
      await loadHistory()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not connect to the API. Is the backend running?')
    } finally { setLoading(false) }
  }
  async function openSaved(id: number) {
    setError('')
    try {
      const response = await fetch(`${API}/api/analyses/${id}`)
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.detail || 'Could not load analysis.')
      setActive(payload); setShowForm(false); setTab('overview')
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not load saved analysis.') }
  }
  async function deleteSaved(id: number) {
    if (!window.confirm('Delete this saved analysis?')) return
    try {
      const response = await fetch(`${API}/api/analyses/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Could not delete analysis.')
      setHistory(old => old.filter(item => item.id !== id))
      if (active?.id === id) setActive(null)
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not delete analysis.') }
  }
  function newAnalysis() { setActive(null); setShowForm(true); setFile(null); setJobTitle(''); setJobDescription(''); setError('') }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Sparkles size={20} /></div><div><b>RoleFit</b><span>CAREER INTELLIGENCE</span></div></div>
      <div className="side-label">WORKSPACE</div>
      <button className={`nav-item ${showForm ? 'selected' : ''}`} onClick={newAnalysis}><Plus size={17}/> New analysis <span className="nav-dot"/></button>
      <button className={`nav-item ${!showForm && active ? 'selected' : ''}`} onClick={() => { if (active) setShowForm(false); else setShowForm(true) }}><Activity size={17}/> Match dashboard</button>
      <div className="side-label history-label"><History size={14}/> RECENT ANALYSES <span>{history.length}</span></div>
      <div className="history-list">
        {history.length === 0 && <p className="empty-history">Your saved analyses will appear here.</p>}
        {history.slice(0, 8).map(item => <div className={`history-entry ${active?.id === item.id ? 'active' : ''}`} key={item.id}>
          <button onClick={() => void openSaved(item.id)}><span className="history-file"><FileText size={15}/></span><span className="history-text"><b>{item.job_title}</b><small>{prettyDate(item.created_at)}</small></span><span className="history-score">{Math.round(item.match_score)}%</span></button>
          <button className="delete-history" title="Delete saved analysis" onClick={() => void deleteSaved(item.id)}><Trash2 size={13}/></button>
        </div>)}
      </div>
      <div className="sidebar-bottom"><div className="privacy-icon"><CircleHelp size={17}/></div><div><b>Built for clarity</b><p>Scores are explainable indicators, not hiring probabilities.</p></div></div>
    </aside>

    <main className="main-content">
      <header className="topbar"><div className="breadcrumb">Workspace <ChevronRight size={14}/> <span>{showForm ? 'New analysis' : 'Match dashboard'}</span></div><div className={`api-status ${apiReady ? 'online' : ''}`}><span/> {apiReady ? 'API connected' : 'API not connected'}</div></header>
      <div className="page-wrap">
        <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line"/> YOUR NEXT CAREER MOVE</div><h1>Find your fit.</h1><p>Turn job descriptions into a clear, actionable plan for your next opportunity.</p></div><div className="heading-badge"><Sparkles size={15}/> AI-ASSISTED ANALYSIS</div></div>

        {error && <div className="error-banner"><X size={17}/><span>{error}</span><button onClick={() => setError('')}><X size={15}/></button></div>}

        {showForm && <section className="panel input-panel">
          <div className="section-heading"><div className="section-icon"><Target size={19}/></div><div><h2>Start a new analysis</h2><p>Bring your resume and target role. We'll show you where you stand.</p></div><span className="step-count">STEP 01 / 02</span></div>
          <form onSubmit={analyze}>
            <div className="form-grid">
              <div className="field-block"><label>RESUME <span className="required">*</span></label><label className={`upload-zone ${file ? 'has-file' : ''}`} htmlFor="resume-file">
                <input id="resume-file" type="file" accept=".pdf,application/pdf" onChange={onFileChange}/>
                <div className="upload-icon">{file ? <Check size={22}/> : <UploadCloud size={22}/>}</div>
                <div className="upload-copy"><b>{file ? file.name : 'Drop your resume here'}</b><span>{file ? `${(file.size / 1024).toFixed(0)} KB · Ready to analyze` : 'PDF format · Maximum 5 MB'}</span></div>
                <span className="browse-btn">{file ? 'Change file' : 'Browse files'}</span>
              </label><div className="field-hint"><FileText size={13}/> Text-based PDFs supported. Scanned PDFs need OCR.</div></div>
              <div className="field-block"><label>JOB TITLE <span className="optional">OPTIONAL</span></label><input className="text-input" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Software Engineer Intern"/><div className="field-hint"><BriefcaseBusiness size={13}/> Give this analysis a recognizable label.</div>
                <div className="quick-fill"><span>Need sample content?</span><button type="button" onClick={() => { setJobTitle('Junior Python Developer Intern'); setJobDescription(sampleJob) }}>Use sample job description <ArrowRight size={13}/></button></div>
              </div>
            </div>
            <div className="field-block jd-field"><label>JOB DESCRIPTION <span className="required">*</span></label><textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Paste the full job description here. Include responsibilities, required skills, qualifications, and nice-to-haves..." rows={6}/><div className="textarea-footer"><span>More detail helps provide a more useful comparison.</span><span>{jobDescription.length} characters</span></div></div>
            <div className="form-footer"><div className="secure-note"><span className="secure-dot"/> Analysis is stored in your configured database. Avoid uploading sensitive personal data.</div><button className="primary-btn" type="submit" disabled={loading}>{loading ? <><LoaderCircle className="spin" size={17}/> Analyzing...</> : <>Analyze my fit <ArrowRight size={17}/></>}</button></div>
          </form>
        </section>}

        {!showForm && active && <section className="results-area">
          <div className="result-title-row"><div><div className="eyebrow"><span className="eyebrow-line"/> ANALYSIS RESULT</div><h2>{active.job_title}</h2><p>Compared against <b>{active.resume_filename}</b> · {prettyDate(active.created_at)}</p></div><button className="secondary-btn" onClick={newAnalysis}><Plus size={16}/> New analysis</button></div>
          <div className="result-hero panel"><div className="hero-score"><ScoreRing value={active.match_score}/></div><div className="hero-copy"><span className="result-pill"><Sparkles size={13}/> YOUR MATCH SNAPSHOT</span><h3>{active.match_score >= 75 ? 'Strong alignment' : active.match_score >= 50 ? 'Promising foundation' : 'Room to grow'}</h3><p>{active.match_score >= 75 ? 'Your resume aligns with many of the signals in this role. Refine the gaps below to strengthen your application.' : active.match_score >= 50 ? 'You have a useful starting point. Focus on the missing skills and make relevant project evidence easier to spot.' : 'Use this as a practical roadmap. Prioritize the core missing skills and build small projects that demonstrate them.'}</p><div className="hero-tags"><span><Check size={13}/> {active.matched_skills.length} matched skills</span><span><Target size={13}/> {active.missing_skills.length} skill gaps</span></div></div><div className="hero-side"><span>JOB REQUIREMENTS</span><strong>{active.job_skills.length}</strong><small>skills detected</small><div className="hero-side-line"/></div></div>
          <div className="metrics-grid"><Metric title="Skill coverage" value={active.skill_coverage} detail="Share of detected job skills found in your resume" icon={<Target size={17}/>} /><Metric title="Text similarity" value={active.semantic_similarity} detail="TF-IDF overlap between resume and job text" icon={<Activity size={17}/>} /><Metric title="Experience signals" value={active.experience_relevance} detail="Overlap of experience-related keywords" icon={<BriefcaseBusiness size={17}/>} /></div>
          <div className="tabs"><button className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>Overview</button><button className={tab === 'skills' ? 'active' : ''} onClick={() => setTab('skills')}>Skills comparison <span>{active.missing_skills.length}</span></button><button className={tab === 'plan' ? 'active' : ''} onClick={() => setTab('plan')}>Preparation plan</button></div>
          {tab === 'overview' && <div className="overview-grid"><div className="panel content-panel"><div className="panel-title"><h3>Skill alignment</h3><span className="muted-label">DETECTED SKILLS</span></div><div className="alignment-bar"><span style={{width: `${active.job_skills.length ? active.matched_skills.length / active.job_skills.length * 100 : 0}%`}}/></div><div className="alignment-legend"><span><i className="green-dot"/> Matched <b>{active.matched_skills.length}</b></span><span><i className="orange-dot"/> Missing <b>{active.missing_skills.length}</b></span></div><div className="skill-preview">{active.matched_skills.slice(0, 8).map(skill => <span className="skill-chip matched" key={skill}><Check size={12}/>{skill}</span>)}{active.matched_skills.length === 0 && <p className="muted">No direct skill matches detected. Check the extracted text and job description.</p>}</div><button className="text-link" onClick={() => setTab('skills')}>View full skills comparison <ArrowRight size={14}/></button></div><div className="panel content-panel"><div className="panel-title"><h3>Recommended next steps</h3><span className="plan-count">{active.learning_plan.length} ACTIONS</span></div><div className="next-steps">{active.learning_plan.slice(0, 3).map((item, i) => <div className="next-step" key={item.skill}><span className="step-number">0{i + 1}</span><div><b>{item.skill}</b><p>{item.action}</p></div></div>)}</div><button className="text-link" onClick={() => setTab('plan')}>Open preparation plan <ArrowRight size={14}/></button></div></div>}
          {tab === 'skills' && <div className="skills-grid"><div className="panel content-panel"><div className="skill-heading"><span className="legend-check"><Check size={15}/></span><div><h3>Matched skills</h3><p>Found in both your resume and the job description.</p></div><b>{active.matched_skills.length}</b></div><div className="chip-list">{active.matched_skills.map(s => <span className="skill-chip matched" key={s}><Check size={12}/>{s}</span>)}{!active.matched_skills.length && <p className="muted">No direct matches found.</p>}</div></div><div className="panel content-panel"><div className="skill-heading"><span className="legend-missing"><X size={15}/></span><div><h3>Missing skills</h3><p>Detected in the job description but not in your resume.</p></div><b>{active.missing_skills.length}</b></div><div className="chip-list">{active.missing_skills.map(s => <span className="skill-chip missing" key={s}>{s}</span>)}{!active.missing_skills.length && <p className="muted">No skill gaps detected in the current dictionary.</p>}</div><p className="fine-print">A skill may be missing from the extracted text even if you have it. Verify the result before acting on it.</p></div><div className="panel content-panel full-width"><div className="panel-title"><h3>All detected skills</h3><span className="muted-label">RESUME INVENTORY</span></div><div className="chip-list">{active.resume_skills.map(s => <span className={`skill-chip ${active.job_skills.includes(s) ? 'matched' : 'neutral'}`} key={s}>{active.job_skills.includes(s) && <Check size={12}/>} {s}</span>)}{!active.resume_skills.length && <p className="muted">No known skills detected. Update the skills dictionary for your domain.</p>}</div></div></div>}
          {tab === 'plan' && <div className="panel content-panel plan-panel"><div className="panel-title"><div><h3>Your preparation plan</h3><p>Small, demonstrable outcomes beat simply listing a skill.</p></div><span className="plan-count">{active.learning_plan.length} ACTIONS</span></div>{active.learning_plan.map((item, i) => <div className="plan-row" key={item.skill}><div className="plan-index">{String(i + 1).padStart(2, '0')}</div><div className="plan-body"><div className="plan-skill">{item.skill}<span className="priority-tag">{i < 3 ? 'PRIORITIZE' : 'NEXT'}</span></div><p>{item.action}</p><div className="deliverable"><Check size={14}/><span><b>Suggested deliverable:</b> {item.deliverable}</span></div></div></div>)}<div className="plan-note"><CircleHelp size={16}/><span>Recommendations are generated from a simple skill dictionary. Choose gaps that are genuinely relevant to your goals, then verify them against the original job post.</span></div></div>}
          <div className="disclaimer"><CircleHelp size={15}/><span><b>How to read these scores:</b> all metrics are heuristic indicators based on extracted text, a skill dictionary, and TF-IDF. They are not probabilities of getting hired. Always review the source documents.</span></div>
        </section>}

        {!showForm && !active && <section className="panel empty-state"><div className="empty-illustration"><BriefcaseBusiness size={28}/></div><h2>Your career dashboard is ready</h2><p>Run your first resume-to-job analysis to see your skill coverage, gaps, and preparation plan here.</p><button className="primary-btn" onClick={newAnalysis}>Start an analysis <ArrowRight size={17}/></button></section>}

        {!showForm && <section className="dashboard-section"><div className="dashboard-heading"><div><h2>Analysis overview</h2><p>Your saved comparisons, all in one place.</p></div><span className="muted-label">LATEST {history.length} / 100</span></div><div className="summary-grid"><div className="summary-card"><span><FileText size={16}/> SAVED ANALYSES</span><strong>{history.length}</strong><small>Stored comparisons</small></div><div className="summary-card"><span><Gauge size={16}/> AVERAGE MATCH</span><strong>{history.length ? `${Math.round(average)}%` : '—'}</strong><small>Across saved roles</small></div><div className="summary-card"><span><Target size={16}/> BEST MATCH</span><strong>{history.length ? `${Math.round(best)}%` : '—'}</strong><small>Highest heuristic score</small></div></div>
          <div className="panel table-panel"><div className="panel-title"><h3>Saved comparisons</h3><span className="muted-label">MOST RECENT FIRST</span></div>{history.length === 0 ? <div className="table-empty"><Clock3 size={19}/><span>No saved analyses yet. Your first result will appear here.</span></div> : <div className="comparison-table"><div className="table-head"><span>ROLE / RESUME</span><span>MATCH SCORE</span><span>SKILL COVERAGE</span><span>DATE</span><span/></div>{history.map(item => <div className="table-row" key={item.id}><button className="role-cell" onClick={() => void openSaved(item.id)}><span className="table-file"><FileText size={16}/></span><span><b>{item.job_title}</b><small>{item.resume_filename}</small></span></button><div className="table-score"><b>{Math.round(item.match_score)}%</b><div className="mini-meter"><span style={{width: `${item.match_score}%`}}/></div></div><span className="coverage-value">{Math.round(item.skill_coverage)}%</span><span className="date-value">{prettyDate(item.created_at)}</span><button className="icon-btn" title="Delete" onClick={() => void deleteSaved(item.id)}><Trash2 size={15}/></button></div>)}</div>}</div>
        </section>}
        <footer className="footer"><span>ROLEFIT <span className="footer-dot">·</span> BUILT FOR YOUR NEXT STEP</span><span>Explainable matching, human judgment.</span></footer>
      </div>
    </main>
  </div>
}
