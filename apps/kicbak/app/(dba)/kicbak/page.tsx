"use client";
import { useState } from 'react';
import Layout from '../_components/Layout';
import Link from 'next/link';

// Kicbak benefits for travelers
const travelerBenefits = [
  {
    title: 'Earn rewards on every direct booking',
    description: 'Book directly with independent properties and earn Kicbak rewards every time—no middleman taking a cut.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 12v10H4V12" />
        <rect x="2" y="7" width="20" height="5" />
        <path d="M12 22V7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>
    )
  },
  {
    title: 'Discover unique independent stays',
    description: 'Access a curated network of independent hotels, vacation rentals, and experiences you won\'t find buried in OTA search results.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    )
  },
  {
    title: 'Rewards that work across the whole network',
    description: 'Unlike single-brand loyalty programs, your Kicbak rewards work at any property in the network—hotels, rentals, experiences.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    )
  },
  {
    title: 'Support independent operators directly',
    description: 'Your money goes to the people who host you—not to platforms that extract value from both sides of the transaction.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    )
  },
  {
    title: 'No lock-in, no hidden fees',
    description: 'Book on the property\'s own site at their best rates. No membership fees, no strings attached—just better travel.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 9.9-1" />
      </svg>
    )
  }
];

// Kicbak benefits for travel operators
const operatorBenefits = [
  {
    title: 'Turn past guests into recurring revenue',
    description: 'Earn when former guests stay with other Kicbak members, even if they never return to you.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    )
  },
  {
    title: 'Give rewards at zero cost',
    description: 'Onboard guests to Kicbak and give them rewards—without paying for it yourself.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 12v10H4V12" />
        <rect x="2" y="7" width="20" height="5" />
        <path d="M12 22V7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>
    )
  },
  {
    title: 'Full operational control',
    description: 'You own pricing, availability, checkout, and guest communication. Always.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    )
  },
  {
    title: 'Lower net commission than OTAs',
    description: 'Costs balance as guest flows balance in the network. You keep the relationship.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    )
  },
  {
    title: 'Works with your existing stack',
    description: 'Runs alongside your PMS and booking engine. No disruption to operations.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    )
  }
];

// Kicbak benefits for affiliates
const affiliateBenefits = [
  {
    title: 'Earn by promoting direct bookings',
    description: 'Share Kicbak properties with your audience and earn on every completed direct booking—not OTA affiliate scraps.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    )
  },
  {
    title: 'Content that converts differently',
    description: 'Recommend unique independent properties your audience can\'t find on mainstream platforms. Stand out from every other affiliate pushing OTA links.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <path d="M2 2l7.586 7.586" />
        <circle cx="11" cy="11" r="2" />
      </svg>
    )
  },
  {
    title: 'Built for creators and apps',
    description: 'Whether you\'re a travel blogger, content creator, or building a travel app—integrate Kicbak and monetize your audience with real value.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    )
  },
  {
    title: 'Grow with the network',
    description: 'As the Kicbak network adds properties and travelers, your distribution value compounds. Early affiliates benefit most.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    )
  },
  {
    title: 'Align your brand with independence',
    description: 'Position yourself as a champion of independent travel. Your audience gets better stays, operators get direct bookings, and you get rewarded.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" y1="22" x2="4" y2="15" />
      </svg>
    )
  }
];

// Kicbak benefits for travel tech
const techBenefits = [
  {
    title: 'Property Management Systems',
    description: 'Let your operators onboard guests to Kicbak from any channel. Give rewards at no cost. You share in the network revenue.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    )
  },
  {
    title: 'Booking Engines',
    description: 'Boost conversions by integrating Kicbak rewards into the booking flow. We send network guests to book through you. You share in the revenue.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    )
  },
  {
    title: 'Channel Managers',
    description: 'Add Kicbak as a direct booking distribution channel for your clients. Diversify from OTA dependency.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    )
  },
  {
    title: 'New revenue stream for your platform',
    description: 'Earn a share of network revenue when your clients participate in Kicbak. Your platform becomes more valuable without more work from operators.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    )
  },
  {
    title: 'Simple integration, real differentiation',
    description: 'Offer something your competitors don\'t. Kicbak integration makes your platform the one that helps operators actually grow direct bookings.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    )
  }
];

