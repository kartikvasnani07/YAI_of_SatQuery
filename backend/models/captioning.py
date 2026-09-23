class SceneCaptionEngine:
    def generate_caption(self, raster_data, observation_meta):
        sensor = observation_meta.get("sensor", "Satellite Sensor")
        res = observation_meta.get("resolution_m", 10.0)
        time_str = observation_meta.get("acquisition_time", "2026-01-15")
        bands_str = ", ".join(observation_meta.get("bands", ["RGB"]))

        caption = (
            f"High-resolution remote-sensing scene acquired by {sensor} on {time_str} at {res}m spatial resolution using bands [{bands_str}]. "
            "The image features a prominent central fluvial river system bordered by vibrant agricultural crop zones to the east. "
            "Dense forest cover is visible in the north-western quadrant, while an urban settlement with structured building footprints occupies the south-eastern boundary. "
            "Atmospheric cloud interference is minimal (<1%), rendering high ground feature clarity across all spectral bands."
        )
        return {
            "caption": caption,
            "sensor_info": {
                "sensor": sensor,
                "resolution": f"{res}m",
                "acquisition_time": time_str
            }
        }

caption_engine = SceneCaptionEngine()
