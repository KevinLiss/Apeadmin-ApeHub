/* ApeHub plugin detail page — fully config-driven.
 *
 * Layout copy, section visibility, tab labels and float actions are read from
 * the admin-editable `plugin_detail_config` JSON (see Config.vue). Any value
 * missing from the config falls back to a sane default so the page always
 * renders.
 */
const detailEsc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
const detailToken = () => localStorage.getItem('access_token') || '';
const detailIsImage = value => /^(?:https?:\/\/|\/|data:image\/)/i.test(String(value || '').trim());
const detailI18n = () => window.apeI18n;
const detailT = key => { const api = detailI18n(); return api ? api.t(key) : key; };
const detailIsEn = () => detailI18n()?.lang === 'en';
const detailPrice = value => `${detailIsEn() ? 'CN¥' : '¥'}${Number(value || 0).toLocaleString(detailIsEn() ? 'en-US' : 'zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const detailDate = value => value ? new Date(value).toLocaleDateString(detailIsEn() ? 'en-US' : 'zh-CN') : '-';

let currentPlugin = null;
let pageConfig = {};            // raw plugin_detail_config from /site/public/config
const setEnabled = (el, enabled) => { if (el) el.style.display = enabled ? '' : 'none'; };
const val = (obj, path, fallback) => {
  const parts = String(path).split('.');
  let cur = obj;
  for (const part of parts) {
    if (cur == null || typeof cur !== 'object') return fallback;
    cur = cur[part];
  }
  return cur == null ? fallback : cur;
};

async function detailApi(path, options = {}) {
  const headers = { 'Content-Type':'application/json', ...(options.headers || {}) };
  if (detailToken()) headers.Authorization = `Bearer ${detailToken()}`;
  const response = await fetch(`/api/v1${path}`, { ...options, headers });
  const payload = await response.json();
  if (!response.ok || payload.code !== 200) throw new Error(payload.msg || detailT('detail.error'));
  return payload.data;
}

function markdownView(markdown) {
  const text = detailEsc(markdown || detailT('detail.noDocs'));
  return text.split('\n').map(line => {
    if (line.startsWith('### ')) return `<h3>${line.slice(4)}</h3>`;
    if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`;
    if (line.startsWith('# ')) return `<h1>${line.slice(2)}</h1>`;
    if (line.startsWith('- ')) return `<li>${line.slice(2)}</li>`;
    if (!line.trim()) return '<br>';
    return `<p>${line}</p>`;
  }).join('');
}

/* ---------------- config-driven page assembly ---------------- */

function applyHeroConfig(plugin) {
  const hero = pageConfig.sections?.hero || {};
  setEnabled(document.querySelector('.hero'), hero.enabled !== false);
  setEnabled(document.querySelector('.breadcrumb'), hero.show_breadcrumb !== false);
  if (hero.show_star === false) setEnabled(document.getElementById('starTag'), false);
  // Only override when the admin configured custom text; in English mode the
  // backend text is Chinese, so prefer the i18n dictionary.
  else document.getElementById('starTag').textContent = detailIsEn()
    ? detailT('detail.star.tag')
    : (hero.star_tag_text || '⭐ 精选插件');
  document.getElementById('starTag').style.display = hero.show_star === false ? 'none' : '';
  const meta = document.querySelector('.hero-left .meta');
  if (meta) setEnabled(meta, hero.show_meta !== false);
  if (hero.show_meta === false) {
    const spans = meta?.querySelectorAll('span');
    spans?.forEach(span => { span.style.display = 'none'; });
  }
  setEnabled(document.querySelector('.hero-right'), hero.show_icon !== false);
  setEnabled(document.querySelector('.hero-actions'), hero.show_actions !== false);
}

function applySectionConfig() {
  const sections = pageConfig.sections || {};
  const panelMap = { intro: 'tab-intro', docs: 'tab-docs', changelog: 'tab-changelog' };
  for (const [key, panelId] of Object.entries(panelMap)) {
    const cfg = sections[key];
    const panel = document.getElementById(panelId);
    if (!panel) continue;
    const enabled = cfg ? cfg.enabled !== false : true;
    setEnabled(panel, enabled);
    // English mode: keep i18n template titles/descriptions (admin config is Chinese).
    if (detailIsEn()) continue;
    // Section titles / descriptions are configurable.
    if (cfg?.title) {
      const title = panel.querySelector('.sec-title');
      const em = cfg.title_em != null ? `<span class="em">${detailEsc(cfg.title_em)}</span>` : (title?.querySelector('.em')?.outerHTML || '');
      if (title) title.innerHTML = `${detailEsc(cfg.title.replace(cfg.title_em || '', ''))}${em}`;
    }
    if (cfg?.description) {
      const desc = panel.querySelector('.sec-desc');
      if (desc) desc.textContent = cfg.description;
    }
  }
}

