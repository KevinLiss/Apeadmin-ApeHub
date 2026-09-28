/* ApeAdmin 安装下载页：框架切换 + 版本列表渲染 + 下载 */
(() => {
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  const formatSize = size => {
    const n = Number(size || 0);
    return n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(2)} MB` : n > 0 ? `${Math.ceil(n / 1024)} KB` : '';
  };
  const formatDate = d => d ? d.replace('T', ' ').slice(0, 10) : '';
  const i18n = () => window.apeI18n;
  const t = key => { const api = i18n(); return api ? api.t(key) : key; };

  // 当前框架：python | go，默认 python
  let currentFramework = 'python';
  let loading = false;

  const FW_LABEL = { python: 'Python 版 (FastAPI)', go: 'Go 版 (Gin)' };

  function frameworkLabels(fw) {
    return fw === 'go' ? (t('download.go.badge') === 'download.go.badge' ? 'Go 版' : t('download.go.badge')) : (t('download.python.badge') === 'download.python.badge' ? 'Python 版' : t('download.python.badge'));
  }

  function setFramework(fw) {
    if (fw === currentFramework) return;
    currentFramework = fw;
    document.querySelectorAll('.fw-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.fw === fw);
    });
    // 切换安装说明
    const guidePython = document.getElementById('guidePython');
    const guideGo = document.getElementById('guideGo');
    if (guidePython) guidePython.hidden = fw !== 'python';
    if (guideGo) guideGo.hidden = fw !== 'go';
    const sub = document.getElementById('installGuideSub');
    if (sub) sub.textContent = t('download.guide.sub.fmt').replace('{fw}', fw === 'go' ? t('download.go') : t('download.python'));
    loadReleases();
  }

  async function loadReleases() {
    const listEl = document.getElementById('releasesList');
    const latestCard = document.getElementById('latestCard');
    if (loading) return;
    loading = true;
    listEl.innerHTML = `<div class="loading-tip">${esc(t('download.loading'))}</div>`;
    try {
      const response = await fetch(`/api/v1/apehub-web/site/public/releases?framework=${encodeURIComponent(currentFramework)}`);
      const payload = await response.json();
      if (!response.ok || payload.code !== 200) throw new Error(payload.msg || t('download.loading'));
      const items = payload.data.items || [];
      if (!items.length) {
        listEl.innerHTML = `<div class="loading-tip">${esc(t('download.empty'))}</div>`;
        if (latestCard) latestCard.hidden = true;
        return;
      }

      // 最新版本卡片：is_latest 优先，否则取第一个
      const latest = items.find(item => item.is_latest) || items[0];
      if (latestCard) {
        document.getElementById('latestVersion').textContent = `v${latest.version}`;
        document.getElementById('latestTitle').textContent = latest.title || `ApeAdmin ${latest.version}`;
        document.getElementById('latestDesc').textContent = latest.description || latest.changelog || '';
        const dlBtn = document.getElementById('latestDownloadBtn');
        if (latest.file_name) {
          dlBtn.href = `/api/v1/apehub-web/site/public/releases/${latest.id}/download`;
          dlBtn.setAttribute('download', latest.file_name);
        } else {
          dlBtn.style.display = 'none';
        }
        latestCard.hidden = false;
      }

      // 版本列表
      listEl.innerHTML = items.map(item => {
        const isLatest = !!item.is_latest;
        const changelog = item.changelog
          ? item.changelog.split('\n').filter(line => line.trim()).map(line => `• ${line.trim()}`).join('\n')
          : (item.description || t('download.noChangelog'));
        const hasFile = !!item.file_name;
        return `<div class="release-item">
          <div class="r-ver"><span class="ver-badge ${isLatest ? '' : 'old'}">v${esc(item.version)}</span></div>
          <div class="r-body">
            <div class="r-title">${esc(item.title || `ApeAdmin ${item.version}`)}${isLatest ? `<span class="r-latest-tag">${esc(t('download.rLatestTag'))}</span>` : ''}</div>
            <div class="r-changelog">${esc(changelog)}</div>
            <div class="r-meta">
              <span>${formatSize(item.file_size) || t('download.notUploaded')}</span>
              <span>${t('download.dl')} ${Number(item.download_count || 0).toLocaleString()}</span>
              <span>${formatDate(item.published_at) || formatDate(item.updated_at) || formatDate(item.created_at)}</span>
            </div>
          </div>
          <div class="r-actions">
            ${hasFile
              ? `<a class="dl-btn" href="/api/v1/apehub-web/site/public/releases/${item.id}/download" download="${esc(item.file_name)}">${esc(t('download.dl'))}</a>`
              : `<button class="dl-btn ghost" disabled>${esc(t('download.noFile'))}</button>`}
          </div>
        </div>`;
      }).join('');
    } catch (error) {
      listEl.innerHTML = `<div class="error-tip">${esc(error.message)}</div>`;
    } finally {
      loading = false;
    }
  }

  // 绑定框架 Tab 切换
  document.querySelectorAll('.fw-tab').forEach(tab => {
    tab.addEventListener('click', () => setFramework(tab.dataset.fw));
  });

  // 语言切换时重新拉取（文案变化）
  window.addEventListener('apeI18n.switch', () => loadReleases());

  loadReleases();
})();