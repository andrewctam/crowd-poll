# Crowd Poll

## Description
Crowd Poll is a full stack web app that allows users to generate a poll and crowd source answer options.


## Installation
Clone this repository. Create a .env file with 2 variables, MONGO_URI and PORT. Assign them values, with MONGO_URI allowing you to connect to your MongoDB databse and PORT being the default port.

```
git clone https://github.com/tamandrew/CrowdPoll.git
cd CrowdPoll
touch .env
echo "MONGO_URI=yourURI" >> .env
echo "PORT=yourPortNumber" >> .env
```

To run your local servers, run the backend using npm start. Change into the frontend folder and run npm start.

```
npm start
cd frontend
npm start
```
