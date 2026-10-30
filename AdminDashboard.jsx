import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import SearchableDropdown from '../components/SearchableDropdown';
import { 
  Users, DollarSign, Edit, CheckCircle, RefreshCw, Calendar, 
  Trash2, ShieldAlert, Upload, Clipboard, Lock, Unlock, AlertTriangle, CreditCard, Building2 
} from 'lucide-react';

const formatTimeTo12Hr = (time24) => {
  if (!time24) return '';
  const parts = time24.split(':');
  if (parts.length < 2) return time24;
  const hour = parseInt(parts[0], 10);
  const min = parts[1];
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  const hourStr = hour12 < 10 ? `0${hour12}` : hour12;
  return `${hourStr}:${min} ${ampm}`;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('adminInfo') || localStorage.getItem('userInfo'));

  // Redirect if not authorized
  useEffect(() => {
    const adminRoles = ['admin', 'SUPER_ADMIN', 'CENTER_MANAGER', 'SUPERVISOR'];
    if (!user || !adminRoles.includes(user.role)) {
      navigate('/admin-login');
    }
  }, [user, navigate]);

  // Tab State
  const [activeTab, setActiveTab] = useState('applications'); // 'applications', 'slots', 'closures', 'bulkupload', 'auditlogs'

  // Common State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState('');
  
  // Applications Tab State
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ totalAppointments: 0, totalRevenue: 0, servicesCount: {} });
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Filter & Export States for Visa Submissions
  const [filterMonth, setFilterMonth] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [adminSearchTerm, setAdminSearchTerm] = useState('');

  // New Metrics State
  const [blockingStats, setBlockingStats] = useState({
    totalBlocked: 0,
    vipBlocked: 0,
    diplomaticBlocked: 0,
    activeClosures: 0,
    refundPendingAppts: 0,
    rescheduleRequiredAppts: 0
  });

  // Slots Tab State
  const [queryDate, setQueryDate] = useState(new Date().toISOString().split('T')[0]);
  const [adminSlots, setAdminSlots] = useState([]);
  const [newCapacityMap, setNewCapacityMap] = useState({});
  const [slotReasonMap, setSlotReasonMap] = useState({}); // Stores block reason per slotId
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Dynamic Master Data State for Admin
  const [adminCountries, setAdminCountries] = useState([]);
  const [adminCentersConfig, setAdminCentersConfig] = useState({});

  // Slots Wizard Step State
  const [wizardStep, setWizardStep] = useState(1);

  // Month Calendar States
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  const [monthSummary, setMonthSummary] = useState({});

  // Dynamic Hierarchical Blocking State
  const [selectedCountry, setSelectedCountry] = useState('CA');
  const [blockType, setBlockType] = useState('SLOT');
  const [blockStartDate, setBlockStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [blockEndDate, setBlockEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [blockReason, setBlockReason] = useState('MAINTENANCE');
  const [blockActionError, setBlockActionError] = useState('');
  const [blockSuccessMsg, setBlockSuccessMsg] = useState('');
  const [blocksHistory, setBlocksHistory] = useState([]);

  // Active Blocks Filter States
  const [blocksFilterCountry, setBlocksFilterCountry] = useState('');
  const [blocksFilterCenter, setBlocksFilterCenter] = useState('');
  const [blocksFilterDate, setBlocksFilterDate] = useState('');
  const [blocksFilterStatus, setBlocksFilterStatus] = useState('All'); // 'All', 'Active', 'Unblocked'
  const [blocksSearchQuery, setBlocksSearchQuery] = useState('');
  const [selectedBlockIds, setSelectedBlockIds] = useState([]);

  // Range Blocking State
  const [rangeDate, setRangeDate] = useState(new Date().toISOString().split('T')[0]);
  const [rangeStart, setRangeStart] = useState('10:00');
  const [rangeEnd, setRangeEnd] = useState('11:00');
  const [rangeReason, setRangeReason] = useState('MAINTENANCE');

  // Bulk Upload State
  const [csvText, setCsvText] = useState('');
  const [bulkStatus, setBulkStatus] = useState('');

  // Closure Panel State
  const [closureType, setClosureType] = useState('FULL_DAY');
  const [closureReason, setClosureReason] = useState('Flooding');
  const [closureStartDate, setClosureStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [closureEndDate, setClosureEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [closureStatus, setClosureStatus] = useState('');
  const [closureList, setClosureList] = useState([]);
  const [closureTargetCenter, setClosureTargetCenter] = useState('ALL_CENTERS');
  const [closureStartTime, setClosureStartTime] = useState('');
  const [closureEndTime, setClosureEndTime] = useState('');
  const [uploadSummary, setUploadSummary] = useState(null);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  
  // Audit Logs Filter States
  const [auditFilterCountry, setAuditFilterCountry] = useState('');
  const [auditFilterCenterId, setAuditFilterCenterId] = useState('');
  const [auditFilterAdminUser, setAuditFilterAdminUser] = useState('');
  const [auditFilterActionType, setAuditFilterActionType] = useState('');
  const [auditFilterStartDate, setAuditFilterStartDate] = useState('');
  const [auditFilterEndDate, setAuditFilterEndDate] = useState('');

  // Payment Verification State
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentActionError, setPaymentActionError] = useState('');
  const [verificationSuccessMsg, setVerificationSuccessMsg] = useState('');
  const [agents, setAgents] = useState([]);
  const [saasStats, setSaasStats] = useState(null);
  const [saasStatsLoading, setSaasStatsLoading] = useState(false);
  const [complimentaryDaysMap, setComplimentaryDaysMap] = useState({});

  // Subscription Payment Verification Tab States
  const [subPayments, setSubPayments] = useState([]);
  const [loadingSubPayments, setLoadingSubPayments] = useState(false);
  const [subPaymentsSearch, setSubPaymentsSearch] = useState('');
  const [subPaymentsStatusFilter, setSubPaymentsStatusFilter] = useState('Verification Pending');
  const [subZoomScreenshot, setSubZoomScreenshot] = useState('');
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [selectedSubForRejection, setSelectedSubForRejection] = useState(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  // Fetch Centers
  const fetchCenters = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/booking/centers');
      const data = await res.json();
      if (res.ok) {
        setCenters(data);
        if (data.length > 0 && !selectedCenter) setSelectedCenter(data[0]._id);
      }
    } catch (err) {
      console.warn("Could not fetch centers.");
    }
  };

  const fetchApplicationsAndStats = async () => {
    if (!user) return;
    try {
      const apptsRes = await fetch('http://localhost:5000/api/admin/appointments', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const apptsData = await apptsRes.json();

      const statsRes = await fetch('http://localhost:5000/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const statsData = await statsRes.json();

      if (apptsRes.ok && statsRes.ok) {
        setAppointments(apptsData);
        setStats(statsData);
      }
    } catch (err) {
      console.warn("Offline mock applications fallback.");
      setAppointments([
        {
          _id: "mock-appt-1",
          referenceNumber: "VFS-GBR-782910",
          userId: { name: "John Doe", email: "john@gmail.com" },
          applicantDetails: [{ firstName: "John", lastName: "Doe", passportNumber: "Z1234567", visaCategory: "Standard Tourist Visa", email: "john@gmail.com", phone: "9876543210", emailVerified: true }],
          bookingDate: new Date().toISOString(),
          bookingTime: "09:30",
          totalAmount: 1985,
          applicationStatus: "Submitted",
          status: "BOOKED"
        }
      ]);
      setStats({
        totalAppointments: 1,
        totalRevenue: 1985,
        servicesCount: { "Premium Lounge Service": 1 }
      });
    }
  };

  const filteredAppointments = appointments.filter(appt => {
    if (adminSearchTerm.trim()) {
      const query = adminSearchTerm.toLowerCase().trim();
      const refMatch = appt.referenceNumber && appt.referenceNumber.toLowerCase().includes(query);
      const userMatch = appt.userId?.name && appt.userId.name.toLowerCase().includes(query);
      const passportMatch = appt.applicantDetails && appt.applicantDetails.some(app => 
        (app.firstName && app.firstName.toLowerCase().includes(query)) ||
        (app.lastName && app.lastName.toLowerCase().includes(query)) ||
        (app.passportNumber && app.passportNumber.toLowerCase().includes(query))
      );
      if (!refMatch && !userMatch && !passportMatch) return false;
    }

    if (filterMonth) {
      const [year, month] = filterMonth.split('-');
      const date = new Date(appt.bookingDate);
      const apptYear = String(date.getFullYear());
      const apptMonth = String(date.getMonth() + 1).padStart(2, '0');
      if (apptYear !== year || apptMonth !== month) return false;
    }

    if (filterStatus !== 'All') {
      if (appt.applicationStatus !== filterStatus) return false;
    }

    return true;
  });

  const filteredStats = filteredAppointments.reduce((acc, appt) => {
    acc.totalCount += 1;
    acc.totalRevenue += appt.totalAmount || 0;
    return acc;
  }, { totalCount: 0, totalRevenue: 0 });

  const handleClearFilters = () => {
    setFilterMonth('');
    setFilterStatus('All');
    setAdminSearchTerm('');
  };

  const handleExportToExcel = () => {
    const headers = [
      'Reference Number',
      'Account Owner',
      'Account Email',
      'Account Mobile',
      'Applicant Name',
      'Passport Number',
      'Nationality',
      'Visa Category',
      'Application Center',
      'Appointment Date',
      'Appointment Time',
      'Total Amount (INR)',
      'Services Selected',
      'Status',
      'Submission Date'
    ];

    const rows = [];
    filteredAppointments.forEach(appt => {
      const applicants = appt.applicantDetails || [{}];
      applicants.forEach(app => {
        const services = appt.servicesSelected ? appt.servicesSelected.map(s => s.name).join('; ') : '';
        rows.push([
          appt.referenceNumber || '',
          appt.userId?.name || '',
          appt.userId?.email || '',
          appt.userId?.mobile || '',
          `${app.firstName || ''} ${app.lastName || ''}`.trim(),
          app.passportNumber || '',
          app.nationality || '',
          app.visaCategory || '',
          app.location || appt.centerId?.name || '',
          appt.bookingDate ? new Date(appt.bookingDate).toLocaleDateString('en-GB') : '',
          appt.bookingTime || '',
          appt.totalAmount || 0,
          services,
          appt.applicationStatus || '',
          appt.createdAt ? new Date(appt.createdAt).toLocaleString('en-GB') : ''
        ]);
      });
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map(val => {
          const str = String(val).replace(/"/g, '""');
          return str.includes(',') || str.includes('\n') || str.includes('"') ? `"${str}"` : str;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Visa_Submissions_Report_${new Date().toISOString().slice(0, 7)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchBlockingStats = async () => {
    if (!user) return;
    try {
      const res = await fetch('http://localhost:5000/api/admin/blocking-stats', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setBlockingStats(data);
      }
    } catch (err) {
      console.warn("Offline mock metrics fallback.");
    }
  };

  const fetchClosures = async () => {
    if (!user) return;
    try {
      const res = await fetch('http://localhost:5000/api/admin/emergency-closures', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setClosureList(data);
      }
    } catch (err) {
      console.warn("Offline mock closures fallback.");
      setClosureList([
        { _id: 'mock-close-1', centerId: { name: 'Chennai Center', city: 'Chennai' }, closureType: 'FULL_DAY', reason: 'Flooding', startDate: '2026-06-20', endDate: '2026-06-20', declaredAt: new Date(), status: 'ACTIVE' }
      ]);
    }
  };

  const fetchAdminSlots = async () => {
    if (!selectedCenter || !queryDate) return;
    setSlotsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/booking/slots?centerId=${selectedCenter}&date=${queryDate}&countryCode=${selectedCountry}`);
      const data = await res.json();
      if (res.ok) {
        setAdminSlots(data);
      }
    } catch (err) {
      setAdminSlots([
        { _id: 'mock-1', startTime: '09:00', endTime: '09:30', capacity: 5, bookedCount: 1, lockedCount: 1, status: 'AVAILABLE' },
        { _id: 'mock-2', startTime: '09:30', endTime: '10:00', capacity: 5, bookedCount: 3, lockedCount: 0, status: 'BLOCKED' }
      ]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const fetchAdminMasterData = async () => {
    try {
      const countriesRes = await fetch('http://localhost:5000/api/booking/countries');
      const centersConfigRes = await fetch('http://localhost:5000/api/booking/centers-config');
      if (countriesRes.ok && centersConfigRes.ok) {
        const countriesData = await countriesRes.json();
        const centersConfigData = await centersConfigRes.json();
        setAdminCountries(countriesData);
        setAdminCentersConfig(centersConfigData);
      }
    } catch (err) {
      console.error('Error fetching admin master data:', err);
    }
  };

  const fetchAdminUsers = async () => {
    if (!user) return;
    try {
      const res = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        setAdminUsers(await res.json());
      }
    } catch (err) {
      console.warn("Could not fetch admin users.");
    }
  };

  const getCentersByCountry = (countryCode) => {
    if (!countryCode || !centers) return [];
    return centers.filter(c => c.countryCode === countryCode);
  };

  const getCountryFlag = (code) => {
    if (!code) return '🏳️';
    const match = adminCountries.find(c => c.code.toUpperCase() === code.toUpperCase());
    return match ? match.flag : '🏳️';
  };

  const fetchMonthSummary = async () => {
    if (!selectedCenter || !selectedCountry || !calendarMonth) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/slots/month-summary?month=${calendarMonth}&centerId=${selectedCenter}&countryCode=${selectedCountry}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        setMonthSummary(await res.json());
      }
    } catch (err) {
      console.error('Error fetching month summary:', err);
    }
  };

  const fetchBlocksHistory = async () => {
    if (!user) return;
    try {
      const res = await fetch('http://localhost:5000/api/admin/slots/blocks', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setBlocksHistory(data);
      }
    } catch (err) {
      console.warn("Could not fetch blocks history, using fallback.");
      setBlocksHistory([
        {
          _id: "mock-block-1",
          countryCode: "CA",
          centerId: { name: "Chennai Visa Application Centre", city: "Chennai" },
          blockType: "SLOT",
          startDate: "2026-08-15",
          endDate: "2026-08-15",
          startTime: "09:00",
          endTime: "09:30",
          reason: "MAINTENANCE",
          blockedBy: { name: "System Controller" },
          active: true,
          createdAt: new Date().toISOString()
        }
      ]);
    }
  };

  const handleCreateBlock = async (e) => {
    if (e) e.preventDefault();
    setBlockActionError('');
    setBlockSuccessMsg('');

    const payload = {
      countryCode: selectedCountry,
      blockType,
      reason: blockReason
    };

    if (blockType !== 'COUNTRY') {
      payload.centerId = selectedCenter;
    }

    if (blockType === 'SLOT' || blockType === 'DATE') {
      payload.startDate = blockStartDate;
      payload.endDate = blockType === 'DATE' ? blockEndDate : blockStartDate;
    }

    if (blockType === 'SLOT') {
      if (selectedTimeSlots.length === 0) {
        setBlockActionError('Please select at least one time slot to block.');
        return;
      }
      try {
        setSlotsLoading(true);
        for (const slotTime of selectedTimeSlots) {
          const [hour, min] = slotTime.split(':').map(Number);
          let newMin = min + 30;
          let newHour = hour;
          if (newMin >= 60) {
            newMin -= 60;
            newHour += 1;
          }
          const endStr = `${String(newHour).padStart(2, '0')}:${String(newMin).padStart(2, '0')}`;
          const res = await fetch('http://localhost:5000/api/admin/slots/block', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({
              ...payload,
              startTime: slotTime,
              endTime: endStr
            })
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.message || 'Failed to block ' + slotTime);
          }
        }
        setBlockSuccessMsg('Selected slots blocked successfully!');
        setSelectedTimeSlots([]);
        await fetchAdminSlots();
        await fetchBlocksHistory();
        await fetchBlockingStats();
        await fetchMonthSummary();
      } catch (err) {
        setBlockActionError(err.message);
      } finally {
        setSlotsLoading(false);
      }
      return;
    }

    try {
      setSlotsLoading(true);
      const res = await fetch('http://localhost:5000/api/admin/slots/block', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setBlockSuccessMsg(`Successfully applied block of type ${blockType}.`);
        await fetchAdminSlots();
        await fetchBlocksHistory();
        await fetchBlockingStats();
        await fetchMonthSummary();
      } else {
        setBlockActionError(data.message || 'Failed to apply block.');
      }
    } catch (err) {
      setBlockActionError(err.message || 'Server error.');
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleReleaseBlock = async (blockId) => {
    if (!window.confirm("Are you sure you want to unblock this slot block restriction?")) return;
    setBlockActionError('');
    setBlockSuccessMsg('');
    try {
      setSlotsLoading(true);
      const res = await fetch('http://localhost:5000/api/admin/slots/unblock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ blockId })
      });
      const data = await res.json();
      if (res.ok) {
        setBlockSuccessMsg('Slots unblocked successfully.');
        await fetchAdminSlots();
        await fetchBlocksHistory();
        await fetchBlockingStats();
        await fetchMonthSummary();
      } else {
        setBlockActionError(data.message || 'Failed to unblock.');
      }
    } catch (err) {
      setBlockActionError(err.message || 'Server error.');
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleBulkUnblock = async () => {
    if (selectedBlockIds.length === 0) {
      alert("Please select at least one block to unblock.");
      return;
    }
    if (!window.confirm(`Are you sure you want to unblock the ${selectedBlockIds.length} selected slot restrictions?`)) return;
    
    setBlockActionError('');
    setBlockSuccessMsg('');
    try {
      setSlotsLoading(true);
      const res = await fetch('http://localhost:5000/api/admin/slots/unblock-bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ blockIds: selectedBlockIds })
      });
      const data = await res.json();
      if (res.ok) {
        setBlockSuccessMsg(`Successfully unblocked ${data.count} slot restrictions.`);
        setSelectedBlockIds([]);
        await fetchAdminSlots();
        await fetchBlocksHistory();
        await fetchBlockingStats();
        await fetchMonthSummary();
      } else {
        setBlockActionError(data.message || 'Failed to bulk unblock.');
      }
    } catch (err) {
      setBlockActionError(err.message || 'Server error.');
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Country,Center,Type,Start Date,End Date,Start Time,End Time,Reason,Created By,Status\n";
    
    blocksHistory.forEach(block => {
      const country = block.countryCode;
      const center = block.centerId ? block.centerId.name : "All Centers";
      const type = block.blockType;
      const startDate = block.startDate || "All";
      const endDate = block.endDate || "All";
      const startTime = block.startTime || "All Day";
      const endTime = block.endTime || "All Day";
      const reason = block.reason;
      const creator = block.blockedBy?.name || "Admin";
      const status = block.active ? "Active" : "Unblocked";
      
      csvContent += `"${country}","${center}","${type}","${startDate}","${endDate}","${startTime}","${endTime}","${reason}","${creator}","${status}"\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `active_blocks_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCalendarDays = () => {
    const [yearStr, monthStr] = calendarMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    
    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < startWeekday; i++) {
      days.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, dateString });
    }
    return days;
  };

  const fetchAuditLogs = async () => {
    if (!user) return;
    try {
      let url = 'http://localhost:5000/api/admin/audit-logs?';
      const params = new URLSearchParams();
      if (auditFilterCountry) params.append('country', auditFilterCountry);
      if (auditFilterCenterId) params.append('centerId', auditFilterCenterId);
      if (auditFilterAdminUser) params.append('adminUser', auditFilterAdminUser);
      if (auditFilterActionType) params.append('actionType', auditFilterActionType);
      if (auditFilterStartDate) params.append('startDate', auditFilterStartDate);
      if (auditFilterEndDate) params.append('endDate', auditFilterEndDate);
      
      const res = await fetch(url + params.toString(), {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAuditLogs(data);
      }
    } catch (err) {
      setAuditLogs([
        { _id: 'mock-log-1', action: 'UPDATE_CAPACITY', performedBy: { name: 'Admin Manager', email: 'admin@vfs.com' }, timestamp: new Date(), oldValue: { capacity: 5 }, newValue: { capacity: 10 } }
      ]);
    }
  };

  const fetchPendingPayments = async () => {
    if (!user) return;
    setLoadingPayments(true);
    setPaymentActionError('');
    try {
      const res = await fetch('http://localhost:5000/api/admin/payments-verification', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setPendingPayments(data);
      } else {
        setPaymentActionError(data.message || 'Failed to fetch pending payments.');
      }
    } catch (err) {
      console.warn("Offline mock pending payments fallback.");
      setPendingPayments([
        {
          appointment: {
            _id: "mock-verif-1",
            referenceNumber: "VFS-GBR-998822",
            createdAt: new Date().toISOString(),
            totalAmount: 3250,
            bookingDate: new Date().toISOString(),
            bookingTime: "10:15",
            status: "Pending Verification",
            paymentStatus: "Pending Verification",
            userId: { name: "Mock Applicant", email: "applicant@gmail.com" },
            applicantDetails: [{ firstName: "Mock", lastName: "Applicant", passportNumber: "P998822", email: "applicant@gmail.com", phone: "9876543210", visaCategory: "Visitor Visa", emailVerified: true }]
          },
          payment: {
            transactionId: "UPI9988221100",
            screenshot: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
          }
        }
      ]);
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleApprovePayment = async (apptId) => {
    if (!window.confirm("Are you sure you want to APPROVE this payment proof? This will confirm the appointment and send the confirmation email.")) return;
    setLoadingPayments(true);
    setPaymentActionError('');
    setVerificationSuccessMsg('');
    try {
      const res = await fetch(`http://localhost:5000/api/admin/payments-verification/${apptId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (res.ok) {
        setVerificationSuccessMsg('Payment successfully verified and approved! PDF email has been sent.');
        await fetchPendingPayments();
        await fetchApplicationsAndStats();
      } else {
        setPaymentActionError(data.message || 'Verification approval failed.');
      }
    } catch (err) {
      setPaymentActionError(err.message || 'Server error occurred.');
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleRejectPayment = async (apptId) => {
    const reason = window.prompt(
      "Enter the reason for rejecting this payment (this will be emailed to the applicant):",
      "The UPI transaction ID or screenshot provided could not be matched with our records."
    );
    if (reason === null) return;

    setLoadingPayments(true);
    setPaymentActionError('');
    setVerificationSuccessMsg('');
    try {
      const res = await fetch(`http://localhost:5000/api/admin/payments-verification/${apptId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (res.ok) {
        setVerificationSuccessMsg('Payment proof rejected and slot has been released.');
        await fetchPendingPayments();
        await fetchApplicationsAndStats();
      } else {
        setPaymentActionError(data.message || 'Verification rejection failed.');
      }
    } catch (err) {
      setPaymentActionError(err.message || 'Server error occurred.');
    } finally {
      setLoadingPayments(false);
    }
  };

  const fetchSubPayments = async () => {
    if (!user) return;
    setLoadingSubPayments(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/subscription-payments', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSubPayments(data);
      } else {
        alert(data.message || 'Failed to fetch subscription payments.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSubPayments(false);
    }
  };

  const handleApproveSubPayment = async (subId) => {
    if (!window.confirm("Are you sure you want to APPROVE this subscription payment proof? This will activate the travel agency subscription and enable bookings.")) return;
    setLoadingSubPayments(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/subscription-payments/${subId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (res.ok) {
        alert('Subscription payment proof successfully approved!');
        await fetchSubPayments();
        await fetchAgentsAndSaaSStats();
      } else {
        alert(data.message || 'Approval failed.');
      }
    } catch (err) {
      alert(err.message || 'Server error.');
    } finally {
      setLoadingSubPayments(false);
    }
  };

  const handleRejectSubPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!rejectRemarks.trim()) {
      alert('Rejection remarks are required.');
      return;
    }
    setLoadingSubPayments(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/subscription-payments/${selectedSubForRejection._id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ remarks: rejectRemarks })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Subscription payment rejected successfully.');
        setShowRejectionModal(false);
        setRejectRemarks('');
        setSelectedSubForRejection(null);
        await fetchSubPayments();
        await fetchAgentsAndSaaSStats();
      } else {
        alert(data.message || 'Rejection failed.');
      }
    } catch (err) {
      alert(err.message || 'Server error.');
    } finally {
      setLoadingSubPayments(false);
    }
  };

  const fetchAgentsAndSaaSStats = async () => {
    if (!user) return;
    setSaasStatsLoading(true);
    try {
      const agentsRes = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const agentsData = await agentsRes.json();
      if (agentsRes.ok) {
        setAgents(agentsData);
      }

      const statsRes = await fetch('http://localhost:5000/api/admin/b2b-stats', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const statsData = await statsRes.json();
      if (statsRes.ok) {
        setSaasStats(statsData);
      }
    } catch (err) {
      console.error('Error fetching B2B details:', err);
    } finally {
      setSaasStatsLoading(false);
    }
  };

  const handleAgentAction = async (agentId, action, extraBody = {}) => {
    if (!user) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/agents/${agentId}/${action}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(extraBody)
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Action failed.');
      } else {
        alert(data.message || 'Action completed successfully.');
        fetchAgentsAndSaaSStats();
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    }
  };

  const handleGlobalRefresh = async () => {
    setLoading(true);
    setError('');
    await fetchAdminMasterData();
    await fetchAdminUsers();
    await fetchCenters();
    await fetchApplicationsAndStats();
    await fetchBlockingStats();
    await fetchClosures();
    await fetchAdminSlots();
    await fetchAuditLogs();
    await fetchPendingPayments();
    await fetchBlocksHistory();
    setLoading(false);
  };

  useEffect(() => {
    handleGlobalRefresh();
  }, []);

  useEffect(() => {
    if (activeTab === 'paymentVerification') {
      fetchPendingPayments();
    }
    if (activeTab === 'subPayments') {
      fetchSubPayments();
    }
    if (activeTab === 'slots') {
      fetchBlocksHistory();
    }
    if (activeTab === 'agents') {
      fetchAgentsAndSaaSStats();
    }
  }, [activeTab]);

  useEffect(() => {
    fetchAdminSlots();
  }, [selectedCenter, queryDate, selectedCountry]);

  useEffect(() => {
    if (centers.length > 0 && Object.keys(adminCentersConfig).length > 0) {
      const filtered = getCentersByCountry(selectedCountry);
      if (filtered.length > 0) {
        if (!filtered.some(c => c._id === selectedCenter)) {
          setSelectedCenter(filtered[0]._id);
        }
      }
    }
  }, [selectedCountry, centers, adminCentersConfig]);

  useEffect(() => {
    fetchMonthSummary();
  }, [calendarMonth, selectedCenter, selectedCountry]);

  useEffect(() => {
    fetchAuditLogs();
  }, [auditFilterCountry, auditFilterCenterId, auditFilterAdminUser, auditFilterActionType, auditFilterStartDate, auditFilterEndDate]);

  const getDateStatus = () => {
    if (adminSlots.length === 0) return 'Available';
    const total = adminSlots.length;
    const blockedCount = adminSlots.filter(s => s.status === 'BLOCKED').length;
    const fullCount = adminSlots.filter(s => s.status !== 'BLOCKED' && (s.bookedCount + s.lockedCount >= s.capacity)).length;
    
    if (blockedCount === total) return 'Fully Blocked';
    if (blockedCount > 0) return 'Partially Blocked';
    if (blockedCount + fullCount === total) return 'Capacity Full';
    return 'Available';
  };

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingStatusId(id);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/appointments/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ applicationStatus: newStatus })
      });
      if (res.ok) {
        await fetchApplicationsAndStats();
        await fetchAuditLogs();
      }
    } catch (err) {
      setAppointments(prev => prev.map(appt => appt._id === id ? { ...appt, applicationStatus: newStatus } : appt));
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // 1. Update Slot Capacity
  const handleUpdateCapacity = async (slotId) => {
    const newCap = parseInt(newCapacityMap[slotId], 10);
    if (isNaN(newCap) || newCap < 0) {
      alert('Please enter a valid capacity count');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/admin/capacity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ slotId, newCapacity: newCap })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Capacity update failed.');
      
      alert('Slot capacity updated successfully');
      await fetchAdminSlots();
      await fetchBlockingStats();
      await fetchAuditLogs();
    } catch (err) {
      alert(err.message);
    }
  };

  // 2. Block Single Slot (with Reason)
  const handleBlockSlot = async (slot) => {
    const reason = slotReasonMap[slot._id] || 'VIP';
    try {
      const res = await fetch('http://localhost:5000/api/admin/slots/block', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          countryCode: selectedCountry,
          centerId: selectedCenter,
          blockType: 'SLOT',
          startDate: slot.date,
          endDate: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          reason
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Slot blocking failed.');
      
      await fetchAdminSlots();
      await fetchBlockingStats();
      await fetchBlocksHistory();
      await fetchAuditLogs();
    } catch (err) {
      alert(err.message);
    }
  };

  // 3. Grid-level Unblock Helper
  const handleGridUnblock = async (slot) => {
    const matchingBlock = blocksHistory.find(b => 
      b.active && 
      b.countryCode === selectedCountry &&
      b.centerId?._id === selectedCenter &&
      b.startDate === slot.date &&
      b.startTime === slot.startTime &&
      b.blockType === 'SLOT'
    );
    
    if (matchingBlock) {
      await handleReleaseBlock(matchingBlock._id);
    } else {
      alert("This slot is blocked by a higher-level block rule (Date, Center, or Country). Please unblock it from the Blocks History table below.");
    }
  };

  // 4. Block Time Range
  const handleBlockRange = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/slots/block-range', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          centerId: selectedCenter,
          date: rangeDate,
          startTime: rangeStart,
          endTime: rangeEnd,
          reason: rangeReason
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Range blocking failed.');
      
      alert(data.message);
      await fetchAdminSlots();
      await fetchBlockingStats();
      await fetchAuditLogs();
    } catch (err) {
      alert(err.message);
    }
  };

  // 5. Block Entire Date
  const handleBlockDate = async () => {
    if (!closureStartDate) {
      alert('Please select a date');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/admin/block-date', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ centerId: selectedCenter, date: closureStartDate })
      });
      if (res.ok) {
        setClosureStatus(`All slots blocked for ${closureStartDate}.`);
        await fetchAdminSlots();
        await fetchBlockingStats();
        await fetchAuditLogs();
      }
    } catch (err) {
      alert('Failed to block date');
    }
  };

  // 6. Declare Emergency Closure
  const handleEmergencyClose = async () => {
    if (!closureStartDate || !closureEndDate) {
      alert('Please enter start and end dates');
      return;
    }
    const confirmClose = window.confirm(`WARNING: Declare EMERGENCY CLOSURE from ${closureStartDate} to ${closureEndDate}? locked slots will be cancelled and booked slots enters refund queue.`);
    if (!confirmClose) return;

    setClosureStatus('Processing closure...');
    try {
      const res = await fetch('http://localhost:5000/api/admin/emergency-closure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          countryCode: selectedCountry,
          centerId: closureTargetCenter === 'ALL_CENTERS' ? null : closureTargetCenter,
          reason: closureReason,
          startDate: closureStartDate,
          endDate: closureEndDate,
          closureType,
          startTime: closureStartTime || null,
          endTime: closureEndTime || null
        })
      });
      const data = await res.json();
      if (res.ok) {
        setClosureStatus(data.message);
        await fetchClosures();
        await fetchAdminSlots();
        await fetchApplicationsAndStats();
        await fetchBlockingStats();
        await fetchAuditLogs();
        setClosureStartTime('');
        setClosureEndTime('');
      } else {
        setClosureStatus(`Closure failed: ${data.message}`);
      }
    } catch (err) {
      alert('Emergency closure failed: ' + err.message);
    }
  };

  // 7. Reopen Center
  const handleReopenCenter = async (closureId) => {
    const confirmReopen = window.confirm('Are you sure you want to REOPEN this center/country? Restores slots back to AVAILABLE.');
    if (!confirmReopen) return;

    try {
      const res = await fetch('http://localhost:5000/api/admin/emergency-closure/reopen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ closureId })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        await fetchClosures();
        await fetchAdminSlots();
        await fetchBlockingStats();
        await fetchAuditLogs();
      }
    } catch (err) {
      alert('Reopen failed: ' + err.message);
    }
  };

  // 8. Bulk Upload Slots
  const handleBulkUpload = async () => {
    if (!csvText.trim()) {
      alert('Please enter slot CSV lines');
      return;
    }
    setBulkStatus('Uploading slots...');
    setUploadSummary(null);
    try {
      const res = await fetch('http://localhost:5000/api/admin/bulk-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ centerId: selectedCenter, csvText })
      });
      const data = await res.json();
      if (res.ok) {
        setBulkStatus(data.message);
        setUploadSummary({
          totalRecords: data.totalRecords,
          successCount: data.successCount,
          failedCount: data.failedCount,
          errorDetails: data.errorDetails
        });
        setCsvText('');
        await fetchAdminSlots();
        await fetchAuditLogs();
      } else {
        setBulkStatus(`Upload error: ${data.message}`);
      }
    } catch (err) {
      setBulkStatus('Bulk upload failed: ' + err.message);
    }
  };

  return (
    <div>
      <Hero 
        title="Dream Catcher & VFS Admin Control Panel" 
        subtitle="Manage slot capacities, configure blocked operational ranges, and handle emergency closures" 
      />

      <div className="container" style={{ marginTop: '20px' }}>
        {error && (
          <div style={{ backgroundColor: '#fee2e2', borderLeft: '4px solid #ef4444', color: '#b91c1c', padding: '12px', fontSize: '14px', borderRadius: '4px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', marginBottom: '30px', gap: '10px', overflowX: 'auto' }}>
          {[
            { id: 'applications', label: 'Visa Applications', icon: <Users size={16} /> },
            { id: 'agents', label: 'Agent & SaaS Management', icon: <Building2 size={16} /> },
            { id: 'paymentVerification', label: 'Payment Verification', icon: <CreditCard size={16} /> },
            { id: 'subPayments', label: 'Subscription Payments', icon: <CreditCard size={16} /> },
            { id: 'slots', label: 'Slot & Capacity Management', icon: <Calendar size={16} /> },
            { id: 'closures', label: 'Emergency Closures', icon: <ShieldAlert size={16} /> },
            { id: 'bulkupload', label: 'Bulk Slot Upload', icon: <Upload size={16} /> },
            { id: 'auditlogs', label: 'Audit Logs', icon: <Clipboard size={16} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                border: 'none',
                background: 'none',
                borderBottom: activeTab === tab.id ? '3px solid #e86020' : '3px solid transparent',
                color: activeTab === tab.id ? '#0c2340' : '#64748b',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab B2B: Agents & SaaS Management */}
        {activeTab === 'agents' && (
          <div>
            <h2 style={{ color: '#0c2340', fontWeight: 'bold', fontSize: '22px', marginBottom: '25px' }}>
              B2B SaaS Agent & Subscription Management
            </h2>

            {/* SaaS Stats Cards */}
            {saasStats && (
              <div className="grid-cols-3" style={{ gap: '20px', marginBottom: '35px' }}>
                <div style={{ border: '1px solid #cbd5e1', padding: '20px', borderRadius: '6px', backgroundColor: '#f8fafc' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 'bold' }}>Monthly Recurring Revenue (MRR)</span>
                  <strong style={{ fontSize: '24px', color: '#1e3a8a', marginTop: '8px', display: 'block' }}>
                    INR {saasStats.monthlyRevenue.toLocaleString('en-IN')}.00
                  </strong>
                  <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>Excluding {saasStats.gstCollected.toLocaleString('en-IN')} INR GST collected</span>
                </div>
                <div style={{ border: '1px solid #cbd5e1', padding: '20px', borderRadius: '6px', backgroundColor: '#f8fafc' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 'bold' }}>Active Subscription Count</span>
                  <strong style={{ fontSize: '24px', color: '#10b981', marginTop: '8px', display: 'block' }}>
                    {saasStats.subscribedAgentsCount} Agents Subscribed
                  </strong>
                  <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>Out of {saasStats.totalAgents} total registered agencies</span>
                </div>
                <div style={{ border: '1px solid #cbd5e1', padding: '20px', borderRadius: '6px', backgroundColor: '#f8fafc' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 'bold' }}>Upcoming 7-Day Renewals</span>
                  <strong style={{ fontSize: '24px', color: '#dfa015', marginTop: '8px', display: 'block' }}>
                    {saasStats.upcomingRenewalsCount} Approaching Expiry
                  </strong>
                  <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>Automated sweeps run every 30s</span>
                </div>
              </div>
            )}

            {/* List of Travel Agencies */}
            <div className="card" style={{ padding: '25px' }}>
              <h3 style={{ border: 'none', padding: 0, color: '#0c2340', fontWeight: '800', marginBottom: '20px' }}>
                Registered Agencies List
              </h3>
              {saasStatsLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  Loading travel agency database...
                </div>
              ) : agents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  No travel agencies registered.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                        <th style={{ padding: '12px 8px' }}>Agency Details</th>
                        <th style={{ padding: '12px 8px' }}>Owner Details</th>
                        <th style={{ padding: '12px 8px' }}>GSTIN</th>
                        <th style={{ padding: '12px 8px' }}>Status</th>
                        <th style={{ padding: '12px 8px', textAlign: 'center' }}>Complimentary</th>
                        <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agents.map((agent) => (
                        <tr key={agent._id} style={{ borderBottom: '1px solid #e2e8f0', color: '#334155' }}>
                          <td style={{ padding: '12px 8px' }}>
                            <strong style={{ fontSize: '14px', color: '#0c2340', display: 'block' }}>{agent.agencyName}</strong>
                            <span style={{ color: '#64748b', fontSize: '11px' }}>{agent.city}, {agent.state}</span>
                          </td>
                          <td style={{ padding: '12px 8px' }}>
                            <div>{agent.ownerName}</div>
                            <span style={{ color: '#64748b', fontSize: '11px' }}>{agent.email} | {agent.mobile}</span>
                          </td>
                          <td style={{ padding: '12px 8px', fontFamily: 'monospace' }}>{agent.gstNumber}</td>
                          <td style={{ padding: '12px 8px' }}>
                            <span style={{
                              backgroundColor: agent.status === 'Active' ? '#d1fae5' : agent.status === 'Verified' ? '#eff6ff' : agent.status === 'Pending' ? '#fef3c7' : '#fee2e2',
                              color: agent.status === 'Active' ? '#065f46' : agent.status === 'Verified' ? '#2563eb' : agent.status === 'Pending' ? '#92400e' : '#991b1b',
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontWeight: '600'
                            }}>
                              {agent.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: '5px', alignItems: 'center' }}>
                              <input 
                                type="number" 
                                min="1" 
                                max="90" 
                                placeholder="Days"
                                style={{ width: '60px', padding: '4px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                value={complimentaryDaysMap[agent._id] || ''}
                                onChange={(e) => setComplimentaryDaysMap({
                                  ...complimentaryDaysMap,
                                  [agent._id]: e.target.value
                                })}
                              />
                              <button 
                                onClick={() => handleAgentAction(agent._id, 'complimentary', { days: complimentaryDaysMap[agent._id] })}
                                className="btn"
                                style={{ padding: '4px 8px', fontSize: '11px', backgroundColor: '#0c2340', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                              >
                                Grant
                              </button>
                            </div>
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                              {agent.status === 'Pending' && (
                                <>
                                  <button 
                                    onClick={() => handleAgentAction(agent._id, 'approve')}
                                    className="btn" 
                                    style={{ padding: '4px 10px', fontSize: '11px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                  >
                                    Approve
                                  </button>
                                  <button 
                                    onClick={() => handleAgentAction(agent._id, 'reject')}
                                    className="btn" 
                                    style={{ padding: '4px 10px', fontSize: '11px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {agent.status !== 'Blocked' && agent.status !== 'Pending' && (
                                <button 
                                  onClick={() => handleAgentAction(agent._id, 'block')}
                                  className="btn" 
                                  style={{ padding: '4px 10px', fontSize: '11px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                  Block
                                </button>
                              )}
                              {agent.status === 'Blocked' && (
                                <button 
                                  onClick={() => handleAgentAction(agent._id, 'unblock')}
                                  className="btn" 
                                  style={{ padding: '4px 10px', fontSize: '11px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                  Unblock
                                </button>
                              )}
                              {agent.status === 'Active' && (
                                <button 
                                  onClick={() => handleAgentAction(agent._id, 'cancel-subscription')}
                                  className="btn" 
                                  style={{ padding: '4px 10px', fontSize: '11px', backgroundColor: '#e2e8f0', color: '#0c2340', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                  Suspend Billing
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 1: Applications Dashboard */}
        {activeTab === 'applications' && (
          <div>
            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '30px' }}>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px' }}>
                <div style={{ backgroundColor: 'rgba(12,35,64,0.05)', color: '#0c2340', padding: '10px', borderRadius: '50%' }}>
                  <Users size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Submissions (Filtered)</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{filteredStats.totalCount} / {stats.totalAppointments}</div>
                </div>
              </div>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px' }}>
                <div style={{ backgroundColor: 'rgba(230,126,34,0.05)', color: '#e67e22', padding: '10px', borderRadius: '50%' }}>
                  <DollarSign size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Revenue (Filtered)</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#e67e22' }}>INR {filteredStats.totalRevenue.toLocaleString('en-IN')}</div>
                </div>
              </div>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px' }}>
                <div style={{ backgroundColor: 'rgba(239,68,68,0.05)', color: '#ef4444', padding: '10px', borderRadius: '50%' }}>
                  <Lock size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Blocked Slots (VIP / Dip)</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ef4444' }}>
                    {blockingStats.totalBlocked} ({blockingStats.vipBlocked} / {blockingStats.diplomaticBlocked})
                  </div>
                </div>
              </div>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px' }}>
                <div style={{ backgroundColor: 'rgba(59,130,246,0.05)', color: '#3b82f6', padding: '10px', borderRadius: '50%' }}>
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Refund Queue</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' }}>{blockingStats.refundPendingAppts}</div>
                </div>
              </div>
            </div>

            {/* Filter & Export Bar */}
            <div className="card" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px', backgroundColor: '#f8fafc', padding: '15px 20px' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#0c2340', marginBottom: '5px' }}>Search Submissions</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search by Ref, Name, Passport..."
                  value={adminSearchTerm}
                  onChange={(e) => setAdminSearchTerm(e.target.value)}
                  style={{ height: '38px', fontSize: '13px', padding: '8px 12px' }}
                />
              </div>

              <div style={{ flex: '1 1 150px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#0c2340', marginBottom: '5px' }}>Filter by Month</label>
                <input 
                  type="month" 
                  className="form-control" 
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  style={{ height: '38px', fontSize: '13px', padding: '8px 12px' }}
                />
              </div>

              <div style={{ flex: '1 1 150px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#0c2340', marginBottom: '5px' }}>Filter by Status</label>
                <select 
                  className="form-control" 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{ height: '38px', fontSize: '13px', padding: '4px 8px' }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Processing">Processing</option>
                  <option value="Proceed">Proceed</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Delayed">Delayed</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexShrink: 0 }}>
                <button 
                  className="btn btn-outline" 
                  onClick={handleClearFilters}
                  style={{ padding: '8px 16px', fontSize: '13px', height: '38px' }}
                >
                  Clear
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleExportToExcel}
                  style={{ padding: '8px 16px', fontSize: '13px', height: '38px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  disabled={filteredAppointments.length === 0}
                >
                  📥 Export Report
                </button>
              </div>
            </div>

            {/* List Table */}
            <div className="card">
              <h3 style={{ marginBottom: '20px', color: '#0c2340', fontWeight: 'bold' }}>Visa Submissions</h3>
              <div style={{ overflowX: 'auto' }}>
                <table className="vfs-table">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Applicant</th>
                      <th>Phone Number</th>
                      <th>Passport</th>
                      <th>Category</th>
                      <th>Appointment</th>
                      <th>Revenue</th>
                      <th>Status</th>
                      <th>Update Track</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan="9" style={{ textAlign: 'center', color: '#666', padding: '25px' }}>No matching appointments found.</td>
                      </tr>
                    ) : (
                      filteredAppointments.map(appt => {
                        return (
                          <tr key={appt._id}>
                            <td style={{ fontWeight: 'bold', color: '#e67e22' }}>{appt.referenceNumber}</td>
                            <td>
                              {appt.applicantDetails && appt.applicantDetails.map((app, idx) => (
                                <div key={idx} style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '8px',
                                  minHeight: '40px',
                                  margin: idx > 0 ? '8px 0 0 0' : '0',
                                  paddingTop: idx > 0 ? '8px' : '0',
                                  borderTop: idx > 0 ? '1px dashed #e2e8f0' : 'none' 
                                }}>
                                  {app.passportDocument ? (
                                    app.passportDocument.startsWith('data:application/pdf') ? (
                                      <div 
                                        style={{ width: '30px', height: '40px', backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: '2px', border: '1px solid #16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', cursor: 'pointer', flexShrink: 0 }}
                                        onClick={() => setSelectedDocument(app.passportDocument)}
                                        title="Click to view PDF document"
                                      >
                                        📄
                                      </div>
                                    ) : (
                                      <img 
                                        src={app.passportDocument} 
                                        alt="Doc" 
                                        style={{ width: '30px', height: '40px', objectFit: 'cover', borderRadius: '2px', border: '1px solid #cbd5e1', cursor: 'pointer', flexShrink: 0 }}
                                        onClick={() => setSelectedDocument(app.passportDocument)}
                                        title="Click to view larger image"
                                      />
                                    )
                                  ) : (
                                    <div style={{ width: '30px', height: '40px', backgroundColor: '#e2e8f0', borderRadius: '2px', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: '#64748b', textAlign: 'center', lineHeight: '1', flexShrink: 0 }}>
                                      No Doc
                                    </div>
                                  )}
                                  <div>
                                    <div style={{ fontWeight: '500' }}>{app.firstName} {app.lastName}</div>
                                    <div style={{ fontSize: '11px', color: '#64748b' }}>{app.email}</div>
                                    <div style={{ fontSize: '11px', color: '#64748b' }}>Phone: {app.phone || 'N/A'}</div>
                                    <div style={{ marginTop: '2px' }}>
                                      <span style={{
                                        backgroundColor: app.emailVerified ? '#dcfce7' : '#fee2e2',
                                        color: app.emailVerified ? '#15803d' : '#b91c1c',
                                        padding: '1px 6px',
                                        borderRadius: '4px',
                                        fontSize: '9px',
                                        fontWeight: 'bold',
                                        display: 'inline-block'
                                      }}>
                                        {app.emailVerified ? 'OTP Verified' : 'OTP Pending'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </td>
                            <td style={{ verticalAlign: 'top' }}>
                              <div style={{ fontWeight: '600', color: '#0c2340', fontSize: '13px' }}>Account Mobile:</div>
                              <div style={{ fontSize: '13px', marginBottom: '10px', color: '#333' }}>{appt.userId?.mobile || 'N/A'}</div>
                              
                              <div style={{ fontWeight: '600', color: '#0c2340', fontSize: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '6px' }}>Applicant Phone(s):</div>
                              {appt.applicantDetails && appt.applicantDetails.map((app, idx) => (
                                <div key={idx} style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>
                                  • {app.firstName}: {app.phone || 'N/A'}
                                </div>
                              ))}
                            </td>
                            <td>
                              {appt.applicantDetails && appt.applicantDetails.map((app, idx) => (
                                <div key={idx} style={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  minHeight: '40px',
                                  margin: idx > 0 ? '8px 0 0 0' : '0',
                                  paddingTop: idx > 0 ? '8px' : '0',
                                  borderTop: idx > 0 ? '1px dashed #e2e8f0' : 'none' 
                                }}>
                                  {app.passportNumber}
                                </div>
                              ))}
                            </td>
                            <td>
                              {appt.applicantDetails && appt.applicantDetails.map((app, idx) => (
                                <div key={idx} style={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  minHeight: '40px',
                                  margin: idx > 0 ? '8px 0 0 0' : '0',
                                  paddingTop: idx > 0 ? '8px' : '0',
                                  borderTop: idx > 0 ? '1px dashed #e2e8f0' : 'none',
                                  fontSize: '12px'
                                }}>
                                  {app.visaCategory}
                                </div>
                              ))}
                            </td>
                            <td>
                              <div>{new Date(appt.bookingDate).toLocaleDateString('en-GB')}</div>
                              <div style={{ fontSize: '12px', color: '#666' }}>{formatTimeTo12Hr(appt.bookingTime)}</div>
                            </td>
                            <td>
                               <div><strong>INR {appt.totalAmount.toLocaleString('en-IN')}</strong></div>
                               {appt.servicesSelected && appt.servicesSelected.length > 0 ? (
                                 <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', lineHeight: '1.4' }}>
                                   <div style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '3px', marginBottom: '3px' }}>
                                     {appt.servicesSelected.map((s, idx) => (
                                       <div key={idx}>• {s.name} (INR {s.price.toLocaleString('en-IN')})</div>
                                     ))}
                                   </div>
                                   <div>Fee: INR {(appt.appointmentFee || 0).toLocaleString('en-IN')}</div>
                                   <div>GST: INR {(appt.gstAmount || 0).toLocaleString('en-IN')}</div>
                                 </div>
                               ) : (
                                 <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', lineHeight: '1.4' }}>
                                   <div>Fee: INR {(appt.appointmentFee || 1).toLocaleString('en-IN')}</div>
                                   <div>GST: INR {(appt.gstAmount || 0).toLocaleString('en-IN')}</div>
                                 </div>
                               )}
                             </td>
                            <td>
                              <span style={{ 
                                backgroundColor: appt.status === 'REFUND_PENDING' ? '#fee2e2' : '#f1f5f9', 
                                color: appt.status === 'REFUND_PENDING' ? '#ef4444' : '#0c2340', 
                                padding: '4px 8px', 
                                borderRadius: '4px', 
                                fontSize: '12px', 
                                fontWeight: 'bold' 
                              }}>
                                {appt.status || appt.applicationStatus}
                              </span>
                            </td>
                            <td>
                              <select
                                className="form-control"
                                style={{ 
                                  padding: '4px 8px', 
                                  fontSize: '13px',
                                  backgroundColor: 
                                    appt.applicationStatus === 'Processing' ? '#ffe8cc' :
                                    appt.applicationStatus === 'Proceed' ? '#dcfce7' :
                                    appt.applicationStatus === 'Delivered' ? '#d0ebff' :
                                    appt.applicationStatus === 'Delayed' ? '#ffe3e3' : '#f1f5f9',
                                  color: 
                                    appt.applicationStatus === 'Processing' ? '#fd7e14' :
                                    appt.applicationStatus === 'Proceed' ? '#15803d' :
                                    appt.applicationStatus === 'Delivered' ? '#1c7ed6' :
                                    appt.applicationStatus === 'Delayed' ? '#b91c1c' : '#0c2340',
                                  fontWeight: 'bold',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: '4px'
                                }}
                                value={appt.applicationStatus}
                                onChange={(e) => handleStatusChange(appt._id, e.target.value)}
                                disabled={updatingStatusId === appt._id}
                              >
                                <option value="Processing" style={{ backgroundColor: '#ffffff', color: '#fd7e14', fontWeight: 'bold' }}>Processing</option>
                                <option value="Proceed" style={{ backgroundColor: '#ffffff', color: '#15803d', fontWeight: 'bold' }}>Proceed</option>
                                <option value="Delivered" style={{ backgroundColor: '#ffffff', color: '#1c7ed6', fontWeight: 'bold' }}>Delivered</option>
                                <option value="Delayed" style={{ backgroundColor: '#ffffff', color: '#b91c1c', fontWeight: 'bold' }}>Delayed</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Payment Verification */}
        {activeTab === 'paymentVerification' && (
          <div>
            <div className="card" style={{ marginBottom: '25px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#0c2340', fontWeight: 'bold' }}>UPI Payment Proof Verifications</h3>
                <button 
                  onClick={fetchPendingPayments} 
                  disabled={loadingPayments}
                  className="btn btn-outline"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <RefreshCw size={14} className={loadingPayments ? 'spin-animation' : ''} />
                  Refresh
                </button>
              </div>

              {paymentActionError && (
                <div style={{ backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#991b1b', padding: '15px', borderRadius: '4px', marginBottom: '20px', fontSize: '14px' }}>
                  {paymentActionError}
                </div>
              )}

              {verificationSuccessMsg && (
                <div style={{ backgroundColor: '#f0fdf4', borderLeft: '4px solid #22c55e', color: '#166534', padding: '15px', borderRadius: '4px', marginBottom: '20px', fontSize: '14px' }}>
                  {verificationSuccessMsg}
                </div>
              )}

              {loadingPayments ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p style={{ color: '#64748b' }}>Loading pending payment verification requests...</p>
                </div>
              ) : pendingPayments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', border: '1px dashed #cbd5e1', borderRadius: '6px', backgroundColor: '#f8f9fa' }}>
                  <span style={{ fontSize: '32px', display: 'block', marginBottom: '10px' }}>✓</span>
                  <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>No appointments are currently pending payment verification.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                        <th style={{ padding: '12px 10px', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Reference & Submitter</th>
                        <th style={{ padding: '12px 10px', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Applicant & Visa</th>
                        <th style={{ padding: '12px 10px', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Slot & Amount</th>
                        <th style={{ padding: '12px 10px', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Transaction Reference</th>
                        <th style={{ padding: '12px 10px', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Payment Screenshot</th>
                        <th style={{ padding: '12px 10px', fontSize: '13px', color: '#64748b', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingPayments.map((item) => {
                        const appt = item.appointment;
                        const pay = item.payment;
                        return (
                          <tr key={appt._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '15px 10px', verticalAlign: 'top' }}>
                              <strong style={{ color: '#e67e22', display: 'block' }}>{appt.referenceNumber}</strong>
                              <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Account: {appt.userId?.name} ({appt.userId?.mobile || 'N/A'})</span>
                              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                                Submitted: {new Date(appt.createdAt).toLocaleString('en-GB')}
                              </span>
                            </td>
                            <td style={{ padding: '15px 10px', verticalAlign: 'top', fontSize: '13px' }}>
                              {appt.applicantDetails && appt.applicantDetails.map((app, idx) => (
                                <div key={idx} style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '8px',
                                  margin: idx > 0 ? '10px 0 0 0' : '0',
                                  paddingTop: idx > 0 ? '10px' : '0',
                                  borderTop: idx > 0 ? '1px dashed #e2e8f0' : 'none' 
                                }}>
                                  {app.passportDocument ? (
                                    app.passportDocument.startsWith('data:application/pdf') ? (
                                      <div 
                                        style={{ width: '30px', height: '40px', backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: '2px', border: '1px solid #16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', cursor: 'pointer', flexShrink: 0 }}
                                        onClick={() => setSelectedDocument(app.passportDocument)}
                                        title="Click to view PDF document"
                                      >
                                        📄
                                      </div>
                                    ) : (
                                      <img 
                                        src={app.passportDocument} 
                                        alt="Doc" 
                                        style={{ width: '30px', height: '40px', objectFit: 'cover', borderRadius: '2px', border: '1px solid #cbd5e1', cursor: 'pointer', flexShrink: 0 }}
                                        onClick={() => setSelectedDocument(app.passportDocument)}
                                        title="Click to view larger image"
                                      />
                                    )
                                  ) : (
                                    <div style={{ width: '30px', height: '40px', backgroundColor: '#e2e8f0', borderRadius: '2px', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: '#64748b', textAlign: 'center', lineHeight: '1', flexShrink: 0 }}>
                                      No Doc
                                    </div>
                                  )}
                                  <div>
                                    <strong>{app.firstName} {app.lastName}</strong>
                                    <div style={{ color: '#64748b', fontSize: '12px' }}>Pass: {app.passportNumber}</div>
                                    <div style={{ color: '#64748b', fontSize: '12px' }}>Email: {app.email}</div>
                                    <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                                      <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '1px 5px', borderRadius: '4px', fontSize: '9px', display: 'inline-block' }}>
                                        {app.visaCategory}
                                      </span>
                                      <span style={{
                                        backgroundColor: app.emailVerified ? '#dcfce7' : '#fee2e2',
                                        color: app.emailVerified ? '#15803d' : '#b91c1c',
                                        padding: '1px 5px',
                                        borderRadius: '4px',
                                        fontSize: '9px',
                                        fontWeight: 'bold',
                                        display: 'inline-block'
                                      }}>
                                        {app.emailVerified ? 'OTP Verified' : 'OTP Pending'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </td>
                            <td style={{ padding: '15px 10px', verticalAlign: 'top', fontSize: '13px' }}>
                              <strong>{appt.centerId?.name || 'VAC Centre'}</strong>
                              <div style={{ color: '#64748b' }}>{new Date(appt.bookingDate).toLocaleDateString('en-GB')} at {formatTimeTo12Hr(appt.bookingTime)}</div>
                              <strong style={{ color: '#0c2340', fontSize: '14px', display: 'block', marginTop: '4px' }}>INR {appt.totalAmount.toLocaleString('en-IN')}</strong>
                              {appt.servicesSelected && appt.servicesSelected.length > 0 ? (
                                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', lineHeight: '1.4' }}>
                                  <div style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '3px', marginBottom: '3px' }}>
                                    {appt.servicesSelected.map((s, idx) => (
                                      <div key={idx}>• {s.name} (INR {s.price.toLocaleString('en-IN')})</div>
                                    ))}
                                  </div>
                                  <div>Fee: INR {(appt.appointmentFee || 0).toLocaleString('en-IN')}</div>
                                  <div>GST: INR {(appt.gstAmount || 0).toLocaleString('en-IN')}</div>
                                </div>
                              ) : (
                                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', lineHeight: '1.4' }}>
                                  <div>Fee: INR {(appt.appointmentFee || 1).toLocaleString('en-IN')}</div>
                                  <div>GST: INR {(appt.gstAmount || 0).toLocaleString('en-IN')}</div>
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '15px 10px', verticalAlign: 'top', fontSize: '14px' }}>
                              <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#0c2340', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>
                                {pay ? pay.transactionId : 'N/A'}
                              </span>
                            </td>
                            <td style={{ padding: '15px 10px', verticalAlign: 'top' }}>
                              {pay && pay.screenshot ? (
                                <div style={{ position: 'relative' }}>
                                  <img 
                                    src={pay.screenshot} 
                                    alt="Screenshot receipt" 
                                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                                    onClick={() => setSelectedDocument(pay.screenshot)}
                                    title="Click to Zoom"
                                  />
                                  <span style={{ display: 'block', fontSize: '10px', color: '#e86020', cursor: 'pointer', marginTop: '4px' }} onClick={() => setSelectedDocument(pay.screenshot)}>
                                    🔍 Click to view
                                  </span>
                                </div>
                              ) : (
                                <span style={{ color: '#94a3b8', fontSize: '12px' }}>No screenshot</span>
                              )}
                            </td>
                            <td style={{ padding: '15px 10px', verticalAlign: 'top', textAlign: 'right' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                                <button 
                                  onClick={() => handleApprovePayment(appt._id)}
                                  className="btn btn-primary"
                                  style={{ padding: '6px 14px', fontSize: '12px', width: '100px', backgroundColor: '#22c55e', borderColor: '#22c55e' }}
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleRejectPayment(appt._id)}
                                  className="btn btn-outline"
                                  style={{ padding: '6px 14px', fontSize: '12px', width: '100px', borderColor: '#ef4444', color: '#ef4444' }}
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Subscription Payments */}
        {activeTab === 'subPayments' && (
          <div>
            <div className="card" style={{ marginBottom: '25px', padding: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <h3 style={{ margin: 0, color: '#0c2340', fontWeight: 'bold', border: 'none', padding: 0 }}>Agent Subscription Payment Verifications</h3>
                <button 
                  onClick={fetchSubPayments} 
                  disabled={loadingSubPayments}
                  className="btn btn-outline"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <RefreshCw size={14} className={loadingSubPayments ? 'spin-animation' : ''} />
                  Refresh
                </button>
              </div>

              {/* Filters Block */}
              <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 250px' }}>
                  <input 
                    type="text" 
                    placeholder="Search by Agency, Owner, UTR ID..." 
                    className="form-control"
                    value={subPaymentsSearch}
                    onChange={(e) => setSubPaymentsSearch(e.target.value)}
                  />
                </div>
                <div style={{ width: '220px' }}>
                  <select 
                    className="form-control"
                    value={subPaymentsStatusFilter}
                    onChange={(e) => setSubPaymentsStatusFilter(e.target.value)}
                  >
                    <option value="Verification Pending">Pending Verification</option>
                    <option value="Active">Approved / Active</option>
                    <option value="Rejected">Rejected Proofs</option>
                    <option value="ALL">All Requests</option>
                  </select>
                </div>
              </div>

              {/* Data Table */}
              {loadingSubPayments ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading subscription requests...</div>
              ) : subPayments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No subscription payment proofs found.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                        <th style={{ padding: '12px 8px' }}>Agency Profile</th>
                        <th style={{ padding: '12px 8px' }}>Plan / Amount</th>
                        <th style={{ padding: '12px 8px' }}>UTR / Reference</th>
                        <th style={{ padding: '12px 8px' }}>Screenshot</th>
                        <th style={{ padding: '12px 8px' }}>Submitted At</th>
                        <th style={{ padding: '12px 8px' }}>Status</th>
                        <th style={{ padding: '12px 8px', textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subPayments
                        .filter(item => {
                          const agentData = item.agentId || {};
                          const searchStr = `${agentData.agencyName || ''} ${agentData.ownerName || ''} ${item.transactionId || ''}`.toLowerCase();
                          const matchesSearch = searchStr.includes(subPaymentsSearch.toLowerCase());
                          
                          if (subPaymentsStatusFilter === 'ALL') return matchesSearch;
                          return matchesSearch && item.subscriptionStatus === subPaymentsStatusFilter;
                        })
                        .map((item) => {
                          const agentData = item.agentId || {};
                          return (
                            <tr key={item._id} style={{ borderBottom: '1px solid #e2e8f0', color: '#334155' }}>
                              <td style={{ padding: '12px 8px' }}>
                                <strong style={{ color: '#0c2340' }}>{agentData.agencyName || 'N/A'}</strong>
                                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                                  Owner: {agentData.ownerName} | Mob: {agentData.mobile}
                                </div>
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                <div>{item.planName}</div>
                                <strong style={{ color: '#0c2340' }}>₹{item.totalAmount.toFixed(2)}</strong>
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                <code style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '3px', fontWeight: 'bold' }}>
                                  {item.transactionId}
                                </code>
                                {item.notes && (
                                  <div style={{ fontSize: '11px', color: '#b45309', marginTop: '3px', fontStyle: 'italic' }}>
                                    Note: {item.notes}
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                {item.screenshot ? (
                                  <img 
                                    src={item.screenshot} 
                                    alt="Receipt" 
                                    onClick={() => setSubZoomScreenshot(item.screenshot)}
                                    style={{ height: '40px', width: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                                    title="Click to zoom proof"
                                  />
                                ) : 'No screenshot'}
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                {new Date(item.updatedAt).toLocaleString('en-GB')}
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                <span style={{
                                  backgroundColor: item.subscriptionStatus === 'Active' ? '#d1fae5' : item.subscriptionStatus === 'Verification Pending' ? '#fef3c7' : '#fee2e2',
                                  color: item.subscriptionStatus === 'Active' ? '#065f46' : item.subscriptionStatus === 'Verification Pending' ? '#92400e' : '#991b1b',
                                  fontSize: '11px',
                                  padding: '3px 8px',
                                  borderRadius: '12px',
                                  fontWeight: 'bold'
                                }}>
                                  {item.subscriptionStatus}
                                </span>
                              </td>
                              <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                {item.subscriptionStatus === 'Verification Pending' ? (
                                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                    <button 
                                      onClick={() => handleApproveSubPayment(item._id)}
                                      className="btn" 
                                      style={{ padding: '4px 10px', fontSize: '12px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                      Approve
                                    </button>
                                    <button 
                                      onClick={() => { setSelectedSubForRejection(item); setShowRejectionModal(true); }}
                                      className="btn" 
                                      style={{ padding: '4px 10px', fontSize: '12px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                      Reject
                                    </button>
                                  </div>
                                ) : (
                                  <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>Processed</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rejection Remarks Modal */}
        {showRejectionModal && (
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
            zIndex: 1200
          }}>
            <div className="card" style={{ width: '450px', padding: '25px', backgroundColor: '#fff', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#0c2340', fontWeight: 'bold' }}>Reject Payment Proof</h4>
              <p style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#64748b' }}>
                Specify the reason for rejecting this transaction. This will be visible on the agent's dashboard and emailed to them.
              </p>
              <form onSubmit={handleRejectSubPaymentSubmit}>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label">Rejection Remarks *</label>
                  <textarea 
                    className="form-control"
                    rows="4"
                    required
                    placeholder="e.g. Screenshot blur / UTR does not match bank statements."
                    value={rejectRemarks}
                    onChange={(e) => setRejectRemarks(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <button 
                    type="button" 
                    onClick={() => { setShowRejectionModal(false); setRejectRemarks(''); setSelectedSubForRejection(null); }}
                    className="btn btn-outline"
                    style={{ flex: 1, padding: '8px 0', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#64748b', fontWeight: '600' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-secondary" 
                    style={{ flex: 1, padding: '8px 0', backgroundColor: '#ef4444', color: '#fff', fontWeight: 'bold' }}
                  >
                    Confirm Rejection
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Zoomed Screenshot Overlay Modal */}
        {subZoomScreenshot && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(12, 35, 64, 0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1300
            }}
            onClick={() => setSubZoomScreenshot('')}
          >
            <div style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '8px', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => setSubZoomScreenshot('')}
                style={{
                  position: 'absolute',
                  top: '-15px',
                  right: '-15px',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                }}
              >
                X
              </button>
              <img 
                src={subZoomScreenshot} 
                alt="Zoomed Payment Screenshot" 
                style={{ maxHeight: '80vh', maxWidth: '80vw', borderRadius: '4px', objectFit: 'contain' }}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Slot & Capacity Management */}
        {activeTab === 'slots' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {blockActionError && (
              <div style={{ backgroundColor: '#fee2e2', borderLeft: '4px solid #ef4444', color: '#b91c1c', padding: '12px 20px', borderRadius: '6px', fontSize: '14px', fontWeight: '500' }}>
                {blockActionError}
              </div>
            )}
            {blockSuccessMsg && (
              <div style={{ backgroundColor: '#f0fdf4', borderLeft: '4px solid #16a34a', color: '#15803d', padding: '12px 20px', borderRadius: '6px', fontSize: '14px', fontWeight: '500' }}>
                {blockSuccessMsg}
              </div>
            )}

            {/* Custom Print Media Styles for Exporting Reports */}
            <style>{`
              @media print {
                body * {
                  visibility: hidden;
                }
                #printable-blocks-section, #printable-blocks-section * {
                  visibility: visible;
                }
                #printable-blocks-section {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                  box-shadow: none !important;
                  border: none !important;
                }
                .no-print {
                  display: none !important;
                }
              }
            `}</style>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
              
              {/* Card 1: redid step-by-step blocking wizard */}
              <div className="card" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '15px' }}>
                  <h3 style={{ color: '#0c2340', fontWeight: 'bold', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                    <Lock size={20} style={{ color: '#e86020' }} /> Configure Slots Blocking Wizard
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '13px', marginTop: '6px', marginBottom: 0 }}>
                    Apply hierarchical block rules to dynamically override slot capacities.
                  </p>
                  
                  {/* Step indicators */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', fontSize: '10px', fontWeight: 'bold', color: '#64748b' }}>
                    {[1, 2, 3, 4, 5, 6, 7].map(stepNum => (
                      <span 
                        key={stepNum} 
                        style={{ 
                          color: wizardStep === stepNum ? '#e86020' : wizardStep > stepNum ? '#16a34a' : '#cbd5e1',
                          borderBottom: wizardStep === stepNum ? '2px solid #e86020' : 'none',
                          paddingBottom: '3px',
                          flex: 1,
                          textAlign: 'center'
                        }}
                      >
                        Step {stepNum}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {/* Step 1: Destination Country */}
                  {wizardStep === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <label className="form-label" style={{ fontWeight: '600', color: '#334155' }}>Step 1: Select Destination Country</label>
                      <SearchableDropdown
                        options={adminCountries.map(c => ({
                          code: c.code,
                          name: `${c.flag} ${c.name} (${c.code})`,
                          flag: c.flag
                        }))}
                        placeholder="Select Country"
                        value={selectedCountry}
                        onChange={(val) => {
                          setSelectedCountry(val);
                          const countryCenters = getCentersByCountry(val);
                          if (countryCenters.length > 0) {
                            setSelectedCenter(countryCenters[0]._id);
                          } else {
                            setSelectedCenter('');
                          }
                        }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                        <button className="btn btn-secondary" onClick={() => setWizardStep(2)}>Next</button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Visa Application Center */}
                  {wizardStep === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <label className="form-label" style={{ fontWeight: '600', color: '#334155' }}>Step 2: Select Visa Application Center</label>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Note: Bypassed if applying a Country-level block type.</p>
                      <SearchableDropdown
                        options={getCentersByCountry(selectedCountry).map(c => ({
                          code: c._id,
                          name: `${c.countryFlag} ${c.name} (${c.city})`,
                          flag: c.countryFlag
                        }))}
                        placeholder="Select Visa Center"
                        value={selectedCenter}
                        onChange={setSelectedCenter}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                        <button className="btn btn-outline" onClick={() => setWizardStep(1)}>Back</button>
                        <button className="btn btn-secondary" onClick={() => setWizardStep(3)}>Next</button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Date / Range Selection */}
                  {wizardStep === 3 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <label className="form-label" style={{ fontWeight: '600', color: '#334155' }}>Step 3: Select Date / Range</label>
                      <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ flex: 1 }}>
                          <label className="form-label" style={{ fontSize: '12px' }}>Start Date</label>
                          <input 
                            type="date" 
                            className="form-control" 
                            value={blockStartDate} 
                            onChange={(e) => {
                              setBlockStartDate(e.target.value);
                              if (blockEndDate < e.target.value) {
                                setBlockEndDate(e.target.value);
                              }
                            }}
                            style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', width: '100%' }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label className="form-label" style={{ fontSize: '12px' }}>End Date (Inclusive)</label>
                          <input 
                            type="date" 
                            className="form-control" 
                            value={blockEndDate} 
                            min={blockStartDate}
                            onChange={(e) => setBlockEndDate(e.target.value)}
                            style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', width: '100%' }}
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                        <button className="btn btn-outline" onClick={() => setWizardStep(2)}>Back</button>
                        <button className="btn btn-secondary" onClick={() => setWizardStep(4)}>Next</button>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Time Slot Selection */}
                  {wizardStep === 4 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="form-label" style={{ fontWeight: '600', color: '#334155', margin: 0 }}>Step 4: Select Time Slots</label>
                        <div style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
                          <button 
                            type="button" 
                            onClick={() => setSelectedTimeSlots(['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'])}
                            style={{ background: 'none', border: 'none', color: '#e86020', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}
                          >
                            All
                          </button>
                          <span style={{ color: '#cbd5e1' }}>|</span>
                          <button 
                            type="button" 
                            onClick={() => setSelectedTimeSlots([])}
                            style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(75px, 1fr))', gap: '8px', maxHeight: '180px', overflowY: 'auto', border: '1px solid #cbd5e1', padding: '12px', borderRadius: '6px', backgroundColor: '#f8fafc' }}>
                        {[
                          '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
                          '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
                          '15:00', '15:30'
                        ].map(time => {
                          const isSelected = selectedTimeSlots.includes(time);
                          return (
                            <button
                              key={time}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedTimeSlots(selectedTimeSlots.filter(t => t !== time));
                                } else {
                                  setSelectedTimeSlots([...selectedTimeSlots, time]);
                                }
                              }}
                              style={{
                                padding: '6px 4px',
                                fontSize: '11px',
                                fontWeight: isSelected ? 'bold' : '500',
                                border: isSelected ? '1px solid #e86020' : '1px solid #cbd5e1',
                                borderRadius: '4px',
                                backgroundColor: isSelected ? '#e86020' : '#fff',
                                color: isSelected ? '#fff' : '#475569',
                                cursor: 'pointer'
                              }}
                            >
                              {formatTimeTo12Hr(time)}
                            </button>
                          );
                        })}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                        <button className="btn btn-outline" onClick={() => setWizardStep(3)}>Back</button>
                        <button className="btn btn-secondary" onClick={() => setWizardStep(5)}>Next</button>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Block Scope Type */}
                  {wizardStep === 5 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <label className="form-label" style={{ fontWeight: '600', color: '#334155' }}>Step 5: Select Blocking Scope Type</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                        {[
                          { id: 'COUNTRY', label: 'Country Scope' },
                          { id: 'CENTER', label: 'Center Scope' },
                          { id: 'DATE', label: 'Date Range Scope' },
                          { id: 'SLOT', label: 'Time Slot Scope' }
                        ].map(type => (
                          <label 
                            key={type.id} 
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '12px 10px',
                              border: blockType === type.id ? '2px solid #e86020' : '1px solid #cbd5e1',
                              borderRadius: '6px',
                              backgroundColor: blockType === type.id ? 'rgba(232,96,32,0.03)' : '#fff',
                              cursor: 'pointer',
                              fontWeight: blockType === type.id ? 'bold' : '500',
                              color: blockType === type.id ? '#e86020' : '#475569'
                            }}
                          >
                            <input 
                              type="radio" 
                              name="blockType" 
                              value={type.id} 
                              checked={blockType === type.id}
                              onChange={() => setBlockType(type.id)}
                              style={{ accentColor: '#e86020' }}
                            />
                            {type.label}
                          </label>
                        ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                        <button className="btn btn-outline" onClick={() => setWizardStep(4)}>Back</button>
                        <button className="btn btn-secondary" onClick={() => setWizardStep(6)}>Next</button>
                      </div>
                    </div>
                  )}

                  {/* Step 6: Blocking Reason */}
                  {wizardStep === 6 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <label className="form-label" style={{ fontWeight: '600', color: '#334155' }}>Step 6: Select Block Reason</label>
                      <select 
                        className="form-control" 
                        value={blockReason} 
                        onChange={(e) => setBlockReason(e.target.value)}
                        style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', width: '100%' }}
                      >
                        <option value="MAINTENANCE">Maintenance</option>
                        <option value="SYSTEM_MAINTENANCE">System Maintenance</option>
                        <option value="STAFF_TRAINING">Staff Training</option>
                        <option value="INTERNAL_PROCESSING">Internal Processing</option>
                        <option value="VIP">VIP Block</option>
                        <option value="DIPLOMATIC">Diplomatic Block</option>
                        <option value="OTHER">Other Reason</option>
                      </select>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                        <button className="btn btn-outline" onClick={() => setWizardStep(5)}>Back</button>
                        <button className="btn btn-secondary" onClick={() => setWizardStep(7)}>Next</button>
                      </div>
                    </div>
                  )}

                  {/* Step 7: Summary & Submit */}
                  {wizardStep === 7 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <label className="form-label" style={{ fontWeight: '600', color: '#334155' }}>Step 7: Summary & Confirm</label>
                      
                      <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '6px', fontSize: '13px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div><strong>Country Scope:</strong> {(() => {
                          const c = adminCountries.find(x => x.code === selectedCountry);
                          return c ? `${c.flag} ${c.name}` : selectedCountry;
                        })()}</div>
                        <div><strong>Block Scope Scope:</strong> <span style={{ color: '#e86020', fontWeight: 'bold' }}>{blockType} LEVEL</span></div>
                        {blockType !== 'COUNTRY' && (
                          <div><strong>Visa Center:</strong> {centers.find(c => c._id === selectedCenter)?.name || selectedCenter}</div>
                        )}
                        {(blockType === 'DATE' || blockType === 'SLOT') && (
                          <div><strong>Dates Active:</strong> {blockStartDate === blockEndDate ? blockStartDate : `${blockStartDate} to ${blockEndDate}`}</div>
                        )}
                        {blockType === 'SLOT' && (
                          <div><strong>Time Slots Selected:</strong> {selectedTimeSlots.map(t => formatTimeTo12Hr(t)).join(', ')}</div>
                        )}
                        <div><strong>Declared Reason:</strong> {blockReason}</div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                        <button className="btn btn-outline" onClick={() => setWizardStep(6)}>Back</button>
                        <button 
                          onClick={async () => {
                            await handleCreateBlock();
                            setWizardStep(1);
                          }}
                          className="btn btn-secondary" 
                          style={{ backgroundColor: '#0c2340', borderColor: '#0c2340', color: '#fff', fontWeight: 'bold' }}
                        >
                          Apply Block Restriction
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 2: Custom Visual Month Calendar Grid & Inline Slot Editor */}
              <div className="card" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ color: '#0c2340', fontWeight: 'bold', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                      <Calendar size={20} style={{ color: '#e86020' }} /> Month Slots Summary Calendar
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '13px', marginTop: '6px', marginBottom: 0 }}>
                      Click any date to query slots, edit capacity or apply blocks inline.
                    </p>
                  </div>
                  <div>
                    <input 
                      type="month" 
                      value={calendarMonth} 
                      onChange={(e) => setCalendarMonth(e.target.value)} 
                      style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', fontFamily: 'inherit' }}
                    />
                  </div>
                </div>

                {/* Calendar Layout */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
                    <div key={dayName} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', paddingBottom: '4px' }}>
                      {dayName}
                    </div>
                  ))}
                  {getCalendarDays().map((dayObj, index) => {
                    if (!dayObj) return <div key={`empty-${index}`} style={{ backgroundColor: '#f8fafc', borderRadius: '4px', height: '60px' }}></div>;
                    
                    const { day, dateString } = dayObj;
                    const status = monthSummary[dateString] || 'Available';
                    
                    let bg = '#fff';
                    let border = '1px solid #e2e8f0';
                    let dotColor = '#10b981';
                    
                    if (status === 'Closed') {
                      bg = '#f8fafc';
                      dotColor = '#94a3b8';
                    } else if (status === 'Partially Blocked') {
                      bg = '#fffbeb';
                      dotColor = '#d97706';
                    } else if (status === 'Fully Blocked') {
                      bg = '#fef2f2';
                      dotColor = '#b91c1c';
                    } else if (status === 'Capacity Full') {
                      bg = '#fff7ed';
                      dotColor = '#ea580c';
                    }
                    
                    const isSelected = queryDate === dateString;
                    if (isSelected) {
                      border = '2px solid #e86020';
                    }
                    
                    return (
                      <div 
                        key={dateString}
                        onClick={() => {
                          setQueryDate(dateString);
                          setBlockStartDate(dateString);
                          setBlockEndDate(dateString);
                        }}
                        style={{
                          backgroundColor: bg,
                          border: border,
                          borderRadius: '6px',
                          height: '60px',
                          padding: '6px 4px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          boxShadow: isSelected ? '0 0 0 2px rgba(232,96,32,0.1)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span style={{ fontWeight: 'bold', fontSize: '13px', color: status === 'Closed' ? '#94a3b8' : '#0f172a' }}>{day}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: dotColor }}></span>
                          <span style={{ fontSize: '8px', color: '#64748b', fontWeight: '500' }}>{status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Inline Slot Editor rendering below calendar */}
            <div className="card" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ color: '#0c2340', fontWeight: 'bold', fontSize: '17px', margin: 0 }}>
                    Slots Allocations & Override Editor – {new Date(queryDate).toLocaleDateString('en-GB', { dateStyle: 'long' })}
                  </h4>
                  <p style={{ color: '#64748b', fontSize: '12px', marginTop: '4px', marginBottom: 0 }}>
                    Change slot capacities dynamically, or block single slots instantly.
                  </p>
                </div>
                {/* Date Status Badge */}
                {adminSlots.length > 0 && (() => {
                  const status = getDateStatus();
                  let bg = '#e2e8f0';
                  let color = '#475569';
                  if (status === 'Available') { bg = '#dcfce7'; color = '#15803d'; }
                  else if (status === 'Partially Blocked') { bg = '#fef3c7'; color = '#d97706'; }
                  else if (status === 'Fully Blocked') { bg = '#fee2e2'; color = '#b91c1c'; }
                  else if (status === 'Capacity Full') { bg = '#ffedd5'; color = '#ea580c'; }
                  
                  return (
                    <span style={{
                      backgroundColor: bg,
                      color: color,
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      fontSize: '11px',
                      border: `1px solid ${color}`
                    }}>
                      Daily Status: {status}
                    </span>
                  );
                })()}
              </div>

              {/* Slots filters */}
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }} className="no-print">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '280px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', minWidth: '90px' }}>Country Filter:</span>
                  <SearchableDropdown
                    options={adminCountries.map(c => ({
                      code: c.code,
                      name: `${c.flag} ${c.name}`,
                      flag: c.flag
                    }))}
                    placeholder="Filter Country"
                    value={selectedCountry}
                    onChange={(val) => {
                      setSelectedCountry(val);
                      const countryCenters = getCentersByCountry(val);
                      if (countryCenters.length > 0) {
                        setSelectedCenter(countryCenters[0]._id);
                      } else {
                        setSelectedCenter('');
                      }
                    }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '320px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', minWidth: '80px' }}>Center Filter:</span>
                  <SearchableDropdown
                    options={getCentersByCountry(selectedCountry).map(c => ({
                      code: c._id,
                      name: `${c.countryFlag} ${c.name}`,
                      flag: c.countryFlag
                    }))}
                    placeholder="Filter Center"
                    value={selectedCenter}
                    onChange={setSelectedCenter}
                  />
                </div>
              </div>

              {slotsLoading ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                  Loading slots data...
                </div>
              ) : adminSlots.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', border: '1px dashed #cbd5e1', borderRadius: '6px', color: '#64748b', backgroundColor: '#f8fafc' }}>
                  No slot configurations registered for this date.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
                  {adminSlots.map(slot => {
                    const isBlocked = slot.status === 'BLOCKED';
                    const available = isBlocked ? 0 : Math.max(0, slot.capacity - slot.bookedCount - slot.lockedCount);
                    
                    return (
                      <div 
                        key={slot._id}
                        style={{
                          border: isBlocked ? '1px solid #fee2e2' : '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '12px 15px',
                          backgroundColor: isBlocked ? '#fff5f5' : '#fff',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{formatTimeTo12Hr(slot.startTime)} - {formatTimeTo12Hr(slot.endTime)}</span>
                          <span style={{
                            backgroundColor: isBlocked ? '#fee2e2' : available === 0 ? '#ffedd5' : '#dcfce7',
                            color: isBlocked ? '#b91c1c' : available === 0 ? '#ea580c' : '#15803d',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 'bold'
                          }}>
                            {isBlocked ? 'Blocked' : available === 0 ? 'Full' : `${available} Avail`}
                          </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569' }}>
                          <span>Capacity: <strong>{slot.capacity}</strong></span>
                          <span>Booked: <strong>{slot.bookedCount}</strong></span>
                          <span>Locked: <strong>{slot.lockedCount}</strong></span>
                        </div>

                        {/* Edit capacity */}
                        <div style={{ display: 'flex', gap: '6px' }} className="no-print">
                          <input 
                            type="number" 
                            min={slot.bookedCount}
                            placeholder="Cap"
                            value={newCapacityMap[slot._id] !== undefined ? newCapacityMap[slot._id] : ''}
                            onChange={(e) => setNewCapacityMap({ ...newCapacityMap, [slot._id]: e.target.value })}
                            style={{ width: '65px', padding: '4px 6px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                          />
                          <button 
                            onClick={() => handleUpdateCapacity(slot._id)}
                            className="btn btn-outline"
                            style={{ padding: '4px 10px', fontSize: '11px', border: '1px solid #0f172a', color: '#0f172a', backgroundColor: 'transparent' }}
                          >
                            Update
                          </button>
                        </div>

                        {/* Block / Reopen */}
                        <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }} className="no-print">
                          {isBlocked ? (
                            <button
                              onClick={() => handleGridUnblock(slot)}
                              className="btn btn-outline"
                              style={{ flex: 1, padding: '4px 8px', fontSize: '11px', color: '#16a34a', borderColor: '#16a34a', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                            >
                              <Unlock size={11} /> Reopen
                            </button>
                          ) : (
                            <>
                              <select 
                                value={slotReasonMap[slot._id] || 'MAINTENANCE'} 
                                onChange={(e) => setSlotReasonMap({ ...slotReasonMap, [slot._id]: e.target.value })}
                                style={{ padding: '4px 6px', fontSize: '11px', border: '1px solid #cbd5e1', borderRadius: '4px', flex: 1 }}
                              >
                                <option value="MAINTENANCE">Maintenance</option>
                                <option value="VIP">VIP</option>
                                <option value="DIPLOMATIC">Diplomatic</option>
                                <option value="STAFF_TRAINING">Training</option>
                              </select>
                              <button
                                onClick={() => handleBlockSlot(slot)}
                                className="btn btn-outline"
                                style={{ padding: '4px 10px', fontSize: '11px', color: '#dc2626', borderColor: '#dc2626', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', gap: '2px' }}
                              >
                                <Lock size={11} /> Block
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Card 3: Active Blocking Logs & History */}
            <div className="card" style={{ padding: '25px' }} id="printable-blocks-section">
              <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ color: '#0c2340', fontWeight: 'bold', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                    <Clipboard size={20} style={{ color: '#e86020' }} /> Active Slots Blocking Configuration & Restrictions
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '13px', marginTop: '6px', marginBottom: 0 }}>
                    Review, filter, export and release active slot restrictions immediately.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }} className="no-print">
                  <button 
                    onClick={handleExportCSV}
                    className="btn btn-outline" 
                    style={{ fontSize: '12px', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    📥 Export CSV
                  </button>
                  <button 
                    onClick={() => window.print()}
                    className="btn btn-outline" 
                    style={{ fontSize: '12px', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    🖨️ Export PDF
                  </button>
                </div>
              </div>

              {/* Filters Panel */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '20px' }} className="no-print">
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '11px', fontWeight: '600' }}>Country Code</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. CA"
                    value={blocksFilterCountry} 
                    onChange={(e) => setBlocksFilterCountry(e.target.value.toUpperCase())} 
                    style={{ padding: '6px', fontSize: '12px' }} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '11px', fontWeight: '600' }}>Center / City</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Chennai"
                    value={blocksFilterCenter} 
                    onChange={(e) => setBlocksFilterCenter(e.target.value)} 
                    style={{ padding: '6px', fontSize: '12px' }} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '11px', fontWeight: '600' }}>Date</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={blocksFilterDate} 
                    onChange={(e) => setBlocksFilterDate(e.target.value)} 
                    style={{ padding: '6px', fontSize: '12px' }} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '11px', fontWeight: '600' }}>Status</label>
                  <select 
                    className="form-control" 
                    value={blocksFilterStatus} 
                    onChange={(e) => setBlocksFilterStatus(e.target.value)} 
                    style={{ padding: '6px', fontSize: '12px' }}
                  >
                    <option value="All">All Restrictions</option>
                    <option value="Active">Active Only</option>
                    <option value="Unblocked">Unblocked Only</option>
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ fontSize: '11px', fontWeight: '600' }}>Search Reason / Creator</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Search keywords..." 
                    value={blocksSearchQuery} 
                    onChange={(e) => setBlocksSearchQuery(e.target.value)} 
                    style={{ padding: '6px', fontSize: '12px' }} 
                  />
                </div>
              </div>

              {/* Bulk Actions Panel */}
              {selectedBlockIds.length > 0 && (
                <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7', padding: '10px 15px', borderRadius: '6px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="no-print">
                  <span style={{ color: '#b45309', fontWeight: '600', fontSize: '12px' }}>
                    Selected: <strong>{selectedBlockIds.length}</strong> block restriction{selectedBlockIds.length > 1 ? 's' : ''}
                  </span>
                  <button 
                    onClick={handleBulkUnblock}
                    className="btn btn-secondary"
                    style={{ backgroundColor: '#dc2626', borderColor: '#dc2626', color: '#fff', fontSize: '11px', padding: '5px 12px' }}
                  >
                    Bulk Unblock Selected
                  </button>
                </div>
              )}

              <div style={{ overflowX: 'auto' }}>
                <table className="vfs-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc' }}>
                      <th style={{ padding: '12px 10px', textAlign: 'center', width: '40px' }} className="no-print">
                        <input 
                          type="checkbox"
                          checked={blocksHistory.filter(b => b.active).length > 0 && selectedBlockIds.length === blocksHistory.filter(b => b.active).length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBlockIds(blocksHistory.filter(b => b.active).map(b => b._id));
                            } else {
                              setSelectedBlockIds([]);
                            }
                          }}
                        />
                      </th>
                      <th style={{ padding: '12px 10px', textAlign: 'center' }}>Country</th>
                      <th style={{ padding: '12px 10px', textAlign: 'left' }}>Center</th>
                      <th style={{ padding: '12px 10px', textAlign: 'center' }}>Scope</th>
                      <th style={{ padding: '12px 10px', textAlign: 'left' }}>Duration / Times</th>
                      <th style={{ padding: '12px 10px', textAlign: 'left' }}>Reason</th>
                      <th style={{ padding: '12px 10px', textAlign: 'left' }}>Created By</th>
                      <th style={{ padding: '12px 10px', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '12px 10px', textAlign: 'center' }} className="no-print">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const filtered = blocksHistory.filter(block => {
                        if (blocksFilterCountry && block.countryCode !== blocksFilterCountry) return false;
                        if (blocksFilterCenter) {
                          const name = block.centerId?.name || "All Centers";
                          const city = block.centerId?.city || "";
                          if (!name.toLowerCase().includes(blocksFilterCenter.toLowerCase()) && !city.toLowerCase().includes(blocksFilterCenter.toLowerCase())) {
                            return false;
                          }
                        }
                        if (blocksFilterDate) {
                          if (block.startDate && (blocksFilterDate < block.startDate || blocksFilterDate > block.endDate)) return false;
                        }
                        if (blocksFilterStatus !== 'All') {
                          const isActive = blocksFilterStatus === 'Active';
                          if (block.active !== isActive) return false;
                        }
                        if (blocksSearchQuery) {
                          const q = blocksSearchQuery.toLowerCase();
                          const reason = (block.reason || "").toLowerCase();
                          const admin = (block.blockedBy?.name || "").toLowerCase();
                          if (!reason.includes(q) && !admin.includes(q)) return false;
                        }
                        return true;
                      });

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan="9" style={{ textAlign: 'center', color: '#64748b', padding: '25px' }}>
                              No block restrictions matching selected filters.
                            </td>
                          </tr>
                        );
                      }

                      return filtered.map(block => {
                        const dateFormatted = block.startDate ? (
                          block.startDate === block.endDate ? block.startDate : `${block.startDate} to ${block.endDate}`
                        ) : 'All Dates';
                        
                        const timeFormatted = block.startTime ? (
                          `${formatTimeTo12Hr(block.startTime)} - ${formatTimeTo12Hr(block.endTime)}`
                        ) : 'All Day';

                        return (
                          <tr key={block._id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: block.active ? '#fff' : '#f8fafc' }}>
                            <td style={{ padding: '10px', textAlign: 'center' }} className="no-print">
                              {block.active ? (
                                <input 
                                  type="checkbox" 
                                  checked={selectedBlockIds.includes(block._id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedBlockIds([...selectedBlockIds, block._id]);
                                    } else {
                                      setSelectedBlockIds(selectedBlockIds.filter(id => id !== block._id));
                                    }
                                  }}
                                />
                              ) : (
                                <span style={{ color: '#cbd5e1' }}>-</span>
                              )}
                            </td>
                            <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '4px', fontSize: '11px' }}>
                                <span>{getCountryFlag(block.countryCode)}</span>
                                <span>{block.countryCode}</span>
                              </span>
                            </td>
                            <td style={{ padding: '10px' }}>
                              {block.centerId ? (
                                <div>
                                  <strong>{block.centerId.name}</strong>
                                  <div style={{ fontSize: '11px', color: '#64748b' }}>{block.centerId.city}</div>
                                </div>
                              ) : (
                                <span style={{ color: '#0369a1', fontWeight: 'bold' }}>All Centers (Country Block)</span>
                              )}
                            </td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>
                              <span style={{
                                backgroundColor: block.blockType === 'COUNTRY' ? '#fee2e2' : block.blockType === 'CENTER' ? '#ffedd5' : '#f1f5f9',
                                color: block.blockType === 'COUNTRY' ? '#991b1b' : block.blockType === 'CENTER' ? '#c2410c' : '#475569',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 'bold'
                              }}>
                                {block.blockType}
                              </span>
                            </td>
                            <td style={{ padding: '10px' }}>
                              <div style={{ fontWeight: '500' }}>{dateFormatted}</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>{timeFormatted}</div>
                            </td>
                            <td style={{ padding: '10px', color: '#475569', fontSize: '12px' }}>
                              {block.reason}
                            </td>
                            <td style={{ padding: '10px', fontSize: '12px' }}>
                              <div>{block.blockedBy?.name || 'Admin'}</div>
                              <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                                {new Date(block.createdAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                              </div>
                            </td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>
                              <span style={{
                                backgroundColor: block.active ? '#dcfce7' : '#f1f5f9',
                                color: block.active ? '#15803d' : '#94a3b8',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                fontSize: '11px',
                                display: 'inline-block'
                              }}>
                                {block.active ? 'Active' : 'Unblocked'}
                              </span>
                              {!block.active && block.unblockedBy && (
                                <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>
                                  By: {block.unblockedBy.name}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '10px', textAlign: 'center' }} className="no-print">
                              {block.active ? (
                                <button
                                  onClick={() => handleReleaseBlock(block._id)}
                                  className="btn btn-outline"
                                  style={{
                                    borderColor: '#dc2626',
                                    color: '#dc2626',
                                    padding: '4px 10px',
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    backgroundColor: 'transparent'
                                  }}
                                >
                                  <Unlock size={11} /> Unblock
                                </button>
                              ) : (
                                <span style={{ color: '#cbd5e1' }}>-</span>
                              )}
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
            
          </div>
        )}

        {/* Tab 3: Emergency Closures */}
        {activeTab === 'closures' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px', alignItems: 'flex-start' }}>
              
              {/* Declare Closure Panel */}
              <div className="card">
                <h3 style={{ color: '#0c2340', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert style={{ color: '#dc2626' }} /> Declare Emergency Closure
                </h3>

                {closureStatus && (
                  <div style={{ backgroundColor: '#eff6ff', borderLeft: '4px solid #2563eb', color: '#1e40af', padding: '12px', borderRadius: '4px', marginBottom: '20px', fontSize: '13px' }}>
                    {closureStatus}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Target Country</label>
                  <SearchableDropdown
                    options={adminCountries.map(c => ({
                      code: c.code,
                      name: `${c.flag} ${c.name}`,
                      flag: c.flag
                    }))}
                    placeholder="Select Country"
                    value={selectedCountry}
                    onChange={(val) => {
                      setSelectedCountry(val);
                      setClosureTargetCenter('ALL_CENTERS');
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Target Application Center</label>
                  <SearchableDropdown
                    options={[
                      { code: 'ALL_CENTERS', name: 'All Centers (Entire Country)', flag: '🌍' },
                      ...getCentersByCountry(selectedCountry).map(c => ({
                        code: c._id,
                        name: `${c.countryFlag} ${c.name} (${c.city})`,
                        flag: c.countryFlag
                      }))
                    ]}
                    placeholder="Select Center"
                    value={closureTargetCenter}
                    onChange={setClosureTargetCenter}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Closure Type</label>
                  <select className="form-control" value={closureType} onChange={(e) => setClosureType(e.target.value)}>
                    <option value="COUNTRY_WIDE">Country Wide</option>
                    <option value="FULL_DAY">Full Day</option>
                    <option value="MULTI_DAY">Multi Day</option>
                    <option value="PARTIAL_DAY">Partial Day</option>
                    <option value="CENTER_WIDE">Center Wide</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Reason for Closure</label>
                  <select className="form-control" value={closureReason} onChange={(e) => setClosureReason(e.target.value)}>
                    <option value="Flooding">Flooding</option>
                    <option value="Fire">Fire</option>
                    <option value="Political unrest">Political Unrest</option>
                    <option value="Natural disaster">Natural Disaster</option>
                    <option value="Power outage">Power Outage</option>
                    <option value="Security incident">Security Incident</option>
                    <option value="Government directive">Government Directive</option>
                    <option value="Pandemic restrictions">Pandemic Restrictions</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }} className="form-group">
                  <div>
                    <label className="form-label">Start Date</label>
                    <input type="date" className="form-control" value={closureStartDate} onChange={(e) => setClosureStartDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">End Date</label>
                    <input type="date" className="form-control" value={closureEndDate} onChange={(e) => setClosureEndDate(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }} className="form-group">
                  <div>
                    <label className="form-label">Start Time (Optional)</label>
                    <input type="time" className="form-control" value={closureStartTime} onChange={(e) => setClosureStartTime(e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">End Time (Optional)</label>
                    <input type="time" className="form-control" value={closureEndTime} onChange={(e) => setClosureEndTime(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                  <button onClick={handleBlockDate} className="btn btn-outline" style={{ flex: 1 }}>
                    Block Date Slots Only
                  </button>
                  <button onClick={handleEmergencyClose} className="btn btn-secondary" style={{ flex: 1, backgroundColor: '#dc2626', borderColor: '#dc2626' }}>
                    Declare Closure
                  </button>
                </div>
              </div>

              {/* Closure Logs list */}
              <div className="card">
                <h3 style={{ color: '#0c2340', fontWeight: 'bold', marginBottom: '20px' }}>Active closures & reopenings</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="vfs-table">
                    <thead>
                      <tr>
                        <th>Country / Center Name</th>
                        <th>Type</th>
                        <th>Reason</th>
                        <th>Duration</th>
                        <th style={{ textAlign: 'center' }}>Impacted Slots</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {closureList.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', color: '#666', padding: '20px' }}>No closures recorded.</td>
                        </tr>
                      ) : (
                        closureList.map(item => (
                          <tr key={item._id}>
                            <td>
                              <span style={{ marginRight: '8px', fontSize: '16px' }}>{item.countryFlag}</span>
                              {item.centerId ? (
                                <span>{item.centerId.name} ({item.centerId.city})</span>
                              ) : (
                                <strong style={{ color: '#dc2626' }}>All Centers (Country Wide: {item.countryName})</strong>
                              )}
                            </td>
                            <td>{item.closureType}</td>
                            <td style={{ fontWeight: 'bold' }}>{item.reason}</td>
                            <td style={{ fontSize: '13px' }}>
                              <div>{item.startDate === item.endDate ? item.startDate : `${item.startDate} to ${item.endDate}`}</div>
                              {item.startTime && item.endTime && (
                                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Time: {formatTimeTo12Hr(item.startTime)} - {formatTimeTo12Hr(item.endTime)}</div>
                              )}
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#0f172a' }}>
                              {item.impactedSlotsCount || 0}
                            </td>
                            <td>
                              <span style={{
                                backgroundColor: item.status === 'ACTIVE' ? '#fee2e2' : '#dcfce7',
                                color: item.status === 'ACTIVE' ? '#dc2626' : '#16a34a',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 'bold'
                              }}>
                                {item.status}
                              </span>
                            </td>
                            <td>
                              {item.status === 'ACTIVE' && (
                                <button
                                  onClick={() => handleReopenCenter(item._id)}
                                  className="btn btn-outline"
                                  style={{ borderColor: '#16a34a', color: '#16a34a', padding: '4px 8px', fontSize: '12px' }}
                                >
                                  Reopen
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Bulk Upload */}
        {activeTab === 'bulkupload' && (
          <div style={{ maxWidth: '650px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card">
              <h3 style={{ color: '#0c2340', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Upload /> Bulk Slots Upload (CSV)
              </h3>

              {bulkStatus && (
                <div style={{ backgroundColor: '#eff6ff', borderLeft: '4px solid #2563eb', color: '#1e40af', padding: '12px', borderRadius: '4px', marginBottom: '20px', fontSize: '14px' }}>
                  {bulkStatus}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Target Country</label>
                <SearchableDropdown
                  options={adminCountries.map(c => ({
                    code: c.code,
                    name: `${c.flag} ${c.name}`,
                    flag: c.flag
                  }))}
                  placeholder="Select Country"
                  value={selectedCountry}
                  onChange={(val) => {
                    setSelectedCountry(val);
                    const countryCenters = getCentersByCountry(val);
                    if (countryCenters.length > 0) {
                      setSelectedCenter(countryCenters[0]._id);
                    } else {
                      setSelectedCenter('');
                    }
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Application Center</label>
                <SearchableDropdown
                  options={getCentersByCountry(selectedCountry).map(c => ({
                    code: c._id,
                    name: `${c.countryFlag} ${c.name} (${c.city})`,
                    flag: c.countryFlag
                  }))}
                  placeholder="Select Center"
                  value={selectedCenter}
                  onChange={setSelectedCenter}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Paste CSV Slots Data</label>
                <textarea
                  className="form-control"
                  style={{ height: '180px', fontFamily: 'monospace', fontSize: '13px' }}
                  placeholder="date,startTime,endTime,capacity&#10;2026-06-25,09:00,09:30,10&#10;2026-06-25,09:30,10:00,10"
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                />
              </div>

              <button onClick={handleBulkUpload} className="btn btn-secondary" style={{ width: '100%', marginTop: '10px' }}>
                Import & Create Slots
              </button>
            </div>

            {uploadSummary && (
              <div className="card" style={{ border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '10px', fontWeight: 'bold', color: '#0c2340', fontSize: '16px' }}>
                  Upload Summary Report
                </div>
                <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '13px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
                    <div style={{ backgroundColor: '#f1f5f9', padding: '10px', borderRadius: '4px' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Total Records</div>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', marginTop: '4px' }}>{uploadSummary.totalRecords}</div>
                    </div>
                    <div style={{ backgroundColor: '#dcfce7', padding: '10px', borderRadius: '4px', color: '#15803d' }}>
                      <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600' }}>Success Count</div>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '4px' }}>{uploadSummary.successCount}</div>
                    </div>
                    <div style={{ backgroundColor: '#fee2e2', padding: '10px', borderRadius: '4px', color: '#b91c1c' }}>
                      <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: '600' }}>Failed Count</div>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '4px' }}>{uploadSummary.failedCount}</div>
                    </div>
                  </div>
                  
                  {uploadSummary.errorDetails && uploadSummary.errorDetails.length > 0 && (
                    <div style={{ marginTop: '5px' }}>
                      <div style={{ fontWeight: 'bold', color: '#dc2626', marginBottom: '8px', fontSize: '13px' }}>Error Details Log:</div>
                      <div style={{ maxHeight: '150px', overflowY: 'auto', backgroundColor: '#fff5f5', border: '1px solid #fee2e2', borderRadius: '4px', padding: '12px', fontFamily: 'monospace', fontSize: '12px', color: '#b91c1c', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {uploadSummary.errorDetails.map((err, idx) => (
                          <div key={idx} style={{ borderBottom: '1px dashed #fee2e2', paddingBottom: '4px' }}>
                            <strong>Line {err.line}:</strong> {err.detail}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Audit logs */}
        {activeTab === 'auditlogs' && (
          <div className="card">
            <h3 style={{ color: '#0c2340', fontWeight: 'bold', marginBottom: '20px' }}>System Administrator Audit Trail</h3>
            
            {/* Audit Filters Panel */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '25px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }} className="no-print">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '11px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Country</label>
                <SearchableDropdown
                  options={[
                    { code: '', name: '-- All Countries --', flag: '🌍' },
                    ...adminCountries.map(c => ({
                      code: c.code,
                      name: `${c.flag} ${c.name}`,
                      flag: c.flag
                    }))
                  ]}
                  placeholder="Filter Country"
                  value={auditFilterCountry}
                  onChange={(val) => {
                    setAuditFilterCountry(val);
                    setAuditFilterCenterId('');
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '11px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Visa Center</label>
                <SearchableDropdown
                  options={[
                    { code: '', name: '-- All Centers --', flag: '🌍' },
                    ...(auditFilterCountry ? getCentersByCountry(auditFilterCountry) : centers).map(c => ({
                      code: c.name,
                      name: `${c.countryFlag} ${c.name} (${c.city})`,
                      flag: c.countryFlag
                    }))
                  ]}
                  placeholder="Filter Center"
                  value={auditFilterCenterId}
                  onChange={setAuditFilterCenterId}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '11px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Admin User</label>
                <select 
                  className="form-control" 
                  value={auditFilterAdminUser} 
                  onChange={(e) => setAuditFilterAdminUser(e.target.value)} 
                  style={{ padding: '8px 10px', fontSize: '12px', width: '100%', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                >
                  <option value="">-- All Admins --</option>
                  {adminUsers.map(admin => (
                    <option key={admin._id} value={admin._id}>{admin.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '11px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Action Type</label>
                <select 
                  className="form-control" 
                  value={auditFilterActionType} 
                  onChange={(e) => setAuditFilterActionType(e.target.value)} 
                  style={{ padding: '8px 10px', fontSize: '12px', width: '100%', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                >
                  <option value="">-- All Actions --</option>
                  <option value="Block Created">Block Created</option>
                  <option value="Block Removed">Block Removed</option>
                  <option value="Capacity Modified">Capacity Modified</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '11px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Start Date</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={auditFilterStartDate} 
                  onChange={(e) => setAuditFilterStartDate(e.target.value)} 
                  style={{ padding: '7px 10px', fontSize: '12px', width: '100%', border: '1px solid #cbd5e1', borderRadius: '4px' }} 
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '11px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>End Date</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={auditFilterEndDate} 
                  onChange={(e) => setAuditFilterEndDate(e.target.value)} 
                  style={{ padding: '7px 10px', fontSize: '12px', width: '100%', border: '1px solid #cbd5e1', borderRadius: '4px' }} 
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button 
                  onClick={() => {
                    setAuditFilterCountry('');
                    setAuditFilterCenterId('');
                    setAuditFilterAdminUser('');
                    setAuditFilterActionType('');
                    setAuditFilterStartDate('');
                    setAuditFilterEndDate('');
                  }}
                  className="btn btn-outline"
                  style={{ width: '100%', fontSize: '12px', padding: '8px 12px', border: '1px solid #cbd5e1', color: '#475569' }}
                >
                  Clear Filters
                </button>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="vfs-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Performed By</th>
                    <th>Scope & Targets</th>
                    <th>Value Changes</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: '#666', padding: '25px' }}>No audit log transactions registered.</td>
                    </tr>
                  ) : (
                    auditLogs.map(log => (
                      <tr key={log._id}>
                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                        <td style={{ fontWeight: 'bold', color: '#e86020' }}>
                          {log.action === 'BLOCK_SLOTS_HIERARCHICAL' ? 'Block Created' :
                           log.action === 'UNBLOCK_SLOTS_HIERARCHICAL' ? 'Block Removed' :
                           log.action === 'UNBLOCK_SLOTS_BULK' ? 'Bulk Block Removed' :
                           log.action === 'UPDATE_CAPACITY' ? 'Capacity Modified' : log.action}
                        </td>
                        <td>
                          <div>{log.performedBy?.name || 'System'}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{log.performedBy?.email}</div>
                        </td>
                        <td>
                          <div><strong>Country:</strong> {log.countryCode || 'All'}</div>
                          <div><strong>Center:</strong> {log.centerName || 'All Centers'}</div>
                          <div><strong>Date & Time:</strong> {log.date || 'N/A'} ({log.timeSlot || 'All Day'})</div>
                        </td>
                        <td>
                          <div style={{ fontSize: '11px' }}><strong>Prev:</strong> {typeof log.previousValue === 'object' ? JSON.stringify(log.previousValue) : log.previousValue}</div>
                          <div style={{ fontSize: '11px', color: '#16a34a' }}><strong>New:</strong> {typeof log.newValue === 'object' ? JSON.stringify(log.newValue) : log.newValue}</div>
                        </td>
                        <td>{log.reason || 'N/A'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* Selected Document Viewer Modal */}
      {selectedDocument && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }} onClick={() => setSelectedDocument(null)}>
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '6px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '15px',
            position: 'relative',
            width: '600px',
            maxWidth: '90%',
            maxHeight: '90%'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: 0, color: '#0c2340', fontWeight: 'bold' }}>Passport Document</h3>
            
            {selectedDocument.startsWith('data:application/pdf') ? (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <iframe 
                  src={selectedDocument} 
                  title="Passport PDF" 
                  style={{ width: '100%', height: '400px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
                <a 
                  href={selectedDocument} 
                  download="passport_document.pdf"
                  className="btn btn-primary"
                  style={{ textDecoration: 'none', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                >
                  📥 Download Passport PDF
                </a>
              </div>
            ) : (
              <img 
                src={selectedDocument} 
                alt="Passport Document" 
                style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain', border: '2px solid #cbd5e1', borderRadius: '4px' }}
              />
            )}
            
            <button 
              onClick={() => setSelectedDocument(null)} 
              className="btn btn-secondary"
              style={{ padding: '8px 16px' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
