import { Compass, GraduationCap, Route } from "lucide-react";
import type { AdviceResponse } from "@/lib/types";

type ResultsViewProps = {
  advice: AdviceResponse;
  onStartOver: () => void;
};

const cardClassName =
  "w-full min-w-0 rounded-md border border-border bg-surface p-6 shadow-sm";

function IconChip({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-sm ${className}`}
    >
      {children}
    </div>
  );
}

function ResultsFooter() {
  return (
    <footer className="min-w-0 space-y-5 border-t border-border pt-6">
      <p className="break-words text-sm leading-[22px] text-muted">
        PathFinder is here to help you get started — not to replace your own
        research. Fee figures and admission details are approximate and can
        change. Please confirm everything on each college&apos;s official
        website before you apply.
      </p>

      <div className="rounded-sm border border-dashed border-border-strong bg-surface-alt px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-faint">
          Coming soon
        </p>
        <ul className="mt-2 space-y-1.5 text-sm text-muted">
          <li>Verified reviews from real alumni</li>
          <li>1:1 sessions with alumni and counsellors</li>
        </ul>
      </div>
    </footer>
  );
}

export function ResultsView({ advice, onStartOver }: ResultsViewProps) {
  const { direction, colleges, checklist, meta } = advice;
  const fromQuiz = meta.fromQuiz === true;
  const counsellingWhy = meta.counsellingWhy;
  const alternateDirections = meta.alternateDirections ?? [];

  return (
    <div className="min-w-0 space-y-6 pb-8">
      <article className={cardClassName}>
        <div className="mb-4 flex min-w-0 items-center gap-3">
          <IconChip className="bg-primary-100 text-primary-600">
            <Compass size={20} strokeWidth={1.5} aria-hidden="true" />
          </IconChip>
          <h2 className="font-head text-xl font-semibold text-ink">
            Direction &amp; skills
          </h2>
        </div>
        <h3 className="break-words font-head text-lg font-semibold text-ink">
          {direction.title}
        </h3>
        {fromQuiz && counsellingWhy ? (
          <>
            <p className="mt-3 text-sm font-medium text-primary-600">
              Based on what you told us
            </p>
            <p className="mt-1 break-words text-base leading-[26px] text-body">
              {counsellingWhy}
            </p>
          </>
        ) : (
          <p className="mt-2 break-words text-base leading-[26px] text-body">
            {direction.why}
          </p>
        )}
        {fromQuiz && alternateDirections.length > 0 ? (
          <p className="mt-3 break-words text-sm text-muted">
            Also worth considering: {alternateDirections.join(", ")}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          {direction.skills.map((skill) => (
            <span
              key={skill}
              className="max-w-full break-words rounded-pill bg-primary-050 px-3 py-1 text-sm text-primary-700"
            >
              {skill}
            </span>
          ))}
        </div>
      </article>

      <article className={cardClassName}>
        <div className="mb-4 flex min-w-0 items-center gap-3">
          <IconChip className="bg-verify-100 text-verify-600">
            <GraduationCap size={20} strokeWidth={1.5} aria-hidden="true" />
          </IconChip>
          <h2 className="font-head text-xl font-semibold text-ink">
            College shortlist
          </h2>
        </div>
        {colleges.length === 0 ? (
          <p className="break-words text-base leading-[26px] text-body">
            We couldn&apos;t find colleges for your search right now. Try a
            nearby city, or check the next steps below while we expand our
            coverage.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {colleges.map((college) => (
              <li key={college.name} className="min-w-0 py-4 first:pt-0 last:pb-0">
                <p className="break-words font-semibold text-ink">{college.name}</p>
                <p className="mt-1 break-words text-sm text-muted">
                  {college.location}
                </p>
                <p className="mt-0.5 break-words text-sm text-muted">
                  {college.course} · {college.fees}
                </p>
                <p className="mt-2 break-words text-base leading-[26px] text-body">
                  {college.why}
                </p>
                <p className="mt-1 text-xs text-faint">
                  {college.source === "live"
                    ? "Sourced live"
                    : "From our directory"}
                </p>
                {college.enriched ? (
                  <p className="mt-1 text-xs text-verify-600">
                    Verified from college site
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </article>

      <article className={cardClassName}>
        <div className="mb-4 flex min-w-0 items-center gap-3">
          <IconChip className="bg-accent-100 text-accent-600">
            <Route size={20} strokeWidth={1.5} aria-hidden="true" />
          </IconChip>
          <h2 className="font-head text-xl font-semibold text-ink">
            Next steps
          </h2>
        </div>
        <ul className="space-y-4">
          {checklist.map((item) => (
            <li key={item.task} className="min-w-0">
              <p className="break-words font-semibold text-ink">{item.task}</p>
              <p className="mt-1 break-words text-base leading-[26px] text-body">
                {item.detail}
              </p>
              <p className="mt-1 break-words text-sm text-muted">
                {item.deadline}
              </p>
            </li>
          ))}
        </ul>
      </article>

      <button
        type="button"
        onClick={onStartOver}
        className="w-full min-h-11 rounded-sm border border-border-strong bg-surface px-5 py-3 text-base font-semibold text-ink hover:bg-surface-alt"
      >
        Start over
      </button>

      <ResultsFooter />
    </div>
  );
}
