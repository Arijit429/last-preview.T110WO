from __future__ import annotations

import os
import uuid
from io import BytesIO
from pathlib import Path
from typing import Dict, Any

from flask import Flask, jsonify, request, send_file
from flask_cors import CORS

from pdf_parser import extract_financials_from_pdf, extract_text_from_pdf
from research_agent import generate_research_insights
from risk_scoring import compute_risk_score
from cam_generator import generate_cam_pdf
from gst_analyzer import analyze_gst_bank_statements
from web_scraper import perform_deep_research


BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app = Flask(__name__)
CORS(app)

# In-memory store of analysis sessions keyed by analysis_id
SESSIONS: Dict[str, Dict[str, Any]] = {}


@app.route("/health", methods=["GET"])
def health() -> Any:
    return jsonify({"status": "ok", "service": "intelli-credit-backend"})


@app.route("/upload", methods=["POST"])
def upload_files() -> Any:
    """
    Accept loan application PDFs and basic company metadata.
    Returns an analysis_id which is then used in /analyze, /score, /recommend, /generate-cam.
    """
    company_name = request.form.get("company_name", "")
    industry = request.form.get("industry", "")
    loan_amount = request.form.get("loan_amount", "")

    analysis_id = str(uuid.uuid4())
    session: Dict[str, Any] = {
        "company": {
            "name": company_name,
            "industry": industry,
            "loan_amount": loan_amount,
        },
        "files": {},
    }

    for key in ["annual_report", "bank_statement", "gst_file"]:
        file = request.files.get(key)
        if file:
            safe_name = f"{analysis_id}_{key}.pdf"
            save_path = UPLOAD_DIR / safe_name
            file.save(save_path)
            session["files"][key] = str(save_path)

    SESSIONS[analysis_id] = session

    return jsonify({"analysis_id": analysis_id, "company": session["company"], "files": list(session["files"].keys())})


@app.route("/analyze", methods=["POST"])
def analyze() -> Any:
    """
    Extract financial data from uploaded PDFs. If no PDFs or extraction fails,
    fall back to demo/sample financials.
    Also performs GST-Bank cross-check if both files are available.
    """
    data = request.get_json(force=True)
    analysis_id = data.get("analysis_id")
    if not analysis_id or analysis_id not in SESSIONS:
        return jsonify({"error": "Invalid or missing analysis_id"}), 400

    session = SESSIONS[analysis_id]
    files = session.get("files", {})

    financials: Dict[str, Any] = {}

    # Prefer annual report, then bank statement
    for key in ["annual_report", "bank_statement"]:
        path = files.get(key)
        if path and os.path.exists(path):
            try:
                financials = extract_financials_from_pdf(path)
                break
            except Exception:
                continue

    # Fallback demo data
    if not financials:
        financials = {
            "revenue": 150_000_000.0,
            "profit": 15_000_000.0,
            "debt": 50_000_000.0,
            "assets": 180_000_000.0,
            "cash_flow": 12_000_000.0,
        }

    # GST-Bank cross-check if both files available
    gst_bank_analysis = None
    if files.get("gst_file") and files.get("bank_statement"):
        try:
            gst_text = extract_text_from_pdf(files["gst_file"])
            bank_text = extract_text_from_pdf(files["bank_statement"])
            gst_bank_analysis = analyze_gst_bank_statements(gst_text, bank_text)
            session["gst_bank_analysis"] = gst_bank_analysis
        except Exception as e:
            print(f"GST-Bank analysis failed: {e}")

    session["financials"] = financials
    
    response = {"analysis_id": analysis_id, "financials": financials}
    if gst_bank_analysis:
        response["gst_bank_analysis"] = gst_bank_analysis
    
    return jsonify(response)


@app.route("/research", methods=["POST"])
def research() -> Any:
    """
    Run AI research agent with deep web research capabilities.
    """
    data = request.get_json(force=True)
    analysis_id = data.get("analysis_id")
    if not analysis_id or analysis_id not in SESSIONS:
        return jsonify({"error": "Invalid or missing analysis_id"}), 400

    session = SESSIONS[analysis_id]
    company = session.get("company", {})
    
    # Generate base insights
    insights = generate_research_insights(company.get("name", ""), company.get("industry", ""))
    
    # Perform deep web research
    try:
        deep_research = perform_deep_research(company.get("name", ""), company.get("industry", ""))
        insights["deep_research"] = deep_research
    except Exception as e:
        print(f"Deep research failed: {e}")
    
    session["research"] = insights
    return jsonify({"analysis_id": analysis_id, "research": insights})


