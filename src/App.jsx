import { useEffect, useMemo, useRef, useState } from 'react'
import Papa from 'papaparse'
import {
  Area, CartesianGrid, ComposedChart, Line, ReferenceLine, Scatter,
  Tooltip, XAxis, YAxis, ResponsiveContainer,
} from 'recharts'
import {
  Activity, ArrowDownToLine, ArrowRight, Beaker, BookOpen,
  ChevronLeft, ChevronRight, Dna, Download, FlaskConical,
  Info, Layers3, Menu, Play, RotateCcw, Search, Upload, X,
} from 'lucide-react'
import { createDemoDataset } from './data/demoDataset'
import { quadraticRegression } from './utils/quadraticRegression'

const navItems = [
  ['Overview', 'overview'], ['Biology', 'biology'], ['Mathematics', 'mathematics'],
  ['Dataset', 'dataset'], ['Simulator', 'simulator'], ['Methodology', 'methodology'],
]

const referenceModel = { a: -0.115410, b: 12.241174, c: -215.187888 }

function formatSigned(value, digits = 6) {
  if (!Number.isFinite(value)) return '—'
  return `${value < 0 ? '−' : ''}${Math.abs(value).toFixed(digits)}`
}

function SectionHeading({ eyebrow, title, copy, align = 'left' }) {
  return (
    <div className={align === 'center' ? 'section-heading center' : 'section-heading'}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {copy && <p className="section-copy">{copy}</p>}
    </div>
  )
}

function Metric({ label, value, unit, accent }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong className={accent ? 'accent-text' : ''}>{value}</strong>
      {unit && <small>{unit}</small>}
    </div>
  )
}

function Navbar() {
  const [open, setOpen] = useState(false)
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setOpen(false)
  }
  return (
    <header className="navbar">
      <button className="brand" onClick={() => scrollTo('overview')} aria-label="Go to overview">
        <span className="brand-mark"><Dna size={16} /></span>
        <span>ENZYM <b>/ 01</b></span>
      </button>
      <nav className={open ? 'nav-links open' : 'nav-links'} aria-label="Primary navigation">
        {navItems.map(([label, id]) => (
          <button key={id} onClick={() => scrollTo(id)}>{label}</button>
        ))}
      </nav>
      <button className="nav-action" onClick={() => scrollTo('simulator')}>
        Open lab <ArrowRight size={15} />
      </button>
      <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
        {open ? <X /> : <Menu />}
      </button>
    </header>
  )
}

function ActivityChart({ model, rows = [], compact = false, reference = false }) {
  const a = model?.a ?? referenceModel.a
  const b = model?.b ?? referenceModel.b
  const c = model?.c ?? referenceModel.c
  const points = rows.length ? rows : createDemoDataset()
  const xs = points.map((row) => Number(row.Temperature_C ?? row.temperature)).filter(Number.isFinite)
  const observedMin = xs.length ? Math.min(...xs) : 30
  const observedMax = xs.length ? Math.max(...xs) : 75
  const start = Math.floor(observedMin / 5) * 5
  const end = Math.ceil(observedMax / 5) * 5
  const curve = []
  for (let x = start; x <= end; x += (end - start) / 60) {
    curve.push({ temperature: x, activity: a * x * x + b * x + c })
  }
  const optimum = a < 0 ? -b / (2 * a) : null
  const maximum = optimum !== null ? a * optimum * optimum + b * optimum + c : null
  const scatter = points.map((row) => ({
    temperature: Number(row.Temperature_C ?? row.temperature),
    activity: Number(row.Activity_umol_product_per_min ?? row.activity),
  })).filter((point) => Number.isFinite(point.temperature) && Number.isFinite(point.activity))

  return (
    <div className={compact ? 'chart compact' : 'chart'}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart margin={{ top: 18, right: 12, bottom: 8, left: 0 }}>
          <CartesianGrid stroke="#243249" strokeDasharray="2 5" vertical={false} />
          <XAxis type="number" dataKey="temperature" domain={[start, end]} tick={{ fill: '#7E91A8', fontSize: 11 }} axisLine={{ stroke: '#26364C' }} tickLine={false} label={{ value: 'Temperature (°C)', position: 'insideBottom', offset: -2, fill: '#94A3B8', fontSize: 11 }} />
          <YAxis tick={{ fill: '#7E91A8', fontSize: 11 }} axisLine={false} tickLine={false} width={44} label={{ value: 'Activity (µmol/min)', angle: -90, position: 'insideLeft', fill: '#94A3B8', fontSize: 11 }} />
          <Tooltip contentStyle={{ background: '#101927', border: '1px solid #2A3A50', borderRadius: 4, color: '#E9F0F7' }} />
          <Scatter name="Observed" data={scatter} fill="#B18AFF" />
          <Line data={curve} type="monotone" dataKey="activity" stroke="#45D6E8" strokeWidth={2.5} dot={false} isAnimationActive={!compact} />
          {optimum !== null && (
            <ReferenceLine x={optimum} stroke="#45D6E8" strokeDasharray="4 4" label={{ value: 'Topt', fill: '#45D6E8', fontSize: 10, position: 'insideTopRight' }} />
          )}
        </ComposedChart>
      </ResponsiveContainer>
      {maximum !== null && (
        <div className="chart-note">
          <span>Estimated vertex</span>
          <b>{optimum.toFixed(2)}°C · {maximum.toFixed(2)} µmol/min</b>
        </div>
      )}
    </div>
  )
}

