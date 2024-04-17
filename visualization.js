function fetchData() {
  return d3.json('data/output.json');
}

export async function generateVisualization(selectedLanguages) {
  // Load the data
  const data = await fetchData();
  console.log("Data:", data); // Log the loaded data

  // Filter nodes based on selected languages
  const filteredNodes = selectedLanguages.flatMap(language => data.nodes[language]);

  // Preprocess the data
  let classCounts = {};
  filteredNodes.forEach(node => {
    node.classes.forEach(nodeClass => {
      if (classCounts[nodeClass]) {
        classCounts[nodeClass] += 1;
      } else {
        classCounts[nodeClass] = 1;
      }
    });
  });
  console.log("Class Counts:", classCounts); // Log the class counts

  // Set up the SVG container
  const width = window.innerWidth;
  const height = window.innerHeight;
  const svgContainer = d3.select('#graph-container')
    .append('svg')
    .attr('width', width)
    .attr('height', height);
  const svg = svgContainer.append("g");

  // Create the bubble chart
  const bubble = d3.pack()
    .size([width, height])
    .padding(1);
  const nodes = d3.hierarchy({ children: Object.entries(classCounts) })
    .sum(d => d[1]);

  const node = svg.selectAll(".node")
    .data(bubble(nodes).leaves())
    .enter().append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.x},${d.y})`);

  node.append("circle")
    .attr("r", d => d.r)
    .attr("fill", "lightblue"); // Choose your color

  // Add labels (optional)
  node.append("text")
    .attr("dy", ".3em")
    .style("text-anchor", "middle")
    .style("font-family", "Montserrat") // Apply Montserrat font here
    .text(d => d.data[0]);

  // Add tooltips (optional)
  // This section is commented out as it requires additional implementation
  node.on("mouseover", function (d) {
    // Display tooltip with id and language
  })
    .on("mouseout", function (d) {
      // Hide tooltip
    });
}


// export async function generateVisualization(selectedLanguages) {
//   // Load the data
//   const data = await fetchData();
//   console.log("Data:", data); // Log the loaded data

//   // Preprocess the data
//   const nodes_data = data.nodes;
//   let classCounts = {};
//   Object.values(nodes_data).forEach(languageNodes => {
//     languageNodes.forEach(node => {
//       node.classes.forEach(nodeClass => {
//         if (classCounts[nodeClass]) {
//           classCounts[nodeClass] += 1;
//         } else {
//           classCounts[nodeClass] = 1;
//         }
//       });
//     });
//   });
//   console.log("Class Counts:", classCounts); // Log the class counts

//   // Set up the SVG container
//   const width = window.innerWidth;
//   const height = window.innerHeight;
//   const svgContainer = d3.select('#graph-container')
//     .append('svg')
//     .attr('width', width)
//     .attr('height', height);
//   const svg = svgContainer.append("g");

//   // Create the bubble chart
//   const bubble = d3.pack()
//     .size([width, height])
//     .padding(1);
//   const nodes = d3.hierarchy({ children: Object.entries(classCounts) })
//     .sum(d => d[1]);

//   const node = svg.selectAll(".node")
//     .data(bubble(nodes).leaves())
//     .enter().append("g")
//     .attr("class", "node")
//     .attr("transform", d => `translate(${d.x},${d.y})`);

//   node.append("circle")
//     .attr("r", d => d.r)
//     .attr("fill", "lightblue"); // Choose your color

//   // Add labels (optional)
//   node.append("text")
//     .attr("dy", ".3em")
//     .style("text-anchor", "middle")
//     .style("font-family", "Montserrat") // Apply Montserrat font here
//     .text(d => d.data[0]);

//   // Add tooltips (optional)
//   // This section is commented out as it requires additional implementation
//   node.on("mouseover", function (d) {
//     // Display tooltip with id and language
//   })
//     .on("mouseout", function (d) {
//       // Hide tooltip
//     });
// }



// export async function generateVisualization(selectedLanguages) {
//   const data = await fetchData();

//   // Set up the SVG container
//   const width = window.innerWidth;
//   const height = window.innerHeight;

//   // Append svg element to the div
//   const svgContainer = d3.select('#graph-container')
//     .append('svg')
//     .attr('width', width)
//     .attr('height', height);

//   const svg = svgContainer.append("g");

//   // Define an array of predefined colors
//   const predefinedColors = ['#ff5733', '#33ff57', '#5733ff']; // Add more colors if needed

//   // Assign colors directly to selectedLanguages
//   const colorsMap = {};
//   selectedLanguages.forEach((language, index) => {
//     colorsMap[language] = predefinedColors[index % predefinedColors.length];
//   });

//   // Filter nodes based on selected languages
//   const nodes = selectedLanguages.flatMap(language => data.nodes[language].map(node => ({ ...node, language })));
//   const timer = nodes.length * 5;
//   //console.log(nodes)
//   const linksForSimulation = createLinksForSimulation(nodes);
//   const linksForVisualization = createLinksForVisualization(nodes, data.colors);

//   //Create nodes
//   const node = svg.selectAll('.node')
//     .data(nodes)
//     .enter().append('g')
//     .attr('class', 'node')
//     .on('click', zoomOnNode);

//   // Add circles to nodes
//   node.append('circle')
//     .attr('r', 4)
//     .style('fill', d => colorsMap[d.language]);

//   // Add labels to nodes
//   const label = svg.selectAll('.label')
//     .data(nodes)
//     .enter().append('text')
//     .attr('class', 'label')
//     .text(d => d.id)
//     .style('fill', '#000')
//     .style('font-size', '7px')
//     .style('pointer-events', 'none')
//     .style('visibility', 'hidden')
//     .style('text-anchor', 'middle')
//     .style('alignment-baseline', 'middle');

//   let link;

//   // Create a force simulation
//   const simulation = d3.forceSimulation(nodes)
//     .force('link', d3.forceLink().id(d => d.id).links(linksForSimulation))
//     .force('charge', d3.forceManyBody().strength(-500))//-100-Math.sqrt(nodes.length)*5
//     .force('center', d3.forceCenter(width / 2, height / 2))
//     .force("x", d3.forceX(width / 2).strength(1))
//     .force("y", d3.forceY(height / 2).strength(1));

//   simulation.nodes(nodes)
//     .on('tick', ticked);

//   const zoom = d3.zoom()
//     .scaleExtent([0.1, 8]) // Set the scale extent to limit zooming between 0.5x and 8x
//     .on("zoom", function () {
//       svg.attr("transform", d3.event.transform);
//       handleZoom();
//     });

//   svgContainer.call(zoom)

//   handleZoom();

//   // Update positions of nodes and links on each tick
//   function ticked() {
//     setTimeout(function () {
//       // Update positions of nodes and links
//       if (link) {
//         link
//           .attr('x1', d => d.source.x)
//           .attr('y1', d => d.source.y)
//           .attr('x2', d => d.target.x)
//           .attr('y2', d => d.target.y);
//       }
//       node
//         .attr('transform', d => `translate(${d.x},${d.y})`);

//       label
//         .attr('x', d => d.x)
//         .attr('y', d => d.y)

//     }, timer);
//   }

//   function addConnections(clickedNode) {
//     // Filter out the links that involve the clicked node
//     const filteredLinks = linksForVisualization.filter(link => link.source === clickedNode || link.target === clickedNode);
//     //console.log(filteredLinks, clickedNode)
//     //Remove any existing links
//     svg.selectAll('.link').remove();
//     //svg.selectAll('.label').remove();

//     // Draw lines for the filtered links
//     link = svg.selectAll('.link')
//       .data(filteredLinks)
//       .enter().insert('line', '.node') // Insert before the nodes
//       .style('stroke', d => d.color)
//       .attr('class', 'link')
//       .attr('x1', d => d.source.x)  // Set line start x-coordinate
//       .attr('y1', d => d.source.y)  // Set line start y-coordinate
//       .attr('x2', d => d.target.x)  // Set line end x-coordinate
//       .attr('y2', d => d.target.y);

//     // Add black stroke around the clicked node and linked nodes
//     svg.selectAll('.node circle')
//       .style('stroke', 'none'); // Remove stroke from all nodes

//     svg.selectAll('.label')
//       .style('stroke-width', 0)

//     svg.selectAll('.node')
//       .select('circle')
//       .style('r', 4)

//     svg.selectAll('.node')
//       .filter(node => node === clickedNode || filteredLinks.some(link => link.source === node || link.target === node))
//       .select('circle')
//       .style('r', d => d === clickedNode ? 8 : 4)
//       .style('stroke', "black")
//       .style('stroke-width', 1);

//     svg.selectAll('.label')
//       .filter(label => label === clickedNode || filteredLinks.some(link => link.source === label || link.target === label))
//       .style('stroke', '#7386D5')
//       .style('stroke-width', 1)
//       .style('stroke-opacity', 1)
//       .style('paint-order', "stroke");
//   }

//   function zoomOnNode(clickedNode) {
//     addConnections(clickedNode)

//     // Calculate the desired zoom level and centering based on the clicked node
//     const [clickedX, clickedY] = [clickedNode.x, clickedNode.y]; // Get the coordinates of the clicked node
//     const scale = 3; // Set the desired zoom level
//     const translateX = width / 2 - scale * clickedX; // Calculate the desired X translation
//     const translateY = height / 2 - scale * clickedY; // Calculate the desired Y translation

//     // Update the current transform with the desired zoom level and centering
//     const newTransform = d3.zoomIdentity
//       .translate(translateX, translateY)
//       .scale(scale);

//     // Apply the updated transform to the SVG container
//     svgContainer.transition()
//       .duration(1000) // Set the duration of the transition
//       .call(zoom.transform, newTransform);

//   }

//   // Function to handle zoom event
//   function handleZoom() {
//     // Get the current zoom transform
//     const currentTransform = d3.zoomTransform(svgContainer.node());
//     //console.log(currentTransform)
//     // Show labels when zoom level reaches a certain threshold
//     const zoomThreshold = 2; // Set the zoom threshold
//     if (currentTransform.k >= zoomThreshold) {
//       label.style('visibility', 'visible'); // Show the labels
//     } else {
//       label.style('visibility', 'hidden'); // Hide the labels
//     }
//   }

//   return { nodes, zoomOnNode }
// }

// Function to create links based on nodes' class


