from fastapi import FastAPI, File, UploadFile, Form, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import PyPDF2
import io
import uuid
import os
import asyncio
from langchain_groq import ChatGroq
from langchain.schema import SystemMessage, HumanMessage, AIMessage
from langchain.callbacks.base import BaseCallbackHandler

app = FastAPI()

# Configure CORS for React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store for session context (In production, use Redis or a Database)
interview_sessions = {}

@app.post("/api/setup-interview")
async def setup_interview(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    """
    Parses the uploaded Resume PDF and stores the context mapping to a session_id.
    """
    pdf_content = await resume.read()
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_content))
    
    resume_text = ""
    for page in pdf_reader.pages:
        extracted = page.extract_text()
        if extracted:
            resume_text += extracted + "\n"
            
    session_id = str(uuid.uuid4())
    interview_sessions[session_id] = {
        "resume": resume_text,
        "job_description": job_description,
        "history": []
    }
    
    return {"session_id": session_id}

class AsyncCallbackHandler(BaseCallbackHandler):
    """Callback handler to stream LLM tokens directly to the WebSocket."""
    def __init__(self, websocket: WebSocket):
        self.websocket = websocket
    
    async def on_llm_new_token(self, token: str, **kwargs) -> None:
        await self.websocket.send_text(token)

@app.websocket("/ws/interview/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """
    WebSocket endpoint for the live interview.
    Retrieves context, builds the prompt, and streams responses.
    """
    await websocket.accept()
    
    if session_id not in interview_sessions:
        await websocket.send_text("Error: Invalid session ID.")
        await websocket.close()
        return
        
    session_data = interview_sessions[session_id]
    
    system_prompt = f"""You are an expert AI Interviewer. 
Here is the candidate's Resume: 
{session_data["resume"]}

Here is the Job Description they are applying for: 
{session_data["job_description"]}

INSTRUCTIONS:
1. Ask highly specific technical and behavioral questions based on their resume experience that align with the job description.
2. Ask ONE question at a time.
3. Wait for their answer before asking the next question.
4. Keep your responses conversational, concise, and professional. Do not provide a transcript or act out the candidate's role."""

    # Initialize the LLM (Ensure GROQ_API_KEY is in your environment variables)
    llm = ChatGroq(
        temperature=0.7, 
        model_name="llama3-8b-8192", 
        streaming=True,
    )
    
    # If starting fresh, append the System Prompt and trigger the first question
    if not session_data["history"]:
        session_data["history"].append(SystemMessage(content=system_prompt))
        
        intro_prompt = "Introduce yourself briefly and ask the first question based on my resume and the job description."
        messages = session_data["history"] + [HumanMessage(content=intro_prompt)]
        
        callback = AsyncCallbackHandler(websocket)
        response = await llm.ainvoke(messages, config={"callbacks": [callback]})
        session_data["history"].append(AIMessage(content=response.content))
        await websocket.send_text("[DONE]")

    try:
        while True:
            # Wait for candidate's voice transcript via WebSocket
            user_message = await websocket.receive_text()
            session_data["history"].append(HumanMessage(content=user_message))
            
            # Stream AI Response
            callback = AsyncCallbackHandler(websocket)
            response = await llm.ainvoke(session_data["history"], config={"callbacks": [callback]})
            
            session_data["history"].append(AIMessage(content=response.content))
            
            # Signal the frontend that the response stream is complete
            await websocket.send_text("[DONE]")
            
    except WebSocketDisconnect:
        print(f"Candidate disconnected from session: {session_id}")
