interface WeatherData {
  temp: number
  feelsLike: number
  description: string
  icon: string
  humidity: number
  windSpeed: number
}

async function fetchWeather(city: string): Promise<WeatherData | null> {
  const apiKey = process.env.OPENWEATHER_API_KEY
  if (!apiKey) return null

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=imperial`,
      { next: { revalidate: 1800 } }
    )
    if (!res.ok) return null
    const data = await res.json() as {
      main: { temp: number; feels_like: number; humidity: number }
      weather: { description: string; icon: string }[]
      wind: { speed: number }
    }
    return {
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      description: data.weather[0]?.description ?? '',
      icon: data.weather[0]?.icon ?? '',
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed),
    }
  } catch {
    return null
  }
}

interface WeatherWidgetProps {
  city: string
  primaryColor: string
}

export default async function WeatherWidget({ city, primaryColor }: WeatherWidgetProps) {
  const weather = await fetchWeather(city)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div
        className="px-4 py-3 text-white text-sm font-bold uppercase tracking-wide"
        style={{ backgroundColor: primaryColor }}
      >
        {city} Weather
      </div>
      <div className="p-4">
        {weather ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://openweathermap.org/img/wn/${weather.icon}.png`}
                  alt={weather.description}
                  width={40}
                  height={40}
                />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{weather.temp}°F</p>
                  <p className="text-xs text-gray-500 capitalize">{weather.description}</p>
                </div>
              </div>
            </div>
            <div className="space-y-1 pt-1 border-t border-gray-100">
              {[
                { label: 'Feels Like', value: `${weather.feelsLike}°F` },
                { label: 'Humidity', value: `${weather.humidity}%` },
                { label: 'Wind', value: `${weather.windSpeed} mph` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-semibold text-gray-800">{value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-2">
            Weather unavailable
          </p>
        )}
      </div>
    </div>
  )
}
