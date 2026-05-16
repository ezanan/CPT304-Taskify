/**
 * Taskify – Application Test Suite
 *
 * Tests are grouped by concern so the report can map each block to a
 * specific deficiency / baseline standard:
 *   - Routing & status codes        -> reliability
 *   - Response content & i18n       -> internationalisation deficiency
 *   - Accessibility markers          -> accessibility deficiency
 *   - Cookie banner & privacy        -> GDPR / legal compliance deficiency
 *   - HTTP headers & static assets   -> general hardening
 *   - 404 handler                    -> error-handling deficiency
 */

const request = require('supertest');
const app = require('./app');

describe('Taskify – Routing & status codes', () => {
  test('GET /          -> 200 OK', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
  });

  test('GET /signup    -> 200 OK', async () => {
    const res = await request(app).get('/signup');
    expect(res.statusCode).toBe(200);
  });

  test('GET /dashboard -> 200 OK', async () => {
    const res = await request(app).get('/dashboard');
    expect(res.statusCode).toBe(200);
  });

  test('GET /privacy   -> 200 OK', async () => {
    const res = await request(app).get('/privacy');
    expect(res.statusCode).toBe(200);
  });

  test('HEAD /         -> 200 OK (HEAD must be supported by GET handler)', async () => {
    const res = await request(app).head('/');
    expect(res.statusCode).toBe(200);
  });
});

describe('Taskify – Page content & branding', () => {
  test('Home page renders the Taskify <title>', async () => {
    const res = await request(app).get('/');
    expect(res.text).toMatch(/<title>\s*Taskify\s*<\/title>/);
  });

  test('Home page includes the hero section (i18n key from partial)', async () => {
    const res = await request(app).get('/');
    expect(res.text).toContain('hero_title');
  });

  test('Signup page renders the SignUp <title> and form action', async () => {
    const res = await request(app).get('/signup');
    expect(res.text).toMatch(/<title>\s*SignUp\s*<\/title>/);
    expect(res.text).toContain('action="/signup"');
  });

  test('Dashboard page renders the Dashboard <title>', async () => {
    const res = await request(app).get('/dashboard');
    expect(res.text).toMatch(/<title>\s*Dashboard\s*<\/title>/);
  });
});

