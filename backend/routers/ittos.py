from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter(prefix="/api/ittos", tags=["ittos"])

# Sample Static Graph Seed for "Develop Project Charter"
STATIC_GRAPH_DATA = {
    "nodes": [
        {"id": "process-1", "type": "default", "data": {"label": "Develop Project Charter", "category": "Process", "description": "Developing a document that formally authorizes the existence of a project."}, "position": {"x": 400, "y": 250}, "style": {"backgroundColor": "#3b82f6", "color": "white", "fontWeight": "bold", "padding": "15px", "borderRadius": "8px"}},
        
        # Inputs
        {"id": "input-1", "type": "input", "data": {"label": "Business Case", "category": "Input"}, "position": {"x": 50, "y": 150}, "style": {"backgroundColor": "#10b981", "color": "white", "padding": "10px", "borderRadius": "4px"}},
        {"id": "input-2", "type": "input", "data": {"label": "Benefits Management Plan", "category": "Input"}, "position": {"x": 50, "y": 250}, "style": {"backgroundColor": "#10b981", "color": "white", "padding": "10px", "borderRadius": "4px"}},
        {"id": "input-3", "type": "input", "data": {"label": "Agreements", "category": "Input"}, "position": {"x": 50, "y": 350}, "style": {"backgroundColor": "#10b981", "color": "white", "padding": "10px", "borderRadius": "4px"}},
        
        # Tools & Techniques
        {"id": "tool-1", "type": "default", "data": {"label": "Expert Judgment", "category": "Tool"}, "position": {"x": 400, "y": 50}, "style": {"backgroundColor": "#f59e0b", "color": "white", "padding": "10px", "borderRadius": "4px"}},
        {"id": "tool-2", "type": "default", "data": {"label": "Data Gathering", "category": "Tool"}, "position": {"x": 250, "y": 50}, "style": {"backgroundColor": "#f59e0b", "color": "white", "padding": "10px", "borderRadius": "4px"}},
        {"id": "tool-3", "type": "default", "data": {"label": "Interpersonal Skills", "category": "Tool"}, "position": {"x": 550, "y": 50}, "style": {"backgroundColor": "#f59e0b", "color": "white", "padding": "10px", "borderRadius": "4px"}},

        # Outputs
        {"id": "output-1", "type": "output", "data": {"label": "Project Charter", "category": "Output"}, "position": {"x": 750, "y": 200}, "style": {"backgroundColor": "#ef4444", "color": "white", "padding": "10px", "borderRadius": "4px", "fontWeight": "bold"}},
        {"id": "output-2", "type": "output", "data": {"label": "Assumption Log", "category": "Output"}, "position": {"x": 750, "y": 300}, "style": {"backgroundColor": "#ef4444", "color": "white", "padding": "10px", "borderRadius": "4px"}},
    ],
    "edges": [
        {"id": "e1", "source": "input-1", "target": "process-1", "animated": True, "style": {"stroke": "#10b981", "strokeWidth": 2}},
        {"id": "e2", "source": "input-2", "target": "process-1", "animated": True, "style": {"stroke": "#10b981", "strokeWidth": 2}},
        {"id": "e3", "source": "input-3", "target": "process-1", "animated": True, "style": {"stroke": "#10b981", "strokeWidth": 2}},
        
        {"id": "e4", "source": "tool-1", "target": "process-1", "style": {"stroke": "#f59e0b", "strokeDasharray": "5,5"}},
        {"id": "e5", "source": "tool-2", "target": "process-1", "style": {"stroke": "#f59e0b", "strokeDasharray": "5,5"}},
        {"id": "e6", "source": "tool-3", "target": "process-1", "style": {"stroke": "#f59e0b", "strokeDasharray": "5,5"}},
        
        {"id": "e7", "source": "process-1", "target": "output-1", "animated": True, "style": {"stroke": "#ef4444", "strokeWidth": 3}},
        {"id": "e8", "source": "process-1", "target": "output-2", "animated": True, "style": {"stroke": "#ef4444", "strokeWidth": 2}},
    ]
}

@router.get("/graph")
async def get_itto_graph() -> Dict[str, Any]:
    """
    Returns the nodes and edges for the React Flow ITTO Knowledge Graph.
    Currently returns a static seed for 'Develop Project Charter'.
    """
    return STATIC_GRAPH_DATA

@router.get("/nodes/{node_id}/explanation")
async def get_node_explanation(node_id: str) -> Dict[str, str]:
    """
    Simulates an AI generating a dynamic explanation of why this node exists in the flow.
    """
    explanations = {
        "input-1": "The Business Case provides the financial and strategic justification for the project.",
        "input-2": "The Benefits Management Plan describes how and when the project benefits will be delivered.",
        "tool-1": "Expert Judgment ensures the charter is realistic and aligned with organizational goals.",
        "output-1": "The Project Charter formally authorizes the project manager to apply resources to project activities.",
    }
    
    return {
        "explanation": explanations.get(node_id, "This element is a standard part of the PMBOK knowledge flow.")
    }
