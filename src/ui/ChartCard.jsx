import Card from "./Card";
import Section from "./Section";

// A titled panel that reads as a card — Card's chrome plus Section's header,
// for content that genuinely belongs in a box (right now: the trade log).
// Bare charts/breakdowns that don't need a box should render <Section>
// directly instead of reaching for this.
export default function ChartCard({ title, right, children, dir, style, collapsible = false, defaultCollapsed = false }) {
  return (
    <Card dir={dir} style={style}>
      <Section title={title} right={right} collapsible={collapsible} defaultCollapsed={defaultCollapsed}>
        {children}
      </Section>
    </Card>
  );
}