function Home() {
  return (
    <section id="overview" className="hero-section">
      <div className="hero-grid">
        <div className="hero-copy">
          <div className="status-line"><span /> RESEARCH PLATFORM · 2026</div>
          <h1><span>ENZYM</span><em>/ 01</em></h1>
          <h2>Finding the optimum temperature for enzyme activity.</h2>
          <p>Using quadratic functions to model a biological response, estimate a maximum, and distinguish prediction from experimental evidence.</p>
          <div className="hero-actions">
            <button className="primary" onClick={() => document.getElementById('simulator')?.scrollIntoView({ behavior: 'smooth' })}><Play size={16} fill="currentColor" /> Explore the simulation</button>
            <button className="secondary" onClick={() => document.getElementById('mathematics')?.scrollIntoView({ behavior: 'smooth' })}>Understand the mathematics <ArrowRight size={16} /></button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="panel-header"><span>ACTIVITY RESPONSE MODEL</span><span>EDUCATIONAL SIMULATION</span></div>
          <ActivityChart compact reference />
          <div className="hero-metrics">
            <Metric label="Estimated optimum" value="53.03" unit="°C" accent />
            <Metric label="Maximum activity" value="109.41" unit="µmol/min" />
          </div>
        </div>
      </div>
      <div className="project-strip">
        <div><span>DISCIPLINES</span><b>Biology · Mathematics · Python</b></div>
        <div><span>MODEL</span><b>Quadratic least-squares regression</b></div>
        <div><span>STATUS</span><b><i /> Educational simulation</b></div>
      </div>
      <p className="disclaimer"><Info size={14} /> Educational simulation. Results are generated for teaching and do not replace laboratory measurements.</p>
    </section>
  )
}

