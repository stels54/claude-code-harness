import { AUTHOR } from '../sections/content.ts'

function SiteFooter() {
  return (
    <footer id="author" className="site-footer" aria-labelledby="author-title">
      <h2 id="author-title">Автор</h2>
      <p className="footer-name">{AUTHOR.name}</p>
      <ul className="footer-links">
        {AUTHOR.links.map((link) => (
          <li key={link.href}>
            <a href={link.href} rel="noreferrer">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </footer>
  )
}

export default SiteFooter
