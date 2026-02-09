import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type React from 'react';
import { ButtonLink } from '@/app/components/ui/button-link';
import { getServerSession } from '@/lib/auth-helpers.server';
import { api } from '@/lib/api';
import type { AdSlot } from '@/lib/types';
import './landing-animations.css';

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

export default async function Home() {
  const session = await getServerSession();
  if (session.user) {
    if (session.role === 'sponsor') redirect('/dashboard/sponsor');
    if (session.role === 'publisher') redirect('/dashboard/publisher');
    redirect('/marketplace');
  }

  // Fetch live marketplace data
  let totalSlots = 0;

  let publisherCount = 0;
  let featuredSlots: AdSlot[] = [];

  try {
    const [slotsResponse, publishersResponse] = await Promise.all([
      api<{ data: AdSlot[]; pagination: { total: number } }>('/api/ad-slots'),
      api<{ count: number }>('/api/publishers/count')
    ]);

    totalSlots = slotsResponse.pagination.total;
    publisherCount = publishersResponse.count;
    featuredSlots = slotsResponse.data.slice(0, 3);
  } catch (error) {
    console.error('Failed to fetch marketplace data:', error);
  }

  return (
    <div className="relative min-h-screen">
      {/* Animated Background Gradients */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/30 via-purple-400/30 to-pink-400/30 blur-3xl animate-float" />
        <div className="absolute top-1/3 -left-40 h-96 w-96 rounded-full bg-gradient-to-br from-cyan-400/20 via-teal-400/20 to-emerald-400/20 blur-3xl animate-float-delayed" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-violet-400/25 via-fuchsia-400/25 to-pink-400/25 blur-3xl animate-pulse-slow" />
      </div>

      <div className="space-y-12 py-8 md:py-12">
        {/* Hero Section */}
        <section className="relative">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 px-4 py-2 text-sm font-semibold text-blue-700 dark:text-blue-300 shadow-lg animate-fade-in">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              Built for sponsors & publishers
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight animate-slide-up text-[--color-foreground]/80">
              The Transparent Sponsorship
              <span className="block mt-2 text-[--color-primary]">
                Marketplace
              </span>
            </h1>

            {/* Subheadline */}
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-[--color-muted] leading-relaxed animate-fade-in-delayed font-medium">
              Sponsors request, publishers approve. A transparent marketplace built for serious partnerships.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-delayed-2">
              <ButtonLink
                href="/marketplace"
                variant="primary"
                size="lg"
                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Explore Marketplace
                  <svg className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </ButtonLink>
              <ButtonLink
                href="/login"
                variant="secondary"
                size="lg"
                className="bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 transition-all duration-300 shadow-lg"
              >
                Login
              </ButtonLink>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-12 animate-fade-in-delayed-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative bg-[var(--color-card)]/90 dark:bg-[var(--color-card)]/90 backdrop-blur-sm rounded-xl p-5 border border-[var(--color-card-border)] shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    {totalSlots}+
                  </div>
                  <div className="text-xs font-medium text-[var(--color-card-muted)] mt-1">Ad Slots</div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative bg-[var(--color-card)]/90 dark:bg-[var(--color-card)]/90 backdrop-blur-sm rounded-xl p-5 border border-[var(--color-card-border)] shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                    {publisherCount}
                  </div>
                  <div className="text-xs font-medium text-[var(--color-card-muted)] mt-1">Publishers</div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-red-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative bg-[var(--color-card)]/90 dark:bg-[var(--color-card)]/90 backdrop-blur-sm rounded-xl p-5 border border-[var(--color-card-border)] shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-red-600">
                    Fast
                  </div>
                  <div className="text-xs font-medium text-[var(--color-card-muted)] mt-1">Approval Flow</div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative bg-[var(--color-card)]/90 dark:bg-[var(--color-card)]/90 backdrop-blur-sm rounded-xl p-5 border border-[var(--color-card-border)] shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                    100%
                  </div>
                  <div className="text-xs font-medium text-[var(--color-card-muted)] mt-1">Transparent</div>
                </div>
              </div>
            </div>

            {/* Feature Highlights */}
            <ul className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto mt-8 text-sm text-[--color-muted] font-medium">
              {[
                'Transparent pricing',
                'Easy requests',
                'Campaign dashboards',
                'Premium Experience'

              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                  <CheckIcon className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Featured Ad Slots */}
        {featuredSlots.length > 0 && (
          <section className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-[--color-foreground]">
                Featured Opportunities
              </h2>
              <p className="mt-2 text-[--color-muted] font-medium">Premium ad slots available right now</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {featuredSlots.map((slot, i) => (
                <Link
                  key={slot.id}
                  href={`/marketplace/${slot.id}`}
                  className="group relative animate-fade-in"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-2xl blur opacity-0 group-hover:opacity-25 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-2xl blur opacity-0 group-hover:opacity-25 transition-opacity duration-300"></div>
                  <div className="relative bg-[var(--color-card)] dark:bg-[var(--color-card)] rounded-xl border border-[var(--color-card-border)] p-5 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-blue-300 dark:hover:border-blue-500">
                    {slot.isAvailable && (
                      <div className="absolute top-4 right-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1 text-xs font-bold text-white shadow-md">
                          <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
                          AVAILABLE
                        </span>
                      </div>
                    )}

                    <div className="mb-3">
                      <div className="text-xs font-semibold text-[var(--color-card-muted)] uppercase tracking-wider mb-1">
                        {slot.type}
                      </div>
                      <h3 className="text-lg font-bold text-[var(--color-card-foreground)] line-clamp-1">
                        {slot.name}
                      </h3>
                      {slot.publisher && (
                        <p className="text-xs text-[var(--color-card-muted)] mt-0.5">
                          by {slot.publisher.name}
                        </p>
                      )}
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-xs text-[var(--color-card-muted)]">Starting at</div>
                        <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                          ${slot.basePrice.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Features Bento Grid */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[--color-foreground]">
              Everything you need
            </h2>
            <p className="mt-2 text-[--color-muted] font-medium">Built for modern sponsorship workflows</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🎯',
                title: 'Smart Discovery',
                desc: 'Filter by type, category, and budget to find perfect matches instantly',
                gradient: 'from-blue-500 to-cyan-500'
              },
              {
                icon: '⚡',
                title: 'Lightning Fast',
                desc: 'Book placements in seconds with our streamlined booking flow',
                gradient: 'from-purple-500 to-pink-500'
              },
              {
                icon: '📊',
                title: 'Unified Dashboard',
                desc: 'Manage campaigns and inventory from one beautiful interface',
                gradient: 'from-emerald-500 to-teal-500'
              },
              {
                icon: '💰',
                title: 'Transparent Pricing',
                desc: 'See all costs upfront—no hidden fees or surprises',
                gradient: 'from-orange-500 to-red-500'
              },
              {
                icon: '🔒',
                title: 'Secure & Reliable',
                desc: 'Enterprise-grade security for your campaigns and data',
                gradient: 'from-indigo-500 to-purple-500'
              },
              {
                icon: '🌙',
                title: 'Theme Support',
                desc: 'Beautiful in both light and dark modes—your choice',
                gradient: 'from-violet-500 to-fuchsia-500'
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
                <div className="relative bg-[var(--color-card)] dark:bg-[var(--color-card)] rounded-xl border border-[var(--color-card-border)] p-5 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-blue-300 dark:hover:border-blue-500">
                  <div className="text-3xl mb-3">{feature.icon}</div>
                  <h3 className="text-lg font-bold text-[var(--color-card-foreground)] mb-1">{feature.title}</h3>
                  <p className="text-[var(--color-card-muted)] text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-3xl -z-10 shadow-xl border border-indigo-100/50 dark:border-slate-800"></div>
          <div className="p-10 md:p-16 space-y-10">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                How it works
              </h2>
              <p className="mt-2 text-slate-600 dark:text-slate-400">Simple workflow for sponsors and publishers</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  step: '01',
                  title: 'Browse & Discover',
                  desc: 'Explore our marketplace of premium ad slots with transparent pricing and availability',
                  icon: '🔍'
                },
                {
                  step: '02',
                  title: 'Request Placement',
                  desc: 'Submit a placement request with your campaign details—publishers review and approve',
                  icon: '📝'
                },
                {
                  step: '03',
                  title: 'Track & Manage',
                  desc: 'Monitor approved placements and manage your campaigns from your dashboard',
                  icon: '📈'
                },
              ].map((step, i) => (
                <div key={i} className="relative animate-fade-in" style={{ animationDelay: `${i * 150}ms` }}>
                  <div className="text-center space-y-4">
                    <div className="relative inline-flex">
                      <div className="absolute inset-0 bg-blue-500/10 rounded-full blur opacity-60"></div>
                      <div className="relative bg-white dark:bg-slate-800 rounded-full w-20 h-20 flex items-center justify-center border-4 border-indigo-50 dark:border-slate-700 shadow-xl">
                        <span className="text-3xl">{step.icon}</span>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-indigo-600 dark:text-blue-400">STEP {step.step}</div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{step.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                  {i < 2 && (
                    <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-indigo-100 dark:bg-slate-700 -translate-x-1/2"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-20"></div>
          <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-10 md:p-16 text-center text-white shadow-2xl border border-white/10 overflow-hidden">

            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 relative z-10">
              Ready to get started?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto relative z-10">
              Join sponsors and publishers who are already using Anvara to streamline their sponsorship workflows
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <ButtonLink
                href="/marketplace"
                variant="secondary"
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-bold"
              >
                Explore Marketplace
              </ButtonLink>
              <ButtonLink
                href="/login"
                variant="secondary"
                size="lg"
                className="bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20 shadow-xl transition-all duration-300"
              >
                Try Demo
              </ButtonLink>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t-2 border-[--color-border] pt-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="text-2xl font-bold text-[--color-primary] mb-2">
                Anvara
              </div>
              <div className="text-sm text-[--color-muted]">
                © {new Date().getFullYear()} Sponsorship marketplace demo
              </div>
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <Link className="text-[--color-muted] hover:text-[--color-primary] transition-colors font-medium" href="/marketplace">
                Marketplace
              </Link>
              <Link className="text-[--color-muted] hover:text-[--color-primary] transition-colors font-medium" href="/login">
                Login
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
