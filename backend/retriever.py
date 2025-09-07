import os
os.environ["TOKENIZERS_PARALLELISM"] = "false"  # add this to prevent forking with HF tokenizers

from langchain.docstore.document import Document
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.tools.retriever import create_retriever_tool
from langgraph.prebuilt import ToolNode

def load_documents_from_directory(directory_path):
    """Load documents from a directory of text files."""
    documents = []
    
    # Check if directory exists
    if not os.path.exists(directory_path):
        print(f"Directory {directory_path} does not exist.")
        return Exception(f"Directory {directory_path} does not exist.")
    
    
    for filename in os.listdir(directory_path):
        if filename.endswith(".txt"):
            file_path = os.path.join(directory_path, filename)
            try:
                with open(file_path, "r", encoding="utf-8") as file:
                    text = file.read()
                    documents.append(Document(
                        page_content=text, 
                        metadata={"filename": filename, "source": file_path}
                    ))
            except Exception as e:
                print(f"Error reading file {filename}: {e}")
    
    return documents

def create_retriever_system(docs_directory="./docs"):
    """Create a complete retriever system with vector store and tools."""
    
    # Load documents
    try:

        documents = load_documents_from_directory(docs_directory)
    
    except Exception as e:
        print(f"Error loading documents: {e}")
        return Exception(f"Error loading documents: {e}")
    
    # Split the documents into chunks for vector store
    text_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
        chunk_size=500, 
        chunk_overlap=50
    )
    doc_splits = text_splitter.split_documents(documents)
    
    # Create embedding model
    embed_model = FastEmbedEmbeddings(model_name="BAAI/bge-base-en-v1.5")
    
    # Create vector store
    vectorstore = InMemoryVectorStore.from_documents(
        documents=doc_splits,
        embedding=embed_model
    )
    
    # Create retriever
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    
    # Create retriever tool
    retriever_tool = create_retriever_tool(
        retriever,
        "retrieve_documents",
        "Search and return relevant information from the document store.",
    )
    
    # Create tools array and tools node
    tools = [retriever_tool]
    tools_node = ToolNode(tools)
    
    return {
        "vectorstore": vectorstore,
        "retriever": retriever,
        "retriever_tool": retriever_tool,
        "tools": tools,
        "tools_node": tools_node
    }

def test_retrieval(retriever_system, query="Hello world"):
    """Test the retrieval system with a sample query."""
    vectorstore = retriever_system["vectorstore"]
    results = vectorstore.similarity_search(query, k=3)
    print(f"Query: {query}")
    print(f"Results: {results}")
    return results

# Initialize the retriever system
if __name__ == "__main__":
    # You can change the directory path to point to your documents
    retriever_system = create_retriever_system("./docs")
    
    # Test the system
    test_retrieval(retriever_system, "What information do you have?")
