# AI Chat Application

This is the basic AI Chat Application with no user login's ** [Just for fun and learning]**


### Prerequisites

_A guide on how to install the tools needed for running the project._

Explain the process step by step.

A. Setup Database
```bash
Go to neon.com -> Create one project there -> Inside sql editor -> paste this :
 
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  role VARCHAR(50),
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

Change the env link.
```

C. Change the api link
```bash
After setting up db -> Go to client app.jsx -> search for fetch(' ') . -> change the render url to https://localhost:3000/...
```


D.  In Phase1/server
```bash
node server.js
```

E.  In Phase1/client 
```bash
npm run dev
```

Then Check ```localhost:5173``` in browser to see

## Deploy

Deploy in the render and make a database in the neon db.


## License
This is the Phase1 of the GENAI LEARNING COURSE , this is not a full stack project this is a small project used for learning.
