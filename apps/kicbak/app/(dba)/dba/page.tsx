"use client";
import { useState, useMemo, useEffect } from 'react';
import Layout from '../_components/Layout';
import Link from 'next/link';
import { Member, isTeamMember } from '../_components/MemberCard';
import membersData from '../_data/members.json';

// Persona data
const personas = [
  {
    id: 'operators',
    title: 'Operators',
    subtitle: 'Hotels, Short-Term Rental Hosts, Property Managers, Tour Operators, Attractions, Experience Providers, DMCs',
    message: 'You want more direct bookings. Less dependency on platforms. Control of your own business and destiny.',
    benefits: [
      'Plug into the direct booking ecosystem',
      'Early access to Kicbak when it launches',
      'Build your direct channel with network support',
      'Connect with travel tech building for direct'
    ],
    cta: 'Join as an Operator',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
      </svg>
    )
  },
  {
    id: 'partner',
    title: 'Tech & Services',
    subtitle: 'PMS, Booking Engines, Channel Managers, Analytics Platforms, AI Tools for Operators, Consultants, Agencies, Revenue Managers, Marketing Strategists',
    message: 'Your clients want more direct bookings. Show them you support their mission.',
    benefits: [
      'Visibility with operators building their direct channel',
      'Listed in the tech & services directory',
      'Opportunity to integrate Kicbak into your platform',
      'Connect with operators and tech companies'
    ],
    cta: 'Join as Tech & Services',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    )
  },
  {
    id: 'distribution',
    title: 'Consumer Platforms',
    subtitle: 'Booking Marketplaces, Metasearch Engines, Travel Apps, Travel Websites, AI Travel Assistants, Listing Sites, Price Comparison Tools, Travel Discovery Platforms',
    message: 'You\'re building a new kind of distribution. One that doesn\'t extract — it empowers.',
    benefits: [
      'Be recognized as an operator-aligned distribution channel',
      'Connect with operators looking for alternatives',
      'Shape the future of direct-friendly discovery'
    ],
    cta: 'Join as a Consumer Platform',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    )
  },
  {
    id: 'associations',
    title: 'Industry Organizations',
    subtitle: 'Trade Associations, DMOs/CVBs, Tourism Boards, Regional Alliances, Industry Conferences, Professional Networks',
    message: 'Your members are asking how to drive direct bookings. Here\'s how you help them.',
    benefits: [
      'Align with a mission your members care about',
      'Connect your members to the direct booking ecosystem',
      'Be recognized as a leader on this issue'
    ],
    cta: 'Join as an Industry Organization',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  },
  {
    id: 'creators',
    title: 'Creators & Media',
    subtitle: 'Travel Publishers, Travel Blogs, Travel Newsletters, Travel Influencer Brands, Travel Content Creators',
    message: 'You shape the conversation around travel. Help amplify the direct booking movement.',
    benefits: [
      'Visibility within the direct booking community',
      'Connect with operators and industry leaders',
      'Be part of the narrative shifting the industry'
    ],
    cta: 'Join as a Creator',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    )
  }
];