function applyTabConfig() {
  const tabs = pageConfig.tabs || {};
  const bar = document.querySelector('.tabs-inner');
  if (!bar) return;
  const buttons = Array.from(bar.querySelectorAll('.tab-btn'));
  // Sort tabs by configured order.
  buttons.sort((a, b) => {
    const ta = tabs[a.dataset.tab]?.sort ?? 999;
    const tb = tabs[b.dataset.tab]?.sort ?? 999;
    return ta - tb;
  });
  buttons.forEach(btn => bar.appendChild(btn));
  // Toggle enabled / custom labels.
  buttons.forEach(btn => {
    const cfg = tabs[btn.dataset.tab];
    if (cfg) {
      btn.style.display = cfg.enabled === false ? 'none' : '';
      // English mode: keep i18n tab labels (admin labels are Chinese).
      if (!detailIsEn() && cfg.label) btn.innerHTML = detailEsc(cfg.label);
    }
  });
  // First visible tab becomes active.
  const visible = buttons.filter(btn => btn.style.display !== 'none');
  if (visible.length) {
    buttons.forEach(btn => btn.classList.remove('active'));
    visible[0].classList.add('active');
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.toggle('active', panel.id === `tab-${visible[0].dataset.tab}`));
  }
}

function applyButtonConfig(plugin) {
  const buttons = pageConfig.buttons || {};
  const demoCfg = buttons.demo || {};
  const buyCfg = buttons.buy || {};
  const demoBtn = document.getElementById('demoBtn');
  const buyBtn = document.getElementById('buyBtn');
  if (demoBtn) {
    // 显隐统一由 renderDemos 依据「是否配置了 Demo 数据」决定；这里只在配置明确关闭时隐藏
    if (demoCfg.enabled === false) {
      setEnabled(demoBtn.closest('div[style*="position"]') || demoBtn, false);
    }
    if (demoCfg.label) demoBtn.innerHTML = detailEsc(demoCfg.label) + (demoCfg.dropdown !== false ? ' ▾' : '');
    if (demoCfg.style) demoBtn.className = `btn btn-${demoCfg.style} btn-lg`;
  }
  if (buyBtn) {
    setEnabled(buyBtn, buyCfg.enabled !== false);
    const isFree = Number(plugin.price) <= 0;
    if (buyCfg.enabled !== false) {
      // 支持 {price} 占位符。替换为纯数字（模板自带货币符号时避免出现 ¥¥ 双符号），
      // 并兼容旧模板：清理残留 USDT 字样、去重货币符号、缺失时自动补 ¥
      const formatLabel = (template, fallback) => {
        let text = String(template || fallback);
        text = text.replace(/\s*USDT/gi, '');               // 旧模板残留单位清理
        text = text.replace(/\{price\}/g, Number(plugin.price || 0).toFixed(2));
        text = text.replace(/[¥￥]{2,}/g, '¥');              // 双符号去重
        if (!/[¥￥]/.test(text) && Number(plugin.price) > 0 && /\d/.test(text)) {
          text = text.replace(/(\d[\d,.]*)/, '¥$1');        // 缺失货币符号时补 ¥
        }
        return text;
      };
      const label = isFree
        ? formatLabel(detailIsEn() ? detailT('detail.free') : buyCfg.label_free, detailT('detail.free'))
        : formatLabel(detailIsEn() ? detailT('detail.buy.btn') : buyCfg.label_paid, `购买 {price}`);
      buyBtn.textContent = label;
      if (buyCfg.style) buyBtn.className = `btn btn-${buyCfg.style} btn-lg`;
    }
  }
}

function applyFloatActions() {
  const actions = pageConfig.float_actions || {};
  const buttons = document.querySelectorAll('.float-actions .float-btn');
  const keyLabels = { contact: 'detail.float.contact', docs: 'detail.float.docs', top: 'detail.float.top' };
  buttons.forEach(btn => {
    const key = btn.dataset.key || btn.title;
    const keyMap = { '客服咨询': 'contact', '帮助文档': 'docs', '返回顶部': 'top' };
    const cfgKey = keyMap[key] || key;
    const cfg = actions[cfgKey];
    if (cfg) {
      setEnabled(btn, cfg.enabled !== false);
      if (cfg.icon) btn.textContent = cfg.icon;
      // English mode: use i18n labels, skip Chinese admin titles.
      if (detailIsEn()) {
        if (keyLabels[cfgKey]) btn.title = detailT(keyLabels[cfgKey]);
      } else if (cfg.title) {
        btn.title = cfg.title;
      }
    }
  });
}

