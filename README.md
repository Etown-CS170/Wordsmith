Install Instuctions
Prerequisites:
- [Node.js](https://nodejs.org/en)
- [Python 3](https://www.python.org/)
- [MongoDB](https://www.mongodb.com/)

# Setup Steps:
## 1. Clone the repository:
```
git clone https://github.com/Etown-CS170/Wordsmith.git
cd Wordsmith
```

## 2. Install dependencies:

Frontend:
```
cd Client
npm install
```
Backend:
```
cd /Server
pip install -r requirements.txt
```
## 3. Setup Env File
Add a file called .env to the server directory
Place the following into the file and fill in the missing infomation
```
    OPENAI= YOUR_OPENAI_KEY_HERE
    MONGO_URI = MONGO_DB URL (default is mongodb://localhost:27017/)
    DATABASE_NAME = Database_Name_Here (default is WordSmith)
    COLLECTION_NAME = Collection_Name_Here (default is Elements) 
```
# Running Program 

Frontend:
```
cd Client
npm run dev
```

Backend:
```
cd Server
python app.py
```

