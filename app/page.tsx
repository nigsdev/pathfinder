import { AdviseFlow } from "@/components/AdviseFlow";

export default function Home() {
  return (
    <main className="min-w-0 py-8">
      <h1 className="break-words font-head text-[32px] leading-10 font-bold text-ink">
        Find your path after Class 12
      </h1>

      <section className="mt-4" aria-labelledby="profile-heading">
        <h2 id="profile-heading" className="sr-only">
          Your profile
        </h2>
        <AdviseFlow />
      </section>
    </main>
  );
}
