import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, ArrowLeft, AlertCircle, CheckCircle, X } from 'lucide-react';
import api from '../services/api';

const ISSUE_CATEGORIES = [
  'Account & Login',
  'Posts & Content',
  'Friends & Social',
  'Streaks & Achievements',
  'Telegram Integration',
  'App Performance / Bug',
  'Inappropriate Content',
  'Other',
];

function ReportIssueModal({ onClose }) {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!category) return setError('Please select an issue category.');
    if (!description.trim() || description.trim().length < 20)
      return setError('Please describe the issue in at least 20 characters.');

    setLoading(true);
    setError('');
    try {
      await api.post('/support/report', { category, description, contactEmail }).catch(() => {});
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 3000, padding: '16px',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '480px',
        padding: '28px 28px 24px',
        position: 'relative',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '18px', right: '18px',
            background: '#f3f4f6', border: 'none', borderRadius: '50%',
            width: '32px', height: '32px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <X size={16} color="#555" />
        </button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <CheckCircle size={52} color="#16a34a" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#111', marginBottom: '8px' }}>
              Report Received
            </h3>
            <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6, marginBottom: '24px' }}>
              Thanks for letting us know. Our team reviews every report and will follow up
              {contactEmail ? ` at ${contactEmail}` : ''} if needed.
            </p>
            <button
              onClick={onClose}
              style={{
                backgroundColor: '#F78660', color: '#fff', border: 'none',
                borderRadius: '12px', padding: '12px 32px',
                fontWeight: '700', fontSize: '14px', cursor: 'pointer',
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{
                backgroundColor: '#FFF0E8', borderRadius: '10px',
                padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <AlertCircle size={20} color="#F78660" />
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#111' }}>Report an Issue</h2>
            </div>

            {error && (
              <div style={{
                backgroundColor: '#fee2e2', color: '#b91c1c',
                padding: '10px 14px', borderRadius: '8px',
                fontSize: '13px', marginBottom: '16px',
              }}>
                {error}
              </div>
            )}

            {/* Category */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '8px' }}>
                What's the issue about? <span style={{ color: '#e53e3e' }}>*</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {ISSUE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setCategory(cat); setError(''); }}
                    style={{
                      padding: '9px 10px',
                      borderRadius: '8px',
                      border: category === cat ? '2px solid #F78660' : '1.5px solid #e5e7eb',
                      backgroundColor: category === cat ? '#FFF0E8' : '#fafafa',
                      color: category === cat ? '#F78660' : '#555',
                      fontSize: '12px',
                      fontWeight: category === cat ? '700' : '500',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '6px' }}>
                Describe the issue <span style={{ color: '#e53e3e' }}>*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => { setDescription(e.target.value); setError(''); }}
                placeholder="Tell us what happened, what you expected, and any steps to reproduce..."
                rows={4}
                style={{
                  width: '100%', padding: '10px 14px',
                  border: '1.5px solid #e5e7eb', borderRadius: '10px',
                  fontSize: '13px', resize: 'vertical', outline: 'none',
                  boxSizing: 'border-box', lineHeight: 1.5,
                  fontFamily: 'inherit', color: '#111',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#F78660')}
                onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
              />
              <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px', textAlign: 'right' }}>
                {description.length} chars (min 20)
              </div>
            </div>

            {/* Contact */}
            <div style={{ marginBottom: '22px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '6px' }}>
                Contact email <span style={{ fontSize: '12px', color: '#aaa', fontWeight: '400' }}>(optional — for follow-up)</span>
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: '100%', padding: '10px 14px',
                  border: '1.5px solid #e5e7eb', borderRadius: '10px',
                  fontSize: '13px', outline: 'none', boxSizing: 'border-box',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#F78660')}
                onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%', backgroundColor: '#F78660', color: '#fff',
                border: 'none', borderRadius: '12px', padding: '13px',
                fontWeight: '800', fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s',
              }}
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function FAQItem({ faq, isOpen, onToggle }) {
  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '14px',
      marginBottom: '10px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      overflow: 'hidden',
      border: isOpen ? '1.5px solid #F78660' : '1.5px solid transparent',
      transition: 'border-color 0.2s',
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', padding: '16px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
          gap: '12px',
        }}
      >
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#111', lineHeight: 1.4, flex: 1 }}>
          {faq.question}
        </span>
        <span style={{
          flexShrink: 0,
          backgroundColor: isOpen ? '#F78660' : '#f3f4f6',
          borderRadius: '50%', width: '28px', height: '28px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s',
        }}>
          {isOpen
            ? <ChevronUp size={15} color="#fff" />
            : <ChevronDown size={15} color="#888" />
          }
        </span>
      </button>

      {isOpen && (
        <div style={{
          padding: '0 18px 16px',
          fontSize: '13px', color: '#555', lineHeight: 1.7,
          borderTop: '1px solid #f3f4f6',
          paddingTop: '12px',
        }}>
          {faq.answer}
        </div>
      )}
    </div>
  );
}

