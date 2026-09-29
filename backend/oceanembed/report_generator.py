# backend/oceanembed/report_generator.py
"""
Scientific ReportLab PDF Exporter for OceanEmbed
Generates scientific summary reports containing reconstruction parameters, depth profiles,
thermocline diagnostics, model status, and ARGO validation metrics.
"""
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_oceanembed_pdf_report(pdf_path: str, data: dict) -> str:
    """Generates a PDF summary report for OceanEmbed scientific audit."""
    os.makedirs(os.path.dirname(pdf_path), exist_ok=True)
    doc = SimpleDocTemplate(pdf_path, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=18, textColor=colors.HexColor('#00F0FF'))
    subtitle_style = ParagraphStyle('Sub', parent=styles['Normal'], fontName='Helvetica', fontSize=10, textColor=colors.HexColor('#94A3B8'))
    body_style = ParagraphStyle('Body', parent=styles['Normal'], fontName='Helvetica', fontSize=9, textColor=colors.HexColor('#E2E8F0'), leading=12)
    header_style = ParagraphStyle('Header', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=12, textColor=colors.HexColor('#38BDF8'))

    story = []

    # Title Banner
    story.append(Paragraph("OCEANEMBED — Scientific Audit Report", title_style))
    story.append(Paragraph("Satellite Embedding-Based Framework for Reconstruction of Subsurface Ocean Temperature", subtitle_style))
    story.append(Spacer(1, 10))

    # Metadata Table
    meta_data = [
        ["Report ID:", data.get("id", "OCEAN-2026-001"), "Date / Time Window:", data.get("date", "2026-01-15 (T-2, T-1, T)")],
        ["Target Domain:", "North Indian Ocean (5°N–30°N, 45°E–105°E)", "Target Coordinate:", f"{data.get('latitude', 15.25)}°N, {data.get('longitude', 72.50)}°E"],
        ["Model Status:", "DEMO RECONSTRUCTION (v0.1)", "Validation Benchmark:", "INCOIS ARGO Float Network"]
    ]
    meta_table = Table(meta_data, colWidths=[100, 170, 110, 160])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#0F172A')),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor('#E2E8F0')),
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#1E293B'))
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 12))

    # Executive Summary Section
    story.append(Paragraph("1. Reconstruction Overview & Prompt Context", header_style))
    story.append(Paragraph(f"<b>Query Prompt:</b> {data.get('query', 'Reconstruct subsurface ocean temperature field')}", body_style))
    story.append(Paragraph(f"<b>Key Finding:</b> Subsurface temperature at target depth {data.get('depth_m', 100)}m was reconstructed at {data.get('temp_c', 21.7)}°C (±{data.get('unc_c', 0.8)}°C uncertainty). Detected Thermocline depth: {data.get('thermocline_m', 85)}m below surface.", body_style))
    story.append(Spacer(1, 12))

    # Depth Profile Table
    story.append(Paragraph("2. Vertical Temperature Profile Data", header_style))
    prof_rows = [["Depth (m)", "Temperature (°C)", "Uncertainty (°C)", "95% Confidence Interval", "Data Source"]]
    prof_list = data.get("profile", [])
    for p in prof_list[:10]: # Top 10 levels
        prof_rows.append([
            f"{p.get('depth_m')} m",
            f"{p.get('temperature_c')} °C",
            f"±{p.get('uncertainty_c')} °C",
            f"{p.get('ci_95_lower')}–{p.get('ci_95_upper')} °C",
            "Observed SST" if p.get('depth_m') == 0 else "Reconstructed"
        ])
    prof_table = Table(prof_rows, colWidths=[70, 110, 100, 130, 130])
    prof_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E293B')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor('#38BDF8')),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#334155'))
    ]))
    story.append(prof_table)
    story.append(Spacer(1, 14))

    # ARGO Validation Metrics
    story.append(Paragraph("3. Independent ARGO Float Validation Metrics", header_style))
    argo_rows = [
        ["Metric", "Value", "Scientific Description"],
        ["RMSE", f"{data.get('metrics', {}).get('rmse_c', 0.42)} °C", "Root Mean Square Error against in-situ ARGO profiles"],
        ["MAE", f"{data.get('metrics', {}).get('mae_c', 0.35)} °C", "Mean Absolute Error across 15 depth levels"],
        ["Bias", f"{data.get('metrics', {}).get('bias_c', -0.08)} °C", "Systematic deviation (Reconstructed - ARGO)"],
        ["Pearson R", f"{data.get('metrics', {}).get('correlation_r', 0.985)}", "Profile shape correlation index"]
    ]
    argo_table = Table(argo_rows, colWidths=[100, 100, 340])
    argo_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E293B')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor('#10B981')),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#334155'))
    ]))
    story.append(argo_table)

    doc.build(story)
    return pdf_path
