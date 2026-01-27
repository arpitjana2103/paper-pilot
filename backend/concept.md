# Chunks, RAG, and LLM in a PDF-Chat App

## Overview

A PDF-Chat app lets users ask questions about PDF documents and get answers. Instead of sending entire documents to an AI (which is expensive and often impossible due to size limits), we use a system called RAG (Retrieval Augmented Generation).

This document explains how the core components work together.

---

## 1. What are Chunks?

**Chunks** are small pieces of text split from a larger document.

### Why Split Documents?

- **Size limits**: LLMs have token limits (e.g., 200k tokens). A 500-page PDF might exceed this.
- **Cost**: Sending less text to the LLM costs less money.
- **Relevance**: We only want to send the parts of the document that answer the user's question, not the entire thing.
- **Performance**: Smaller context = faster responses.

### Why Use Overlap?

When splitting text into chunks, we intentionally overlap them (e.g., last 50 words of chunk 1 appear in chunk 2).

**Reason**: Important information might fall on a boundary between two chunks. Overlap ensures we don't lose context.

**Example**:
```
Chunk 1: "...the company reported revenue growth of 25%."
Chunk 2: "revenue growth of 25%. This was driven by increased sales..."
         ↑ overlap ensures continuity
```

**Typical settings**:
- Chunk size: 500-1000 tokens
- Overlap: 50-200 tokens

---

## 2. What is RAG (Retrieval Augmented Generation)?

**RAG** is a technique that combines search (retrieval) with AI generation.

### How It Works

1. **User asks a question**: "What was the revenue in Q3?"
2. **Search through chunks**: Find the 3-5 most relevant chunks from the document.
3. **Send only those chunks to the LLM**: Along with the user's question.
4. **LLM generates an answer**: Based on the retrieved context.

### Why Not Send the Full Document?

- **Token limits**: Most documents exceed what an LLM can process.
- **Cost**: Processing 100 pages costs much more than processing 3 relevant chunks.
- **Noise**: Irrelevant information can confuse the LLM or dilute the answer quality.
- **Speed**: Less text = faster processing.

### The Search Step

RAG uses **semantic search**, not keyword search. It finds chunks based on meaning, not just word matches.

