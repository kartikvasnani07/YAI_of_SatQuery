# backend/oceanembed/model_architecture.py
"""
Modular Architecture Interfaces for OceanEmbed Reconstruction Pipeline.
Enables seamless drop-in replacement of PyTorch / Deep Learning models.
"""
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
import numpy as np


class OceanDataLoader(ABC):
    @abstractmethod
    def load_surface_cube(self, date_str: str, bbox: List[float]) -> Dict[str, Any]:
        """Loads surface observation cube (SST, SSS, SSH, U, V, Winds)."""
        pass


class ObservationNormalizer(ABC):
    @abstractmethod
    def normalize(self, surface_cube: Dict[str, Any]) -> Dict[str, Any]:
        """Standardizes surface features using climatological mean and std."""
        pass


class GridHarmonizer(ABC):
    @abstractmethod
    def harmonize_grid(self, raw_data: Dict[str, Any], target_res: float = 0.25) -> Dict[str, Any]:
        """Regrids multimodal satellite observations to target 0.25deg grid."""
        pass


class MissingnessMasker(ABC):
    @abstractmethod
    def create_missing_mask(self, surface_cube: Dict[str, Any]) -> np.ndarray:
        """Generates binary mask indicating missing/cloud-covered observation grid cells."""
        pass


class OceanEncoder(ABC):
    @abstractmethod
    def encode(self, harmonized_cube: Dict[str, Any], mask: np.ndarray) -> np.ndarray:
        """Encodes surface observations into latent ocean state representations."""
        pass


class DepthConditionedDecoder(ABC):
    @abstractmethod
    def decode_depth(self, latent_embeddings: np.ndarray, depths: List[float]) -> np.ndarray:
        """Decodes subsurface temperature fields conditioned on specific depth levels z."""
        pass


class UncertaintyHead(ABC):
    @abstractmethod
    def estimate_uncertainty(self, latent_embeddings: np.ndarray, depths: List[float]) -> np.ndarray:
        """Estimates prediction uncertainty (std/interval) across spatial domain and depth."""
        pass


class ValidationEngine(ABC):
    @abstractmethod
    def validate_against_argo(self, predictions: Dict[str, Any], argo_profiles: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculates RMSE, MAE, Bias, Pearson R against in-situ ARGO float observations."""
        pass


class OceanReconstructionModel(ABC):
    @abstractmethod
    def reconstruct(self, date_str: str, depths: List[float], region: Optional[str] = None) -> Dict[str, Any]:
        """Executes full end-to-end subsurface ocean temperature reconstruction."""
        pass


class DemoOceanReconstructionModel(OceanReconstructionModel):
    """
    Scientifically realistic demo reconstruction model for North Indian Ocean domain.
    Explicitly marked with is_demo=True and DEMO RECONSTRUCTION labels.
    """
    def __init__(self):
        self.is_demo = True
        self.model_version = "OceanEmbed-v0.1-Demo"

    def reconstruct(self, date_str: str, depths: List[float], region: Optional[str] = None) -> Dict[str, Any]:
        return {
            "status": "success",
            "model_version": self.model_version,
            "is_demo": True,
            "date": date_str,
            "region": region or "North Indian Ocean (5°N–30°N, 45°E–105°E)",
            "depths": depths,
        }
