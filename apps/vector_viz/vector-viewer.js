// Add MathJax script to the head
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
script.async = true;
document.head.appendChild(script);

// Set up the SVG container
const margin = { top: 0, right: 0, bottom: 0, left: 0 };
const maxWidth = window.innerWidth;
const maxHeight = window.innerHeight;
let width = maxWidth;
let height = maxHeight;

// Grid dimensions (much larger than visible area)
const gridWidth = width * 10;
const gridHeight = height * 10;

const initialMagnitude = Math.sqrt(50);

// Calculate the center of the SVG
let centerX = width / 2;
let centerY = height / 2;

// Create a sample vector
let vector = {
    x: 0,  // Fixed at origin
    y: 0,  // Fixed at origin
    magnitude: initialMagnitude,
    angle: 45 // in degrees
};

// Basis vector length (will be controlled by slider)
let basisVectorLength1 = 1;
let basisVectorLength2 = 1;

// Function to update modal content
function updateModalContent() {
    // Calculate components
    const angleRad = vector.angle * Math.PI / 180;
    const xComponent = vector.magnitude * Math.cos(angleRad);
    const yComponent = vector.magnitude * Math.sin(angleRad);
    const xCoeff = xComponent / basisVectorLength1;
    const yCoeff = yComponent / basisVectorLength2;
    const v1 = xCoeff * basisVectorLength1 * basisVectorLength1;
    const v2 = yCoeff * basisVectorLength2 * basisVectorLength2;

    equationsDiv.html(`
        <p>The metric tensor \\(g_{ij}\\) relates contravariant components \\(V^i\\) to covariant components \\(V_i\\):</p>
        <p>\\[V_i = g_{ij}V^j\\]</p>
        <p>In our case, with orthogonal basis vectors:</p>
        <p>\\[g_{ij} = \\begin{pmatrix} |\\vec{e}_1|^2 & 0 \\\\ 0 & |\\vec{e}_2|^2 \\end{pmatrix} = \\begin{pmatrix} ${(basisVectorLength1 * basisVectorLength1).toFixed(2)} & 0 \\\\ 0 & ${(basisVectorLength2 * basisVectorLength2).toFixed(2)} \\end{pmatrix}\\]</p>
        <p>The inverse metric tensor \\(g^{ij}\\) is used to convert covariant components back to contravariant:</p>
        <p>\\[V^i = g^{ij}V_j\\]</p>
        <p>For orthogonal basis vectors:</p>
        <p>\\[g^{ij} = \\begin{pmatrix} \\frac{1}{|\\vec{e}_1|^2} & 0 \\\\ 0 & \\frac{1}{|\\vec{e}_2|^2} \\end{pmatrix} = \\begin{pmatrix} ${(1 / (basisVectorLength1 * basisVectorLength1)).toFixed(2)} & 0 \\\\ 0 & ${(1 / (basisVectorLength2 * basisVectorLength2)).toFixed(2)} \\end{pmatrix}\\]</p>
        <p>Current vector components:</p>
        <p>First, we calculate the components in the standard basis:</p>
        <p>\\[V_x = |\\vec{V}|\\cos\\theta = ${vector.magnitude.toFixed(2)} \\cdot \\cos(${vector.angle.toFixed(2)}°) = ${xComponent.toFixed(2)}\\]</p>
        <p>\\[V_y = |\\vec{V}|\\sin\\theta = ${vector.magnitude.toFixed(2)} \\cdot \\sin(${vector.angle.toFixed(2)}°) = ${yComponent.toFixed(2)}\\]</p>
        <p>Then, we calculate the contravariant components \\(V^i\\) by dividing by the basis vector lengths:</p>
        <p>\\[V^1 = \\frac{V_x}{|\\vec{e}_1|} = \\frac{${xComponent.toFixed(2)}}{${basisVectorLength1.toFixed(2)}} = ${xCoeff.toFixed(2)}\\]</p>
        <p>\\[V^2 = \\frac{V_y}{|\\vec{e}_2|} = \\frac{${yComponent.toFixed(2)}}{${basisVectorLength2.toFixed(2)}} = ${yCoeff.toFixed(2)}\\]</p>
        <p>Finally, we calculate the covariant components \\(V_i\\) using the metric tensor:</p>
        <p>\\[V_1 = g_{11}V^1 = ${(basisVectorLength1 * basisVectorLength1).toFixed(2)} \\cdot ${xCoeff.toFixed(2)} = ${v1.toFixed(2)}\\]</p>
        <p>\\[V_2 = g_{22}V^2 = ${(basisVectorLength2 * basisVectorLength2).toFixed(2)} \\cdot ${yCoeff.toFixed(2)} = ${v2.toFixed(2)}\\]</p>
        <p>Therefore:</p>
        <p>Contravariant components: \\(V^i = (${xCoeff.toFixed(2)}, ${yCoeff.toFixed(2)})\\)</p>
        <p>Covariant components: \\(V_i = (${v1.toFixed(2)}, ${v2.toFixed(2)})\\)</p>
    `);
    if (window.MathJax) {
        MathJax.typeset([equationsDiv.node()]);
    }
}

