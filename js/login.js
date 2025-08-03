const formTitle = document.getElementById("formTitle");
const nameField = document.getElementById("name");
const toggleText = document.getElementById("toggleForm");
const roleSelect = document.getElementById("role");
const form = document.getElementById("form");
const email = document.getElementById("email");
const password = document.getElementById("password");
const influencerFields = document.getElementById("influencerFields");
const brandFields = document.getElementById("brandFields");
const instaCheck = document.getElementById("instaCheck");
const ytCheck = document.getElementById("ytCheck");
const twCheck = document.getElementById("twCheck");
const instaId = document.getElementById("instaId");
const ytId = document.getElementById("ytId");
const twId = document.getElementById("twId");
const instaFollowers = document.getElementById("instaFollowers");
const ytFollowers = document.getElementById("ytFollowers");
const twFollowers = document.getElementById("twFollowers");
const segmentField = document.getElementById("segment");
const audienceField = document.getElementById("audience");
const brandName = document.getElementById("brandName");
const website = document.getElementById("website");
const forgotPassword = document.getElementById("forgot-password");

let signup = false;
toggleText.addEventListener("click", () => {
  signup = !signup;
  formTitle.textContent = signup ? "Sign Up" : "Login";
  toggleText.textContent = signup
    ? "Already have an account? Login"
    : "Don't have an account? Sign up";
  nameField.style.display = signup ? "block" : "none";
  forgotPassword.style.display = signup ? "none" : "block";
  setTimeout(updateRoleFields, 0);
});

roleSelect.addEventListener("change", updateRoleFields);

function updateRoleFields() {
  if (!signup) {
    influencerFields.style.display = "none";
    brandFields.style.display = "none";
    segmentField.style.display = "none";
    audienceField.style.display = "none";
    return;
  }
  const role = roleSelect.value;

  if (role === "influencer") {
    influencerFields.style.display = "block";
    brandFields.style.display = "none";
    segmentFields.style.display = "block";
  } else if (role === "brand") {
    brandFields.style.display = "block";

    influencerFields.style.display = "none";
    segmentField.style.display = "none";
    audienceField.style.display = "none";
  }
}
instaCheck.addEventListener("change", () => {
  instaId.style.display = instaCheck.checked ? "block" : "none";
  instaFollowers.style.display = instaCheck.checked ? "block" : "none";
});
ytCheck.addEventListener("change", () => {
  ytId.style.display = ytCheck.checked ? "block" : "none";
  ytFollowers.style.display = ytCheck.checked ? "block" : "none";
});
twCheck.addEventListener("change", () => {
  twId.style.display = twCheck.checked ? "block" : "none";
  twFollowers.style.display = twCheck.checked ? "block" : "none";
});

form.addEventListener("submit", async (e) => {
  console.log("Submit function is revoked");
  e.preventDefault();
  const role = roleSelect.value;
  const emailVal = email.value.trim();
  const passwordVal = password.value.trim();

  if (signup) {
    if (!nameField.value.trim())
      return showToast("Name is required" + "!", "error");
    if (!emailVal) return showToast("Email is required", "error");
    if (!passwordVal || passwordVal.length < 6)
      return showToast("Password must be at least 6 characters", "error");

    const userData = { role, email: emailVal, password: passwordVal };

    if (role === "influencer") {
      if (!instaCheck.checked && !ytCheck.checked && !twCheck.checked)
        return showToast("Select at least one platform", "error");

      userData.name = nameField.value.trim();
      userData.platforms = {};
      if (instaCheck.checked)
        userData.platforms.instagram = {
          handle: instaId.value.trim(),
          followers: parseInt(instaFollowers.value.trim()),
        };
      if (ytCheck.checked)
        userData.platforms.youtube = {
          handle: ytId.value.trim(),
          followers: parseInt(ytFollowers.value.trim()),
        };
      if (twCheck.checked)
        userData.platforms.twitter = {
          handle: twId.value.trim(),
          followers: parseInt(twFollowers.value.trim()),
        };

      if (!segmentField.value.trim()) return showToast("Segment is required");
      if (!audienceField.value.trim())
        return showToast("Audience description is required", "error");

      userData.segment = segmentField.value.trim();
      userData.audience = audienceField.value.trim();
    } else if (role === "brand") {
      if (!brandName.value.trim())
        return showToast("Brand name is required", "error");
      if (!website.value.trim())
        return showToast("Website is required", "error");

      userData.brandName = brandName.value.trim();
      userData.website = website.value.trim();
    }

    const response = await fetch(`${BACKEND_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (response.ok) {
      const data = await response.json();
      showToast("Signup successful!", "success");
      localStorage.setItem("userEmail", emailVal);
      localStorage.setItem("userRole", role);
      if (role === "influencer") {
        window.location.href = "influencerDb.html";
      } else {
        window.location.href = "influencer.html";
      }
    }
  } else {
    if (!emailVal) return showToast("Email is required", "error");
    if (!passwordVal) return showToast("Password is required", "error");

    const response = await fetch(
      `${BACKEND_URL}/users?email=${emailVal}&password=${passwordVal}`
    );
    const data = await response.json();
    if (data && data.email) {
      showToast("Login sucessful", "success");
      setTimeout(() => {
        if (data.role === "influencer") {
          window.location.href = "influencerDb.html";
        } else {
          window.location.href = "brandDb.html";
        }
      }, 1000);
      localStorage.setItem("userEmail", data.email);
      localStorage.setItem("userRole", data.role);

      form.reset();
    } else {
      showToast("Invalid credentials", "error");
      form.reset();
    }
  }
});

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}
