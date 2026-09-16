/* Public-site runtime: shared navigation, theme sync, session state, and mobile menu. */
(() => {
  /* ---------- Theme ---------- */
  const root = document.documentElement;
  // Server-controlled default theme: read from backend config (theme_mode).
  // Local user preference (ape-theme) overrides it once set. Default to 'light'.
  const savedTheme = localStorage.getItem('ape-theme') || 'light';
  root.setAttribute('data-theme', savedTheme);

  // Fetch public config to apply site-level theme_mode when no local override exists.
  (async () => {
    try {
      const response = await fetch('/api/v1/apehub-web/site/public/config');
      const payload = await response.json();
      const serverTheme = payload?.data?.theme_mode;
      if (serverTheme && !localStorage.getItem('ape-theme')) {
        root.setAttribute('data-theme', serverTheme === 'dark' ? 'dark' : 'light');
        updateToggleIcons();
      }
    } catch { /* keep current theme on network failure */ }
  })();

  function updateToggleIcons() {
    const theme = root.getAttribute('data-theme') || 'dark';
    document.querySelectorAll('#themeToggle').forEach(btn => {
      if (btn) btn.textContent = theme === 'dark' ? '🌙' : '☀️';
    });
  }

  function toggleTheme() {
    const current = root.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('ape-theme', next);
    updateToggleIcons();
    // Sync with VitePress if present
    try {
      const vpKey = 'vitepress-theme-appearance';
      if (next === 'dark') {
        root.classList.remove('light');
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
      localStorage.setItem(vpKey, next);
    } catch {}
  }

  // Apply theme immediately (before async init to prevent flash)
  updateToggleIcons();
  // Bind theme toggle buttons (after DOM is ready)
  document.addEventListener('DOMContentLoaded', () => {
    updateToggleIcons();
    document.querySelectorAll('#themeToggle').forEach(btn => {
      btn.addEventListener('click', toggleTheme);
    });

    /* ---------- Mobile menu ---------- */
    document.querySelectorAll('#menuToggle').forEach(toggle => {
      toggle.addEventListener('click', () => {
        const links = toggle.closest('nav')?.querySelector('.nav-links');
        if (!links) return;
        const visible = links.style.display === 'flex';
        links.style.display = visible ? 'none' : 'flex';
        links.style.flexDirection = visible ? '' : 'column';
        links.style.position = visible ? '' : 'absolute';
        links.style.top = visible ? '' : '68px';
        links.style.left = visible ? '' : '0';
        links.style.right = visible ? '' : '0';
        links.style.background = visible ? '' : 'var(--bg-soft, #0c0e1a)';
        links.style.padding = visible ? '' : '20px 24px';
        links.style.borderBottom = visible ? '' : '1px solid var(--panel-border, rgba(255,255,255,.08))';
        links.style.gap = visible ? '' : '18px';
        links.style.alignItems = visible ? '' : 'flex-start';
        links.style.zIndex = visible ? '' : '99';
      });
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) {
        document.querySelectorAll('nav .nav-links').forEach(links => {
          links.style.display = 'flex';
          links.style.flexDirection = '';
          links.style.position = '';
          links.style.top = '';
          links.style.left = '';
          links.style.right = '';
          links.style.background = '';
          links.style.padding = '';
          links.style.borderBottom = '';
          links.style.gap = '';
          links.style.alignItems = '';
          links.style.zIndex = '';
        });
      }
    });

    /* ---------- GitHub dropdown ---------- */
    document.querySelectorAll('[data-gh-dropdown]').forEach(dd => {
      const trigger = dd.querySelector('.gh-trigger');
      if (!trigger) return;
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = dd.classList.contains('open');
        document.querySelectorAll('[data-gh-dropdown]').forEach(other => {
          if (other !== dd) other.classList.remove('open');
        });
        dd.classList.toggle('open', !isOpen);
        trigger.setAttribute('aria-expanded', !isOpen);
      });
    });
    document.addEventListener('click', (e) => {
      document.querySelectorAll('[data-gh-dropdown]').forEach(dd => {
        if (!dd.contains(e.target)) {
          dd.classList.remove('open');
          const trigger = dd.querySelector('.gh-trigger');
          if (trigger) trigger.setAttribute('aria-expanded', 'false');
        }
      });
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('[data-gh-dropdown]').forEach(dd => {
          dd.classList.remove('open');
          const trigger = dd.querySelector('.gh-trigger');
          if (trigger) trigger.setAttribute('aria-expanded', 'false');
        });
      }
    });
  });

  /* ---------- Auth & Navigation ---------- */
  const api = '/api/v1/apehub-web/site/public';
  const get = async (path) => {
    const response = await fetch(`${api}${path}`);
    const payload = await response.json();
    if (!response.ok || payload.code !== 200) throw new Error(payload.msg || 'request failed');
    return payload.data;
  };
  const createNavLink = (item) => {
    const link = document.createElement('a');
    link.href = item.link;
    link.textContent = item.title;
    if (item.open_mode === 'new') { link.target = '_blank'; link.rel = 'noopener'; }
    if (item.icon_url) {
      const icon = document.createElement('img');
      icon.src = item.icon_url; icon.alt = '';
      icon.style.cssText = 'width:16px;height:16px;object-fit:contain;vertical-align:-3px;margin-right:5px';
      link.prepend(icon);
    }
    const target = new URL(link.href, window.location.origin);
    const currentPath = window.location.pathname.replace(/\/$/, '');
    const linkPath = target.pathname.replace(/\/$/, '');
    if (linkPath === currentPath) link.classList.add('active');
    return link;
  };
  const hasValidSession = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return false;
    try {
      const response = await fetch('/api/v1/auth/userinfo', { headers: { Authorization: `Bearer ${token}` } });
      const payload = await response.json();
      if (!response.ok || payload.code !== 200) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return false;
      }
      return true;
    } catch {
      return false;
    }
  };
  const style = document.createElement('style');
  style.textContent = '[hidden]{display:none!important}';
  document.head.prepend(style);
  const isProfileItem = item => /个人中心/.test(item.title || '') || /\/profile\.html(?:$|[?#])/.test(item.link || '');
  (async () => {
    try {
      const [config, navigation, content, authenticated] = await Promise.all([get('/config'), get('/navigation'), get('/content'), hasValidSession()]);
      if (/\/(?:apehub-web\/)?(?:index\.html)?$/.test(window.location.pathname)) {
        document.title = config.seo_title || config.site_name || document.title;
      }
      document.querySelectorAll('link[rel="icon"]').forEach((icon) => { icon.href = config.site_icon || config.site_logo; });
      document.querySelectorAll('.brand img, .modal-logo img').forEach((image) => { image.src = config.site_logo || image.src; });
      document.querySelectorAll('.nav-links').forEach((container) => {
        const visibleNavigation = authenticated ? navigation : navigation.filter(item => !isProfileItem(item));
        container.replaceChildren(...visibleNavigation.map(createNavLink));
      });
      // Show/hide profile and login buttons consistently across all pages
      document.querySelectorAll('[data-profile-nav]').forEach(link => { link.hidden = !authenticated; link.style.display = authenticated ? '' : 'none'; });
      document.querySelectorAll('.account-link, #navProfileBtn').forEach(link => { link.hidden = !authenticated; link.style.display = authenticated ? '' : 'none'; });
      document.querySelectorAll('#navLoginBtn').forEach(link => { link.hidden = authenticated; link.style.display = authenticated ? 'none' : ''; });
      const hero = content.hero && content.hero[0];
      if (hero?.image) document.querySelectorAll('img[src*="screenshot.png"]').forEach((image) => { image.src = hero.image; });
      /* ---------- Dynamic text rendering (content management) ---------- */
      applyBlockContent(content);
      /* ---------- Dynamic section order & visibility (drag layout) ---------- */
      applyContentLayout(content);
      /* ---------- Hero typing animation ---------- */
      playHeroTyping();
    } catch (error) {
      console.warn('Apehub_web public configuration unavailable', error);
    }
  })();

  /**
   * 将后台「内容管理」保存的文字（title / subtitle / body）渲染到对应区块 DOM。
   * - 字段为空或 null 时不覆盖原有 HTML，保留默认内容。
   * - 仅作用于带 [data-block-key] 的区块元素（首页）。
   */
  function applyBlockContent(content) {
    const selectors = {
      hero:       { title: 'h1',              subtitle: '.ver-tag',  body: '.sub' },
      features:   { title: '.sec-head h2',    subtitle: '.sec-tag',  body: '.sec-head p' },
      architecture:{ title: '.sec-head h2',   subtitle: '.sec-tag',  body: '.sec-head p' },
      mcp:        { title: '.sec-head h2',    subtitle: '.sec-tag',  body: '.sec-head p' },
      techstack:  { title: '.sec-head h2',    subtitle: '.sec-tag',  body: '.sec-head p' },
      plugin_eco: { title: '.sec-head h2',    subtitle: '.sec-tag',  body: '.sec-head p' },
      quickstart: { title: '.sec-head h2',    subtitle: '.sec-tag',  body: '.sec-head p' },
      cta:        { title: '.cta-band h2',   subtitle: null,         body: '.cta-band p' },
      footer:     { title: '.foot-brand .brand span', subtitle: null, body: '.foot-brand p' },
    };
    Object.entries(content || {}).forEach(([key, items]) => {
      const item = (items || []).find(i => i.enabled !== false) || (items || [])[0];
      if (!item) return;
      const section = document.querySelector(`[data-block-key="${key}"]`);
      if (!section) return;
      const sel = selectors[key];
      if (!sel) return;
      if (item.title && sel.title) {
        const el = section.querySelector(sel.title);
        if (!el) return;
        if (key === 'hero') {
          // hero 标题：逗号后换行，第二行整体加渐变色高亮
          const parts = item.title.split('，');
          if (parts.length >= 2) {
            el.innerHTML = parts[0] + '，<br><span class="grad">' + parts.slice(1).join('，') + '</span>';
          } else {
            el.textContent = item.title;
          }
        } else {
          el.textContent = item.title;
        }
      }
      if (item.subtitle && sel.subtitle) {
        const el = section.querySelector(sel.subtitle);
        if (el) el.textContent = item.subtitle;
      }
      if (item.body && sel.body) {
        const el = section.querySelector(sel.body);
        if (el) el.textContent = item.body;
      }
    });
  }

  /**
   * 根据后台「内容管理」配置动态重排首页区块顺序与显隐。
   * - key 存在配置且启用：按最小 sort 升序排列
   * - key 存在配置但全部禁用：隐藏区块
   * - key 从未配置：保持默认显示与原始 DOM 位置
   * 仅作用于带 [data-block-key] 的区块元素（首页）。
   */
  function applyContentLayout(content) {
    const blocks = Array.from(document.querySelectorAll('[data-block-key]'));
    if (!blocks.length) return;

    // 每个 block_key 的启用配置（按 sort 升序）
    const keyMeta = new Map();
    Object.entries(content || {}).forEach(([key, list]) => {
      const enabled = (list || []).filter(item => item.enabled !== false);
      enabled.sort((a, b) => (a.sort || 0) - (b.sort || 0));
      keyMeta.set(key, { sort: enabled.length ? (enabled[0].sort || 0) : null, count: enabled.length });
    });

    // 1) 显隐
    blocks.forEach(section => {
      const meta = keyMeta.get(section.getAttribute('data-block-key'));
      if (meta === undefined) {
        section.hidden = false;                 // 从未配置，默认显示
      } else {
        section.hidden = meta.count === 0;      // 有配置但全部禁用 → 隐藏
      }
    });

    // 2) 稳定重排：已配置且启用的区块按 sort 升序；未配置区块保持原始相对顺序；
    //    已配置区块整体排在未配置区块之前（语义：后台设置过顺序的优先）。
    const originalIndex = new Map();
    blocks.forEach((section, i) => originalIndex.set(section, i));
    const getOrder = section => {
      const meta = keyMeta.get(section.getAttribute('data-block-key'));
      return meta && meta.count ? meta.sort : null;
    };
    const sorted = blocks.slice().sort((a, b) => {
      const oa = getOrder(a), ob = getOrder(b);
      if (oa !== null && ob !== null) return oa - ob;
      if (oa !== null) return -1;
      if (ob !== null) return 1;
      return originalIndex.get(a) - originalIndex.get(b);
    });

    // 3) 重插：用 DocumentFragment 保持 sorted 顺序，一次性插入到原首个区块的位置
    const firstBlock = blocks[0];
    const anchor = firstBlock && firstBlock.previousElementSibling;
    if (firstBlock && anchor) {
      const frag = document.createDocumentFragment();
      sorted.forEach(section => frag.appendChild(section));
      anchor.after(frag);
    }
  }

  /* ---------- Admin preview bridge (content manager) ---------- */
  // 管理后台内容管理页通过 postMessage 与官网预览 iframe 通信：
  // - ape-highlight / ape-highlight-clear：hover 列表项时高亮对应区块
  // - ape-refresh：保存/排序/删除后重新拉取公开内容并重排布局
  const highlightStyle = document.createElement('style');
  highlightStyle.textContent = [
    '.ape-block-highlight {',
    '  outline: 3px dashed var(--accent, #4f46e5) !important;',
    '  outline-offset: 3px;',
    '  border-radius: 8px;',
    '  transition: outline-color .2s;',
    '}'
  ].join('\n');
  document.head.appendChild(highlightStyle);

  const clearHighlight = () => {
    document.querySelectorAll('.ape-block-highlight').forEach(s => s.classList.remove('ape-block-highlight'));
  };

  window.addEventListener('message', (event) => {
    const msg = event.data;
    if (!msg || typeof msg !== 'object' || msg.source !== 'apehub-admin') return;

    if (msg.type === 'ape-highlight' && msg.blockKey) {
      clearHighlight();
      const target = document.querySelector(`[data-block-key="${msg.blockKey}"]`);
      if (target) {
        target.classList.add('ape-block-highlight');
        // 若区块不在视口内，平滑滚动到其顶部（hover 定位）
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else if (msg.type === 'ape-highlight-clear') {
      clearHighlight();
    } else if (msg.type === 'ape-refresh') {
      (async () => {
        try {
          const response = await fetch('/api/v1/apehub-web/site/public/content');
          const payload = await response.json();
          if (payload.code === 200) { applyBlockContent(payload.data); applyContentLayout(payload.data); }
        } catch { /* keep current layout */ }
      })();
    }
  });

  /* ---------- Hero typing animation ---------- */
  /**
   * 首屏 Slogan 打字动画：
   * - 解析 h1 的两行文本，逐字打出
   * - 第一行普通色，第二行含 .grad 渐变高亮（打完纯文本后包裹渐变 span）
   * - 打完后光标闪烁消失，副标题/按钮/统计行依次淡入
   * - prefers-reduced-motion: 跳过动画直接显示
   */
  function playHeroTyping() {
    const h1 = document.querySelector('.hero h1');
    if (!h1 || h1.dataset.typed === 'done') return;
    h1.dataset.typed = 'done';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 提取两行文本 + grad 高亮区间
    const gradEl = h1.querySelector('.grad');
    const gradText = gradEl ? gradEl.textContent : '';
    // 用占位符替换 grad 元素，保留其在文本流中的位置
    if (gradEl) {
      gradEl.replaceWith(document.createTextNode('\u0001' + gradText + '\u0001'));
    }
    const hasBr = h1.innerHTML.includes('<br');

    // 按 <br> 拆成两行 raw HTML
    let raw1, raw2;
    if (hasBr) {
      const brIdx = h1.innerHTML.indexOf('<br');
      raw1 = h1.innerHTML.slice(0, brIdx);
      raw2 = h1.innerHTML.slice(brIdx).replace(/<br[^>]*>/, '');
    } else {
      raw1 = h1.innerHTML;
      raw2 = '';
    }

    function extractLine(html) {
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      return tmp.textContent;
    }

    let line1 = extractLine(raw1).trim();
    let line2Full = extractLine(raw2).trim();
    let line2Plain = line2Full;
    let gradStart = -1;

    if (gradText && line2Full.includes('\u0001')) {
      gradStart = line2Full.indexOf('\u0001');
      line2Plain = line2Full.replace(/\u0001/g, '');
    }

    function restore() {
      if (gradText && line2Plain && gradStart >= 0) {
        const before = line2Plain.slice(0, gradStart);
        const after = line2Plain.slice(gradStart + gradText.length);
        h1.innerHTML = line1 + '<br>' + before + '<span class="grad">' + gradText + '</span>' + after;
      } else if (line2Plain) {
        h1.innerHTML = line1 + '<br>' + line2Plain;
      } else {
        h1.textContent = line1;
      }
    }

    function reveal() {
      document.querySelector('.hero .sub')?.classList.add('show');
      setTimeout(() => document.querySelector('.hero .cta')?.classList.add('show'), 150);
      setTimeout(() => document.querySelector('.hero .stat-row')?.classList.add('show'), 300);
    }

    if (reduceMotion) { restore(); reveal(); return; }

    const speed = 65, cursorBlinks = 3, cursorDur = 280;

    h1.innerHTML = '';
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    h1.appendChild(cursor);

    function typeString(text, done) {
      let i = 0;
      (function step() {
        if (i < text.length) {
          cursor.insertAdjacentText('beforebegin', text[i]);
          i++;
          setTimeout(step, speed);
        } else { done(); }
      })();
    }

    function finish() {
      let blinks = 0;
      const t = setInterval(() => {
        blinks++;
        if (blinks >= cursorBlinks) {
          clearInterval(t);
          cursor.classList.add('hide');
          reveal();
        }
      }, cursorDur);
    }

    typeString(line1, () => {
      if (line2Plain) {
        cursor.insertAdjacentHTML('beforebegin', '<br>');
        typeString(line2Plain, () => {
          if (gradText && gradStart >= 0) {
            cursor.remove();
            h1.innerHTML = h1.innerHTML.replace(gradText, '<span class="grad">' + gradText + '</span>');
            h1.appendChild(cursor);
          }
          finish();
        });
      } else { finish(); }
    });
  }

  // 兜底：若 API fetch 失败（catch 分支），DOM 仍触发动画
  if (document.readyState !== 'loading') {
    setTimeout(() => playHeroTyping(), 600);
  } else {
    document.addEventListener('DOMContentLoaded', () => setTimeout(() => playHeroTyping(), 600));
  }
})();
