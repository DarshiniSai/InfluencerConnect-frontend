const brandEmail = localStorage.getItem("userEmail");
const role = localStorage.getItem("userRole");

if (!brandEmail || role !== "brand") {
  showToast("Access denied. Only brands can view this page.", "error");
  window.location.href = "index.html";
}

async function fetchCampaigns() {
  const res = await fetch(
    `${BACKEND_URL}/campaigns?brandEmail=${brandEmail}`
  );
  const data = await res.json();
  return data;
}

async function deleteInvite(id) {
  const confirmDelete = await showConfirm("Are you sure you want to delete this invite?");
  if (!confirmDelete) return;

  const res = await fetch(`${BACKEND_URL}/campaigns/${id}`, {
    method: "DELETE",
  });

  if (res.ok) {
    showToast("Deleted invite successfully.", "success");
    loadInvites();
  } else {
    showToast("Failed to delete invite", "error");
  }
}

function displayCampaigns(campaigns) {
  const container = document.getElementById("inviteList");
  container.innerHTML = "";

  if (campaigns.length === 0) {
    container.innerHTML = "<p>No invites sent yet.</p>";
    return;
  }

  campaigns.forEach((c) => {
    const card = document.createElement("div");
    card.className = "card";

    const status = c.status ? c.status : "Pending";

    card.innerHTML = `<h3>${c.influencerName}</h3>
   <p><strong>Email:</strong> ${c.influencerEmail}</p>
   <p><strong>Sent on:</strong> ${new Date(c.date).toLocaleString()}</p>
   <p><strong>Status:</strong> ${status}</p>
   <button onclick="deleteInvite('${c.id}')">Delete Invite</button>`;

    container.appendChild(card);
  });
}

function loadInvites() {
  fetchCampaigns().then(displayCampaigns);
}

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

function showConfirm(message) {
  return new Promise((resolve) => {
    const dialog = document.getElementById("confirm-dialog");
    const msgEl = document.getElementById("confirm-message");
    msgEl.textContent = message;

    dialog.style.display = "flex";

    document.getElementById("confirm-yes").onclick = () => {
      dialog.style.display = "none";
      resolve(true);
    };
    document.getElementById("confirm-no").onclick = () => {
      dialog.style.display = "none";
      resolve(false);
    };
  });
}

loadInvites();
