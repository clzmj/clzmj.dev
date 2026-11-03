import { catState } from '../lib/time';
import { CatSync } from './cat-sync';

export function Cat({ awake = false }: { awake?: boolean }) {
  const state = awake ? 'awake' : catState(new Date());
  return (
    <span className="cat-anchor" aria-hidden="true" data-always-awake={awake || undefined}>
      <span className="cat" id="site-cat" data-state={state} suppressHydrationWarning />
      <span className="cat-zs">
        <span className="cat-z" style={{ ['--rang' as string]: 0 }}>
          z
        </span>
        <span className="cat-z" style={{ ['--rang' as string]: 1 }}>
          z
        </span>
        <span className="cat-z" style={{ ['--rang' as string]: 2 }}>
          z
        </span>
      </span>
      {!awake ? (
        <>
          <script
            dangerouslySetInnerHTML={{
              __html:
                'var c=document.getElementById("site-cat");if(c&&document.documentElement.dataset.cat)c.dataset.state=document.documentElement.dataset.cat;',
            }}
          />
          <CatSync />
        </>
      ) : null}
    </span>
  );
}
