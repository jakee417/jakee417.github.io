// Add MathJax script to the head
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
script.async = true;
document.head.appendChild(script);

// Set up the SVG container
const margin = { top: 20, right: 20, bottom: 20, left: 20 };
let width = window.innerWidth - 40; // Responsive width with max of 800px
let height = window.innerHeight - 200; // Responsive height with max of 600px

// Grid dimensions (much larger than visible area)
const gridWidth = width * 10;
const gridHeight = height * 10;

const initialMagnitude = 141.4213562373;

// Calculate the center of the SVG
let centerX = width / 2;
let centerY = height / 2;

// Add title container
const titleContainer = d3.select("#vector-container")
    .append("div")
    .style("text-align", "center")
    .style("margin-bottom", "20px");

// Add equation text as title
const equationText = titleContainer.append("div")
    .style("font-size", "24px")
    .style("font-family", "Arial")
    .attr("id", "vector-equation")
    .html("\\[\\vec{v} = 0.00\\vec{e}_1 + 0.00\\vec{e}_2\\]");

const svg = d3.select("#vector-container")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

// Create a group for the grid and axes
const gridGroup = svg.append("g")
    .attr("transform", `translate(${centerX},${centerY})`);

// Create a group for the vector and basis vectors
const vectorGroup = svg.append("g")
    .attr("transform", `translate(${centerX},${centerY})`);

// Function to handle window resize
function handleResize() {
    // Update dimensions
    width = window.innerWidth - 40;
    height = window.innerHeight - 200;

    // Update center coordinates
    centerX = width / 2;
    centerY = height / 2;

    // Update SVG viewBox
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    // Update grid and vector groups
    gridGroup.attr("transform", `translate(${centerX},${centerY})`);
    vectorGroup.attr("transform", `translate(${centerX},${centerY})`);

    // Update vector visualization
    updateVector();
}

// Add resize event listener
window.addEventListener('resize', handleResize);

// Add coordinate system
const gridSize = 50;
const xAxis = d3.axisBottom(d3.scaleLinear()
    .domain([-gridWidth / 2, gridWidth / 2])
    .range([-gridWidth / 2, gridWidth / 2]))
    .ticks(gridWidth / gridSize)  // One tick per grid cell
    .tickFormat(d => d % gridSize === 0 ? d : "");  // Only show labels at grid cell boundaries

const yAxis = d3.axisLeft(d3.scaleLinear()
    .domain([-gridHeight / 2, gridHeight / 2])
    .range([gridHeight / 2, -gridHeight / 2]))
    .ticks(gridHeight / gridSize)  // One tick per grid cell
    .tickFormat(d => d % gridSize === 0 ? d : "");  // Only show labels at grid cell boundaries

// Add grid lines
for (let i = -gridWidth / 2; i <= gridWidth / 2; i += gridSize) {
    gridGroup.append("line")
        .attr("x1", i)
        .attr("y1", -gridHeight / 2)
        .attr("x2", i)
        .attr("y2", gridHeight / 2)
        .attr("stroke", "#ddd")
        .attr("stroke-width", 0.5);
}

for (let i = -gridHeight / 2; i <= gridHeight / 2; i += gridSize) {
    gridGroup.append("line")
        .attr("x1", -gridWidth / 2)
        .attr("y1", i)
        .attr("x2", gridWidth / 2)
        .attr("y2", i)
        .attr("stroke", "#ddd")
        .attr("stroke-width", 0.5);
}

// Add axes
gridGroup.append("g")
    .call(xAxis);

gridGroup.append("g")
    .call(yAxis);

// Create a sample vector
let vector = {
    x: 0,  // Fixed at origin
    y: 0,  // Fixed at origin
    magnitude: initialMagnitude,
    angle: 45 // in degrees
};

// Basis vector length (will be controlled by slider)
let basisVectorLength = 50;
let gridRotation = 0; // in degrees

// Arrow sizes
const mainArrowSize = 30; // Size for main vector arrow
const basisArrowSize = 10; // Size for basis vector arrows

// Add slider for basis vector length and grid rotation
const sliderContainer = d3.select("#vector-container")
    .append("div")
    .style("margin-top", "20px")
    .style("text-align", "center")
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("align-items", "center")
    .style("gap", "20px");

