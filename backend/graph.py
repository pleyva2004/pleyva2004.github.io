from typing import TypedDict, List, Optional, Literal
from langgraph.graph import START, END, StateGraph
from langchain.schema import Document, HumanMessage, AIMessage
from langchain_core.messages import BaseMessage
import logging

from retriever import create_retriever_system
from utils import _llm

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RAGState(TypedDict):
    """Enhanced state with comprehensive tracking"""
    question: str
    messages: List[BaseMessage]
    context: List[Document]
    answer: Optional[str]
    requires_retrieval: Optional[bool]
    retrieval_confidence: Optional[float]
    processing_time: Optional[float]

class ProductionRAGGraph:
    """Production-grade RAG graph with intelligent routing"""
    
    def __init__(self, docs_directory: str = "./docs"):
        self.docs_directory = docs_directory
        self.retrieval_components = create_retriever_system(docs_directory)
        self.llm = _llm()
    
    def routing_node(self, state: RAGState) -> RAGState:
        """Intelligent routing to determine if retrieval is needed"""
        try:
            routing_prompt = f"""
            Analyze this question: "{state['question']}"
            
            Does this question require retrieving external documents to answer properly?
            Consider:
            - Is this a general knowledge question?
            - Does it ask about specific documents or information?
            - Is it a greeting or simple conversational query?
            
            Respond with only: "RETRIEVE" or "DIRECT"
            """
            
            result = self.llm.invoke(routing_prompt)
            requires_retrieval = "RETRIEVE" in str(result).upper()
            
            logger.info(f"Routing decision: {'RETRIEVE' if requires_retrieval else 'DIRECT'}")
            
            return {
                **state,
                "requires_retrieval": requires_retrieval,
                "messages": state.get("messages", [])
            }
            
        except Exception as e:
            logger.error(f"Error in routing: {e}")
            # Default to retrieval on error
            return {**state, "requires_retrieval": True, "messages": state.get("messages", [])}
    
    def retrieve_node(self, state: RAGState) -> RAGState:
        """Enhanced retrieval with quality assessment"""
        try:
            retriever = self.retrieval_components["retriever"]
            
            # Use the retriever directly to get documents
            docs = retriever.invoke(state["question"])
            
            # Assess retrieval quality
            confidence = self._assess_retrieval_quality(state["question"], docs)
            
            logger.info(f"Retrieved {len(docs)} documents with confidence: {confidence:.2f}")
            
            return {
                **state,
                "context": docs,
                "retrieval_confidence": confidence,
                "messages": state.get("messages", [])
            }
            
        except Exception as e:
            logger.error(f"Error in retrieval: {e}")
            return {**state, "context": [], "retrieval_confidence": 0.0}
    
    def generate_node(self, state: RAGState) -> RAGState:
        """Enhanced generation with context-aware prompting"""
        try:
            if state.get("requires_retrieval", True) and state.get("context"):
                # Context-aware generation
                context_str = "\n\n".join([
                    f"[{i+1}] {doc.page_content}" 
                    for i, doc in enumerate(state["context"])
                ])
                
                prompt = f"""
                You are a helpful website assistant. Answer the user's question using ONLY the provided context.
                If the context doesn't contain enough information, acknowledge what you can answer and what you cannot.
                
                Question: {state['question']}
                
                Context:
                {context_str}
                
                Provide a clear, accurate answer based on the context above:
                """
            else:
                # Direct generation for simple queries
                prompt = f"""
                You are a helpful website assistant. Answer this question directly and conversationally:
                
                Question: {state['question']}
                
                Answer:
                """
            
            result = self.llm.invoke(prompt)
            answer = str(result)
            
            logger.info(f"Generated answer of length: {len(answer)}")
            
            return {
                **state,
                "answer": answer,
                "messages": state.get("messages", []) + [AIMessage(content=answer)]
            }
            
        except Exception as e:
            logger.error(f"Error in generation: {e}")
            return {
                **state, 
                "answer": "I apologize, but I encountered an error processing your request."
            }
    
    def _assess_retrieval_quality(self, question: str, docs: List[Document]) -> float:
        """Assess the quality of retrieved documents"""
        if not docs:
            return 0.0
        
        # Simple heuristic: check for question keywords in retrieved docs
        question_words = set(question.lower().split())
        total_score = 0
        
        for doc in docs:
            doc_words = set(doc.page_content.lower().split())
            overlap = len(question_words.intersection(doc_words))
            score = overlap / len(question_words) if question_words else 0
            total_score += score
        
        return min(total_score / len(docs), 1.0)
    
    def build_graph(self) -> StateGraph:
        """Build the production RAG graph"""
        graph = StateGraph(RAGState)
        
        # Add nodes
        graph.add_node("route", self.routing_node)
        graph.add_node("retrieve", self.retrieve_node)
        graph.add_node("generate", self.generate_node)
        
        # Add edges
        graph.add_edge(START, "route")
        graph.add_conditional_edges(
            "route",
            lambda state: "retrieve" if state.get("requires_retrieval", True) else "generate",
            {"retrieve": "retrieve", "generate": "generate"}
        )
        graph.add_edge("retrieve", "generate")
        graph.add_edge("generate", END)
        
        return graph.compile()

# Factory function
def build_rag_graph(docs_directory: str = "./docs"):
    """Build production-ready RAG graph"""
    rag_system = ProductionRAGGraph(docs_directory)
    return rag_system.build_graph()