function Biology() {
  const [temperature, setTemperature] = useState(53)
  let state = 'Low activity'
  let copy = 'Molecular movement is reduced, so substrate encounters and product formation occur slowly.'
  if (temperature >= 45 && temperature <= 58) {
    state = 'Near optimum'
    copy = 'Collisions are frequent while the enzyme structure remains active. This is the highest predicted activity region.'
  } else if (temperature > 58) {
    state = 'Denaturation risk'
    copy = 'Thermal disruption alters the active site. Catalytic activity falls even though molecular movement remains high.'
  }
  const activity = Math.max(8, 109 * (1 - ((temperature - 53) / 38) ** 2))
  return (
    <section id="biology" className="content-section">
      <SectionHeading eyebrow="01 / Biology explorer" title="How temperature changes catalytic activity" copy="An enzyme lowers the activation energy of a reaction. Temperature changes the collision rate and, at excess heat, the molecular structure." />
      <div className="biology-grid">
        <div className="reaction-panel">
          <div className="panel-header"><span>CATALYTIC CYCLE</span><span>SIMPLIFIED</span></div>
          <div className="reaction-diagram">
            <div className="enzyme"><Dna size={34} /><span>ENZYME</span></div>
            <b>+</b>
            <div className="substrate"><span /><small>SUBSTRATE</small></div>
            <ArrowRight size={22} />
            <div className="product"><span /><span /><small>PRODUCTS</small></div>
          </div>
          <div className="three-states">
            <div><b>Low</b><span>Slow molecular motion</span></div>
            <div className="selected"><b>Optimum</b><span>Peak catalytic range</span></div>
            <div><b>High</b><span>Denaturation risk</span></div>
          </div>
        </div>
        <div className="temperature-panel">
          <div className="temperature-readout"><span>Temperature</span><strong>{temperature}<small>°C</small></strong></div>
          <input aria-label="Temperature" type="range" min="20" max="80" value={temperature} onChange={(event) => setTemperature(Number(event.target.value))} />
          <div className="activity-bars"><span style={{ width: `${activity}%` }} /></div>
          <div className="slider-labels"><span>20°C</span><span>80°C</span></div>
          <div className="state-readout">
            <p>{state}</p>
            <strong>{activity.toFixed(1)} µmol/min</strong>
            <span>{copy}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function Mathematics() {
  const [a, setA] = useState(-0.1)
  const [b, setB] = useState(10)
  const [c, setC] = useState(-150)
  const optimum = a < 0 ? -b / (2 * a) : null
  const maximum = optimum !== null ? a * optimum * optimum + b * optimum + c : null
  const model = { a, b, c }
  return (
    <section id="mathematics" className="content-section">
      <SectionHeading eyebrow="02 / Mathematics lab" title="From observations to an analytical maximum" copy="Quadratic regression finds coefficients that minimise the squared distance between observed activity and the fitted curve." />
      <div className="math-grid">
        <div className="formula-panel">
          <div className="equation">A(T) = <span>a</span>T² + <span>b</span>T + <span>c</span></div>
          <div className="coefficient-list">
            <p><b>a</b><span>Curvature · negative values open downward</span></p>
            <p><b>b</b><span>Linear shift · controls vertex position</span></p>
            <p><b>c</b><span>Intercept · activity at T = 0</span></p>
          </div>
          <div className="vertex-formula">
            <p>T<sub>opt</sub> = −b / (2a)</p>
            <p>A<sub>max</sub> = A(T<sub>opt</sub>)</p>
          </div>
        </div>
        <div className="coefficient-lab">
          <div className="panel-header"><span>INTERACTIVE COEFFICIENTS</span><span>LIVE MODEL</span></div>
          <div className="inputs-row">
            {[['a', a, setA, -0.5, 0.5], ['b', b, setB, -20, 20], ['c', c, setC, -300, 300]].map(([label, value, setter, min, max]) => (
              <label key={label}>{label}<input type="number" step="0.01" value={value} onChange={(event) => setter(Number(event.target.value))} /></label>
            ))}
          </div>
          {a >= 0 && <p className="error-message">A maximum is not defined by this model: coefficient a must be negative.</p>}
          <ActivityChart model={model} compact rows={[{ temperature: 20, activity: 0 }, { temperature: 80, activity: 0 }]} />
          <div className="math-result">
            <span>Vertex</span><b>{optimum !== null ? `${optimum.toFixed(2)}°C` : 'Upward-opening parabola'}</b>
            <span>Maximum</span><b>{maximum !== null ? `${maximum.toFixed(2)} µmol/min` : 'Not applicable'}</b>
          </div>
        </div>
      </div>
      <div className="worked-example">
        <div><span>WORKED EXAMPLE</span><b>A(T) = −0.1T² + 10T − 150</b></div>
        <ol><li><b>1</b><span>T<sub>opt</sub> = −10 / (2 × −0.1)</span></li><li><b>2</b><span>T<sub>opt</sub> = 50°C</span></li><li><b>3</b><span>A(50) = 100 µmol/min</span></li></ol>
      </div>
    </section>
  )
}

function DatasetExplorer() {
  const demo = useMemo(() => createDemoDataset(), [])
  const [rows, setRows] = useState(demo)
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState('Temperature_C')
  const [sortAsc, setSortAsc] = useState(true)
  const [page, setPage] = useState(1)
  const fileRef = useRef(null)
  const pageSize = 8
  const filtered = rows.filter((row) => Object.values(row).join(' ').toLowerCase().includes(query.toLowerCase()))
  const sorted = [...filtered].sort((left, right) => {
    const a = left[sortKey], b = right[sortKey]
    if (typeof a === 'number' && typeof b === 'number') return sortAsc ? a - b : b - a
    return sortAsc ? String(a).localeCompare(String(b)) : String(b).localeCompare(String(a))
  })
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const visible = sorted.slice((page - 1) * pageSize, page * pageSize)
  const missing = rows.reduce((count, row) => count + Object.values(row).filter((value) => value === '' || value === null || value === undefined).length, 0)
  const sortBy = (key) => {
    if (sortKey === key) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(true) }
  }
  const upload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    Papa.parse(file, {
      header: true, dynamicTyping: true, skipEmptyLines: true,
      complete: ({ data, errors }) => {
        if (errors.length) return
        const required = ['Temperature_C', 'Activity_umol_product_per_min']
        if (!data[0] || !required.every((key) => key in data[0])) {
          alert('CSV must include Temperature_C and Activity_umol_product_per_min columns.')
          return
        }
        setRows(data); setPage(1)
      },
    })
  }
  const download = () => {
    const blob = new Blob([Papa.unparse(rows)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url; link.download = 'enzym-demonstration-data.csv'; link.click()
    URL.revokeObjectURL(url)
  }
  const columns = ['Temperature_C', 'pH', 'Enzyme_Concentration_relative_units', 'Substrate_Concentration_mM', 'Activity_umol_product_per_min']
  return (
    <section id="dataset" className="content-section">
      <SectionHeading eyebrow="03 / Dataset explorer" title="Inspect and clean the observation table" copy="Supplied below is a reproducible, clearly labelled demonstration dataset—not an archive of original project observations." />
      <div className="dataset-toolbar">
        <div className="search-box"><Search size={15} /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} placeholder="Search observations" /></div>
        <span>{rows.length} rows · {missing} missing values</span>
        <div className="toolbar-actions">
          <button onClick={() => fileRef.current?.click()}><Upload size={15} /> Upload CSV</button>
          <button onClick={download}><Download size={15} /> Download</button>
          <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={upload} hidden />
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr>{columns.map((column) => <th key={column}><button onClick={() => sortBy(column)}>{column.replaceAll('_', ' ')} {sortKey === column ? (sortAsc ? '↑' : '↓') : ''}</button></th>)}</tr></thead>
          <tbody>{visible.length ? visible.map((row, index) => (
            <tr key={index}>{columns.map((column) => <td key={column}>{row[column] ?? '—'}</td>)}</tr>
          )) : <tr><td colSpan={5} className="empty">No observations match this search.</td></tr>}</tbody>
        </table>
      </div>
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}><ChevronLeft size={14} /></button>
        <span>Page {page} of {pages}</span>
        <button disabled={page === pages} onClick={() => setPage(page + 1)}><ChevronRight size={14} /></button>
      </div>
      <div className="pipeline">
        {[['100', 'Original simulated records'], ['96', 'After duplicate removal'], ['94', 'After missing-value removal'], ['90', 'After invalid-record removal'], ['28', 'Controlled subset']].map(([value, label], index) => (
          <div key={value}><span>{index === 4 ? 'FINAL' : `STEP ${index + 1}`}</span><b>{value}</b><small>{label}</small></div>
        ))}
      </div>
    </section>
  )
}

