import os, json, re, google.generativeai as genai
from dotenv import load_dotenv
load_dotenv()
GEMINI_KEY = os.getenv("GEMINI_API_KEY")

def extract_key_concepts(full_text):
    if not GEMINI_KEY: return ["Error: GEMINI_API_KEY not found."]
    try:
        genai.configure(api_key=GEMINI_KEY)
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f'Read the following text and identify the main learning concepts. Return as a JSON list of strings. Text: "{full_text[:15000]}"'
        response = model.generate_content(prompt)
        json_text = response.text.strip().replace("```json", "").replace("```", "")
        return json.loads(json_text)
    except Exception as e:
        return [f"Error extracting concepts: {e}"]

def generate_detailed_explanation_with_diagrams(context_text, concept_title):
    if not GEMINI_KEY: return "Error: GEMINI_API_KEY not found."
    try:
        genai.configure(api_key=GEMINI_KEY)
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"""
        Act as an expert science teacher. For the concept "{concept_title}", write a detailed explanation.
        - Use markdown for headings, bold text, and bullet points.
        - Break the explanation into multiple paragraphs.
        - **Integrate 2-3 simple Mermaid.js flowcharts (`graph TD`) directly within the explanation.**
          - Each diagram must be enclosed in ```mermaid ... ``` blocks.
          - Place them at logical points where a visual would be most helpful.

        Context: "{context_text[:12000]}"
        """
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error: Failed to generate explanation: {e}"

def generate_practical_scenario(concept_title, context_text):
    if not GEMINI_KEY: return "Error: GEMINI_API_KEY not found."
    try:
        genai.configure(api_key=GEMINI_KEY)
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"""
        Based on the concept of "{concept_title}", create a short, practical, real-world scenario problem for a 10th-grade student.
        The scenario should end with a question.
        Return only the scenario and the question.

        Context: "{context_text[:2000]}"
        """
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"Error generating scenario: {e}"

def evaluate_user_answer(scenario, user_answer, context_text):
    if not GEMINI_KEY: return "Error: GEMINI_API_KEY not found."
    try:
        genai.configure(api_key=GEMINI_KEY)
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"""
        A student was given the scenario: "{scenario}"
        The student answered: "{user_answer}"
        Evaluate the student's answer based on the correct scientific principles from the context below.
        - Start with "### Feedback:"
        - State if their reasoning is correct, partially correct, or incorrect.
        - Provide a simple, encouraging explanation of the correct answer.
        - Use markdown for formatting.

        Correct Context: "{context_text[:4000]}"
        """
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"Error evaluating answer: {e}"