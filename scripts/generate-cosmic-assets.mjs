import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = process.cwd()
const environmentDir = path.join(root, 'public', 'environments')
const explorerDir = path.join(root, 'public', 'explorer')

await fs.mkdir(environmentDir, { recursive: true })
await fs.mkdir(explorerDir, { recursive: true })

const palettes = {
  intro: ['#060814', '#101b3d', '#6ce8ff', '#f6c86a'],
  hub: ['#030817', '#0a2231', '#4be4f4', '#f6c86a'],
  observation: ['#03040b', '#111a2e', '#60d8ff', '#9e79ff'],
  clues: ['#040713', '#132b39', '#5bf3df', '#ffcf6a'],
  dialogue: ['#03050d', '#17223e', '#80a8ff', '#e9efff'],
  map: ['#040613', '#171c45', '#6bd8ff', '#ff9b67'],
  expression: ['#020711', '#092a38', '#61eddf', '#ffcf6a'],
  result: ['#03040e', '#141d3b', '#7be7ff', '#d5a8ff'],
  atlas: ['#02050d', '#102134', '#67e9ef', '#ffd36f'],
}

const seeded = (seed) => {
  let value = seed >>> 0
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 4294967296
  }
}

function starField(width, height, seed, count) {
  const random = seeded(seed)
  return Array.from({ length: count }, () => {
    const x = Math.round(random() * width)
    const y = Math.round(random() * height)
    const radius = (0.35 + random() * 1.65).toFixed(2)
    const opacity = (0.18 + random() * 0.72).toFixed(2)
    return `<circle cx="${x}" cy="${y}" r="${radius}" fill="#dffcff" opacity="${opacity}"/>`
  }).join('')
}

function defs(id, colors) {
  return `<defs>
    <radialGradient id="bg-${id}" cx="54%" cy="36%" r="82%">
      <stop offset="0" stop-color="${colors[1]}"/>
      <stop offset="0.58" stop-color="${colors[0]}"/>
      <stop offset="1" stop-color="#010207"/>
    </radialGradient>
    <radialGradient id="glow-${id}"><stop stop-color="${colors[2]}" stop-opacity=".9"/><stop offset=".46" stop-color="${colors[2]}" stop-opacity=".18"/><stop offset="1" stop-color="${colors[2]}" stop-opacity="0"/></radialGradient>
    <linearGradient id="metal-${id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#152f42"/><stop offset=".48" stop-color="#07111e"/><stop offset="1" stop-color="#294d5f"/></linearGradient>
    <linearGradient id="beam-${id}" x1="0" y1="0" x2="1" y2="0"><stop stop-color="${colors[2]}" stop-opacity="0"/><stop offset=".5" stop-color="${colors[2]}" stop-opacity=".75"/><stop offset="1" stop-color="${colors[2]}" stop-opacity="0"/></linearGradient>
    <filter id="blur-${id}"><feGaussianBlur stdDeviation="18"/></filter>
    <filter id="soft-${id}"><feGaussianBlur stdDeviation="5"/></filter>
  </defs>`
}

