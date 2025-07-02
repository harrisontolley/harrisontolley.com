(async () => {
  /* -------------  Locate the .md file requested  ------------- */
  const file = new URLSearchParams(location.search).get('file');
  if (!file) {
    document.body.innerHTML = '<p style="padding:2rem">Post not specified.</p>';
    return;
  }

  /* -------------  Fetch and split front-matter  ------------- */
  const resp = await fetch(`posts/${file}`);
  if (!resp.ok) {
    document.body.innerHTML = `<p style="padding:2rem">Could not load post (${resp.status}).</p>`;
    return;
  }
  const raw = await resp.text();
  const [, fm = '', body = raw] = raw.match(/^---([\s\S]+?)---\s*([\s\S]*)$/) || [];

  const meta = Object.fromEntries(
    fm.split('\n').filter(Boolean).map(line => {
      const [, k, v] = line.match(/^([a-zA-Z0-9_-]+):\s*"?(.+?)"?$/) || [];
      return [k, v];
    })
  );

  /* -------------  Fill in the header  ------------- */
  const fullTitle = meta.title || 'Untitled';
  document.title         = `${fullTitle} — harrisontolley.com`;
  document.getElementById('post-title').textContent = fullTitle;

  const date = meta.date ? new Date(meta.date).toISOString().slice(0,10) : '';
  const catsTxt = meta.categories ? meta.categories : meta.category || '';
  document.querySelector('.post-meta').textContent =
    date + (catsTxt ? ` • ${catsTxt}` : '');

  /* -------------  Convert Markdown to HTML  ------------- */
  const md = window.markdownit({ html: true, linkify: true, typographer: true });
  document.getElementById('post-body').innerHTML = md.render(body);

  /* -------------  Trigger MathJax (if present)  ------------- */
  if (window.MathJax && MathJax.typeset) MathJax.typeset();
})();
