document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  const activityCardTemplate = document.getElementById("activity-card-template");

  async function removeParticipant(activityName, email) {
    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activityName)}/participants?email=${encodeURIComponent(email)}`,
        { method: "DELETE" }
      );

      const result = await response.json();
      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        messageDiv.classList.remove("hidden");
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "Unable to remove participant";
        messageDiv.className = "error";
        messageDiv.classList.remove("hidden");
      }

      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to remove participant. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error removing participant:", error);
    }
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message and reset activity options
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const cardClone = activityCardTemplate.content.cloneNode(true);
        cardClone.querySelector(".activity-name").textContent = name;
        cardClone.querySelector(".activity-description").textContent = details.description;
        cardClone.querySelector(".activity-schedule span").textContent = details.schedule;
        cardClone.querySelector(".activity-availability span").textContent = details.max_participants - details.participants.length;

        const participantsList = cardClone.querySelector(".participants-list");
        if (details.participants.length > 0) {
          details.participants.forEach((email) => {
            const listItem = document.createElement("li");
            listItem.className = "participant-item";

            const emailSpan = document.createElement("span");
            emailSpan.textContent = email;
            emailSpan.className = "participant-email";

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.className = "remove-participant";
            removeButton.setAttribute("aria-label", `Remove ${email}`);
            removeButton.textContent = "×";
            removeButton.addEventListener("click", () => removeParticipant(name, email));

            listItem.appendChild(emailSpan);
            listItem.appendChild(removeButton);
            participantsList.appendChild(listItem);
          });
        } else {
          const listItem = document.createElement("li");
          listItem.className = "no-participants";
          listItem.innerHTML = "<em>No one signed up yet</em>";
          participantsList.appendChild(listItem);
        }

        activitiesList.appendChild(cardClone);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
