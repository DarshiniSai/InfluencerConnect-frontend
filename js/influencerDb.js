function logout() {
  localStorage.clear();
  showToast("Logged out successfully", "success");
  setTimeout(() => {
    window.location.href = "login.html";
  }, 1500);
}

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 5000);
}
