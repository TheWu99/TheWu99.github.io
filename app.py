# app.py
# Main file for the MathforAI Flask application.

from flask import Flask, render_template

# Initialize the Flask application
app = Flask(__name__)

# --- Routes ---

@app.route('/')
def index():
    """
    Renders the main homepage for the MathforAI project (Chinese).
    """
    return render_template('index.html')

@app.route('/en')
def index_en():
    """
    Renders the English homepage for the MathforAI project.
    """
    return render_template('index_en.html')

@app.route('/derivative')
def derivative():
    return render_template('derivative.html')

@app.route('/taylor')
def taylor_visualizer():
    """
    Renders the Taylor Series Visualizer page.
    The HTML for this page is taken from the previous interactive tool.
    """
    return render_template('taylor_visualizer.html')

# --- Main execution ---

if __name__ == '__main__':
    # Runs the Flask application.
    # debug=True allows for auto-reloading when code changes are saved.
    app.run(debug=True)
