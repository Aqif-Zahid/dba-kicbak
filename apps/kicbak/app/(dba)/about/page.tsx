"use client";
import Layout from '../_components/Layout';
import MemberCard, { Member, getMemberRoles, isTeamMember, MemberRole } from '../_components/MemberCard';
import members from '../_data/members.json';

// Get team members sorted by role priority
const getTeamMembers = (allMembers: Member[]) => {
  const teamMembers = allMembers.filter(isTeamMember);

  // Sort by role priority: founder first, then executive director, then directors, then core team, ambassadors, and advisors
  const rolePriority: Record<MemberRole, number> = {
    'founder': 0,
    'executive-director': 1,
    'director': 2,
    'core-team': 3,
    'ambassador': 4,
    'advisor': 5
  };

  return teamMembers.sort((a, b) => {
    const aRoles = getMemberRoles(a);
    const bRoles = getMemberRoles(b);
    const aMinPriority = Math.min(...aRoles.map(r => rolePriority[r] ?? 99));
    const bMinPriority = Math.min(...bRoles.map(r => rolePriority[r] ?? 99));
    return aMinPriority - bMinPriority;
  });
};

export default function About() {
  const teamMembers = getTeamMembers(members as Member[]);
  const values = [
    {
      title: 'Collaboration',
      description: 'We bring the industry together to solve shared challenges and create shared opportunity.'
    },
    {
      title: 'Openness',
      description: 'We welcome broad participation and support open, interoperable systems.'
    },
    {
      title: 'Neutrality',
      description: 'The Alliance serves the ecosystem as a whole, not any single company.'
    }
  ];

  return (
    <Layout title="About | Direct Booking Alliance">
      {/* Hero Section */}
      <section className="hero" style={{ padding: 'var(--space-20) 0 var(--space-12)' }}>
        <div className="hero-bg-elements">
          <div className="hero-orb hero-orb-1"></div>
          <div className="hero-orb hero-orb-2"></div>
        </div>
        <div className="container">
          <div className="section-header" style={{ marginBottom: '0', position: 'relative', zIndex: 1 }}>
            <span className="section-label">Our Story</span>
            <h1 style={{ fontSize: 'var(--text-6xl)', letterSpacing: '-0.03em' }}>About the Alliance</h1>
            <p>
              How a shared frustration became a movement to reshape travel.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section style={{ paddingTop: '2rem' }}>
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="section-dark-gradient" style={{ borderRadius: '24px', padding: 'clamp(2.5rem, 5vw, 4rem)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.15)', color: 'var(--purple-200)', marginBottom: '1.5rem', display: 'inline-flex' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Our Mission
                </span>
                <h3 style={{ color: 'white', marginBottom: '1.5rem', fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>To shift the travel industry toward direct bookings.</h3>
                <p style={{ fontSize: '1.125rem', lineHeight: 1.7, color: 'var(--purple-200)', margin: '0px auto', maxWidth: '550px' }}>
                  Shifting the market toward direct booking is about creating a more economically sustainable future for the travel industry. It’s also about freedom, resilience, and ownership. The Direct Booking Alliance is for here for everyone who wants that future – the travel operators and the industry partners who support them.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Origin Story */}
      <section style={{ paddingTop: '2rem' }}>
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{
              background: 'var(--white)',
              borderRadius: '24px',
              padding: '3rem',
              boxShadow: 'var(--shadow-lg)',
              marginBottom: '3rem'
            }}>
              <h2 style={{ marginBottom: '1.5rem' }}>The Origin Story</h2>

              <div style={{ color: 'var(--gray-700)', lineHeight: 1.8, fontSize: '1.125rem' }}>
                <p>
                  The Direct Booking Alliance started with a simple observation: travel operators were
                  fighting the same battle alone, and losing.
                </p>

                <p>
                  Every operator knows the frustration. You pour your heart into creating amazing
                  experiences. Guests leave glowing reviews. But when it's time to book their next
                  trip? They go back to the OTA. And you pay 15-30% commission—again—on a customer
                  you already earned.
                </p>

                <p>
                  The industry has accepted this as inevitable. "That's just how it works." But it
                  doesn't have to be. The problem isn't that operators can't compete—it's that
                  they're competing alone against platforms with massive network effects.
                </p>

                <p style={{
                  background: 'var(--purple-50)',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  borderLeft: '4px solid var(--purple-600)',
                  margin: '2rem 0',
                  fontStyle: 'italic'
                }}>
                  "Apes together strong." The meme became a mantra. What if operators stopped
                  competing against each other for the same guest, and started cooperating to
                  keep bookings direct?
                </p>

                <p>
                  That's the insight behind the Direct Booking Alliance—and behind Kicbak, our
                  first initiative. Instead of each operator trying to build their own loyalty
                  program that guests ignore, we're creating a network where operators share
                  guests directly.
                </p>

                <p>
                  The Alliance is made up of frustrated travel operators, fair-minded industry
                  veterans, travel tech CEOs, app developers, consultants, and creators. People
                  from across the travel industry who believe there's a better way.
                </p>

                <p style={{ fontWeight: 600, color: 'var(--gray-900)' }}>
                  We're not anti-OTA. We're pro-choice. Operators deserve options. And together,
                  we're building them.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Values Section */}
      <section style={{ paddingTop: '2rem' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: '2.5rem' }}>
            <span className="section-label">Our Principles</span>
            <h2>Our Values</h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            {values.map(value => (
              <article
                key={value.title}
                style={{
                  background: 'var(--white)',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  boxShadow: 'var(--shadow-md)',
                  border: '1px solid var(--gray-100)',
                  height: '100%'
                }}
              >
                <h3 style={{ marginBottom: '0.75rem' }}>{value.title}</h3>
                <p style={{ margin: 0, color: 'var(--gray-700)', lineHeight: 1.7 }}>{value.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section-purple">
        <div className="container">
          <div className="section-header">
            <span className="section-label">The People</span>
            <h2>Team</h2>
            <p>
              The alliance is its members. These individuals help lead and advocate for the movement.
            </p>
          </div>

          {teamMembers.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              {teamMembers.map(member => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>
              <p>Team members coming soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* Join CTA */}
      <section>
        <div className="container">
          <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <h2>Want to Get Involved?</h2>
            <p style={{ color: 'var(--gray-600)', marginBottom: '2rem' }}>
              The alliance grows through its members. Join us and help build the
              future of direct bookings.
            </p>
            <a href="/join" className="btn btn-primary btn-lg">
              Join the Alliance
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
