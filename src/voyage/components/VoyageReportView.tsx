import { ArrowRight, Compass, Eye, FolderOpen, LockKeyhole, Sparkles } from 'lucide-react'
import type { DepartmentId } from '../content/types'
import { cinematicAssets } from '../content/cinematicAssets'
import type { VoyageReport } from '../result/buildVoyageReport'
import { signalPoints } from '../result/reportVisuals'
import { CinematicBackdrop } from './CinematicBackdrop'

interface VoyageReportViewProps { report: VoyageReport; onAtlas: () => void; onDepartment: (id: DepartmentId) => void; onEgg: () => void; onReset: () => void }

export function VoyageReportView({ report, onAtlas, onDepartment, onEgg, onReset }: VoyageReportViewProps) {
  const points = signalPoints(report.dimensions)
  const reportTitle = report.title.includes('正在靠近')
    ? [report.title.replace('正在靠近', ''), '正在靠近']
    : ['一束待显影的', '行动信号']
  return (
    <main className="voyage-report">
      <section className="voyage-report__cinematic">
        <CinematicBackdrop alt="报告中的云端协作观测站" desktopVideoSrc={cinematicAssets.reportBackground.desktopVideo} mobileVideoSrc={cinematicAssets.reportBackground.mobileVideo} posterSrc={cinematicAssets.reportBackground.poster} />
        <header className="voyage-topbar voyage-report__topbar"><span className="voyage-mark"><Sparkles size={17} /> VOYAGE REPORT / 06</span><button className="voyage-quiet-link" onClick={onReset} type="button">重新试航</button></header>
        <section className="voyage-report__hero"><div><p className="voyage-eyebrow">你的行动信号</p><h1><span>{reportTitle[0]}</span><span>{reportTitle[1]}</span></h1><p className="voyage-report__subtitle">{report.subtitle}</p><div className="voyage-report__hero-actions"><button className="voyage-cta voyage-cta--primary" onClick={onAtlas} type="button"><Compass size={18} /><span>查看七部门图鉴</span><ArrowRight size={17} /></button><button className="voyage-cta voyage-cta--ghost" onClick={onEgg} type="button"><Eye size={17} /><span>回看一束隐藏信号</span></button></div></div><div className="action-star-map"><svg aria-label="五维行动信号星图" role="img" viewBox="0 0 360 360"><defs><filter id="report-glow"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>{[1, .75, .5, .25].map((scale) => <polygon fill="none" key={scale} points={report.dimensions.map((_, index) => { const angle = -Math.PI / 2 + index * ((Math.PI * 2) / report.dimensions.length); return `${180 + Math.cos(angle) * 132 * scale},${180 + Math.sin(angle) * 132 * scale}` }).join(' ')} />)}{report.dimensions.map((item, index) => { const angle = -Math.PI / 2 + index * ((Math.PI * 2) / report.dimensions.length); return <line key={item.id} x1="180" x2={180 + Math.cos(angle) * 132} y1="180" y2={180 + Math.sin(angle) * 132} /> })}<polygon className="action-star-map__signal" filter="url(#report-glow)" points={points} />{report.dimensions.map((item, index) => { const angle = -Math.PI / 2 + index * ((Math.PI * 2) / report.dimensions.length); return <text key={item.id} x={180 + Math.cos(angle) * 154} y={184 + Math.sin(angle) * 154}>{item.label}</text> })}<circle className="action-star-map__core" cx="180" cy="180" r="8" /></svg><span className="action-star-map__caption">五站行动轨迹 / SIGNAL CONSTELLATION</span></div></section>
      </section>
      <section className="voyage-report__body"><div className="voyage-report__statement"><p className="voyage-eyebrow">SIGNAL READOUT</p><h2>{report.coreStrength}</h2><p>{report.nextStep}</p></div><div className="voyage-report__dimensions">{report.dimensions.map((item) => <article key={item.id}><div><span>{item.label}</span><strong>{item.score === null ? '—' : `${item.score}%`}</strong></div><div className="signal-meter"><i style={{ width: `${item.score ?? 8}%` }} /></div><p>{item.evidence}</p></article>)}</div></section>
      <section className="voyage-report__directions"><div className="voyage-report__section-heading"><p className="voyage-eyebrow">OPEN ROUTES / 02</p><h2>接下来，可以沿哪束光继续？</h2><span>这里不是分流判定，只是给你两扇值得推开的门。</span></div><div className="voyage-report__route-list">{report.directions.map((direction, index) => <button className="route-signal" key={direction.departmentId} onClick={() => onDepartment(direction.departmentId)} type="button"><span>0{index + 1}</span><strong>{direction.departmentId === 'publicity' ? '宣传部' : direction.departmentId === 'language' ? '语培部' : direction.departmentId === 'project' ? '项目部' : direction.departmentId === 'science' ? '科素部' : direction.departmentId === 'training' ? '赛训部' : direction.departmentId === 'competition' ? '竞赛部' : '办公室'}</strong><p>{direction.reason}</p><ArrowRight size={18} /></button>)}</div></section>
      <footer className="voyage-report__footer"><button className="voyage-quiet-link" onClick={onAtlas} type="button"><FolderOpen size={17} /> 查看全部七个部门</button><span><LockKeyhole size={14} /> 这份报告只记录一次试航，不定义你</span></footer>
    </main>
  )
}