function worldMarkup(id, width, height, mobile) {
  const colors = palettes[id]
  const cx = mobile ? width * 0.55 : width * 0.68
  const cy = mobile ? height * 0.36 : height * 0.48
  const unit = Math.min(width, height)
  const stars = starField(width, height, id.length * 917 + (mobile ? 37 : 11), mobile ? 150 : 240)
  const base = `<rect width="${width}" height="${height}" fill="url(#bg-${id})"/><g>${stars}</g><ellipse cx="${width * .54}" cy="${height * .52}" rx="${width * .54}" ry="${height * .48}" fill="none" stroke="${colors[2]}" stroke-opacity=".08"/>`

  const scenes = {
    intro: `<g transform="translate(${cx} ${cy})">
      <ellipse rx="${unit * .34}" ry="${unit * .34}" fill="url(#glow-${id})" filter="url(#blur-${id})"/>
      <ellipse rx="${unit * .235}" ry="${unit * .31}" fill="#02050b" stroke="${colors[2]}" stroke-width="3"/>
      <ellipse rx="${unit * .285}" ry="${unit * .36}" fill="none" stroke="${colors[2]}" stroke-opacity=".42" stroke-width="2" stroke-dasharray="4 14"/>
      <ellipse rx="${unit * .34}" ry="${unit * .405}" fill="none" stroke="${colors[3]}" stroke-opacity=".18"/>
      <path d="M-${unit*.18} 0 C-${unit*.08} -${unit*.16} ${unit*.08} -${unit*.16} ${unit*.18} 0 C${unit*.08} ${unit*.2} -${unit*.08} ${unit*.2} -${unit*.18} 0Z" fill="${colors[2]}" opacity=".18" filter="url(#soft-${id})"/>
      <circle r="${unit*.095}" fill="#0e2036" stroke="${colors[3]}" stroke-opacity=".62"/>
      <path d="M-${unit*.09} 0 Q0 -${unit*.07} ${unit*.09} 0 Q0 ${unit*.08} -${unit*.09} 0" fill="${colors[2]}" opacity=".55"/>
    </g>
    <path d="M0 ${height*.88} Q${width*.38} ${height*.74} ${width} ${height*.86}V${height}H0Z" fill="#02040a"/><path d="M0 ${height*.88} Q${width*.38} ${height*.74} ${width} ${height*.86}" fill="none" stroke="${colors[2]}" stroke-opacity=".26"/>`,
    hub: `<g transform="translate(${width*.58} ${height*.58})">
      <ellipse rx="${unit*.46}" ry="${unit*.13}" fill="url(#glow-${id})" opacity=".55"/>
      <path d="M-${unit*.43} 0 L-${unit*.22} -${unit*.13} L${unit*.24} -${unit*.13} L${unit*.46} 0 L${unit*.29} ${unit*.12} L-${unit*.29} ${unit*.12}Z" fill="url(#metal-${id})" stroke="${colors[2]}" stroke-opacity=".3"/>
      <ellipse rx="${unit*.15}" ry="${unit*.07}" fill="#050a10" stroke="${colors[3]}" stroke-opacity=".65"/>
      <path d="M-${unit*.12} -${unit*.04}L0 -${unit*.21}L${unit*.12} -${unit*.04}" fill="none" stroke="${colors[2]}" stroke-width="3"/>
      ${[-.34,-.17,.17,.34].map((v,i)=>`<g transform="translate(${unit*v} ${i%2?-unit*.04:unit*.035})"><circle r="${unit*.035}" fill="#07131e" stroke="${i===2?colors[3]:colors[2]}"/><circle r="${unit*.018}" fill="${i===2?colors[3]:colors[2]}" opacity=".65"/></g>`).join('')}
    </g>
    <path d="M${width*.05} ${height*.8}L${width*.38} ${height*.66}L${width*.94} ${height*.78}" fill="none" stroke="${colors[2]}" stroke-opacity=".14"/>`,
    observation: `<g transform="translate(${width*.56} ${height*.58})"><circle r="${unit*.39}" fill="#070a16" stroke="#24324a"/><path d="M-${unit*.34} ${unit*.04}Q-${unit*.08} -${unit*.24} ${unit*.3} -${unit*.1}Q${unit*.18} ${unit*.22} -${unit*.34} ${unit*.3}Z" fill="#10172c"/><g opacity=".7">${Array.from({length:18},(_,i)=>`<circle cx="${(i%6-2.5)*unit*.09}" cy="${(Math.floor(i/6)-1)*unit*.11}" r="${unit*(.012+(i%3)*.008)}" fill="#02040b" stroke="#29344e"/>`).join('')}</g><path d="M-${unit*.38} -${unit*.32}L${unit*.05} ${unit*.12}" stroke="${colors[2]}" stroke-width="6" opacity=".3"/><path d="M-${unit*.38} -${unit*.32}L${unit*.05} ${unit*.12}" stroke="white" stroke-width="1" opacity=".65"/></g><circle cx="${width*.8}" cy="${height*.22}" r="${unit*.055}" fill="${colors[3]}" opacity=".65" filter="url(#soft-${id})"/>`,
    clues: `<g transform="translate(${cx} ${cy})"><circle r="${unit*.28}" fill="url(#glow-${id})" filter="url(#blur-${id})"/><circle r="${unit*.105}" fill="#071522" stroke="${colors[2]}" stroke-width="3"/><circle r="${unit*.055}" fill="${colors[2]}" opacity=".8" filter="url(#soft-${id})"/>${[0,60,120,180,240,300].map((angle,i)=>`<g transform="rotate(${angle})"><ellipse rx="${unit*(.25+i%2*.04)}" ry="${unit*(.11+i%2*.025)}" fill="none" stroke="${i%2?colors[3]:colors[2]}" stroke-opacity=".34"/><path d="M${unit*(.19+i%2*.04)} -${unit*.03}l${unit*.055} ${unit*.03}l-${unit*.055} ${unit*.03}z" fill="${i%2?colors[3]:colors[2]}"/></g>`).join('')}</g><path d="M${width*.12} ${height*.76}Q${width*.42} ${height*.62} ${width*.88} ${height*.76}" fill="none" stroke="url(#beam-${id})" stroke-width="2"/>`,
    dialogue: `<g transform="translate(${width*.56} ${height*.7})"><ellipse rx="${unit*.48}" ry="${unit*.14}" fill="#0b1120"/><path d="M-${unit*.31} 0Q-${unit*.12} -${unit*.14} ${unit*.08} -${unit*.02}Q${unit*.24} ${unit*.04} ${unit*.42} -${unit*.04}L${unit*.46} ${unit*.08}H-${unit*.42}Z" fill="#151d31"/><g transform="translate(${unit*.05} -${unit*.18})"><rect x="-${unit*.13}" y="-${unit*.09}" width="${unit*.26}" height="${unit*.14}" rx="${unit*.025}" fill="#081220" stroke="${colors[2]}" stroke-opacity=".6"/><path d="M0 -${unit*.09}V-${unit*.29}" stroke="#dce7ff" stroke-width="4"/><path d="M0 -${unit*.27}L-${unit*.12} -${unit*.2}M0 -${unit*.27}L${unit*.12} -${unit*.2}" stroke="${colors[2]}" stroke-width="3" fill="none"/><circle cy="-${unit*.28}" r="${unit*.018}" fill="${colors[3]}"/></g></g><circle cx="${width*.18}" cy="${height*.22}" r="${unit*.1}" fill="#ced8e2"/><circle cx="${width*.15}" cy="${height*.19}" r="${unit*.018}" fill="#9ba8b7"/><circle cx="${width*.2}" cy="${height*.25}" r="${unit*.026}" fill="#aab5c0"/>`,
    map: `<g transform="translate(${cx} ${cy})">${[-.26,0,.28].map((offset,i)=>`<g transform="translate(${unit*offset} ${(i-1)*unit*.08})"><circle r="${unit*(.075+i*.018)}" fill="${i===0?'#4479a9':i===1?'#d78262':'#89915d'}" stroke="${i===1?colors[3]:colors[2]}" stroke-opacity=".7"/><ellipse rx="${unit*(.12+i*.02)}" ry="${unit*(.03+i*.008)}" fill="none" stroke="${i===1?colors[3]:colors[2]}" stroke-opacity=".45" transform="rotate(-18)"/></g>`).join('')}<path d="M-${unit*.26} 0Q0 -${unit*.27} ${unit*.28} ${unit*.08}" fill="none" stroke="${colors[2]}" stroke-width="3" stroke-dasharray="7 11"/><circle cx="0" cy="-${unit*.18}" r="${unit*.018}" fill="${colors[2]}"/></g><path d="M0 ${height*.84}H${width}" stroke="url(#beam-${id})"/>`,
    expression: `<g transform="translate(${width*.56} ${height*.55})"><path d="M-${unit*.46} ${unit*.27}L-${unit*.36} -${unit*.25}L${unit*.36} -${unit*.25}L${unit*.46} ${unit*.27}Z" fill="#050b13" stroke="${colors[2]}" stroke-opacity=".22"/>${[-.25,0,.25].map((offset,i)=>`<g transform="translate(${unit*offset} 0)"><rect x="-${unit*.105}" y="-${unit*.16}" width="${unit*.21}" height="${unit*.27}" rx="${unit*.012}" fill="#0b202b" stroke="${i===1?colors[3]:colors[2]}" stroke-opacity=".65"/><rect x="-${unit*.088}" y="-${unit*.14}" width="${unit*.176}" height="${unit*.21}" fill="url(#glow-${id})" opacity=".65"/><path d="M-${unit*.08} ${unit*.02}Q0 -${unit*.12} ${unit*.08} ${unit*.02}" fill="none" stroke="${i===1?colors[3]:colors[2]}"/></g>`).join('')}<path d="M-${unit*.34} ${unit*.19}H${unit*.34}" stroke="${colors[3]}" stroke-width="3" stroke-dasharray="3 9"/></g>`,
    result: `<g transform="translate(${width*.63} ${height*.52})"><circle r="${unit*.31}" fill="none" stroke="${colors[2]}" stroke-opacity=".13"/><circle r="${unit*.23}" fill="none" stroke="${colors[3]}" stroke-opacity=".18" stroke-dasharray="3 12"/>${[-95,-32,38,108,178].map((angle,i)=>{const rad=angle*Math.PI/180;const x=Math.cos(rad)*unit*.25;const y=Math.sin(rad)*unit*.25;return `<path d="M0 0L${x.toFixed(1)} ${y.toFixed(1)}" stroke="${i%2?colors[3]:colors[2]}" stroke-opacity=".35"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${unit*.025}" fill="${i%2?colors[3]:colors[2]}"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${unit*.055}" fill="none" stroke="${i%2?colors[3]:colors[2]}" stroke-opacity=".18"/>`}).join('')}<circle r="${unit*.055}" fill="#f4f8ff"/><circle r="${unit*.11}" fill="url(#glow-${id})"/></g><path d="M${width*.08} ${height*.83}Q${width*.5} ${height*.66} ${width*.96} ${height*.84}" fill="none" stroke="${colors[2]}" stroke-opacity=".18"/>`,
    atlas: `<g transform="translate(${cx} ${cy})"><circle r="${unit*.065}" fill="${colors[3]}"/><circle r="${unit*.12}" fill="url(#glow-${id})"/><g fill="none" stroke="${colors[2]}" stroke-opacity=".22">${[.18,.28,.38,.48].map(r=>`<ellipse rx="${unit*r}" ry="${unit*r*.42}" transform="rotate(-14)"/>`).join('')}</g>${[-120,-70,-20,35,90,145,205].map((angle,i)=>{const r=unit*(.17+(i%4)*.085);const rad=angle*Math.PI/180;return `<g transform="translate(${(Math.cos(rad)*r).toFixed(1)} ${(Math.sin(rad)*r*.42).toFixed(1)})"><circle r="${unit*(.018+i%3*.006)}" fill="${i%2?colors[3]:colors[2]}"/><circle r="${unit*(.04+i%3*.008)}" fill="none" stroke="${i%2?colors[3]:colors[2]}" stroke-opacity=".25"/></g>`}).join('')}</g><path d="M${width*.08} ${height*.78}L${width*.92} ${height*.72}" stroke="url(#beam-${id})"/>`,
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${defs(id, colors)}${base}${scenes[id]}<rect width="${width}" height="${height}" fill="none" stroke="white" stroke-opacity=".04"/></svg>`
}

for (const id of Object.keys(palettes)) {
  for (const mobile of [false, true]) {
    const width = mobile ? 900 : 1600
    const height = mobile ? 1400 : 1000
    const suffix = mobile ? '-mobile' : ''
    await sharp(Buffer.from(worldMarkup(id, width, height, mobile)))
      .webp({ quality: 88, effort: 6 })
      .toFile(path.join(environmentDir, `${id}${suffix}.webp`))
  }
}

const poseConfig = {
  wake: { body: 4, leftArm: -24, rightArm: 24, leftLeg: 4, rightLeg: -4 },
  idle: { body: 0, leftArm: -10, rightArm: 10, leftLeg: 0, rightLeg: 0 },
  walk: { body: -2, leftArm: 23, rightArm: -22, leftLeg: -13, rightLeg: 16 },
  observe: { body: -3, leftArm: -8, rightArm: -66, leftLeg: 2, rightLeg: -2 },
  touch: { body: -6, leftArm: 10, rightArm: -88, leftLeg: 4, rightLeg: -6 },
  record: { body: 2, leftArm: -42, rightArm: 38, leftLeg: 0, rightLeg: 0 },
  communicate: { body: -2, leftArm: -8, rightArm: -112, leftLeg: 0, rightLeg: 0 },
  enter: { body: -7, leftArm: 28, rightArm: -28, leftLeg: -18, rightLeg: 20 },
}

function explorerMarkup(pose) {
  const config = poseConfig[pose]
  return `<svg xmlns="http://www.w3.org/2000/svg" width="520" height="760" viewBox="0 0 520 760">
    <defs>
      <linearGradient id="suit" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffffff"/><stop offset=".42" stop-color="#e9eef1"/><stop offset=".72" stop-color="#aebbc2"/><stop offset="1" stop-color="#f8fbfc"/></linearGradient>
      <linearGradient id="visor" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#75e5f0"/><stop offset=".18" stop-color="#153447"/><stop offset=".64" stop-color="#07121d"/><stop offset="1" stop-color="#d6a45d"/></linearGradient>
      <linearGradient id="pack" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#cbd5da"/><stop offset="1" stop-color="#71818b"/></linearGradient>
      <radialGradient id="rim"><stop stop-color="#7ff6ff" stop-opacity=".5"/><stop offset="1" stop-color="#7ff6ff" stop-opacity="0"/></radialGradient>
      <filter id="shadow"><feGaussianBlur stdDeviation="15"/></filter>
    </defs>
    <ellipse cx="260" cy="705" rx="122" ry="28" fill="#02070d" opacity=".52" filter="url(#shadow)"/>
    <ellipse cx="260" cy="344" rx="208" ry="246" fill="url(#rim)" opacity=".2"/>
    <g transform="translate(260 372) rotate(${config.body}) translate(-260 -372)">
      <rect x="150" y="248" width="220" height="250" rx="92" fill="url(#suit)" stroke="#ffffff" stroke-opacity=".75" stroke-width="4"/>
      <rect x="134" y="278" width="52" height="158" rx="22" fill="url(#pack)"/>
      <circle cx="260" cy="185" r="112" fill="url(#suit)" stroke="#ffffff" stroke-opacity=".82" stroke-width="5"/>
      <ellipse cx="260" cy="188" rx="83" ry="70" fill="url(#visor)" stroke="#9ff4f6" stroke-opacity=".68" stroke-width="5"/>
      <path d="M203 153Q260 112 318 153" fill="none" stroke="#ffffff" stroke-opacity=".48" stroke-width="9" stroke-linecap="round"/>
      <path d="M218 170Q249 145 289 158" fill="none" stroke="#d7fbff" stroke-opacity=".66" stroke-width="8" stroke-linecap="round"/>
      <rect x="199" y="304" width="122" height="82" rx="20" fill="#dbe3e7" stroke="#8c9aa2"/>
      <rect x="215" y="322" width="76" height="28" rx="8" fill="#142d3c"/>
      <circle cx="301" cy="336" r="8" fill="#ffc866"/><circle cx="301" cy="362" r="8" fill="#5de7eb"/>
      <path d="M178 412Q260 446 342 412" fill="none" stroke="#7c8e98" stroke-width="16"/>
      <g transform="translate(172 295) rotate(${config.leftArm})"><rect x="-31" y="-8" width="62" height="222" rx="30" fill="url(#suit)" stroke="#fff" stroke-opacity=".65" stroke-width="3"/><circle cy="116" r="34" fill="#a7b4bb"/><path d="M-31 198Q0 232 31 198V235H-31Z" fill="#f7fafb"/></g>
      <g transform="translate(348 295) rotate(${config.rightArm})"><rect x="-31" y="-8" width="62" height="222" rx="30" fill="url(#suit)" stroke="#fff" stroke-opacity=".65" stroke-width="3"/><circle cy="116" r="34" fill="#a7b4bb"/><path d="M-31 198Q0 232 31 198V235H-31Z" fill="#f7fafb"/></g>
      <g transform="translate(220 478) rotate(${config.leftLeg})"><rect x="-38" width="76" height="190" rx="34" fill="url(#suit)" stroke="#fff" stroke-opacity=".65" stroke-width="3"/><circle cy="92" r="39" fill="#a7b4bb"/><path d="M-39 166H40L58 218H-51Z" fill="#eaf0f2" stroke="#7c8e98" stroke-width="4"/></g>
      <g transform="translate(300 478) rotate(${config.rightLeg})"><rect x="-38" width="76" height="190" rx="34" fill="url(#suit)" stroke="#fff" stroke-opacity=".65" stroke-width="3"/><circle cy="92" r="39" fill="#a7b4bb"/><path d="M-39 166H40L58 218H-51Z" fill="#eaf0f2" stroke="#7c8e98" stroke-width="4"/></g>
      <path d="M176 275Q260 248 344 275" fill="none" stroke="#6eeef2" stroke-opacity=".52" stroke-width="5"/>
    </g>
  </svg>`
}

for (const pose of Object.keys(poseConfig)) {
  await sharp(Buffer.from(explorerMarkup(pose)))
    .webp({ quality: 92, effort: 6, alphaQuality: 100 })
    .toFile(path.join(explorerDir, `${pose}.webp`))
}

console.log('Generated cosmic environments and explorer poses.')
