import { Shell } from '../components/shell';

export default function NotFound() {
  return (
    <Shell markdownHref="/index.md">
      <a className="home-mark" href="/">
        <img
          className="avatar"
          src="/avatar.png"
          alt="Carlos Lezama, home"
          width={256}
          height={256}
        />
      </a>
      <h1 className="page-title">Page not found</h1>
      <p>
        This address leads nowhere. Back to <a href="/">home</a>.
      </p>
    </Shell>
  );
}
