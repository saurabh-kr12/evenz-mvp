# Evenz MVP

A MERN stack platform to connect clients with caterers.

## 🔧 Project Structure

- `evenz-clients`: Client frontend (React/Next.js, port 3000)
- `evenz-caterers`: Caterer dashboard (React/Next.js, port 3001)
- `evenz-admin`: Admin dashboard (React/Next.js, port 3002)
- `evenz-backend`: Backend API (Express.js, MongoDB, port 5000)

## 🛠 How to Run Locally

```bash
# In separate terminals:

cd evenz-backend
npm install
npm run dev

cd evenz-clients
npm install
npm run dev

cd evenz-caterers
npm install
npm run dev

cd evenz-admin
npm install
npm run dev