@app.route("/primary-insights", methods=["POST"])
def add_primary_insights() -> Any:
    """
    Accept primary insights from credit officers (factory visits, management interviews, etc.)
    """
    data = request.get_json(force=True)
    analysis_id = data.get("analysis_id")
    if not analysis_id or analysis_id not in SESSIONS:
        return jsonify({"error": "Invalid or missing analysis_id"}), 400

    session = SESSIONS[analysis_id]
    
    primary_insights = {
        "factory_visit_notes": data.get("factory_visit_notes", ""),
        "management_quality": data.get("management_quality", ""),
        "operational_observations": data.get("operational_observations", ""),
        "red_flags": data.get("red_flags", ""),
        "positive_indicators": data.get("positive_indicators", ""),
    }
    
    session["primary_insights"] = primary_insights
    return jsonify({"analysis_id": analysis_id, "primary_insights": primary_insights})


@app.route("/score", methods=["POST"])
def score() -> Any:
    """
    Combine financials + research + primary insights to compute risk score and Five Cs breakdown.
    """
    data = request.get_json(force=True)
    analysis_id = data.get("analysis_id")
    if not analysis_id or analysis_id not in SESSIONS:
        return jsonify({"error": "Invalid or missing analysis_id"}), 400

    session = SESSIONS[analysis_id]
    financials = session.get("financials") or {}
    research = session.get("research") or generate_research_insights(
        session.get("company", {}).get("name", ""), session.get("company", {}).get("industry", "")
    )
    session["research"] = research

    scoring = compute_risk_score(financials, research)
    
    # Adjust score based on GST-Bank analysis
    gst_bank_analysis = session.get("gst_bank_analysis")
    if gst_bank_analysis:
        cross_check = gst_bank_analysis.get("cross_check", {})
        red_flags = cross_check.get("red_flags", [])
        if red_flags:
            # Reduce score for red flags
            penalty = len(red_flags) * 5
            scoring["risk_score"] = max(0, scoring["risk_score"] - penalty)
            scoring["explanations"].extend([f"GST-Bank Analysis: {flag}" for flag in red_flags])
    
    # Adjust score based on primary insights
    primary_insights = session.get("primary_insights")
    if primary_insights:
        red_flags = primary_insights.get("red_flags", "")
        if red_flags and len(red_flags) > 10:
            scoring["risk_score"] = max(0, scoring["risk_score"] - 10)
            scoring["explanations"].append("Primary Insights: Red flags identified during due diligence.")
        
        positive = primary_insights.get("positive_indicators", "")
        if positive and len(positive) > 10:
            scoring["risk_score"] = min(100, scoring["risk_score"] + 5)
            scoring["explanations"].append("Primary Insights: Positive indicators from field visit.")
    
    session["scoring"] = scoring
    return jsonify({"analysis_id": analysis_id, "scoring": scoring})


@app.route("/recommend", methods=["POST"])
def recommend() -> Any:
    """
    Simple rules engine to convert risk score into decision, loan limit and pricing.
    """
    data = request.get_json(force=True)
    analysis_id = data.get("analysis_id")
    if not analysis_id or analysis_id not in SESSIONS:
        return jsonify({"error": "Invalid or missing analysis_id"}), 400

    session = SESSIONS[analysis_id]
    scoring = session.get("scoring")
    if not scoring:
        return jsonify({"error": "Run /score first"}), 400

    risk_score = float(scoring.get("risk_score") or 0.0)
    company = session.get("company", {})
    try:
        requested_amount = float(company.get("loan_amount") or 0.0)
    except ValueError:
        requested_amount = 0.0

    if risk_score > 70:
        decision = "Approve"
        interest_rate = 11.5
        limit_multiplier = 1.0
    elif risk_score >= 40:
        decision = "Approve with higher interest"
        interest_rate = 14.0
        limit_multiplier = 0.8
    else:
        decision = "Reject"
        interest_rate = 0.0
        limit_multiplier = 0.0

    recommended_limit = round(requested_amount * limit_multiplier, 2) if requested_amount else None

    recommendation = {
        "decision": decision,
        "recommended_limit": recommended_limit,
        "interest_rate": interest_rate,
    }

    session["recommendation"] = recommendation

    return jsonify({"analysis_id": analysis_id, "recommendation": recommendation})


@app.route("/generate-cam", methods=["GET"])
def generate_cam() -> Any:
    """
    Generate CAM PDF for a given analysis_id and return as downloadable file.
    """
    analysis_id = request.args.get("analysis_id")
    if not analysis_id or analysis_id not in SESSIONS:
        return jsonify({"error": "Invalid or missing analysis_id"}), 400

    session = SESSIONS[analysis_id]
    payload = {
        "company": session.get("company", {}),
        "financials": session.get("financials", {}),
        "research": session.get("research", {}),
        "scoring": session.get("scoring", {}),
        "recommendation": session.get("recommendation", {}),
    }

    pdf_bytes = generate_cam_pdf(payload)
    filename = f"CAM_{session.get('company', {}).get('name', 'company')}.pdf".replace(" ", "_")

    return send_file(
        BytesIO(pdf_bytes),
        mimetype="application/pdf",
        as_attachment=True,
        download_name=filename,
    )


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5001"))
    app.run(host="0.0.0.0", port=port, debug=True)

