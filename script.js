import { generateVisualization } from './visualization.js';
generateVisualization(["Arabic (Syria)"])

// Function to populate checkboxes with languages
function populateLanguageCheckboxes(languages) {
  const languageContainer = document.getElementById('languageContainer');
  languageContainer.innerHTML = ''; // Clear previous content

  let selectedCount = 0; // Track the number of selected checkboxes

  languages.forEach((language, index) => {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `language${index + 1}`;
      checkbox.value = language;

      // Check the checkbox for "Arabic (Syria)" by default
      if (language === "Arabic (Syria)") {
          checkbox.checked = true;
          selectedCount++; // Increment selected count
      }

      // Disable checkboxes if the limit is reached
      if (selectedCount >= 3) {
          checkbox.disabled = true;
      }

      // Add event listener to track selected checkboxes
      checkbox.addEventListener('change', function () {
          if (this.checked) {
              selectedCount++; // Increment selected count when checkbox is checked
              if (selectedCount >= 3) {
                  // Disable remaining checkboxes if the limit is reached
                  Array.from(languageContainer.getElementsByTagName('input')).forEach(input => {
                      if (!input.checked) {
                          input.disabled = true;
                      }
                  });
              }
          } else {
              selectedCount--; // Decrement selected count when checkbox is unchecked
              // Enable all checkboxes when unchecking a checkbox
              Array.from(languageContainer.getElementsByTagName('input')).forEach(input => {
                  input.disabled = false;
              });
          }
      });

      const label = document.createElement('label');
      label.htmlFor = `language${index + 1}`;
      label.textContent = language;

      languageContainer.appendChild(checkbox);
      languageContainer.appendChild(label);
      languageContainer.appendChild(document.createElement('br'));
  });
}

function fetchData(filePath) {
  d3.json(filePath)
      .then(function(data) {
          const languages = Object.keys(data.nodes);
          // Call a function to visualize the data (or any other code that depends on the data)
          populateLanguageCheckboxes(languages);
      })
      .catch(function(error) {
          // Handle errors here
          console.error('Error fetching data:', error);
      });
}
fetchData('data/output.json');

document.getElementById('menuButton').addEventListener('click', toggleMenu);
document.getElementById('closeButton').addEventListener('click', toggleMenu);
function toggleMenu() {
  var sidebar = document.getElementById('sidebar');
  if (sidebar.style.left === "-300px") {
    sidebar.style.left = "0";
  } else {
    sidebar.style.left = "-300px";
  }
}

document.getElementById('updateButton').addEventListener('click', updateVisualization);
// Function to handle the "Update Visualization" button click
function updateVisualization() {
  const selectedLanguages = [];
  const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
  checkboxes.forEach(checkbox => {
      selectedLanguages.push(checkbox.value);
  });

  console.log(selectedLanguages)

  // Check if at least one language is selected
  if (selectedLanguages.length > 0) {
      // Update visualization based on the selected languages
      const graphContainer = document.getElementById('graph-container');
      graphContainer.innerHTML = ''; // Clear previous content
      generateVisualization(selectedLanguages);
  } else {
      // Handle case when no language is selected
      console.error("Please select at least one language.");
  }

}