/* ---------------- data rendering ---------------- */

async function loadDetail() {
  const id = Number(new URLSearchParams(location.search).get('id'));
  if (!id) { location.replace('/apehub-web/plugins.html'); return; }
  try {
    const [plugin, cfg] = await Promise.all([
      detailApi(`/apehub-web/site/public/plugins/${id}`),
      detailApi('/apehub-web/site/public/config'),
    ]);
    pageConfig = cfg.plugin_detail_config || {};
    currentPlugin = plugin;
    renderDetail(plugin);
  } catch (error) {
    document.querySelector('.hero-inner').innerHTML = `<div style="padding:60px 0"><h1>${detailEsc(detailT('detail.loadFail'))}</h1><p>${detailEsc(error.message)}</p><a class="btn btn-primary" href="/apehub-web/plugins.html">${detailEsc(detailT('detail.backMarket'))}</a></div>`;
  }
}

function renderDetail(plugin) {
  const versions = plugin.versions || [];
  const latest = versions[0] || {};
  const ai = latest.analysis_report?.ai || {};
  const dispName = detailI18n()?.translatePluginField?.(plugin, 'display_name', plugin.display_name) || plugin.display_name;
  document.title = `ApeHub · ${dispName}`;
  const labels = pageConfig.labels || {};
  document.getElementById('pluginName').textContent = dispName;
  const tagsText = detailI18n()?.translatePluginField?.(plugin, 'tags', plugin.tags) || plugin.tags || '';
  document.getElementById('pluginSub').textContent = `${detailI18n()?.translateCategory?.(plugin.category) || plugin.category || detailT('detail.category')} · ${String(tagsText).replaceAll(',', ' · ')}`;
  document.getElementById('pluginDesc').textContent = detailI18n()?.translatePluginField?.(plugin, 'description', plugin.description) || plugin.description || detailT('detail.noDesc');
  document.getElementById('pluginVer').textContent = `v${plugin.version}`;
  const authorEl = document.getElementById('pluginAuthor');
  if (authorEl) authorEl.textContent = `${detailIsEn() ? detailT('detail.author') : (labels.author ? labels.author + ' ' : '')}#${plugin.developer_id}`;
  document.getElementById('pluginDl').textContent = Number(plugin.download_count || 0).toLocaleString();
  document.getElementById('pluginRate').textContent = Number(plugin.rating_avg || 5).toFixed(1);
  document.getElementById('crumbName').textContent = dispName;
  document.getElementById('heroIcon').innerHTML = detailIsImage(plugin.icon)
    ? `<img src="${detailEsc(plugin.icon)}" alt="${detailEsc(dispName)}" style="width:100%;height:100%;object-fit:cover;border-radius:24px">`
    : detailEsc(plugin.icon || (detailIsEn() ? 'Pl' : '插'));

  const features = Array.isArray(ai.features) ? ai.features : [];
  document.getElementById('featGrid').innerHTML = features.length ? features.map((feature, index) => {
    const name = detailEsc(typeof feature === 'string' ? feature : feature.name || feature.title || '');
    const desc = detailEsc(typeof feature === 'string' ? '' : feature.description || '');
    return `<div class="feat-card"><h4>${index + 1}. ${name}</h4>${desc ? `<p>${desc}</p>` : ''}</div>`;
  }).join('') : `<div class="feat-card" style="grid-column:1/-1"><h4>${detailEsc(detailT('detail.feat.fallback.title'))}</h4><p style="max-width:720px">${detailEsc(plugin.description || detailT('detail.noDesc'))}</p></div>`;

  const shots = (plugin.media || []).filter(item => item.media_type === 'carousel');
  const shotRoot = document.querySelector('.shots');
  shotRoot.innerHTML = shots.length ? shots.map(item => `<figure class="shot"><div class="shot-window"><div class="shot-bar"><span class="dot dot-r"></span><span class="dot dot-y"></span><span class="dot dot-g"></span></div><img src="${detailEsc(item.url)}" alt="${detailEsc(item.alt_text)}"></div><figcaption class="cap">${detailEsc(item.alt_text || plugin.display_name)}</figcaption></figure>`).join('') : '<div class="empty" style="color:var(--text-3);grid-column:1/-1;text-align:center;padding:40px 0">' + detailEsc(detailT('detail.noShots')) + '</div>';

  const isFree = Number(plugin.price) <= 0;
  const riskMap = { none: detailT('detail.risk.none'), low: detailT('detail.risk.low'), medium: detailT('detail.risk.medium'), high: detailT('detail.risk.high'), critical: detailT('detail.risk.critical') };
  document.querySelector('.tbl-wrap tbody').innerHTML = `<tr><td>${detailEsc(detailT('detail.table.version'))}</td><td>v${detailEsc(plugin.version)}</td></tr><tr><td>${detailEsc(detailT('detail.table.compat'))}</td><td>${detailEsc(latest.compatibility || 'ApeAdmin / FastAPI')}</td></tr><tr><td>${detailEsc(detailT('detail.table.files'))}</td><td>${latest.analysis_report?.file_count || '-'}</td></tr><tr><td>${detailEsc(detailT('detail.table.risk'))}</td><td>${detailEsc(riskMap[latest.analysis_report?.risk_level] || detailT('detail.risk.none.marked'))}</td></tr><tr><td>${detailEsc(detailT('detail.table.license'))}</td><td>${isFree ? detailEsc(detailT('detail.table.free')) : detailEsc(detailT('detail.table.paid'))}</td></tr>`;
  document.getElementById('tab-docs').innerHTML = `<h2 class="sec-title">${detailT('detail.docs.title')}</h2><div style="max-width:920px;white-space:normal" class="doc-markdown">${markdownView(latest.documentation)}</div>`;
  document.querySelector('.changelog').innerHTML = versions.length ? versions.map(version => `<div class="log-item"><div><div class="ver">v${detailEsc(version.version)}</div><div class="date">${detailDate(version.published_at)}</div></div><div><p>${detailEsc(version.changelog || detailT('detail.changelog.none'))}</p></div></div>`).join('') : '<p>' + detailEsc(detailT('detail.changelog.empty')) + '</p>';

  renderDemos(plugin.demos || []);
  renderBuy(plugin, latest);
  applyHeroConfig(plugin);
  applySectionConfig();
  applyTabConfig();
  applyButtonConfig(plugin);
  applyFloatActions();
  applyLabelConfig();
}

