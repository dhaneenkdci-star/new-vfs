import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, ShieldCheck, Building2, User, KeyRound, ArrowRight, Star, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function GlobalHome() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('userInfo'));

  const handleGetStarted = () => {
    if (user) {
      navigate('/agent-dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div style={{ fontFamily: "'Outfit', 'Inter', sans-serif", color: '#0c2340', backgroundColor: '#ffffff' }}>
      
      {/* Premium Hero Section */}
      <section className="hero" style={{ 
        padding: '100px 20px 120px', 
        position: 'relative',
        backgroundImage: 'linear-gradient(135deg, #0c2340 0%, #1e3a8a 100%)',
        color: '#ffffff',
        textAlign: 'center',
        borderBottom: '5px solid #dfa015'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <span style={{ 
            backgroundColor: 'rgba(223, 160, 21, 0.2)', 
            color: '#dfa015', 
            padding: '6px 16px', 
            borderRadius: '20px', 
            fontSize: '13px', 
            fontWeight: '700', 
            textTransform: 'uppercase', 
            letterSpacing: '1px',
            marginBottom: '20px',
            display: 'inline-block'
          }}>
            Exclusive B2B SaaS Visa Booking Portal
          </span>
          <h1 style={{ fontSize: '46px', fontWeight: '800', lineHeight: '1.2', marginBottom: '20px', color: '#ffffff' }}>
            Scale Your Visa Agency With <span style={{ color: '#dfa015' }}>Dream Catcher Portal</span>
          </h1>
          <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '40px', maxWidth: '750px', margin: '0 auto 40px', lineHeight: '1.6' }}>
            Automated slot monitoring, instant client bookings, centralized applications management, and automated GST billing. Exclusively for travel agencies, visa consultants, and immigration experts.
          </p>

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={handleGetStarted} className="btn" style={{
              padding: '14px 35px',
              fontSize: '16px',
              fontWeight: '700',
              backgroundColor: '#dfa015',
              color: '#0c2340',
              border: 'none',
              borderRadius: '4px',
              boxShadow: '0 4px 15px rgba(223,160,21,0.3)',
              cursor: 'pointer'
            }}>
              Register Your Agency
            </button>
            <Link to="/login" className="btn" style={{
              padding: '14px 35px',
              fontSize: '16px',
              fontWeight: '700',
              border: '2px solid #ffffff',
              backgroundColor: 'transparent',
              color: '#ffffff',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              Agent Sign-In
            </Link>
          </div>
        </div>
      </section>

      {/* SaaS Feature Highlights */}
      <section className="container" style={{ padding: '80px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#0c2340', marginBottom: '15px' }}>
            Powerful Agency Booking Engine
          </h2>
          <p style={{ color: '#64748b', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
            Everything your visa consultancy needs to manage and scale operations.
          </p>
        </div>

        <div className="grid-cols-3" style={{ gap: '30px' }}>
          <div className="card" style={{ padding: '30px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ backgroundColor: 'rgba(12,35,64,0.05)', color: '#0c2340', padding: '16px', borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>⚡</span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', border: 'none', padding: 0 }}>Instant Slot Monitoring</h3>
            <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.6' }}>
              Query and view real-time visa slot availability across centers instantly. Keep tabs on capacity.
            </p>
          </div>

          <div className="card" style={{ padding: '30px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ backgroundColor: 'rgba(12,35,64,0.05)', color: '#0c2340', padding: '16px', borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>📁</span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', border: 'none', padding: 0 }}>Centralized Client Files</h3>
            <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.6' }}>
              Upload passports and documents, log internal notes, and track all customer applications in a single secure environment.
            </p>
          </div>

          <div className="card" style={{ padding: '30px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ backgroundColor: 'rgba(12,35,64,0.05)', color: '#0c2340', padding: '16px', borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>🧾</span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', border: 'none', padding: 0 }}>Automated Tax Invoices</h3>
            <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.6' }}>
              Provide your GST number at signup to automatically receive valid PDF tax invoices for input tax credits.
            </p>
          </div>
        </div>
      </section>

      {/* Subscription Benefits & Stats */}
      <section id="benefits" style={{ backgroundColor: '#f8fafc', padding: '80px 20px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '50px', alignItems: 'center' }}>
            <div style={{ flex: '1 1 450px' }}>
              <span style={{ color: '#dfa015', fontWeight: '700', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Subscription Benefits
              </span>
              <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#0c2340', marginTop: '10px', marginBottom: '20px', lineHeight: '1.3' }}>
                Why Leading Agencies Choose Our Portal
              </h2>
              <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.7', marginBottom: '25px' }}>
                We provide a professional, enterprise-level booking portal built on high reliability. Our agents save hours of manual slot-searching every day.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                  <span style={{ fontSize: '14px', color: '#334155' }}><strong>99.9% Uptime:</strong> Reliable connection with VFS replication servers.</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                  <span style={{ fontSize: '14px', color: '#334155' }}><strong>Dual-Layer Expiry Sweeper:</strong> Automated 30-day billing cycle locks.</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                  <span style={{ fontSize: '14px', color: '#334155' }}><strong>Priority Notifications:</strong> Real-time alerts when center slots open.</span>
                </div>
              </div>
            </div>
            
            <div style={{ flex: '1 1 350px', backgroundColor: '#0c2340', padding: '40px', borderRadius: '8px', color: '#ffffff', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <h3 style={{ color: '#dfa015', fontSize: '20px', fontWeight: '700', marginBottom: '15px', border: 'none', padding: 0 }}>Agency Success Stats</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', marginTop: '30px' }}>
                <div>
                  <div style={{ fontSize: '36px', fontWeight: '800', color: '#ffffff' }}>₹4.2M+</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>GST Billed & Saved for Input Credits</div>
                </div>
                <div>
                  <div style={{ fontSize: '36px', fontWeight: '800', color: '#ffffff' }}>12,000+</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Client Visa Appointments Booked Successfully</div>
                </div>
                <div>
                  <div style={{ fontSize: '36px', fontWeight: '800', color: '#ffffff' }}>150+</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Active Registered Visa Consultants</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ marginBottom: '50px' }}>
          <span style={{ color: '#dfa015', fontWeight: '700', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Transparent Pricing
          </span>
          <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#0c2340', marginTop: '10px' }}>
            Professional Agent Subscription Plan
          </h2>
        </div>

        <div style={{
          maxWidth: '460px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          border: '2px solid #dfa015',
          borderRadius: '8px',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
          padding: '40px 30px',
          position: 'relative'
        }}>
          <span style={{
            position: 'absolute',
            top: '-15px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#dfa015',
            color: '#0c2340',
            padding: '4px 16px',
            fontSize: '11px',
            fontWeight: '800',
            textTransform: 'uppercase',
            borderRadius: '12px'
          }}>
            Most Popular
          </span>
          
          <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '10px', border: 'none', padding: 0 }}>Professional Plan</h3>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '25px' }}>Best for active visa processing centers</p>
          
          <div style={{ margin: '30px 0' }}>
            <span style={{ fontSize: '42px', fontWeight: '800', color: '#0c2340' }}>₹1</span>
            <span style={{ color: '#64748b', fontSize: '16px' }}> + GST / Month</span>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>Total Billed: ₹1.00 (₹0.85 base + GST)</div>
          </div>

          <button onClick={handleGetStarted} className="btn btn-primary" style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#0c2340',
            color: '#ffffff',
            fontWeight: '700',
            borderRadius: '4px',
            marginBottom: '30px',
            border: 'none',
            fontSize: '15px'
          }}>
            Subscribe & Start Booking
          </button>

          <ul style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '15px', paddingLeft: 0, listStyle: 'none' }}>
            <li style={{ fontSize: '13px', display: 'flex', gap: '10px' }}>
              <span style={{ color: '#10b981' }}>✔</span> Unlimited Slot Searches
            </li>
            <li style={{ fontSize: '13px', display: 'flex', gap: '10px' }}>
              <span style={{ color: '#10b981' }}>✔</span> Priority Slot Reservation Locking
            </li>
            <li style={{ fontSize: '13px', display: 'flex', gap: '10px' }}>
              <span style={{ color: '#10b981' }}>✔</span> Central Agent Client Manager
            </li>
            <li style={{ fontSize: '13px', display: 'flex', gap: '10px' }}>
              <span style={{ color: '#10b981' }}>✔</span> Fast Document Upload & Tracking
            </li>
            <li style={{ fontSize: '13px', display: 'flex', gap: '10px' }}>
              <span style={{ color: '#10b981' }}>✔</span> Downloadable GST Invoices
            </li>
          </ul>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ backgroundColor: '#0c2340', color: '#ffffff', padding: '80px 20px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '40px', color: '#ffffff' }}>
            What Our Partner Agencies Say
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginTop: '20px' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '4px', textAlign: 'left' }}>
              <p style={{ fontStyle: 'italic', fontSize: '14px', opacity: 0.9, lineHeight: '1.7', marginBottom: '20px' }}>
                "We process over 200 UK visas monthly. The automated slot monitoring and priority locking in this B2B SaaS portal have completely revolutionized our operations. Our input tax credits are instantly saved."
              </p>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Mehta Visa Consultants</div>
              <div style={{ fontSize: '12px', color: '#dfa015' }}>Managing Director</div>
            </div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '4px', textAlign: 'left' }}>
              <p style={{ fontStyle: 'italic', fontSize: '14px', opacity: 0.9, lineHeight: '1.7', marginBottom: '20px' }}>
                "Since switching to the Agent Booking model, we no longer need to coordinate multiple individual client logins. The centralized dashboard is super efficient, and document tracking is extremely safe."
              </p>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Stellar Global Immigration</div>
              <div style={{ fontSize: '12px', color: '#dfa015' }}>Operations Lead</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container" style={{ padding: '80px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#0c2340' }}>Frequently Asked Questions</h2>
        </div>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#0c2340', marginBottom: '8px' }}>Who is this portal for?</h4>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6' }}>
              This portal is exclusively designed for B2B visa consultants, immigration companies, and travel agencies who book and manage UK visa applications for their clients.
            </p>
          </div>
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#0c2340', marginBottom: '8px' }}>How long is the subscription valid and how does renewal work?</h4>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6' }}>
              The subscription is valid for exactly 30 days from activation. You can renew before expiration to extend your validity. If you renew after expiration, the new 30 days start from the day of renewal.
            </p>
          </div>
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#0c2340', marginBottom: '8px' }}>What happens when my subscription expires?</h4>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6' }}>
              You will still be able to log in, view dashboard statistics, download GST invoices, and track your previous bookings. However, you will not be able to monitor slots or book new appointments.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
