(function () {
  const apiBase = '/api';
  const storageKeys = {
    access: 'hrms_access',
    refresh: 'hrms_refresh',
    user: 'hrms_user',
    lastEmail: 'hrms_last_email',
  };

  const state = {
    access: localStorage.getItem(storageKeys.access) || '',
    refresh: localStorage.getItem(storageKeys.refresh) || '',
    user: JSON.parse(localStorage.getItem(storageKeys.user) || 'null'),
  };

  const elements = {
    authPill: document.getElementById('auth-pill'),
    rolePill: document.getElementById('role-pill'),
    sessionMessage: document.getElementById('session-message'),
    tokenOutput: document.getElementById('token-output'),
    profileOutput: document.getElementById('profile-output'),
    loginFeedback: document.getElementById('login-feedback'),
    signupFeedback: document.getElementById('signup-feedback'),
    signupResult: document.getElementById('signup-result'),
    verifyFeedback: document.getElementById('verify-feedback'),
    verifyUid: document.getElementById('verify-uid'),
    verifyToken: document.getElementById('verify-token'),
  };

  function setFeedback(target, message, type) {
    if (!target) {
      return;
    }
    target.className = `feedback ${type}`;
    target.textContent = message;
  }

  function safeParse(text) {
    if (!text) {
      return null;
    }
    try {
      return JSON.parse(text);
    } catch (error) {
      return { detail: text };
    }
  }

  async function requestJson(url, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    if (state.access && !headers.Authorization) {
      headers.Authorization = `Bearer ${state.access}`;
    }

    const response = await fetch(url, { ...options, headers });
    const text = await response.text();
    const data = safeParse(text);

    if (!response.ok) {
      const message =
        data?.detail ||
        (data && typeof data === 'object' ? Object.values(data).flat().join(', ') : null) ||
        response.statusText ||
        'Request failed.';
      throw new Error(message);
    }

    return data;
  }

  function saveSession(payload) {
    state.access = payload.access || '';
    state.refresh = payload.refresh || '';
    state.user = payload.user || state.user;

    localStorage.setItem(storageKeys.access, state.access);
    localStorage.setItem(storageKeys.refresh, state.refresh);
    localStorage.setItem(storageKeys.user, JSON.stringify(state.user));
    renderSession();
  }

  function clearSession() {
    state.access = '';
    state.refresh = '';
    state.user = null;

    localStorage.removeItem(storageKeys.access);
    localStorage.removeItem(storageKeys.refresh);
    localStorage.removeItem(storageKeys.user);
    renderSession();
  }

  function renderSession() {
    if (elements.authPill) {
      elements.authPill.textContent = state.access ? 'Signed in' : 'Signed out';
    }
    if (elements.rolePill) {
      elements.rolePill.textContent = state.user?.role || 'Role unknown';
    }
    if (elements.sessionMessage) {
      elements.sessionMessage.textContent = state.access
        ? `Logged in as ${state.user?.email || 'unknown user'}. ${state.user?.must_change_password ? 'Password change is required.' : 'Session ready.'}`
        : 'Sign in to load the active profile and tokens.';
    }
    if (elements.tokenOutput) {
      elements.tokenOutput.textContent = state.access
        ? JSON.stringify({ access: state.access, refresh: state.refresh }, null, 2)
        : 'No tokens stored.';
    }
    if (elements.profileOutput) {
      elements.profileOutput.textContent = state.user ? JSON.stringify(state.user, null, 2) : '{}';
    }
  }

  function prefillEmailInputs() {
    const lastEmail = localStorage.getItem(storageKeys.lastEmail) || '';
    document.querySelectorAll('input[name="email"]').forEach((input) => {
      if (!input.value && lastEmail) {
        input.value = lastEmail;
      }
    });
  }

  async function loadProfile() {
    if (!state.access) {
      setFeedback(elements.loginFeedback, 'Sign in first to load your profile.', 'neutral');
      return;
    }

    try {
      const data = await requestJson(`${apiBase}/auth/me/`, { method: 'GET' });
      state.user = data;
      localStorage.setItem(storageKeys.user, JSON.stringify(state.user));
      renderSession();
      setFeedback(elements.loginFeedback, 'Profile loaded successfully.', 'success');
    } catch (error) {
      setFeedback(elements.loginFeedback, error.message, 'error');
    }
  }

  async function verifyEmail() {
    if (!elements.verifyUid || !elements.verifyToken) {
      return;
    }

    const uid = elements.verifyUid.value.trim();
    const token = elements.verifyToken.value.trim();
    if (!uid || !token) {
      setFeedback(elements.verifyFeedback, 'Provide both uid and token.', 'error');
      return;
    }

    setFeedback(elements.verifyFeedback, 'Verifying email...', 'neutral');
    try {
      const data = await requestJson(
        `${apiBase}/auth/verify-email/?uid=${encodeURIComponent(uid)}&token=${encodeURIComponent(token)}`,
        { method: 'GET' }
      );
      setFeedback(elements.verifyFeedback, data.message || 'Email verified successfully.', 'success');
      window.history.replaceState({}, '', window.location.pathname);
    } catch (error) {
      setFeedback(elements.verifyFeedback, error.message, 'error');
    }
  }

  const loginForm = document.getElementById('auth-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(loginForm);

      setFeedback(elements.loginFeedback, 'Signing in...', 'neutral');
      try {
        const data = await requestJson(`${apiBase}/auth/login/`, {
          method: 'POST',
          body: JSON.stringify({
            email: formData.get('email'),
            password: formData.get('password'),
          }),
        });

        localStorage.setItem(storageKeys.lastEmail, String(formData.get('email') || ''));
        saveSession(data);
        setFeedback(elements.loginFeedback, 'Login successful. Your session is ready.', 'success');
        await loadProfile();
      } catch (error) {
        setFeedback(elements.loginFeedback, error.message, 'error');
      }
    });
  }

  const signupForm = document.getElementById('auth-signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(signupForm);

      setFeedback(elements.signupFeedback, 'Creating account...', 'neutral');
      try {
        const payload = {
          email: formData.get('email'),
          password: formData.get('password'),
          confirm_password: formData.get('confirm_password'),
        };
        const data = await requestJson(`${apiBase}/auth/signup/`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        localStorage.setItem(storageKeys.lastEmail, String(formData.get('email') || ''));
        setFeedback(elements.signupFeedback, data.message || 'Account created. Check your email to verify it.', 'success');
        if (elements.signupResult) {
          elements.signupResult.textContent = JSON.stringify(data, null, 2);
        }
        signupForm.reset();
      } catch (error) {
        setFeedback(elements.signupFeedback, error.message, 'error');
        if (elements.signupResult) {
          elements.signupResult.textContent = '{}';
        }
      }
    });
  }

  const verifyButton = document.getElementById('verify-btn');
  if (verifyButton) {
    verifyButton.addEventListener('click', verifyEmail);
  }

  const loadProfileButton = document.getElementById('load-profile-btn');
  if (loadProfileButton) {
    loadProfileButton.addEventListener('click', loadProfile);
  }

  const logoutButton = document.getElementById('logout-btn');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      clearSession();
      setFeedback(elements.loginFeedback, 'Session cleared.', 'neutral');
    });
  }

  function hydrateVerificationFromQuery() {
    if (!elements.verifyUid || !elements.verifyToken) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const uid = params.get('uid');
    const token = params.get('token');
    if (uid) {
      elements.verifyUid.value = uid;
    }
    if (token) {
      elements.verifyToken.value = token;
    }
    if (params.get('action') === 'verify-email' && uid && token) {
      verifyEmail();
    }
  }

  prefillEmailInputs();
  renderSession();
  hydrateVerificationFromQuery();

  if (state.access && document.getElementById('auth-login-form')) {
    loadProfile();
  }
})();