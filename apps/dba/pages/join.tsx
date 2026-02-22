import Layout from '../components/Layout';
import JoinForm from '../components/JoinForm';

export default function Join() {
  return (
    <Layout title="Join the Direct Booking Alliance">
      <section className="section-purple" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', maxWidth: '1000px', margin: '0 auto' }}>
            {/* Left side - messaging */}
            <div>
              <span className="section-label">Join the Movement</span>
              <h1 style={{ marginBottom: '1.5rem' }}>Join the Direct Booking Alliance</h1>
              <p style={{ fontSize: '1.125rem', color: 'var(--gray-600)', marginBottom: '2rem' }}>
                Be part of the coalition shifting market power back to those who deliver travel experiences.
                Join operators, tech & services providers, consumer platforms, industry organizations,
                and creators & media building the direct booking future.
              </p>

              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ marginBottom: '1rem' }}>As a member, you'll get:</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--purple-500)', fontWeight: 'bold' }}>→</span>
                    <span>A profile in our public directory</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--purple-500)', fontWeight: 'bold' }}>→</span>
                    <span>Visibility within the alliance community</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--purple-500)', fontWeight: 'bold' }}>→</span>
                    <span>Early access to Kicbak when it launches</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--purple-500)', fontWeight: 'bold' }}>→</span>
                    <span>Connection to the direct booking ecosystem</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right side - form */}
            <div>
              <JoinForm />
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @media (max-width: 768px) {
          section > div > div {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </Layout>
  );
}