// FAQ data
const faqs = [
  {
    question: 'What is the Direct Booking Alliance?',
    answer: 'A coalition of travel operators, tech companies, industry organizations, and individuals united around promoting direct bookings in the travel industry. We\'re building an ecosystem where value stays with those who create travel experiences.'
  },
  {
    question: 'What is Kicbak?',
    answer: 'Kicbak is our first initiative—a network where operators share guests directly instead of losing them to OTAs. Operators can give guests rewards at no cost, own their guests across the network forever, and earn revenue when those guests book elsewhere in the network.'
  },
  {
    question: 'Who can join?',
    answer: 'Anyone who supports the mission of promoting direct bookings. Travel operators (hotels, vacation rentals, tours, experiences), travel tech companies, industry organizations, and individual practitioners are all welcome.'
  },
  {
    question: 'Is this anti-OTA?',
    answer: 'No. OTAs provide value—selection, convenience, trust. We believe in balance and choice. We\'re building an alternative ecosystem, not attacking what exists. Operators deserve options.'
  },
  {
    question: 'What do I get as a member?',
    answer: 'A profile in our member directory, visibility within the alliance, connection to others building the direct booking ecosystem, and early access to Kicbak when it launches.'
  },
  {
    question: 'What does it cost?',
    answer: 'Membership is currently free.'
  }
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activePersona, setActivePersona] = useState(0);

  // Social proof: all members with logos, excluding team members, in random order
  // Initialize with unshuffled list for SSR, then shuffle on client to avoid hydration mismatch
  const initialMembers = (membersData as Member[]).filter(
    m => !isTeamMember(m) && m.logo && m.logo.trim() !== ''
  );
  const [featuredMembers, setFeaturedMembers] = useState<Member[]>(initialMembers);
  const [featuredMembersRow2, setFeaturedMembersRow2] = useState<Member[]>(initialMembers);

  useEffect(() => {
    // Shuffle each row independently on client mount to avoid SSR/client mismatch
    setFeaturedMembers(prev => [...prev].sort(() => Math.random() - 0.5));
    setFeaturedMembersRow2(prev => [...prev].sort(() => Math.random() - 0.5));
  }, []);

  // Dynamic member count for social proof heading
  const totalMemberCount = useMemo(() => {
    return (membersData as Member[]).filter(m => !isTeamMember(m)).length;
  }, []);

  // Dynamic marquee duration for consistent scroll speed
  const marqueeDuration = useMemo(() => {
    if (featuredMembers.length === 0) return 80; // fallback

    // Constants for calculation
    const DESKTOP_ITEM_WIDTH = 200; // 160px max-width + 40px gap
    const TARGET_SPEED_PX_PER_SEC = 40; // 40px/sec set manually by Arlen

    // Calculate duration based on logo count
    const trackWidth = featuredMembers.length * DESKTOP_ITEM_WIDTH;
    const duration = trackWidth / TARGET_SPEED_PX_PER_SEC;

    // Return duration in seconds, with reasonable bounds
    return Math.max(20, Math.min(duration, 200));
  }, [featuredMembers.length]);

  return (
    <Layout title="Direct Booking Alliance | for Hotel, Short Term Rental & Experience Operators">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg-elements">
          <div className="hero-orb hero-orb-1"></div>
          <div className="hero-orb hero-orb-2"></div>
          <div className="hero-grid-pattern"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="hero-line">Get Listed.</span>{' '}
              <span className="hero-line hero-title-accent-secondary">Get Discovered.</span>{' '}
              <span className="hero-line hero-title-accent">Get Connected.</span>
            </h1>
            <p className="hero-subtitle">
              The Direct Booking Alliance is an open industry association for everyone who supports the direct booking ecosystem.
            </p>
            <div className="hero-cta">
              <Link href="/join" className="btn btn-primary btn-lg">
                Join the Alliance
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '8px' }}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/about" className="btn btn-secondary btn-lg">
                Learn More
              </Link>
            </div>
            {/* Alliance Supporters — Auto-scrolling Logo Marquee */}
            {featuredMembers.length > 0 && (
              <div className="social-proof-section hero-social-proof">
                <p className="social-proof-heading">
                  Join <span className="social-proof-count">{totalMemberCount} members</span> building the direct booking future.
                </p>
                <div
                  className="social-proof-marquee"
                  style={{ '--marquee-duration': `${marqueeDuration}s` } as React.CSSProperties}
                >
                  <div className="social-proof-marquee-track">
                    {featuredMembers.map((member) => (
                      <Link
                        key={member.id}
                        href={`/members/${member.slug || member.id}`}
                        className="social-proof-logo-link"
                        title={member.name}
                      >
                        <img
                          src={member.logo}
                          alt={member.name}
                          className="social-proof-logo-img"
                        />
                      </Link>
                    ))}
                    {featuredMembers.map((member) => (
                      <Link
                        key={`dup-${member.id}`}
                        href={`/members/${member.slug || member.id}`}
                        className="social-proof-logo-link"
                        title={member.name}
                        aria-hidden="true"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <img
                          src={member.logo}
                          alt=""
                          className="social-proof-logo-img"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
                <div
                  className="social-proof-marquee social-proof-marquee-reverse social-proof-marquee-hidden"
                  style={{ '--marquee-duration': `${marqueeDuration}s` } as React.CSSProperties}
                  aria-hidden="true"
                >
                  <div className="social-proof-marquee-track">
                    {featuredMembersRow2.map((member) => (
                      <Link
                        key={member.id}
                        href={`/members/${member.slug || member.id}`}
                        className="social-proof-logo-link"
                        title={member.name}
                      >
                        <img
                          src={member.logo}
                          alt={member.name}
                          className="social-proof-logo-img"
                        />
                      </Link>
                    ))}
                    {featuredMembersRow2.map((member) => (
                      <Link
                        key={`dup-${member.id}`}
                        href={`/members/${member.slug || member.id}`}
                        className="social-proof-logo-link"
                        title={member.name}
                        aria-hidden="true"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <img
                          src={member.logo}
                          alt=""
                          className="social-proof-logo-img"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* The Challenge Section */}
      <section className="section-white">
        <div className="container">
          <div className="section-header">
            <span className="section-label">The Challenge</span>
            <h2>Why Operators Need an Alliance</h2>
            <p>The system is stacked against independent operators. Here&apos;s why going it alone isn&apos;t working.</p>
          </div>

          <div className="problems-grid">
            <div className="problem-card">
              <div className="problem-number">01</div>
              <div className="problem-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <h3>Direct Bookings Are Hard Alone</h3>
              <p>
                Competing against platforms with massive reach, billions in ad spend, and deep network effects is an uphill battle for any individual operator.
              </p>
            </div>

            <div className="problem-card">
              <div className="problem-number">02</div>
              <div className="problem-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3>Most Guests Never Return</h3>
              <p>
                Travelers explore new destinations. Their lifetime value walks out the door — and straight back to the OTA for their next trip.
              </p>
            </div>

            <div className="problem-card">
              <div className="problem-number">03</div>
              <div className="problem-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3>$80B Extracted Every Year</h3>
              <p>
                Commissions flow to platforms instead of staying with operators. The industry subsidizes its own disruption.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Alliance / Mission Section */}
      <section className="section-dark mission-section">
        <div className="mission-bg-elements">
          <div className="mission-line mission-line-1"></div>
          <div className="mission-line mission-line-2"></div>
        </div>
        <div className="container">
          <div className="mission-content">
            <span className="section-label">The Movement</span>
            <h2>The Direct Booking Alliance</h2>
            <p className="mission-statement">
              We are a coalition of travel operators, tech & services providers, consumer platforms, industry organizations, creators & media, and allies building
              an ecosystem where <strong>value stays with those who create it.</strong>
            </p>
            <div className="mission-pillars">
              <div className="mission-pillar">
                <div className="mission-pillar-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h4>Operator-First</h4>
                <p>Everything we build serves the operator. Not the platform. Not the middleman.</p>
              </div>
              <div className="mission-pillar">
                <div className="mission-pillar-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
                <h4>Open Coalition</h4>
                <p>Anyone who supports direct bookings can join. No gatekeeping. No exclusivity.</p>
              </div>
              <div className="mission-pillar">
                <div className="mission-pillar-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <h4>Action-Oriented</h4>
                <p>We don&apos;t just talk about change. We build tools and infrastructure to make it real.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Initiatives Section */}
      <section className="section-purple initiatives-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">What We&apos;re Building</span>
            <h2>Alliance Initiatives</h2>
            <p>Concrete tools and programs designed to shift the balance of power back to operators.</p>
          </div>

          <div className="initiatives-grid">
            {/* Kicbak Initiative */}
            <div className="initiative-card initiative-card-featured">
              <div className="initiative-badge">Flagship Initiative</div>
              <div className="initiative-header">
                <div className="initiative-icon initiative-icon-primary">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div>
                  <h3>Kicbak</h3>
                  <span className="initiative-status initiative-status-coming">
                    <span className="initiative-status-dot"></span>
                    Coming Soon
                  </span>
                </div>
              </div>
              <p className="initiative-description">
                A cooperative network where operators share guests directly instead of losing them to OTAs.
                When your past guests book other properties in the network, you earn revenue. When their
                guests book you, they earn. All bookings stay direct.
              </p>
              <div className="initiative-highlights">
                <div className="initiative-highlight">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Turn past guests into recurring revenue</span>
                </div>
                <div className="initiative-highlight">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>$0 upfront cost — pay only on completed stays</span>
                </div>
                <div className="initiative-highlight">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>You own the guest relationship forever</span>
                </div>
              </div>
              <Link href="/join" className="btn btn-primary">
                Join the Alliance for Kicbak Updates
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '6px' }}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Direct Distribution Channel Manager Initiative */}
            <div className="initiative-card">
              <div className="initiative-badge initiative-badge-secondary">New Initiative</div>
              <div className="initiative-header">
                <div className="initiative-icon initiative-icon-secondary">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M16 3h5v5" /><path d="M8 3H3v5" /><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3" /><path d="m15 9 6-6" /><path d="M16 21h5v-5" /><path d="M21 21l-7.5-7.5" />
                  </svg>
                </div>
                <div>
                  <h3>Direct Distribution Channel Manager</h3>
                  <span className="initiative-status initiative-status-development">
                    <span className="initiative-status-dot"></span>
                    In Development
                  </span>
                </div>
              </div>
              <p className="initiative-description">
                Sign up once with the Alliance and have your direct booking channel distributed to multiple
                distribution partners. No more onboarding individually with each platform — the Alliance
                connects operators with direct-friendly distribution partners, and vice versa.
              </p>
              <div className="initiative-highlights">
                <div className="initiative-highlight">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>One sign-up, multiple distribution channels</span>
                </div>
                <div className="initiative-highlight">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Each channel has its own terms and policies</span>
                </div>
                <div className="initiative-highlight">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Connects operators and distribution partners at scale</span>
                </div>
              </div>
              <div className="initiative-coming-soon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                <span>Details coming soon — <Link href="/join" style={{ color: 'var(--purple-600)', fontWeight: 600 }}>join the Alliance</Link> to stay updated</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Community — Personas + Social Proof */}
      <section className="section-white personas-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Our Community</span>
            <h2>Join the Alliance</h2>
            <p>Join the growing community of operators, tech & services providers, consumer platforms, industry organizations, and creators & media building the direct booking future.</p>
          </div>

          {/* Persona Tabs */}
          <div className="persona-tabs">
            {personas.map((persona, index) => (
              <button
                key={persona.id}
                className={`persona-tab ${activePersona === index ? 'active' : ''}`}
                onClick={() => setActivePersona(index)}
              >
                <span className="persona-tab-icon">{persona.icon}</span>
                <span className="persona-tab-label">{persona.title}</span>
              </button>
            ))}
          </div>

          {/* Active Persona Content */}
          <div className="persona-display">
            <div className="persona-display-content">
              <div className="persona-display-left">
                <p className="persona-types">{personas[activePersona].subtitle}</p>
                <p className="persona-message">{personas[activePersona].message}</p>
                <ul className="persona-benefits">
                  {personas[activePersona].benefits.map((benefit, i) => (
                    <li key={i}>{benefit}</li>
                  ))}
                </ul>
                <Link href="/join" className="btn btn-primary">
                  {personas[activePersona].cta}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '6px' }}>
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="persona-display-right">
                <div className="persona-display-icon">
                  {personas[activePersona].icon}
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-purple faqs-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Questions</span>
            <h2>Frequently Asked Questions</h2>
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

      {/* Final CTA Section */}
      <section className="section-dark cta-section">
        <div className="cta-bg-elements">
          <div className="cta-orb cta-orb-1"></div>
          <div className="cta-orb cta-orb-2"></div>
        </div>
        <div className="container">
          <div className="cta-content">
            <span className="section-label" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--purple-200)' }}>Get Started</span>
            <h2>Ready to Join the Movement?</h2>
            <p>
              Be part of the alliance building the future of direct bookings in travel.
              Membership is free. The mission is shared.
            </p>
            <div className="cta-buttons">
              <Link href="/join" className="btn btn-lg cta-btn-white">
                Join the Alliance
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '8px' }}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/join" className="btn btn-lg cta-btn-outline">
                Get Kicbak Updates
              </Link>
            </div>
            <p className="cta-note">Alliance members get early access when Kicbak launches.</p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
