import React from 'react';
import Link from 'next/link';
import { Member, getMemberRoles, isTeamMember, roleConfig } from './MemberCard';

interface MemberProfileProps {
  member: Member;
}

const typeLabels: Record<string, string> = {
  'operator': 'Operators',
  'partner': 'Tech & Services',
  'distribution': 'Consumer Platforms',
  'association': 'Industry Organizations',
  'creator': 'Creators & Media'
};

const MemberProfile: React.FC<MemberProfileProps> = ({ member }) => {
  const roles = getMemberRoles(member);
  const isTeam = isTeamMember(member);
  const tags = isTeam ? [] : (member.tags || []);
  const hasBrandAsset = Boolean(member.logo || member.photo);

  return (
    <article>
      {/* Back link */}
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/members" style={{ color: 'var(--purple-600)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ← Back to Members
        </Link>
      </div>

      {/* Profile header */}
      <div style={{
        display: 'flex',
        gap: '2rem',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        {/* Logo/Photo placeholder */}
        <div
          className={`member-profile-logo ${!hasBrandAsset ? 'member-fallback-logo-box' : ''}`}
          style={{
            width: '250px',
            height: '250px',
            borderRadius: hasBrandAsset ? '0' : '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden'
          }}
        >
          {hasBrandAsset ? (
            <img
              src={member.logo || member.photo}
              alt={member.name}
              className="member-profile-logo-image"
            />
          ) : (
            <span className="member-card-logo-fallback member-fallback-logo-letter">
              {member.name.charAt(0)}
            </span>
          )}
        </div>

        {/* Name and category/location */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>{member.name}</h1>

          {(member.category || member.location) && (
            <p style={{ fontSize: '1.125rem', color: 'var(--gray-500)', margin: 0 }}>
              {member.category}{member.category && member.location ? ' • ' : ''}{member.location}
            </p>
          )}
        </div>
      </div>

      {/* Category tags */}
      {(!isTeam || roles.length > 0 || tags.length > 0) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {!isTeam && (
            <span
              style={{
                display: 'inline-block',
                padding: '0.25rem 0.75rem',
                background: 'var(--purple-100)',
                color: 'var(--purple-700)',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            >
              {typeLabels[member.type] || member.type}
            </span>
          )}
          {roles.map(role => (
            <span
              key={role}
              style={{
                display: 'inline-block',
                padding: '0.25rem 0.75rem',
                background: roleConfig[role].bgColor,
                color: roleConfig[role].color,
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            >
              {roleConfig[role].label}
            </span>
          ))}
          {tags.map(tag => (
            <span
              key={tag}
              style={{
                display: 'inline-block',
                padding: '0.25rem 0.75rem',
                background: 'var(--gray-100)',
                color: 'var(--gray-700)',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Description */}
      <div style={{
        background: 'var(--gray-50)',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{ marginBottom: '1rem' }}>About</h3>
        <p style={{ color: 'var(--gray-700)', lineHeight: 1.75, fontSize: '1.125rem', margin: 0 }}>
          {member.description}
        </p>
      </div>

      {/* Links and social */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        {member.website && (
          <a
            href={member.website}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            Visit Website →
          </a>
        )}
        {member.socialLinks?.linkedin && (
          <a
            href={member.socialLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
          >
            LinkedIn
          </a>
        )}
        {member.socialLinks?.twitter && (
          <a
            href={member.socialLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
          >
            Twitter
          </a>
        )}
      </div>
    </article>
  );
};

export default MemberProfile;
