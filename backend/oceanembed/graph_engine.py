# backend/oceanembed/graph_engine.py
"""
Publication-Grade Scientific Graph Generation Engine for OceanEmbed
Uses Matplotlib, SciPy, and NumPy to produce high-contrast, verified scientific plots:
- Subsurface Temperature Profile T(z) with 95% Confidence Intervals
- Vertical Gradient |dT/dz| Profile with Thermocline Peak Annotation
- In-situ ARGO Float vs Model Overlay Profile
"""
import io
import matplotlib
matplotlib.use('Agg') # Non-interactive backend for server rendering
import matplotlib.pyplot as plt
import numpy as np
from typing import Dict, Any, List, Optional
from backend.oceanembed.reconstruction_engine import synthesize_profile_physics, STANDARD_DEPTHS
from backend.oceanembed.argo_validation import compare_argo_with_model

def render_profile_plot_png(lat: float, lon: float, date_str: str, region_name: str = "Target Region") -> bytes:
    """Renders high-contrast, verified Subsurface Temperature Profile T(z) plot with bright colors."""
    prof_data = synthesize_profile_physics(lat, lon, date_str, region_hint=region_name)
    prof = prof_data["profile"]

    depths = np.array([p["depth_m"] for p in prof])
    temps = np.array([p["temperature_c"] for p in prof])
    ci_lower = np.array([p["ci_95_lower"] for p in prof])
    ci_upper = np.array([p["ci_95_upper"] for p in prof])

    fig, ax = plt.subplots(figsize=(6.5, 5.0), dpi=150)
    fig.patch.set_facecolor('#1e1e1e')
    ax.set_facecolor('#000000')

    # Plot confidence interval band
    ax.fill_betweenx(depths, ci_lower, ci_upper, color='#334155', alpha=0.6, label='95% Confidence Band')

    # Plot temperature profile curve (Bright Sky Blue)
    ax.plot(temps, depths, color='#38bdf8', linewidth=2.8, marker='o', markersize=6, markerfacecolor='#ffffff', markeredgecolor='#0284c7', label='OceanEmbed T(z)')

    # Thermocline horizontal line annotation (Gold)
    therm_z = prof_data["thermocline_depth_m"]
    ax.axhline(y=therm_z, color='#f59e0b', linestyle='--', linewidth=1.8, label=f'Thermocline Peak (~{therm_z:.0f}m)')

    ax.set_ylim(1000, 0)
    ax.set_xlim(min(0, np.min(temps) - 2), max(32, np.max(temps) + 2))

    ax.set_xlabel('Temperature (°C)', fontsize=11, fontweight='bold', color='#ffffff')
    ax.set_ylabel('Depth (m)', fontsize=11, fontweight='bold', color='#ffffff')
    ax.set_title(f'Subsurface Thermal Structure T(z)\n{prof_data["region_name"]} ({lat:.2f}°N, {lon:.2f}°E)', fontsize=12, fontweight='bold', color='#ffffff', pad=10)

    ax.tick_params(colors='#ffffff', labelsize=10)
    for spine in ax.spines.values():
        spine.set_color('#475569')

    ax.grid(True, linestyle=':', alpha=0.5, color='#475569')
    ax.legend(loc='lower left', fontsize=10, frameon=True, facecolor='#1e1e1e', edgecolor='#475569', labelcolor='#ffffff')

    plt.tight_layout()
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=150, facecolor=fig.get_facecolor())
    plt.close(fig)
    buf.seek(0)
    return buf.getvalue()

