async function detectlocation() {
  const welcomeElement = document.getElementById("welcome");
  const locationElement = document.getElementById("location");

  if ("geolocation" in navigator) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000,
          maximumAge: 300000
        });
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`,
        {
          headers: {
            'User-Agent': 'LocationWelcome/1.0'
          }
        }
      );
      const data = await response.json();
      
      const locationName = data.address.town || 
                          data.address.city || 
                          data.address.village || 
                          data.address.suburb ||
                          data.address.county || 
                          "the UK";
      
      welcomeElement.textContent = `Welcome to ${locationName}`;
      locationElement.textContent = "";
      return;
    } catch (geoError) {
      console.log("Geolocation not available or denied:", geoError.message);
    }
  }

  try {
    const response = await fetch(
      "http://ip-api.com/json/?fields=status,message,country,countryCode,region,regionName,city"
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === "success") {
      let locationName = "the UK";

      if (data.countryCode === "GB" || data.country === "United Kingdom") {
        if (data.city && data.city.toLowerCase() !== "unknown") {
          locationName = data.city;
        } else if (data.regionName && data.regionName.toLowerCase() !== "unknown") {
          locationName = data.regionName;
        } else if (data.region && data.region.toLowerCase() !== "unknown") {
          locationName = data.region;
        }
      } else {
        if (data.city && data.city.toLowerCase() !== "unknown") {
          locationName = data.city;
        } else if (data.regionName && data.regionName.toLowerCase() !== "unknown") {
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

    try {
      const fallbackResponse = await fetch("https://ipapi.co/json/");
      const fallbackData = await fallbackResponse.json();

      if (fallbackData.city && fallbackData.city !== "unknown") {
        welcomeElement.textContent = `Welcome to ${fallbackData.city}`;
      } else if (fallbackData.region && fallbackData.region !== "unknown") {
        welcomeElement.textContent = `Welcome to ${fallbackData.region}`;
      } else {
        welcomeElement.textContent = "Welcome to the UK";
      }
      locationElement.textContent = "";
    } catch (fallbackError) {
      console.error("Fallback error:", fallbackError);
      welcomeElement.textContent = "Welcome to the UK";
      locationElement.textContent = "";
    }
  }
}

window.addEventListener("load", detectlocation);
