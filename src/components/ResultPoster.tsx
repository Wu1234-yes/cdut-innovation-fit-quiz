import { Download } from 'lucide-react'
import { useState } from 'react'
import type { Department, ScoreMap } from '../content/types'
import {
  createResultPoster,
  type ResultPosterData,
} from '../lib/createResultPoster'

interface ResultPosterProps {
  department: Department
  dimensions: ScoreMap
  profile: string
  score: number
  generator?: (data: ResultPosterData) => Promise<Blob>
}

export function ResultPoster({
  department,
  dimensions,
  profile,
  score,
  generator = createResultPoster,
}: ResultPosterProps) {
  const [status, setStatus] = useState<'idle' | 'working' | 'error'>('idle')

  const download = async () => {
    if (status === 'working') {
      return
    }

    setStatus('working')
    try {
      const blob = await generator({ department, dimensions, profile, score })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `科创部门适配结果-${department.name}.png`
      anchor.click()
      URL.revokeObjectURL(url)
      setStatus('idle')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="result-poster" aria-labelledby="result-poster-title">
      <div>
        <p className="section-kicker">保存结果</p>
        <h2 id="result-poster-title">生成你的科创画像海报</h2>
        <p>带走本次画像、首选部门与四维坐标，方便保存或分享。</p>
      </div>
      <div>
        <button
          aria-label={status === 'working' ? '正在生成结果海报' : '生成结果海报'}
          className="button button--accent button--with-icon"
          disabled={status === 'working'}
          onClick={download}
          type="button"
        >
          <Download aria-hidden="true" size={18} />
          {status === 'working' ? '正在生成' : '生成结果海报'}
        </button>
        <p aria-live="polite" className="result-poster__status">
          {status === 'error' ? '海报生成失败，请重试' : ''}
        </p>
      </div>
    </section>
  )
}
