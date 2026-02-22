import React, { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';

type Props = {
  children: ReactNode;
  title?: string;
  description?: string;
};

const Layout: React.FC<Props> = ({
  children,
  title = 'Direct Booking Alliance',
  description =
    'The Direct Booking Alliance unites travel operators, tech companies, and industry allies to shift bookings direct and return value to those who create travel experiences.'
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change or resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>

      <header>
        <nav>
          <Link href="/" className="nav-logo">
            <img src="/dba-logo.png" alt="Direct Booking Alliance" height={40} />
          </Link>

          {/* Desktop nav links */}
          <ul className="nav-links nav-desktop">
            <li>
              <Link href="/about">About Us</Link>
            </li>
            <li>
              <Link href="/members">Members</Link>
            </li>
            <li>
              <Link href="/join" className="btn btn-primary">
                Join the Alliance
              </Link>
            </li>
          </ul>

          {/* Hamburger button for mobile */}
          <button
            className={`mobile-menu-btn ${mobileMenuOpen ? 'open' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Mobile menu overlay */}
          <div
            className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`}
            onClick={closeMenu}
          ></div>

          {/* Mobile nav menu */}
          <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
            <ul className="mobile-nav-links">
              <li>
                <Link href="/about" onClick={closeMenu}>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/members" onClick={closeMenu}>
                  Members
                </Link>
              </li>
              <li>
                <Link href="/join" className="btn btn-primary" onClick={closeMenu}>
                  Join the Alliance
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </header>

      <main>{children}</main>

      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link
                href="/"
                className="nav-logo footer-brand-link"
              >
                Direct Booking Alliance
              </Link>
              <p>
                <strong className="footer-mission-label">Mission:</strong><br />
                Uniting travel operators, tech companies, and industry allies to shift bookings direct.
              </p>
            </div>

            <div>
              <h4 className="footer-heading">Alliance</h4>
              <ul className="footer-links">
                <li>
                  <Link href="/about">About Us</Link>
                </li>
                <li>
                  <Link href="/members">Members</Link>
                </li>
                <li>
                  <Link href="/join">Join the Alliance</Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="footer-heading">Community</h4>
              <ul className="footer-links">
                <li>
                  <a href="https://www.linkedin.com/groups/14748012" target="_blank" rel="noopener noreferrer">
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} Direct Booking Alliance™. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Layout;
