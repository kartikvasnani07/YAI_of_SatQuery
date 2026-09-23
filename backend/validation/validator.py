from backend.registry.capabilities import registry

class ValidationResult:
    def __init__(self, is_valid, refusal_reason=None, recommendation=None, missing_bands=None):
        self.is_valid = is_valid
        self.refusal_reason = refusal_reason
        self.recommendation = recommendation
        self.missing_bands = missing_bands or []

    def to_dict(self):
        return {
            "is_valid": self.is_valid,
            "refusal_reason": self.refusal_reason,
            "recommendation": self.recommendation,
            "missing_bands": self.missing_bands
        }

def validate_tool_compatibility(tool_id, observation_meta):
    """Validates if observation metadata satisfies scientific prerequisites for a target tool.
    Performs Graceful Scientific Refusal if requirements are violated.
    """
    tool_spec = registry.get_tool(tool_id)
    if not tool_spec:
        return ValidationResult(False, refusal_reason=f"Unknown tool ID: '{tool_id}'")

    obs_modality = observation_meta.get("modality", "optical")
    obs_bands = observation_meta.get("bands", [])
    has_nir = observation_meta.get("has_nir", False)

    # Check supported modalities
    if obs_modality not in tool_spec["supported_modalities"]:
        return ValidationResult(
            is_valid=False,
            refusal_reason=f"Tool '{tool_spec['name']}' requires modality {tool_spec['supported_modalities']}, but input observation is '{obs_modality}'.",
            recommendation=f"Provide a valid {tool_spec['supported_modalities']} observation dataset."
        )

    # Check required bands (e.g. NDVI requires RED + NIR)
    required_bands = tool_spec.get("required_bands", [])
    missing_bands = []
    for band in required_bands:
        if band == "NIR" and not has_nir:
            missing_bands.append("NIR")
        elif band not in obs_bands and band not in ["VV", "VH"]:
            missing_bands.append(band)

    if missing_bands:
        refusal_msg = (
            f"Scientific Refusal: Cannot execute '{tool_spec['name']}'. "
            f"Required bands: {required_bands}. Missing required band(s): {missing_bands}. "
            f"Input dataset '{observation_meta.get('name', 'Unknown')}' provides bands: {obs_bands}."
        )
        recommendation_msg = f"Provide multispectral imagery containing {', '.join(missing_bands)} band(s) (e.g., Cartosat-2S 4-band or Sentinel-2 L2A)."
        return ValidationResult(
            is_valid=False,
            refusal_reason=refusal_msg,
            recommendation=recommendation_msg,
            missing_bands=missing_bands
        )

    return ValidationResult(is_valid=True)
