"use strict";

const CONFIG = Object.freeze({
  allowedLogin: "TheWu99",
  owner: "TheWu99",
  repository: "ChatGPT-Knowledge-Base",
  branch: "main",
  bookPath: "Philosophy/Chinese-Philosophy/Dao-De-Jing",
  apiVersion: "2022-11-28"
});

const state = {
  token: "",
  chapters: [],
  activeIndex: -1,
  markdown: "",
  speechChunks: [],
  speechIndex: 0,
  speaking: false,
  paused: false
};

const $ = (id) => document.getElementById(id);
const elements = {
  authView: $("authView"), readerView: $("readerView"), authForm: $("authForm"),
  tokenInput: $("tokenInput"), toggleToken: $("toggleToken"), rememberToken: $("rememberToken"),
  unlockButton: $("unlockButton"), authStatus: $("authStatus"), lockButton: $("lockButton"),
  themeButton: $("themeButton"), chapterSearch: $("chapterSearch"), chapterList: $("chapterList"),
  sidebar: $("sidebar"), sidebarButton: $("sidebarButton"), prevButton: $("prevButton"),
  nextButton: $("nextButton"), chapterProgress: $("chapterProgress"), fontSize: $("fontSize"),
  audioScope: $("audioScope"), voiceSelect: $("voiceSelect"), rateSelect: $("rateSelect"),
  speakButton: $("speakButton"), pauseButton: $("pauseButton"), stopButton: $("stopButton"),
  speechStatus: $("speechStatus"), loadingState: $("loadingState"), chapterContent: $("chapterContent")
};

function setStatus(element, message, kind = "") {
  element.textContent = message;
  element.className = `status ${kind}`.trim();
}

function encodePath(path) {
  return path.split("/").map(encodeURIComponent).join("/");
}

async function githubRequest(url, raw = false) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": raw ? "application/vnd.github.raw+json" : "application/vnd.github+json",
      "Authorization": `Bearer ${state.token}`,
      "X-GitHub-Api-Version": CONFIG.apiVersion
    },
    cache: "no-store",
    referrerPolicy: "no-referrer"
  });

  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = body.message ? `：${body.message}` : "";
    } catch (_) {
      detail = "";
    }
    const error = new Error(`GitHub API 返回 ${response.status}${detail}`);
    error.status = response.status;
    throw error;
  }
  return raw ? response.text() : response.json();
}

function contentApiUrl(path = "") {
  const encoded = encodePath(path);
  return `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repository}/contents/${encoded}?ref=${encodeURIComponent(CONFIG.branch)}`;
}

async function authenticate(token) {
  state.token = token.trim();
  if (!state.token) throw new Error("请输入 GitHub 只读令牌。");

  const user = await githubRequest("https://api.github.com/user");
  if (user.login !== CONFIG.allowedLogin) {
    throw new Error(`访问被拒绝：当前令牌属于 ${user.login}，此阅读器只允许 ${CONFIG.allowedLogin}。`);
  }

  const repo = await githubRequest(`https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repository}`);
  if (!repo.private) {
    throw new Error("安全检查失败：知识库仓库当前不是私有仓库。");
  }

  const manifestText = await githubRequest(contentApiUrl(`${CONFIG.bookPath}/chapters.json`), true);
  const manifest = JSON.parse(manifestText);
  if (!Array.isArray(manifest) || manifest.length === 0) {
    throw new Error("章节清单为空或格式不正确。");
  }
  state.chapters = manifest.sort((a, b) => Number(a.chapter) - Number(b.chapter));
}

function unlockReader() {
  elements.authView.hidden = true;
  elements.readerView.hidden = false;
  renderChapterList();
  populateVoices();
  const savedChapter = Number(localStorage.getItem("dao-reader-last-chapter"));
  const index = state.chapters.findIndex((item) => Number(item.chapter) === savedChapter);
  loadChapter(index >= 0 ? index : 0);
}

function lockReader(message = "") {
  stopSpeech();
  state.token = "";
  state.markdown = "";
  state.activeIndex = -1;
  state.chapters = [];
  sessionStorage.removeItem("dao-reader-token");
  elements.tokenInput.value = "";
  elements.chapterContent.replaceChildren();
  elements.readerView.hidden = true;
  elements.authView.hidden = false;
  setStatus(elements.authStatus, message, message ? "success" : "");
}