function Simulator() {
  const demo = useMemo(() => createDemoDataset(), [])
  const [rows, setRows] = useState(demo.map((row) => ({ temperature: row.Temperature_C, activity: row.Activity_umol_product_per_min })))
  const [manualTemperature, setManualTemperature] = useState('')
  const [manualActivity, setManualActivity] = useState('')
  const [status, setStatus] = useState('')
  const [model, setModel] = useState(null)
  const [source, setSource] = useState('demonstration')
  const fileRef = useRef(null)

  const fit = (data = rows) => {
    try {
      const result = quadraticRegression(data)
      setModel(result)
      setStatus('')
      if (result.a >= 0) setStatus('The fit opens upward (a ≥ 0), so it does not identify a maximum with this quadratic model.')
      else setStatus('Fit complete. The vertex is the model-predicted maximum for the supplied range.')
    } catch (error) {
      setModel(null)
      setStatus(error.message)
    }
  }

  useEffect(() => {
    try { setModel(quadraticRegression(rows)) } catch { setModel(null) }
  }, [])

  const addObservation = () => {
    const temperature = Number(manualTemperature)
    const activity = Number(manualActivity)
    if (!Number.isFinite(temperature) || !Number.isFinite(activity)) {
      setStatus('Enter numeric temperature and activity values.')
      return
    }
    const next = [...rows, { temperature, activity }]
    setRows(next); setManualTemperature(''); setManualActivity(''); setSource('manual'); fit(next)
  }
  const upload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    Papa.parse(file, { header: true, dynamicTyping: true, skipEmptyLines: true, complete: ({ data, errors }) => {
      if (errors.length) { setStatus('The CSV could not be parsed. Check for malformed rows.'); return }
      const temperatureKeys = ['Temperature_C', 'temperature', 'Temperature']
      const activityKeys = ['Activity_umol_product_per_min', 'activity', 'Activity']
      const first = data[0] || {}
      const temperatureKey = temperatureKeys.find((key) => key in first)
      const activityKey = activityKeys.find((key) => key in first)
      if (!temperatureKey || !activityKey) {
        setStatus('CSV columns must include temperature and activity fields (Temperature_C and Activity_umol_product_per_min).')
        return
      }
      const next = data.map((row) => ({ temperature: Number(row[temperatureKey]), activity: Number(row[activityKey]) }))
      if (next.length < 3) { setStatus('At least 3 valid observations are required.'); return }
      setRows(next); setSource(file.name); fit(next); setStatus('')
    } })
  }
  const reset = () => {
    const next = demo.map((row) => ({ temperature: row.Temperature_C, activity: row.Activity_umol_product_per_min }))
    setRows(next); setSource('demonstration'); fit(next)
  }

  const chartRows = rows.map((row) => ({ Temperature_C: row.temperature, Activity_umol_product_per_min: row.activity }))
  const hasFit = model && model.a < 0
  return (
    <section id="simulator" className="content-section simulator-section">
      <SectionHeading eyebrow="04 / Interactive simulator" title="Fit a quadratic model to observations" copy="Upload observations or enter them manually. Every fit is recalculated locally using least-squares regression." />
      <div className="simulator-grid">
        <aside className="control-panel">
          <div className="panel-header"><span>OBSERVATION CONTROL</span><b>{rows.length} pts</b></div>
          <div className="source-label"><span>Current source</span><strong>{source === 'demonstration' ? 'Demonstration dataset' : source}</strong></div>
          <button className="source-button" onClick={() => fileRef.current?.click()}><Upload size={16} /> Upload CSV <small>.csv</small></button>
          <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={upload} />
          <button className="source-button muted" onClick={reset}><Beaker size={16} /> Load demonstration <small>28 pts</small></button>
          <div className="manual-entry">
            <span>ADD OBSERVATION</span>
            <label>Temperature (°C)<input type="number" value={manualTemperature} onChange={(event) => setManualTemperature(event.target.value)} placeholder="53.0" /></label>
            <label>Activity (µmol/min)<input type="number" value={manualActivity} onChange={(event) => setManualActivity(event.target.value)} placeholder="109.4" /></label>
            <button onClick={addObservation}>Add point <ArrowRight size={14} /></button>
          </div>
          <button className="reset-button" onClick={reset}><RotateCcw size={14} /> Reset simulation</button>
        </aside>
        <div className="workspace">
          <div className="workspace-header">
            <div><span>QUADRATIC FIT</span><b>Activity vs. temperature</b></div>
            <div className={`fit-state ${hasFit ? 'success' : ''}`}><i /> {hasFit ? 'Maximum model valid' : 'Fit unavailable'}</div>
          </div>
          <ActivityChart model={model} rows={chartRows} />
          {status && <div className={status.startsWith('Fit complete') ? 'success-message' : 'error-message'}>{status}</div>}
        </div>
        <aside className="results-panel">
          <div className="panel-header"><span>MODEL OUTPUT</span><span>{model ? 'Fitted' : 'Waiting'}</span></div>
          {model ? (
            <>
              <div className="equation-output">A(T) = <b>{formatSigned(model.a)}T²</b><br /> + {formatSigned(model.b)}T {formatSigned(model.c, 6)}</div>
              <div className="coefficient-grid"><div><span>a</span><b>{formatSigned(model.a)}</b></div><div><span>b</span><b>{formatSigned(model.b)}</b></div><div><span>c</span><b>{formatSigned(model.c)}</b></div></div>
              {hasFit ? (
                <div className="model-metrics">
                  <Metric label="Optimum" value={model.optimum.toFixed(2)} unit="°C" accent />
                  <Metric label="Predicted maximum" value={model.maximum.toFixed(2)} unit="µmol/min" />
                  <Metric label="R² goodness of fit" value={model.r2.toFixed(4)} unit="" />
                </div>
              ) : <p className="error-message">The coefficient a is not negative. A maximum cannot be calculated.</p>}
            </>
          ) : <p className="empty-output">Add at least 3 varied observations to fit a quadratic.</p>}
        </aside>
      </div>
      <p className="disclaimer"><Info size={14} /> The optimum is an estimate from a quadratic model and may not represent actual biological conditions.</p>
    </section>
  )
}

