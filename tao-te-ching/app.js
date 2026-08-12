'use strict';

const state = {
  manifest: null,
  current: 1,
  fontSizes: ['small', 'medium', 'large']
};

const el = (id) => document.getElementById(id);
const root = document.documentElement;

const audioState = {
  supported: 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window,
  segments: [],
  index: 0,
  playing: false,
  paused: false,
  generation: 0,
  utterance: null,
  voices: []
};

const tick = String.fromCharCode(96);

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function safeUrl(value) {
  const url = String(value || '').trim();
  if (/^(https?:\/\/|\.\.?\/|#)/i.test(url)) return url;
  return '#';
}

function inline(text) {
  let value = escapeHtml(text);
  const code = [];
  const inlineCode = new RegExp(tick + '([^' + tick + ']+)' + tick, 'g');
  value = value.replace(inlineCode, function (_, body) {
    const index = code.push('<code>' + body + '</code>') - 1;
    return '@@CODE' + index + '@@';
  });
  value = value
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+)__/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (_, label, url) {
      return '<a href="' + escapeHtml(safeUrl(url)) + '" target="_blank" rel="noopener noreferrer">' + label + '</a>';
    });
  value = value.replace(/@@CODE(\d+)@@/g, function (_, index) { return code[Number(index)]; });
  return value;
}

function isTableDivider(line) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function tableCells(line) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(function (cell) { return cell.trim(); });
}

function headingId(text, index) {
  const base = text.replace(/[\s*_【】《》：:，。、“”‘’（）()]+/g, '-').replace(/^-|-$/g, '');
  return (base || 'section') + '-' + index;
}

function markdownToHtml(markdown) {
  const source = String(markdown || '').replace(/^#\s+[^\n]+\n+/, '');
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const output = [];
  const fencePattern = new RegExp('^\\s*' + tick + tick + tick + '([^\\s]*)\\s*$');
  const fenceClose = new RegExp('^\\s*' + tick + tick + tick);
  let i = 0;
  let headingCount = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i += 1; continue; }

    const fence = line.match(fencePattern);
    if (fence) {
      const language = fence[1] || '';
      const body = [];
      i += 1;
      while (i < lines.length && !fenceClose.test(lines[i])) {
        body.push(lines[i]); i += 1;
      }
      if (i < lines.length) i += 1;
      output.push('<pre class="code-block" data-language="' + escapeHtml(language) + '"><code>' + escapeHtml(body.join('\n')) + '</code></pre>');
      continue;
    }

    const heading = line.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      headingCount += 1;
      const level = heading[1].length;
      const id = headingId(heading[2], headingCount);
      output.push('<h' + level + ' id="' + escapeHtml(id) + '">' + inline(heading[2]) + '</h' + level + '>');
      i += 1; continue;
    }

    if (/^\s*(---+|\*\*\*+)\s*$/.test(line)) {
      output.push('<hr>'); i += 1; continue;
    }

    if (/^\s*>/.test(line)) {
      const quote = [];
      while (i < lines.length && (/^\s*>/.test(lines[i]) || !lines[i].trim())) {
        if (/^\s*>/.test(lines[i])) quote.push(lines[i].replace(/^\s*>\s?/, ''));
        else quote.push('');
        i += 1;
      }
      const paragraphs = quote.join('\n').split(/\n\s*\n/).filter(Boolean).map(function (paragraph) {
        return '<p>' + inline(paragraph).replaceAll('\n', '<br>') + '</p>';
      });
      output.push('<blockquote>' + paragraphs.join('') + '</blockquote>');
      continue;
    }

    if (i + 1 < lines.length && line.includes('|') && isTableDivider(lines[i + 1])) {
      const headers = tableCells(line);
      const rows = [];
      i += 2;
      while (i < lines.length && lines[i].includes('|') && lines[i].trim()) {
        rows.push(tableCells(lines[i])); i += 1;
      }
      const head = '<thead><tr>' + headers.map(function (cell) { return '<th>' + inline(cell) + '</th>'; }).join('') + '</tr></thead>';
      const body = '<tbody>' + rows.map(function (row) {
        return '<tr>' + row.map(function (cell) { return '<td>' + inline(cell) + '</td>'; }).join('') + '</tr>';
      }).join('') + '</tbody>';
      output.push('<div class="table-wrap"><table>' + head + body + '</table></div>');
      continue;
    }

    if (/^\s*[-*+]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*+]\s+/, '')); i += 1;
      }
      output.push('<ul>' + items.map(function (item) { return '<li>' + inline(item) + '</li>'; }).join('') + '</ul>');
      continue;
    }

    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+[.)]\s+/, '')); i += 1;
      }
      output.push('<ol>' + items.map(function (item) { return '<li>' + inline(item) + '</li>'; }).join('') + '</ol>');
      continue;
    }

    const paragraph = [line.trim()];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{2,4})\s+/.test(lines[i]) &&
      !/^\s*>/.test(lines[i]) &&
      !/^\s*[-*+]\s+/.test(lines[i]) &&
      !/^\s*\d+[.)]\s+/.test(lines[i]) &&
      !fenceClose.test(lines[i]) &&
      !(i + 1 < lines.length && lines[i].includes('|') && isTableDivider(lines[i + 1]))
    ) {
      paragraph.push(lines[i].trim()); i += 1;
    }
    output.push('<p>' + inline(paragraph.join(' ')) + '</p>');
  }

  return output.join('\n');
}

