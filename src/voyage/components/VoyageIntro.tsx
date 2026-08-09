import { ArrowRight, Compass, Orbit } from 'lucide-react'
import { useState } from 'react'
import { CinematicBackdrop } from './CinematicBackdrop'
import { ExplorerCharacter } from './ExplorerCharacter'
import { VoyageMascot } from './VoyageMascot'

interface VoyageIntroProps {
  onStart: () => void
  onPeek: () => void
}

export function VoyageIntro({ onStart, onPeek }: VoyageIntroProps) {
  const [launched, setLaunched] = useState(false)
  const launch = () => {
    setLaunched(true)
    window.setTimeout(onStart, 620)
  }

  return (
    <main className={`new-voyage-intro ${launched ? 'is-launched' : ''}`}>
      <CinematicBackdrop
        alt="深空中的蓝色星球与远处光带"
        desktopVideoSrc="/media/night-voyage/intro-earth-desktop.mp4"
        focalPoint="68% 50%"
        mobilePosterSrc="/media/night-voyage/intro-earth.webp"
        mobileVideoSrc="/media/night-voyage/intro-earth-mobile.mp4"
        posterSrc="/media/night-voyage/intro-earth.webp"
      />
      <div className="new-voyage-intro__grain" aria-hidden="true" />
      <header className="voyage-topbar">
        <span className="voyage-mark"><Orbit aria-hidden="true" size={17} /> CYIS / 2026</span>
        <span className="voyage-topbar__status"><i /> SIGNAL STANDBY</span>
      </header>
      <section className="new-voyage-intro__copy">
        <p className="voyage-eyebrow">NEW STUDENT FLIGHT LOG / 00</p>
        <h1>科创夜航</h1>
        <p className="new-voyage-intro__lead">先不用懂科创。用几分钟，看看你会怎样发现问题、尝试、协作、推进和表达。</p>
        <div className="new-voyage-intro__actions">
          <button className="voyage-cta voyage-cta--primary" disabled={launched} onClick={launch} type="button">
            <Compass aria-hidden="true" size={18} />
            <span>{launched ? '信号接入中' : '启动一次试航'}</span>
            <ArrowRight aria-hidden="true" size={17} />
          </button>
          <button className="voyage-cta voyage-cta--ghost" onClick={onPeek} type="button">我先看看</button>
        </div>
        <div className="new-voyage-intro__promise">
          <span>≈ 2 MIN</span><span>NO WRONG ANSWERS</span><span>ANY DEPARTMENT, FREE TO EXPLORE</span>
        </div>
      </section>
      <aside className="new-voyage-intro__companion" aria-label="科创夜航向导">
        <VoyageMascot compact dialogue={launched ? '信号收到，准备起航。' : '先试一小步，不用提前会。'} state={launched ? 'react' : 'guide'} />
        <ExplorerCharacter className="new-voyage-intro__explorer" decorative={false} pose={launched ? 'enter' : 'idle'} />
      </aside>
      <footer className="new-voyage-intro__footer"><span>成都理工大学青年科技创新服务中心</span><span>SCROLL TO DISCOVER ↓</span></footer>
    </main>
  )
}
