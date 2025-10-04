from fastapi import FastAPI, Header, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import shutil
from pydantic import BaseModel # Import BaseModel for response validation
from typing import List, Dict, Any # Import typing for response model

# --- AI Core Imports ---
from ai_core.extractor import extract_text_from_pdf
from ai_core.generator import (
    extract_key_concepts, 
    generate_detailed_explanation_with_diagrams, 
    generate_practical_scenario, 
    evaluate_user_answer
)
from ai_core.quiz_generator import generate_quiz_questions
from ai_core.utils import ensure_dir

load_dotenv()
app = FastAPI(title="LearnVerse Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CHAPTER_CACHE = {"text": ""}
UPLOAD_DIR = "uploads"
ensure_dir(UPLOAD_DIR)

# --- Define the Response Structure for the new endpoint ---
class LearningModuleResponse(BaseModel):
    explanation: str
    scenario: str | None
    questions: List[Dict[str, Any]]

@app.post("/api/analyze-pdf")
async def analyze_pdf_and_get_concepts(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    full_text = extract_text_from_pdf(file_path)
    if not full_text:
        raise HTTPException(status_code=400, detail="Could not extract text from PDF.")

    CHAPTER_CACHE["text"] = full_text
    concepts = extract_key_concepts(full_text)
    
    if not concepts or "error" in concepts[0].lower():
        raise HTTPException(status_code=500, detail=concepts[0] if concepts else "Failed to extract concepts.")
    
    return {"concepts": concepts}

# --- ✅ NEW UNIFIED ENDPOINT ---
# This single endpoint replaces the three separate ones for explanation, scenario, and quiz.
@app.get("/")
async def root():
    return {"message": "LearnVerse AI Backend is running!"}

@app.post("/api/get-learning-module", response_model=LearningModuleResponse)
async def create_learning_module(concept: str = Form(...)):
    full_text = CHAPTER_CACHE.get("text")
    if not full_text:
        raise HTTPException(status_code=400, detail="Chapter content not found. Please upload a PDF first.")

    try:
        # 1. Generate the detailed explanation
        explanation = generate_detailed_explanation_with_diagrams(full_text, concept)
        if "error" in explanation.lower():
            raise HTTPException(status_code=500, detail=explanation)

        # 2. Generate the practical scenario based on the explanation
        scenario = generate_practical_scenario(concept, explanation)
        if "error" in scenario.lower():
            # A scenario failing isn't critical, so we can return None instead of stopping
            scenario = None

        # 3. Generate the quiz based on the explanation
        quiz_data = generate_quiz_questions(explanation)
        if "error" in quiz_data:
            raise HTTPException(status_code=500, detail=quiz_data["error"])

        # 4. Return all generated content in a single response
        return {
            "explanation": explanation,
            "scenario": scenario,
            "questions": quiz_data.get("questions", []) # Safely get the questions list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")


@app.post("/api/evaluate-answer")
async def evaluate_answer(scenario: str = Form(...), user_answer: str = Form(...), explanation: str = Form(...)):
    feedback = evaluate_user_answer(scenario, user_answer, explanation)
    if "error" in feedback.lower():
        raise HTTPException(status_code=500, detail=feedback)
    return {"feedback": feedback}

# --- OLD ENDPOINTS (COMMENTED OUT AS THEY ARE NO LONGER USED BY THE FRONTEND) ---
#
# @app.post("/api/get-explanation")
# async def get_explanation(concept: str = Form(...)):
#     full_text = CHAPTER_CACHE.get("text")
#     if not full_text:
#         raise HTTPException(status_code=400, detail="Please upload a chapter first.")
#
#     explanation = generate_detailed_explanation_with_diagrams(full_text, concept)
#     if "error" in explanation.lower():
#         raise HTTPException(status_code=500, detail=explanation)
#         
#     return {"explanation": explanation}
#
# @app.post("/api/get-scenario")
# async def get_scenario(concept: str = Form(...), explanation: str = Form(...)):
#     scenario = generate_practical_scenario(concept, explanation)
#     if "error" in scenario.lower():
#         raise HTTPException(status_code=500, detail=scenario)
#     return {"scenario": scenario}
#
# @app.post("/api/get-quiz")
# async def get_quiz(explanation: str = Form(...)):
#     quiz_data = generate_quiz_questions(explanation)
#     if "error" in quiz_data:
#         raise HTTPException(status_code=500, detail=quiz_data["error"])
#     return quiz_data