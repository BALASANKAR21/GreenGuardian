import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { env } from "./env.js";
const http = axios.create({ timeout: 10000 });
export async function detectLocation(ip) {
    try {
        const url = `https://ipinfo.io/json?token=${env.IPINFO_TOKEN}`;
        const { data } = await http.get(url, {
            headers: ip ? { "X-Forwarded-For": ip } : undefined
        });
        const [latStr, lonStr] = String(data.loc || "").split(",");
        return {
            ip: data.ip,
            city: data.city,
            region: data.region,
            country: data.country,
            lat: latStr ? Number(latStr) : undefined,
            lon: lonStr ? Number(lonStr) : undefined
        };
    }
    catch (error) {
        console.error("[detectLocation] Error:", error.message);
        throw new Error("Location detection failed. Check IPINFO_TOKEN.");
    }
}
export async function fetchWeather(lat, lon) {
    try {
        const url = "https://api.openweathermap.org/data/2.5/weather";
        const { data } = await http.get(url, {
            params: { lat, lon, appid: env.OPENWEATHER_API_KEY, units: "metric" }
        });
        return {
            tempC: data.main?.temp,
            humidity: data.main?.humidity,
            cloudiness: data.clouds?.all,
            conditions: data.weather?.[0]?.main ?? "Clear",
            sunrise: data.sys?.sunrise ? new Date(data.sys.sunrise * 1000).toISOString() : null,
            sunset: data.sys?.sunset ? new Date(data.sys.sunset * 1000).toISOString() : null
        };
    }
    catch (error) {
        console.error("[fetchWeather] Error:", error.response?.data || error.message);
        throw new Error("Weather data fetch failed. Check OPENWEATHER_API_KEY.");
    }
}
export async function fetchAirQuality(lat, lon) {
    try {
        const url = "https://api.airvisual.com/v2/nearest_city";
        const { data } = await http.get(url, {
            params: { lat, lon, key: env.AIRVISUAL_API_KEY }
        });
        const aqi = data?.data?.current?.pollution?.aqius;
        return { aqiUS: aqi };
    }
    catch (error) {
        console.error("[fetchAirQuality] Error:", error.response?.data || error.message);
        return { aqiUS: null };
    }
}
export async function fetchSoilMoisture(lat, lon) {
    if (!env.NASA_API_KEY)
        return { soilMoisture: null, source: null };
    try {
        return { soilMoisture: null, source: "NASA" };
    }
    catch {
        return { soilMoisture: null, source: null };
    }
}
export async function identifyPlantWithPlantNet(imagePath) {
    try {
        const url = `https://my-api.plantnet.org/v2/identify/all?api-key=${env.PLANTNET_API_KEY}`;
        const form = new FormData();
        form.append("images", fs.createReadStream(imagePath));
        form.append("organs", "leaf");
        const { data } = await http.post(url, form, {
            headers: form.getHeaders()
        });
        const results = Array.isArray(data?.results)
            ? data.results.slice(0, 5).map((r) => ({
                score: r.score,
                species: r.species?.scientificNameWithoutAuthor || r.species?.scientificName,
                commonNames: r.species?.commonNames || [],
                genus: r.species?.genus?.scientificName,
                family: r.species?.family?.scientificName
            }))
            : [];
        return { results };
    }
    catch (error) {
        console.error("[identifyPlant] Error:", error.response?.data || error.message);
        throw new Error("Plant identification failed. Check PLANTNET_API_KEY or image format.");
    }
}
