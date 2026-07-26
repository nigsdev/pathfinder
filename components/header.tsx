import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";

export function Header() {
  return (
    <header className="py-5">
      <Link href="/" className="inline-block">
        <Wordmark className="h-7 w-auto sm:h-8" />
      </Link>
    </header>
  );
}
