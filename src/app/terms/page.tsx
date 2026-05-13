import { ShieldCheck } from 'lucide-react';

export default function TermsAndConditions() {
  return (
    <div className="container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', color: 'var(--text-primary)' }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <ShieldCheck size={48} style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }} />
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Terms & Conditions</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Echoir Copyright Policy and Terms of Use</p>
      </div>

      <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', lineHeight: '1.6' }}>
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent-secondary)' }}>1. Introduction</h2>
          <p style={{ marginBottom: '1rem' }}>
            Welcome to Echoir. By using this platform, you agree to all applicable terms and conditions, including but not limited to rules regarding copyright, content uploads, and community guidelines.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent-secondary)' }}>2. Copyright & Ownership</h2>
          <p style={{ marginBottom: '1rem' }}>
            All musical works, audio tracks, lyrics, and visual materials uploaded to Echoir remain the intellectual property of their original creators. Echoir claims no ownership over the works uploaded by users.
          </p>
          <p style={{ marginBottom: '1rem' }}>
            By uploading works to Echoir, you grant the platform a non-exclusive license to play, distribute, and display your work to the public through our services.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent-secondary)' }}>3. Copyright Infringement</h2>
          <p style={{ marginBottom: '1rem' }}>
            Users are <strong>STRICTLY PROHIBITED</strong> from uploading music, cover songs, or audio materials that contain third-party copyrights without written permission from the legitimate owner.
          </p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            <li style={{ marginBottom: '0.5rem' }}>Accounts that violate copyright will receive a warning.</li>
            <li style={{ marginBottom: '0.5rem' }}>Echoir reserves the right to remove tracks that are proven to violate copyright (DMCA Take Down) without prior notice.</li>
            <li style={{ marginBottom: '0.5rem' }}>Repeated violations will result in permanent account suspension.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--accent-secondary)' }}>4. Forum Community Guidelines</h2>
          <p style={{ marginBottom: '1rem' }}>
            The Echoir discussion forum is provided as a means for collaboration and knowledge sharing. Please maintain politeness, do not spam, and respect fellow musicians.
          </p>
        </section>

        <section>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '3rem' }}>
            Last updated: {new Date().toLocaleDateString('en-US')}
          </p>
        </section>
      </div>
    </div>
  );
}
