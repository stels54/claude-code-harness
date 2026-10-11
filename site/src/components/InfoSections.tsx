import { DEVICE, LIMITS, WHY, type Section } from '../sections/content.ts'

function SectionItems({ section }: { section: Section }) {
  return (
    <ul className="info-items">
      {section.items.map((item) => (
        <li key={item.id} className="info-item">
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </li>
      ))}
    </ul>
  )
}

export function WhySection() {
  return (
    <section id="why" className="section" aria-labelledby="why-title">
      <h2 id="why-title">{WHY.title}</h2>
      <p className="section-lead">{WHY.lead}</p>
      <SectionItems section={WHY} />
    </section>
  )
}

export function DeviceSection() {
  return (
    <section id="device" className="section" aria-labelledby="device-title">
      <h2 id="device-title">{DEVICE.title}</h2>
      <p className="section-lead">{DEVICE.lead}</p>
      <SectionItems section={DEVICE} />
    </section>
  )
}

export function LimitsSection() {
  return (
    <section id="limits" className="section" aria-labelledby="limits-title">
      <h2 id="limits-title">{LIMITS.title}</h2>
      <p className="section-lead">{LIMITS.lead}</p>
      <SectionItems section={LIMITS} />
    </section>
  )
}