async function handleLogin(event) {
  event.preventDefault();
  elements.unlockButton.disabled = true;
  setStatus(elements.authStatus, "正在验证 GitHub 身份和私有仓库访问权限…");
  try {
    await authenticate(elements.tokenInput.value);
    if (elements.rememberToken.checked) sessionStorage.setItem("dao-reader-token", state.token);
    else sessionStorage.removeItem("dao-reader-token");
    setStatus(elements.authStatus, "验证成功。", "success");
    unlockReader();
  } catch (error) {
    state.token = "";
    sessionStorage.removeItem("dao-reader-token");
    const hint = error.status === 401
      ? "令牌无效或已过期。"
      : error.status === 403
        ? "令牌权限不足或触发了 API 限制。"
        : error.status === 404
          ? "无法读取私有仓库，请确认令牌只读授权了 ChatGPT-Knowledge-Base。"
          : error.message;
    setStatus(elements.authStatus, hint, "error");
  } finally {
    elements.unlockButton.disabled = false;
  }
}

function renderChapterList(filter = "") {
  const query = filter.trim().toLowerCase();
  const fragment = document.createDocumentFragment();
  state.chapters.forEach((chapter, index) => {
    const label = `第${chapter.chapter}章 ${chapter.title}`;
    if (query && !label.toLowerCase().includes(query)) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chapter-item${index === state.activeIndex ? " active" : ""}`;
    button.dataset.index = String(index);
    button.innerHTML = `<span class="chapter-number">${String(chapter.chapter).padStart(2, "0")}</span><span class="chapter-title">${escapeHtml(chapter.title)}</span>`;
    button.addEventListener("click", () => loadChapter(index));
    fragment.appendChild(button);
  });
  elements.chapterList.replaceChildren(fragment);
}

async function loadChapter(index) {
  if (index < 0 || index >= state.chapters.length || index === state.activeIndex && state.markdown) return;
  stopSpeech();
  elements.loadingState.hidden = false;
  elements.chapterContent.replaceChildren();
  elements.prevButton.disabled = index === 0;
  elements.nextButton.disabled = index === state.chapters.length - 1;
  try {
    const chapter = state.chapters[index];
    const markdown = await githubRequest(contentApiUrl(`${CONFIG.bookPath}/${chapter.file}`), true);
    state.activeIndex = index;
    state.markdown = markdown;
    elements.chapterContent.innerHTML = renderMarkdown(markdown);
    elements.chapterProgress.textContent = `第 ${chapter.chapter} / ${state.chapters.length} 章`;
    document.title = `第${chapter.chapter}章 ${chapter.title}｜《道德经》私人阅读室`;
    localStorage.setItem("dao-reader-last-chapter", String(chapter.chapter));
    renderChapterList(elements.chapterSearch.value);
    elements.sidebar.classList.remove("open");
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    elements.chapterContent.innerHTML = `<div class="security-note"><strong>章节读取失败</strong><p>${escapeHtml(error.message)}</p></div>`;
    if (error.status === 401 || error.status === 403) lockReader("登录状态已失效，请重新解锁。");
  } finally {
    elements.loadingState.hidden = true;
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char]));
}

function inlineMarkdown(source) {
  const placeholders = [];
  let text = String(source);

  text = text.replace(/`([^`]+)`/g, (_, code) => {
    const key = `\u0000${placeholders.length}\u0000`;
    placeholders.push(`<code>${escapeHtml(code)}</code>`);
    return key;
  });

  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (_, label, href) => {
    let safeHref = "";
    try {
      const parsed = new URL(href, window.location.href);
      if (["http:", "https:", "mailto:"].includes(parsed.protocol)) safeHref = parsed.href;
    } catch (_) {
      safeHref = "";
    }
    const key = `\u0000${placeholders.length}\u0000`;
    placeholders.push(safeHref
      ? `<a href="${escapeHtml(safeHref)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`
      : escapeHtml(label));
    return key;
  });

  text = escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "<em>$1</em>");

  return text.replace(/\u0000(\d+)\u0000/g, (_, index) => placeholders[Number(index)] || "");
}

function isTableDivider(line) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function splitTableRow(line) {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

function renderMarkdown(markdown) {
  const lines = String(markdown).replace(/\r\n?/g, "\n").split("\n");
  const html = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i += 1; continue; }

    const fence = line.match(/^```\s*([\w-]*)\s*$/);
    if (fence) {
      const code = [];
      i += 1;
      while (i < lines.length && !/^```/.test(lines[i])) code.push(lines[i++]);
      i += 1;
      html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      i += 1;
      continue;
    }

    if (/^\s*(---+|___+|\*\*\*+)\s*$/.test(line)) {
      html.push("<hr>"); i += 1; continue;
    }

    if (line.startsWith(">")) {
      const quote = [];
      while (i < lines.length && (lines[i].startsWith(">") || !lines[i].trim())) {
        if (lines[i].startsWith(">")) quote.push(lines[i].replace(/^>\s?/, ""));
        else quote.push("");
        i += 1;
      }
      html.push(`<blockquote>${quote.map((part) => part ? `<p>${inlineMarkdown(part)}</p>` : "").join("")}</blockquote>`);
      continue;
    }

    if (i + 1 < lines.length && line.includes("|") && isTableDivider(lines[i + 1])) {
      const headers = splitTableRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim()) rows.push(splitTableRow(lines[i++]));
      html.push(`<table><thead><tr>${headers.map((cell) => `<th>${inlineMarkdown(cell)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table>`);
      continue;
    }

    const unordered = line.match(/^\s*[-*+]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      const tag = unordered ? "ul" : "ol";
      const items = [];
      while (i < lines.length) {
        const match = tag === "ul" ? lines[i].match(/^\s*[-*+]\s+(.+)$/) : lines[i].match(/^\s*\d+[.)]\s+(.+)$/);
        if (!match) break;
        items.push(`<li>${inlineMarkdown(match[1])}</li>`);
        i += 1;
      }
      html.push(`<${tag}>${items.join("")}</${tag}>`);
      continue;
    }

    const paragraph = [line.trim()];
    i += 1;
    while (i < lines.length && lines[i].trim() && !/^(#{1,6})\s+/.test(lines[i]) && !lines[i].startsWith(">") && !/^```/.test(lines[i]) && !/^\s*[-*+]\s+/.test(lines[i]) && !/^\s*\d+[.)]\s+/.test(lines[i]) && !(i + 1 < lines.length && lines[i].includes("|") && isTableDivider(lines[i + 1]))) {
      paragraph.push(lines[i].trim());
      i += 1;
    }
    html.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
  }
  return html.join("\n");
}