function Results() {
  return (
    <section id="results" className="content-section">
      <SectionHeading eyebrow="05 / Reference results" title="Published project simulation" copy="The values below describe the reference model in the project brief. They are retained as a comparison baseline and are not assumed to derive from the demonstration dataset." />
      <div className="results-grid">
        <div className="result-chart">
          <div className="panel-header"><span>FITTED ACTIVITY CURVE</span><span>REFERENCE MODEL</span></div>
          <ActivityChart compact reference />
        </div>
        <div className="reference-output">
          <Metric label="Optimum temperature" value="53.03" unit="°C" accent />
          <Metric label="Maximum predicted activity" value="109.41" unit="µmol/min" />
          <div className="reference-equation">
            <span>Fitted equation</span>
            <b>A(T) = −0.115410T² + 12.241174T − 215.187888</b>
          </div>
          <div className="condition-list"><span>Controlled conditions</span><p>pH <b>6.5</b></p><p>Enzyme concentration <b>1.0 relative units</b></p><p>Substrate concentration <b>10.0 mM</b></p></div>
        </div>
      </div>
    </section>
  )
}

function Comparison() {
  return (
    <section className="content-section comparison-section">
      <SectionHeading eyebrow="06 / Research comparison" title="Context, not direct replication" copy="Experimental literature and the educational simulation measure different systems under different conditions." />
      <div className="comparison-grid">
        <article>
          <div className="comparison-type">PUBLISHED EXPERIMENT</div>
          <h3>52°C optimum</h3>
          <p><span>Enzyme</span>α-Amylase from Bacillus subtilis KIBGE HAS</p>
          <p><span>Conditions</span>pH 7.5 · Phosphate buffer · Soluble starch</p>
          <p><span>Citation</span>Bano et al. (2011), AAPS PharmSciTech 12, 255–261</p>
          <p><span>DOI</span>10.1208/s12249-011-9586-1</p>
        </article>
        <div className="difference"><span>Difference</span><b>3.03°C</b><small>Contextual difference</small></div>
        <article>
          <div className="comparison-type accent">EDUCATIONAL SIMULATION</div>
          <h3>53.03°C optimum</h3>
          <p><span>Model</span>Quadratic fit to simulated observations</p>
          <p><span>Conditions</span>pH 6.5 · Enzyme concentration 1.0</p>
          <p><span>Substrate</span>10.0 mM</p>
          <p><span>Use</span>Teaching and method demonstration</p>
        </article>
      </div>
    </section>
  )
}

