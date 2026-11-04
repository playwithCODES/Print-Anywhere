# Print Anywhere

**Print from anywhere, anytime.**

Print Anywhere is an internet-based printer-sharing platform that allows users to send print jobs remotely from a web browser or mobile device to printers connected to another computer.

The system consists of a Web Application, Backend API, and Desktop Printer Agent. Instead of requiring every device to connect directly to a physical printer, Print Anywhere uses a centralized backend to manage printers and print jobs.

## 🚀 Project Overview

The main goal of Print Anywhere is to make printer sharing easier, more flexible, and accessible across different devices and locations.

Users can register printers, upload documents, select an available printer, and submit print requests through the platform. The Desktop Printer Agent receives the print jobs and sends them to the connected physical printer.

## ✨ Features

### Web Application
- User registration and authentication
- User dashboard
- Printer registration and management
- Multiple printer support
- Online and offline printer status
- Printer selection before printing
- Document upload
- Copy selection
- Print job submission
- Print job management

### Desktop Printer Agent
- Secure user authentication
- Automatic local printer detection
- Printer registration
- Multiple registered printer support
- Printer heartbeat and status monitoring
- Background print job processing
- Print job queue management
- Remove registered printers
- Communication with the Print Anywhere backend

### Mobile Application
A separate React Native application is being developed to provide mobile access to Print Anywhere.

## 🏗️ System Architecture

```text
              WEB APPLICATION
                     |
                     |
              MOBILE APPLICATION
                     |
                     v
             PRINT ANYWHERE API
                     |
          +----------+----------+
          |                     |
          v                     v
      MongoDB              Cloudinary
          |
          |
          v
       PRINT JOB QUEUE
          |
          |
          v
    DESKTOP PRINTER AGENT
          |
          |
          v
     LOCAL CONNECTED PRINTER
          |
          v
       PRINT OUTPUT
```

## 🛠️ Technology Stack

| Component | Technologies |
|---|---|
| Web Application | Next.js, React.js, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Authentication | JWT |
| File Storage | Cloudinary |
| Desktop Agent | Electron.js |
| Desktop UI | Next.js |
| API Communication | Axios |
| Mobile Application | React Native, Expo |

## ⚙️ How It Works

1. A user registers and logs in to the Print Anywhere platform.
2. The user installs the Desktop Printer Agent on the computer connected to a physical printer.
3. The Agent detects available local printers and registers them with the user's account.
4. The Agent maintains communication with the backend through heartbeat requests.
5. The user opens the Web Application and selects an online printer.
6. The user uploads a document and submits a print request.
7. The backend creates a print job and places it in the queue.
8. The corresponding Desktop Agent receives the print job.
9. The Agent processes the document and sends it to the selected printer.

## 💻 Installation and Development

### Prerequisites

- Node.js
- npm
- MongoDB database
- Cloudinary account
- Git
- Windows environment for Desktop Printer Agent development

### Clone the Repository

```bash
git clone https://github.com/playwithCODES/print-anywhere.git
```

```bash
cd print-anywhere
```

### Web Application

Navigate to the Web Application directory, install dependencies, configure the required environment variables, and start the development server.

```bash
npm install
npm run dev
```

### Desktop Printer Agent

Navigate to the Desktop Printer Agent directory, install dependencies, configure the API and frontend settings, and start the Electron application.

```bash
npm install
npm start
```

**Note:** The exact directory names and environment variables depend on the project configuration. Refer to the respective application folders before running these commands.

## 🔐 Security

- JWT-based authentication
- Authenticated API communication
- Secure printer registration
- Printer-specific authentication
- Environment-based configuration
- Sensitive credentials must not be committed to GitHub

## 📌 Project Status

Print Anywhere is under active development.

- Web Application: Developed
- Backend API: Developed
- Desktop Printer Agent: Developed with printer management and print job processing
- Mobile Application: Separate React Native project under development

## 👨‍💻 Developer

**playwithCODES**

GitHub: https://github.com/playwithCODES

## 📄 License

License information will be added later.

---

**Print Anywhere — One platform. Multiple devices. Shared printers.**
