import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Hero from '../components/Hero';
import { ShieldCheck, Mail, Phone, HelpCircle, FileText, Globe } from 'lucide-react';

const INFO_CONTENT = {
  about: {
    title: 'About VFS Global',
    subtitle: 'Learn about the world\'s largest visa outsourcing specialist',
    content: (
      <div>
        <p style={{ marginBottom: '15px' }}>
          VFS Global is the world's largest outsourcing and technology services specialist for governments and diplomatic missions worldwide. With 3,400+ application centres operating in 150+ countries, we serve 67 client governments.
        </p>
        <p style={{ marginBottom: '15px' }}>
          We manage the administrative and non-judgmental tasks related to visa, passport, and consular services for our client governments. This enables diplomatic missions to focus entirely on the critical task of assessment.
        </p>
        <h4 style={{ color: '#0c2340', fontWeight: 'bold', margin: '20px 0 10px' }}>Our History</h4>
        <p>
          Founded in 2001, VFS Global pioneered the concept of visa outsourcing. Today, we have successfully processed over 280 million applications globally, providing exceptional customer experience, data security, and operational excellence.
        </p>
      </div>
    )
  },
  careers: {
    title: 'Careers at VFS Global',
    subtitle: 'Explore professional opportunities across our global network',
    content: (
      <div>
        <p style={{ marginBottom: '15px' }}>
          At VFS Global, our people are our greatest asset. With a diverse workforce representing over 130 nationalities, we offer a dynamic, multicultural work environment and extensive growth opportunities.
        </p>
        <h4 style={{ color: '#0c2340', fontWeight: 'bold', margin: '20px 0 10px' }}>Active Job Openings (India Centres)</h4>
        <div style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '4px', marginBottom: '15px', backgroundColor: '#f8f9fa' }}>
          <strong style={{ color: '#0c2340', display: 'block' }}>Visa Operations Officer - Delhi & Mumbai</strong>
          <span style={{ fontSize: '13px', color: '#666' }}>Full-Time | Operations Department</span>
          <p style={{ fontSize: '13px', marginTop: '8px', color: '#555' }}>
            Responsible for managing biometrics capture, checking checklist completeness, and delivering passports securely to applicants.
          </p>
        </div>
        <div style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
          <strong style={{ color: '#0c2340', display: 'block' }}>Customer Support Executive - Bangalore, Hyderabad & Chennai</strong>
          <span style={{ fontSize: '13px', color: '#666' }}>Full-Time | Customer Relations</span>
          <p style={{ fontSize: '13px', marginTop: '8px', color: '#555' }}>
            Responsible for assisting applicants with value-added premium services, scheduling inquiries, and document submission workflows.
          </p>
        </div>
      </div>
    )
  },
  media: {
    title: 'Media Centre',
    subtitle: 'Stay updated with official VFS Global press releases and announcements',
    content: (
      <div>
        <h4 style={{ color: '#0c2340', fontWeight: 'bold', margin: '0 0 15px' }}>Press Releases</h4>
        <div style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' }}>
          <span style={{ fontSize: '12px', color: '#e86020', fontWeight: 'bold' }}>June 10, 2026</span>
          <h5 style={{ fontSize: '16px', color: '#0c2340', fontWeight: 'bold', margin: '5px 0' }}>VFS Global India upgrades biometrics infrastructure</h5>
          <p style={{ fontSize: '13px', color: '#555' }}>
            The UK Visa Application Centres in Delhi, Mumbai, Bangalore, Hyderabad, and Chennai have successfully deployed high-capacity fingerprint scanners and automated document upload systems to reduce wait times.
          </p>
        </div>
        <div style={{ borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
          <span style={{ fontSize: '12px', color: '#e86020', fontWeight: 'bold' }}>May 24, 2026</span>
          <h5 style={{ fontSize: '16px', color: '#0c2340', fontWeight: 'bold', margin: '5px 0' }}>Warning against recruitment fraud and unauthorized agents</h5>
          <p style={{ fontSize: '13px', color: '#555' }}>
            VFS Global reminds applicants that we do not charge job search fees and do not guarantee visa approvals. Always verify center information directly.
          </p>
        </div>
      </div>
    )
  },
  contact: {
    title: 'Contact Us',
    subtitle: 'Get in touch with our UK Visa Application Centres in India',
    content: (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          <div>
            <h4 style={{ color: '#0c2340', fontWeight: 'bold', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={18} style={{ color: '#e86020' }} /> Email & Support
            </h4>
            <p style={{ fontSize: '14px', color: '#555', marginBottom: '12px' }}>
              For queries related to appointments, application checklist, and premium service upgrades:
              <br />
              <strong style={{ color: '#0c2340' }}>india.uksupport@vfsglobal.com</strong>
            </p>
          </div>
          <div>
            <h4 style={{ color: '#0c2340', fontWeight: 'bold', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={18} style={{ color: '#e86020' }} /> Helpline Numbers
            </h4>
            <p style={{ fontSize: '14px', color: '#555' }}>
              General UK Visa Helpline: <strong>+91 22 6786 6000</strong>
              <br />
              <span style={{ fontSize: '12px', color: '#666' }}>(Available Monday to Friday, 08:00 – 17:00 IST)</span>
            </p>
          </div>
        </div>
        <h4 style={{ color: '#0c2340', fontWeight: 'bold', margin: '30px 0 15px' }}>Official Centre Locations</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', fontSize: '13px', color: '#555' }}>
          <div style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '4px', backgroundColor: '#f8fafc' }}>
            <strong style={{ color: '#0c2340', display: 'block', marginBottom: '5px' }}>Delhi Centre</strong>
            Shivaji Stadium Metro Station, Concourse Level, Baba Kharak Singh Marg, Connaught Place, New Delhi - 110001.
          </div>
          <div style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '4px', backgroundColor: '#f8fafc' }}>
            <strong style={{ color: '#0c2340', display: 'block', marginBottom: '5px' }}>Mumbai Centre</strong>
            Trade Centre, G-Block, Ground Floor, Bandra Kurla Complex, Bandra (East), Mumbai - 400051.
          </div>
          <div style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '4px', backgroundColor: '#f8fafc' }}>
            <strong style={{ color: '#0c2340', display: 'block', marginBottom: '5px' }}>Bangalore Centre</strong>
            Gopalan Innovation Mall, 22, Bannerghatta Main Road, JP Nagar 3rd Phase, Bangalore - 560076.
          </div>
          <div style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '4px', backgroundColor: '#f8fafc' }}>
            <strong style={{ color: '#0c2340', display: 'block', marginBottom: '5px' }}>Hyderabad Centre</strong>
            8-2-248/1/7/25, 2nd Floor, Uptown Cyber, Road No. 3, Banjara Hills, Hyderabad - 500034.
          </div>
          <div style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '4px', backgroundColor: '#f8fafc' }}>
            <strong style={{ color: '#0c2340', display: 'block', marginBottom: '5px' }}>Chennai Centre</strong>
            Fagun Towers, Third Floor, No. 74, Ethiraj Salai, Egmore, Chennai - 600008.
          </div>
        </div>
      </div>
    )
  },
  faq: {
    title: 'Frequently Asked Questions (FAQs)',
    subtitle: 'Answers to common questions regarding appointments and submissions',
    content: (
      <div>
        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ fontWeight: 'bold', color: '#0c2340', fontSize: '15px', marginBottom: '5px' }}>1. Can I submit my visa application without an appointment?</h5>
          <p style={{ fontSize: '13px', color: '#555' }}>
            No. Submission and biometrics enrollment at our India centres are conducted strictly on a pre-booked appointment basis. You must book a slot online.
          </p>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ fontWeight: 'bold', color: '#0c2340', fontSize: '15px', marginBottom: '5px' }}>2. Can I carry my mobile phone inside the centre?</h5>
          <p style={{ fontSize: '13px', color: '#555' }}>
            Mobile phones, tablets, smartwatches, and laptops are not permitted inside the biometrics room for security reasons. They must be powered off or left in lockers if available.
          </p>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ fontWeight: 'bold', color: '#0c2340', fontSize: '15px', marginBottom: '5px' }}>3. How can I receive updates about my passport processing?</h5>
          <p style={{ fontSize: '13px', color: '#555' }}>
            You can track your status live on our Track page, or purchase our SMS Alert Service during checkout to receive automated text messages.
          </p>
        </div>
      </div>
    )
  },
  feedback: {
    title: 'Feedback & Complaints',
    subtitle: 'Share your experience or file a customer service complaint',
    content: (
      <div>
        <p style={{ marginBottom: '15px' }}>
          VFS Global values customer satisfaction. If you want to submit suggestions, leave positive feedback about a staff member, or file a complaint regarding the service received, please write to us.
        </p>
        <div className="card" style={{ maxWidth: '500px', margin: '20px 0', padding: '20px' }}>
          <h5 style={{ fontWeight: 'bold', color: '#0c2340', marginBottom: '15px' }}>Submit Feedback Form</h5>
          <form onSubmit={(e) => { e.preventDefault(); alert('Feedback submitted successfully!'); }}>
            <div className="form-group">
              <label className="form-label">Feedback Type</label>
              <select className="form-control">
                <option>General Feedback</option>
                <option>Staff Appreciation</option>
                <option>Complaint/Grievance</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Message Details</label>
              <textarea className="form-control" rows="4" style={{ resize: 'none' }} placeholder="Please write your review details..."></textarea>
            </div>
            <button type="submit" className="btn btn-secondary" style={{ width: '100%' }}>Submit Review</button>
          </form>
        </div>
      </div>
    )
  },
  refund: {
    title: 'Refund Policy',
    subtitle: 'Terms and conditions for requesting service fee refunds',
    content: (
      <div>
        <p style={{ marginBottom: '15px' }}>
          Service fee refunds are processed in accordance with VFS Global refund guidelines:
        </p>
        <ul style={{ paddingLeft: '20px', fontSize: '14px', color: '#555', marginBottom: '20px' }}>
          <li style={{ marginBottom: '8px' }}>Refund requests must be submitted at least 48 hours prior to your scheduled appointment.</li>
          <li style={{ marginBottom: '8px' }}>No refunds will be granted for appointments missed or cancelled late.</li>
          <li style={{ marginBottom: '8px' }}>Refunds for Value-Added Services (e.g. Courier, Premium Lounge) will not be eligible if services have already been rendered.</li>
        </ul>
        <p style={{ fontSize: '13px', color: '#666' }}>
          Refunds are credited back to the original UPI account within 7 to 10 working days.
        </p>
      </div>
    )
  },
  security: {
    title: 'Security & Fraud Awareness',
    subtitle: 'Protect yourself against recruitment scams and fake visa offers',
    content: (
      <div>
        <div style={{ backgroundColor: '#fffbeb', borderLeft: '4px solid #f59e0b', color: '#78350f', padding: '15px', borderRadius: '4px', marginBottom: '25px', display: 'flex', gap: '15px' }}>
          <ShieldCheck size={44} style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ display: 'block', fontSize: '15px', marginBottom: '5px' }}>Security Advisory</strong>
            <span style={{ fontSize: '13px', lineHeight: 1.5 }}>
              VFS Global will never ask you to make payments via phone, SMS, or email. Visa assessment and decisions are made solely by the embassy or consulate. Any agent claiming they can guarantee a visa for a fee is fraudulent.
            </span>
          </div>
        </div>
        <p style={{ marginBottom: '15px' }}>
          If you receive suspicious calls or emails offering visa guarantees or job offers in the name of VFS Global, please immediately report the incident to <strong style={{ color: '#0c2340' }}>security.fraud@vfsglobal.com</strong>.
        </p>
      </div>
    )
  },
  documents: {
    title: 'UK Visa Document Checklist',
    subtitle: 'Ensure you carry these required documents to the Visa Application Centre',
    content: (
      <div>
        <p style={{ marginBottom: '20px' }}>
          Please make sure you bring the following mandatory documents on the day of your biometrics appointment:
        </p>
        <ul style={{ paddingLeft: '20px', fontSize: '14px', color: '#555', lineHeight: '1.7' }}>
          <li style={{ marginBottom: '10px' }}><strong>Appointment Confirmation:</strong> A printed copy of your booking confirmation email showing the date, time, and reference number.</li>
          <li style={{ marginBottom: '10px' }}><strong>Valid Passport:</strong> Your current passport (must have blank pages and be valid for at least 6 months) along with any historical passports.</li>
          <li style={{ marginBottom: '10px' }}><strong>GOV.UK Document Checklist:</strong> A printed copy of the application checklist generated from the official UK visa system.</li>
          <li style={{ marginBottom: '10px' }}><strong>Supporting Evidence:</strong> Financial statements, proof of employment, accommodation documents, etc. (unless you opted for digital pre-scanning).</li>
          <li style={{ marginBottom: '10px' }}><strong>TB Certificate:</strong> If applying for long-term categories from India (required under UKVI health rules).</li>
        </ul>
      </div>
    )
  },
  privacy: {
    title: 'Privacy Notice',
    subtitle: 'How VFS Global handles and protects your personal credentials',
    content: (
      <div>
        <p style={{ marginBottom: '15px' }}>
          VFS Global is committed to protecting applicant privacy. In the course of processing visa applications, we collect and transfer data to government departments strictly under the instructions of client governments.
        </p>
        <p style={{ marginBottom: '15px' }}>
          We do not store visa application forms or supporting documents on our local servers once biometrics are enrolled and data transmission to the client government (UKVI) is complete.
        </p>
        <p style={{ fontSize: '13px', color: '#666' }}>
          We comply with international data security standards, including ISO 27001 (Information Security Management) and local regulations (such as DPA and GDPR guidelines).
        </p>
      </div>
    )
  },
  terms: {
    title: 'Terms & Conditions',
    subtitle: 'Operating rules for scheduling services through VFS Global',
    content: (
      <div>
        <p style={{ marginBottom: '15px' }}>
          By booking an appointment and using value-added premium services through this portal, you agree to these Terms and Conditions:
        </p>
        <ul style={{ paddingLeft: '20px', fontSize: '14px', color: '#555', marginBottom: '20px', lineHeight: '1.6' }}>
          <li style={{ marginBottom: '8px' }}>VFS Global acts solely as an outsourcing service provider for biometrics collection and administrative document transmission.</li>
          <li style={{ marginBottom: '8px' }}>We have no influence or authority over visa grant approvals or processing times, which are decided solely by UK Visas and Immigration.</li>
          <li style={{ marginBottom: '8px' }}>You must arrive at the Visa Application Centre 15 minutes before your slot time. Late arrivals may need to reschedule and forfeit fees.</li>
        </ul>
      </div>
    )
  },
  cookies: {
    title: 'Cookie Policy',
    subtitle: 'Information about how we use tracking cookies on this site',
    content: (
      <div>
        <p style={{ marginBottom: '15px' }}>
          Our website uses cookies to enhance user experience, remember selected country options, and verify authentication state.
        </p>
        <h4 style={{ color: '#0c2340', fontWeight: 'bold', margin: '20px 0 10px' }}>Types of Cookies We Use</h4>
        <ul style={{ paddingLeft: '20px', fontSize: '14px', color: '#555' }}>
          <li style={{ marginBottom: '8px' }}><strong>Strictly Necessary:</strong> Required for site navigation, auth session tokens, and security.</li>
          <li style={{ marginBottom: '8px' }}><strong>Functional Cookies:</strong> Remember selections (such as selected source and destination countries).</li>
        </ul>
      </div>
    )
  },
  disclaimer: {
    title: 'Disclaimer',
    subtitle: 'General disclaimer regarding visa outsourcing services',
    content: (
      <div>
        <p style={{ marginBottom: '15px' }}>
          VFS Global is an outsourcing service partner and acts as a facilitator. We do not assess visa applications and do not guarantee visa approvals or interview schedules.
        </p>
        <p>
          Information published regarding timing and holidays at our India Visa Application Centres is subject to change based on diplomatic updates. Always verify details beforehand.
        </p>
      </div>
    )
  }
};

export default function InfoPage() {
  const { pageKey } = useParams();

  // Scroll to top when pageKey changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pageKey]);

  const pageData = INFO_CONTENT[pageKey] || {
    title: 'Page Not Found',
    subtitle: 'The requested information page could not be located.',
    content: <p>Please use the links in the footer navigation to access valid page content.</p>
  };

  return (
    <div>
      <Hero title={pageData.title} subtitle={pageData.subtitle} />
      <div className="container" style={{ maxWidth: '800px', minHeight: '400px', lineHeight: '1.7' }}>
        <div className="card" style={{ padding: '40px' }}>
          {pageData.content}
          
          <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
            <Link to="/" style={{ color: '#e86020', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
              &larr; Back to Portal Home
            </Link>
            <Link to="/attend-centre/delhi" style={{ color: '#0c2340', fontWeight: 'bold' }}>
              View Visa Application Centre Details &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
