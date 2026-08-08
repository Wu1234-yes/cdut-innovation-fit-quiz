const stars = [
  [7, 14, 2], [13, 32, 1], [18, 8, 1], [24, 23, 2], [31, 12, 1],
  [38, 35, 1], [43, 7, 2], [49, 21, 1], [56, 12, 1], [62, 31, 2],
  [68, 8, 1], [74, 19, 2], [81, 11, 1], [87, 29, 1], [93, 16, 2],
  [11, 55, 1], [21, 47, 2], [34, 59, 1], [46, 48, 1], [58, 62, 2],
  [72, 52, 1], [85, 61, 2], [96, 46, 1],
] as const

export function NightSkyFallback() {
  return (
    <div aria-hidden="true" className="night-sky-fallback">
      <div className="night-sky-stars">
        {stars.map(([left, top, size], index) => (
          <i
            className={`night-star night-star--${size}`}
            key={`${left}-${top}-${index}`}
            style={{ left: `${left}%`, top: `${top}%` }}
          />
        ))}
      </div>
      <div className="night-orbit night-orbit--outer" />
      <div className="night-orbit night-orbit--inner" />
      <div className="night-planet">
        <span className="night-planet__mark night-planet__mark--one" />
        <span className="night-planet__mark night-planet__mark--two" />
      </div>
      <div className="campus-silhouette">
        <span className="campus-building campus-building--left" />
        <span className="campus-building campus-building--center" />
        <span className="campus-building campus-building--right" />
      </div>
    </div>
  )
}
