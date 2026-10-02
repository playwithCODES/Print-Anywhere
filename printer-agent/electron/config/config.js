const config = {
  apiBaseUrl: process.env.AGENT_API_URL || "https://print-anywhere.onrender.com/api",
    frontendUrl:
    process.env.AGENT_FRONTEND_URL ||
    "http://localhost:3001",
};

export default config;