// Add title container
const titleContainer = d3.select("#vector-container")
    .append("div")
    .style("text-align", "center")
    .style("margin-bottom", "20px")
    .style("position", "relative");

// Add equation text as title
const equationText = titleContainer.append("div")
    .style("font-size", "20px")
    .style("font-family", "Arial")
    .attr("id", "vector-equation");

// Add covariant components display
const covariantText = titleContainer.append("div")
    .style("font-size", "20px")
    .style("font-family", "Arial")
    .attr("id", "covariant-components");

// Add info button to theme toggle container
const infoButton = d3.select(".theme-toggle")
    .append("button")
    .attr("id", "info-btn")
    .on("click", function () {
        updateModalContent();
        modal.style("display", "block");
    });

// Add info icon SVG
infoButton.append("svg")
    .attr("viewBox", "0 0 24 24")
    .attr("fill", "var(--text-color)")
    .html(`
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
    `);

// Add modal
const modal = d3.select("body")
    .append("div")
    .style("display", "none")
    .style("position", "fixed")
    .style("z-index", "9999")  // Ensure it's above everything
    .style("left", "0")
    .style("top", "0")
    .style("width", "100%")
    .style("height", "100%")
    .style("background-color", "rgba(0,0,0,0.7)")  // Darker overlay
    .style("overflow", "auto")  // Allow scrolling if content is too long
    .style("backdrop-filter", "blur(5px)")  // Add blur effect to background
    .on("click", function (event) {
        // Close modal when clicking the overlay (but not the content)
        if (event.target === this) {
            modal.style("display", "none");
        }
    });

// Add keyboard event listener for Escape key
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal.style("display") === "block") {
        modal.style("display", "none");
    }
});

const modalContent = modal.append("div")
    .style("background-color", "var(--container-bg)")
    .style("margin", "5% auto")  // Reduced top margin
    .style("padding", "30px")
    .style("border", "1px solid var(--border-color)")
    .style("width", "90%")
    .style("max-width", "800px")
    .style("border-radius", "8px")
    .style("box-shadow", "0 4px 6px rgba(0, 0, 0, 0.1)")
    .style("position", "relative")  // For positioning the close button
    .style("color", "var(--text-color)");

const closeButton = modalContent.append("button")
    .style("position", "absolute")
    .style("right", "15px")
    .style("top", "15px")
    .style("font-size", "24px")
    .style("font-weight", "bold")
    .style("background", "none")
    .style("border", "none")
    .style("cursor", "pointer")
    .style("color", "var(--text-color)")
    .style("padding", "5px 10px")
    .style("border-radius", "4px")
    .style("transition", "background-color 0.2s")
    .text("×")
    .on("mouseover", function () {
        d3.select(this)
            .style("background-color", "var(--button-hover)")
            .style("color", "var(--text-color)");
    })
    .on("mouseout", function () {
        d3.select(this)
            .style("background-color", "transparent")
            .style("color", "var(--text-color)");
    })
    .on("click", function () {
        modal.style("display", "none");
    });

modalContent.append("h2")
    .style("margin-top", "0")
    .style("margin-bottom", "20px")
    .style("color", "var(--text-color)")
    .text("Metric Tensor Calculations");

const equationsDiv = modalContent.append("div")
    .style("margin-top", "20px")
    .style("line-height", "1.6")
    .style("color", "var(--text-color)");

// Initial modal content
updateModalContent();

// Add metric tensor display
const metricTensorText = titleContainer.append("div")
    .style("font-size", "20px")
    .style("font-family", "Arial")
    .attr("id", "metric-tensor")

