import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import styles from './Dashboard.module.css';

const LAST_UPDATED = '25 March 2026';
const COMPANY = 'Kairos Ventures Pte. Ltd.';
const APP = 'eSimConnect';
const EMAIL = 'legal@esimconnect.world';
const ADDRESS = 'Singapore';

const sections = [
  {
    id: 'introduction',
    title: '1. Introduction',
    content: `These Terms and Conditions ("Terms") govern your access to and use of ${APP} ("the Platform"), operated by ${COMPANY} ("we", "us", or "our"), a company incorporated in Singapore.

By accessing or using the Platform, you agree to be bound by these Terms. If you do not agree, please discontinue use of the Platform immediately.

These Terms are governed by and construed in accordance with the laws of the Republic of Singapore, including but not limited to the Electronic Transactions Act 2010 (ETA), the Consumer Protection (Fair Trading) Act 2003 (CPFTA), and the Personal Data Protection Act 2012 (PDPA).`
  },
  {
    id: 'eligibility',
    title: '2. Eligibility',
    content: `You must be at least 18 years of age to use the Platform. By using the Platform, you represent and warrant that:

• You are at least 18 years old
• You have the legal capacity to enter into a binding agreement
• You are not barred from receiving services under applicable law
• All information you provide is accurate, current, and complete`
  },
  {
    id: 'esim-services',
    title: '3. eSIM Services',
    content: `3.1 Service Description. ${APP} provides eSIM data plans for international travel. eSIM plans are digital and delivered electronically upon successful payment.

3.2 Activation. eSIM plans must be activated on a compatible device. It is your responsibility to ensure your device supports eSIM technology before purchase.

3.3 Data Plans. Data plans are subject to the terms of our network partners in each country. Coverage, speed, and availability may vary by location.

3.4 No Refunds. Due to the digital nature of eSIM products, all sales are final once the QR code or activation details have been delivered. Refunds may be considered at our sole discretion in cases of technical failure attributable to us.

3.5 Fair Use. Use of data plans for activities that violate local laws, or that involve tethering beyond reasonable personal use, may result in suspension without refund.

3.6 Expiry. Data plans expire as stated at the time of purchase. Unused data is forfeited upon expiry. No extensions will be granted unless expressly offered.`
  },
  {
    id: 'ai-itinerary',
    title: '4. AI-Generated Itinerary Services',
    content: `4.1 Nature of Service. The itinerary planning feature uses artificial intelligence (Claude by Anthropic) to generate travel suggestions, route optimisations, and activity recommendations.

4.2 No Guarantee of Accuracy. AI-generated content is provided for informational purposes only. We do not warrant the accuracy, completeness, or suitability of any AI-generated suggestions, including but not limited to:
• Business names, addresses, and operating hours
• Prices and availability
• Travel times and transport recommendations
• Safety or suitability of recommended locations

4.3 User Responsibility. You are solely responsible for independently verifying all AI-generated recommendations before acting on them. Always check directly with venues, transport operators, and local authorities.

4.4 No Professional Advice. Nothing in the AI-generated content constitutes professional travel, legal, medical, or safety advice.

4.5 Third-Party Services. Recommendations may include third-party businesses and services over which we have no control. We are not responsible for your experience with any third-party provider.`
  },
  {
    id: 'user-accounts',
    title: '5. User Accounts',
    content: `5.1 Registration. You may be required to create an account to access certain features. You are responsible for maintaining the confidentiality of your account credentials.

5.2 Account Security. You agree to notify us immediately at ${EMAIL} of any unauthorised use of your account.

5.3 Account Termination. We reserve the right to suspend or terminate your account at our sole discretion, without prior notice, if we reasonably believe you have violated these Terms.`
  },
  {
    id: 'pdpa',
    title: '6. Personal Data Protection (PDPA)',
    content: `6.1 Collection. We collect personal data including your name, email address, payment information, and usage data in accordance with Singapore's Personal Data Protection Act 2012 (PDPA).

6.2 Purpose. Your personal data is collected and used for:
• Processing your eSIM orders
• Providing customer support
• Improving our services
• Sending service-related communications
• Complying with legal obligations

6.3 Disclosure. We do not sell your personal data to third parties. We may share data with:
• Payment processors (Stripe)
• eSIM network providers (for order fulfilment)
• Cloud service providers (Supabase, Cloudflare)
• Law enforcement, when required by law

6.4 Retention. We retain your personal data for as long as necessary to fulfil the purposes outlined above, or as required by law.

6.5 Access and Correction. You have the right to access and correct your personal data. To exercise these rights, contact us at ${EMAIL}.

6.6 Do Not Call Registry. We comply with Singapore's Do Not Call (DNC) Registry provisions under the PDPA.`
  },
  {
    id: 'payments',
    title: '7. Payments and Pricing',
    content: `7.1 Currency. All prices are displayed in Singapore Dollars (SGD) unless otherwise stated.

7.2 GST. Prices are inclusive of applicable Goods and Services Tax (GST) where required under Singapore law.

7.3 Payment Processing. Payments are processed by Stripe. We do not store your full payment card details.

7.4 Price Changes. We reserve the right to change prices at any time. Changes will not affect orders already confirmed.

7.5 Failed Payments. If payment fails, your order will not be processed. You will be notified and given the opportunity to retry.`
  },
  {
    id: 'intellectual-property',
    title: '8. Intellectual Property',
    content: `8.1 Ownership. All content on the Platform, including but not limited to text, graphics, logos, software, and AI-generated outputs produced by our systems, is owned by or licensed to ${COMPANY}.

8.2 Limited Licence. We grant you a limited, non-exclusive, non-transferable licence to use the Platform for personal, non-commercial purposes.

8.3 Restrictions. You may not reproduce, distribute, modify, create derivative works of, or commercially exploit any content from the Platform without our prior written consent.

8.4 User Content. By saving itineraries or submitting content on the Platform, you grant us a non-exclusive licence to use such content to improve our services.`
  },
  {
    id: 'liability',
    title: '9. Limitation of Liability',
    content: `9.1 To the maximum extent permitted by Singapore law, ${COMPANY} shall not be liable for any:
• Indirect, incidental, or consequential damages
• Loss of profits or revenue
• Loss of data
• Personal injury or property damage arising from use of the Platform or AI-generated itineraries
• Service interruptions or technical failures

9.2 Our total liability to you for any claim shall not exceed the amount you paid to us in the 3 months preceding the claim.

9.3 Nothing in these Terms excludes liability for death or personal injury caused by our negligence, or for fraud or fraudulent misrepresentation, as required under Singapore law.`
  },
  {
    id: 'consumer-protection',
    title: '10. Consumer Protection',
    content: `10.1 These Terms do not exclude or limit any rights you may have under Singapore's Consumer Protection (Fair Trading) Act 2003 (CPFTA).

10.2 If you believe you have been subject to an unfair practice, you may lodge a complaint with the Competition and Consumer Commission of Singapore (CCCS) or the Small Claims Tribunal.

10.3 We are committed to resolving disputes fairly and promptly. Please contact us at ${EMAIL} before escalating any dispute.`
  },
  {
    id: 'prohibited',
    title: '11. Prohibited Uses',
    content: `You agree not to use the Platform to:
• Violate any applicable law or regulation
• Transmit harmful, offensive, or illegal content
• Attempt to gain unauthorised access to our systems
• Use automated tools to scrape or extract data
• Resell or commercially exploit eSIM plans without authorisation
• Circumvent any security or access controls
• Impersonate any person or entity`
  },
  {
    id: 'changes',
    title: '12. Changes to Terms',
    content: `We reserve the right to modify these Terms at any time. Changes will be posted on this page with an updated "Last Updated" date. Your continued use of the Platform after changes are posted constitutes acceptance of the revised Terms.

For material changes, we will notify registered users by email where practicable.`
  },
  {
    id: 'governing-law',
    title: '13. Governing Law and Dispute Resolution',
    content: `13.1 These Terms are governed by the laws of the Republic of Singapore.

13.2 Any dispute arising from these Terms shall first be attempted to be resolved through good-faith negotiation.

13.3 If negotiation fails, disputes shall be submitted to the exclusive jurisdiction of the Singapore courts, unless you elect to use the Small Claims Tribunal for claims within its jurisdiction.

13.4 Nothing in this clause prevents either party from seeking urgent injunctive relief.`
  },
  {
    id: 'contact',
    title: '14. Contact Us',
    content: `If you have any questions about these Terms, please contact us:

Company: ${COMPANY}
Email: ${EMAIL}
Address: ${ADDRESS}

For PDPA-related enquiries, please address your correspondence to our Data Protection Officer at ${EMAIL}.`
  },
];

