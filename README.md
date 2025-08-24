# Math Notes

An interactive application that allows users to draw mathematical expressions and get them solved using AI. The application uses Google's Gemini AI for mathematical expression recognition and solving.

## Features

- Draw mathematical expressions on a canvas
- Real-time recognition and solving of expressions
- Support for variables and equations
- Clean and intuitive user interface
- Responsive design that works on different screen sizes

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Python 3.8+ (for the backend)
- Google Gemini API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/math-notes.git
   cd math-notes
   ```

2. Install frontend dependencies:
   ```bash
   cd calculator
   npm install
   ```

3. Set up the backend:
   ```bash
   cd ../calculator_backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the `calculator_backend` directory with your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

### Running the Application

1. Start the backend server:
   ```bash
   cd calculator_backend
   python main.py
   ```

2. In a new terminal, start the frontend development server:
   ```bash
   cd calculator
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Use your mouse or touch screen to draw mathematical expressions on the canvas
2. Click the "Run" button to process the expression
3. The solution will appear on the canvas
4. Use the color picker to change the drawing color
5. Click "Reset" to clear the canvas

## Built With

- [React](https://reactjs.org/) - Frontend library
- [TypeScript](https://www.typescriptlang.org/) - Type checking
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [MathJax](https://www.mathjax.org/) - Math rendering
- [FastAPI](https://fastapi.tiangolo.com/) - Backend framework
- [Google Gemini](https://ai.google/gemini) - AI model for math recognition

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
