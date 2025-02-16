# anthropic_hackathon


curl -X 'GET' \
  'http://127.0.0.1:8000/rag_request' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "text": "hello"
}'

uvicorn RAG:app --reload

uvicorn server:app --port=8001 --reload

