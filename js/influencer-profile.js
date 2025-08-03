const userEmail = localStorage.getItem("userEmail");
let userData;

async function loadProfile() {
  const profileDiv = document.getElementById("profile");
  try {
    const res = await fetch(
      `${BACKEND_URL}/users/profile?email=${userEmail}`
    );
    if (!res.ok) throw new Error(`Failed to fetch profile: ${res.status}`);
    const data = await res.json();
    console.log("data", data);
    userData = data[0];

    if (!userData || userData.role !== "influencer") {
      showToast("Unauthorized access", "error");
      window.location.href = "index.html";
      return;
    }

    renderProfile(false);
  } catch (error) {
    console.error("Load profile error:", error);
    profileDiv.innerHTML = `<p class="error">Failed to load profile: ${error.message}</p>`;
  }
}

function renderProfile(editMode) {
  const profileDiv = document.getElementById("profile");
  profileDiv.className = "profile";
  profileDiv.innerHTML = "";

  const profileImg = document.createElement("img");
  profileImg.src = userData.image || "./images/profile.png";
  profileImg.alt = "Profile Image";
  profileImg.className = "profile-img";

  const imgContainer = document.createElement("div");
  imgContainer.className = "profile-img-container";
  imgContainer.appendChild(profileImg);

  if (editMode) {
    const imgActions = document.createElement("div");
    imgActions.className = "img-actions";
    imgActions.innerHTML = `
      <input type="file" id="imageUpload" accept="image/*" style="display:none">
      <button onclick="document.getElementById('imageUpload').click()">Upload</button>
      <button onclick="removeImage()">Remove</button>
    `;
    imgContainer.appendChild(imgActions);
  }

  const nameField = editMode
    ? `<input id="editName" value="${userData.name}" placeholder="Enter name" />`
    : `<h2>${userData.name}</h2>`;
  const emailField = `<p><strong>Email:</strong> ${userData.email}</p>`;
  const segmentField = editMode
    ? `<label>Segment:</label><input id="editSegment" value="${userData.segment}" placeholder="Enter segment" />`
    : `<p><strong>Segment:</strong> ${userData.segment}</p>`;
  const audienceField = editMode
    ? `<label>Audience:</label><textarea id="editAudience" placeholder="Enter audience description">${userData.audience}</textarea>`
    : `<p><strong>Audience:</strong> ${userData.audience}</p>`;
  let platformsField = `<div class="platforms"><strong>Platforms:</strong><br>`;
  const platforms = userData.platforms || {};
  const platformKeys = ["instagram", "youtube", "twitter"];

  if (editMode) {
    platformKeys.forEach((platform) => {
      const info = platforms[platform] || { handle: "", followers: "" };
      platformsField += `
      <label>${
        platform.charAt(0).toUpperCase() + platform.slice(1)
      } Handle:</label>
      <input id="${platform}Handle" value="${
        info.handle
      }" placeholder="Enter ${platform} handle" />
      <label>${
        platform.charAt(0).toUpperCase() + platform.slice(1)
      } Followers:</label>
      <input id="${platform}Followers" type="number" value="${
        info.followers
      }" placeholder="Enter ${platform} followers" />
    `;
    });
  } else {
    platformsField += Object.entries(platforms)
      .map(([platform, info]) => {
        return `${platform.charAt(0).toUpperCase() + platform.slice(1)}: @${
          info.handle
        } (${info.followers.toLocaleString()} followers)`;
      })
      .join("<br>");
  }

  platformsField += `</div>`;

  profileDiv.appendChild(imgContainer);
  const divElement = document.createElement("div");
  divElement.className = "info";
  divElement.innerHTML +=
    nameField + emailField + segmentField + audienceField + platformsField;
  profileDiv.appendChild(divElement);

  const editBtn = document.createElement("button");
  editBtn.className = "edit-btn";
  editBtn.textContent = editMode ? "Save" : "Edit Profile";
  editBtn.onclick = () => {
    if (editMode) saveProfile();
    else renderProfile(true);
  };
  profileDiv.appendChild(editBtn);

  const imageUpload = document.getElementById("imageUpload");
  if (imageUpload) {
    imageUpload.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          showToast("Image size must be less than 2MB", "error");
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          userData.image = reader.result;
          renderProfile(true);
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

function removeImage() {
  userData.image = "./images/profile.png";
  renderProfile(true);
}

async function saveProfile() {
  const name = document.getElementById("editName").value.trim();
  const segment = document.getElementById("editSegment").value.trim();
  const audience = document.getElementById("editAudience").value.trim();

  if (!name) return showToast("Name is required", "error");
  if (!segment) return showToast("Segment is required", "error");
  if (!audience) return showToast("Audience description is required", "error");

  userData.name = name;
  userData.segment = segment;
  userData.audience = audience;
  userData.platforms = {};
  ["instagram", "youtube", "twitter"].forEach((platform) => {
    const handle = document.getElementById(`${platform}Handle`)?.value.trim();
    const followers =
      parseInt(document.getElementById(`${platform}Followers`)?.value.trim()) ||
      0;

    if (handle) {
      userData.platforms[platform] = { handle, followers };
    }
  });

  try {
    const res = await fetch(`${BACKEND_URL}/users/${userData.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (res.ok) {
      showToast("Profile updated successfully!", "success");
      renderProfile(false);
    } else {
      throw new Error(`Failed to update profile: ${res.status}`);
    }
  } catch (error) {
    console.error("Save profile error:", error);
    showToast("Failed to update profile: " + error.message, "error");
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

loadProfile();
