const listEl = document.getElementById("influencerList");
const segmentFilter = document.getElementById("segmentFilter");
const brandEmail = localStorage.getItem("userEmail");
const role = localStorage.getItem("userRole");

if (!brandEmail || role !== "brand") {
  showToast("Access denied. Brands only.", "error");
  window.location.href = "login.html";
}
async function fetchInfluencers() {
  const res = await fetch(`${BACKEND_URL}/users/influencers/all`);
  const data = await res.json();
  return data;
}

function displayInfluencers(influencers, invitedEmails = []) {
  listEl.innerHTML = "";

  influencers.forEach((user) => {
    const alreadyInvited = invitedEmails.includes(user.email);

    const div = document.createElement("div");
    div.className = "card";
    const imageSrc = user.image || "./images/profile.png"; 

    div.innerHTML = `
  <div class="card-header">
    <img src="${imageSrc}" alt="Profile Image" class="card-img">
    <div class="card-info">
      <h2>${user.name}</h2>
      <p><strong>Segment:</strong> ${user.segment}</p>
    </div>
  </div>
  <p><strong>Audience:</strong> ${user.audience}</p>
  <div class="platforms">
    ${Object.entries(user.platforms || {})
      .map(
        ([platform, info]) =>
          `<strong>${platform}</strong>: @${info.handle} (${info.followers} followers)`
      )
      .join("<br>")}
  </div>
  <textarea class="invite-message" placeholder="Enter invitation message" rows="2" style="width:100%; margin-top:10px; display: ${
    alreadyInvited ? "none" : ""
  }"></textarea>
  <button class="invite-btn"
          data-email="${user.email}"
          data-name="${user.name}"
          ${alreadyInvited ? "disabled" : ""}>
    ${alreadyInvited ? "Invite Sent" : "Send Campaign Invite"}
  </button>
`;

    listEl.appendChild(div);
  });

  document.querySelectorAll(".invite-btn").forEach((btn) => {
    if (!btn.disabled) {
      btn.addEventListener("click", async () => {
        const influencerEmail = btn.dataset.email;
        const influencerName = btn.dataset.name;
        const message = btn.previousElementSibling.value.trim();
        await sendInvite(influencerEmail, influencerName, message, btn);
      });
    }
  });
}

async function loadAndFilter() {
  const all = await fetchInfluencers();
  const inviteRes = await fetch(
    `${BACKEND_URL}/campaigns?brandEmail=${brandEmail}`
  );
  const sentInvites = await inviteRes.json();
  const invitedEmails = sentInvites.map((c) => c.influencerEmail);

  const selectedSegment = segmentFilter.value;
  const filtered = selectedSegment
    ? all.filter((u) => u.segment === selectedSegment)
    : all;

  displayInfluencers(filtered, invitedEmails);
}

async function sendInvite(influencerEmail, influencerName, message, btn) {
  if (!brandEmail) {
    showToast("Only logged-in brands can send invites.", "error");
    return;
  }
  const campaignData = {
    brandEmail,
    influencerEmail,
    influencerName,
    message,
    date: new Date().toISOString(),
  };
  const res = await fetch(`${BACKEND_URL}/campaigns`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(campaignData),
  });
  if (res.ok) {
    showToast(`Invite sent to ${influencerName}!`, "success");
    btn.textContent = "Invite Sent";
    btn.disabled = true;
    btn.style.backgroundColor = "#aaa";
    const textarea = btn.previousElementSibling;
    if (textarea && textarea.tagName === "TEXTAREA") {
      textarea.value = "";
      textarea.style.display = "none";
    }
  } else {
    showToast("Failed to send invite", "error");
  }
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

segmentFilter.addEventListener("change", loadAndFilter);
loadAndFilter();
