(function () {
  "use strict";

  var SUPABASE_URL = "https://moylbwatqogafgrcudfj.supabase.co";
  var SUPABASE_PUBLISHABLE_KEY = "sb_publishable_waV7zVQ8bqDpfse3PlKtbg_Copp5Gu6";
  var ADMIN_EMAIL = "kodular1100@gmail.com";
  var protectedPages = ["index.html", "equipment.html", "search.html", "details.html", "add-equipment.html"];
  var client = null;
  var initializationError = null;

  try {
    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      throw new Error("The Supabase client library did not load. Check your internet connection and reload.");
    }
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  } catch (error) {
    initializationError = error;
  }

  function returnPath() {
    var page = window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1);
    if (protectedPages.indexOf(page) === -1) {
      page = "index.html";
    }
    return page + (page === "details.html" ? window.location.search : "");
  }

  function redirectToLogin(reason) {
    var message = reason ? "&authError=" + encodeURIComponent(reason) : "";
    window.location.replace("login.html?returnTo=" + encodeURIComponent(returnPath()) + message);
  }

  function safeReturnPath(value) {
    if (typeof value !== "string") {
      return "index.html";
    }
    if (protectedPages.indexOf(value) !== -1) {
      return value;
    }
    if (value.indexOf("details.html?") === 0) {
      var requestedId = new URLSearchParams(value.substring("details.html?".length)).get("id");
      if (requestedId && requestedId.length <= 100) {
        return "details.html?id=" + encodeURIComponent(requestedId);
      }
    }
    return "index.html";
  }

  async function getCurrentAdmin() {
    if (!client) {
      throw initializationError || new Error("Supabase Authentication is unavailable.");
    }

    var result = await client.auth.getUser();
    if (result.error) {
      if (result.error.name === "AuthSessionMissingError") {
        return null;
      }
      throw result.error;
    }

    var user = result.data.user;
    if (!user) {
      return null;
    }
    if (!user.email || user.email.toLowerCase() !== ADMIN_EMAIL) {
      var signOutResult = await client.auth.signOut({ scope: "local" });
      if (signOutResult.error) {
        throw signOutResult.error;
      }
      return null;
    }
    return user;
  }

  async function requireLogin() {
    var style = document.createElement("style");
    style.textContent = "html.auth-pending body{visibility:hidden}";
    document.head.appendChild(style);
    document.documentElement.classList.add("auth-pending");

    try {
      var user = await getCurrentAdmin();
      if (!user) {
        redirectToLogin("");
        return false;
      }
      document.documentElement.classList.remove("auth-pending");
      return true;
    } catch (error) {
      redirectToLogin("service");
      return false;
    }
  }

  async function login(email, password) {
    if (!client) {
      throw initializationError || new Error("Supabase Authentication is unavailable.");
    }
    if (email.trim().toLowerCase() !== ADMIN_EMAIL) {
      throw new Error("Incorrect administrator email or password.");
    }

    var result = await client.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password
    });
    if (result.error) {
      if (result.error.code === "invalid_credentials" || result.error.message === "Invalid login credentials") {
        throw new Error("Incorrect administrator email or password.");
      }
      throw new Error("Supabase sign-in failed: " + result.error.message);
    }
    if (!result.data.user || !result.data.user.email || result.data.user.email.toLowerCase() !== ADMIN_EMAIL) {
      var signOutResult = await client.auth.signOut({ scope: "local" });
      if (signOutResult.error) {
        throw signOutResult.error;
      }
      throw new Error("This account is not authorized as the administrator.");
    }
    return result.data.user;
  }

  async function logout() {
    if (!client) {
      redirectToLogin("service");
      return;
    }

    var result = await client.auth.signOut({ scope: "local" });
    if (result.error) {
      throw result.error;
    }
    window.location.replace("login.html");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var logoutButton = document.getElementById("logout-button");
    if (logoutButton) {
      logoutButton.addEventListener("click", function () {
        logout().catch(function () {
          window.location.replace("login.html?authError=logout");
        });
      });
    }
  });

  window.AdminAuth = {
    getClient: function () {
      if (!client) {
        throw initializationError || new Error("Supabase Authentication is unavailable.");
      }
      return client;
    },
    getCurrentAdmin: getCurrentAdmin,
    requireLogin: requireLogin,
    login: login,
    logout: logout,
    safeReturnPath: safeReturnPath,
    initializationError: initializationError
  };
}());
