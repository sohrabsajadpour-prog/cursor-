// Weather Dashboard JavaScript
class WeatherDashboard {
    constructor() {
        this.apiKey = 'YOUR_API_KEY'; // Replace with actual API key
        this.baseURL = 'https://api.openweathermap.org/data/2.5';
        this.currentCity = 'Tehran';
        
        this.initializeElements();
        this.bindEvents();
        this.loadInitialWeather();
    }

    initializeElements() {
        this.cityInput = document.getElementById('cityInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.locationBtn = document.getElementById('locationBtn');
        this.currentWeather = document.getElementById('currentWeather');
        this.forecastContainer = document.getElementById('forecastContainer');
        this.loading = document.getElementById('loading');
        this.errorMessage = document.getElementById('errorMessage');
        
        // Current weather elements
        this.currentCityEl = document.getElementById('currentCity');
        this.currentDateEl = document.getElementById('currentDate');
        this.currentTempEl = document.getElementById('currentTemp');
        this.currentIconEl = document.getElementById('currentIcon');
        this.currentDescriptionEl = document.getElementById('currentDescription');
        this.currentVisibilityEl = document.getElementById('currentVisibility');
        this.currentHumidityEl = document.getElementById('currentHumidity');
        this.currentWindEl = document.getElementById('currentWind');
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

    async loadInitialWeather() {
        await this.getWeatherData(this.currentCity);
    }

    async searchWeather() {
        const city = this.cityInput.value.trim();
        if (city) {
            await this.getWeatherData(city);
        }
    }

    async getCurrentLocation() {
        if (navigator.geolocation) {
            this.showLoading();
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    await this.getWeatherByCoords(latitude, longitude);
                },
                (error) => {
                    this.hideLoading();
                    this.showError('خطا در دریافت موقعیت جغرافیایی');
                }
            );
        } else {
            this.showError('مرورگر شما از موقعیت جغرافیایی پشتیبانی نمی‌کند');
        }
    }

    async getWeatherData(city) {
        try {
            this.showLoading();
            this.hideError();
            
            // Get current weather
            const currentWeatherData = await this.fetchWeatherData(`${this.baseURL}/weather?q=${city}&appid=${this.apiKey}&units=metric&lang=fa`);
            
            // Get 5-day forecast
            const forecastData = await this.fetchWeatherData(`${this.baseURL}/forecast?q=${city}&appid=${this.apiKey}&units=metric&lang=fa`);
            
            this.displayCurrentWeather(currentWeatherData);
            this.displayForecast(forecastData);
            this.currentCity = city;
            
        } catch (error) {
            this.showError('خطا در دریافت اطلاعات آب و هوا');
            console.error('Weather API Error:', error);
        } finally {
            this.hideLoading();
        }
    }

    async getWeatherByCoords(lat, lon) {
        try {
            this.hideError();
            
            // Get current weather
            const currentWeatherData = await this.fetchWeatherData(`${this.baseURL}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=fa`);
            
            // Get 5-day forecast
            const forecastData = await this.fetchWeatherData(`${this.baseURL}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=fa`);
            
            this.displayCurrentWeather(currentWeatherData);
            this.displayForecast(forecastData);
            this.currentCity = currentWeatherData.name;
            
        } catch (error) {
            this.showError('خطا در دریافت اطلاعات آب و هوا');
            console.error('Weather API Error:', error);
        } finally {
            this.hideLoading();
        }
    }

    async fetchWeatherData(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    displayCurrentWeather(data) {
        this.currentCityEl.textContent = data.name;
        this.currentDateEl.textContent = this.formatDate(new Date());
        this.currentTempEl.textContent = Math.round(data.main.temp);
        this.currentIconEl.className = this.getWeatherIcon(data.weather[0].icon);
        this.currentDescriptionEl.textContent = data.weather[0].description;
        this.currentVisibilityEl.textContent = `${(data.visibility / 1000).toFixed(1)} کیلومتر`;
        this.currentHumidityEl.textContent = `${data.main.humidity}%`;
        this.currentWindEl.textContent = `${Math.round(data.wind.speed * 3.6)} کیلومتر/ساعت`;
    }

    displayForecast(data) {
        this.forecastContainer.innerHTML = '';
        
        // Group forecast by day and get one forecast per day
        const dailyForecasts = this.groupForecastByDay(data.list);
        
        dailyForecasts.forEach((forecast, index) => {
            if (index < 5) { // Show only 5 days
                const forecastCard = this.createForecastCard(forecast);
                this.forecastContainer.appendChild(forecastCard);
            }
        });
    }

    groupForecastByDay(forecastList) {
        const dailyForecasts = {};
        
        forecastList.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dayKey = date.toDateString();
            
            if (!dailyForecasts[dayKey] || date.getHours() === 12) {
                dailyForecasts[dayKey] = item;
            }
        });
        