function renderDemos(demos) {
  const dropdown = document.getElementById('demoDropdown');
  if (!dropdown) return;
  dropdown.innerHTML = demos.length ? demos.map(item => `<a href="${detailEsc(item.url || '#')}" target="${item.url ? '_blank' : '_self'}" rel="noopener">${detailEsc(item.title || item.demo_type)}</a>`).join('') : '<a href="#">' + detailEsc(detailT('detail.demo.none')) + '</a>';
  // 无 Demo 数据时直接隐藏「立即体验」按钮及其外层定位容器，只保留下载/购买按钮
  const demoBtn = document.getElementById('demoBtn');
  if (demoBtn) {
    const wrapper = demoBtn.closest('div[style*="position"]') || demoBtn;
    setEnabled(wrapper, demos.length > 0 && (pageConfig.buttons?.demo?.enabled !== false));
  }
}

function renderBuy(plugin, latest) {
  const button = document.getElementById('buyBtn');
  const isPaid = Number(plugin.price) > 0;
  button.textContent = isPaid ? `${detailT('detail.buy.prefix')}${detailPrice(plugin.price)}` : detailT('detail.free');
  const buyCfg = pageConfig.buttons?.buy || {};
  const subText = buyCfg.subtitle || detailT('detail.table.paid');
  const features = buyCfg.features || [detailT('detail.buy.feature1'), detailT('detail.buy.feature2'), detailT('detail.buy.feature3')];
  const ctaText = isPaid ? (buyCfg.cta_paid || detailT('detail.buy.cta.paid')) : (buyCfg.cta_free || detailT('detail.buy.cta.free'));
  const modal = document.querySelector('#buyModal .modal');
  modal.innerHTML = `<button class="close-btn" id="buyClose">×</button><h3>${detailEsc(plugin.display_name)}</h3><p class="m-sub">${detailEsc(subText)}</p><div class="price-grid" style="grid-template-columns:1fr"><div class="price-card popular"><div class="p-name">${detailEsc(detailT('detail.buy.full.title'))}</div><div class="p-price">${isPaid ? detailPrice(plugin.price) : '0.00'}<span class="unit">${detailEsc(detailT('detail.buy.unit'))}</span></div><ul class="p-features">${features.map(f => `<li>${detailEsc(f)}</li>`).join('')}</ul>${isPaid ? '<div class="pay-hint">' + detailEsc(detailT('detail.buy.payhint')) + '</div>' : ''}<button class="p-btn pro" id="confirmBuy">${detailEsc(ctaText)}</button></div></div>`;
  document.getElementById('buyClose').addEventListener('click', () => document.getElementById('buyModal').classList.remove('show'));
  document.getElementById('confirmBuy').addEventListener('click', () => purchase(plugin, latest));
}