// Add dual metric tensor display
const dualMetricTensorText = titleContainer.append("div")
    .style("font-size", "20px")
    .style("font-family", "Arial")
    .attr("id", "dual-metric-tensor")

const svg = d3.select("#vector-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("background-color", "var(--bg-color)");

// Create a group for the grid and axes
const gridGroup = svg.append("g")
    .attr("transform", `translate(${centerX},${centerY})`);

// Create a group for the vector and basis vectors
const vectorGroup = svg.append("g")
    .attr("transform", `translate(${centerX},${centerY})`);

// Function to handle window resize
function handleResize() {
    // Update dimensions to use full window
    width = window.innerWidth;
    height = window.innerHeight;

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
const gridSize = 1; // Changed from 50 to 1 for unit grid

// Add scaling factors for converting between grid units and pixels
const scale = Math.min(width, height) / 15; // Adjusted scale factor for better visibility

const xAxis = d3.axisBottom(d3.scaleLinear()
    .domain([-100, 100])
    .range([-100 * scale, 100 * scale]))
    .ticks(200)  // One tick per unit
    .tickFormat(d => d % 1 === 0 ? d : "");  // Only show labels at integer values

const yAxis = d3.axisLeft(d3.scaleLinear()
    .domain([-100, 100])
    .range([100 * scale, -100 * scale]))
    .ticks(200)  // One tick per unit
    .tickFormat(d => d % 1 === 0 ? d : "");  // Only show labels at integer values

// Add grid lines
for (let i = -100; i <= 100; i += gridSize) {
    gridGroup.append("line")
        .attr("x1", i * scale)
        .attr("y1", -height)
        .attr("x2", i * scale)
        .attr("y2", height)
        .attr("stroke", "#ddd")
        .attr("stroke-width", 0.5);
}

for (let i = -100; i <= 100; i += gridSize) {
    gridGroup.append("line")
        .attr("x1", -width)
        .attr("y1", i * scale)
        .attr("x2", width)
        .attr("y2", i * scale)
        .attr("stroke", "#ddd")
        .attr("stroke-width", 0.5);
}

// Add axes
gridGroup.append("g")
    .call(xAxis);

gridGroup.append("g")
    .call(yAxis);

// Arrow sizes
const mainArrowSize = 1; // Changed from 0.2 to 0.4 (40% of a unit)
const basisArrowSize = 0.3; // Changed from 0.1 to 0.3 (30% of a unit)

// Add slider for basis vector length
const sliderContainer = d3.select("#vector-container")
    .append("div")
    .style("margin-top", "20px")
    .style("text-align", "center")
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("align-items", "center")
    .style("gap", "20px");

// Basis vector length slider for e_1
const lengthSliderContainer1 = sliderContainer.append("div")
    .style("display", "flex")
    .style("align-items", "center")
    .style("gap", "10px");

lengthSliderContainer1.html(`
    <span>\\[|\\vec{e}_1|\\]</span>
    <input type="range" id="basis-length-1" min="0.1" max="2" value="1" step="0.1">
    <span id="basis-value-1">1</span>
`);

// Basis vector length slider for e_2
const lengthSliderContainer2 = sliderContainer.append("div")
    .style("display", "flex")
    .style("align-items", "center")
    .style("gap", "10px");

lengthSliderContainer2.html(`
    <span>\\[|\\vec{e}_2|\\]</span>
    <input type="range" id="basis-length-2" min="0.1" max="2" value="1" step="0.1">
    <span id="basis-value-2">1</span>
`);

// Add event listener for e_1 length slider
d3.select("#basis-length-1").on("input", function () {
    basisVectorLength1 = +this.value;
    d3.select("#basis-value-1").text(this.value);
    updateVector();
    updateModalContent();
});

// Add event listener for e_2 length slider
d3.select("#basis-length-2").on("input", function () {
    basisVectorLength2 = +this.value;
    d3.select("#basis-value-2").text(this.value);
    updateVector();
    updateModalContent();
});

// Function to update vector visualization
function updateVector() {
    // Convert angles to radians
    const angleRad = vector.angle * Math.PI / 180;

    // Calculate end point of vector in grid units
    const endX = vector.magnitude * Math.cos(angleRad);
    const endY = -vector.magnitude * Math.sin(angleRad); // Negative because SVG y-axis is inverted

    // Calculate components in the basis
    const xComponent = vector.magnitude * Math.cos(angleRad);
    const yComponent = vector.magnitude * Math.sin(angleRad);

    // Calculate coefficients in terms of basis vectors
    const xCoeff = xComponent / basisVectorLength1;
    const yCoeff = yComponent / basisVectorLength2;

    // Update the equation text with LaTeX
    const xCoeffText = xCoeff.toFixed(2);
    const yCoeffText = yCoeff.toFixed(2);
    equationText.html(`\\[V^i = (${xCoeffText}, ${yCoeffText})\\]`);

    // Calculate and update covariant components
    const v1 = (xCoeff * basisVectorLength1 * basisVectorLength1).toFixed(2);
    const v2 = (yCoeff * basisVectorLength2 * basisVectorLength2).toFixed(2);
    covariantText.html(`\\[V_i = (${v1}, ${v2})\\]`);

    // Update the metric tensor display
    const g11 = basisVectorLength1 * basisVectorLength1;
    const g22 = basisVectorLength2 * basisVectorLength2;
    // metricTensorText.html(`\\[g_{ij} = \\begin{pmatrix} ${g11.toFixed(2)} & 0 \\\\ 0 & ${g22.toFixed(2)} \\end{pmatrix}\\]`);

    // Calculate and update the dual metric tensor (inverse)
    const g11_inv = (1 / g11).toFixed(2);
    const g22_inv = (1 / g22).toFixed(2);
    // dualMetricTensorText.html(`\\[g^{ij} = \\begin{matrix} ${g11_inv} & 0 \\\\ 0 & ${g22_inv} \\end{matrix}\\]`);

    // Re-render MathJax for all equations
    if (window.MathJax) {
        MathJax.typeset([equationText.node(), metricTensorText.node(), dualMetricTensorText.node(), covariantText.node()]);
    }

    // Clear previous basis vectors
    vectorGroup.selectAll(".basis-vector").remove();

    // Draw stacked basis vectors for x-component
    const xSteps = Math.abs(xComponent) / basisVectorLength1;
    const fullXSteps = Math.floor(xSteps);
    const partialXLength = (xSteps - fullXSteps) * basisVectorLength1;
    const sign = Math.sign(xComponent);

    // Draw full unit vectors for e_1
    for (let i = 0; i < fullXSteps; i++) {
        const x = i * basisVectorLength1 * sign * scale;
        const y = 0;

        // Draw unit vector
        vectorGroup.append("line")
            .attr("class", "basis-vector")
            .attr("x1", x)
            .attr("y1", y)
            .attr("x2", x + basisVectorLength1 * sign * scale)
            .attr("y2", y)
            .attr("stroke", "#e74c3c")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5");

        // Draw arrow head
        vectorGroup.append("path")
            .attr("class", "basis-vector")
            .attr("d", `M ${x + basisVectorLength1 * sign * scale} ${y} 
                        L ${x + basisVectorLength1 * sign * scale - basisArrowSize * sign * scale} ${y - basisArrowSize * scale} 
                        L ${x + basisVectorLength1 * sign * scale - basisArrowSize * sign * scale} ${y + basisArrowSize * scale} 
                        Z`)
            .attr("fill", "#e74c3c");
    }

    // Draw partial unit vector if needed for e_1
    if (partialXLength > 0) {
        const x = fullXSteps * basisVectorLength1 * sign * scale;
        const y = 0;

        // Draw partial unit vector
        vectorGroup.append("line")
            .attr("class", "basis-vector")
            .attr("x1", x)
            .attr("y1", y)
            .attr("x2", x + partialXLength * sign * scale)
            .attr("y2", y)
            .attr("stroke", "#e74c3c")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5");

        // Draw arrow head
        vectorGroup.append("path")
            .attr("class", "basis-vector")
            .attr("d", `M ${x + partialXLength * sign * scale} ${y} 
                        L ${x + partialXLength * sign * scale - basisArrowSize * sign * scale} ${y - basisArrowSize * scale} 
                        L ${x + partialXLength * sign * scale - basisArrowSize * sign * scale} ${y + basisArrowSize * scale} 
                        Z`)
            .attr("fill", "#e74c3c");
    }

    // Draw stacked basis vectors for y-component
    const ySteps = Math.abs(yComponent) / basisVectorLength2;
    const fullYSteps = Math.floor(ySteps);
    const partialYLength = (ySteps - fullYSteps) * basisVectorLength2;
    const ySign = Math.sign(yComponent);

    // Draw full unit vectors for e_2
    for (let i = 0; i < fullYSteps; i++) {
        const x = 0;
        const y = -i * basisVectorLength2 * ySign * scale;

        // Draw unit vector
        vectorGroup.append("line")
            .attr("class", "basis-vector")
            .attr("x1", x)
            .attr("y1", y)
            .attr("x2", x)
            .attr("y2", y - basisVectorLength2 * ySign * scale)
            .attr("stroke", "#2ecc71")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5");

        // Draw arrow head
        vectorGroup.append("path")
            .attr("class", "basis-vector")
            .attr("d", `M ${x} ${y - basisVectorLength2 * ySign * scale} 
                        L ${x - basisArrowSize * scale} ${y - basisVectorLength2 * ySign * scale + basisArrowSize * ySign * scale} 
                        L ${x + basisArrowSize * scale} ${y - basisVectorLength2 * ySign * scale + basisArrowSize * ySign * scale} 
                        Z`)
            .attr("fill", "#2ecc71");
    }

    // Draw partial unit vector if needed for e_2
    if (partialYLength > 0) {
        const x = 0;
        const y = -fullYSteps * basisVectorLength2 * ySign * scale;

        // Draw partial unit vector
        vectorGroup.append("line")
            .attr("class", "basis-vector")
            .attr("x1", x)
            .attr("y1", y)
            .attr("x2", x)
            .attr("y2", y - partialYLength * ySign * scale)
            .attr("stroke", "#2ecc71")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5");

        // Draw arrow head
        vectorGroup.append("path")
            .attr("class", "basis-vector")
            .attr("d", `M ${x} ${y - partialYLength * ySign * scale} 
                        L ${x - basisArrowSize * scale} ${y - partialYLength * ySign * scale + basisArrowSize * ySign * scale} 
                        L ${x + basisArrowSize * scale} ${y - partialYLength * ySign * scale + basisArrowSize * ySign * scale} 
                        Z`)
            .attr("fill", "#2ecc71");
    }

    // Update the main vector line
    line.attr("x2", endX * scale)
        .attr("y2", endY * scale);

    // Update the main vector arrow head
    const arrowPath = `M ${endX * scale} ${endY * scale} 
                      L ${endX * scale - mainArrowSize * Math.cos(angleRad - Math.PI / 6) * scale} ${endY * scale + mainArrowSize * Math.sin(angleRad - Math.PI / 6) * scale} 
                      L ${endX * scale - mainArrowSize * Math.cos(angleRad + Math.PI / 6) * scale} ${endY * scale + mainArrowSize * Math.sin(angleRad + Math.PI / 6) * scale} 
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
    .attr("stroke", "#00ff00")  // Bright green
    .attr("stroke-width", 2);

// Add main vector arrow head background (for better clickability)
const arrowBackground = vectorGroup.append("path")
    .attr("fill", "rgba(0, 255, 0, 0.2)") // Semi-transparent green background
    .attr("stroke", "none");

// Add main vector arrow head
const arrow = vectorGroup.append("path")
    .attr("fill", "#00ff00")  // Bright green
    .call(d3.drag()
        .on("drag", function (event) {
            // Get the mouse position relative to the center
            const dx = event.x / scale; // Scale to grid units
            const dy = -event.y / scale; // Scale to grid units and invert y-axis

            // Snap to grid points (round to nearest integer)
            const snappedDx = Math.round(dx);
            const snappedDy = Math.round(dy);

            // Calculate magnitude and angle using snapped coordinates
            vector.magnitude = Math.sqrt(snappedDx * snappedDx + snappedDy * snappedDy);
            vector.angle = Math.atan2(snappedDy, snappedDx) * 180 / Math.PI;

            // Calculate the offset between mouse and snapped position
            const offsetX = snappedDx - dx;
            const offsetY = snappedDy - dy;

            // Adjust the mouse position to stay on the vector head
            event.x += offsetX * scale;
            event.y -= offsetY * scale;

            // Update the visualization
            updateVector();
        }));

// Initial vector update
updateVector(); 