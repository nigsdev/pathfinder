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

export function ResultsView({ advice, onStartOver }: ResultsViewProps) {
  const { direction, colleges, checklist } = advice;

  return (
    <div className="space-y-6">
      <article className={cardClassName}>
        <div className="mb-4 flex items-center gap-3">
          <IconChip className="bg-primary-100 text-primary-600">
            <Compass size={20} strokeWidth={1.5} aria-hidden="true" />
          </IconChip>
          <h2 className="font-head text-xl font-semibold text-ink">
            Direction &amp; skills
          </h2>
        </div>
        <h3 className="font-head text-lg font-semibold text-ink">
          {direction.title}
        </h3>
        <p className="mt-2 break-words text-base leading-[26px] text-body">
          {direction.why}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {direction.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-pill bg-primary-050 px-3 py-1 text-sm text-primary-700"
            >
              {skill}
            </span>
          ))}
        </div>
      </article>

      <article className={cardClassName}>
        <div className="mb-4 flex items-center gap-3">
          <IconChip className="bg-verify-100 text-verify-600">
            <GraduationCap size={20} strokeWidth={1.5} aria-hidden="true" />
          </IconChip>
          <h2 className="font-head text-xl font-semibold text-ink">
            College shortlist
          </h2>
        </div>
        <ul className="divide-y divide-border">
          {colleges.map((college) => (
            <li key={college.name} className="min-w-0 py-4 first:pt-0 last:pb-0">
              <p className="break-words font-semibold text-ink">{college.name}</p>
              <p className="mt-1 break-words text-sm text-muted">
                {college.location} · {college.course} · {college.fees}
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
      </article>

      <article className={cardClassName}>
        <div className="mb-4 flex items-center gap-3">
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
    </div>
  );
}