describe('Taskify – Internationalisation (i18n)', () => {
  test('Navigation contains data-i18n attributes for translatable links', async () => {
    const res = await request(app).get('/');
    expect(res.text).toContain('data-i18n="nav_features"');
    expect(res.text).toContain('data-i18n="nav_pricing"');
  });

  test('Language dropdown exposes three locales (en, zh, ar)', async () => {
    const res = await request(app).get('/');
    expect(res.text).toContain('data-lang="en"');
    expect(res.text).toContain('data-lang="zh"');
    expect(res.text).toContain('data-lang="ar"');
  });

  test('i18next resource bundle includes all three locales', async () => {
    const res = await request(app).get('/');
    expect(res.text).toMatch(/en:\s*\{/);
    expect(res.text).toMatch(/zh:\s*\{/);
    expect(res.text).toMatch(/ar:\s*\{/);
  });

  test('RTL handling is wired up for Arabic', async () => {
    const res = await request(app).get('/');
    expect(res.text).toMatch(/applyDirection|rtl/);
  });
});

describe('Taskify – Accessibility (WCAG / ARIA markers)', () => {
  test('<html lang="..."> attribute is present on every page', async () => {
    for (const url of ['/', '/signup', '/dashboard', '/privacy']) {
      const res = await request(app).get(url);
      expect(res.text).toMatch(/<html[^>]*\blang=/);
    }
  });

  test('Language dropdown button declares ARIA state', async () => {
    const res = await request(app).get('/');
    expect(res.text).toContain('id="lang-dropdown-btn"');
    expect(res.text).toContain('aria-expanded');
    expect(res.text).toContain('aria-haspopup="true"');
    expect(res.text).toContain('aria-controls="lang-dropdown-menu"');
  });

  test('Language menu items use role="menuitem"', async () => {
    const res = await request(app).get('/');
    expect(res.text).toMatch(/role="menuitem"/);
  });

  test('Social-link list in the footer has aria-label and role', async () => {
    const res = await request(app).get('/');
    expect(res.text).toContain('aria-label="Social links"');
    expect(res.text).toContain('aria-label="facebook"');
  });

  test('Images expose meaningful alt text', async () => {
    const res = await request(app).get('/');
    expect(res.text).toMatch(/<img[^>]+alt="logo"/);
    expect(res.text).toMatch(/<img[^>]+alt="Facebook"/);
  });
});

describe('Taskify – Cookie banner & GDPR compliance', () => {
  test('Cookie banner element exists on the landing page', async () => {
    const res = await request(app).get('/');
    expect(res.text).toContain('id="cookie-banner"');
  });

  test('Cookie banner is a labelled, described dialog (ARIA)', async () => {
    const res = await request(app).get('/');
    expect(res.text).toContain('role="dialog"');
    expect(res.text).toContain('aria-labelledby="cookie-title"');
    expect(res.text).toContain('aria-describedby="cookie-description"');
  });

  test('Banner offers Accept / Reject / Customize actions', async () => {
    const res = await request(app).get('/');
    expect(res.text).toContain('id="cookie-accept-all"');
    expect(res.text).toContain('id="cookie-reject-optional"');
    expect(res.text).toContain('id="cookie-customize"');
  });

  test('Banner links to the Privacy Policy page', async () => {
    const res = await request(app).get('/');
    expect(res.text).toMatch(/href="\/privacy"/);
  });

  test('Cookie consent is persisted via a named storage key', async () => {
    const res = await request(app).get('/');
    expect(res.text).toContain('taskifyCookieConsent');
  });
});

describe('Taskify – Privacy Policy page', () => {
  test('Renders the "Privacy Policy" heading', async () => {
    const res = await request(app).get('/privacy');
    expect(res.text).toMatch(/<h1>\s*Privacy Policy\s*<\/h1>/);
  });

  test('Discloses a "Last updated" date', async () => {
    const res = await request(app).get('/privacy');
    expect(res.text).toMatch(/Last updated:/i);
  });

  test('Privacy page reuses the global navigation partial', async () => {
    const res = await request(app).get('/privacy');
    expect(res.text).toContain('class="logo-wrapper"');
  });
});

describe('Taskify – HTTP headers & static assets', () => {
  test('HTML responses use UTF-8 Content-Type', async () => {
    const res = await request(app).get('/');
    expect(res.headers['content-type']).toMatch(/text\/html/);
    expect(res.headers['content-type']).toMatch(/charset=utf-8/i);
  });

  test('Static CSS is served from /static and is text/css', async () => {
    const res = await request(app).get('/static/styles/main.css');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/css/);
  });

  test('Static folder traversal is blocked by Express static', async () => {
    const res = await request(app).get('/static/../package.json');
    expect(res.statusCode).not.toBe(200);
  });
});

describe('Taskify – 404 handler', () => {
  test('Unknown route returns 404', async () => {
    const res = await request(app).get('/this-page-does-not-exist');
    expect(res.statusCode).toBe(404);
  });

  test('404 page is helpful (shows code, message and a home link)', async () => {
    const res = await request(app).get('/another-missing-page');
    expect(res.text).toContain('404');
    expect(res.text).toMatch(/Page Not Found/i);
    expect(res.text).toMatch(/href="\/"/);
  });

  test('404 also applies to deep nested unknown paths', async () => {
    const res = await request(app).get('/a/b/c/d');
    expect(res.statusCode).toBe(404);
  });
});

describe('Taskify – JSON / form-encoded body parsing', () => {
  test('Server accepts JSON bodies without crashing', async () => {
    const res = await request(app)
      .post('/no-such-endpoint')
      .send({ hello: 'world' })
      .set('Content-Type', 'application/json');
    expect([404, 405]).toContain(res.statusCode);
  });

  test('Server accepts urlencoded bodies without crashing', async () => {
    const res = await request(app)
      .post('/no-such-endpoint')
      .send('foo=bar')
      .set('Content-Type', 'application/x-www-form-urlencoded');
    expect([404, 405]).toContain(res.statusCode);
  });
});
