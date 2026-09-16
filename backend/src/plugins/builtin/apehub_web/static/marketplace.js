const marketState = { category: 'all', keyword: '', language: 'all', page: 1, pageSize: 18, total: 0, items: [] };
const marketEsc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
const marketIsImage = value => /^(?:https?:\/\/|\/|data:image\/)/i.test(String(value || '').trim());
const marketPrice = value => `¥${Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const marketLang = value => value === 'go' ? 'Go' : 'Python';

async function loadCategories() {
  const container = document.getElementById('categories');
  try {
    const response = await fetch('/api/v1/apehub-web/site/public/plugins/categories');
    const payload = await response.json();
    if (!response.ok || payload.code !== 200 || !Array.isArray(payload.data) || !payload.data.length) throw new Error('no data');
    container.innerHTML = [
      '<span class="cat-pill active" data-cat="all">全部</span>',
      ...payload.data.map(cat => `<span class="cat-pill" data-cat="${marketEsc(cat.name)}">${marketEsc(cat.name)}</span>`),
    ].join('');
  } catch {
    // 后端不可用或无分类数据时保持页面内置的默认分类
    return;
  }
  bindCategoryPills();
}

function bindCategoryPills() {
  document.querySelectorAll('.cat-pill').forEach(pill => pill.addEventListener('click', () => {
    document.querySelectorAll('.cat-pill').forEach(item => item.classList.toggle('active', item === pill));
    marketState.category = pill.dataset.cat;
    loadMarket().catch(showMarketError);
  }));
}

function bindFwFilter() {
  document.querySelectorAll('.fw-pill').forEach(pill => pill.addEventListener('click', () => {
    document.querySelectorAll('.fw-pill').forEach(item => item.classList.toggle('active', item === pill));
    marketState.language = pill.dataset.fw;
    loadMarket().catch(showMarketError);
  }));
}

async function loadMarket(reset = true) {
  if (reset) marketState.page = 1;
  const params = new URLSearchParams({ page: String(marketState.page), page_size: String(marketState.pageSize) });
  if (marketState.keyword) params.set('keyword', marketState.keyword);
  if (marketState.category !== 'all') params.set('category', marketState.category);
  if (marketState.language !== 'all') params.set('language', marketState.language);
  const response = await fetch(`/api/v1/apehub-web/site/public/plugins?${params}`);
  const payload = await response.json();
  if (!response.ok || payload.code !== 200) throw new Error(payload.msg || '插件市场加载失败');
  marketState.items = reset ? payload.data.items : marketState.items.concat(payload.data.items || []);
  marketState.total = payload.data.total || 0;
  renderMarket();
}

function renderMarket() {
  const grid = document.getElementById('pluginsGrid');
  const items = marketState.items;
  if (!items.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;padding:80px 20px;text-align:center"><div style="font-size:48px;opacity:.3;margin-bottom:16px">📦</div><p style="color:var(--text-2);font-size:15px;margin-bottom:8px">暂无符合条件的插件</p><p style="color:var(--text-3);font-size:13px">试试切换其他分类或调整搜索关键词</p></div>';
  } else {
    grid.innerHTML = items.map(item => {
      const tags = String(item.tags || '').split(',').map(tag => tag.trim()).filter(Boolean).slice(0, 4);
      const icon = marketIsImage(item.icon)
        ? `<img src="${marketEsc(item.icon)}" alt="${marketEsc(item.display_name)}" style="width:100%;height:100%;object-fit:cover;border-radius:12px">`
        : marketEsc(item.icon || '插');
      return `<article class="plugin-card" data-id="${item.id}">
        <div class="p-head"><div class="p-icon" style="background:rgba(52,211,153,.12)">${icon}</div><div><div class="p-name">${marketEsc(item.display_name)}<span class="lang-badge">${marketLang(item.language)}</span></div><div class="p-ver">v${marketEsc(item.version)}</div></div></div>
        <div class="p-desc">${marketEsc(item.description || '暂无介绍')}</div>
        <div class="p-tags">${tags.map(tag => `<span class="p-tag">${marketEsc(tag)}</span>`).join('')}</div>
        <div class="p-meta"><div class="p-stats"><span>安装 ${Number(item.install_count || 0).toLocaleString()}</span><span>下载 ${Number(item.download_count || 0).toLocaleString()}</span></div><div class="p-actions"><button class="install-btn">${Number(item.price) > 0 ? `${marketPrice(item.price)}` : '免费'}</button></div></div>
      </article>`;
    }).join('');
    grid.querySelectorAll('[data-id]').forEach(card => card.addEventListener('click', () => location.href = `/apehub-web/plugin-detail.html?id=${card.dataset.id}`));
  }
  document.getElementById('loadMore').style.display = marketState.items.length < marketState.total ? 'inline-flex' : 'none';
}

document.getElementById('searchInput').addEventListener('input', event => marketState.keyword = event.target.value.trim());
document.getElementById('searchInput').addEventListener('keydown', event => { if (event.key === 'Enter') loadMarket().catch(showMarketError); });
document.getElementById('searchBtn').addEventListener('click', () => loadMarket().catch(showMarketError));
document.getElementById('loadMore').addEventListener('click', () => { marketState.page += 1; loadMarket(false).catch(showMarketError); });
function showMarketError(error) { document.getElementById('pluginsGrid').innerHTML = `<div style="grid-column:1/-1;padding:60px 20px;text-align:center;color:var(--red)">${marketEsc(error.message)}</div>`; }

document.getElementById('menuToggle')?.addEventListener('click', () => document.querySelector('.nav-links')?.classList.toggle('open'));
bindCategoryPills();
bindFwFilter();
loadCategories();
loadMarket().catch(showMarketError);