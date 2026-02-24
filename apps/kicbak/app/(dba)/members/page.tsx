"use client";
import { useState, type Dispatch, type SetStateAction } from 'react';
import { GetStaticProps } from 'next';
import Layout from '../../_components/Layout';
import MemberCard, { Member } from '../../_components/MemberCard';
import Link from 'next/link';
import membersData from '../../_data/members.json';

interface MembersProps {
  members: Member[];
}

const typeFilters = [
  { id: 'operator', label: 'Operators' },
  { id: 'partner', label: 'Tech & Services' },
  { id: 'distribution', label: 'Consumer Platforms' },
  { id: 'association', label: 'Industry Organizations' },
  { id: 'creator', label: 'Creators & Media' }
];

const tagFilters = [
  { id: 'Hotels', label: 'Hotels' },
  { id: 'Short Term Rentals', label: 'Short Term Rentals' },
  { id: 'Experiences', label: 'Experiences' }
];

const hiddenFromDirectory = ['arlen-ritchie', 'kay-walten'];

export default function Members({ members }: MembersProps) {
  const [activeTypeFilters, setActiveTypeFilters] = useState<string[]>([]);
  const [activeTagFilters, setActiveTagFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const visibleMembers = members.filter(m => !hiddenFromDirectory.includes(m.id));

  const toggleFilter = (filterId: string, setFilters: Dispatch<SetStateAction<string[]>>) => {
    setFilters((prevFilters) => (
      prevFilters.includes(filterId)
        ? prevFilters.filter((filter) => filter !== filterId)
        : [...prevFilters, filterId]
    ));
  };

  const filteredMembers = visibleMembers.filter((member) => {
    const matchesTypeFilters = activeTypeFilters.length === 0 || activeTypeFilters.every((filterId) => member.type === filterId);

    const memberTags = member.tags || [];
    const matchesTagFilters = activeTagFilters.length === 0 || activeTagFilters.every((tag) => memberTags.includes(tag));

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = query === '' || [
      member.name,
      member.description,
      member.category,
      member.location,
      member.type,
      member.quote,
      ...(member.tags || []),
    ].some((field) => field?.toLowerCase().includes(query));

    return matchesTypeFilters && matchesTagFilters && matchesSearch;
  }).sort((a, b) => a.name.localeCompare(b.name));

  const getTypeFilterCount = (filterId: string) => {
    return visibleMembers.filter(m => m.type === filterId).length;
  };

  const getTagFilterCount = (filterId: string) => {
    return visibleMembers.filter(m => (m.tags || []).includes(filterId)).length;
  };

  return (
    <Layout title="Alliance Members | Direct Booking Alliance">
      {/* Hero Section */}
      <section className="section-purple" style={{ paddingBottom: '2rem' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: '2rem' }}>
            <span className="section-label">Our Community</span>
            <h1>Alliance Members</h1>
            <p>
              Meet the operators, tech & services providers, consumer platforms, industry organizations,
              and creators & media building the direct booking future together.
            </p>
          </div>

          {/* Filters */}
          <div className="members-filter-tabs" style={{ marginBottom: 0 }}>
            <div className="members-filter-grid">
              <div className="members-filter-group">
                <p className="members-filter-label">Member Type</p>
                <div className="tabs members-filter-chips">
                  {typeFilters.map(filter => {
                    const isActive = activeTypeFilters.includes(filter.id);
                    return (
                      <button
                        key={filter.id}
                        className={`tab ${isActive ? 'active' : ''}`}
                        onClick={() => toggleFilter(filter.id, setActiveTypeFilters)}
                      >
                        {filter.label}
                        <span className="members-filter-count">
                          ({getTypeFilterCount(filter.id)})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="members-filter-group">
                <p className="members-filter-label">Focus Area</p>
                <div className="tabs members-filter-chips">
                  {tagFilters.map(filter => {
                    const isActive = activeTagFilters.includes(filter.id);
                    return (
                      <button
                        key={filter.id}
                        className={`tab ${isActive ? 'active' : ''}`}
                        onClick={() => toggleFilter(filter.id, setActiveTagFilters)}
                      >
                        {filter.label}
                        <span className="members-filter-count">
                          ({getTagFilterCount(filter.id)})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="members-search" style={{ marginTop: '1rem', marginBottom: 0 }}>
            <input
              type="text"
              placeholder="Search members by name or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="members-search-input"
            />
          </div>
        </div>
      </section>

      {/* Members Grid */}
      <section style={{ paddingTop: '2rem', background: '#fdfcfb' }}>
        <div className="container">
          {filteredMembers.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem'
            }}>
              {filteredMembers.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>
                {searchQuery.trim() ? 'No members match your search.' : 'No members found in this category yet.'}
              </p>
              <Link href="/join" className="btn btn-primary">
                Be the First to Join
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-purple">
        <div className="container">
          <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <h2>Join the Alliance</h2>
            <p style={{ color: 'var(--gray-600)', marginBottom: '2rem' }}>
              Add your profile to the directory and be part of the movement
              shifting the travel industry toward direct bookings.
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

export const getStaticProps: GetStaticProps = async () => {
  const members: Member[] = (membersData as unknown) as Member[];
  return {
    props: {
      members,
    },
  };
};