function applyLabelConfig() {
  // Backend labels are admin-managed Chinese copy: in English mode fall back to
  // the i18n dictionary instead of injecting raw Chinese text.
  const labels = detailIsEn() ? {} : (pageConfig.labels || {});
  const meta = document.querySelector('.hero-left .meta');
  if (!meta) return;
  // Locate rows by id ancestry, NOT by NodeList index: querySelectorAll('span')
  // walks descendants and would mix nested spans into the index, overwriting
  // the author row when rewriting the download row (pluginAuthor vanished).
  const rowOf = (id) => document.getElementById(id)?.closest('.meta > span');
  const dlRow = rowOf('pluginDl');
  if (dlRow) {
    dlRow.innerHTML = `⬇ <span id="pluginDl">${Number(currentPlugin?.download_count || 0).toLocaleString()}</span> ${detailEsc(labels.content || detailT('detail.dl'))}`;
  }
  const rateRow = rowOf('pluginRate');
  if ((labels.rating || detailIsEn()) && rateRow) {
    rateRow.innerHTML = `★ <span id="pluginRate">${Number(currentPlugin?.rating_avg || 5).toFixed(1)}</span>`;
  }
  if (labels.author && document.getElementById('pluginAuthor')) {
    document.getElementById('pluginAuthor').textContent = `${labels.author} #${currentPlugin?.developer_id}`;
  }
  if (labels.version && document.getElementById('pluginVer')) {
    document.getElementById('pluginVer').textContent = `v${currentPlugin?.version}`;
  }
}

async function purchase(plugin, latest) {
  if (!detailToken()) { alert(detailT('detail.login.first')); location.href = '/apehub-web/index.html'; return; }
  try {
    if (Number(plugin.price) <= 0) {
      const file = (latest.files || []).find(item => item.file_type === 'package');
      if (!file) throw new Error(detailT('detail.noFile'));
      const response = await fetch(`/api/v1/apehub-web/files/${file.id}/download`, { headers: { Authorization:`Bearer ${detailToken()}` } });
      if (!response.ok) throw new Error(detailT('detail.dlFail'));
      const url = URL.createObjectURL(await response.blob()); const link = document.createElement('a'); link.href = url; link.download = file.filename; link.click(); URL.revokeObjectURL(url);
    } else {
      // 支付渠道由 LemPay 收银台自选（收银台只展示可用渠道），下单时不指定
      const order = await detailApi('/apehub-web/orders/create', { method:'POST', body:JSON.stringify({ plugin_id:plugin.id }) });
      location.assign(order.pay_url);
    }
  } catch (error) { alert(error.message); }
}

// Tab switching
document.querySelectorAll('.tab-btn').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.tab-btn').forEach(item => item.classList.toggle('active', item === button));
  document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.toggle('active', panel.id === `tab-${button.dataset.tab}`));
}));
const buyModal = document.getElementById('buyModal');
document.getElementById('buyBtn').addEventListener('click', () => buyModal.classList.add('show'));
buyModal.addEventListener('click', event => { if (event.target === buyModal) buyModal.classList.remove('show'); });
const demoButton = document.getElementById('demoBtn'), demoDropdown = document.getElementById('demoDropdown');
demoButton.addEventListener('click', event => { event.stopPropagation(); demoDropdown.classList.toggle('show'); });
document.addEventListener('click', () => demoDropdown.classList.remove('show'));
document.addEventListener('keydown', event => { if (event.key === 'Escape') buyModal.classList.remove('show'); });

// Language switch: re-render plugin data (names/descriptions/tags are mapped by i18n.js)
window.addEventListener('apeI18n.switch', () => {
  if (currentPlugin) renderDetail(currentPlugin);
});
loadDetail();