function chapterFromLocation() {
  const value = Number(new URLSearchParams(location.search).get('chapter')) || 1;
  return Math.min(Math.max(value, 1), state.manifest.chapters.length);
}

function chineseChapter(number) {
  const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  if (number < 10) return '第' + digits[number] + '章';
  if (number === 10) return '第十章';
  if (number < 20) return '第十' + digits[number % 10] + '章';
  const tens = digits[Math.floor(number / 10)] + '十';
  return '第' + tens + (number % 10 ? digits[number % 10] : '') + '章';
}

function renderChapterList(query) {
  const needle = String(query || '').trim().toLowerCase();
  el('chapterList').innerHTML = state.manifest.chapters
    .filter(function (chapter) {
      return !needle || chapter.title.toLowerCase().includes(needle) || String(chapter.chapter).includes(needle);
    })
    .map(function (chapter) {
      return '<a class="chapter-link ' + (chapter.chapter === state.current ? 'active' : '') +
        '" href="?chapter=' + chapter.chapter + '" data-chapter="' + chapter.chapter + '">' +
        '<span class="chapter-index">' + String(chapter.chapter).padStart(2, '0') + '</span>' +
        '<span>' + escapeHtml(chapter.title) + '</span></a>';
    }).join('');
}

function buildToc() {
  const headings = Array.from(el('content').querySelectorAll('h2'));
  el('toc').innerHTML = headings.slice(0, 18).map(function (heading) {
    return '<a class="toc-link" href="#' + encodeURIComponent(heading.id) + '">' + heading.textContent + '</a>';
  }).join('');
}

function updatePager() {
  const previous = state.manifest.chapters[state.current - 2];
  const next = state.manifest.chapters[state.current];
  function set(node, target) {
    node.classList.toggle('disabled', !target);
    if (!target) return;
    node.href = '?chapter=' + target.chapter;
    node.dataset.chapter = target.chapter;
    node.querySelector('strong').textContent = target.title;
  }
  set(el('previousChapter'), previous);
  set(el('nextChapter'), next);
}


function splitSpeechText(text, maxLength) {
  const cleaned = String(text || '')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\[\^[^\]]+\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return [];

  const sentences = cleaned.match(/[^。！？!?；;]+[。！？!?；;]?/g) || [cleaned];
  const chunks = [];
  let current = '';

  sentences.forEach(function (sentence) {
    const value = sentence.trim();
    if (!value) return;
    if ((current + value).length <= maxLength) {
      current += value;
      return;
    }
    if (current) chunks.push(current);
    if (value.length <= maxLength) {
      current = value;
      return;
    }
    for (let start = 0; start < value.length; start += maxLength) {
      chunks.push(value.slice(start, start + maxLength));
    }
    current = '';
  });
  if (current) chunks.push(current);
  return chunks;
}

function collectSpeechSegments() {
  const nodes = Array.from(el('content').querySelectorAll('h2, h3, h4, p, li'));
  const segments = [{
    text: chineseChapter(state.current) + '，' + el('chapterTitle').textContent.trim(),
    label: '章节标题',
    node: el('chapterTitle')
  }];

  nodes.forEach(function (node) {
    if (node.closest('pre, code, .code-block')) return;
    const text = node.textContent;
    if (/^\s*\[\^[^\]]+\]:/.test(text)) return;
    splitSpeechText(text, 160).forEach(function (chunk) {
      segments.push({
        text: chunk,
        label: node.matches('h2, h3, h4') ? text.trim() : '',
        node: node
      });
    });
  });

  return segments;
}