// Basis vector length slider
const lengthSliderContainer = sliderContainer.append("div")
    .style("display", "flex")
    .style("align-items", "center")
    .style("gap", "10px");

lengthSliderContainer.html(`
    <span>\\[|\\vec{e}_i|\\]</span>
    <input type="range" id="basis-length" min="10" max="100" value="50" step="1">
    <span id="basis-value">50</span>
`);

// Grid rotation slider
const rotationSliderContainer = sliderContainer.append("div")
    .style("display", "flex")
    .style("align-items", "center")
    .style("gap", "10px");

rotationSliderContainer.html(`
    <span>\\[\\theta\\]</span>
    <input type="range" id="grid-rotation" min="0" max="360" value="0" step="1">
    <span id="rotation-value">0°</span>
`);

// Add reset button container
const resetButtonContainer = sliderContainer.append("div")
    .style("display", "none");

const resetButton = resetButtonContainer
    .append("button")
    .text("Reset Vector")
    .style("padding", "5px 10px")
    .style("cursor", "pointer")
    .style("background-color", "#2c3e50")
    .style("color", "white")
    .style("border", "none")
    .style("border-radius", "4px")
    .style("font-size", "14px")
    .on("click", function () {
        // Reset vector to initial position
        vector.magnitude = initialMagnitude;
        vector.angle = 45;
        updateVector();
        // Hide the reset button
        resetButtonContainer.style("display", "none");
    });

// Add event listener for basis length slider
d3.select("#basis-length").on("input", function () {
    basisVectorLength = +this.value;
    d3.select("#basis-value").text(this.value);
    updateVector();
});

// Add event listener for grid rotation slider
d3.select("#grid-rotation").on("input", function () {
    gridRotation = +this.value;
    d3.select("#rotation-value").text(this.value + "°");
    // Update vector group rotation (negative to compensate)
    vectorGroup.attr("transform", `translate(${centerX},${centerY})`);
    updateVector();
});