        return Object.values(dailyForecasts);
    }

    createForecastCard(forecast) {
        const card = document.createElement('div');
        card.className = 'forecast-card';
        
        const date = new Date(forecast.dt * 1000);
        const dayName = this.getDayName(date.getDay());
        const dateStr = this.formatDate(date);
        
        card.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <div class="forecast-date">${dateStr}</div>
            <div class="forecast-icon">
                <i class="${this.getWeatherIcon(forecast.weather[0].icon)}"></i>
            </div>
            <div class="forecast-temp">${Math.round(forecast.main.temp)}°C</div>
            <div class="forecast-description">${forecast.weather[0].description}</div>
            <div class="forecast-details">
                <span><i class="fas fa-tint"></i> ${forecast.main.humidity}%</span>
                <span><i class="fas fa-wind"></i> ${Math.round(forecast.wind.speed * 3.6)} کیلومتر/ساعت</span>
            </div>
        `;
        
        return card;
    }

    getWeatherIcon(iconCode) {
        const iconMap = {
            '01d': 'fas fa-sun',
            '01n': 'fas fa-moon',
            '02d': 'fas fa-cloud-sun',
            '02n': 'fas fa-cloud-moon',
            '03d': 'fas fa-cloud',
            '03n': 'fas fa-cloud',
            '04d': 'fas fa-cloud',
            '04n': 'fas fa-cloud',
            '09d': 'fas fa-cloud-rain',
            '09n': 'fas fa-cloud-rain',
            '10d': 'fas fa-cloud-sun-rain',
            '10n': 'fas fa-cloud-moon-rain',
            '11d': 'fas fa-bolt',
            '11n': 'fas fa-bolt',
            '13d': 'fas fa-snowflake',
            '13n': 'fas fa-snowflake',
            '50d': 'fas fa-smog',
            '50n': 'fas fa-smog'
        };
        
        return iconMap[iconCode] || 'fas fa-cloud';
    }

    getDayName(dayIndex) {
        const days = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
        return days[dayIndex];
    }

    formatDate(date) {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        };
        return date.toLocaleDateString('fa-IR', options);
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

// Demo data for when API key is not available
class WeatherDashboardDemo extends WeatherDashboard {
    constructor() {
        super();
        this.demoData = this.getDemoData();
    }

    async fetchWeatherData(url) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Return demo data based on the request
        if (url.includes('/weather?')) {
            return this.demoData.current;
        } else if (url.includes('/forecast?')) {
            return this.demoData.forecast;
        }
    }

    getDemoData() {
        return {
            current: {
                name: 'تهران',
                main: {
                    temp: 25,
                    humidity: 45
                },
                weather: [{
                    description: 'آفتابی',
                    icon: '01d'
                }],
                visibility: 10000,
                wind: {
                    speed: 4.2
                }
            },
            forecast: {
                list: [
                    {
                        dt: Date.now() / 1000 + 86400,
                        main: { temp: 28, humidity: 40 },
                        weather: [{ description: 'آفتابی', icon: '01d' }],
                        wind: { speed: 3.5 }
                    },
                    {
                        dt: Date.now() / 1000 + 172800,
                        main: { temp: 24, humidity: 55 },
                        weather: [{ description: 'نیمه ابری', icon: '02d' }],
                        wind: { speed: 4.8 }
                    },
                    {
                        dt: Date.now() / 1000 + 259200,
                        main: { temp: 22, humidity: 65 },
                        weather: [{ description: 'بارانی', icon: '10d' }],
                        wind: { speed: 5.2 }
                    },
                    {
                        dt: Date.now() / 1000 + 345600,
                        main: { temp: 26, humidity: 50 },
                        weather: [{ description: 'آفتابی', icon: '01d' }],
                        wind: { speed: 3.8 }
                    },
                    {
                        dt: Date.now() / 1000 + 432000,
                        main: { temp: 23, humidity: 60 },
                        weather: [{ description: 'ابری', icon: '04d' }],
                        wind: { speed: 4.5 }
                    }
                ]
            }
        };
    }
}

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Check if API key is available, otherwise use demo mode
    const hasApiKey = false; // Set to true when you have an API key
    
    if (hasApiKey) {
        new WeatherDashboard();
    } else {
        new WeatherDashboardDemo();
    }
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

    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.getElementById('errorMessage').classList.remove('show');
        }
    });
});