function extractOriginalText(markdown) {
  const match = String(markdown).match(/^##\s+一、原文\s*$([\s\S]*?)(?=^##\s+)/m);
  if (!match) return "";
  return match[1]
    .split("\n")
    .map((line) => line.replace(/^>\s?/, "").trim())
    .filter(Boolean)
    .join("\n");
}

function markdownToPlainText(markdown) {
  return String(markdown)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+[.)]\s+/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`|]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function chunkSpeech(text, maxLength = 120) {
  const sentences = String(text).split(/(?<=[。！？；：.!?;])\s*/).filter(Boolean);
  const chunks = [];
  let current = "";
  for (const sentence of sentences) {
    if ((current + sentence).length <= maxLength) current += sentence;
    else {
      if (current) chunks.push(current);
      if (sentence.length <= maxLength) current = sentence;
      else {
        for (let i = 0; i < sentence.length; i += maxLength) chunks.push(sentence.slice(i, i + maxLength));
        current = "";
      }
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

function populateVoices() {
  if (!("speechSynthesis" in window)) {
    elements.speakButton.disabled = true;
    setStatus(elements.speechStatus, "当前浏览器不支持语音朗读。", "error");
    return;
  }
  const voices = speechSynthesis.getVoices();
  const chinese = voices.filter((voice) => /^zh/i.test(voice.lang));
  const selected = chinese.length ? chinese : voices;
  elements.voiceSelect.replaceChildren(...selected.map((voice) => {
    const option = document.createElement("option");
    option.value = voice.name;
    option.textContent = `${voice.name} (${voice.lang})`;
    return option;
  }));
}

function speakNext() {
  if (!state.speaking || state.speechIndex >= state.speechChunks.length) {
    state.speaking = false;
    state.paused = false;
    setStatus(elements.speechStatus, "朗读完成。", "success");
    return;
  }
  const utterance = new SpeechSynthesisUtterance(state.speechChunks[state.speechIndex]);
  const selectedVoice = speechSynthesis.getVoices().find((voice) => voice.name === elements.voiceSelect.value);
  if (selectedVoice) utterance.voice = selectedVoice;
  utterance.lang = selectedVoice?.lang || "zh-CN";
  utterance.rate = Number(elements.rateSelect.value) || 1;
  utterance.onend = () => { state.speechIndex += 1; speakNext(); };
  utterance.onerror = (event) => {
    if (event.error === "canceled" || event.error === "interrupted") return;
    state.speaking = false;
    setStatus(elements.speechStatus, `朗读失败：${event.error}`, "error");
  };
  speechSynthesis.speak(utterance);
  setStatus(elements.speechStatus, `正在朗读 ${state.speechIndex + 1}/${state.speechChunks.length}`);
}

function startSpeech() {
  if (!("speechSynthesis" in window) || !state.markdown) return;
  stopSpeech();
  const text = elements.audioScope.value === "original" ? extractOriginalText(state.markdown) : markdownToPlainText(state.markdown);
  if (!text) {
    setStatus(elements.speechStatus, "本章没有找到可朗读的原文区块。", "error");
    return;
  }
  state.speechChunks = chunkSpeech(text);
  state.speechIndex = 0;
  state.speaking = true;
  state.paused = false;
  speakNext();
}

function togglePause() {
  if (!state.speaking) return;
  if (speechSynthesis.paused) {
    speechSynthesis.resume();
    state.paused = false;
    elements.pauseButton.textContent = "暂停";
  } else {
    speechSynthesis.pause();
    state.paused = true;
    elements.pauseButton.textContent = "继续";
  }
}

function stopSpeech() {
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  state.speechChunks = [];
  state.speechIndex = 0;
  state.speaking = false;
  state.paused = false;
  elements.pauseButton.textContent = "暂停";
  setStatus(elements.speechStatus, "");
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("dao-reader-theme", theme);
}

function bindEvents() {
  elements.authForm.addEventListener("submit", handleLogin);
  elements.toggleToken.addEventListener("click", () => {
    const visible = elements.tokenInput.type === "text";
    elements.tokenInput.type = visible ? "password" : "text";
    elements.toggleToken.textContent = visible ? "显示" : "隐藏";
  });
  elements.lockButton.addEventListener("click", () => lockReader("阅读室已锁定，令牌已从页面清除。"));
  elements.themeButton.addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
  elements.chapterSearch.addEventListener("input", () => renderChapterList(elements.chapterSearch.value));
  elements.prevButton.addEventListener("click", () => loadChapter(state.activeIndex - 1));
  elements.nextButton.addEventListener("click", () => loadChapter(state.activeIndex + 1));
  elements.sidebarButton.addEventListener("click", () => elements.sidebar.classList.toggle("open"));
  elements.fontSize.addEventListener("input", () => document.documentElement.style.setProperty("--reader-font-size", `${elements.fontSize.value}px`));
  elements.speakButton.addEventListener("click", startSpeech);
  elements.pauseButton.addEventListener("click", togglePause);
  elements.stopButton.addEventListener("click", stopSpeech);
  window.addEventListener("beforeunload", stopSpeech);
  if ("speechSynthesis" in window) speechSynthesis.onvoiceschanged = populateVoices;
}

async function bootstrap() {
  bindEvents();
  setTheme(localStorage.getItem("dao-reader-theme") === "dark" ? "dark" : "light");
  const remembered = sessionStorage.getItem("dao-reader-token");
  if (!remembered) return;
  elements.tokenInput.value = remembered;
  elements.rememberToken.checked = true;
  setStatus(elements.authStatus, "正在恢复当前标签页的登录状态…");
  try {
    await authenticate(remembered);
    unlockReader();
  } catch (_) {
    sessionStorage.removeItem("dao-reader-token");
    state.token = "";
    setStatus(elements.authStatus, "保存的登录状态已失效，请重新输入令牌。", "error");
  }
}

bootstrap();