// Function to update vector visualization
function updateVector() {
    // Convert angles to radians
    const angleRad = vector.angle * Math.PI / 180;
    const rotationRad = gridRotation * Math.PI / 180;

    // Calculate end point of vector
    const endX = vector.magnitude * Math.cos(angleRad);
    const endY = -vector.magnitude * Math.sin(angleRad); // Negative because SVG y-axis is inverted

    // Calculate components in the rotated basis
    const xComponent = vector.magnitude * Math.cos(angleRad - rotationRad);
    const yComponent = -vector.magnitude * Math.sin(angleRad - rotationRad);

    // Calculate coefficients in terms of basis vectors
    const xCoeff = xComponent / basisVectorLength;
    const yCoeff = yComponent / basisVectorLength;

    // Update the equation text with LaTeX
    const xCoeffText = xCoeff.toFixed(2);
    const yCoeffText = yCoeff.toFixed(2);
    const magnitudeText = vector.magnitude.toFixed(2);
    equationText.html(`\\[\\vec{v} = ${+xCoeffText}\\vec{e}_1 + ${-yCoeffText}\\vec{e}_2 \\]`);

    // Re-render MathJax
    if (window.MathJax) {
        MathJax.typeset([equationText.node()]);
    }

    // Show reset button if vector is not in initial position
    if (vector.magnitude !== initialMagnitude || vector.angle !== 45) {
        resetButtonContainer.style("display", "block");
    } else {
        resetButtonContainer.style("display", "none");
    }

    // Clear previous basis vectors
    vectorGroup.selectAll(".basis-vector").remove();

    // Draw stacked basis vectors for x-component
    const xSteps = Math.abs(xComponent) / basisVectorLength;
    const fullXSteps = Math.floor(xSteps);
    const partialXLength = (xSteps - fullXSteps) * basisVectorLength;
    const sign = Math.sign(xComponent);

    // Draw full unit vectors
    for (let i = 0; i < fullXSteps; i++) {
        const x = i * basisVectorLength * sign * Math.cos(rotationRad);
        const y = -i * basisVectorLength * sign * Math.sin(rotationRad);

        // Draw unit vector
        vectorGroup.append("line")
            .attr("class", "basis-vector")
            .attr("x1", x)
            .attr("y1", y)
            .attr("x2", x + basisVectorLength * sign * Math.cos(rotationRad))
            .attr("y2", y - basisVectorLength * sign * Math.sin(rotationRad))
            .attr("stroke", "#e74c3c")
            .attr("stroke-width", 1.5)
            .attr("stroke-dasharray", "5,5");

        // Draw arrow head
        vectorGroup.append("path")
            .attr("class", "basis-vector")
            .attr("d", `M ${x + basisVectorLength * sign * Math.cos(rotationRad)} ${y - basisVectorLength * sign * Math.sin(rotationRad)} 
                        L ${x + basisVectorLength * sign * Math.cos(rotationRad) - basisArrowSize * Math.cos(rotationRad - Math.PI / 6) * sign} 
                          ${y - basisVectorLength * sign * Math.sin(rotationRad) + basisArrowSize * Math.sin(rotationRad - Math.PI / 6) * sign} 
                        L ${x + basisVectorLength * sign * Math.cos(rotationRad) - basisArrowSize * Math.cos(rotationRad + Math.PI / 6) * sign} 
                          ${y - basisVectorLength * sign * Math.sin(rotationRad) + basisArrowSize * Math.sin(rotationRad + Math.PI / 6) * sign} 
                        Z`)
            .attr("fill", "#e74c3c");
    }

    // Draw partial unit vector if needed
    if (partialXLength > 0) {
        const x = fullXSteps * basisVectorLength * sign * Math.cos(rotationRad);
        const y = -fullXSteps * basisVectorLength * sign * Math.sin(rotationRad);

        // Draw partial unit vector
        vectorGroup.append("line")
            .attr("class", "basis-vector")
            .attr("x1", x)
            .attr("y1", y)
            .attr("x2", x + partialXLength * sign * Math.cos(rotationRad))
            .attr("y2", y - partialXLength * sign * Math.sin(rotationRad))
            .attr("stroke", "#e74c3c")
            .attr("stroke-width", 1.5)
            .attr("stroke-dasharray", "5,5");

        // Draw arrow head
        vectorGroup.append("path")
            .attr("class", "basis-vector")
            .attr("d", `M ${x + partialXLength * sign * Math.cos(rotationRad)} ${y - partialXLength * sign * Math.sin(rotationRad)} 
                        L ${x + partialXLength * sign * Math.cos(rotationRad) - basisArrowSize * Math.cos(rotationRad - Math.PI / 6) * sign} 
                          ${y - partialXLength * sign * Math.sin(rotationRad) + basisArrowSize * Math.sin(rotationRad - Math.PI / 6) * sign} 
                        L ${x + partialXLength * sign * Math.cos(rotationRad) - basisArrowSize * Math.cos(rotationRad + Math.PI / 6) * sign} 
                          ${y - partialXLength * sign * Math.sin(rotationRad) + basisArrowSize * Math.sin(rotationRad + Math.PI / 6) * sign} 
                        Z`)
            .attr("fill", "#e74c3c");
    }

    // Draw stacked basis vectors for y-component
    const ySteps = Math.abs(yComponent) / basisVectorLength;
    const fullYSteps = Math.floor(ySteps);
    const partialYLength = (ySteps - fullYSteps) * basisVectorLength;
    const ySign = Math.sign(yComponent);

    // Draw full unit vectors
    for (let i = 0; i < fullYSteps; i++) {
        const x = i * basisVectorLength * ySign * Math.sin(rotationRad);
        const y = i * basisVectorLength * ySign * Math.cos(rotationRad);

        // Draw unit vector
        vectorGroup.append("line")
            .attr("class", "basis-vector")
            .attr("x1", x)
            .attr("y1", y)
            .attr("x2", x + basisVectorLength * ySign * Math.sin(rotationRad))
            .attr("y2", y + basisVectorLength * ySign * Math.cos(rotationRad))
            .attr("stroke", "#2ecc71")
            .attr("stroke-width", 1.5)
            .attr("stroke-dasharray", "5,5");

        // Draw arrow head
        vectorGroup.append("path")
            .attr("class", "basis-vector")
            .attr("d", `M ${x + basisVectorLength * ySign * Math.sin(rotationRad)} ${y + basisVectorLength * ySign * Math.cos(rotationRad)} 
                        L ${x + basisVectorLength * ySign * Math.sin(rotationRad) - basisArrowSize * Math.sin(rotationRad + Math.PI / 6) * ySign} 
                          ${y + basisVectorLength * ySign * Math.cos(rotationRad) - basisArrowSize * Math.cos(rotationRad + Math.PI / 6) * ySign} 
                        L ${x + basisVectorLength * ySign * Math.sin(rotationRad) - basisArrowSize * Math.sin(rotationRad - Math.PI / 6) * ySign} 
                          ${y + basisVectorLength * ySign * Math.cos(rotationRad) - basisArrowSize * Math.cos(rotationRad - Math.PI / 6) * ySign} 
                        Z`)
            .attr("fill", "#2ecc71");
    }

    // Draw partial unit vector if needed
    if (partialYLength > 0) {
        const x = fullYSteps * basisVectorLength * ySign * Math.sin(rotationRad);
        const y = fullYSteps * basisVectorLength * ySign * Math.cos(rotationRad);

        // Draw partial unit vector
        vectorGroup.append("line")
            .attr("class", "basis-vector")
            .attr("x1", x)
            .attr("y1", y)
            .attr("x2", x + partialYLength * ySign * Math.sin(rotationRad))
            .attr("y2", y + partialYLength * ySign * Math.cos(rotationRad))
            .attr("stroke", "#2ecc71")
            .attr("stroke-width", 1.5)
            .attr("stroke-dasharray", "5,5");

        // Draw arrow head
        vectorGroup.append("path")
            .attr("class", "basis-vector")
            .attr("d", `M ${x + partialYLength * ySign * Math.sin(rotationRad)} ${y + partialYLength * ySign * Math.cos(rotationRad)} 
                        L ${x + partialYLength * ySign * Math.sin(rotationRad) - basisArrowSize * Math.sin(rotationRad + Math.PI / 6) * ySign} 
                          ${y + partialYLength * ySign * Math.cos(rotationRad) - basisArrowSize * Math.cos(rotationRad + Math.PI / 6) * ySign} 
                        L ${x + partialYLength * ySign * Math.sin(rotationRad) - basisArrowSize * Math.sin(rotationRad - Math.PI / 6) * ySign} 
                          ${y + partialYLength * ySign * Math.cos(rotationRad) - basisArrowSize * Math.cos(rotationRad - Math.PI / 6) * ySign} 
                        Z`)
            .attr("fill", "#2ecc71");
    }

    // Update the main vector line
    line.attr("x2", endX)
        .attr("y2", endY);

    // Update the main vector arrow head
    const arrowPath = `M ${endX} ${endY} 
                      L ${endX - mainArrowSize * Math.cos(angleRad - Math.PI / 6)} ${endY + mainArrowSize * Math.sin(angleRad - Math.PI / 6)} 
                      L ${endX - mainArrowSize * Math.cos(angleRad + Math.PI / 6)} ${endY + mainArrowSize * Math.sin(angleRad + Math.PI / 6)} 
                      Z`;

    // Update the arrow head
    arrow.attr("d", arrowPath);

    // Update the arrow background
    arrowBackground.attr("d", arrowPath);
}

// Draw the main vector line
const line = vectorGroup.append("line")
    .attr("x1", vector.x)
    .attr("y1", vector.y)
    .attr("stroke", "#2c3e50")
    .attr("stroke-width", 2);

// Add main vector arrow head background (for better clickability)
const arrowBackground = vectorGroup.append("path")
    .attr("fill", "rgba(44, 62, 80, 0.2)") // Semi-transparent background
    .attr("stroke", "none");

// Add main vector arrow head
const arrow = vectorGroup.append("path")
    .attr("fill", "#2c3e50")
    .call(d3.drag()
        .on("drag", function (event) {
            // Get the mouse position relative to the center
            const dx = event.x;
            const dy = -event.y; // Invert y-axis

            // Calculate magnitude and angle
            vector.magnitude = Math.sqrt(dx * dx + dy * dy);
            vector.angle = Math.atan2(dy, dx) * 180 / Math.PI;

            // Update the visualization
            updateVector();
        }));

// Initial vector update
updateVector(); 