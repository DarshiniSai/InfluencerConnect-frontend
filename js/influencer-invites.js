const influencerEmail = localStorage.getItem("userEmail");
const role = localStorage.getItem("userRole");

if (!influencerEmail || role !== "influencer") {
  showToast("Access denied. Only influencers can view this page.", "error");
  window.location.href = "index.html";
}

async function fetchInvites() {
  const res = await fetch(
    `${BACKEND_URL}/campaigns?influencerEmail=${influencerEmail}`
  );
  const data = await res.json();
  return data;
}

async function updateStatus(id, newStatus) {
  try {
    const response = await fetch(`${BACKEND_URL}/campaigns/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Failed to update status:", err);
    } else {
      console.log("Status updated successfully");
      showToast("Invite " + newStatus, "success");
      loadInvites();
    }
  } catch (error) {
    console.error("Network error:", error);
  }
}

function displayInvites(invites) {
  const container = document.getElementById("inviteList");
  container.innerHTML = "";

  if (invites.length === 0) {
    container.innerHTML = "<p>No invites received.</p>";
    return;
  }

  invites.forEach((invite) => {
    const card = document.createElement("div");
    card.className = "card";
    const status = invite.status || "Pending";

    card.innerHTML = `
          <h3>From: ${invite.brandEmail}</h3>
          <p><strong>Date:</strong> ${new Date(invite.date).toLocaleString()}</p>
          <p><strong>Message:</strong> ${invite.message || "No message provided"}</p>
          <p><strong>Status:</strong> ${status}</p>
        `;

    if (status.toLowerCase() === "pending") {
      const acceptBtn = document.createElement("button");
      acceptBtn.className = "accept";
      acceptBtn.textContent = "Accept";
      acceptBtn.onclick = () => updateStatus(invite.id, "Accepted");

      const declineBtn = document.createElement("button");
      declineBtn.className = "decline";
      declineBtn.textContent = "Decline";
      declineBtn.onclick = () => updateStatus(invite.id, "Declined");

      card.appendChild(acceptBtn);
      card.appendChild(declineBtn);
    }

    container.appendChild(card);
  });
}

function loadInvites() {
  fetchInvites().then(displayInvites);
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


loadInvites();
