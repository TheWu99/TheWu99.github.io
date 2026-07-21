(() => {
  'use strict';

  const OWNER = 'TheWu99';
  const REPO = 'ChatGPT-Knowledge-Base';
  const API = 'https://api.github.com';
  const TOKEN_KEY = 'private-library-token';

  const el = id => document.getElementById(id);
  const authView = el('authView');
  const libraryView = el('libraryView');
  const authForm = el('authForm');
  const tokenInput = el('tokenInput');
  const rememberToken = el('rememberToken');
  const authStatus = el('authStatus');
  const libraryTree = el('libraryTree');
  const treeStatus = el('treeStatus');
  const bookCount = el('bookCount');
  const content = el('content');
  const breadcrumb = el('breadcrumb');
  const loadingState = el('loadingState');
  const sidebar = el('sidebar');

  let token = '';
  let books = [];
  let activePath = '';

  function setStatus(node, message, type = '') {
    node.textContent = message;
    node.className = `status ${type}`.trim();
  }

  async function api(path) {
    const response = await fetch(`${API}${path}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28'
      },
      cache: 'no-store'
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || `GitHub API ${response.status}`);
    }
    return response.json();
  }

  function decodeBase64(value) {
    const bytes = Uint8Array.from(atob(value.replace(/\n/g, '')), c => c.charCodeAt(0));
    return new TextDecoder('utf-8').decode(bytes);
  }

  async function readFile(path) {
    const data = await api(`/repos/${OWNER}/${REPO}/contents/${path.split('/').map(encodeURIComponent).join('/')}?t=${Date.now()}`);
    if (!data.content) throw new Error('无法读取文件内容');
    return decodeBase64(data.content);
  }

  function naturalCompare(a, b) {
    return a.localeCompare(b, 'zh-CN', { numeric: true, sensitivity: 'base' });
  }

  function prettifySlug(slug) {
    return decodeURIComponent(slug)
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  function firstHeading(markdown, fallback) {
    const match = markdown.match(/^#\s+(.+)$/m);
    return match ? match[1].replace(/[*_`]/g, '').trim() : fallback;
  }

  function isChapterFile(name) {
    return /^(chapter|ch|第)[-_\s]*\d+|^\d{1,3}[-_.\s]|第[一二三四五六七八九十百零〇]+章/i.test(name);
  }

  function chapterNumber(name) {
    const arabic = name.match(/(?:chapter|ch|第)?[-_\s]*(\d{1,3})/i);
    return arabic ? Number(arabic[1]) : null;
  }

  function inferStatus(book) {
    if (book.meta && typeof book.meta === 'object') {
      const raw = String(book.meta.status || book.meta.state || '').toLowerCase();
      if (/complete|finished|done|已完成/.test(raw)) return '已完成';
      if (/progress|generating|draft|进行|生成/.test(raw)) return '生成中';
      const total = Number(book.meta.totalChapters || book.meta.total_chapters || book.meta.total || 0);
      const completed = Number(book.meta.completedChapters || book.meta.completed_chapters || book.meta.completed || book.chapters.length);
      if (total && completed >= total) return '已完成';
    }
    return '生成中';
  }

  async function discoverBooks() {
    treeStatus.textContent = '正在扫描私人知识库…';
    const repo = await api(`/repos/${OWNER}/${REPO}`);
    const tree = await api(`/repos/${OWNER}/${REPO}/git/trees/${encodeURIComponent(repo.default_branch)}?recursive=1&t=${Date.now()}`);
    const files = tree.tree.filter(item => item.type === 'blob' && /\.md$|chapters\.json$/i.test(item.path));
    const dirs = new Map();

    for (const file of files) {
      const parts = file.path.split('/');
      const name = parts.pop();
      const dir = parts.join('/');
      if (!dir) continue;
      if (!dirs.has(dir)) dirs.set(dir, { path: dir, files: [], chapters: [], readme: null, overview: null, catalog: null });
      const group = dirs.get(dir);
      group.files.push({ name, path: file.path });
      if (/^readme\.md$/i.test(name)) group.readme = file.path;
      else if (/^(overview|introduction|index)\.md$/i.test(name)) group.overview = file.path;
      else if (/^chapters\.json$/i.test(name)) group.catalog = file.path;
      else if (/\.md$/i.test(name) && isChapterFile(name)) group.chapters.push({ name, path: file.path, number: chapterNumber(name) });
    }

    let candidates = [...dirs.values()].filter(group => group.catalog || group.chapters.length >= 1);
    candidates = candidates.filter(group => !candidates.some(other => other !== group && other.path.startsWith(`${group.path}/`) && other.chapters.length > group.chapters.length));

    for (const book of candidates) {
      book.slug = book.path.split('/').pop();
      book.title = prettifySlug(book.slug);
      book.meta = null;
      if (book.catalog) {
        try {
          book.meta = JSON.parse(await readFile(book.catalog));
          book.title = book.meta.title || book.meta.bookTitle || book.meta.book_title || book.title;
          const listed = Array.isArray(book.meta.chapters) ? book.meta.chapters : [];
          for (const item of listed) {
            const path = item.path || item.file || item.filename;
            if (!path) continue;
            const fullPath = path.includes('/') ? path : `${book.path}/${path}`;
            if (!book.chapters.some(ch => ch.path === fullPath)) {
              book.chapters.push({ name: path.split('/').pop(), path: fullPath, number: item.number || chapterNumber(path), title: item.title || '' });
            } else {
              const found = book.chapters.find(ch => ch.path === fullPath);
              found.title = item.title || found.title;
              found.number = item.number || found.number;
            }
          }
        } catch (error) {
          console.warn(`Cannot parse ${book.catalog}`, error);
        }
      }
      const introPath = book.readme || book.overview;
      if (introPath) {
        try {
          const intro = await readFile(introPath);
          book.title = firstHeading(intro, book.title).replace(/^《|》$/g, '');
          book.introPath = introPath;
        } catch (error) {
          console.warn(`Cannot read ${introPath}`, error);
        }
      }
      book.chapters.sort((a, b) => {
        if (a.number != null && b.number != null) return a.number - b.number;
        return naturalCompare(a.name, b.name);
      });
      book.status = inferStatus(book);
    }

    books = candidates.sort((a, b) => naturalCompare(a.title, b.title));
    bookCount.textContent = `${books.length} 本`;
    treeStatus.textContent = books.length ? '' : '没有发现包含章节的书籍目录。';
    renderTree();
  }

  function renderTree(query = '') {
    const q = query.trim().toLowerCase();
    libraryTree.replaceChildren();
    for (const book of books) {
      const matchingChapters = book.chapters.filter(ch => `${ch.title || ''} ${ch.name}`.toLowerCase().includes(q));
      if (q && !book.title.toLowerCase().includes(q) && matchingChapters.length === 0) continue;

      const group = document.createElement('section');
      group.className = 'book-group';
      if (q) group.classList.add('open');

      const bookButton = document.createElement('button');
      bookButton.type = 'button';
      bookButton.className = 'book-row';
      bookButton.dataset.path = book.introPath || book.chapters[0]?.path || '';
      bookButton.innerHTML = `<span class="caret">›</span><span><span>${escapeHtml(book.title)}</span><span class="book-meta">${book.chapters.length} 章</span></span><span class="status-pill">${book.status}</span>`;
      bookButton.addEventListener('click', async event => {
        group.classList.toggle('open');
        if (bookButton.dataset.path) await openDocument(bookButton.dataset.path, book.title, '书籍首页');
        event.stopPropagation();
      });

      const list = document.createElement('div');
      list.className = 'chapter-list';
      const visible = q && !book.title.toLowerCase().includes(q) ? matchingChapters : book.chapters;
      for (const chapter of visible) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'chapter-row';
        button.dataset.path = chapter.path;
        const number = chapter.number != null ? String(chapter.number).padStart(2, '0') : '•';
        const title = chapter.title || chapter.name.replace(/\.md$/i, '').replace(/[-_]+/g, ' ');
        button.innerHTML = `<span class="chapter-number">${number}</span><span>${escapeHtml(title)}</span>`;
        button.addEventListener('click', async event => {
          await openDocument(chapter.path, book.title, title);
          event.stopPropagation();
        });
        list.appendChild(button);
      }

      group.append(bookButton, list);
      libraryTree.appendChild(group);
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function inlineMarkdown(text) {
    return escapeHtml(text)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/__([^_]+)__/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  }

  function renderMarkdown(markdown) {
    const lines = markdown.replace(/\r/g, '').split('\n');
    let html = '';
    let listType = '';
    let inCode = false;
    let code = [];
    const closeList = () => { if (listType) { html += `</${listType}>`; listType = ''; } };

    for (const line of lines) {
      if (/^```/.test(line)) {
        closeList();
        if (!inCode) { inCode = true; code = []; }
        else { html += `<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`; inCode = false; }
        continue;
      }
      if (inCode) { code.push(line); continue; }
      const heading = line.match(/^(#{1,6})\s+(.+)$/);
      if (heading) { closeList(); const level = heading[1].length; html += `<h${level}>${inlineMarkdown(heading[2])}</h${level}>`; continue; }
      if (/^>\s?/.test(line)) { closeList(); html += `<blockquote>${inlineMarkdown(line.replace(/^>\s?/, ''))}</blockquote>`; continue; }
      const ul = line.match(/^\s*[-*+]\s+(.+)$/);
      if (ul) { if (listType !== 'ul') { closeList(); listType = 'ul'; html += '<ul>'; } html += `<li>${inlineMarkdown(ul[1])}</li>`; continue; }
      const ol = line.match(/^\s*\d+[.)]\s+(.+)$/);
      if (ol) { if (listType !== 'ol') { closeList(); listType = 'ol'; html += '<ol>'; } html += `<li>${inlineMarkdown(ol[1])}</li>`; continue; }
      if (/^---+$/.test(line.trim())) { closeList(); html += '<hr>'; continue; }
      if (!line.trim()) { closeList(); continue; }
      closeList(); html += `<p>${inlineMarkdown(line)}</p>`;
    }
    closeList();
    if (inCode) html += `<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`;
    return html;
  }

  async function openDocument(path, bookTitle, itemTitle) {
    if (!path) return;
    loadingState.hidden = false;
    content.hidden = true;
    try {
      const markdown = await readFile(path);
      content.innerHTML = renderMarkdown(markdown);
      breadcrumb.textContent = `${bookTitle} / ${itemTitle}`;
      activePath = path;
      document.querySelectorAll('[data-path]').forEach(node => node.classList.toggle('active', node.dataset.path === path));
      if (window.innerWidth <= 900) sidebar.classList.remove('open');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      content.innerHTML = `<div class="welcome"><h2>无法读取内容</h2><p>${escapeHtml(error.message)}</p></div>`;
    } finally {
      loadingState.hidden = true;
      content.hidden = false;
    }
  }

  async function authenticate(candidate) {
    token = candidate.trim();
    if (!token) throw new Error('请输入 GitHub Token');
    const user = await api('/user');
    if (user.login !== OWNER) throw new Error(`此阅读器只允许 ${OWNER} 登录`);
    const repo = await api(`/repos/${OWNER}/${REPO}`);
    if (!repo.private) throw new Error('目标知识库不是私人仓库');
    if (rememberToken.checked) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
    authView.hidden = true;
    libraryView.hidden = false;
    await discoverBooks();
  }

  authForm.addEventListener('submit', async event => {
    event.preventDefault();
    setStatus(authStatus, '正在验证 GitHub 身份…');
    el('unlockButton').disabled = true;
    try {
      await authenticate(tokenInput.value);
      setStatus(authStatus, '验证成功', 'success');
    } catch (error) {
      token = '';
      setStatus(authStatus, error.message, 'error');
    } finally {
      el('unlockButton').disabled = false;
    }
  });

  el('toggleToken').addEventListener('click', () => {
    const hidden = tokenInput.type === 'password';
    tokenInput.type = hidden ? 'text' : 'password';
    el('toggleToken').textContent = hidden ? '隐藏' : '显示';
  });

  el('lockButton').addEventListener('click', () => {
    sessionStorage.removeItem(TOKEN_KEY);
    token = '';
    books = [];
    libraryView.hidden = true;
    authView.hidden = false;
    tokenInput.value = '';
    content.innerHTML = '<div class="welcome"><div class="welcome-mark">道</div><h2>选择左侧书名或章节开始阅读</h2></div>';
  });

  el('refreshButton').addEventListener('click', discoverBooks);
  el('librarySearch').addEventListener('input', event => renderTree(event.target.value));
  el('sidebarButton').addEventListener('click', () => sidebar.classList.toggle('open'));
  el('fontSize').addEventListener('input', event => document.documentElement.style.setProperty('--reader-font-size', `${event.target.value}px`));
  el('themeButton').addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme === 'dark';
    document.documentElement.dataset.theme = dark ? '' : 'dark';
    localStorage.setItem('private-library-theme', dark ? 'light' : 'dark');
  });

  if (localStorage.getItem('private-library-theme') === 'dark') document.documentElement.dataset.theme = 'dark';
  const saved = sessionStorage.getItem(TOKEN_KEY);
  if (saved) {
    tokenInput.value = saved;
    rememberToken.checked = true;
    authenticate(saved).catch(error => {
      sessionStorage.removeItem(TOKEN_KEY);
      setStatus(authStatus, error.message, 'error');
      authView.hidden = false;
      libraryView.hidden = true;
    });
  }
})();