export default function TermsAndConditions() {
  const [activeSection, setActiveSection] = useState(null);

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main} style={{ maxWidth: '900px' }}>

        {/* Header */}
        <div style={{ marginBottom: '40px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Legal</div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '32px', fontWeight: 900, marginBottom: '12px' }}>Terms & Conditions</h1>
          <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
            Last updated: {LAST_UPDATED} · {COMPANY} · Singapore
          </p>
          <div style={{ marginTop: '16px', background: 'rgba(0,200,255,0.06)', border: '1px solid rgba(0,200,255,0.2)', borderRadius: '12px', padding: '14px 18px', fontSize: '13px', color: 'var(--muted)' }}>
            Please read these Terms carefully before using {APP}. By using our services, you agree to these Terms.
          </div>
        </div>

        {/* Table of Contents */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', marginBottom: '40px' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Table of Contents</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sections.map(s => (
              <a key={s.id} href={'#' + s.id} style={{ fontSize: '14px', color: 'var(--muted)', textDecoration: 'none', padding: '4px 0', borderBottom: '1px solid transparent' }}
                onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                onMouseLeave={e => e.target.style.color = 'var(--muted)'}
              >
                {s.title}
              </a>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {sections.map(s => (
            <div key={s.id} id={s.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
              <div
                style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', background: 'rgba(0,200,255,0.04)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onClick={() => setActiveSection(activeSection === s.id ? null : s.id)}
              >
                <div style={{ fontWeight: 800, fontSize: '15px', fontFamily: 'var(--font-head)' }}>{s.title}</div>
                <span style={{ color: 'var(--accent)', fontSize: '18px' }}>{activeSection === s.id ? '−' : '+'}</span>
              </div>
              {activeSection === s.id && (
                <div style={{ padding: '20px 24px', fontSize: '14px', color: 'var(--muted)', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
                  {s.content}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontSize: '13px', color: 'var(--muted)' }}>© 2026 {COMPANY}. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/privacy" style={{ fontSize: '13px', color: 'var(--muted)', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link to="/" style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none' }}>Back to Home</Link>
          </div>
        </div>

      </main>
    </div>
  );
}
