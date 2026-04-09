(function () {
  var PASSWORD = 'tayportfolio2026';
  var KEY = 'ta_auth';

  if (sessionStorage.getItem(KEY) === '1') {
    document.documentElement.style.visibility = '';
    return;
  }

  function showOverlay() {
    document.documentElement.style.visibility = '';

    var style = document.createElement('style');
    style.textContent = [
      '#pw-overlay{position:fixed;inset:0;z-index:99999;',
      'background:var(--white,#f5f4f0);display:flex;align-items:center;justify-content:center;}',
      '#pw-overlay form{display:flex;flex-direction:column;gap:16px;width:320px;}',
      '#pw-overlay h2{margin:0;font-size:20px;font-family:var(--sans,sans-serif);color:var(--black,#0a0a0a);}',
      '#pw-overlay input{padding:10px 14px;border:1px solid var(--line,#d8d6d0);border-radius:4px;',
      'font-size:16px;width:100%;box-sizing:border-box;background:var(--white,#f5f4f0);color:var(--black,#0a0a0a);}',
      '#pw-overlay button{padding:10px 14px;background:var(--black,#0a0a0a);color:var(--white,#f5f4f0);',
      'border:none;border-radius:4px;font-size:16px;cursor:pointer;font-family:var(--sans,sans-serif);}',
      '#pw-error{font-size:13px;color:#c0392b;display:none;font-family:var(--sans,sans-serif);}'
    ].join('');
    document.head.appendChild(style);

    var overlay = document.createElement('div');
    overlay.id = 'pw-overlay';
    overlay.innerHTML =
      '<form id="pw-form">' +
        '<h2>Enter password</h2>' +
        '<input type="password" id="pw-input" placeholder="Password" autocomplete="current-password">' +
        '<button type="submit">Continue</button>' +
        '<span id="pw-error">Incorrect password</span>' +
      '</form>';
    document.body.appendChild(overlay);
    document.getElementById('pw-input').focus();

    document.getElementById('pw-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var val = document.getElementById('pw-input').value;
      if (val === PASSWORD) {
        sessionStorage.setItem(KEY, '1');
        overlay.remove();
      } else {
        document.getElementById('pw-error').style.display = 'block';
        document.getElementById('pw-input').value = '';
        document.getElementById('pw-input').focus();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showOverlay);
  } else {
    showOverlay();
  }
})();
