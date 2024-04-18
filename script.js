import { generateVisualization, getCurrentLanguages } from "./visualization.js";

generateVisualization(["Arabic (Syria)"], []).then(({ nodes, zoomOnNode }) => {
  document.getElementById("updateClasses").addEventListener("click", function () {
      // Get the current languages before updating by classes
      const languages = getCurrentLanguages();
      // Call updateByClasses with the current languages
      updateByClasses(languages);
    });
  searchFunctionality(nodes, zoomOnNode);
});

async function searchFunctionality(nodes, zoomOnNode) {
  // Assume "nodes" array is available here
  const searchInput = document.getElementById("searchInput");
  const searchResultsList = document.getElementById("searchResults");
  let selectedIndex = -1;

  // Function to highlight the selected item
  function highlightSelectedItem() {
    const items = searchResultsList.querySelectorAll("li");
    items.forEach((item, index) => {
      if (index === selectedIndex) {
        item.classList.add("selected");
      } else {
        item.classList.remove("selected");
      }
    });
  }

  searchInput.addEventListener("input", function (event) {
    const searchTerm = event.target.value.trim().toLowerCase();
    searchResultsList.innerHTML = ""; // Clear previous search results
    selectedIndex = -1; // Reset selectedIndex

    if (searchTerm === "") {
      // Clear search results and hide the list if search input is empty
      searchResultsList.style.display = "none";
      return; // Exit the event listener early
    }

    // Filter nodes by id where the id starts with the search term
    const filteredNodes = nodes
      .filter((node) => node.id.toLowerCase().startsWith(searchTerm))
      .slice(0, 3);

    // Create list items for matching nodes and append them to the search results list
    filteredNodes.forEach((node, index) => {
      const listItem = document.createElement("li");
      listItem.textContent = node.id;
      listItem.addEventListener("click", function () {
        zoomOnNode(node); // Call function with the node as argument
      });

      searchResultsList.appendChild(listItem);
    });

    // Show the search results list
    searchResultsList.style.display = "block";
  });

  searchInput.addEventListener("keydown", async function (event) {
    const items = searchResultsList.querySelectorAll("li");

    if (event.key === "ArrowUp") {
      event.preventDefault(); // Prevent default behavior of arrow up key
      if (selectedIndex > 0) {
        selectedIndex--;
        highlightSelectedItem();
      }
    } else if (event.key === "ArrowDown") {
      event.preventDefault(); // Prevent default behavior of arrow down key
      if (selectedIndex < items.length - 1) {
        selectedIndex++;
        highlightSelectedItem();
      }
    } else if (
      event.key === "Enter" &&
      selectedIndex >= 0 &&
      selectedIndex < items.length
    ) {
      // Call function with the selected node when Enter is pressed
      const selectedNode = await nodes.find((node) => node.id === items[selectedIndex].textContent);
      console.log(selectedNode);
      zoomOnNode(selectedNode);
    }
  });
}

// Function to populate checkboxes with languages
function populateLanguageCheckboxes(languages) {
  const languageContainer = document.getElementById("languageContainer");
  languageContainer.innerHTML = ""; // Clear previous content
  let selectedCount = 0; // Track the number of selected checkboxes

  languages.forEach((language, index) => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
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
    checkbox.addEventListener("change", function () {
      if (this.checked) {
        selectedCount++; // Increment selected count when checkbox is checked
        if (selectedCount >= 3) {
          // Disable remaining checkboxes if the limit is reached
          Array.from(languageContainer.getElementsByTagName("input")).forEach(
            (input) => {
              if (!input.checked) {
                input.disabled = true;
              }
            }
          );
        }
      } else {
        selectedCount--; // Decrement selected count when checkbox is unchecked
        // Enable all checkboxes when unchecking a checkbox
        Array.from(languageContainer.getElementsByTagName("input")).forEach(
          (input) => {
            input.disabled = false;
          }
        );
      }
    });

    const label = document.createElement("label");
    label.htmlFor = `language${index + 1}`;
    label.textContent = language;

    languageContainer.appendChild(checkbox);
    languageContainer.appendChild(label);
    languageContainer.appendChild(document.createElement("br"));
  });
}

