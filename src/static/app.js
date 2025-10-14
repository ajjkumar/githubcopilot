document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Build participants list HTML
        let participantsHTML = "";
        if (details.participants.length > 0) {
          participantsHTML = `
            <div class="participants-section">
              <strong>Participants:</strong>
              <ul class="participants-list" style="list-style-type: none; padding: 0;">
                ${details.participants.map(email => `
                  <li style="display: flex; align-items: center; justify-content: space-between; padding: 5px 0;">
                    <span>${email}</span>
                    <button class="delete-participant" data-email="${email}" style="background: none; border: none; color: red; cursor: pointer;">❌</button>
                  </li>
                `).join("")}
              </ul>
            </div>
          `;
        } else {
          participantsHTML = `
            <div class="participants-section">
              <strong>Participants:</strong>
              <p class="participants-none">No participants yet.</p>
            </div>
          `;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsHTML}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // Attach delete button listeners after rendering
      attachDeleteListeners();
    } catch (error) {
      showDialog("Failed to load activities. Please try again later.", true); // Show error message
      console.error("Error fetching activities:", error);
    }
  }

  // Function to refresh activities dynamically
  async function refreshActivities() {
    await fetchActivities();
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
        showDialog(result.message); // Show success message
        signupForm.reset();
        await refreshActivities(); // Refresh activities dynamically
      } else {
        showDialog(result.detail || "An error occurred", true); // Show error message
      }
    } catch (error) {
      showDialog("Failed to sign up. Please try again.", true); // Show error message
      console.error("Error signing up:", error);
    }
  });

  // Function to show a dialog pop-up for messages
  function showDialog(message, isError = false) {
    const dialog = document.createElement('div');
    dialog.style.position = 'fixed';
    dialog.style.top = '50%';
    dialog.style.left = '50%';
    dialog.style.transform = 'translate(-50%, -50%)';
    dialog.style.padding = '20px';
    dialog.style.backgroundColor = isError ? 'red' : 'green';
    dialog.style.color = 'white';
    dialog.style.borderRadius = '5px';
    dialog.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    dialog.style.zIndex = '1000';
    dialog.textContent = message;

    document.body.appendChild(dialog);

    setTimeout(() => {
      dialog.remove();
    }, 3000);
  }

  // Function to unregister a participant
  async function unregisterParticipant(email, activityName) {
    try {
      console.log(`Attempting to unregister ${email} from ${activityName}`);
      const response = await fetch(`/activities/unregister`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, activity: activityName }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`Successfully unregistered ${email} from ${activityName}`);
        showDialog(result.message); // Show success message
        await refreshActivities(); // Refresh activities dynamically
      } else {
        const errorDetail = await response.json();
        console.error("Failed to unregister participant:", errorDetail);
        showDialog(errorDetail.detail || "An error occurred", true); // Show error message
      }
    } catch (error) {
      console.error("Error unregistering participant:", error);
      showDialog("Failed to unregister participant. Please try again.", true); // Show error message
    }
  }

  // Function to attach delete button event listeners
  function attachDeleteListeners() {
    document.querySelectorAll('.delete-participant').forEach(button => {
      button.addEventListener('click', (event) => {
        const emailToRemove = event.target.getAttribute('data-email');
        const activityName = event.target.closest('.activity-card').querySelector('h4').textContent;
        unregisterParticipant(emailToRemove, activityName);
      });
    });
  }

  // Initialize app
  fetchActivities();
});
