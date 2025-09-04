async function detectlocation() {
  const welcomeElement = document.getElementById("welcome");
  const locationElement = document.getElementById("location");

  try {
    const response = await fetch(
      "http://ip-api.com/json/?fields=status,message,country,countryCode,region,regionName,city"
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === "success") {
      let locationName = "the UK"; // Default location

      // Check if this is a UK location
      if (data.countryCode === "GB" || data.country === "United Kingdom") {
        // For UK locations, prioritize city over region (since region is often just "England")
        if (data.city && data.city.toLowerCase() !== "unknown") {
          locationName = data.city;
        } else if (data.regionName && data.regionName.toLowerCase() !== "unknown" && data.regionName !== "England" && data.regionName !== "Scotland" && data.regionName !== "Wales" && data.regionName !== "Northern Ireland") {
          // Only use regionName if it's more specific than country parts
          locationName = data.regionName;
        } else if (data.region && data.region.toLowerCase() !== "unknown") {
          locationName = data.region;
        }
      } else {
        // For non-UK locations, use city first
        if (data.city && data.city.toLowerCase() !== "unknown") {
          locationName = data.city;
        } else if (
          data.regionName &&
          data.regionName.toLowerCase() !== "unknown"
        ) {
          locationName = data.regionName;
        } else if (data.country) {
          locationName = data.country;
        }
      }
      
      welcomeElement.textContent = `Welcome to ${locationName}`;
      locationElement.textContent = "";
    } else {
      throw new Error(data.message || "Failed to retrieve location data");
    }
  } catch (error) {
    console.error("Error fetching location data:", error);

    // Try fallback service
    try {
      const fallbackResponse = await fetch("https://ipapi.co/json/");
      const fallbackData = await fallbackResponse.json();

      if (fallbackData.country === "GB") {
        // For UK, prioritize city over region
        if (fallbackData.city && fallbackData.city !== "unknown") {
          welcomeElement.textContent = `Welcome to ${fallbackData.city}`;
          locationElement.textContent = "";
          return;
        } else if (fallbackData.region && fallbackData.region !== "unknown") {
          welcomeElement.textContent = `Welcome to ${fallbackData.region}`;
          locationElement.textContent = "";
          return;
        }
      } else if (fallbackData.city) {
        welcomeElement.textContent = `Welcome to ${fallbackData.city}`;
        locationElement.textContent = "";
        return;
      }
    } catch (fallbackError) {
      console.error("Fallback error fetching location data:", fallbackError);
    }

    // Default to the UK
    welcomeElement.textContent = "Welcome to the UK";
    locationElement.textContent = "";
  }
}

window.addEventListener("load", detectlocation);