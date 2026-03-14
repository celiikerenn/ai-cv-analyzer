import { useCallback, useEffect, useMemo, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?worker'
import { jsPDF } from 'jspdf'

pdfjsLib.GlobalWorkerOptions.workerPort = new pdfjsWorker()

const HISTORY_KEY = 'cv-analyzer-history'
const THEME_KEY = 'cv-analyzer-theme'
const MAX_HISTORY = 10

/* ─── Translations ─── */

const LANG = {
  en: {
    appTitle: 'AI CV Analyzer',
    uploadTitle: 'Upload your CV',
    uploadHint: 'Drag & drop a PDF or text file here, or click to browse.',
    uploading: 'Reading file…',
    analyzing: 'Analyzing with Gemini…',
    chooseFile: 'Choose file',
    langEn: 'EN',
    langTr: 'TR',
    scoreTitle: 'Overall Score',
    strengthsTitle: 'Strengths',
    weaknessesTitle: 'Weaknesses',
    suggestionsTitle: 'Suggestions',
    missingKeywordsTitle: 'Missing Keywords',
    summaryTitle: 'Summary',
    noResultsYet: 'Upload a CV to see the analysis here.',
    errorTitle: 'Error',
    tryAgain: 'Please try again with another file or later.',
    categoryTitle: 'Category Scores',
    catExperience: 'Experience',
    catTechnical: 'Technical',
    catFormat: 'Format',
    catImpact: 'Impact',
    atsTitle: 'ATS Compatibility',
    historyTitle: 'Analysis History',
    historyEmpty: 'No past analyses yet.',
    historyBtn: 'History',
    downloadBtn: 'Download Report',
    close: 'Close',
    noKeywords: 'No critical missing keywords detected.',
    noItems: 'No items returned for this section.',
  },
  tr: {
    appTitle: 'Yapay Zekâ CV Analizörü',
    uploadTitle: 'CV Yükle',
    uploadHint: 'PDF ya da metin dosyasını buraya sürükleyip bırakın veya tıklayıp seçin.',
    uploading: 'Dosya okunuyor…',
    analyzing: 'Gemini ile analiz ediliyor…',
    chooseFile: 'Dosya seç',
    langEn: 'EN',
    langTr: 'TR',
    scoreTitle: 'Genel Puan',
    strengthsTitle: 'Güçlü Yönler',
    weaknessesTitle: 'Zayıf Yönler',
    suggestionsTitle: 'Öneriler',
    missingKeywordsTitle: 'Eksik Anahtar Kelimeler',
    summaryTitle: 'Özet',
    noResultsYet: 'Analizi görmek için bir CV yükleyin.',
    errorTitle: 'Hata',
    tryAgain: 'Lütfen başka bir dosya ile veya daha sonra tekrar deneyin.',
    categoryTitle: 'Kategori Puanları',
    catExperience: 'Deneyim',
    catTechnical: 'Teknik',
    catFormat: 'Format',
    catImpact: 'Etki',
    atsTitle: 'ATS Uyumluluğu',
    historyTitle: 'Analiz Geçmişi',
    historyEmpty: 'Henüz analiz geçmişi yok.',
    historyBtn: 'Geçmiş',
    downloadBtn: 'Rapor İndir',
    close: 'Kapat',
    noKeywords: 'Eksik önemli anahtar kelime bulunamadı.',
    noItems: 'Bu bölüm için içerik dönmedi.',
  },
}

/* ─── SVG Icons ─── */

const svgProps = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '1.5', strokeLinecap: 'round', strokeLinejoin: 'round' }

