import { loadContributions } from '../lib/contributions';
import { ContributionCard } from './contribution-card';

export function ContributionGraph() {
  const data = loadContributions();
  if (!data) return null;
  return (
    <section
      className="section animate-enter animate-enter-individual"
      style={{ ['--stagger' as string]: 2 }}
      aria-labelledby="contributions-title"
    >
      <h2 id="contributions-title" className="section-title">
        Contributions
      </h2>
      <ContributionCard data={data} />
    </section>
  );
}
