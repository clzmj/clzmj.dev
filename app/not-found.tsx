import { Shell } from '../components/shell';

export default function NotFound() {
  return (
    <Shell markdownHref="/index.md">
      <div className="not-found">
        <h1 className="not-found-code">404</h1>
        <p>Nothing lives here.</p>
        <a className="not-found-home" href="/">
          Back home
        </a>
      </div>
    </Shell>
  );
}