// FAQ data
const faqs = [
  {
    question: 'Is Kicbak another OTA?',
    answer: "No. Kicbak is not a booking platform. We don't control inventory, pricing, or checkout. Guests always book directly on your site, through your own booking engine. We're a network that keeps bookings direct."
  },
  {
    question: 'Who owns the guest data?',
    answer: "You do. You receive the guest email and booking details just like any direct booking. Kicbak does not take ownership of your guest list. When a guest books through the network, you get the full relationship."
  },
  {
    question: 'What do I pay?',
    answer: "You only pay when a completed stay is referred by Kicbak. No setup fees, no monthly minimums, no fixed costs. If we don't send business, you don't pay."
  },
  {
    question: 'Do you control my rates or availability?',
    answer: 'No. You control pricing, availability, minimum stays, and cancellation policies. Always. Nothing about your revenue management changes.'
  },
  {
    question: 'Will you market to my guests?',
    answer: "Only to support direct bookings. We don't send competing offers, redirect bookings, or override your pricing. Your guests remain yours. We help them discover other network properties when they're ready to travel somewhere new."
  },
  {
    question: 'How is this different from a loyalty program?',
    answer: "Traditional loyalty programs cost you money and only benefit guests who return to you. Kicbak lets you give rewards at no cost and earn revenue even when guests book elsewhere in the network. It's cooperative, not extractive."
  }
];