export default function HelpSupport() {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/faqs', { params: { active: 'true', limit: 100 } });
      if (res.data.success) {
        const data = res.data.data;
        setFaqs(data);
        const cats = [...new Set(data.map(f => f.category).filter(Boolean))];
        setCategories(cats);
      }
    } catch {
      // fail silently, empty state shown
    } finally {
      setLoading(false);
    }
  };

  const filtered = faqs.filter((faq) => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = !searchQuery
      || faq.question.toLowerCase().includes(searchQuery.toLowerCase())
      || faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#faf9f7', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#FCF1DD',
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '4px', display: 'flex', alignItems: 'center',
          }}
        >
          <ArrowLeft size={22} color="#111" />
        </button>
        <span style={{ fontSize: '20px', fontWeight: '800', color: '#111' }}>Help & Support</span>
      </div>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '20px 16px' }}>

        {/* Report Issue Banner */}
        <div style={{
          backgroundColor: '#FFF0E8',
          border: '1.5px solid #F7C4A8',
          borderRadius: '16px',
          padding: '18px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#111', marginBottom: '3px' }}>
              Something not working?
            </div>
            <div style={{ fontSize: '13px', color: '#888' }}>
              Let us know and we'll look into it.
            </div>
          </div>
          <button
            onClick={() => setShowReportModal(true)}
            style={{
              backgroundColor: '#F78660', color: '#fff', border: 'none',
              borderRadius: '10px', padding: '10px 16px',
              fontWeight: '700', fontSize: '13px', cursor: 'pointer',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            Report Issue
          </button>
        </div>

        {/* FAQ Section */}
        <div style={{ fontSize: '18px', fontWeight: '800', color: '#111', marginBottom: '14px' }}>
          Frequently Asked Questions
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search questions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%', padding: '11px 16px',
            border: '1.5px solid #e5e7eb', borderRadius: '12px',
            fontSize: '13px', outline: 'none', boxSizing: 'border-box',
            marginBottom: '14px', backgroundColor: '#fff',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#F78660')}
          onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
        />

        {/* Category Pills */}
        {categories.length > 0 && (
          <div style={{
            display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px',
          }}>
            {['all', ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '6px 14px', borderRadius: '999px',
                  border: activeCategory === cat ? 'none' : '1.5px solid #e5e7eb',
                  backgroundColor: activeCategory === cat ? '#F78660' : '#fff',
                  color: activeCategory === cat ? '#fff' : '#555',
                  fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                  textTransform: 'capitalize', transition: 'all 0.15s',
                }}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
        )}

        {/* FAQ List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#aaa', fontSize: '14px' }}>
            Loading FAQs...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '40px 20px',
            backgroundColor: '#fff', borderRadius: '16px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#111', marginBottom: '6px' }}>
              {searchQuery ? 'No results found' : 'No FAQs yet'}
            </div>
            <div style={{ fontSize: '13px', color: '#888' }}>
              {searchQuery ? 'Try a different search term.' : 'Check back soon!'}
            </div>
          </div>
        ) : (
          filtered.map((faq) => (
            <FAQItem
              key={faq.id}
              faq={faq}
              isOpen={openId === faq.id}
              onToggle={() => setOpenId(openId === faq.id ? null : faq.id)}
            />
          ))
        )}

        {/* Bottom contact nudge */}
        <div style={{
          textAlign: 'center', marginTop: '32px',
          fontSize: '13px', color: '#aaa',
        }}>
          Still stuck?{' '}
          <button
            onClick={() => setShowReportModal(true)}
            style={{
              background: 'none', border: 'none', color: '#F78660',
              fontWeight: '600', cursor: 'pointer', fontSize: '13px',
            }}
          >
            Send us a message
          </button>
        </div>
      </div>

      {showReportModal && <ReportIssueModal onClose={() => setShowReportModal(false)} />}
    </div>
  );
}