def render_gradient_plot_png(lat: float, lon: float, date_str: str) -> bytes:
    """Renders Vertical Gradient |dT/dz| plot with thermocline peak annotation in high-contrast styling."""
    prof_data = synthesize_profile_physics(lat, lon, date_str)
    grads = prof_data["gradients"]

    depths = np.array([g["depth_m"] for g in grads])
    gradient_vals = np.array([g["gradient_c_per_m"] for g in grads])

    fig, ax = plt.subplots(figsize=(6.5, 4.5), dpi=150)
    fig.patch.set_facecolor('#1e1e1e')
    ax.set_facecolor('#000000')

    # Gradient line (Bright Amber)
    ax.plot(gradient_vals, depths, color='#f59e0b', linewidth=2.5, marker='s', markersize=5, markerfacecolor='#ffffff', markeredgecolor='#d97706', label='|dT/dz| (°C/m)')

    # Annotate Peak Gradient
    max_idx = np.argmax(gradient_vals)
    peak_z = depths[max_idx]
    peak_val = gradient_vals[max_idx]
    ax.annotate(f'Max Gradient Peak\n{peak_val:.3f} °C/m', xy=(peak_val, peak_z), xytext=(peak_val + 0.005, peak_z + 40),
                arrowprops=dict(facecolor='#38bdf8', shrink=0.05, width=1.5, headwidth=6),
                fontsize=9, fontweight='bold', color='#38bdf8')

    ax.set_ylim(1000, 0)
    ax.set_xlim(0, max(0.05, np.max(gradient_vals) * 1.25))

    ax.set_xlabel('Vertical Thermal Gradient |dT/dz| (°C/m)', fontsize=11, fontweight='bold', color='#ffffff')
    ax.set_ylabel('Depth (m)', fontsize=11, fontweight='bold', color='#ffffff')
    ax.set_title('Vertical Thermal Gradient Profile (|dT/dz|)', fontsize=12, fontweight='bold', color='#ffffff', pad=10)

    ax.tick_params(colors='#ffffff', labelsize=10)
    for spine in ax.spines.values():
        spine.set_color('#475569')

    ax.grid(True, linestyle=':', alpha=0.5, color='#475569')
    ax.legend(loc='lower left', fontsize=10, frameon=True, facecolor='#1e1e1e', edgecolor='#475569', labelcolor='#ffffff')

    plt.tight_layout()
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=150, facecolor=fig.get_facecolor())
    plt.close(fig)
    buf.seek(0)
    return buf.getvalue()

def render_argo_plot_png(float_id: str = "ARGO_2901542", date_str: str = "2026-01-15") -> bytes:
    """Renders ARGO float in-situ observed vs OceanEmbed reconstructed profile plot in high-contrast styling."""
    argo_res = compare_argo_with_model(float_id, date_str)
    comp = argo_res["comparison_profile"]
    flt = argo_res["float_info"]

    depths = np.array([c["depth_m"] for c in comp])
    obs = np.array([c["observed_argo_c"] for c in comp])
    rec = np.array([c["reconstructed_oceanembed_c"] for c in comp])

    fig, ax = plt.subplots(figsize=(6.5, 5.0), dpi=150)
    fig.patch.set_facecolor('#1e1e1e')
    ax.set_facecolor('#000000')

    # ARGO Observed (Bright Emerald) & Model (Bright Sky Blue)
    ax.plot(obs, depths, color='#34d399', linewidth=2.8, marker='o', markersize=6, label=f'ARGO In-Situ Observed ({flt["wmo_id"]})')
    ax.plot(rec, depths, color='#38bdf8', linewidth=2.2, linestyle='--', marker='x', markersize=6, label='OceanEmbed Model')

    ax.set_ylim(1000, 0)
    ax.set_xlim(min(0, np.min(obs) - 2), max(32, np.max(obs) + 2))

    ax.set_xlabel('Temperature (°C)', fontsize=11, fontweight='bold', color='#ffffff')
    ax.set_ylabel('Depth (m)', fontsize=11, fontweight='bold', color='#ffffff')
    ax.set_title(f'ARGO Float In-Situ Validation\n{flt["region"]} (WMO {flt["wmo_id"]})', fontsize=12, fontweight='bold', color='#ffffff', pad=10)

    metrics_text = f"RMSE: {argo_res['metrics']['rmse_c']} °C\nMAE: {argo_res['metrics']['mae_c']} °C\nR: {argo_res['metrics']['correlation_r']}"
    ax.text(0.95, 0.05, metrics_text, transform=ax.transAxes, fontsize=10, fontfamily='monospace',
            verticalalignment='bottom', horizontalalignment='right', color='#34d399',
            bbox=dict(boxstyle='round,pad=0.5', facecolor='#000000', edgecolor='#475569', alpha=0.95))

    ax.tick_params(colors='#ffffff', labelsize=10)
    for spine in ax.spines.values():
        spine.set_color('#475569')

    ax.grid(True, linestyle=':', alpha=0.5, color='#475569')
    ax.legend(loc='lower left', fontsize=10, frameon=True, facecolor='#1e1e1e', edgecolor='#475569', labelcolor='#ffffff')

    plt.tight_layout()
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=150, facecolor=fig.get_facecolor())
    plt.close(fig)
    buf.seek(0)
    return buf.getvalue()
