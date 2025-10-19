// Weather Dashboard JavaScript
class WeatherDashboard {
    constructor() {
        this.apiKey = 'YOUR_API_KEY'; // Replace with your OpenWeatherMap API key
        this.baseURL = 'https://api.openweathermap.org/data/2.5';
        this.currentCity = 'Tehran';
        this.currentData = null;
        this.forecastData = null;
        
        this.initializeElements();
        this.bindEvents();
        this.initializeApp();
    }

    initializeElements() {
        this.cityInput = document.getElementById('cityInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.locationBtn = document.getElementById('locationBtn');
        this.loading = document.getElementById('loading');
        this.errorMessage = document.getElementById('errorMessage');
        
        // Current weather elements
        this.cityName = document.getElementById('cityName');
        this.currentDate = document.getElementById('currentDate');
        this.weatherIcon = document.getElementById('weatherIcon');
        this.currentTemp = document.getElementById('currentTemp');
        this.weatherDesc = document.getElementById('weatherDesc');
        this.humidity = document.getElementById('humidity');
        this.windSpeed = document.getElementById('windSpeed');
        this.feelsLike = document.getElementById('feelsLike');
        this.pressure = document.getElementById('pressure');
        
        // Forecast container
        this.forecastContainer = document.getElementById('forecastContainer');
    }

    bindEvents() {
        this.searchBtn.addEventListener('click', () => this.searchWeather());
        this.locationBtn.addEventListener('click', () => this.getCurrentLocation());
        this.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchWeather();
            }
        });
    }

    async initializeApp() {
        this.showLoading();
        try {
            await this.loadWeatherData(this.currentCity);
            this.updateCurrentDate();
        } catch (error) {
            this.showError('خطا در بارگذاری اطلاعات آب و هوا');
        } finally {
            this.hideLoading();
        }
    }

    async searchWeather() {
        const city = this.cityInput.value.trim();
        if (!city) {
            this.showError('لطفاً نام شهر را وارد کنید');
            return;
        }

        this.showLoading();
        try {
            await this.loadWeatherData(city);
            this.cityInput.value = '';
        } catch (error) {
            this.showError('شهر مورد نظر یافت نشد');
        } finally {
            this.hideLoading();
        }
    }

    async getCurrentLocation() {
        if (!navigator.geolocation) {
            this.showError('موقعیت جغرافیایی پشتیبانی نمی‌شود');
            return;
        }

        this.showLoading();
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    await this.loadWeatherByCoordinates(latitude, longitude);
                } catch (error) {
                    this.showError('خطا در دریافت موقعیت');
                } finally {
                    this.hideLoading();
                }
            },
            (error) => {
                this.showError('دسترسی به موقعیت جغرافیایی رد شد');
                this.hideLoading();
            }
        );
    }

    async loadWeatherData(city) {
        try {
            // For demo purposes, we'll use mock data since we don't have a real API key
            // In production, replace this with actual API calls
            const mockData = this.getMockWeatherData(city);
            this.currentData = mockData.current;
            this.forecastData = mockData.forecast;
            
            this.updateCurrentWeather();
            this.updateForecast();
            this.hideError();
        } catch (error) {
            throw new Error('Failed to load weather data');
        }
    }

    async loadWeatherByCoordinates(lat, lon) {
        // Mock implementation for coordinates
        const mockData = this.getMockWeatherData('تهران');
        this.currentData = mockData.current;
        this.forecastData = mockData.forecast;
        
        this.updateCurrentWeather();
        this.updateForecast();
        this.hideError();
    }

    getMockWeatherData(city) {
        const cities = {
            'تهران': { name: 'تهران', country: 'ایران' },
            'Tehran': { name: 'تهران', country: 'ایران' },
            'اصفهان': { name: 'اصفهان', country: 'ایران' },
            'مشهد': { name: 'مشهد', country: 'ایران' },
            'شیراز': { name: 'شیراز', country: 'ایران' },
            'تبریز': { name: 'تبریز', country: 'ایران' }
        };

        const cityInfo = cities[city] || { name: city, country: 'ایران' };
        
        return {
            current: {
                name: cityInfo.name,
                country: cityInfo.country,
                temp: Math.floor(Math.random() * 15) + 15, // 15-30°C
                description: this.getRandomWeatherDescription(),
                icon: this.getWeatherIcon('sunny'),
                humidity: Math.floor(Math.random() * 30) + 40, // 40-70%
                windSpeed: Math.floor(Math.random() * 15) + 5, // 5-20 km/h
                feelsLike: Math.floor(Math.random() * 15) + 15,
                pressure: Math.floor(Math.random() * 50) + 1000 // 1000-1050 hPa
            },
            forecast: this.generateMockForecast()
        };
    }

    generateMockForecast() {
        const days = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه'];
        const descriptions = ['آفتابی', 'نیمه‌ابری', 'ابری', 'بارانی', 'بارش باران'];
        
        return days.map((day, index) => ({
            day: day,
            date: this.getFutureDate(index + 1),
            temp: Math.floor(Math.random() * 15) + 15,
            description: descriptions[Math.floor(Math.random() * descriptions.length)],
            icon: this.getWeatherIcon('sunny'),
            humidity: Math.floor(Math.random() * 30) + 40,
            windSpeed: Math.floor(Math.random() * 15) + 5
        }));
    }

    getRandomWeatherDescription() {
        const descriptions = ['آفتابی', 'نیمه‌ابری', 'ابری', 'بارانی', 'بارش باران'];
        return descriptions[Math.floor(Math.random() * descriptions.length)];
    }

    getWeatherIcon(condition) {
        const icons = {
            'sunny': 'fa-sun',
            'cloudy': 'fa-cloud',
            'rainy': 'fa-cloud-rain',
            'partly-cloudy': 'fa-cloud-sun',
            'night': 'fa-cloud-moon',
            'snow': 'fa-snowflake',
            'storm': 'fa-bolt',
            'fog': 'fa-smog'
        };
        return icons[condition] || 'fa-sun';
    }

    getFutureDate(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toLocaleDateString('fa-IR');
    }

    updateCurrentWeather() {
        if (!this.currentData) return;

        this.cityName.textContent = this.currentData.name;
        this.currentTemp.textContent = this.currentData.temp;
        this.weatherDesc.textContent = this.currentData.description;
        this.weatherIcon.className = `fas ${this.currentData.icon}`;
        this.humidity.textContent = `${this.currentData.humidity}%`;
        this.windSpeed.textContent = `${this.currentData.windSpeed} km/h`;
        this.feelsLike.textContent = `${this.currentData.feelsLike}°C`;
        this.pressure.textContent = `${this.currentData.pressure} hPa`;
    }

    updateForecast() {
        if (!this.forecastData) return;

        this.forecastContainer.innerHTML = '';
        
        this.forecastData.forEach(day => {
            const card = document.createElement('div');
            card.className = 'forecast-card';
            card.innerHTML = `
                <div class="forecast-day">${day.day}</div>
                <div class="forecast-date">${day.date}</div>
                <div class="forecast-icon">
                    <i class="fas ${day.icon}"></i>
                </div>
                <div class="forecast-temp">${day.temp}°C</div>
                <div class="forecast-desc">${day.description}</div>
                <div class="forecast-details">
                    <span><i class="fas fa-tint"></i> ${day.humidity}%</span>
                    <span><i class="fas fa-wind"></i> ${day.windSpeed} km/h</span>
                </div>
            `;
            this.forecastContainer.appendChild(card);
        });
    }

    updateCurrentDate() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        this.currentDate.textContent = now.toLocaleDateString('fa-IR', options);
    }

    showLoading() {
        this.loading.classList.add('show');
    }

    hideLoading() {
        this.loading.classList.remove('show');
    }

    showError(message) {
        this.errorMessage.querySelector('p').textContent = message;
        this.errorMessage.classList.add('show');
    }

    hideError() {
        this.errorMessage.classList.remove('show');
    }
}

// Initialize the weather dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new WeatherDashboard();
});

// Add some interactive features
document.addEventListener('DOMContentLoaded', () => {
    // Add smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            document.getElementById('cityInput').focus();
        }
    });
});