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
    return render_template('en/index_en.html')

@app.route('/derivatives')
def derivatives():
    """
    Renders the interactive Derivatives and Partial Derivatives page.
    """
    return render_template('derivatives.html')

@app.route('/taylor')
def taylor_visualizer():
    """
    Renders the Taylor Series Visualizer page.
    The HTML for this page is taken from the previous interactive tool.
    """
    return render_template('taylor_visualizer.html')

@app.route('/gradient-descent')
def gradient_descent():
    """
    Renders the Gradient Descent explanation page.
    """
    return render_template('gradient_descent.html')


# --- Main execution ---

if __name__ == '__main__':
    # Runs the Flask application.
    # debug=True allows for auto-reloading when code changes are saved.
    app.run(host="0.0.0.0", port=5000,debug=True)
