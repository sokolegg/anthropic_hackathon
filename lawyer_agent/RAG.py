
from llama_index.vector_stores.duckdb import DuckDBVectorStore
from llama_index.core import StorageContext
from llama_index.core import Document
import torch
from llama_index.core import Settings
from llama_index.llms.anthropic import Anthropic
from transformers import BertModel
from llama_index.core.node_parser import SimpleNodeParser
from llama_index.core import VectorStoreIndex

from pydantic import BaseModel
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import logging
import sys

logging.basicConfig(stream=sys.stdout, level=logging.INFO)
logging.getLogger().addHandler(logging.StreamHandler(stream=sys.stdout))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CLAUDE_KEY = ""


class TextRequest(BaseModel):
    text: str

print("0")
# Инициализация Claude через LlamaIndex
llm = Anthropic(
    api_key=CLAUDE_KEY,
    model="claude-3-opus-20240229",
    max_tokens=2000,
)

from llama_index.embeddings.huggingface import HuggingFaceEmbedding
embed_model = HuggingFaceEmbedding("bert-base-uncased")
# embed_model = BertModel.from_pretrained("bert-base-uncased", torch_dtype=torch.float32)

Settings.llm = llm
Settings.embed_model = embed_model
print("1")
documents = [
    Document(text=el)
    for el in ["hello", "i'm here to help you", "wow, wow, it was an amazing journey"]
]
print("2")

vector_store = DuckDBVectorStore()
print("3")
storage_context = StorageContext.from_defaults(vector_store=vector_store)
print("4")
index = VectorStoreIndex.from_documents(
    documents, storage_context=storage_context
)
print("5")

query_engine = index.as_query_engine()
print("6")


@app.get("/rag_request")
async def rag_request(request: TextRequest):
    print("I'm ready for your try")
    response = query_engine.query(request.text)
    return {"response": response}


@app.post("/insert_into_index")
async def insert_into_index(request: TextRequest):
    parser = SimpleNodeParser()
    new_nodes = parser.get_nodes_from_documents([Document(text=request.text)])
    index.insert_nodes(new_nodes)
