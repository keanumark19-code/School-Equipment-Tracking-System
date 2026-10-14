(function () {
  "use strict";

  var form = document.getElementById("login-form");
  var email = document.getElementById("username");
  var password = document.getElementById("password");
  var errorMessage = document.getElementById("login-error");
  var togglePassword = document.getElementById("toggle-password");
  var submitButton = form.querySelector('button[type="submit"]');

  function showError(text) {
    errorMessage.textContent = text;
    errorMessage.hidden = false;
  }

  function showQueryError() {
    var reason = new URLSearchParams(window.location.search).get("authError");
    if (reason === "service") {
      showError("Unable to validate the administrator session with Supabase. Check the connection and try again.");
    } else if (reason === "logout") {
      showError("The session could not be ended cleanly. Sign in again only after confirming the previous session has ended.");
    }
  }

  async function redirectIfAuthenticated() {
    try {
      var user = await window.AdminAuth.getCurrentAdmin();
      if (user) {
        var destination = new URLSearchParams(window.location.search).get("returnTo");
        window.location.replace(window.AdminAuth.safeReturnPath(destination));
      }
    } catch (error) {
      showError("Unable to connect to Supabase Authentication. Check your internet connection and try again.");
    }
  }

  togglePassword.addEventListener("click", function () {
    var isVisible = password.type === "text";
    password.type = isVisible ? "password" : "text";
    togglePassword.textContent = isVisible ? "Show" : "Hide";
    togglePassword.setAttribute("aria-pressed", String(!isVisible));
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    errorMessage.hidden = true;
    submitButton.disabled = true;

    try {
      await window.AdminAuth.login(email.value, password.value);
      var destination = new URLSearchParams(window.location.search).get("returnTo");
      window.location.replace(window.AdminAuth.safeReturnPath(destination));
    } catch (error) {
      showError(error.message || "Unable to sign in. Check the connection and try again.");
      password.focus();
      submitButton.disabled = false;
    }
  });

  showQueryError();
  redirectIfAuthenticated();
}());
