async function detectlocation() {
    const welcomeElement = document.getElementById('welcome');
    const locationElement = document.getElementById('location');

    try {
        const response = await fetch('http://ip-api.com/json/?fields=status,message,country,countryCode,region,regionName,city');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === 'success') {
            // Figure out the closest location
            let locationName = 'the UK'; // Default location

            if (data.city && data.city.toLowerCase() !== 'unknown') {
                locationName = data.city;
            }
            else if (data.regionName && data.regionName.toLowerCase() !== 'unknown') {
                locationName = data.regionName;
            }
            else if (data.country) {
                locationName = data.country;
            }

            welcomeElement.textContent = `Welcome to ${locationName}`;
            locationElement.textContent = '';

        } else {
            throw new Error(data.message || 'Failed to retrieve location data');
        }
    } catch (error) {
        console.error('Error fetching location data:', error);

        // Try fallback to a less precise method
        try {
            const fallbackResponse = await fetch('https://ipinfo.io/json/');
            const fallbackData = await fallbackResponse.json();

            if (fallbackData.city) {
                welcomeElement.textContent = `Welcome to ${fallbackData.city}`;
                locationElement.textContent = '';
                return;
            }
        } catch (fallbackError) {
            console.error('Fallback error fetching location data:', fallbackError);
        }

        // Default to the UK if all else fails
        welcomeElement.textContent = 'Welcome to the UK';
        locationElement.textContent = '';
    }
}

    window.addEventListener('load', detectlocation);