function selectedVoice() {
  const uri = el('audioVoice').value;
  const exact = audioState.voices.find(function (voice) { return voice.voiceURI === uri; });
  if (exact) return exact;
  return audioState.voices.find(function (voice) { return /^zh(?:-|_)/i.test(voice.lang); }) || null;
}

function loadSpeechVoices() {
  if (!audioState.supported) return;
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return;
  audioState.voices = voices;

  const chinese = voices.filter(function (voice) {
    return /^zh(?:-|_)/i.test(voice.lang) || /Chinese|Mandarin|中文|普通话|國語|国语/i.test(voice.name);
  });
  const options = chinese.length ? chinese : voices;
  const saved = localStorage.getItem('tao-audio-voice') || '';
  el('audioVoice').innerHTML = '<option value="">自动选择中文语音</option>' +
    options.map(function (voice) {
      return '<option value="' + escapeHtml(voice.voiceURI) + '">' +
        escapeHtml(voice.name + ' · ' + voice.lang) + '</option>';
    }).join('');
  if (options.some(function (voice) { return voice.voiceURI === saved; })) {
    el('audioVoice').value = saved;
  }
}

function clearSpeechHighlight() {
  el('content').querySelectorAll('.tts-active').forEach(function (node) {
    node.classList.remove('tts-active');
  });
}

function updateAudioUi(message) {
  const total = audioState.segments.length;
  const position = total ? Math.min(audioState.index + (audioState.playing ? 1 : 0), total) : 0;
  el('audioProgress').max = Math.max(1, total);
  el('audioProgress').value = position;
  el('audioProgressText').textContent = position + ' / ' + total;

  if (message) el('audioStatus').textContent = message;
  if (audioState.paused) el('audioPrimary').textContent = '▶ 继续';
  else if (audioState.playing) el('audioPrimary').textContent = 'Ⅱ 暂停';
  else el('audioPrimary').textContent = '▶ 朗读本章';

  const segment = audioState.segments[audioState.index];
  el('audioTitle').textContent = segment && audioState.playing
    ? (segment.label || chineseChapter(state.current) + ' · ' + el('chapterTitle').textContent)
    : chineseChapter(state.current) + ' · ' + el('chapterTitle').textContent;
}

