import { GetStaticPaths, GetStaticProps } from 'next';
import Layout from '../../components/Layout';
import MemberProfile from '../../components/MemberProfile';
import { Member } from '../../components/MemberCard';
import Link from 'next/link';
import membersData from '../../data/members.json';

interface MemberPageProps {
  member: Member | null;
}

export default function MemberPage({ member }: MemberPageProps) {
  if (!member) {
    return (
      <Layout title="Member Not Found | Direct Booking Alliance">
        <section className="section-purple" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <h1>Member Not Found</h1>
            <p style={{ color: 'var(--gray-600)', marginBottom: '2rem' }}>
              The requested member could not be found.
            </p>
            <Link href="/members" className="btn btn-primary">
              View All Members
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout title={`${member.name} | Direct Booking Alliance`}>
      <section style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <MemberProfile member={member} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-purple">
        <div className="container">
          <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <h2>Join the Alliance</h2>
            <p style={{ color: 'var(--gray-600)', marginBottom: '2rem' }}>
              Be part of the movement shifting the travel industry toward direct bookings.
            </p>
            <Link href="/join" className="btn btn-primary btn-lg">
              Join the Alliance
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const members: Member[] = (membersData as unknown) as Member[];
  const paths = members.map((member) => ({
    params: { slug: member.slug || member.id }
  }));
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { slug } = context.params as { slug: string };
  const members: Member[] = (membersData as unknown) as Member[];
  const member = members.find((m) => (m.slug || m.id) === slug) || null;
  return {
    props: {
      member,
    },
  };
};
