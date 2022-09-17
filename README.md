# Crowd Poll

## Description
[Crowd Poll](https://crowdpolls.web.app) is a full stack web app that allows users to generate a poll and crowd source answer options.

Owner View                   |  User View
:---------------------------:|:-------------------------:
![Owner View](ownerdemo.png) | ![User View](userdemo.png)

## Installation
Clone this repository. In the backend folder, create a .env file with 2 variables, MONGO_URI and PORT. Assign them values, with MONGO_URI allowing you to connect to your MongoDB database and PORT being the default port.

```
git clone https://github.com/tamandrew/CrowdPoll.git
cd CrowdPoll/backend
touch .env
echo "MONGO_URI=yourURI" >> .env
echo "PORT=yourPortNumber" >> .env
```

To run your local servers, in each of the backend and frontend folders, install npm dependencies and run npm start. Make sure to change the urls of the fetch functions in the frontend to your localhost.

```
cd backend
npm install
npm start
```
```
cd ../frontend
npm install
npm start
```
