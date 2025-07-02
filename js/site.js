(async () => {
  const posts = await fetch('./posts.json').then(r => r.json());

  /* ----------  build unique category list  ---------- */
  const allCats = [...new Set(posts.flatMap(p => p.categories || []))].sort();
  const catWrap = document.getElementById('category-filters');

  const selected = new Set();        // current filters

  allCats.forEach(cat => {
    const div = document.createElement('div');
    div.className = 'chip';
    div.textContent = cat;
    div.addEventListener('click', () => {
      if (selected.has(cat)) selected.delete(cat);
      else                    selected.add(cat);
      div.classList.toggle('selected');
      render();
    });
    catWrap.appendChild(div);
  });

  /* ----------  sort button  ---------- */
  const sortBtn = document.getElementById('sort-toggle');
  let asc = false;                   // newest→oldest by default
  sortBtn.addEventListener('click', () => {
    asc = !asc;
    sortBtn.classList.toggle('asc', asc);
    render();
  });

  /* ----------  rendering  ---------- */
  const listEl = document.getElementById('post-list');
  const md     = window.markdownit({html:true});

  function passesFilter(p){
    if (selected.size === 0) return true;
    return (p.categories||[]).some(c => selected.has(c));
  }

  function cmp(a,b){
    return asc
      ? new Date(a.date) - new Date(b.date)
      : new Date(b.date) - new Date(a.date);
}

  function render(){
    listEl.innerHTML = '';

    const visible = posts.filter(passesFilter);
    const pinned = visible.filter(p => p.pinned);
    const unpinned = visible.filter(p => !p.pinned).sort(cmp);

    [...pinned, ...unpinned].forEach(p => {
      const li = document.createElement('li');
      const blurbHtml = md.renderInline(p.blurb);

      li.innerHTML = `
        <div class="post-header">
          <a class="post-title"
              href="post.html?file=${encodeURIComponent(p.filename)}">
            ${p.title}
          </a>
          ${p.pinned
            ? '<span class="pin-badge">📌 Pinned</span>'
            : ''}
        </div>
        <div class="post-meta">${p.date} • ${(p.categories||[]).join(', ')}</div>
        <p class="post-blurb">${blurbHtml}</p>
      `;
      listEl.appendChild(li);
    });


    if (window.MathJax && MathJax.typesetPromise) {
      MathJax.typesetClear && MathJax.typesetClear();   // clear previous
      MathJax.typesetPromise();
    }
  }

  render();
})();