function IconUpload({ className }) { return <svg className={className} {...svgProps}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg> }
function IconFile({ className }) { return <svg className={className} {...svgProps}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg> }
function IconTarget({ className }) { return <svg className={className} {...svgProps}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg> }
function IconCheck({ className }) { return <svg className={className} {...svgProps} strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg> }
function IconAlert({ className }) { return <svg className={className} {...svgProps} strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg> }
function IconLightbulb({ className }) { return <svg className={className} {...svgProps}><path d="M9 18h6" /><path d="M10 22h4" /><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" /></svg> }
function IconTag({ className }) { return <svg className={className} {...svgProps}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg> }
function IconClipboard({ className }) { return <svg className={className} {...svgProps}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg> }
function IconSparkle({ className }) { return <svg className={className} {...svgProps}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg> }
function IconSun({ className }) { return <svg className={className} {...svgProps}><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg> }
function IconMoon({ className }) { return <svg className={className} {...svgProps}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg> }
function IconClock({ className }) { return <svg className={className} {...svgProps}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> }
function IconDownload({ className }) { return <svg className={className} {...svgProps}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg> }
function IconBarChart({ className }) { return <svg className={className} {...svgProps}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg> }
function IconShield({ className }) { return <svg className={className} {...svgProps}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> }
function IconX({ className }) { return <svg className={className} {...svgProps} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg> }
function IconTrash({ className }) { return <svg className={className} {...svgProps}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg> }

/* ─── Theme helpers ─── */

function getInitialTheme() {
  try { const s = localStorage.getItem(THEME_KEY); if (s === 'dark' || s === 'light') return s } catch {}
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}
function applyTheme(t) { document.documentElement.setAttribute('data-theme', t); try { localStorage.setItem(THEME_KEY, t) } catch {} }

/* ─── History helpers ─── */

function loadHistory() { try { const r = localStorage.getItem(HISTORY_KEY); return r ? JSON.parse(r) : [] } catch { return [] } }
function saveToHistory(entry) { try { const l = loadHistory(); l.unshift(entry); if (l.length > MAX_HISTORY) l.length = MAX_HISTORY; localStorage.setItem(HISTORY_KEY, JSON.stringify(l)) } catch {} }
function clearHistory() { try { localStorage.removeItem(HISTORY_KEY) } catch {} }

/* ─── PDF Report ─── */

function generatePdfReport(result, labels, fileName) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = pdf.internal.pageSize.getWidth()
  const H = pdf.internal.pageSize.getHeight()
  const m = 15
  const cw = W - m * 2
  let y = m

  const checkPage = (need) => { if (y + need > H - m) { pdf.addPage(); y = m } }
  const drawLine = () => { pdf.setDrawColor(200); pdf.line(m, y, W - m, y); y += 4 }

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(20)
  pdf.setTextColor(99, 102, 241)
  pdf.text('CV Analysis Report', m, y + 6)
  y += 12
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10)
  pdf.setTextColor(100)
  pdf.text(`${fileName || 'CV'} — ${new Date().toLocaleDateString()}`, m, y)
  y += 8
  drawLine()

  pdf.setFontSize(36)
  pdf.setFont('helvetica', 'bold')
  const scoreColor = result.overallScore >= 75 ? [16, 185, 129] : result.overallScore >= 50 ? [245, 158, 11] : [239, 68, 68]
  pdf.setTextColor(...scoreColor)
  pdf.text(`${result.overallScore}`, m, y + 10)
  pdf.setFontSize(14)
  pdf.setTextColor(150)
  pdf.text('/ 100', m + pdf.getTextWidth(`${result.overallScore}`) + 2, y + 10)
  pdf.setFontSize(10)
  pdf.setTextColor(100)
  pdf.text(labels.scoreTitle, m, y + 16)
  y += 22

  if (result.categoryScores) {
    const cats = [
      [labels.catExperience, result.categoryScores.experience],
      [labels.catTechnical, result.categoryScores.technical],
      [labels.catFormat, result.categoryScores.format],
      [labels.catImpact, result.categoryScores.impact],
    ]
    cats.forEach(([label, val]) => {
      pdf.setFontSize(9)
      pdf.setTextColor(80)
      pdf.text(`${label}: ${val}/10`, m + 50, y + 3)
      pdf.setFillColor(230, 230, 230)
      pdf.roundedRect(m + 90, y, 60, 4, 2, 2, 'F')
      const c = val >= 7 ? [16, 185, 129] : val >= 5 ? [245, 158, 11] : [239, 68, 68]
      pdf.setFillColor(...c)
      pdf.roundedRect(m + 90, y, 60 * (val / 10), 4, 2, 2, 'F')
      y += 7
    })
    y += 2
  }
  drawLine()

  const addSection = (title, items, color) => {
    checkPage(20)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(12)
    pdf.setTextColor(...color)
    pdf.text(title, m, y + 4)
    y += 8
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.setTextColor(60)
    if (Array.isArray(items)) {
      items.forEach(item => {
        checkPage(8)
        const lines = pdf.splitTextToSize(`• ${item}`, cw - 4)
        pdf.text(lines, m + 2, y + 3)
        y += lines.length * 4 + 2
      })
    }
    y += 3
  }

  addSection(labels.strengthsTitle, result.strengths, [16, 185, 129])
  addSection(labels.weaknessesTitle, result.weaknesses, [239, 68, 68])
  addSection(labels.suggestionsTitle, result.suggestions, [59, 130, 246])

  if (result.atsCompatibility) {
    checkPage(20)
    drawLine()
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(12)
    pdf.setTextColor(245, 158, 11)
    pdf.text(`${labels.atsTitle}: ${result.atsCompatibility.score}/100`, m, y + 4)
    y += 8
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.setTextColor(60)
    if (Array.isArray(result.atsCompatibility.tips)) {
      result.atsCompatibility.tips.forEach(tip => {
        checkPage(8)
        const lines = pdf.splitTextToSize(`• ${tip}`, cw - 4)
        pdf.text(lines, m + 2, y + 3)
        y += lines.length * 4 + 2
      })
    }
    y += 3
  }

  if (result.missingKeywords?.length) {
    checkPage(15)
    drawLine()
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(12)
    pdf.setTextColor(80)
    pdf.text(labels.missingKeywordsTitle, m, y + 4)
    y += 8
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.setTextColor(60)
    const kwText = result.missingKeywords.join(', ')
    const kwLines = pdf.splitTextToSize(kwText, cw - 4)
    pdf.text(kwLines, m + 2, y + 3)
    y += kwLines.length * 4 + 5
  }

  checkPage(20)
  drawLine()
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(12)
  pdf.setTextColor(80)
  pdf.text(labels.summaryTitle, m, y + 4)
  y += 8
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.setTextColor(60)
  const sumLines = pdf.splitTextToSize(result.summary, cw - 4)
  checkPage(sumLines.length * 4 + 5)
  pdf.text(sumLines, m + 2, y + 3)

  pdf.save(`cv-analysis-${Date.now()}.pdf`)
}

