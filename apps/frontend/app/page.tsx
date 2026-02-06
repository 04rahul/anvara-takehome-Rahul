import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type React from 'react';
import { ButtonLink } from '@/app/components/ui/button-link';
import { getServerSession } from '@/lib/auth-helpers.server';

export const metadata: Metadata = {
  title: 'Anvara — Sponsorship Marketplace',
  description:
    'A sponsorship marketplace that helps sponsors find high-quality inventory and helps publishers monetize with confidence.',
  openGraph: {
    title: 'Anvara — Sponsorship Marketplace',
    description:
      'Find sponsorship inventory, book placements, and run campaigns—built for sponsors and publishers.',
    type: 'website',
  },
};

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FeatureIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 2 2 7l10 5 10-5-10-5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M2 17l10 5 10-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M2 12l10 5 10-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[--color-border] bg-[--color-background] text-sm font-semibold text-[--color-primary] shadow-sm">
        {number}
      </div>
      <div>
        <div className="font-semibold">{title}</div>
        <p className="mt-1 text-sm text-[--color-muted]">{description}</p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[--color-border] bg-[--color-background] p-5 shadow-sm">
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      <div className="mt-1 text-sm text-[--color-muted]">{label}</div>
    </div>
  );
}

function Testimonial({
  quote,
  name,
  title,
}: {
  quote: string;
  name: string;
  title: string;
}) {
  return (
    <figure className="rounded-xl border border-[--color-border] bg-[--color-background] p-6 shadow-sm">
      <blockquote className="text-sm leading-relaxed text-[--color-foreground]">
        “{quote}”
      </blockquote>
      <figcaption className="mt-4 text-sm">
        <div className="font-semibold">{name}</div>
        <div className="text-[--color-muted]">{title}</div>
      </figcaption>
    </figure>
  );
}

