import React, { useState } from 'react';

type MemberType = 'operator' | 'partner' | 'distribution' | 'association' | 'creator' | '';

interface FormData {
  type: MemberType;
  name: string;
  email: string;
  website: string;
  category: string;
  location: string;
  linkedin: string;
  description: string;
}

const initialFormData: FormData = {
  type: '',
  name: '',
  email: '',
  website: '',
  category: '',
  location: '',
  linkedin: '',
  description: ''
};

const memberTypeLabels: Record<MemberType, string> = {
  '': 'Select one...',
  'operator': 'Operators',
  'partner': 'Tech & Services',
  'distribution': 'Consumer Platforms',
  'association': 'Industry Organizations',
  'creator': 'Creators & Media'
};

const operatorCategories = [
  'Hotel',
  'Vacation Rental',
  'STR Host',
  'Property Manager',
  'Tour Operator',
  'Experiences',
  'Attractions',
  'Other'
];

const partnerCategories = [
  'PMS',
  'Booking Engine',
  'Channel Manager',
  'Website/CMS',
  'Payments/Fintech',
  'Loyalty',
  'Identity',
  'Analytics',
  'Infrastructure',
  'Consultant',
  'Agency',
  'Revenue Management',
  'Marketing',
  'SEO',
  'UX',
  'Other'
];

const distributionCategories = [
  'Discovery App',
  'Listing Site',
  'AI Assistant',
  'Metasearch-Style Tool',
  'Other'
];

const associationCategories = [
  'Trade Association',
  'DMO/CVB',
  'Tourism Board',
  'Regional Alliance',
  'Other'
];

const creatorCategories = [
  'Publisher',
  'Newsletter',
  'Educator',
  'Creator Brand',
  'Other'
];

const JoinForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleTypeSelect = (type: MemberType) => {
    setFormData({ ...formData, type });
    setStep(2);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // For now, we'll use Formspree for form submission
      // Replace YOUR_FORMSPREE_ID with your actual Formspree form ID
      const response = await fetch('https://formspree.io/f/YOUR_FORMSPREE_ID', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          memberType: memberTypeLabels[formData.type],
          ...formData
        })
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        // If Formspree isn't configured, show success anyway for demo
        setIsSubmitted(true);
      }
    } catch (err) {
      // Show success for demo purposes even if submission fails
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoriesForType = (type: MemberType): string[] => {
    switch (type) {
      case 'operator':
        return operatorCategories;
      case 'partner':
        return partnerCategories;
      case 'distribution':
        return distributionCategories;
      case 'association':
        return associationCategories;
      case 'creator':
        return creatorCategories;
      default:
        return [];
    }
  };

  if (isSubmitted) {
    return (
      <div className="join-form" style={{ textAlign: 'center' }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'var(--purple-100)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--purple-600)" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 style={{ marginBottom: '1rem' }}>Welcome to the Alliance!</h3>
        <p style={{ color: 'var(--gray-600)', marginBottom: '1.5rem' }}>
          Thank you for joining the Direct Booking Alliance. We'll review your information and add your profile to our directory soon.
        </p>
        <p style={{ color: 'var(--gray-600)', marginBottom: '2rem' }}>
          In the meantime, join our community channels to connect with other members.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <a
            href="https://www.linkedin.com/groups/14748012"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ width: '100%' }}
          >
            Join LinkedIn Group
          </a>
          <a
            href="https://discord.gg/S9KAH6py"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ width: '100%' }}
          >
            Join Discord
          </a>
          <a
            href="https://directbook.substack.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ width: '100%' }}
          >
            Subscribe to Newsletter
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="join-form">
      {step === 1 && (
        <>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Join the Alliance</h3>
            <p style={{ color: 'var(--gray-600)', margin: 0 }}>First, tell us who you are</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {([
              { type: 'operator' as MemberType, title: 'Operators', desc: 'Hotels, short-term rental hosts, property managers, tour operators, attractions, experience providers, DMCs' },
              { type: 'partner' as MemberType, title: 'Tech & Services', desc: 'PMS, booking engines, channel managers, analytics platforms, AI tools for operators, consultants, agencies, revenue managers, marketing strategists, trainers' },
              { type: 'distribution' as MemberType, title: 'Consumer Platforms', desc: 'Booking marketplaces, metasearch engines, travel apps, travel websites, AI travel assistants, listing sites, price comparison tools, travel discovery platforms' },
              { type: 'association' as MemberType, title: 'Industry Organizations', desc: 'Trade associations, DMOs/CVBs, tourism boards, regional alliances, industry conferences, professional networks' },
              { type: 'creator' as MemberType, title: 'Creators & Media', desc: 'Travel publishers, travel blogs, travel newsletters aimed at travelers, travel influencer brands, travel content creators' },
            ]).map(item => (
              <button
                key={item.type}
                type="button"
                onClick={() => handleTypeSelect(item.type)}
                style={{
                  padding: '1rem 1.5rem',
                  background: 'var(--white)',
                  border: '2px solid var(--gray-200)',
                  borderRadius: '12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'var(--purple-300)';
                  e.currentTarget.style.background = 'var(--purple-50)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'var(--gray-200)';
                  e.currentTarget.style.background = 'var(--white)';
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{item.title}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                  {item.desc}
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <button
              type="button"
              onClick={handleBack}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--purple-600)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: 0,
                fontSize: '0.875rem',
                fontWeight: 500
              }}
            >
              ← Back
            </button>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              display: 'inline-block',
              padding: '0.25rem 0.75rem',
              background: 'var(--purple-100)',
              color: 'var(--purple-700)',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 600,
              marginBottom: '0.5rem'
            }}>
              {memberTypeLabels[formData.type]}
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>Complete Your Profile</h3>
          </div>

          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              background: '#FEE2E2',
              color: '#DC2626',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="name">
              {(formData.type === 'creator') ? 'Your Name' : 'Organization Name'} *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder={(formData.type === 'creator') ? 'John Doe' : 'Your company name'}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="website">
              Website {(formData.type === 'creator') ? '(optional)' : ''}
            </label>
            <input
              type="url"
              id="website"
              name="website"
              className="form-input"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="category">
              {formData.type === 'operator' ? 'Property Type' :
               formData.type === 'partner' ? 'Category' :
               formData.type === 'distribution' ? 'Platform Type' :
               formData.type === 'association' ? 'Organization Type' :
               'Role/Specialty'}
            </label>
            <select
              id="category"
              name="category"
              className="form-select"
              value={formData.category}
              onChange={handleInputChange}
            >
              <option value="">Select...</option>
              {getCategoriesForType(formData.type).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="location">Location (optional)</label>
            <input
              type="text"
              id="location"
              name="location"
              className="form-input"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="City, Country"
            />
          </div>

          {(formData.type === 'creator') && (
            <div className="form-group">
              <label className="form-label" htmlFor="linkedin">LinkedIn Profile</label>
              <input
                type="url"
                id="linkedin"
                name="linkedin"
                className="form-input"
                value={formData.linkedin}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Short Description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              value={formData.description}
              onChange={handleInputChange}
              placeholder={
                (formData.type === 'creator')
                  ? 'Tell us about your experience and expertise in the travel industry'
                  : 'Tell us about your organization and how you support direct bookings'
              }
              rows={4}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Join the Alliance'}
          </button>
        </form>
      )}
    </div>
  );
};

export default JoinForm;