/* ─── App ─── */

function App() {
  const [language, setLanguage] = useState('en')
  const t = useMemo(() => LANG[language], [language])

  const [cvText, setCvText] = useState('')
  const [fileName, setFileName] = useState('')
  const [result, setResult] = useState(null)
  const [isReading, setIsReading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  const [theme, setTheme] = useState(getInitialTheme)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState(loadHistory)

  useEffect(() => { applyTheme(theme) }, [theme])

  const toggleTheme = () => setTheme(p => p === 'dark' ? 'light' : 'dark')

  const handleLanguageToggle = async (nextLang) => {
    if (nextLang === language) return
    setLanguage(nextLang)
    if (cvText && result) {
      const saved = {
        overallScore: result.overallScore,
        categoryScores: result.categoryScores,
        atsScore: result.atsCompatibility?.score,
      }
      setIsAnalyzing(true)
      setError(null)
      try {
        const analysis = await analyzeWithGemini(cvText, nextLang)
        analysis.overallScore = saved.overallScore
        if (saved.categoryScores) analysis.categoryScores = saved.categoryScores
        if (saved.atsScore != null && analysis.atsCompatibility) analysis.atsCompatibility.score = saved.atsScore
        setResult(analysis)
      } catch (e) {
        console.error(e)
        setError(e.message || 'Unknown error')
      } finally {
        setIsAnalyzing(false)
      }
    }
  }

  const readPdfFile = useCallback(async (file) => {
    const buffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
    let fullText = ''
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p)
      const content = await page.getTextContent()
      fullText += '\n\n' + content.items.map(i => ('str' in i ? i.str : '')).join(' ')
    }
    return fullText.trim()
  }, [])

  const readPlainTextFile = useCallback(async (file) => (await file.text()).trim(), [])

  const handleFile = useCallback(async (file) => {
    setError(null); setResult(null); setCvText(''); setFileName(file?.name || '')
    if (!file) return
    setIsReading(true)
    try {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      const text = isPdf ? await readPdfFile(file) : await readPlainTextFile(file)
      setCvText(text); setIsReading(false)
      if (!text) throw new Error('Empty CV content')
      setIsAnalyzing(true)
      const analysis = await analyzeWithGemini(text, language)
      setResult(analysis)
      saveToHistory({ id: Date.now().toString(), date: new Date().toISOString(), fileName: file.name, language, overallScore: analysis.overallScore, result: analysis, cvText: text })
      setHistory(loadHistory())
    } catch (e) { console.error(e); setError(e.message || 'Unknown error') }
    finally { setIsReading(false); setIsAnalyzing(false) }
  }, [language, readPdfFile, readPlainTextFile])

  const onFileInputChange = (e) => { const f = e.target.files?.[0]; if (f) void handleFile(f) }
  const onDrop = (e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) void handleFile(f) }
  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
  const onDragLeave = () => setIsDragging(false)

  const handleLoadHistoryItem = (item) => {
    setResult(item.result); setCvText(item.cvText || ''); setFileName(item.fileName || ''); setShowHistory(false)
  }

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="header-inner">
          <div className="header-brand">
            <div className="header-logo"><IconSparkle /></div>
            <h1>{t.appTitle}</h1>
          </div>
          <div className="header-actions">
            <button type="button" className="icon-btn" onClick={() => { setShowHistory(true); setHistory(loadHistory()) }} title={t.historyBtn}><IconClock /></button>
            <button type="button" className="icon-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Light' : 'Dark'}>{theme === 'dark' ? <IconSun /> : <IconMoon />}</button>
            <div className="language-pill">
              <button type="button" className={language === 'en' ? 'lang-btn active' : 'lang-btn'} onClick={() => handleLanguageToggle('en')}>{t.langEn}</button>
              <button type="button" className={language === 'tr' ? 'lang-btn active' : 'lang-btn'} onClick={() => handleLanguageToggle('tr')}>{t.langTr}</button>
            </div>
          </div>
        </div>
      </header>

      <main className="app-main">
        <section className="left-column">
          <div className={`upload-card${isDragging ? ' dragging' : ''}`} onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}>
            <div className="upload-icon"><IconUpload /></div>
            <h2>{t.uploadTitle}</h2>
            <p className="upload-hint">{t.uploadHint}</p>
            <label className="file-input-label">
              <IconFile /><span>{t.chooseFile}</span>
              <input type="file" accept=".pdf,.txt,.md,.rtf,.docx,text/plain,application/pdf" onChange={onFileInputChange} />
            </label>
            {(isReading || isAnalyzing) && <div className="upload-status"><div className="spinner" /><span>{isReading ? t.uploading : t.analyzing}</span></div>}
            {error && <div className="error-badge"><span className="badge-title">{t.errorTitle}:</span><span className="badge-text">{error}. {t.tryAgain}</span></div>}
          </div>
        </section>

        <section className="right-column">
          {result ? (
            <ResultsDashboard language={language} labels={t} result={result} fileName={fileName} />
          ) : (
            <div className="empty-state"><div className="empty-icon"><IconTarget /></div><p>{t.noResultsYet}</p></div>
          )}
        </section>
      </main>

      {showHistory && <HistoryModal labels={t} history={history} onClose={() => setShowHistory(false)} onLoad={handleLoadHistoryItem} onClear={() => { clearHistory(); setHistory([]) }} />}
    </div>
  )
}

