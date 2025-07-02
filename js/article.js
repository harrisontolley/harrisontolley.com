(async () => {
  /* -------------  locate the .md file requested  ------------- */
  const file = new URLSearchParams(location.search).get('file');
  if (!file) {
    document.body.innerHTML = '<p style="padding:2rem">Post not specified.</p>';
    return;
  }

  /* -------------  fetch and split front-matter  ------------- */
  const resp = await fetch(`posts/${file}`);
  if (!resp.ok) {
    document.body.innerHTML =
      `<p style="padding:2rem">Could not load post (${resp.status}).</p>`;
    return;
  }

  const raw = await resp.text();
  const [, fm = '', body = raw] = raw.match(/^---([\s\S]+?)---\s*([\s\S]*)$/) || [];

  const meta = Object.fromEntries(
    fm.split('\n').filter(Boolean).map(l => {
      const [, k, v] = l.match(/^([A-Za-z0-9_-]+):\s*"?(.+?)"?$/) || [];
      return [k, v];
    })
  );

  /* -------------  header text  ------------- */
  const fullTitle = meta.title || 'Untitled';
  document.title = `${fullTitle} — harrisontolley.com`;
  document.getElementById('post-title').textContent = fullTitle;

  /* -------------  quick meta-line under the title ------------- */
  function getOrdinal(n){
    if (n % 10 === 1 && n !== 11) return 'st';
    if (n % 10 === 2 && n !== 12) return 'nd';
    if (n % 10 === 3 && n !== 13) return 'rd';
    return 'th';
  }

  const cats = meta.categories || meta.category || '';
  let humanDate = '';
  if (meta.date) {
    const d = new Date(meta.date);
    const monthName = d.toLocaleString('en-US', { month: 'long' });
    const day = d.getDate();
    const year = d.getFullYear();
    humanDate = `${monthName} ${day}${getOrdinal(day)}, ${year}`;
  }

  document.querySelector('.post-meta').textContent =
    humanDate + (cats ? ` • ${cats}` : '');

  /* -------------  safe SEO tag injection ------------- */
  try {
    const head = document.head;

    const put = (tagName, attrs) => {
      // use the first distinguishing attribute only
      const keyAttr = ['name', 'property', 'rel'].find(k => k in attrs);
      let el = keyAttr ? head.querySelector(`${tagName}[${keyAttr}="${attrs[keyAttr]}"]`)
                       : null;
      if (!el) el = document.createElement(tagName);
      Object.assign(el, attrs);
      head.appendChild(el);
    };

    const description =
      meta.description ||
      meta.blurb ||
      body.replace(/[#_*`>~\-\[\]\(\)`]/g, '').slice(0, 150) + '…';

    put('meta', { name: 'description', content: description });

    const keywords = [
      ...(meta.keywords ? meta.keywords.split(',') : []),
      ...(meta.categories ? meta.categories.split(',') : [])
    ].map(w => w.trim()).filter(Boolean).join(', ');
    if (keywords) put('meta', { name: 'keywords', content: keywords });

    put('link', { rel: 'canonical', href: location.href });

    [
      ['og:type',        'article'],
      ['og:title',       fullTitle],
      ['og:description', description],
      ['og:url',         location.href]
    ].forEach(([p, c]) => put('meta', { property: p, content: c }));

    [
      ['twitter:card',        'summary_large_image'],
      ['twitter:title',       fullTitle],
      ['twitter:description', description]
    ].forEach(([n, c]) => put('meta', { name: n, content: c }));

    const ld = {
      '@context': 'https://schema.org',
      '@type'   : 'Article',
      headline  : fullTitle,
      description,
      author: { '@type': 'Person', name: 'Harrison Tolley' },
      datePublished: meta.date || '',
      mainEntityOfPage: location.href
    };
    let ldScript = head.querySelector('script[type="application/ld+json"]');
    if (!ldScript) {
      ldScript = document.createElement('script');
      ldScript.type = 'application/ld+json';
      head.appendChild(ldScript);
    }
    ldScript.textContent = JSON.stringify(ld);
  } catch (err) {
    console.warn('SEO tag generation failed:', err);
    // continue – the post will still display
  }

  /* -------------  render Markdown ------------- */
  const md = window.markdownit({ html: true, linkify: true, typographer: true });
  document.getElementById('post-body').innerHTML = md.render(body);

  /* -------------  MathJax (if present) ------------- */
  if (window.MathJax && MathJax.typeset) MathJax.typeset();
})();
