(async () => {
  /* -------------  Locate the .md file requested  ------------- */
  const file = new URLSearchParams(location.search).get('file');
  if (!file) {
    document.body.innerHTML = '<p style="padding:2rem">Post not specified.</p>';
    return;
  }

  /* -------------  Fetch and split front-matter   ------------- */
  const resp = await fetch(`posts/${file}`);
  if (!resp.ok) {
    document.body.innerHTML = `<p style="padding:2rem">Could not load post (${resp.status}).</p>`;
    return;
  }
  const raw = await resp.text();
  // front-matter is everything between the first two --- blocks
  const [, fm = '', body = raw] =
    raw.match(/^---([\s\S]+?)---\s*([\s\S]*)$/) || [];

  const meta = Object.fromEntries(
    fm
      .split('\n')
      .filter(Boolean)
      .map(line => {
        const [, k, v] = line.match(/^([a-zA-Z0-9_-]+):\s*"?(.+?)"?$/) || [];
        return [k, v];
      })
  );

  /* -------------  Fill in the header  ------------- */
  const fullTitle = meta.title || 'Untitled';
  document.title = `${fullTitle} — harrisontolley.com`;
  document.getElementById('post-title').textContent = fullTitle;

  /* -------------  SEO injection  ------------- */
  (function addSeoTags() {
    const head = document.head;
    const put = (tag, keyAttr, attrs) => {
      // avoid duplicate
      const selector = Object.entries(attrs)
        .map(([k, v]) => `[${k}="${v}"]`)
        .join('');
      let el = head.querySelector(`${tag}${selector}`);
      if (!el) el = document.createElement(tag);
      Object.assign(el, attrs);
      head.appendChild(el);
    };

    // description
    const description =
      meta.description ||
      meta.blurb ||
      (body.replace(/[#_*`>~\-\[\]\(\)]+/g, '').slice(0, 150) + '…');
    put('meta', 'name', { name: 'description', content: description });

    // keywords (from front-matter keywords + categories)
    const kws = [
      ...(meta.keywords ? meta.keywords.split(',') : []),
      ...(meta.categories ? meta.categories.split(',') : [])
    ]
      .map(w => w.trim())
      .filter(Boolean)
      .join(', ');
    if (kws) {
      put('meta', 'name', { name: 'keywords', content: kws });
    }

    // canonical
    put('link', 'rel', {
      rel: 'canonical',
      href: location.href
    });

    // Open Graph & Twitter
    const og = [
      ['og:type', 'article'],
      ['og:title', fullTitle],
      ['og:description', description],
      ['og:url', location.href],
      // optionally add an image if you have one:
      // ['og:image', 'https://harrisontolley.com/assets/cover.png']
    ];
    og.forEach(([prop, content]) =>
      put('meta', 'property', { property: prop, content })
    );
    const tw = [
      ['twitter:card', 'summary_large_image'],
      ['twitter:title', fullTitle],
      ['twitter:description', description]
      // optionally ['twitter:image', 'https://…']
    ];
    tw.forEach(([name, content]) =>
      put('meta', 'name', { name, content })
    );

    // Structured Data (JSON-LD for Article)
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: fullTitle,
      description,
      author: {
        '@type': 'Person',
        name: 'Harrison Tolley'
      },
      datePublished: meta.date || '',
      mainEntityOfPage: location.href
    };
    let script = head.querySelector('script[type="application/ld+json"]');
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
    }
    script.textContent = JSON.stringify(ld, null, 2);
    head.appendChild(script);
  })();

  /* -------------  Fill in the meta line  ------------- */
  const date = meta.date ? new Date(meta.date).toISOString().slice(0, 10) : '';
  const cats = meta.categories || meta.category || '';
  document.querySelector('.post-meta').textContent =
    date + (cats ? ` • ${cats}` : '');

  /* -------------  Convert Markdown to HTML  ------------- */
  const md = window.markdownit({ html: true, linkify: true, typographer: true });
  document.getElementById('post-body').innerHTML = md.render(body);

  /* -------------  Trigger MathJax (if present)  ------------- */
  if (window.MathJax && MathJax.typeset) MathJax.typeset();
})();