function Methodology() {
  const steps = ['Load CSV', 'Inspect data', 'Clean duplicates', 'Clean missing values', 'Remove invalid records', 'Filter controlled conditions', 'Extract temperature and activity', 'Quadratic regression', 'Vertex calculation', 'Visualize', 'Interpret']
  return (
    <section id="methodology" className="content-section">
      <SectionHeading eyebrow="07 / Methodology" title="Reproducible modelling workflow" copy="A transparent sequence connects raw observations to the fitted vertex." />
      <div className="process-flow">{steps.map((step, index) => <div key={step}><span>{String(index + 1).padStart(2, '0')}</span><b>{step}</b>{index < steps.length - 1 && <ArrowRight size={14} />}</div>)}</div>
      <div className="tools-grid">
        <div><b>Pandas</b><span>Table loading, inspection, cleaning and controlled-condition filtering.</span></div>
        <div><b>NumPy</b><span>Numerical arrays and the matrix operations used for least-squares regression.</span></div>
        <div><b>Matplotlib</b><span>Scientific chart generation in the original Python implementation.</span></div>
        <div><b>Pathlib</b><span>Cross-platform file and output path handling.</span></div>
      </div>
    </section>
  )
}

function Applications() {
  return (
    <section className="content-section">
      <SectionHeading eyebrow="08 / Applications" title="Where temperature modelling has value" />
      <div className="application-grid">
        {[['Food processing', 'Optimising starch conversion and processing temperatures.'], ['Detergents', 'Selecting wash temperatures that balance enzyme stability and activity.'], ['Biotechnology', 'Planning biocatalytic reaction conditions.'], ['Biofuels', 'Improving conversion efficiency in industrial processes.'], ['Laboratory assays', 'Defining temperature controls and validation ranges.']].map(([title, copy]) => (
          <article key={title}><FlaskConical size={18} /><h3>{title}</h3><p>{copy}</p></article>
        ))}
      </div>
      <div className="future-block">
        <div><span>FUTURE SCOPE</span><h3>Strengthening the model</h3></div>
        <ul><li>Real laboratory datasets</li><li>Repeated experimental trials</li><li>More temperature samples near the peak</li><li>Independent study of pH and substrate concentration</li><li>Comparison with cubic, quartic and biological models</li></ul>
      </div>
    </section>
  )
}

