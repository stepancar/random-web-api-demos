export async function inlineSVG(url, targetElement) {
    try {
        // Fetch the SVG file
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Get the SVG text content
        const svgText = await response.text();

        // Create a div element to parse the SVG content
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
        const svgElement = svgDoc.documentElement;
        targetElement.appendChild(svgElement);

    } catch (error) {
        console.error('Error inlining SVG:', error);
    }
}