/* ─── Results Dashboard ─── */

function ResultsDashboard({ language, labels, result, fileName }) {
  const score = result.overallScore ?? 0
  return (
    <>
      <div className="results-grid">
        {/* Row 1: Score + Categories */}
        <div className="top-row">
          <div className="card score-card">
            <h2><IconTarget className="card-icon" />{labels.scoreTitle}</h2>
            <ScoreCircle score={score} />
          </div>
          {result.categoryScores && (
            <div className="card category-card">
              <h2><IconBarChart className="card-icon" />{labels.categoryTitle}</h2>
              <CategoryBars scores={result.categoryScores} labels={labels} />
            </div>
          )}
        </div>

        {/* Row 2: Strengths + Weaknesses */}
        <div className="two-col-row">
          <div className="card strengths-card">
            <SectionList title={labels.strengthsTitle} items={result.strengths} variant="green" language={language} icon={<IconCheck className="card-icon" />} />
          </div>
          <div className="card weaknesses-card">
            <SectionList title={labels.weaknessesTitle} items={result.weaknesses} variant="red" language={language} icon={<IconAlert className="card-icon" />} />
          </div>
        </div>

        {/* Row 3: Suggestions + ATS */}
        <div className="two-col-row">
          <div className="card suggestions-card">
            <SectionList title={labels.suggestionsTitle} items={result.suggestions} variant="blue" language={language} icon={<IconLightbulb className="card-icon" />} />
          </div>
          {result.atsCompatibility && (
            <div className="card ats-card">
              <h2><IconShield className="card-icon" />{labels.atsTitle}</h2>
              <div className="ats-score-row">
                <span className="ats-score-value">{result.atsCompatibility.score}</span>
                <span className="ats-score-max">/ 100</span>
              </div>
              {result.atsCompatibility.tips?.length > 0 && (
                <ul className="ats-tips-list">{result.atsCompatibility.tips.map((tip, i) => <li key={i}>{tip}</li>)}</ul>
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="card tags-card">
          <h2><IconTag className="card-icon" />{labels.missingKeywordsTitle}</h2>
          <div className="tags">
            {result.missingKeywords?.length > 0
              ? result.missingKeywords.map(tag => <span key={tag} className="tag">{tag}</span>)
              : <span className="placeholder-text">{labels.noKeywords}</span>}
          </div>
        </div>

        {/* Summary */}
        <div className="card summary-card">
          <h2><IconClipboard className="card-icon" />{labels.summaryTitle}</h2>
          <p className="summary-text">{result.summary}</p>
        </div>
      </div>

      <button type="button" className="download-btn" onClick={() => generatePdfReport(result, labels, fileName)}>
        <IconDownload className="card-icon" />{labels.downloadBtn}
      </button>
    </>
  )
}

/* ─── Category Bars ─── */

function CategoryBars({ scores, labels }) {
  const cats = [
    { key: 'experience', label: labels.catExperience },
    { key: 'technical', label: labels.catTechnical },
    { key: 'format', label: labels.catFormat },
    { key: 'impact', label: labels.catImpact },
  ]
  return (
    <div className="cat-bars">
      {cats.map(({ key, label }) => {
        const v = Math.max(0, Math.min(10, Number(scores[key]) || 0))
        const cls = v >= 7 ? 'bar-high' : v >= 5 ? 'bar-medium' : 'bar-low'
        return (
          <div key={key} className="cat-bar-row">
            <span className="cat-bar-label">{label}</span>
            <div className="cat-bar-track"><div className={`cat-bar-fill ${cls}`} style={{ width: `${v * 10}%` }} /></div>
            <span className="cat-bar-value">{v}</span>
          </div>
        )
      })}
    </div>
  )
}

/* ─── History Modal ─── */

function HistoryModal({ labels, history, onClose, onLoad, onClear }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2><IconClock className="card-icon" /> {labels.historyTitle}</h2>
          <button type="button" className="icon-btn" onClick={onClose}><IconX /></button>
        </div>
        <div className="modal-body">
          {history.length === 0 ? <p className="placeholder-text">{labels.historyEmpty}</p> : (
            <ul className="history-list">
              {history.map(item => (
                <li key={item.id} className="history-item" onClick={() => onLoad(item)}>
                  <div className="history-item-info">
                    <span className="history-file">{item.fileName}</span>
                    <span className="history-date">{new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <span className="history-score">{item.overallScore}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {history.length > 0 && <div className="modal-footer"><button type="button" className="clear-history-btn" onClick={onClear}><IconTrash className="card-icon" /></button></div>}
      </div>
    </div>
  )
}

/* ─── Shared Components ─── */

function SectionList({ title, items, variant, language, icon }) {
  const t = useMemo(() => LANG[language], [language])
  const empty = !Array.isArray(items) || items.length === 0
  return (
    <div className={`section-list section-${variant}`}>
      <div className="section-header"><h2>{icon}{title}</h2></div>
      {empty ? <p className="placeholder-text">{t.noItems}</p> : <ul>{items.map((item, i) => <li key={i}>{item}</li>)}</ul>}
    </div>
  )
}

function ScoreCircle({ score }) {
  const s = typeof score === 'number' ? Math.max(0, Math.min(100, score)) : 0
  const r = 26, c = 2 * Math.PI * r, o = c - (s / 100) * c
  const cls = s >= 75 ? 'score-high' : s >= 50 ? 'score-medium' : 'score-low'
  return (
    <div className="score-circle-wrapper">
      <svg className="score-svg" viewBox="0 0 64 64">
        <circle className="score-track" cx="32" cy="32" r={r} />
        <circle className={`score-progress ${cls}`} cx="32" cy="32" r={r} strokeDasharray={c} strokeDashoffset={o} />
      </svg>
      <div className="score-number"><span>{s}</span><span className="score-max">/ 100</span></div>
    </div>
  )
}

/* ─── Gemini API ─── */

async function analyzeWithGemini(cvText, language) {
  const isTr = language === 'tr'

  const sysInstr = isTr
    ? 'Sen deneyimli bir insan kaynakları uzmanı ve kariyer koçusun. Sana bir CV metni verilecek. Bu CV\'yi modern yazılım ve teknoloji sektörü standartlarına göre değerlendir; yapıcı, net ve öz ol.'
    : 'You are an experienced HR specialist and career coach. You will receive a CV/resume text. Evaluate this CV according to modern software and technology industry standards; be constructive, clear, and concise.'

  const shape = isTr
    ? `Sadece AŞAĞIDAKİ JSON nesnesini döndür. Açıklama metni, markdown veya kod bloğu ekleme:
{
  "overallScore": number (0-100),
  "strengths": string[],
  "weaknesses": string[],
  "suggestions": string[],
  "missingKeywords": string[],
  "summary": string,
  "categoryScores": { "experience": number (0-10), "technical": number (0-10), "format": number (0-10), "impact": number (0-10) },
  "atsCompatibility": { "score": number (0-100), "tips": string[] }
}
TÜM yanıt TÜRKÇE olmalıdır. JSON dışında hiçbir şey yazma.`
    : `Return ONLY the JSON object below. No explanation, markdown, or code fences:
{
  "overallScore": number (0-100),
  "strengths": string[],
  "weaknesses": string[],
  "suggestions": string[],
  "missingKeywords": string[],
  "summary": string,
  "categoryScores": { "experience": number (0-10), "technical": number (0-10), "format": number (0-10), "impact": number (0-10) },
  "atsCompatibility": { "score": number (0-100), "tips": string[] }
}
Output ONLY raw JSON in ENGLISH.`

  const prompt = `${sysInstr}\n\nCV:\n"""${cvText}"""\n\n${shape}`

  const localKey = import.meta.env.VITE_GEMINI_API_KEY
  const localModel = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash'

  const res = localKey
    ? await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${localModel}:generateContent?key=${localKey}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) },
      )
    : await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

  if (!res.ok) {
    const s = res.status
    if (s === 503 || s === 500) throw new Error(isTr ? 'Sunucu hatası, lütfen tekrar deneyin.' : 'Server error, please try again.')
    if (s === 429) throw new Error(isTr ? 'Çok fazla istek, lütfen bekleyin.' : 'Too many requests, please wait.')
    throw new Error(isTr ? `API hatası (${s})` : `API error (${s})`)
  }

  const data = await res.json()
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  if (!raw) throw new Error('Empty response')

  let parsed
  try { parsed = JSON.parse(raw.replace(/```json/gi, '').replace(/```/g, '').trim()) }
  catch { console.error('Parse error:', raw); throw new Error('Could not parse response') }

  const out = {
    overallScore: Number(parsed.overallScore) || 0,
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords : [],
    summary: String(parsed.summary || ''),
    categoryScores: parsed.categoryScores ? {
      experience: Number(parsed.categoryScores.experience) || 0,
      technical: Number(parsed.categoryScores.technical) || 0,
      format: Number(parsed.categoryScores.format) || 0,
      impact: Number(parsed.categoryScores.impact) || 0,
    } : null,
    atsCompatibility: parsed.atsCompatibility ? {
      score: Number(parsed.atsCompatibility.score) || 0,
      tips: Array.isArray(parsed.atsCompatibility.tips) ? parsed.atsCompatibility.tips : [],
    } : null,
  }
  return out
}

export default App