function Conclusion() {
  return (
    <section className="conclusion-section">
      <div>
        <p className="eyebrow">09 / Conclusion</p>
        <h2>A fitted vertex estimates a maximum; it does not prove one.</h2>
        <p>For a downward-opening quadratic, the vertex supplies the temperature of maximum predicted activity. Interpretation remains conditional on the data range, experimental design and enzyme being studied.</p>
      </div>
      <aside>
        <span>REFERENCE</span>
        <p>Bano, S., Qader, S. A. U., Aman, A., Syed, M. N., &amp; Durrani, K. (2011). Purification and characterization of novel α-amylase from Bacillus subtilis KIBGE HAS.</p>
        <p>AAPS PharmSciTech, 12, 255–261.</p>
        <a href="https://doi.org/10.1208/s12249-011-9586-1" target="_blank" rel="noreferrer">doi:10.1208/s12249-011-9586-1 <ArrowRight size={13} /></a>
      </aside>
    </section>
  )
}

function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Home />
        <Biology />
        <Mathematics />
        <DatasetExplorer />
        <Simulator />
        <Results />
        <Comparison />
        <Methodology />
        <Applications />
        <Conclusion />
      </main>
      <footer><div className="brand"><span className="brand-mark"><Dna size={16} /></span><span>ENZYM <b>/ 01</b></span></div><p>Educational scientific modelling platform</p><button onClick={() => document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth' })}>Back to top ↑</button></footer>
    </div>
  )
}

export default App
