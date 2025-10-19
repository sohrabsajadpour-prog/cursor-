class WeatherDashboard {
    constructor() {
        this.apiKey = 'demo_key'; // In production, use a real API key
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
        this.currentWeatherData = null;
        this.forecastData = null;
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadDefaultCity();
    }

    initializeElements() {
        this.elements = {
            cityInput: document.getElementById('cityInput'),
            searchBtn: document.getElementById('searchBtn'),
            locationBtn: document.getElementById('locationBtn'),
            loading: document.getElementById('loading'),
            error: document.getElementById('error'),
            errorMessage: document.getElementById('errorMessage'),
            currentWeather: document.getElementById('currentWeather'),
            forecast: document.getElementById('forecast'),
            hourlyForecast: document.getElementById('hourlyForecast'),
            
            // Current weather elements
            cityName: document.getElementById('cityName'),
            currentDate: document.getElementById('currentDate'),
            currentTemp: document.getElementById('currentTemp'),
            currentIcon: document.getElementById('currentIcon'),
            weatherDescription: document.getElementById('weatherDescription'),
            visibility: document.getElementById('visibility'),
            humidity: document.getElementById('humidity'),
            windSpeed: document.getElementById('windSpeed'),
            feelsLike: document.getElementById('feelsLike'),
            pressure: document.getElementById('pressure'),
            uvIndex: document.getElementById('uvIndex'),
            
            // Forecast containers
            forecastContainer: document.getElementById('forecastContainer'),
            hourlyContainer: document.getElementById('hourlyContainer')
        };
    }

    attachEventListeners() {
        this.elements.searchBtn.addEventListener('click', () => this.searchWeather());
        this.elements.locationBtn.addEventListener('click', () => this.getCurrentLocation());
        this.elements.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchWeather();
            }
        });
    }

    async loadDefaultCity() {
        await this.getWeatherData('Tehran');
    }

    async searchWeather() {
        const city = this.elements.cityInput.value.trim();
        if (!city) {
            this.showError('لطفاً نام شهر را وارد کنید');
            return;
        }
        await this.getWeatherData(city);
    }

    async getCurrentLocation() {
        if (!navigator.geolocation) {
            this.showError('مرورگر شما از تشخیص موقعیت پشتیبانی نمی‌کند');
            return;
        }

        this.showLoading();
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                await this.getWeatherByCoords(latitude, longitude);
            },
            (error) => {
                this.hideLoading();
                this.showError('خطا در دریافت موقعیت مکانی');
            }
        );
    }

    async getWeatherData(city) {
        this.showLoading();
        
        try {
            // Since we can't use a real API key in this demo, we'll simulate the data
            const mockData = this.getMockWeatherData(city);
            await this.simulateApiDelay();
            
            this.currentWeatherData = mockData.current;
            this.forecastData = mockData.forecast;
            
            this.displayCurrentWeather();
            this.displayForecast();
            this.displayHourlyForecast();
            
            this.hideLoading();
            this.hideError();
            
        } catch (error) {
            this.hideLoading();
            this.showError('خطا در دریافت اطلاعات آب و هوا');
        }
    }

    async getWeatherByCoords(lat, lon) {
        this.showLoading();
        
        try {
            // Simulate API call with coordinates
            const mockData = this.getMockWeatherData('موقعیت فعلی');
            await this.simulateApiDelay();
            
            this.currentWeatherData = mockData.current;
            this.forecastData = mockData.forecast;
            
            this.displayCurrentWeather();
            this.displayForecast();
            this.displayHourlyForecast();
            
            this.hideLoading();
            this.hideError();
            
        } catch (error) {
            this.hideLoading();
            this.showError('خطا در دریافت اطلاعات آب و هوا');
        }
    }

    getMockWeatherData(city) {
        const weatherConditions = [
            { icon: 'fas fa-sun', desc: 'آفتابی', temp: 25 },
            { icon: 'fas fa-cloud-sun', desc: 'نیمه ابری', temp: 22 },
            { icon: 'fas fa-cloud', desc: 'ابری', temp: 18 },
            { icon: 'fas fa-cloud-rain', desc: 'بارانی', temp: 15 },
            { icon: 'fas fa-snowflake', desc: 'برفی', temp: -2 }
        ];

        const randomCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
        
        return {
            current: {
                city: city,
                temperature: randomCondition.temp,
                description: randomCondition.desc,
                icon: randomCondition.icon,
                humidity: Math.floor(Math.random() * 40) + 40,
                windSpeed: Math.floor(Math.random() * 20) + 5,
                visibility: Math.floor(Math.random() * 5) + 5,
                feelsLike: randomCondition.temp + Math.floor(Math.random() * 6) - 3,
                pressure: Math.floor(Math.random() * 50) + 1000,
                uvIndex: Math.floor(Math.random() * 10) + 1
            },
            forecast: this.generateForecastData(),
            hourly: this.generateHourlyData()
        };
    }

    generateForecastData() {
        const days = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
        const weatherIcons = [
            'fas fa-sun',
            'fas fa-cloud-sun', 
            'fas fa-cloud',
            'fas fa-cloud-rain',
            'fas fa-snowflake'
        ];
        const descriptions = ['آفتابی', 'نیمه ابری', 'ابری', 'بارانی', 'برفی'];
        
        const forecast = [];
        const today = new Date();
        
        for (let i = 1; i <= 5; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            const dayIndex = date.getDay();
            const weatherIndex = Math.floor(Math.random() * weatherIcons.length);
            
            forecast.push({
                day: days[dayIndex],
                date: `${date.getDate()}/${date.getMonth() + 1}`,
                icon: weatherIcons[weatherIndex],
                description: descriptions[weatherIndex],
                high: Math.floor(Math.random() * 15) + 20,
                low: Math.floor(Math.random() * 10) + 10
            });
        }
        
        return forecast;
    }

    generateHourlyData() {
        const hourly = [];
        const now = new Date();
        
        for (let i = 1; i <= 24; i++) {
            const hour = new Date(now.getTime() + i * 60 * 60 * 1000);
            const temp = Math.floor(Math.random() * 20) + 10;
            const icons = ['fas fa-sun', 'fas fa-cloud-sun', 'fas fa-cloud', 'fas fa-cloud-rain'];
            
            hourly.push({
                time: hour.getHours() + ':00',
                icon: icons[Math.floor(Math.random() * icons.length)],
                temperature: temp
            });
        }
        
        return hourly;
    }

    async simulateApiDelay() {
        return new Promise(resolve => setTimeout(resolve, 1000));
    }

    displayCurrentWeather() {
        const data = this.currentWeatherData;
        const now = new Date();
        
        this.elements.cityName.textContent = data.city;
        this.elements.currentDate.textContent = this.formatDate(now);
        this.elements.currentTemp.textContent = `${data.temperature}°`;
        this.elements.currentIcon.className = data.icon;
        this.elements.weatherDescription.textContent = data.description;
        
        this.elements.visibility.textContent = `${data.visibility} کیلومتر`;
        this.elements.humidity.textContent = `${data.humidity}%`;
        this.elements.windSpeed.textContent = `${data.windSpeed} کیلومتر/ساعت`;
        this.elements.feelsLike.textContent = `${data.feelsLike}°`;
        this.elements.pressure.textContent = `${data.pressure} هکتوپاسکال`;
        this.elements.uvIndex.textContent = data.uvIndex;
        
        this.elements.currentWeather.classList.remove('hidden');
        this.elements.currentWeather.classList.add('fade-in');
    }

    displayForecast() {
        this.elements.forecastContainer.innerHTML = '';
        
        this.forecastData.forEach(day => {
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item fade-in';
            
            forecastItem.innerHTML = `
                <div class="forecast-day">${day.day}</div>
                <div class="forecast-date">${day.date}</div>
                <div class="forecast-icon">
                    <i class="${day.icon}"></i>
                </div>
                <div class="forecast-temps">
                    <span class="forecast-high">${day.high}°</span>
                    <span class="forecast-low">${day.low}°</span>
                </div>
                <div class="forecast-desc">${day.description}</div>
            `;
            
            this.elements.forecastContainer.appendChild(forecastItem);
        });
        
        this.elements.forecast.classList.remove('hidden');
    }

    displayHourlyForecast() {
        this.elements.hourlyContainer.innerHTML = '';
        
        const mockHourly = this.generateHourlyData();
        
        // Show only first 12 hours for better display
        mockHourly.slice(0, 12).forEach(hour => {
            const hourlyItem = document.createElement('div');
            hourlyItem.className = 'hourly-item fade-in';
            
            hourlyItem.innerHTML = `
                <div class="hourly-time">${hour.time}</div>
                <div class="hourly-icon">
                    <i class="${hour.icon}"></i>
                </div>
                <div class="hourly-temp">${hour.temperature}°</div>
            `;
            
            this.elements.hourlyContainer.appendChild(hourlyItem);
        });
        
        this.elements.hourlyForecast.classList.remove('hidden');
    }

    formatDate(date) {
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        
        return date.toLocaleDateString('fa-IR', options);
    }

    showLoading() {
        this.elements.loading.classList.remove('hidden');
        this.elements.currentWeather.classList.add('hidden');
        this.elements.forecast.classList.add('hidden');
        this.elements.hourlyForecast.classList.add('hidden');
    }

    hideLoading() {
        this.elements.loading.classList.add('hidden');
    }

    showError(message) {
        this.elements.errorMessage.textContent = message;
        this.elements.error.classList.remove('hidden');
        setTimeout(() => {
            this.hideError();
        }, 5000);
    }

    hideError() {
        this.elements.error.classList.add('hidden');
    }
}

// Initialize the weather dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new WeatherDashboard();
});

// Add some interactive features
document.addEventListener('DOMContentLoaded', () => {
    // Add click effect to forecast items
    document.addEventListener('click', (e) => {
        if (e.target.closest('.forecast-item')) {
            const item = e.target.closest('.forecast-item');
            item.style.transform = 'scale(0.95)';
            setTimeout(() => {
                item.style.transform = '';
            }, 150);
        }
    });

    // Add hover effect to detail items
    document.addEventListener('mouseenter', (e) => {
        if (e.target.closest('.detail-item')) {
            const item = e.target.closest('.detail-item');
            item.style.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.3)';
        }
    }, true);

    document.addEventListener('mouseleave', (e) => {
        if (e.target.closest('.detail-item')) {
            const item = e.target.closest('.detail-item');
            item.style.boxShadow = '';
        }
    }, true);
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('cityInput').focus();
    }
    
    // Ctrl/Cmd + L for current location
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        document.getElementById('locationBtn').click();
    }
});