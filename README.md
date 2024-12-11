# csc337-final-project
Final project for CSC 337 - Web Development

| Contributors      |
| ----------------- |
| Ivan Gusachenko   |
| Garrett Scott |
| Jackson Grove |
| Lucas Dargert |
## Run instructions
The easiest way to run the project is using Docker. With docker installed on the machine the project can be deployed using the command:
```bash
# Make sure your docker services are running.
# For example on Windows it's necessary to open the docker executable to start the service and avoid errors.
docker-compose up --build
```
This brings down the docker container while keeping account data.
```bash
docker-compose down
```
This deletes the database and all accounts:
```bash
# Warning, deletes data!!!
docker-compose down --volumes
```
Additionally Ctrl-C can be used to bring down the container while keeping accounts or the provided tools from the Docker executable or IDE can be used instead to manage the containers.

## Overview
This project will implement a network multiplayer Tic Tac Toe game. Users will be able to log into the service an pick another user to play against. Users can play in real time but can also save the state of the game to be resumed Later. Each user account will store statistics vs another player and their overall wins:losses. (TBD) the user can also play against an AI in the event there are no availible players to play against.  
## Frontend

## Backend

## Timeline
