import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-col">
          <h4>About Us</h4>
          <ul className="footer-links">
            <li><Link to="/info/about">About Us</Link></li>
            <li><Link to="/info/careers">Careers</Link></li>
            <li><Link to="/info/media">Media Centre</Link></li>
            <li><Link to="/info/contact">Contact Us</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Agent Support</h4>
          <ul className="footer-links">
            <li><Link to="/info/faq">Agent FAQs</Link></li>
            <li><Link to="/info/feedback">Agency Feedback</Link></li>
            <li><Link to="/info/refund">Refund Policy</Link></li>
            <li><Link to="/info/security">Security & Fraud Awareness</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Visa Services</h4>
          <ul className="footer-links">
            <li><Link to="/book">Book an Appointment</Link></li>
            <li><Link to="/track">Track Application</Link></li>
            <li><Link to="/attend-centre/delhi">Value-Added Services</Link></li>
            <li><Link to="/info/documents">Document Checklists</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Legal Information</h4>
          <ul className="footer-links">
            <li><Link to="/info/privacy">Privacy Notice</Link></li>
            <li><Link to="/info/terms">Terms & Conditions</Link></li>
            <li><Link to="/info/cookies">Cookie Policy</Link></li>
            <li><Link to="/info/disclaimer">Disclaimer</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div>&copy; {new Date().getFullYear()} Dream Catcher Immigrations with VFS Global. All Rights Reserved.</div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <span>ISO 27001 Certified</span>
          <span>ISO 9001 Certified</span>
        </div>
      </div>
    </footer>
  );
}
