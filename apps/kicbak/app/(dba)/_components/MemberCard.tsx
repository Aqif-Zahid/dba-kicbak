import React from 'react';
import Link from 'next/link';

export type MemberRole = 'founder' | 'executive-director' | 'director' | 'core-team' | 'ambassador' | 'advisor';

export type Member = {
  id: string;
  slug: string;
  name: string;
  type: 'operator' | 'partner' | 'distribution' | 'association' | 'creator';
  description: string;
  website?: string;
  location?: string;
  category?: string;
  tags?: string[];
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  quote?: string;
  logo?: string;
  photo?: string;
  isAmbassador?: boolean; // Legacy support
  roles?: MemberRole[];
  joinedAt?: string;
};

// Role display configuration
export const roleConfig: Record<MemberRole, { label: string; color: string; bgColor: string }> = {
  'founder': { label: 'Founder', color: 'white', bgColor: 'var(--purple-900)' },
  'executive-director': { label: 'Executive Director', color: 'white', bgColor: 'var(--purple-900)' },
  'director': { label: 'Director', color: 'white', bgColor: 'var(--purple-900)' },
  'core-team': { label: 'Core Team', color: 'white', bgColor: 'var(--purple-700)' },
  'ambassador': { label: 'Ambassador', color: 'white', bgColor: 'var(--purple-600)' },
  'advisor': { label: 'Advisor', color: 'var(--purple-700)', bgColor: 'var(--purple-200)' }
};

// Helper to get all roles including legacy isAmbassador
export const getMemberRoles = (member: Member): MemberRole[] => {
  const roles = member.roles || [];
  // Support legacy isAmbassador field
  if (member.isAmbassador && !roles.includes('ambassador')) {
    return [...roles, 'ambassador'];
  }
  return roles;
};

// Check if member has any team roles (for About page)
export const isTeamMember = (member: Member): boolean => {
  const roles = getMemberRoles(member);
  return roles.some(r => ['founder', 'executive-director', 'director', 'core-team', 'ambassador', 'advisor'].includes(r));
};

interface MemberCardProps {
  member: Member;
}

const typeLabels: Record<string, string> = {
  'operator': 'Operators',
  'partner': 'Tech & Services',
  'distribution': 'Consumer Platforms',
  'association': 'Industry Organizations',
  'creator': 'Creators & Media'
};

const typeColors: Record<string, string> = {
  'operator': 'var(--purple-600)',
  'partner': 'var(--purple-500)',
  'distribution': 'var(--purple-400)',
  'association': 'var(--purple-700)',
  'creator': 'var(--purple-500)'
};

const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  const roles = getMemberRoles(member);
  const isTeam = isTeamMember(member);
  const tags = isTeam ? [] : (member.tags || []);
  const hasBrandAsset = Boolean(member.logo || member.photo);

  return (
    <Link href={`/members/${member.slug || member.id}`} className="member-card-link">
      <div className="card member-directory-card">
        {/* Logo / Avatar */}
        <div className="member-card-logo-wrap">
          <div
            className={`member-card-logo ${!hasBrandAsset ? 'member-fallback-logo-box' : ''}`}
            style={{
              borderRadius: hasBrandAsset ? '0' : '10px'
            }}
          >
            {hasBrandAsset ? (
              <img
                src={member.logo || member.photo}
                alt={member.name}
                className="member-card-logo-image"
              />
            ) : (
              <span className="member-card-logo-fallback member-fallback-logo-letter">{member.name.charAt(0)}</span>
            )}
          </div>
        </div>

        {/* Name */}
        <h3 className="member-card-name">{member.name}</h3>

        {/* Badges */}
        <div className="member-card-badges">
          {!isTeam && (
            <span
              className="member-card-badge"
              style={{
                background: 'var(--purple-100)',
                color: typeColors[member.type] || 'var(--purple-600)'
              }}
            >
              {typeLabels[member.type] || member.type}
            </span>
          )}
          {roles.map(role => (
            <span
              key={role}
              className="member-card-badge"
              style={{
                background: roleConfig[role].bgColor,
                color: roleConfig[role].color
              }}
            >
              {roleConfig[role].label}
            </span>
          ))}
          {tags.map(tag => (
            <span
              key={tag}
              className="member-card-badge member-card-tag"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Category and Location */}
        {(member.category || member.location) && (
          <p className="member-card-meta">
            {member.category}{member.category && member.location ? ' • ' : ''}{member.location}
          </p>
        )}

        {/* Description */}
        <p className="member-card-description">{member.description}</p>
      </div>
    </Link>
  );
};

export default MemberCard;
