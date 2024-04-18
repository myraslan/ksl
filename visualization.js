let currentLanguages = [];

export async function generateVisualization(
  selectedLanguages,
  selectedClasses
) {
  const data = await d3.json("data/output.json");
  currentLanguages = selectedLanguages;
  // Set up the SVG container
  const width = window.innerWidth;
  const height = window.innerHeight;

  //Append svg element to the div
  const svgContainer = d3
    .select("#graph-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const svg = svgContainer.append("g");

  // Define an array of predefined colors
  const predefinedColors = ["#ff5733", "#33ff57", "#5733ff"]; // Add more colors if needed
  console.log(selectedLanguages)
  // Assign colors directly to selectedLanguages
  const colorsMap = {};
  selectedLanguages.forEach((language, index) => {
    colorsMap[language] = predefinedColors[index % predefinedColors.length];
  });

  // Filter nodes based on selected languages
  let nodes = selectedLanguages.flatMap((language) =>
    data.nodes[language].map((node) => ({ ...node, language }))
  );
  if (selectedClasses.length > 0) {
    nodes = nodes.filter((node) => {
      return selectedClasses.some((cls) => node.classes.includes(cls));
    });
  }
  const timer = nodes.length * 5;

  const linksForSimulation = createLinksForSimulation(nodes);
  const linksForVisualization = createLinksForVisualization(nodes, data.colors);

  //Create nodes
  const node = svg
    .selectAll(".node")
    .data(nodes)
    .enter()
    .append("g")
    .attr("class", "node")
    .on("click", zoomOnNode);

  // Add circles to nodes
  node
    .append("circle")
    .attr("r", 4)
    .style("fill", (d) => colorsMap[d.language]);

  // Add labels to nodes
  const label = svg
    .selectAll(".label")
    .data(nodes)
    .enter()
    .append("text")
    .attr("class", "label")
    .text((d) => d.id)
    .style("fill", "#000")
    .style("font-size", "7px")
    .style("pointer-events", "none")
    .style("visibility", "hidden")
    .style("text-anchor", "middle")
    .style("alignment-baseline", "middle");

  let link;

  // Create a force simulation
  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3
        .forceLink()
        .id((d) => d.id)
        .links(linksForSimulation)
    )
    .force("charge", d3.forceManyBody().strength(-500)) //-100-Math.sqrt(nodes.length)*5
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("x", d3.forceX(width / 2).strength(1))
    .force("y", d3.forceY(height / 2).strength(1));

  simulation.nodes(nodes).on("tick", ticked);

  const zoom = d3
    .zoom()
    .scaleExtent([0.1, 8]) // Set the scale extent to limit zooming between 0.5x and 8x
    .on("zoom", function () {
      svg.attr("transform", d3.event.transform);
      handleZoom();
    });

  svgContainer.call(zoom);

  handleZoom();

  // Update positions of nodes and links on each tick
  async function ticked() {
    setTimeout(function () {
      // Update positions of nodes and links
      if (link) {
        link
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y);
      }
      node.attr("transform", (d) => `translate(${d.x},${d.y})`);

      label.attr("x", (d) => d.x).attr("y", (d) => d.y);
    }, timer);
  }

  function addConnections(clickedNode) {
    // Filter out the links that involve the clicked node
    const filteredLinks = linksForVisualization.filter(
      (link) => link.source == clickedNode || link.target == clickedNode
    );
    //console.log(filteredLinks, clickedNode)
    //Remove any existing links
    svg.selectAll(".link").remove();
    //svg.selectAll('.label').remove();

    // Draw lines for the filtered links
    link = svg
      .selectAll(".link")
      .data(filteredLinks)
      .enter()
      .insert("line", ".node") // Insert before the nodes
      .style("stroke", (d) => d.color)
      .attr("class", "link")
      .attr("x1", (d) => d.source.x) // Set line start x-coordinate
      .attr("y1", (d) => d.source.y) // Set line start y-coordinate
      .attr("x2", (d) => d.target.x) // Set line end x-coordinate
      .attr("y2", (d) => d.target.y);

    // Add black stroke around the clicked node and linked nodes
    svg.selectAll(".node circle").style("stroke", "none"); // Remove stroke from all nodes

    svg.selectAll(".label").style("stroke-width", 0);

    svg.selectAll(".node").select("circle").style("r", 4);

    svg
      .selectAll(".node")
      .filter(
        (node) =>
          node === clickedNode ||
          filteredLinks.some(
            (link) => link.source === node || link.target === node
          )
      )
      .select("circle")
      .style("r", (d) => (d === clickedNode ? 8 : 4))
      .style("stroke", "black")
      .style("stroke-width", 1);

    svg
      .selectAll(".label")
      .filter(
        (label) =>
          label === clickedNode ||
          filteredLinks.some(
            (link) => link.source === label || link.target === label
          )
      )
      .style("stroke", "#7386D5")
      .style("stroke-width", 1)
      .style("stroke-opacity", 1)
      .style("paint-order", "stroke");
  }

  function zoomOnNode(clickedNode) {
    addConnections(clickedNode);
    addNodeInfo(clickedNode);
    // Calculate the desired zoom level and centering based on the clicked node
    const [clickedX, clickedY] = [clickedNode.x, clickedNode.y]; // Get the coordinates of the clicked node
    const scale = 3; // Set the desired zoom level
    const translateX = width / 2 - scale * clickedX; // Calculate the desired X translation
    const translateY = height / 2 - scale * clickedY; // Calculate the desired Y translation

    // Update the current transform with the desired zoom level and centering
    const newTransform = d3.zoomIdentity
      .translate(translateX, translateY)
      .scale(scale);

    // Apply the updated transform to the SVG container
    svgContainer
      .transition()
      .duration(1000) // Set the duration of the transition
      .call(zoom.transform, newTransform);
  }

  function addNodeInfo(clickedNode){
    const nodeInfoContainer = document.getElementById("nodeInfoContainer");
    // Create elements to hold the node information
    const infoList = document.createElement("ul");
    const idItem = document.createElement("li");
    const classesItem = document.createElement("li");
    const languageItem = document.createElement("li");

    // Set text content for each item
    idItem.textContent = `Word: ${clickedNode.id}`;
    classesItem.textContent = `Classes: ${clickedNode.classes.join(", ")}`;
    languageItem.textContent = `Language: ${clickedNode.language}`;

    // Append items to the info list
    infoList.appendChild(idItem);
    infoList.appendChild(classesItem);
    infoList.appendChild(languageItem);

    // Clear any existing content in the container
    nodeInfoContainer.innerHTML = "";

    // Append the info list to the container
    nodeInfoContainer.appendChild(infoList);
  }

  // Function to handle zoom event
  function handleZoom() {
    // Get the current zoom transform
    const currentTransform = d3.zoomTransform(svgContainer.node());
    //console.log(currentTransform)
    // Show labels when zoom level reaches a certain threshold
    const zoomThreshold = 2; // Set the zoom threshold
    if (currentTransform.k >= zoomThreshold) {
      label.style("visibility", "visible"); // Show the labels
    } else {
      label.style("visibility", "hidden"); // Hide the labels
    }
  }

  return { nodes, zoomOnNode };
}

