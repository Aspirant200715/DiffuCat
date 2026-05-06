# 🧬 DiffuCat: Enterprise AI Catalyst Discovery Platform

**DiffuCat** is a next-generation scientific intelligence platform designed to accelerate the discovery of high-performance catalysts. By combining **Graph Neural Networks (GNNs)** with immersive **3D molecular visualization**, DiffuCat enables researchers to predict, simulate, and optimize complex chemical topologies with unprecedented speed and precision.

---

## 🚀 Deployment Status
| Service | Status | Link |
| :--- | :--- | :--- |
| **Scientific Dashboard** | 🟢 Live | [INSERT_DEPLOYED_LINK_HERE] |
| **Inference Engine** | 🟢 Operational | [INSERT_API_LINK_HERE] |

---

## ✨ Key Features

### 📊 Mission Control Dashboard
A high-fidelity "Command Center" for molecular research.
*   **Structural Analysis**: Real-time prediction of catalyst activity, selectivity, and stability.
*   **Inference Stream**: Live tracking of model performance and candidate generation.
*   **High-Contrast Topology**: Immediate access to SMILES metadata and structural descriptors.

### 🧪 Advanced Laboratory Console
The bridge between digital prediction and physical synthesis.
*   **Discovery Pipeline**: Submit candidate batches for virtual or automated lab testing.
*   **Simulation Engine**: Track chemical reaction trajectories and materialization status.
*   **Structural Archive**: A metric-driven database for storing and filtering successful catalyst designs.

### 🌌 Immersive 3D Visualization
State-of-the-art molecular rendering powered by **3Dmol.js**.
*   **Uncertainty Heatmaps**: Direct projection of model confidence onto the molecular structure (Green = Confident, Red = Uncertain).
*   **Multi-Modal Rendering**: Switch between **Stick**, **Sphere**, and **Cross** representations with a single click.
*   **Atomic Telemetry**: Interactive HUD displaying real-time topology metadata and active scanning states.

---

## 🛠️ Technology Stack
*   **Frontend**: Next.js 14/15, Tailwind CSS, Framer Motion, 3Dmol.js.
*   **Backend**: FastAPI (Python), Graph Neural Networks (GNNs).
*   **Data Management**: DVC (Data Version Control) for reproducible research.
*   **DevOps**: Docker, Celery (for asynchronous prediction pipelines).

---

## 📖 How to Run This Project (Step-by-Step)

This guide is designed for everyone—from technical engineers to research scientists.

### **Phase 1: Environment Setup**
1.  **Download the Code**: Click the green "Code" button and select "Download ZIP", or use the command:
    ```bash
    git clone https://github.com/Aspirant200715/DiffuCat.git
    ```
2.  **Install Python**: Ensure you have Python 3.9+ installed on your system.
3.  **Install Node.js**: Ensure you have Node.js 18+ installed on your system.

---

### **Phase 2: Launching the Backend (The "Brain")**
The backend handles the AI predictions and chemical simulations.
1.  Open your terminal/command prompt.
2.  Navigate to the project root directory.
3.  **Create a Virtual Environment** (Highly Recommended):
    ```bash
    python -m venv .venv
    .venv\Scripts\activate  # On Windows
    source .venv/bin/activate  # On Mac/Linux
    ```
4.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
5.  **Start the Inference Server**:
    ```bash
    python -m src.backend.main
    ```
    *The server will typically start at `http://localhost:8002`.*

---

### **Phase 3: Launching the Frontend (The "Interface")**
The frontend provides the beautiful dashboard and 3D visualization.
1.  Open a **new** terminal window.
2.  Navigate to the `frontend` folder:
    ```bash
    cd frontend
    ```
3.  **Install Dependencies**:
    ```bash
    npm install
    ```
4.  **Start the Interface**:
    ```bash
    npm run dev
    ```
5.  **Access the Platform**: Open your browser and go to `http://localhost:3000`.

---

## 🔬 Operational Workflow
1.  **Enter SMILES**: Input a chemical SMILES string (e.g., `CCN`) into the Discovery Console.
2.  **Predict**: Click **"Analyze Structure"** to trigger the GNN inference engine.
3.  **Visualize**: Use the 3D Viewer to inspect the catalyst. Look for **Red Areas**—these indicate where the model is uncertain and where more data might be needed.
4.  **Simulate**: Submit successful candidates to the **Laboratory** for batch processing.

---

## 📝 Research & Development
DiffuCat is built with a focus on **explainable AI** in chemistry. By visualizing uncertainty directly on the atomic structure, we empower scientists to understand *why* a model makes a prediction, moving beyond "Black Box" AI.