function populateClassCheckboxes(classes) {
  const classContainer = document.getElementById("classContainer");
  classContainer.innerHTML = ""; // Clear previous content

  let selectedCount = 0; // Track the number of selected checkboxes

  classes.forEach((className, index) => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `class${index + 1}`;
    checkbox.value = className;

    // Check the checkbox for "Default Class" by default
    if (className === "Default Class") {
      checkbox.checked = true;
      selectedCount++; // Increment selected count
    }

    // Add event listener to track selected checkboxes
    checkbox.addEventListener("change", function () {
      if (this.checked) {
        selectedCount++; // Increment selected count when checkbox is checked
      } else {
        selectedCount--; // Decrement selected count when checkbox is unchecked
      }
    });

    const label = document.createElement("label");
    label.htmlFor = `class${index + 1}`;
    label.textContent = className;

    classContainer.appendChild(checkbox);
    classContainer.appendChild(label);
    classContainer.appendChild(document.createElement("br"));
  });
}

function fetchData(filePath) {
  d3.json(filePath)
    .then(function (data) {
      const languages = Object.keys(data.nodes);
      const classes = Object.keys(data.colors);
      // Call a function to visualize the data (or any other code that depends on the data)
      populateLanguageCheckboxes(languages);
      populateClassCheckboxes(classes);
    })
    .catch(function (error) {
      // Handle errors here
      console.error("Error fetching data:", error);
    });
}
fetchData("data/output.json");

document.getElementById("menuButton").addEventListener("click", toggleMenu);
document.getElementById("closeButton").addEventListener("click", toggleMenu);
function toggleMenu() {
  var sidebar = document.getElementById("sidebar");
  if (sidebar.style.left === "-300px") {
    sidebar.style.left = "0";
  } else {
    sidebar.style.left = "-300px";
  }
}

document
  .getElementById("updateLanguages")
  .addEventListener("click", updateByLanguages);

async function updateByLanguages() {
  const checkboxes = document.querySelectorAll(
    '#languageContainer input[type="checkbox"]:checked'
  );
  const selectedLanguages = [];

  checkboxes.forEach((checkbox) => {
    selectedLanguages.push(checkbox.value);
  });

  // Check if at least one language is selected
  if (selectedLanguages.length > 0) {
    // Update visualization based on the selected languages
    const graphContainer = document.getElementById("graph-container");
    graphContainer.innerHTML = ""; // Clear previous content
    generateVisualization(selectedLanguages, []).then(
      ({ nodes, zoomOnNode }) => {
        // document
        //   .getElementById("updateClasses")
        //   .addEventListener("click", function () {
        //     // Get the current languages before updating by classes
        //     const languages = getCurrentLanguages();

        //     // Call updateByClasses with the current languages
        //     updateByClasses(languages);
        //   });

        searchFunctionality(nodes, zoomOnNode);
      }
    );
  }
}

function updateByClasses(selectedLanguages) {
  const checkboxes = document.querySelectorAll(
    '#classContainer input[type="checkbox"]:checked'
  );
  const selectedClasses = [];

  checkboxes.forEach((checkbox) => {
    selectedClasses.push(checkbox.value);
  });

  // Check if at least one language is selected
  if (selectedClasses.length > 0) {
    // Update visualization based on the selected languages
    const graphContainer = document.getElementById("graph-container");
    graphContainer.innerHTML = ""; // Clear previous content
    generateVisualization(selectedLanguages, selectedClasses).then(
      ({ nodes, zoomOnNode }) => {
        // document
        //   .getElementById("updateClasses")
        //   .addEventListener("click", function () {
        //     // Get the current languages before updating by classes
        //     const languages = getCurrentLanguages();

        //     // Call updateByClasses with the current languages
        //     updateByClasses(languages);
        //   });
        searchFunctionality(nodes, zoomOnNode);
      }
    );
  }
}