export default function KicbakPage() {
  const [activeTab, setActiveTab] = useState('travelers');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <Layout
      title="Kicbak | Turn Past Guests Into Revenue"
      description="Kicbak turns guests who never return into new revenue and more bookings for operators. Join the network where value circulates instead of being extracted."
    >
      {/* Hero Section */}
      <section className="kicbak-hero bg-pattern" style={{ position: 'relative', minHeight: '85vh', display: 'flex', alignItems: 'center' }}>
        {/* Floating Orbs */}
        <div className="floating-orbs">
          <div className="floating-orb floating-orb-1"></div>
          <div className="floating-orb floating-orb-2"></div>
        </div>

        <div className="container">
          <div className="kicbak-hero-content">
            <div className="kicbak-hero-badge">
              <span className="kicbak-badge-dot"></span>
              Coming Soon — Join the Waitlist
            </div>
            <h1 className="kicbak-hero-title" style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)' }}>
              Turn past guests into <em>new revenue</em> and <em>more bookings</em>
            </h1>
            <p className="kicbak-hero-subtitle" style={{ fontSize: '1.25rem' }}>
              When your guests stay with other independent properties in the network, you earn.
              When their guests stay with you, they earn. Everyone wins except the OTAs.
            </p>
            <div className="kicbak-hero-cta">
              <Link href="/join" className="btn btn-primary btn-lg btn-glow">
                Join the Waitlist
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '8px' }}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <a href="#how-it-works" className="btn btn-secondary btn-lg">
                See How It Works
              </a>
            </div>

            {/* Key Metrics */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '3rem',
              marginTop: '4rem',
              padding: '2rem 3rem',
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              boxShadow: 'var(--shadow-soft)',
              border: '1px solid var(--gray-100)',
              flexWrap: 'wrap'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--purple-600)' }}>$0</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Upfront Cost</div>
              </div>
              <div style={{ width: '1px', height: '50px', background: 'var(--gray-200)' }}></div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--purple-600)' }}>100%</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Direct Bookings</div>
              </div>
              <div style={{ width: '1px', height: '50px', background: 'var(--gray-200)' }}></div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--purple-600)' }}>You</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Own the Guest</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stakes Section - The Problem */}
      <section className="section-dark-gradient" id="problem" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(220, 38, 38, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <span className="badge" style={{ background: 'rgba(220, 38, 38, 0.2)', color: '#FCA5A5', marginBottom: '1.5rem', display: 'inline-flex' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              The Problem
            </span>
            <h2 style={{ color: 'white', fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '1.5rem' }}>
              You do the work. <span style={{ color: 'var(--purple-300)', fontStyle: 'italic' }}>Platforms keep the guest.</span>
            </h2>
            <p style={{ color: 'var(--purple-200)', fontSize: '1.125rem', lineHeight: 1.8, marginBottom: '2rem' }}>
              Every guest you host eventually travels again. But when they do, they don't come back
              to you—they go back to the platform. <strong style={{ color: 'white' }}>You pay to reacquire guests you already earned.</strong>
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1.5rem',
              marginTop: '3rem'
            }}>
              {[
                { value: '77%', label: 'Repeat revenue via OTAs' },
                { value: '$1B+', label: 'Lost to fees on repeat guests' },
                { value: '15-30%', label: 'Commission per booking' }
              ].map((stat, i) => (
                <div key={i} style={{
                  padding: '1.5rem',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#FCA5A5', marginBottom: '0.5rem' }}>{stat.value}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--purple-300)' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The Shift Section - Solution */}
      <section id="solution" className="section-gradient-mesh">
        <div className="container">
          <div className="section-header">
            <span className="section-label">The Shift</span>
            <h2>When your guests book another member, <em style={{ color: 'var(--purple-600)', fontStyle: 'italic' }}>you get paid.</em></h2>
            <p>All bookings stay direct. On their site. Under their brand. But you benefit.</p>
          </div>

          <div className="value-flow" style={{ gap: '3rem' }}>
            {/* Without Kicbak */}
            <div className="flow-card ota" style={{ padding: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <span className="badge" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Without Kicbak
                </span>
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Value Extracted</h3>
              <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>Every booking, OTAs take their cut</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  { icon: '👤', text: 'Your guest checks out' },
                  { icon: '🌐', text: 'They travel again via OTA' },
                  { icon: '❌', text: 'You get nothing' }
                ].map((step, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: 'var(--gray-50)', borderRadius: '10px' }}>
                    <span style={{ fontSize: '1.25rem' }}>{step.icon}</span>
                    <span style={{ color: 'var(--gray-700)' }}>{step.text}</span>
                  </div>
                ))}
              </div>

              <div style={{
                marginTop: '2rem',
                padding: '1rem',
                background: '#FEE2E2',
                borderRadius: '12px',
                textAlign: 'center',
                color: '#991B1B',
                fontWeight: 600
              }}>
                Guest lost. OTA wins.
              </div>
            </div>

            {/* With Kicbak */}
            <div className="flow-card kicbak" style={{ padding: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--emerald-400)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  With Kicbak
                </span>
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'white' }}>Value Circulates</h3>
              <p style={{ color: 'var(--purple-200)', marginBottom: '2rem' }}>Everyone in the network wins</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  { icon: '👤', text: 'Your guest checks out' },
                  { icon: '🏨', text: 'They book a network property' },
                  { icon: '💰', text: 'You earn revenue share' }
                ].map((step, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
                    <span style={{ fontSize: '1.25rem' }}>{step.icon}</span>
                    <span style={{ color: 'var(--purple-100)' }}>{step.text}</span>
                  </div>
                ))}
              </div>

              <div style={{
                marginTop: '2rem',
                padding: '1rem',
                background: 'rgba(16, 185, 129, 0.2)',
                borderRadius: '12px',
                textAlign: 'center',
                color: 'var(--emerald-300)',
                fontWeight: 600
              }}>
                You win. Booking stays direct.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-purple" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="section-label">How It Works</span>
            <h2>Two flows. One network.</h2>
            <p>One delivers bookings now. The other turns your past guests into recurring revenue.</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '2rem',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            {/* Receive Bookings Card */}
            <div className="card-premium" style={{ padding: '2.5rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '56px',
                height: '56px',
                background: 'var(--gray-100)',
                borderRadius: '16px',
                marginBottom: '1.5rem',
                color: 'var(--gray-600)'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Receive Bookings</h3>
              <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>Get new direct bookings from the network</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  'List your property in the Kicbak network',
                  'Guests book directly on your site',
                  'Pay only when a booking completes'
                ].map((step, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div className="number-badge" style={{ flexShrink: 0 }}>{i + 1}</div>
                    <span style={{ color: 'var(--gray-700)', paddingTop: '4px' }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Your Guests Card */}
            <div className="card-premium" style={{ padding: '2.5rem', border: '2px solid var(--purple-600)', position: 'relative' }}>
              <span className="badge badge-purple" style={{ position: 'absolute', top: '-12px', left: '1.5rem' }}>
                Long-term Value
              </span>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, var(--purple-600), var(--purple-700))',
                borderRadius: '16px',
                marginBottom: '1.5rem',
                color: 'white'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Add Your Guests</h3>
              <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>Turn past guests into recurring revenue</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  'Invite your past guests to the network',
                  'When they book you, keep full margin',
                  'When they book others, earn revenue'
                ].map((step, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div className="number-badge-filled" style={{
                      flexShrink: 0,
                      background: 'var(--purple-600)',
                      color: 'white',
                      width: '32px',
                      height: '32px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-bold)'
                    }}>{i + 1}</div>
                    <span style={{ color: 'var(--gray-700)', paddingTop: '4px' }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Guarantees */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '2rem',
            marginTop: '4rem'
          }}>
            {[
              'Bookings stay direct',
              'You control pricing',
              'You own the guest',
              'No new middleman'
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                background: 'var(--white)',
                borderRadius: '100px',
                boxShadow: 'var(--shadow-sm)',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: 'var(--gray-700)'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--emerald-500)" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Why Kicbak</span>
            <h2>Everyone in the ecosystem wins.</h2>
            <p>Kicbak creates value for every participant—not just the platform.</p>
          </div>

          <div className="tabs">
            <button
              className={`tab ${activeTab === 'travelers' ? 'active' : ''}`}
              onClick={() => setActiveTab('travelers')}
            >
              Travelers
            </button>
            <button
              className={`tab ${activeTab === 'operators' ? 'active' : ''}`}
              onClick={() => setActiveTab('operators')}
            >
              Travel Operators
            </button>
            <button
              className={`tab ${activeTab === 'affiliates' ? 'active' : ''}`}
              onClick={() => setActiveTab('affiliates')}
            >
              Affiliates
            </button>
            <button
              className={`tab ${activeTab === 'travel-tech' ? 'active' : ''}`}
              onClick={() => setActiveTab('travel-tech')}
            >
              Industry Partners
            </button>
          </div>

          {activeTab === 'travelers' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '1.5rem',
              maxWidth: '900px',
              margin: '0 auto'
            }}>
              {travelerBenefits.map((benefit, index) => (
                <div key={index} className="feature-item" style={{
                  padding: '1.5rem',
                  background: 'var(--white)',
                  borderRadius: '16px',
                  border: '1px solid var(--gray-100)',
                  boxShadow: 'var(--shadow-soft)'
                }}>
                  <div className="feature-icon" style={{ marginBottom: '1rem' }}>
                    {benefit.icon}
                  </div>
                  <h4 style={{ marginBottom: '0.5rem' }}>{benefit.title}</h4>
                  <p style={{ color: 'var(--gray-600)', margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>{benefit.description}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'operators' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '1.5rem',
              maxWidth: '900px',
              margin: '0 auto'
            }}>
              {operatorBenefits.map((benefit, index) => (
                <div key={index} className="feature-item" style={{
                  padding: '1.5rem',
                  background: 'var(--white)',
                  borderRadius: '16px',
                  border: '1px solid var(--gray-100)',
                  boxShadow: 'var(--shadow-soft)'
                }}>
                  <div className="feature-icon" style={{ marginBottom: '1rem' }}>
                    {benefit.icon}
                  </div>
                  <h4 style={{ marginBottom: '0.5rem' }}>{benefit.title}</h4>
                  <p style={{ color: 'var(--gray-600)', margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>{benefit.description}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'affiliates' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '1.5rem',
              maxWidth: '900px',
              margin: '0 auto'
            }}>
              {affiliateBenefits.map((benefit, index) => (
                <div key={index} className="feature-item" style={{
                  padding: '1.5rem',
                  background: 'var(--white)',
                  borderRadius: '16px',
                  border: '1px solid var(--gray-100)',
                  boxShadow: 'var(--shadow-soft)'
                }}>
                  <div className="feature-icon" style={{ marginBottom: '1rem' }}>
                    {benefit.icon}
                  </div>
                  <h4 style={{ marginBottom: '0.5rem' }}>{benefit.title}</h4>
                  <p style={{ color: 'var(--gray-600)', margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>{benefit.description}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'travel-tech' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '1.5rem',
              maxWidth: '900px',
              margin: '0 auto'
            }}>
              {techBenefits.map((benefit, index) => (
                <div key={index} className="feature-item" style={{
                  padding: '1.5rem',
                  background: 'var(--white)',
                  borderRadius: '16px',
                  border: '1px solid var(--gray-100)',
                  boxShadow: 'var(--shadow-soft)'
                }}>
                  <div className="feature-icon" style={{ marginBottom: '1rem' }}>
                    {benefit.icon}
                  </div>
                  <h4 style={{ marginBottom: '0.5rem' }}>{benefit.title}</h4>
                  <p style={{ color: 'var(--gray-600)', margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>{benefit.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Economics Section */}
      <section className="section-purple" id="economics">
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '4rem',
            alignItems: 'center',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            <div>
              <span className="section-label">The Math</span>
              <h2 style={{ marginTop: '1rem' }}>Stop paying full commissions.</h2>
              <p style={{ fontSize: '1.125rem', color: 'var(--gray-600)', marginTop: '1.5rem', lineHeight: 1.8 }}>
                OTAs take 15–30% of every booking and own the guest relationship.
                Kicbak reroutes that spend—rewarding guests who book direct and compensating
                operators who contribute guests.
              </p>
              <div style={{
                marginTop: '2rem',
                padding: '1.5rem',
                background: 'var(--white)',
                borderRadius: '16px',
                border: '1px solid var(--gray-200)'
              }}>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--gray-500)',
                  marginBottom: '0.75rem'
                }}>Example</div>
                <p style={{ color: 'var(--gray-700)', margin: 0, lineHeight: 1.7 }}>
                  A $300/night booking costs <strong style={{ color: 'var(--error)' }}>$45–90 with OTAs</strong>. With Kicbak, your effective
                  cost trends lower as you contribute guests—<strong style={{ color: 'var(--purple-600)' }}>and you keep the relationship</strong>.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{
                padding: '2rem',
                background: 'var(--white)',
                borderRadius: '20px',
                border: '1px solid var(--gray-200)',
                opacity: 0.8
              }}>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#DC2626',
                  marginBottom: '0.5rem'
                }}>OTAs</div>
                <div style={{
                  fontSize: '3rem',
                  fontWeight: 900,
                  color: '#DC2626',
                  textDecoration: 'line-through',
                  lineHeight: 1
                }}>15–30%</div>
                <p style={{ color: 'var(--gray-500)', margin: '0.75rem 0 0', fontSize: '0.9rem' }}>Fixed commission. They keep the guest.</p>
              </div>

              <div style={{
                padding: '2rem',
                background: 'linear-gradient(135deg, rgba(91, 45, 142, 0.05) 0%, var(--white) 100%)',
                borderRadius: '20px',
                border: '2px solid var(--purple-600)',
                position: 'relative'
              }}>
                <span className="badge badge-purple" style={{ position: 'absolute', top: '-10px', right: '1rem' }}>
                  Better
                </span>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--purple-600)',
                  marginBottom: '0.5rem'
                }}>Kicbak</div>
                <div style={{
                  fontSize: '3rem',
                  fontWeight: 900,
                  color: 'var(--purple-600)',
                  lineHeight: 1
                }}>Net Lower</div>
                <p style={{ color: 'var(--gray-600)', margin: '0.75rem 0 0', fontSize: '0.9rem' }}>Costs balance. You keep the guest.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq">
        <div className="container">
          <div className="section-header">
            <span className="section-label">FAQ</span>
            <h2>Common questions</h2>
          </div>

          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className={`faq-item ${openFaq === index ? 'open' : ''}`}>
                <button
                  className="faq-question"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span>{faq.question}</span>
                  <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
                <div className="faq-answer">
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-dark-gradient cta-section" id="cta">
        <div className="container">
          <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <span className="badge" style={{
              background: 'rgba(255,255,255,0.1)',
              color: 'var(--purple-200)',
              marginBottom: '1.5rem',
              display: 'inline-flex',
              gap: '0.5rem'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Launching Soon
            </span>
            <h2 style={{ color: 'var(--white)', fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '1rem' }}>
              Ready to change the game?
            </h2>
            <p style={{ color: 'var(--purple-200)', fontSize: '1.125rem', marginTop: '1rem', marginBottom: '2.5rem', lineHeight: 1.7 }}>
              Stop losing money on guests you've already earned. Join the operators building a better system.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/join" className="btn btn-lg" style={{
                background: 'var(--white)',
                color: 'var(--purple-700)',
                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.3)'
              }}>
                Join the Waitlist
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '8px' }}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/about" className="btn btn-outline-white btn-lg">
                Learn About the Alliance
              </Link>
            </div>
            <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: 'var(--purple-300)' }}>
              Alliance members get early access when Kicbak launches.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
