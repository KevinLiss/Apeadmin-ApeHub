/* auth-shell.js — 公共登录/注册/找回密码弹窗（供插件市场、插件详情等页面复用）
 * 自动注入弹窗 DOM + 样式 + 事件逻辑；任何页面引入后点击 #navLoginBtn 即可打开弹窗。
 */
(() => {
  if (window.__authShellLoaded) return;
  window.__authShellLoaded = true;

  /* ---------- 弹窗 DOM（与首页 index.html 保持一致） ---------- */
  const modalHTML = `
  <div class="modal-overlay" id="authModal">
    <div class="modal">
      <button class="close-btn" id="modalClose">✕</button>
      <div class="modal-logo">
        <img src="/apehub-web/assets/logo.png" alt="ApeAdmin" onerror="this.style.display='none'" />
        <span>ApeAdmin</span>
      </div>
      <h3 class="modal-title" id="modalTitle" data-i18n="auth.login">欢迎回来</h3>
      <p class="modal-sub" id="modalSub" data-i18n="auth.login.sub">登录你的账户以继续</p>
      <div class="tabs">
        <button class="active" id="tabLogin" data-i18n="auth.login">登录</button>
        <button id="tabRegister" data-i18n="auth.register">注册</button>
      </div>
      <form id="authForm" novalidate>
        <div class="field" id="nameField">
          <label data-i18n="auth.username">用户名</label>
          <input type="text" id="usernameInput" placeholder="3-50 个字符，字母/数字/下划线" required minlength="3" maxlength="50" autocomplete="username" data-i18n-placeholder="auth.usernamePlaceholder" />
        </div>
        <div class="field" id="emailField" style="display:none;">
          <label data-i18n="auth.email">邮箱</label>
          <input type="email" id="emailInput" placeholder="you@example.com" maxlength="100" autocomplete="email" />
        </div>
        <div class="field" id="codeField" style="display:none;">
          <label data-i18n="auth.code">邮箱验证码</label>
          <div class="field-group">
            <input type="text" placeholder="输入 6 位数字验证码" maxlength="6" id="codeInput" inputmode="numeric" autocomplete="one-time-code" data-i18n-placeholder="auth.codePlaceholder" />
            <button type="button" class="send-code-btn" id="sendCodeBtn" data-i18n="auth.getCode">发送验证码</button>
          </div>
        </div>
        <div class="field" id="passwordField">
          <label data-i18n="auth.password">密码</label>
          <input type="password" id="passwordInput" placeholder="至少 8 位密码" required minlength="8" maxlength="100" autocomplete="new-password" data-i18n-placeholder="auth.passwordPlaceholder" />
        </div>
        <button type="submit" class="submit-btn" id="submitBtn" data-i18n="auth.submit.login">登录</button>
      </form>
      <p class="auth-message" id="authMessage" role="status" aria-live="polite"></p>
      <div class="alt-text" id="altText" data-i18n-html="auth.noAccount">还没有账号？<a id="switchLink" data-i18n="auth.goRegister">立即注册</a></div>
      <div class="auth-extra" id="forgotLinkWrap" style="display:none;">
        <a id="forgotLink" data-i18n="auth.forgot">忘记密码？</a>
      </div>
    </div>
  </div>`;

  const modalCSS = `
  .modal-overlay {
    position: fixed; inset: 0; z-index: 200; display: none;
    align-items: center; justify-content: center; padding: 20px;
    background: rgba(7,8,15,.7); backdrop-filter: blur(8px);
    animation: fadeIn .25s ease;
  }
  :root[data-theme="light"] .modal-overlay { background: rgba(248,250,252,.7); }
  :root[data-theme="light"] #authModal .close-btn { background: rgba(0,0,0,.06); }
  :root[data-theme="light"] #authModal .close-btn:hover { background: rgba(0,0,0,.1); }
  :root[data-theme="light"] #authModal .tabs { background: rgba(0,0,0,.04); }
  :root[data-theme="light"] #authModal .field input { background: #ffffff; }
  .modal-overlay.show { display: flex; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  #authModal .modal {
    width: 100%; max-width: 420px; background: var(--bg-soft);
    border: 1px solid var(--panel-border, var(--border-2)); border-radius: 24px;
    padding: 40px 36px; position: relative;
    box-shadow: 0 40px 80px -20px rgba(0,0,0,.7), 0 0 0 1px rgba(109,92,255,.15);
    animation: slideUp .3s ease;
  }
  #authModal .close-btn {
    position: absolute; top: 16px; right: 16px;
    width: 32px; height: 32px; border-radius: 8px; border: none;
    background: rgba(255,255,255,.06); color: var(--text-2);
    font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: all .2s;
  }
  #authModal .close-btn:hover { background: rgba(255,255,255,.12); color: var(--text); }
  #authModal .modal-logo { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
  #authModal .modal-logo img { width: 32px; height: 32px; border-radius: 8px; }
  #authModal .modal-logo span { font-weight: 700; font-size: 18px; }
  #authModal .modal-title { font-size: 24px; font-weight: 800; margin-bottom: 6px; }
  #authModal .modal-sub { color: var(--text-2); font-size: 14px; margin-bottom: 28px; }
  #authModal .tabs { display: flex; background: rgba(255,255,255,.04); border-radius: 10px; padding: 4px; margin-bottom: 24px; }
  #authModal .tabs button {
    flex: 1; padding: 9px; border: none; border-radius: 8px;
    font-size: 14px; font-weight: 600; cursor: pointer; transition: all .2s; background: transparent; color: var(--text-2);
    font-family: inherit;
  }
  #authModal .tabs button.active { background: var(--grad-2, linear-gradient(135deg,#4f46e5,#7c3aed)); color: #fff; box-shadow: 0 4px 12px -4px rgba(109,92,255,.5); }
  #authModal .field { margin-bottom: 16px; }
  #authModal .field label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--text-2); }
  #authModal .field input {
    width: 100%; padding: 12px 14px; border-radius: 12px;
    border: 1px solid var(--panel-border, var(--border-2)); background: rgba(255,255,255,.03);
    color: var(--text); font-size: 14px; font-family: inherit; transition: all .2s;
  }
  #authModal .field input::placeholder { color: var(--text-3); }
  #authModal .field input:focus { outline: none; border-color: var(--primary); background: rgba(109,92,255,.06); }
  #authModal .field.error input { border-color: #ef4444; background: rgba(239,68,68,.06); }
  #authModal .auth-message { margin-top: 12px; min-height: 20px; font-size: 13px; line-height: 1.5; text-align: center; }
  #authModal .auth-message.error { color: #ef4444; }
  #authModal .auth-message.success { color: #22c55e; }
  #authModal .field-group { display: flex; gap: 10px; }
  #authModal .field-group input { flex: 1; }
  #authModal .send-code-btn {
    flex-shrink: 0; padding: 0 14px; min-width: 96px; border-radius: 12px; border: 1px solid var(--panel-border, var(--border-2));
    background: rgba(109,92,255,.1); color: var(--primary); font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit;
    white-space: nowrap; transition: all .2s;
  }
  #authModal .send-code-btn:hover:not(:disabled) { background: rgba(109,92,255,.18); border-color: rgba(109,92,255,.5); }
  #authModal .send-code-btn:disabled { opacity: .6; cursor: not-allowed; }
  #authModal .submit-btn {
    width: 100%; padding: 13px; border: none; border-radius: 12px;
    font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit;
    color: #fff; background: var(--grad-2, linear-gradient(135deg,#4f46e5,#7c3aed)); box-shadow: 0 8px 20px -6px rgba(109,92,255,.6);
    transition: all .22s; margin-top: 4px;
  }
  #authModal .submit-btn:hover { transform: translateY(-2px); }
  #authModal .submit-btn:disabled { opacity: .6; transform: none; cursor: not-allowed; }
  #authModal .alt-text { margin-top: 18px; text-align: center; font-size: 14px; color: var(--text-2); }
  #authModal .alt-text a { color: var(--primary); cursor: pointer; font-weight: 600; }
  #authModal .auth-extra { margin-top: 14px; text-align: center; font-size: 13px; }
  #authModal .auth-extra a { color: var(--text-2); cursor: pointer; text-decoration: underline; }
  #authModal .auth-extra a:hover { color: var(--primary); }
  #authModal .modal-sub + .alt-text { margin-top: 0; }
  @media (max-width: 480px) {
    #authModal.modal-overlay { padding: 14px; }
    #authModal .modal { padding: 28px 20px; border-radius: 18px; }
    #authModal .modal-title { font-size: 20px; }
    #authModal .modal-sub { margin-bottom: 20px; }
    #authModal .close-btn { top: 10px; right: 10px; }
  }`;

  /* ---------- 注入样式与 DOM ---------- */
  const styleEl = document.createElement('style');
  styleEl.textContent = modalCSS;
  document.head.appendChild(styleEl);

  const wrap = document.createElement('div');
  wrap.innerHTML = modalHTML.trim();
  document.body.appendChild(wrap.firstElementChild);

  /* ---------- 弹窗逻辑（与首页 index.html 保持一致） ---------- */
  const modal = document.getElementById('authModal');
  const modalClose = document.getElementById('modalClose');
  const navLoginBtn = document.getElementById('navLoginBtn');
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const modalTitle = document.getElementById('modalTitle');
  const modalSub = document.getElementById('modalSub');
  const nameField = document.getElementById('nameField');
  const emailField = document.getElementById('emailField');
  const codeField = document.getElementById('codeField');
  const passwordField = document.getElementById('passwordField');
  const usernameInput = document.getElementById('usernameInput');
  const emailInput = document.getElementById('emailInput');
  const passwordInput = document.getElementById('passwordInput');
  const codeInput = document.getElementById('codeInput');
  const sendCodeBtn = document.getElementById('sendCodeBtn');
  const submitBtn = document.getElementById('submitBtn');
  const switchLink = document.getElementById('switchLink');
  const altText = document.getElementById('altText');
  const forgotLinkWrap = document.getElementById('forgotLinkWrap');
  const forgotLink = document.getElementById('forgotLink');
  const authMessage = document.getElementById('authMessage');
  let mode = 'login';

  /* i18n helper */
  const tr = (key, fallback) => (window.apeI18n ? window.apeI18n.t(key) : fallback);
  const fmt = (key, fallback, vars) => {
    const raw = tr(key, fallback);
    return Object.entries(vars || {}).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, String(v)), raw);
  };

  function showMessage(message, isError = false) {
    authMessage.textContent = message || '';
    authMessage.classList.toggle('error', !!message && isError);
    authMessage.classList.toggle('success', !!message && !isError);
  }

  /** 从后端响应中提取可读错误文案（兼容 code/msg 信封与 FastAPI 422 detail 数组） */
  function extractApiError(payload) {
    if (!payload || typeof payload !== 'object') return '';
    if (typeof payload.msg === 'string' && payload.msg) return payload.msg;
    const detail = payload.detail;
    if (typeof detail === 'string' && detail) return detail;
    if (Array.isArray(detail) && detail.length) {
      const first = detail[0] || {};
      const fieldMap = {
        username: '用户名', password: '密码', email: '邮箱',
        verification_code: '邮箱验证码', nickname: '昵称', new_password: '新密码',
      };
      const loc = Array.isArray(first.loc) ? first.loc.filter(p => p !== 'body') : [];
      const fieldName = fieldMap[loc[0]] || loc.join('.') || '表单';
      const type = first.type || '';
      const ctx = first.ctx || {};
      if (type === 'string_pattern_mismatch') return `${fieldName}格式不正确`;
      if (type === 'string_too_short') return `${fieldName}长度不足（至少 ${ctx.min_length ?? '?'} 个字符）`;
      if (type === 'string_too_long') return `${fieldName}超出长度限制（最多 ${ctx.max_length ?? '?'} 个字符）`;
      if (type === 'missing') return `请填写${fieldName}`;
      if (type === 'value_error' || type === 'value_error.email') return `${fieldName}格式不正确`;
      if (type === 'email_not_valid' || type === 'value_error.email') return '邮箱格式不正确';
      return first.msg ? `${fieldName}${first.msg.replace(/^Value error,\s*/, '')}` : `${fieldName}填写有误，请检查后重试`;
    }
    return '';
  }

  function fieldError(el, hasError) {
    const field = el?.closest('.field');
    if (field) field.classList.toggle('error', hasError);
  }

  async function apiRequest(path, options = {}) {
    const response = await fetch(`/api/v1${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.code !== 200) {
      const message = extractApiError(payload) || `请求失败（${response.status}），请稍后重试`;
      const err = new Error(message);
      err.status = response.status;
      throw err;
    }
    return payload.data;
  }

  function openModal(m) {
    mode = m;
    updateMode();
    modal.classList.add('show');
    window.dispatchEvent(new CustomEvent('apeAuthModalOpened', { detail: { mode } }));
  }
  function closeModal() { modal.classList.remove('show'); }
  function updateMode() {
    const isLogin = mode === 'login';
    const isRegister = mode === 'register';
    const isReset = mode === 'reset';
    tabLogin.classList.toggle('active', isLogin);
    tabRegister.classList.toggle('active', isRegister);
    const titleKey = isReset ? 'auth.reset.title' : isLogin ? 'auth.welcome.back' : 'auth.welcome.new';
    const subKey = isReset ? 'auth.reset.sub' : isLogin ? 'auth.login.sub' : 'auth.register.sub';
    modalTitle.setAttribute('data-i18n', titleKey);
    modalTitle.textContent = tr(titleKey, isReset ? '重置密码' : isLogin ? '欢迎回来' : '创建账户');
    modalSub.setAttribute('data-i18n', subKey);
    modalSub.textContent = tr(subKey, isReset ? '通过邮箱验证码重置你的账户密码' : isLogin ? '登录你的账户以继续' : '注册一个新账户开始使用');
    nameField.style.display = isReset ? 'none' : 'block';
    emailField.style.display = (isLogin || isReset) ? 'none' : 'block';
    codeField.style.display = (isLogin || isReset) ? 'none' : 'block';
    passwordField.style.display = isReset ? 'block' : 'block';
    // 重置模式下只显示邮箱 + 验证码 + 新密码；登录模式隐藏邮箱与验证码；注册模式显示全部
    if (isReset) {
      emailField.style.display = 'block';
      codeField.style.display = 'block';
    }
    emailInput.required = !isLogin;
    codeInput.required = !isLogin;
    passwordInput.required = isLogin || isRegister;
    // 密码字段标签与 placeholder 在重置模式下显示为「新密码」
    const pwLabel = passwordField.querySelector('label');
    const pwInput = passwordInput;
    if (pwLabel) pwLabel.setAttribute('data-i18n', isReset ? 'auth.reset.newPassword' : 'auth.password');
    if (pwInput) {
      pwInput.setAttribute('data-i18n-placeholder', isReset ? 'auth.reset.newPassword.placeholder' : 'auth.passwordPlaceholder');
      pwInput.placeholder = tr(isReset ? 'auth.reset.newPassword.placeholder' : 'auth.passwordPlaceholder', pwInput.placeholder);
    }
    if (isReset && pwLabel) pwLabel.textContent = tr('auth.reset.newPassword', '新密码');
    if (!isReset && pwLabel) pwLabel.textContent = tr('auth.password', '密码');
    const submitKey = isReset ? 'auth.reset.submit' : isLogin ? 'auth.submit.login' : 'auth.submit.register';
    submitBtn.setAttribute('data-i18n', submitKey);
    submitBtn.textContent = tr(submitKey, isReset ? '重置密码' : isLogin ? '登录' : '注册');
    passwordInput.autocomplete = isLogin ? 'current-password' : 'new-password';
    showMessage('');
    [usernameInput, emailInput, codeInput, passwordInput].forEach(el => fieldError(el, false));
    // 底部切换链接
    if (isReset) {
      altText.innerHTML = `<a id="switchLink" data-i18n="auth.reset.back">${tr('auth.reset.back', '返回登录')}</a>`;
      document.getElementById('switchLink').addEventListener('click', () => openModal('login'));
    } else {
      altText.innerHTML = isLogin
        ? `<span data-i18n="auth.noAccount">${tr('auth.noAccount', '还没有账号？')}</span><a id="switchLink" data-i18n="auth.goRegister">${tr('auth.goRegister', '立即注册')}</a>`
        : `<span data-i18n="auth.hasAccount">${tr('auth.hasAccount', '已有账号？')}</span><a id="switchLink" data-i18n="auth.goLogin">${tr('auth.goLogin', '返回登录')}</a>`;
      document.getElementById('switchLink').addEventListener('click', () => {
        openModal(mode === 'login' ? 'register' : 'login');
      });
    }
    // 忘记密码链接：仅登录模式显示
    forgotLinkWrap.style.display = isLogin ? 'block' : 'none';
    renderResendCountdown();
    if (window.apeI18n) window.apeI18n.applyI18n(modal);
  }

  if (navLoginBtn) navLoginBtn.addEventListener('click', () => openModal('login'));
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  tabLogin.addEventListener('click', () => { mode = 'login'; updateMode(); });
  tabRegister.addEventListener('click', () => { mode = 'register'; updateMode(); });
  switchLink.addEventListener('click', () => openModal('register'));
  forgotLink?.addEventListener('click', () => { mode = 'reset'; updateMode(); });
  let resendTimer = null;
  let codeSentEmail = sessionStorage.getItem('apehub_code_email') || '';
  const resendStorageKey = (email, purpose = 'register') => `apehub_${purpose}_code:${email.toLowerCase()}`;
  const resendRemaining = (email, purpose = 'register') => {
    if (!email) return 0;
    const expiresAt = Number(localStorage.getItem(resendStorageKey(email, purpose)) || 0);
    const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
    if (!remaining) localStorage.removeItem(resendStorageKey(email, purpose));
    return remaining;
  };
  const renderResendCountdown = () => {
    if (!sendCodeBtn || mode === 'login') return;
    const purpose = mode === 'register' ? 'register' : 'reset';
    const remaining = resendRemaining(emailInput.value.trim(), purpose);
    if (remaining > 0) {
      sendCodeBtn.disabled = true;
      sendCodeBtn.textContent = fmt('auth.resend.countdown', '{seconds} 秒后重发', { seconds: remaining });
    } else if (!sendCodeBtn.dataset.sending) {
      sendCodeBtn.disabled = false;
      sendCodeBtn.textContent = tr('auth.getCode', '发送验证码');
    }
    if (resendTimer) clearTimeout(resendTimer);
    if (remaining > 0) resendTimer = setTimeout(renderResendCountdown, 1000);
  };
  const startResendCountdown = (email, seconds, purpose = 'register') => {
    localStorage.setItem(resendStorageKey(email, purpose), String(Date.now() + Number(seconds || 60) * 1000));
    renderResendCountdown();
  };
  emailInput.addEventListener('input', () => {
    const email = emailInput.value.trim().toLowerCase();
    renderResendCountdown();
    if (codeSentEmail && email && email !== codeSentEmail) {
      showMessage(tr('auth.email.changed', '邮箱已变更，请使用发送验证码的邮箱，或重新发送验证码'), true);
    }
  });
  sendCodeBtn?.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    if (!email) {
      showMessage(tr('auth.email.required', '请先填写邮箱地址'), true);
      fieldError(emailInput, true);
      emailInput.focus();
      return;
    }
    fieldError(emailInput, false);
    const purpose = mode === 'register' ? 'register' : 'reset';
    const remaining = resendRemaining(email, purpose);
    if (remaining > 0) {
      renderResendCountdown();
      showMessage(fmt('auth.sendCode.rate', '请等待 {seconds} 秒后再重新发送', { seconds: remaining }), true);
      return;
    }
    sendCodeBtn.disabled = true;
    sendCodeBtn.dataset.sending = '1';
    sendCodeBtn.textContent = tr('auth.sendCode.sending', '发送中...');
    showMessage('');
    try {
      const path = purpose === 'register'
        ? '/apehub-web/site/auth/register/code'
        : '/apehub-web/site/auth/reset/code';
      const data = await apiRequest(path, {
        method: 'POST', body: JSON.stringify({ email }),
      });
      showMessage(fmt('auth.sendCode.success', '验证码已发送至 {email}，请查收邮箱（含垃圾箱），5 分钟内有效', { email }));
      codeSentEmail = email;
      sessionStorage.setItem('apehub_code_email', email);
      delete sendCodeBtn.dataset.sending;
      startResendCountdown(email, data.resend_in || 60, purpose);
    } catch (error) {
      delete sendCodeBtn.dataset.sending;
      sendCodeBtn.disabled = false;
      sendCodeBtn.textContent = tr('auth.getCode', '发送验证码');
      showMessage(error.message, true);
      const retryMatch = String(error.message || '').match(/(\d+)\s*秒/);
      if (retryMatch) startResendCountdown(email, Number(retryMatch[1]), purpose);
    }
  });
  document.getElementById('authForm').addEventListener('submit', async e => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const email = emailInput.value.trim();
    const code = codeInput.value.trim();
    [usernameInput, emailInput, codeInput, passwordInput].forEach(el => fieldError(el, false));
    if (mode === 'login' || mode === 'register') {
      if (mode === 'register') {
        if (!email) {
          showMessage(tr('auth.email.required', '请填写邮箱地址'), true);
          fieldError(emailInput, true); emailInput.focus();
          return;
        }
        if (!code || !/^\d{6}$/.test(code)) {
          showMessage(tr('auth.code.invalid', '请输入 6 位数字验证码'), true);
          fieldError(codeInput, true); codeInput.focus();
          return;
        }
        if (codeSentEmail && email.toLowerCase() !== codeSentEmail) {
          showMessage(tr('auth.email.changed', '邮箱已变更，请使用发送验证码的邮箱，或重新发送验证码'), true);
          fieldError(emailInput, true);
          return;
        }
      } else {
        if (!username || username.length < 3) {
          showMessage(tr('auth.username.short', '用户名至少 3 个字符'), true);
          fieldError(usernameInput, true); usernameInput.focus();
          return;
        }
      }
      if (password.length < 8) {
        showMessage(tr('auth.password.short', '密码至少 8 位'), true);
        fieldError(passwordInput, true); passwordInput.focus();
        return;
      }
    } else if (mode === 'reset') {
      if (!email) {
        showMessage(tr('auth.email.required', '请填写邮箱地址'), true);
        fieldError(emailInput, true); emailInput.focus();
        return;
      }
      if (!code || !/^\d{6}$/.test(code)) {
        showMessage(tr('auth.code.invalid', '请输入 6 位数字验证码'), true);
        fieldError(codeInput, true); codeInput.focus();
        return;
      }
      if (password.length < 8) {
        showMessage(tr('auth.password.short', '密码至少 8 位'), true);
        fieldError(passwordInput, true); passwordInput.focus();
        return;
      }
      if (codeSentEmail && email.toLowerCase() !== codeSentEmail) {
        showMessage(tr('auth.email.changed', '邮箱已变更，请使用发送验证码的邮箱，或重新发送验证码'), true);
        fieldError(emailInput, true);
        return;
      }
    }
    submitBtn.disabled = true;
    submitBtn.dataset.loading = '1';
    submitBtn.textContent = mode === 'login' ? tr('auth.login.loading', '登录中...')
      : mode === 'register' ? tr('auth.register.loading', '注册中...')
      : tr('auth.reset.loading', '重置中...');
    try {
      let data;
      if (mode === 'login') {
        data = await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ username, password, source: 'site' }) });
      } else if (mode === 'register') {
        data = await apiRequest('/apehub-web/site/auth/register', {
          method: 'POST',
          body: JSON.stringify({ username, password, email, verification_code: code }),
        });
      } else {
        data = await apiRequest('/apehub-web/site/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify({ email, verification_code: code, new_password: password }),
        });
      }
      if (mode === 'reset') {
        showMessage(tr('auth.reset.success', '密码已重置，请使用新密码登录'), false);
        setTimeout(() => { mode = 'login'; updateMode(); }, 1500);
        return;
      }
      localStorage.setItem('access_token', data.access_token);
      if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
      window.location.assign('/apehub-web/profile.html');
    } catch (error) {
      showMessage(error.message, true);
    } finally {
      delete submitBtn.dataset.loading;
      if (mode !== 'reset') {
        submitBtn.disabled = false;
        const submitKey = mode === 'login' ? 'auth.submit.login' : 'auth.submit.register';
        submitBtn.setAttribute('data-i18n', submitKey);
        submitBtn.textContent = tr(submitKey, mode === 'login' ? '登录' : '注册');
      }
    }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
})();