**Example**:
- Query: "How much money did we make?"
- Matches chunks about: "revenue", "income", "earnings" (even if they don't say "money")

---

## 3. What is an Embedding Model?

An **embedding model** converts text into numbers (vectors) so we can measure similarity.

### How Text Becomes Numbers

1. **Input text**: "The company grew revenue by 25%"
2. **Embedding model processes it**: Converts to a vector (list of numbers)
3. **Output**: `[0.23, -0.15, 0.87, ..., 0.42]` (typically 768 or 1536 dimensions)

### Why Vectors Are Needed for Search

You can't directly compare two sentences to see if they're similar. But you can compare two vectors using math (cosine similarity, dot product, etc.).

**Process**:
1. Convert all chunks into vectors (done once during document upload).
2. Convert the user's question into a vector (done at query time).
3. Find chunks whose vectors are closest to the question's vector.
4. Return the most similar chunks.

**Example**:
```
Question vector:        [0.8, 0.2, 0.5, ...]
Chunk 1 vector:         [0.7, 0.3, 0.4, ...]  ← similarity: 0.92 (high)
Chunk 2 vector:         [0.1, 0.9, 0.1, ...]  ← similarity: 0.35 (low)
→ Chunk 1 is more relevant
```

**Common embedding models**:
- `text-embedding-3-small` (OpenAI)
- `text-embedding-ada-002` (OpenAI)
- `all-MiniLM-L6-v2` (open-source)

---

## 4. What is an LLM?

An **LLM (Large Language Model)** is the AI that generates natural language responses.

### What It Does

- **Reads text**: Understands the retrieved chunks and the user's question.
- **Generates answers**: Writes a coherent, natural response based on the provided context.
- **Follows instructions**: Can be told to format answers in specific ways, cite sources, etc.

### What It Does NOT Do

- **It doesn't search**: The LLM doesn't find relevant chunks. That's the embedding model's job.
- **It doesn't remember your documents**: Every request is independent unless you send the context again.
- **It doesn't fact-check**: It only knows what you put in the prompt. If you give it wrong information, it'll use it.

**Common LLMs**:
- GPT-4, GPT-3.5 (OpenAI)
- Claude (Anthropic)
- Llama (Meta)
- Gemini (Google)

---

## 5. Full PDF-Chat Pipeline

Here's how everything works together from start to finish.

### Step 1: Document Upload & Processing (One-time)

```
PDF Upload
    ↓
Extract Text
    ↓
Split into Chunks (with overlap)
    ↓
Generate Embeddings for each chunk
    ↓
Store chunks + embeddings in Vector Database
```

**Example**:
- PDF: 100 pages
- Extracted text: ~50,000 words
- Split into: ~100 chunks
- Each chunk → embedding vector → stored in database

### Step 2: User Query (Every question)

```
User Question: "What was Q3 revenue?"
    ↓
Generate Embedding for the question
    ↓
Search Vector Database
    ↓
Retrieve Top 3-5 Most Similar Chunks
    ↓
Build Prompt:
    - System instruction
    - Retrieved chunks (context)
    - User question
    ↓
Send to LLM
    ↓
LLM Generates Answer
    ↓
Return Answer to User
```

### Full Pipeline Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     INDEXING (Once)                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  PDF Document                                           │
│       ↓                                                 │
│  Text Extraction                                        │
│       ↓                                                 │
│  Chunking (500 tokens, 50 overlap)                      │
│       ↓                                                 │
│  Embedding Model → Vectors                              │
│       ↓                                                 │
│  Store in Vector DB (e.g., Pinecone, Weaviate, Chroma)  │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  QUERY (Every time)                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  User Question                                          │
│       ↓                                                 │
│  Embedding Model → Query Vector                         │
│       ↓                                                 │
│  Vector Search (find similar chunks)                    │
│       ↓                                                 │
│  Top K Chunks Retrieved (e.g., K=3)                     │
│       ↓                                                 │
│  Prompt = Context + Question                            │
│       ↓                                                 │
│  LLM (GPT-4, Claude, etc.)                              │
│       ↓                                                 │
│  Generated Answer                                       │
│       ↓                                                 │
│  Return to User                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Key Takeaways

1. **Chunks** = Small text pieces from your document (with overlap to preserve context).
2. **Embeddings** = Convert text to vectors so we can mathematically compare similarity.
3. **RAG** = Retrieve relevant chunks first, then generate an answer (don't send everything).
4. **LLM** = Reads the retrieved chunks and writes a natural language answer.

**The magic**: Embedding models find what's relevant. LLMs explain it in plain language.

**The efficiency**: Only send what matters to the expensive LLM, not the entire document.

---

## Example in Action

**Document**: 200-page product manual  
**User question**: "How do I reset the device?"

**What happens**:
1. Question converted to embedding vector.
2. Vector search finds chunks 47, 89, 134 (sections mentioning "reset").
3. Only those 3 chunks sent to LLM (not all 200 pages).
4. LLM reads chunks, sees reset instructions, generates answer.
5. User gets: "To reset the device, hold the power button for 10 seconds..."

**Without RAG**: You'd have to send all 200 pages to the LLM (expensive, slow, might exceed limits).

**With RAG**: Send only 3 relevant chunks (cheap, fast, accurate).

---

## Tech Stack Example

| Component | Tool Options |
|-----------|-------------|
| PDF Text Extraction | PyPDF2, pdfplumber, pdf2text |
| Chunking | LangChain, LlamaIndex, custom |
| Embedding Model | OpenAI, Cohere, HuggingFace |
| Vector Database | Pinecone, Weaviate, Chroma, FAISS |
| LLM | GPT-4, Claude, Llama 2 |
| Framework | LangChain, LlamaIndex, custom |

---

## Common Pitfalls

1. **Chunks too small**: Lose context, answers become vague.
2. **Chunks too large**: Harder to find precise information, costs more.
3. **No overlap**: Important info split across boundaries gets lost.
4. **Wrong embedding model**: Poor search quality if model doesn't understand domain language.
5. **Retrieving too few chunks**: Miss important context.
6. **Retrieving too many chunks**: Add noise, increase cost.

**Recommendation**: Start with 500-token chunks, 50-token overlap, retrieve top 3-5 chunks. Tune from there.

---

This is a living document. Update as the implementation evolves.