export default async function Home() {
  const session = await getServerSession();
  if (session.user) {
    if (session.role === 'sponsor') redirect('/dashboard/sponsor');
    if (session.role === 'publisher') redirect('/dashboard/publisher');
    redirect('/marketplace');
  }

  return (
    <div className="space-y-16 py-6 md:py-10">
      <section
        aria-labelledby="landing-hero-title"
        className="relative overflow-hidden rounded-2xl border border-[--color-border] bg-[color-mix(in_oklab,var(--color-primary)_8%,var(--color-background))] p-6 shadow-sm md:p-10"
      >
        <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(900px_420px_at_20%_-20%,color-mix(in_oklab,var(--color-primary)_35%,transparent),transparent_65%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(760px_380px_at_110%_10%,color-mix(in_oklab,var(--color-secondary)_28%,transparent),transparent_62%)]" />

        <div className="relative grid items-center gap-10 md:grid-cols-2">
          <div className="animate-in fade-in zoom-in-95">
            <div className="inline-flex items-center gap-2 rounded-full border border-[--color-border] bg-[--color-background] px-3 py-1 text-xs text-[--color-muted] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[--color-secondary]" aria-hidden="true" />
              Built for sponsors & publishers
            </div>

            <h1
              id="landing-hero-title"
              className="mt-5 text-4xl font-bold tracking-tight md:text-5xl"
            >
              Sponsorships that feel as easy as shopping online.
            </h1>
            <p className="mt-4 max-w-prose text-[--color-muted] md:text-lg">
              Discover premium ad slots, compare pricing transparently, and book with confidence.
              Publishers get clean inventory management and fewer back-and-forth emails.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink href="/marketplace" variant="primary" size="lg">
                Explore Marketplace
              </ButtonLink>
              <ButtonLink href="/login" variant="secondary" size="lg">
                Login
              </ButtonLink>
            </div>

            <ul className="mt-6 grid gap-2 text-sm text-[--color-muted] sm:grid-cols-2">
              <li className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-[--color-secondary]" />
                Pricing and placement types upfront
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-[--color-secondary]" />
                Quick booking flow with confirmations
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-[--color-secondary]" />
                Campaign & inventory dashboards
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-[--color-secondary]" />
                Theme-safe UI (light/dark)
              </li>
            </ul>
          </div>

          <div className="relative">
            <div className="grid gap-4">
              <div className="rounded-2xl border border-[--color-border] bg-[--color-background] p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[--color-border] bg-[color-mix(in_oklab,var(--color-primary)_8%,var(--color-background))] text-[--color-primary]">
                      <FeatureIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold">Newsletter Sponsorship</div>
                      <div className="text-sm text-[--color-muted]">Audience: founders & builders</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">$1,250</div>
                    <div className="text-xs text-[--color-muted]">per issue</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-[--color-border] bg-[--color-background] p-3">
                    <div className="text-sm font-semibold">42k</div>
                    <div className="text-xs text-[--color-muted]">subs</div>
                  </div>
                  <div className="rounded-lg border border-[--color-border] bg-[--color-background] p-3">
                    <div className="text-sm font-semibold">38%</div>
                    <div className="text-xs text-[--color-muted]">open</div>
                  </div>
                  <div className="rounded-lg border border-[--color-border] bg-[--color-background] p-3">
                    <div className="text-sm font-semibold">3.2%</div>
                    <div className="text-xs text-[--color-muted]">click</div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[--color-border] bg-[--color-background] p-5 shadow-sm">
                  <div className="text-sm font-semibold">For sponsors</div>
                  <p className="mt-2 text-sm text-[--color-muted]">
                    Filter inventory by placement type, category, and price. Then book in a few clicks.
                  </p>
                  <div className="mt-4 text-xs text-[--color-muted]">
                    Tip: start in{' '}
                    <Link className="text-[--color-primary] hover:underline" href="/marketplace">
                      Marketplace
                    </Link>
                    .
                  </div>
                </div>
                <div className="rounded-2xl border border-[--color-border] bg-[--color-background] p-5 shadow-sm">
                  <div className="text-sm font-semibold">For publishers</div>
                  <p className="mt-2 text-sm text-[--color-muted]">
                    List ad slots, set rate cards, and manage incoming bookings from one dashboard.
                  </p>
                  <div className="mt-4 text-xs text-[--color-muted]">Less email. More revenue.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="landing-stats-title" className="space-y-6">
        <div>
          <h2 id="landing-stats-title" className="text-lg font-semibold">
            Designed for speed, clarity, and trust
          </h2>
          <p className="mt-1 max-w-prose text-sm text-[--color-muted]">
            A marketplace UI that keeps decision-making simple: clear inventory, clear pricing,
            clear next steps.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat value="44px+" label="touch targets on critical controls" />
          <Stat value="0" label="hardcoded hex colors on the landing page UI" />
          <Stat value="2" label="primary user journeys: sponsor & publisher" />
        </div>
      </section>

      <section aria-labelledby="landing-features-title" className="space-y-6">
        <div>
          <h2 id="landing-features-title" className="text-lg font-semibold">
            What you get out of the box
          </h2>
          <p className="mt-1 max-w-prose text-sm text-[--color-muted]">
            Everything you need to browse, book, and manage sponsorships—without duct-taped
            spreadsheets.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: 'Marketplace discovery',
              desc: 'Filter by placement type, category, and price to find the right inventory fast.',
            },
            {
              title: 'Simple booking flow',
              desc: 'Book a slot with clear details and confirmations—no ambiguity or surprises.',
            },
            {
              title: 'Dashboards for both sides',
              desc: 'Sponsors track campaigns. Publishers manage ad slots. Everyone stays aligned.',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-[--color-border] bg-[--color-background] p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[--color-border] bg-[color-mix(in_oklab,var(--color-primary)_7%,var(--color-background))] text-[--color-primary]">
                  <FeatureIcon className="h-5 w-5" />
                </div>
                <div className="font-semibold">{f.title}</div>
              </div>
              <p className="mt-3 text-sm text-[--color-muted]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="landing-how-title" className="grid gap-10 md:grid-cols-2">
        <div>
          <h2 id="landing-how-title" className="text-lg font-semibold">
            How it works
          </h2>
          <p className="mt-1 max-w-prose text-sm text-[--color-muted]">
            A straightforward workflow that mirrors how teams already buy sponsorships—just faster.
          </p>

          <div className="mt-6 space-y-6">
            <Step
              number="1"
              title="Browse the marketplace"
              description="Discover ad slots by type, category, and budget—no guessing what’s available."
            />
            <Step
              number="2"
              title="Book the right placement"
              description="Confirm your details and lock it in with a simple booking flow."
            />
            <Step
              number="3"
              title="Manage it from a dashboard"
              description="Sponsors track campaigns. Publishers update inventory and fulfill bookings."
            />
          </div>
        </div>

        <div className="rounded-2xl border border-[--color-border] bg-[color-mix(in_oklab,var(--color-secondary)_8%,var(--color-background))] p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">Start in seconds</div>
              <div className="mt-1 text-sm text-[--color-muted]">
                Use quick login to explore both roles.
              </div>
            </div>
            <div className="rounded-xl border border-[--color-border] bg-[--color-background] px-3 py-2 text-xs text-[--color-muted] shadow-sm">
              Demo credentials included
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[--color-border] bg-[--color-background] p-5 shadow-sm">
              <div className="font-semibold text-[--color-primary]">Sponsor demo</div>
              <ul className="mt-3 space-y-2 text-sm text-[--color-muted]">
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-[--color-secondary]" />
                  Create and review campaigns
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-[--color-secondary]" />
                  Browse and book ad slots
                </li>
              </ul>
            </div>
            <div className="rounded-xl border border-[--color-border] bg-[--color-background] p-5 shadow-sm">
              <div className="font-semibold text-[--color-secondary]">Publisher demo</div>
              <ul className="mt-3 space-y-2 text-sm text-[--color-muted]">
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-[--color-secondary]" />
                  List and manage ad slots
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-[--color-secondary]" />
                  Review incoming bookings
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/login" variant="primary" size="lg" className="w-full sm:w-auto">
              Login (demo)
            </ButtonLink>
            <ButtonLink
              href="/marketplace"
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              View inventory
            </ButtonLink>
          </div>
        </div>
      </section>

      <section aria-labelledby="landing-testimonials-title" className="space-y-6">
        <div>
          <h2 id="landing-testimonials-title" className="text-lg font-semibold">
            Teams move faster on Anvara
          </h2>
          <p className="mt-1 max-w-prose text-sm text-[--color-muted]">
            A marketplace experience that reduces friction for both sides.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Testimonial
            quote="We can finally compare inventory and pricing in one place. Booking feels clean and predictable."
            name="Ayesha"
            title="Growth Lead (Sponsor)"
          />
          <Testimonial
            quote="Publishing slots used to mean messy threads. Now we manage listings and bookings in a dashboard."
            name="Marco"
            title="Newsletter Operator (Publisher)"
          />
          <Testimonial
            quote="The UI is crisp, responsive, and theme-safe—exactly what we need for day-to-day use."
            name="Priya"
            title="Product Designer"
          />
        </div>
      </section>

      <section
        aria-labelledby="landing-cta-title"
        className="rounded-2xl border border-[--color-border] bg-[color-mix(in_oklab,var(--color-primary)_10%,var(--color-background))] p-6 shadow-sm md:p-10"
      >
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 id="landing-cta-title" className="text-2xl font-bold tracking-tight">
              Ready to explore the marketplace?
            </h2>
            <p className="mt-2 max-w-prose text-sm text-[--color-muted]">
              Browse inventory now, then use the quick-login demo to see sponsor and publisher
              dashboards.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
            <ButtonLink href="/marketplace" variant="primary" size="lg">
              Explore Marketplace
            </ButtonLink>
            <ButtonLink href="/login" variant="secondary" size="lg">
              Login
            </ButtonLink>
          </div>
        </div>
      </section>

      <footer className="border-t border-[--color-border] pt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-[--color-muted]">
            © {new Date().getFullYear()} Anvara. Sponsorship marketplace demo.
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link className="text-[--color-muted] hover:text-[--color-foreground]" href="/marketplace">
              Marketplace
            </Link>
            <Link className="text-[--color-muted] hover:text-[--color-foreground]" href="/login">
              Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
