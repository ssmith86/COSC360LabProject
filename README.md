# COSC360LabProject

## About

This is a full-stack event management web application built for COSC 360 Web Programming Course with React, Node.js, and MongoDB. Users can browse, create, save, and comment on local events. The app supports two roles:

- **Registered users** — can create events, save favorites, leave comments, and manage their profile
- **Admin users** — can manage all events and users, and view analytics/insights

## Getting Started (Docker)

Make sure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### 1. Clone the repository

```bash
git clone https://github.com/ssmith86/COSC360LabProject.git
cd COSC360LabProject
```

### 2. Start the app

```bash
docker compose down -v
docker compose up --build
```

### 3. Open in your browser

Once the container is running, navigate to:
`http://localhost:4000`

### 4. Note

If you are testing asynchronous update, use one account
in Chrome, and open and log into another account using
Chrome Incognito window.
