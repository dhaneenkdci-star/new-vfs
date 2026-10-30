import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, Calendar, ClipboardCheck, FileText, Bell, 
  CreditCard, ShieldCheck, Download, AlertTriangle, ArrowRight, Upload
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function AgentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('userInfo')));
  
  const [activeTab, setActiveTab] = useState('subscription');
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState('purchase'); // purchase or renew
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentDateTime, setPaymentDateTime] = useState('');
  const [enlargeQR, setEnlargeQR] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [accessAlertModal, setAccessAlertModal] = useState(null); // null | 'NoSub' | 'Pending' | 'Expired'

  useEffect(() => {
    const redirectReason = localStorage.getItem('booking_redirect_reason');
    if (redirectReason) {
      localStorage.removeItem('booking_redirect_reason');
      if (redirectReason === 'Verified' || redirectReason === 'Pending') {
        setAccessAlertModal('NoSub');
      } else if (redirectReason === 'Verification Pending') {
        setAccessAlertModal('Pending');
      } else if (redirectReason === 'Expired' || redirectReason === 'Subscription Expired') {
        setAccessAlertModal('Expired');
      } else {
        setAccessAlertModal('NoSub');
      }
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchSubscriptionDetails();
    fetchInvoices();
    fetchBookings();
    fetchNotifications();
  }, [user]);

  const fetchSubscriptionDetails = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/subscription/history', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Set the latest active or most recent subscription
        if (data && data.length > 0) {
          setSubscription(data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
    }
  };

  const fetchInvoices = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/subscription/invoices', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/booking/history', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/subscription/notifications', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const getUPIURI = () => {
    const payUPIId = 'dreamcatcher@upi';
    const payeeName = 'Dream Catcher Immigrations Pvt Ltd';
    const totalAmount = 1.00;
    const currency = 'INR';
    const note = paymentType === 'renew' ? 'Agent Subscription Renewal' : 'Agent Subscription';

    if (!payUPIId) throw new Error('Payee UPI ID is missing.');
    if (!payeeName) throw new Error('Payee Name is missing.');
    if (!totalAmount || totalAmount <= 0) throw new Error('Invalid payment amount.');
    if (currency !== 'INR') throw new Error('Only INR currency is supported for UPI.');

    return `upi://pay?pa=${encodeURIComponent(payUPIId)}&pn=${encodeURIComponent(payeeName)}&am=${totalAmount.toFixed(2)}&cu=${currency}&tn=${encodeURIComponent(note)}`;
  };

  const copyToClipboard = (text, message) => {
    navigator.clipboard.writeText(text);
    alert(message || 'Copied to clipboard!');
  };

  const downloadQR = () => {
    const svgElement = document.getElementById('upi-qr-code-svg');
    if (!svgElement) {
      alert('QR Code SVG element not found.');
      return;
    }
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = 'dreamcatcher_upi_qr.svg';
    downloadLink.click();
  };

  const handleScreenshotUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!transactionId.trim() || transactionId.length < 5) {
      setModalError('Please enter a valid Transaction ID.');
      return;
    }
    if (!screenshot) {
      setModalError('Please upload a payment screenshot/proof.');
      return;
    }

    setModalLoading(true);
    const endpoint = paymentType === 'renew' ? 'renew' : 'purchase';

    try {
      const res = await fetch(`http://localhost:5000/api/subscription/${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ transactionId, screenshot, notes, paymentDateTime })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Payment submission failed.');
      }

      // Update local storage status to Verification Pending
      const updatedUser = { ...user, status: 'Verification Pending' };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setShowPaymentModal(false);
      setTransactionId('');
      setScreenshot('');
      setNotes('');
      setPaymentDateTime('');
      
      // Refresh dashboard info
      fetchSubscriptionDetails();
      fetchInvoices();
      fetchNotifications();
      
      alert('Subscription payment submitted! Access will unlock once the administrator verifies your transaction.');
      window.location.reload();
    } catch (err) {
      setModalError(err.message || 'Server error.');
    } finally {
      setModalLoading(false);
    }
  };

  const downloadInvoicePDF = (inv) => {
    if (!inv.pdfData) {
      alert('Invoice PDF data not loaded.');
      return;
    }
    const linkSource = `data:application/pdf;base64,${inv.pdfData}`;
    const downloadLink = document.createElement("a");
    const fileName = `invoice-${inv.invoiceNumber}.pdf`;
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  };

  const getDaysRemaining = () => {
    if (!subscription || subscription.subscriptionStatus !== 'Active') return 0;
    const expiry = new Date(subscription.expiryDate);
    const today = new Date();
    const diff = expiry - today;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div className="container" style={{ marginTop: '30px', paddingBottom: '60px', fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      
      {/* Upper Agency Profile Header */}
      <div style={{
        backgroundColor: '#0c2340',
        borderRadius: '8px',
        padding: '30px 40px',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '35px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Building2 size={28} style={{ color: '#dfa015' }} />
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>{user.agencyName}</h2>
          </div>
          <p style={{ margin: '5px 0 0 0', opacity: 0.8, fontSize: '14px' }}>
            Owner: <strong>{user.ownerName}</strong> | Email: {user.email} | Mobile: {user.mobile}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '12px', opacity: 0.7, display: 'block' }}>Account Status</span>
            <span style={{ 
              backgroundColor: user.status === 'Active' ? '#10b981' : user.status === 'Pending' ? '#dfa015' : '#ef4444', 
              color: '#ffffff', 
              fontSize: '12px', 
              padding: '3px 10px', 
              borderRadius: '12px',
              fontWeight: 'bold',
              display: 'inline-block',
              marginTop: '3px'
            }}>
              {user.status || 'Pending'}
            </span>
          </div>
          {user.status === 'Active' ? (
            <Link to="/book" className="btn" style={{
              backgroundColor: '#dfa015',
              color: '#0c2340',
              fontWeight: 'bold',
              padding: '10px 20px',
              borderRadius: '4px',
              textDecoration: 'none',
              fontSize: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              Book New Visa <ArrowRight size={15} />
            </Link>
          ) : (
            <div 
              style={{ display: 'inline-block' }}
              title={
                user.status === 'Verification Pending'
                  ? 'Waiting for Admin Payment Verification'
                  : user.status === 'Expired' || user.status === 'Subscription Expired'
                  ? 'Subscription Expired - Renew to Continue'
                  : 'Purchase Subscription for Access'
              }
            >
              <button 
                type="button"
                onClick={() => {
                  if (user.status === 'Verification Pending') {
                    setAccessAlertModal('Pending');
                  } else if (user.status === 'Expired' || user.status === 'Subscription Expired') {
                    setAccessAlertModal('Expired');
                  } else {
                    setAccessAlertModal('NoSub');
                  }
                }}
                style={{
                  backgroundColor: '#94a3b8',
                  color: '#f1f5f9',
                  fontWeight: 'bold',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  border: 'none',
                  fontSize: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'not-allowed',
                  opacity: '0.7'
                }}
              >
                Book New Visa <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Layout */}
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        
        {/* Left Sidebar Navigation */}
        <div style={{ flex: '1 1 240px', maxWidth: '300px' }}>
          <div className="card" style={{ padding: '15px 0', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <button 
              onClick={() => setActiveTab('subscription')} 
              style={{
                textAlign: 'left',
                padding: '12px 20px',
                background: activeTab === 'subscription' ? 'rgba(12,35,64,0.06)' : 'none',
                border: 'none',
                borderLeft: activeTab === 'subscription' ? '4px solid #dfa015' : '4px solid transparent',
                color: activeTab === 'subscription' ? '#0c2340' : '#64748b',
                fontWeight: activeTab === 'subscription' ? '700' : '500',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <CreditCard size={18} /> Dashboard & Subscription
            </button>
            <button 
              onClick={() => setActiveTab('bookings')} 
              style={{
                textAlign: 'left',
                padding: '12px 20px',
                background: activeTab === 'bookings' ? 'rgba(12,35,64,0.06)' : 'none',
                border: 'none',
                borderLeft: activeTab === 'bookings' ? '4px solid #dfa015' : '4px solid transparent',
                color: activeTab === 'bookings' ? '#0c2340' : '#64748b',
                fontWeight: activeTab === 'bookings' ? '700' : '500',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <Calendar size={18} /> Client Bookings
            </button>
            <button 
              onClick={() => setActiveTab('billing')} 
              style={{
                textAlign: 'left',
                padding: '12px 20px',
                background: activeTab === 'billing' ? 'rgba(12,35,64,0.06)' : 'none',
                border: 'none',
                borderLeft: activeTab === 'billing' ? '4px solid #dfa015' : '4px solid transparent',
                color: activeTab === 'billing' ? '#0c2340' : '#64748b',
                fontWeight: activeTab === 'billing' ? '700' : '500',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <FileText size={18} /> Invoices & Billing
            </button>
            <button 
              onClick={() => setActiveTab('notifications')} 
              style={{
                textAlign: 'left',
                padding: '12px 20px',
                background: activeTab === 'notifications' ? 'rgba(12,35,64,0.06)' : 'none',
                border: 'none',
                borderLeft: activeTab === 'notifications' ? '4px solid #dfa015' : '4px solid transparent',
                color: activeTab === 'notifications' ? '#0c2340' : '#64748b',
                fontWeight: activeTab === 'notifications' ? '700' : '500',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                position: 'relative'
              }}
            >
              <Bell size={18} /> Alerts & Notifications
              {notifications.length > 0 && (
                <span style={{ 
                  position: 'absolute', 
                  right: '20px', 
                  backgroundColor: '#ef4444', 
                  color: '#fff', 
                  borderRadius: '50%', 
                  width: '18px', 
                  height: '18px', 
                  fontSize: '10px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>
                  {notifications.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Right Main Content Pane */}
        <div style={{ flex: '1 1 500px' }}>
          
          {/* TAB 1: Subscription Info */}
          {activeTab === 'subscription' && (
            <div className="card" style={{ padding: '30px' }}>
              <h3 style={{ border: 'none', padding: 0, color: '#0c2340', fontWeight: '800', marginBottom: '20px' }}>
                Subscription Overview
              </h3>

              {user.status === 'Pending' ? (
                <div style={{ border: '1px solid #dfa015', backgroundColor: 'rgba(223, 160, 21, 0.05)', padding: '20px', borderRadius: '4px', display: 'flex', gap: '15px' }}>
                  <AlertTriangle size={24} style={{ color: '#dfa015', flexShrink: 0 }} />
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#dfa015', fontWeight: 'bold' }}>Awaiting Verification</h4>
                    <p style={{ margin: 0, fontSize: '13.5px', color: '#555', lineHeight: '1.5' }}>
                      Your agency profile has been submitted and is currently undergoing verification by our administrators. Standard subscription billing and slot bookings will become available once approved.
                    </p>
                  </div>
                </div>
              ) : user.status === 'Blocked' ? (
                <div style={{ border: '1px solid #ef4444', backgroundColor: 'rgba(239, 68, 68, 0.05)', padding: '20px', borderRadius: '4px', display: 'flex', gap: '15px' }}>
                  <AlertTriangle size={24} style={{ color: '#ef4444', flexShrink: 0 }} />
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#ef4444', fontWeight: 'bold' }}>Agency Profile Suspended</h4>
                    <p style={{ margin: 0, fontSize: '13.5px', color: '#555', lineHeight: '1.5' }}>
                      Your travel agency access has been suspended/blocked. Please contact portal support at billing@dreamcatcherimmigrations.com to resolve access issues.
                    </p>
                  </div>
                </div>
              ) : subscription && user.status === 'Active' ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '25px' }}>
                    <div style={{ border: '1px solid #cbd5e1', padding: '15px', borderRadius: '4px', backgroundColor: '#f8fafc' }}>
                      <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Current Tier</span>
                      <strong style={{ fontSize: '16px', color: '#0c2340', marginTop: '5px', display: 'block' }}>{subscription.planName}</strong>
                    </div>
                    <div style={{ border: '1px solid #cbd5e1', padding: '15px', borderRadius: '4px', backgroundColor: '#f8fafc' }}>
                      <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Days Remaining</span>
                      <strong style={{ fontSize: '16px', color: '#10b981', marginTop: '5px', display: 'block' }}>{getDaysRemaining()} Days</strong>
                    </div>
                    <div style={{ border: '1px solid #cbd5e1', padding: '15px', borderRadius: '4px', backgroundColor: '#f8fafc' }}>
                      <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Expiry Date</span>
                      <strong style={{ fontSize: '16px', color: '#0c2340', marginTop: '5px', display: 'block' }}>
                        {new Date(subscription.expiryDate).toLocaleDateString('en-GB')}
                      </strong>
                    </div>
                  </div>

                  {/* Renew Banner */}
                  <div style={{ border: '1px solid #cbd5e1', padding: '20px', borderRadius: '4px', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', color: '#0c2340', fontWeight: '700' }}>Extend Your Booking Cycle</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Extend your active subscription by another 30 days.</p>
                    </div>
                    <button 
                      onClick={() => { setPaymentType('renew'); setShowPaymentModal(true); }}
                      className="btn" 
                      style={{ padding: '8px 18px', backgroundColor: '#0c2340', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      Renew Now
                    </button>
                  </div>
                </div>
              ) : subscription && (subscription.subscriptionStatus === 'Verification Pending' || user.status === 'Verification Pending') ? (
                <div style={{ border: '1px solid #dfa015', backgroundColor: 'rgba(223, 160, 21, 0.03)', padding: '25px', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                    <AlertTriangle size={28} style={{ color: '#dfa015', flexShrink: 0 }} />
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', color: '#0c2340', fontWeight: 'bold', fontSize: '16px' }}>Payment Verification Pending</h4>
                      <p style={{ margin: 0, fontSize: '13.5px', color: '#555', lineHeight: '1.5' }}>
                        Your subscription payment proof has been successfully submitted and is currently pending review by our compliance team. Standard booking access will unlock automatically upon verification.
                      </p>
                    </div>
                  </div>

                  {/* Submission Details */}
                  <div style={{ backgroundColor: '#fff', border: '1px solid #cbd5e1', padding: '15px', borderRadius: '4px', marginBottom: '25px', fontSize: '13px' }}>
                    <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '8px', fontWeight: 'bold', color: '#0c2340' }}>Transaction Reference</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', color: '#64748b' }}>
                      <div>UTR/Txn ID: <strong style={{ color: '#334155' }}>{subscription.transactionId}</strong></div>
                      <div>Plan Amount: <strong style={{ color: '#334155' }}>₹1.00</strong></div>
                      <div>Submitted: <strong style={{ color: '#334155' }}>{new Date(subscription.updatedAt).toLocaleString('en-GB')}</strong></div>
                      <div>Notes: <strong style={{ color: '#334155' }}>{subscription.notes || 'N/A'}</strong></div>
                    </div>
                  </div>

                  {/* Visual Status Timeline */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginTop: '30px', padding: '0 10px' }}>
                    <div style={{ position: 'absolute', top: '15px', left: '10%', right: '10%', height: '2px', backgroundColor: '#e2e8f0', zIndex: 0 }}></div>
                    <div style={{ position: 'absolute', top: '15px', left: '10%', width: '40%', height: '2px', backgroundColor: '#10b981', zIndex: 0 }}></div>
                    
                    <div style={{ zIndex: 1, textAlign: 'center', width: '30%' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontWeight: 'bold' }}>✓</div>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#0c2340' }}>Payment Paid</div>
                    </div>
                    <div style={{ zIndex: 1, textAlign: 'center', width: '30%' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#dfa015', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontWeight: 'bold' }}>✓</div>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#dfa015' }}>Verification Pending</div>
                    </div>
                    <div style={{ zIndex: 1, textAlign: 'center', width: '30%' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#cbd5e1', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontWeight: 'bold' }}>3</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>Portal Activated</div>
                    </div>
                  </div>
                </div>
              ) : subscription && subscription.subscriptionStatus === 'Rejected' ? (
                <div style={{ border: '1px solid #ef4444', backgroundColor: 'rgba(239, 68, 68, 0.02)', padding: '25px', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                    <AlertTriangle size={28} style={{ color: '#ef4444', flexShrink: 0 }} />
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', color: '#ef4444', fontWeight: 'bold', fontSize: '16px' }}>Payment Proof Rejected</h4>
                      <p style={{ margin: 0, fontSize: '13.5px', color: '#555', lineHeight: '1.5' }}>
                        Your subscription payment verification failed. Rejection Reason:
                      </p>
                      <div style={{ backgroundColor: '#fee2e2', padding: '12px', borderLeft: '4px solid #ef4444', color: '#991b1b', fontWeight: 'bold', fontSize: '13px', margin: '10px 0 0' }}>
                        {subscription.rejectionRemarks || 'No details provided.'}
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '20px', marginTop: '20px' }}>
                    <h5 style={{ margin: '0 0 15px 0', color: '#0c2340', fontWeight: 'bold' }}>Resubmit UPI Proof</h5>
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px' }}>Please check your transaction credentials and upload a fresh screenshot.</p>
                    <button 
                      onClick={() => { setPaymentType('purchase'); setShowPaymentModal(true); }}
                      className="btn" 
                      style={{ padding: '10px 24px', backgroundColor: '#ef4444', color: '#fff', border: 'none', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Resubmit Payment Proof
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ border: '1px solid #ef4444', backgroundColor: 'rgba(239, 68, 68, 0.05)', padding: '20px', borderRadius: '4px', textAlign: 'center' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#ef4444', fontWeight: 'bold' }}>Subscription Expired / Inactive</h4>
                  <p style={{ margin: '0 0 20px 0', fontSize: '13.5px', color: '#555', lineHeight: '1.5' }}>
                    You currently do not have an active subscription. Purchase a Professional Agent subscription plan for ₹1 INR (₹0.85 + 18% GST) for 30 days to start querying slots and booking clients.
                  </p>
                  <button 
                    onClick={() => { setPaymentType('purchase'); setShowPaymentModal(true); }}
                    className="btn btn-secondary" 
                    style={{ padding: '12px 28px', backgroundColor: '#ef4444', color: '#fff', border: 'none', fontWeight: 'bold' }}
                  >
                    Purchase Subscription
                  </button>
                </div>
              )}

              <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '35px', paddingTop: '20px' }}>
                <h4 style={{ color: '#0c2340', fontWeight: '700', marginBottom: '10px', fontSize: '15px' }}>Important B2B Billing Details</h4>
                <ul style={{ paddingLeft: '20px', fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>
                  <li>Plan pricing is ₹0.85 + 18% GST (₹0.15) = ₹1 INR total per 30-day cycle.</li>
                  <li>Payments are verified manually using UPI transaction proofs within 5-10 minutes.</li>
                  <li>Invoices showing your agency name and GSTIN are generated instantly upon approval.</li>
                </ul>
              </div>

            </div>
          )}

          {/* TAB 2: Booked Clients */}
          {activeTab === 'bookings' && (
            <div className="card" style={{ padding: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ border: 'none', padding: 0, color: '#0c2340', fontWeight: '800', margin: 0 }}>
                  Client Appointment History
                </h3>
                {user.status === 'Active' && (
                  <Link to="/book" className="btn" style={{ padding: '6px 14px', fontSize: '13px', backgroundColor: '#0c2340', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}>
                    New Booking
                  </Link>
                )}
              </div>

              {bookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  No visa appointments booked yet.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                        <th style={{ padding: '12px 8px' }}>Ref No.</th>
                        <th style={{ padding: '12px 8px' }}>Client Name</th>
                        <th style={{ padding: '12px 8px' }}>Passport</th>
                        <th style={{ padding: '12px 8px' }}>Date & Time</th>
                        <th style={{ padding: '12px 8px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => {
                        const client = booking.applicantDetails && booking.applicantDetails[0];
                        return (
                          <tr key={booking._id} style={{ borderBottom: '1px solid #e2e8f0', color: '#334155' }}>
                            <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>{booking.referenceNumber}</td>
                            <td style={{ padding: '12px 8px' }}>
                              {client ? `${client.firstName} ${client.lastName}` : 'N/A'}
                            </td>
                            <td style={{ padding: '12px 8px' }}>{client ? client.passportNumber : 'N/A'}</td>
                            <td style={{ padding: '12px 8px' }}>
                              {new Date(booking.bookingDate).toLocaleDateString('en-GB')} at {booking.bookingTime}
                            </td>
                            <td style={{ padding: '12px 8px' }}>
                              <span style={{
                                backgroundColor: booking.status === 'BOOKED' ? '#d1fae5' : booking.status === 'Pending Verification' ? '#fef3c7' : '#fee2e2',
                                color: booking.status === 'BOOKED' ? '#065f46' : booking.status === 'Pending Verification' ? '#92400e' : '#991b1b',
                                fontSize: '11px',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                fontWeight: '600'
                              }}>
                                {booking.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Invoices */}
          {activeTab === 'billing' && (
            <div className="card" style={{ padding: '30px' }}>
              <h3 style={{ border: 'none', padding: 0, color: '#0c2340', fontWeight: '800', marginBottom: '20px' }}>
                Invoice & Billing Documents
              </h3>

              {invoices.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  No tax invoices generated yet.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                        <th style={{ padding: '12px 8px' }}>Invoice No.</th>
                        <th style={{ padding: '12px 8px' }}>Date</th>
                        <th style={{ padding: '12px 8px' }}>Base Amt</th>
                        <th style={{ padding: '12px 8px' }}>GST (18%)</th>
                        <th style={{ padding: '12px 8px' }}>Total Amt</th>
                        <th style={{ padding: '12px 8px', textAlign: 'center' }}>PDF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv) => (
                        <tr key={inv._id} style={{ borderBottom: '1px solid #e2e8f0', color: '#334155' }}>
                          <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>{inv.invoiceNumber}</td>
                          <td style={{ padding: '12px 8px' }}>{new Date(inv.createdAt).toLocaleDateString('en-GB')}</td>
                          <td style={{ padding: '12px 8px' }}>₹0.85</td>
                          <td style={{ padding: '12px 8px' }}>₹0.15</td>
                          <td style={{ padding: '12px 8px', fontWeight: '600' }}>₹1.00</td>
                          <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                            <button 
                              onClick={() => downloadInvoicePDF(inv)}
                              style={{ background: 'none', border: 'none', color: '#0c2340', cursor: 'pointer' }}
                              title="Download Tax Invoice"
                            >
                              <Download size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Notifications */}
          {activeTab === 'notifications' && (
            <div className="card" style={{ padding: '30px' }}>
              <h3 style={{ border: 'none', padding: 0, color: '#0c2340', fontWeight: '800', marginBottom: '20px' }}>
                System Alerts & Notifications
              </h3>

              {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  No alerts or notifications.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {notifications.map((n) => (
                    <div 
                      key={n._id} 
                      style={{ 
                        border: '1px solid #e2e8f0', 
                        padding: '15px 20px', 
                        borderRadius: '4px', 
                        backgroundColor: '#f8fafc',
                        display: 'flex',
                        gap: '15px',
                        alignItems: 'flex-start'
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>🔔</span>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0', color: '#0c2340', fontWeight: 'bold', fontSize: '14px' }}>{n.title}</h4>
                        <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#555', lineHeight: '1.5' }}>{n.message}</p>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {new Date(n.createdAt).toLocaleString('en-GB')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Manual UPI Subscription Payment Simulator Modal */}
      {showPaymentModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(12, 35, 64, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            width: '480px',
            padding: '30px',
            borderTop: '5px solid #dfa015',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: '800', color: '#0c2340', border: 'none', padding: 0 }}>
              {paymentType === 'renew' ? 'Renew Portal Subscription' : 'Purchase Portal Subscription'}
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748b' }}>
              B2B SaaS subscription simulation. Complete UPI transfer and upload receipt proof.
            </p>

            {modalError && (
              <div style={{ backgroundColor: '#fee2e2', borderLeft: '4px solid #ef4444', color: '#b91c1c', padding: '10px', fontSize: '13px', borderRadius: '4px', marginBottom: '15px' }}>
                {modalError}
              </div>
            )}

            <div style={{ 
              backgroundColor: '#f8fafc', 
              padding: '20px', 
              borderRadius: '6px', 
              border: '1px solid #e2e8f0', 
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '13px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>UPI Payment Details</div>
              
              <div style={{ margin: '15px 0' }}>
                <span style={{ fontSize: '28px', fontWeight: '800', color: '#0c2340' }}>₹1.00</span>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '2px' }}>₹0.85 + 18% GST (CGST 9% + SGST 9%)</span>
                <button 
                  type="button" 
                  onClick={() => copyToClipboard('1.00', 'Amount ₹1.00 copied!')}
                  style={{
                    padding: '2px 8px',
                    fontSize: '11px',
                    backgroundColor: '#cbd5e1',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    color: '#0c2340',
                    marginLeft: '8px'
                  }}
                >
                  Copy Amt
                </button>
              </div>
              
              <div style={{ fontSize: '14px', color: '#334155', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                UPI ID: <span style={{ color: '#dfa015' }}>dreamcatcher@upi</span>
                <button 
                  type="button" 
                  onClick={() => copyToClipboard('dreamcatcher@upi', 'UPI ID copied!')}
                  style={{
                    padding: '2px 8px',
                    fontSize: '11px',
                    backgroundColor: '#cbd5e1',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    color: '#0c2340'
                  }}
                >
                  Copy
                </button>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>
                Payee: Dream Catcher Immigrations Pvt Ltd
              </div>

              {/* Dynamic QR Code */}
              <div style={{ margin: '15px 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {(() => {
                  try {
                    const upiURI = getUPIURI();
                    return (
                      <div 
                        style={{ cursor: 'pointer', display: 'inline-block', backgroundColor: '#fff', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                        onClick={() => setEnlargeQR(true)}
                        title="Click to enlarge QR Code"
                      >
                        <QRCodeSVG 
                          id="upi-qr-code-svg"
                          value={upiURI}
                          size={150}
                          level="H"
                          includeMargin={true}
                          style={{ display: 'block', margin: '0 auto' }}
                        />
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '5px' }}>🔍 Click to enlarge QR</div>
                      </div>
                    );
                  } catch (err) {
                    return (
                      <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: 'bold', padding: '10px', border: '1px solid #fee2e2', backgroundColor: '#fff5f5', borderRadius: '4px' }}>
                        Error: {err.message}
                      </div>
                    );
                  }
                })()}
              </div>

              <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button 
                  type="button"
                  onClick={downloadQR}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    backgroundColor: '#0c2340',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Download QR Code
                </button>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit}>
              <div className="form-group">
                <label className="form-label">UPI Reference / UTR / Transaction ID *</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="e.g. 302511223344"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Date & Time (Optional)</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="e.g. 02/07/2026 14:15"
                  value={paymentDateTime}
                  onChange={(e) => setPaymentDateTime(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes / Remarks (Optional)</label>
                <textarea 
                  className="form-control"
                  placeholder="Any extra info for administrative staff"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ height: '60px', resize: 'none' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '25px' }}>
                <label className="form-label">Upload UPI Payment Screenshot *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <label className="btn" style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    border: '1px dashed #cbd5e1', 
                    backgroundColor: '#f8fafc',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '8px 12px',
                    fontSize: '13px',
                    margin: 0
                  }}>
                    <Upload size={16} /> Choose File
                    <input type="file" onChange={handleScreenshotUpload} style={{ display: 'none' }} accept="image/*" required />
                  </label>
                  {screenshot && (
                    <img src={screenshot} alt="Preview" style={{ height: '35px', width: '35px', borderRadius: '4px', objectFit: 'cover', border: '1px solid #cbd5e1' }} />
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <button 
                  type="button" 
                  onClick={() => { setShowPaymentModal(false); setTransactionId(''); setScreenshot(''); setNotes(''); setPaymentDateTime(''); }}
                  className="btn btn-outline"
                  style={{ flex: 1, padding: '10px 0', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#64748b', fontWeight: '600' }}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-secondary" 
                  style={{ flex: 1, padding: '10px 0', backgroundColor: '#0c2340', color: '#fff', fontWeight: 'bold' }}
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Submitting...' : "I've Paid"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enlarged QR Code Modal overlay */}
      {enlargeQR && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(12, 35, 64, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100
          }}
          onClick={() => setEnlargeQR(false)}
        >
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', textAlign: 'center', width: '360px' }} onClick={(e) => e.stopPropagation()}>
            <h4 style={{ margin: '0 0 15px 0', color: '#0c2340', fontWeight: 'bold' }}>Dream Catcher UPI QR Code</h4>
            
            {(() => {
              try {
                const upiURI = getUPIURI();
                return (
                  <div style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0', display: 'inline-block' }}>
                    <QRCodeSVG 
                      id="upi-qr-code-svg-enlarged"
                      value={upiURI}
                      size={280}
                      level="H"
                      includeMargin={true}
                      style={{ display: 'block', margin: '0 auto' }}
                    />
                  </div>
                );
              } catch (err) {
                return (
                  <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: 'bold', padding: '10px', border: '1px solid #fee2e2', backgroundColor: '#fff5f5', borderRadius: '4px' }}>
                    Error: {err.message}
                  </div>
                );
              }
            })()}

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                type="button"
                onClick={() => {
                  const svgEl = document.getElementById('upi-qr-code-svg-enlarged');
                  if (!svgEl) return;
                  const svgString = new XMLSerializer().serializeToString(svgEl);
                  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                  const svgUrl = URL.createObjectURL(svgBlob);
                  const downloadLink = document.createElement('a');
                  downloadLink.href = svgUrl;
                  downloadLink.download = 'dreamcatcher_upi_qr_large.svg';
                  downloadLink.click();
                }}
                style={{ padding: '8px 16px', backgroundColor: '#0c2340', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
              >
                Download SVG
              </button>
              <button 
                type="button"
                onClick={() => setEnlargeQR(false)}
                style={{ padding: '8px 16px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#64748b', fontWeight: '600', fontSize: '12px', borderRadius: '4px', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
            <p style={{ margin: '15px 0 0 0', color: '#64748b', fontSize: '12px', fontWeight: '500' }}>Scan with GPay, PhonePe, Paytm, BHIM, etc.</p>
          </div>
        </div>
      )}

      {/* Case 1: No Subscription Modal */}
      {accessAlertModal === 'NoSub' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(12, 35, 64, 0.65)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1200
        }}>
          <div className="card" style={{ width: '450px', padding: '30px', backgroundColor: '#fff', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', color: '#dfa015', marginBottom: '15px' }}>⚠️</div>
            <h3 style={{ margin: '0 0 15px 0', color: '#0c2340', fontWeight: 'bold', border: 'none', padding: 0 }}>Subscription Required</h3>
            <p style={{ margin: '0 0 25px 0', fontSize: '14px', lineHeight: '1.6', color: '#475569' }}>
              You need an active Professional Agent Subscription before you can book visa appointments.
              Please purchase a subscription to unlock booking access.
            </p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                type="button" 
                onClick={() => setAccessAlertModal(null)}
                className="btn btn-outline"
                style={{ flex: 1, padding: '10px 0', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#64748b', fontWeight: '600' }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setAccessAlertModal(null);
                  setPaymentType('purchase');
                  setShowPaymentModal(true);
                }}
                className="btn btn-secondary" 
                style={{ flex: 1, padding: '10px 0', backgroundColor: '#dfa015', color: '#0c2340', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Purchase Subscription
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Case 2: Payment Verification Pending Modal */}
      {accessAlertModal === 'Pending' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(12, 35, 64, 0.65)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1200
        }}>
          <div className="card" style={{ width: '450px', padding: '30px', backgroundColor: '#fff', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', color: '#3b82f6', marginBottom: '15px' }}>⏳</div>
            <h3 style={{ margin: '0 0 15px 0', color: '#0c2340', fontWeight: 'bold', border: 'none', padding: 0 }}>Subscription Under Verification</h3>
            <p style={{ margin: '0 0 15px 0', fontSize: '14px', lineHeight: '1.6', color: '#475569' }}>
              Your payment has been submitted successfully. Our team is verifying your payment.
            </p>
            <p style={{ margin: '0 0 20px 0', fontSize: '13.5px', color: '#64748b' }}>
              Booking access will automatically be enabled once your subscription is approved.
            </p>
            <div style={{ backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '6px', marginBottom: '25px', fontSize: '13px' }}>
              <strong>Current Status:</strong> <span style={{ color: '#b45309', fontWeight: 'bold' }}>Payment Verification Pending</span>
            </div>
            <button 
              type="button" 
              onClick={() => setAccessAlertModal(null)}
              className="btn btn-outline"
              style={{ width: '100%', padding: '10px 0', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#64748b', fontWeight: '600' }}
            >
              Okay, Got it
            </button>
          </div>
        </div>
      )}

      {/* Case 3: Subscription Expired Modal */}
      {accessAlertModal === 'Expired' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(12, 35, 64, 0.65)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1200
        }}>
          <div className="card" style={{ width: '450px', padding: '30px', backgroundColor: '#fff', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', color: '#ef4444', marginBottom: '15px' }}>❌</div>
            <h3 style={{ margin: '0 0 15px 0', color: '#0c2340', fontWeight: 'bold', border: 'none', padding: 0 }}>Subscription Expired</h3>
            <p style={{ margin: '0 0 25px 0', fontSize: '14px', lineHeight: '1.6', color: '#475569' }}>
              Your Professional Agent Subscription has expired.
              Renew your subscription to continue booking visa appointments.
            </p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                type="button" 
                onClick={() => setAccessAlertModal(null)}
                className="btn btn-outline"
                style={{ flex: 1, padding: '10px 0', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#64748b', fontWeight: '600' }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setAccessAlertModal(null);
                  setPaymentType('renew');
                  setShowPaymentModal(true);
                }}
                className="btn btn-secondary" 
                style={{ flex: 1, padding: '10px 0', backgroundColor: '#ef4444', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Renew Subscription
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
