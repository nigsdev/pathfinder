import { ProfileForm } from "@/components/ProfileForm";

export default function Home() {
  return (
    <main className="py-8">
      <h1 className="font-head text-[32px] leading-10 font-bold text-ink">
        Find your path after Class 12
      </h1>
      <p className="mt-4 text-base leading-[26px] text-body">
        Tell us a bit about you — we&apos;ll suggest directions, colleges, and
        next steps that fit.
      </p>

      <section className="mt-8" aria-labelledby="profile-heading">
        <h2 id="profile-heading" className="sr-only">
          Your profile
        </h2>
        <ProfileForm />
      </section>
    </main>
  );
}
