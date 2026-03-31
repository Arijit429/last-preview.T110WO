from io import BytesIO
from typing import Dict, Any

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors


def generate_cam_pdf(data: Dict[str, Any]) -> bytes:
    """
    Generate a simple Credit Appraisal Memo (CAM) PDF using reportlab.
    `data` is expected to contain:
      - company (dict)
      - financials (dict)
      - research (dict)
      - scoring (dict)
      - recommendation (dict)
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, leftMargin=25 * mm, rightMargin=25 * mm, topMargin=25 * mm, bottomMargin=20 * mm)
    styles = getSampleStyleSheet()

    story = []

    company = data.get("company", {})
    financials = data.get("financials", {})
    research = data.get("research", {})
    scoring = data.get("scoring", {})
    recommendation = data.get("recommendation", {})

    title = f"Credit Appraisal Memo – {company.get('name', 'Unknown Company')}"
    story.append(Paragraph(title, styles["Title"]))
    story.append(Spacer(1, 12))

    # Company Overview
    story.append(Paragraph("<b>1. Company Overview</b>", styles["Heading2"]))
    overview_lines = [
        f"Company Name: {company.get('name', 'N/A')}",
        f"Industry: {company.get('industry', 'N/A')}",
        f"Loan Amount Requested: {company.get('loan_amount', 'N/A')}",
    ]
    story.append(Paragraph("<br/>".join(overview_lines), styles["Normal"]))
    story.append(Spacer(1, 10))

    # Financial Summary
    story.append(Paragraph("<b>2. Financial Summary</b>", styles["Heading2"]))
    fin_table_data = [
        ["Metric", "Value (approx.)"],
        ["Revenue", f"{financials.get('revenue', 'N/A'):,}"],
        ["Profit", f"{financials.get('profit', 'N/A'):,}"],
        ["Debt", f"{financials.get('debt', 'N/A'):,}"],
        ["Assets", f"{financials.get('assets', 'N/A'):,}"],
        ["Operating Cash Flow", f"{financials.get('cash_flow', 'N/A'):,}"],
    ]
    fin_table = Table(fin_table_data, hAlign="LEFT")
    fin_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.whitesmoke, colors.lightgrey]),
            ]
        )
    )
    story.append(fin_table)
    story.append(Spacer(1, 10))

    # Risk Analysis / Research
    story.append(Paragraph("<b>3. Risk Analysis & Research Insights</b>", styles["Heading2"]))
    insights_list = research.get("insights", []) or []
    insights_text = "<br/>".join(f"- {item}" for item in insights_list)
    if not insights_text:
        insights_text = "No external research insights available. Using internal risk model only."
    story.append(Paragraph(insights_text, styles["Normal"]))
    story.append(Spacer(1, 10))

    # Five Cs Evaluation
    story.append(Paragraph("<b>4. Five Cs Evaluation</b>", styles["Heading2"]))
    five_cs = scoring.get("five_cs", {})
    five_cs_table_data = [["C", "Score (0–100)"]]
    for label in ["character", "capacity", "capital", "collateral", "conditions"]:
        val = five_cs.get(label, "N/A")
        five_cs_table_data.append([label.title(), str(val)])
    cs_table = Table(five_cs_table_data, hAlign="LEFT")
    cs_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0369a1")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
            ]
        )
    )
    story.append(cs_table)
    story.append(Spacer(1, 10))

    # Final Recommendation
    story.append(Paragraph("<b>5. Final Recommendation</b>", styles["Heading2"]))
    rec_lines = [
        f"Risk Score: {scoring.get('risk_score', 'N/A')} ({scoring.get('risk_level', 'N/A')} risk)",
        f"Decision: {recommendation.get('decision', 'N/A')}",
        f"Recommended Loan Limit: {recommendation.get('recommended_limit', 'N/A')}",
        f"Indicative Interest Rate: {recommendation.get('interest_rate', 'N/A')}% p.a.",
    ]
    story.append(Paragraph("<br/>".join(rec_lines), styles["Normal"]))
    story.append(Spacer(1, 6))

    expl_list = scoring.get("explanations", []) or []
    if expl_list:
        story.append(Paragraph("<b>Key Model Explanations:</b>", styles["Normal"]))
        story.append(Spacer(1, 4))
        story.append(Paragraph("<br/>".join(f"- {e}" for e in expl_list), styles["Normal"]))

    doc.build(story)
    pdf = buffer.getvalue()
    buffer.close()
    return pdf