function highlightSpeechSegment(segment) {
  clearSpeechHighlight();
  if (!segment || !segment.node) return;
  segment.node.classList.add('tts-active');
  const rect = segment.node.getBoundingClientRect();
  if (rect.top < 72 || rect.bottom > window.innerHeight - 190) {
    segment.node.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function speakCurrentSegment() {
  if (!audioState.supported || !audioState.segments.length) return;
  if (audioState.index >= audioState.segments.length) {
    stopSpeech(true);
    updateAudioUi('本章朗读完成。');
    return;
  }

  const generation = audioState.generation;
  const segment = audioState.segments[audioState.index];
  const utterance = new SpeechSynthesisUtterance(segment.text);
  const voice = selectedVoice();
  utterance.lang = voice ? voice.lang : 'zh-CN';
  utterance.voice = voice;
  utterance.rate = Number(el('audioRate').value) || 1;
  utterance.pitch = 1;
  audioState.utterance = utterance;
  audioState.playing = true;
  audioState.paused = false;

  utterance.onstart = function () {
    if (generation !== audioState.generation) return;
    highlightSpeechSegment(segment);
    updateAudioUi('正在朗读；可随时暂停或跳转段落。');
  };
  utterance.onend = function () {
    if (generation !== audioState.generation) return;
    audioState.index += 1;
    speakCurrentSegment();
  };
  utterance.onerror = function (event) {
    if (generation !== audioState.generation || event.error === 'canceled' || event.error === 'interrupted') return;
    audioState.playing = false;
    audioState.paused = false;
    clearSpeechHighlight();
    updateAudioUi('语音暂时无法播放，请重新点击朗读。');
  };

  speechSynthesis.speak(utterance);
}

function startSpeechAt(index) {
  if (!audioState.supported || !audioState.segments.length) return;
  audioState.generation += 1;
  speechSynthesis.cancel();
  audioState.index = Math.min(Math.max(index, 0), audioState.segments.length - 1);
  audioState.playing = true;
  audioState.paused = false;
  const generation = audioState.generation;
  setTimeout(function () {
    if (generation === audioState.generation) speakCurrentSegment();
  }, 50);
}

function toggleSpeech() {
  if (!audioState.supported) {
    updateAudioUi('此浏览器不支持网页语音朗读。');
    return;
  }
  if (!audioState.segments.length) return;

  if (audioState.paused) {
    speechSynthesis.resume();
    audioState.paused = false;
    audioState.playing = true;
    updateAudioUi('继续朗读。');
    return;
  }
  if (audioState.playing) {
    speechSynthesis.pause();
    audioState.paused = true;
    updateAudioUi('朗读已暂停。');
    return;
  }
  if (audioState.index >= audioState.segments.length) audioState.index = 0;
  startSpeechAt(audioState.index);
}

function stopSpeech(completed) {
  audioState.generation += 1;
  if (audioState.supported) speechSynthesis.cancel();
  audioState.playing = false;
  audioState.paused = false;
  audioState.utterance = null;
  clearSpeechHighlight();
  if (!completed) audioState.index = 0;
  updateAudioUi(completed ? '本章朗读完成。' : '朗读已停止。');
}

function moveSpeech(direction) {
  if (!audioState.segments.length) return;
  const next = Math.min(Math.max(audioState.index + direction, 0), audioState.segments.length - 1);
  startSpeechAt(next);
}

function prepareAudioChapter() {
  stopSpeech(false);
  audioState.segments = collectSpeechSegments();
  audioState.index = 0;
  const supported = audioState.supported && audioState.segments.length > 0;
  ['audioPrimary', 'audioPrevious', 'audioStop', 'audioNext', 'audioRate', 'audioVoice'].forEach(function (id) {
    el(id).disabled = !supported;
  });
  updateAudioUi(supported
    ? '浏览器语音在本机生成，不上传章节内容。'
    : '此浏览器不支持网页语音朗读。');
}

async function loadChapter(number) {
  const chapter = state.manifest.chapters[number - 1];
  if (!chapter) return;
  stopSpeech(false);
  state.current = number;
  document.title = chineseChapter(number) + '：' + chapter.title + ' · 道德经';
  el('chapterNumber').textContent = chineseChapter(number);
  el('chapterTitle').textContent = chapter.title;
  el('content').innerHTML = '<p class="loading">正在载入章节…</p>';
  renderChapterList(el('chapterSearch').value);
  closeMenu();

  try {
    const response = await fetch('./' + chapter.file);
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const markdown = await response.text();
    el('readingTime').textContent = '预计阅读 ' + Math.max(3, Math.round(markdown.length / 650)) + ' 分钟';
    el('content').innerHTML = markdownToHtml(markdown);
    buildToc();
    updatePager();
    prepareAudioChapter();
    requestAnimationFrame(function () { window.scrollTo({ top: 0, behavior: 'auto' }); });
  } catch (error) {
    el('content').innerHTML = '<blockquote><p>本章载入失败，请刷新页面后重试。</p></blockquote>';
  }
}

function updateProgress() {
  const doc = document.documentElement;
  const total = Math.max(1, doc.scrollHeight - doc.clientHeight);
  el('progressBar').style.width = Math.min(100, Math.max(0, (doc.scrollTop / total) * 100)) + '%';
}

function setTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem('tao-theme', theme);
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#151816' : '#f4efe5';
}

function toggleTheme() {
  setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
}

function cycleFontSize() {
  const current = root.dataset.fontSize || 'medium';
  const next = state.fontSizes[(state.fontSizes.indexOf(current) + 1) % state.fontSizes.length];
  root.dataset.fontSize = next;
  localStorage.setItem('tao-font-size', next);
  showToast(next === 'small' ? '小字号' : next === 'large' ? '大字号' : '标准字号');
}

function openMenu() {
  document.body.classList.add('menu-open');
  el('menuButton').setAttribute('aria-expanded', 'true');
}

function closeMenu() {
  document.body.classList.remove('menu-open');
  el('menuButton').setAttribute('aria-expanded', 'false');
}

let toastTimer;
function showToast(message) {
  clearTimeout(toastTimer);
  el('toast').textContent = message;
  el('toast').classList.add('show');
  toastTimer = setTimeout(function () { el('toast').classList.remove('show'); }, 1800);
}

async function shareChapter() {
  const data = { title: document.title, text: el('chapterTitle').textContent, url: location.href };
  try {
    if (navigator.share) await navigator.share(data);
    else {
      await navigator.clipboard.writeText(location.href);
      showToast('章节链接已复制');
    }
  } catch (_) {}
}

async function init() {
  const savedTheme = localStorage.getItem('tao-theme');
  const preferredDark = matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(savedTheme || (preferredDark ? 'dark' : 'light'));
  root.dataset.fontSize = localStorage.getItem('tao-font-size') || 'medium';

  const response = await fetch('./chapters.json');
  state.manifest = await response.json();
  state.current = chapterFromLocation();
  renderChapterList();
  await loadChapter(state.current);


  if (audioState.supported) {
    loadSpeechVoices();
    speechSynthesis.addEventListener('voiceschanged', loadSpeechVoices);
  }
  el('audioRate').value = localStorage.getItem('tao-audio-rate') || '1';
  el('audioPrimary').addEventListener('click', toggleSpeech);
  el('audioStop').addEventListener('click', function () { stopSpeech(false); });
  el('audioPrevious').addEventListener('click', function () { moveSpeech(-1); });
  el('audioNext').addEventListener('click', function () { moveSpeech(1); });
  el('audioRate').addEventListener('change', function (event) {
    localStorage.setItem('tao-audio-rate', event.target.value);
    if (audioState.playing || audioState.paused) startSpeechAt(audioState.index);
  });
  el('audioVoice').addEventListener('change', function (event) {
    localStorage.setItem('tao-audio-voice', event.target.value);
    if (audioState.playing || audioState.paused) startSpeechAt(audioState.index);
  });
  el('audioCollapse').addEventListener('click', function (event) {
    const player = el('audioPlayer');
    const collapsed = player.classList.toggle('collapsed');
    event.currentTarget.setAttribute('aria-expanded', String(!collapsed));
    event.currentTarget.setAttribute('aria-label', collapsed ? '展开朗读器' : '收起朗读器');
    localStorage.setItem('tao-audio-collapsed', String(collapsed));
  });
  if (localStorage.getItem('tao-audio-collapsed') === 'true') {
    el('audioPlayer').classList.add('collapsed');
    el('audioCollapse').setAttribute('aria-expanded', 'false');
    el('audioCollapse').setAttribute('aria-label', '展开朗读器');
  }
  addEventListener('beforeunload', function () {
    if (audioState.supported) speechSynthesis.cancel();
  });

  el('chapterSearch').addEventListener('input', function (event) { renderChapterList(event.target.value); });
  document.addEventListener('click', function (event) {
    const link = event.target.closest('[data-chapter]');
    if (!link) return;
    event.preventDefault();
    const next = Number(link.dataset.chapter);
    history.pushState({ chapter: next }, '', '?chapter=' + next);
    loadChapter(next);
  });
  el('menuButton').addEventListener('click', openMenu);
  el('scrim').addEventListener('click', closeMenu);
  el('themeButton').addEventListener('click', toggleTheme);
  el('themeButtonMobile').addEventListener('click', toggleTheme);
  el('fontButton').addEventListener('click', cycleFontSize);
  el('shareButton').addEventListener('click', shareChapter);
  addEventListener('scroll', updateProgress, { passive: true });
  addEventListener('popstate', function () {
    const next = chapterFromLocation();
    if (next !== state.current) loadChapter(next);
  });
  addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeMenu();
    if ((event.altKey || event.metaKey) && event.key === 'ArrowLeft' && state.current > 1) {
      history.pushState({}, '', '?chapter=' + (state.current - 1));
      loadChapter(state.current - 1);
    }
    if ((event.altKey || event.metaKey) && event.key === 'ArrowRight' && state.current < state.manifest.chapters.length) {
      history.pushState({}, '', '?chapter=' + (state.current + 1));
      loadChapter(state.current + 1);
    }
  });
}

init().catch(function () {
  el('content').innerHTML = '<blockquote><p>目录载入失败，请稍后刷新。</p></blockquote>';
});