export function getCurrentLanguages() {
  return currentLanguages;
}

// Function to create links based on nodes' class
function createLinksForSimulation(nodes) {
  const links = [];
  const classNodes = {};

  nodes.forEach(async (node) => {
    const nodeClass = node.classes[0];
    if (!classNodes[nodeClass]) {
      classNodes[nodeClass] = [];
    }
    classNodes[nodeClass].push(node);
  });

  Object.values(classNodes).forEach((classGroup) => {
    for (let i = 0; i < classGroup.length - 1; i++) {
      for (let j = i + 1; j < classGroup.length; j++) {
        links.push({ source: classGroup[i].id, target: classGroup[j].id });
      }
    }
  });

  return links;
}

function createLinksForVisualization(nodes, colors) {
  const links = [];
  const classNodes = {};
  nodes.forEach((node) => {
    const nodeClasses = node.classes;
    nodeClasses.forEach((nodeClass) => {
      if (!classNodes[nodeClass]) {
        classNodes[nodeClass] = [];
      }
      classNodes[nodeClass].push(node);
    });
  });

  Object.entries(classNodes).forEach(([key, classGroup]) => {
    //console.log(key, colors[key])
    for (let i = 0; i < classGroup.length - 1; i++) {
      for (let j = i + 1; j < classGroup.length; j++) {
        links.push({
          source: classGroup[i],
          target: classGroup[j],
          color: colors[key],
        });
      }
    }
  });

  return links;
}
