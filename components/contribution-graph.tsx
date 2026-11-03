import { type ContributionDay, loadContributions } from '../lib/contributions';
import { site } from '../lib/site';

function monthName(date: string): string {
  const [year, month] = date.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' }).format(
    new Date(Date.UTC(year, month - 1, 1)),
  );
}

function labelFor(weeks: ContributionDay[][], index: number): string {
  const first = weeks[index]?.[0];
  if (!first) return '';
  const previous = weeks[index - 1]?.[0];
  if (!previous || monthName(previous.date) !== monthName(first.date)) return monthName(first.date);
  return '';
}

export function ContributionGraph() {
  const data = loadContributions();
  if (!data) return null;
  const total = data.total.toLocaleString('en-US');
  return (
    <section className="section" aria-labelledby="contributions-title">
      <h2 id="contributions-title" className="section-title">
        Contributions
      </h2>
      <div className="contrib">
        <div className="contrib-head">
          <p>
            <a href={site.github} rel="noreferrer" target="_blank">
              {total} contributions
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>{' '}
            in the last year
          </p>
          <p className="contrib-legend" aria-hidden="true">
            Less
            <span className="contrib-cell level-0" />
            <span className="contrib-cell level-1" />
            <span className="contrib-cell level-2" />
            <span className="contrib-cell level-3" />
            <span className="contrib-cell level-4" />
            More
          </p>
        </div>
        <div className="contrib-scroll">
          <div className="contrib-months" aria-hidden="true">
            {data.weeks.map((week, index) => (
              <span key={week[0]?.date ?? index}>{labelFor(data.weeks, index)}</span>
            ))}
          </div>
          <div className="contrib-grid" aria-hidden="true">
            {data.weeks.flatMap((week) =>
              week.map((day) => (
                <span
                  key={day.date}
                  className={`contrib-cell level-${day.level}`}
                  title={`${day.date}`}
                />
              )),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
