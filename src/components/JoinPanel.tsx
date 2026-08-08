import { Copy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const GROUP_NUMBER = '723526608'

type CopyStatus = 'idle' | 'pending' | 'success' | 'manual'

const assetUrl = (asset: string) => {
  const baseUrl = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`
  return `${baseUrl}${asset.replace(/^\/+/, '')}`
}

export function JoinPanel() {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle')
  const [showQr, setShowQr] = useState(true)
  const groupNumberRef = useRef<HTMLSpanElement>(null)
  const mountedRef = useRef(true)
  const requestIdRef = useRef(0)
  const copyingRef = useRef(false)

  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
      requestIdRef.current += 1
    }
  }, [])

  const selectGroupNumber = () => {
    try {
      const groupNumber = groupNumberRef.current
      const selection = window.getSelection?.()
      if (!groupNumber || !selection) {
        return
      }

      const range = document.createRange()
      range.selectNodeContents(groupNumber)
      selection.removeAllRanges()
      selection.addRange(range)
    } catch {
      return
    }
  }

  const copyGroupNumber = async () => {
    if (copyingRef.current) {
      return
    }

    copyingRef.current = true
    const requestId = ++requestIdRef.current
    setCopyStatus('pending')

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable')
      }
      await navigator.clipboard.writeText(GROUP_NUMBER)
      if (mountedRef.current && requestId === requestIdRef.current) {
        setCopyStatus('success')
      }
    } catch {
      selectGroupNumber()
      if (mountedRef.current && requestId === requestIdRef.current) {
        setCopyStatus('manual')
      }
    } finally {
      if (requestId === requestIdRef.current) {
        copyingRef.current = false
      }
    }
  }

  return (
    <section className="join-panel" aria-labelledby="join-panel-title">
      <div className="join-panel__copy">
        <p className="section-kicker">招新入口</p>
        <h2 id="join-panel-title">加入新生专题科普活动群</h2>
        <p>扫描二维码或复制 QQ 群号，获取活动信息。</p>
        <div className="group-number-row">
          <span className="group-number-label">QQ群</span>
          <span className="group-number" ref={groupNumberRef}>
            {GROUP_NUMBER}
          </span>
          <button
            className="button button--primary button--with-icon"
            disabled={copyStatus === 'pending'}
            onClick={copyGroupNumber}
            type="button"
          >
            <Copy aria-hidden="true" size={18} strokeWidth={2} />
            {copyStatus === 'pending' ? '正在复制群号' : '复制群号'}
          </button>
        </div>
        <p className="copy-status" role="status" aria-live="polite">
          {copyStatus === 'success' && '群号已复制'}
          {copyStatus === 'manual' && '请手动复制群号'}
          {copyStatus === 'pending' && '正在复制群号'}
        </p>
      </div>

      {showQr && (
        <div className="join-panel__qr">
          <img
            alt="招新 QQ 群二维码"
            height="420"
            onError={() => setShowQr(false)}
            src={assetUrl('recruitment-qq-qr.png')}
            width="420"
          />
        </div>
      )}
    </section>
  )
}
