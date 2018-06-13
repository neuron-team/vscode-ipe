# -------------------------------------------------------------------------

# Welcome to neuron - The Visual Studio Code extension for data scientists!

# -------------------------------------------------------------------------

# Let's get started by learning the basics

# Highlight the code below and send it to the output pane
# either by pressing ALT+ENTER
# or by selecting Send to output from the right-click drop-down menu

pattern = [('.|.'*(2*i + 1)).center(30, '-') for i in range(10//2)]
print('\n'.join(pattern + ['I LOVE DATA'.center(30, '-')] + pattern[::-1]))

# If everything worked well, you will see a cool design on the right!

# -------------------------------------------------------------------------

# Let's move on to something more exciting!

# Graph are the best way to visualise data, our extension makes their
# creation really easy

# Give it a try! Select and run the code below and play with the graph!

from plotly.offline import download_plotlyjs, init_notebook_mode, plot, iplot
from plotly.graph_objs import Scatter, Figure, Layout

iplot([{"x": [1, 2, 3, 4, 5, 6, 7, 8], "y": [0, 1, 1, 2, 2, 3, 3, 4]}])

# If you're feeling adventurous try changing the x and y coordinates!

# -------------------------------------------------------------------------

# Cartesian graphs are useful, but wouldn't it be cooler if we had another
# dimension?

from plotly.offline import download_plotlyjs, init_notebook_mode, plot, iplot
import plotly.graph_objs as go
import pandas as pd

z_data = pd.read_csv('https://raw.githubusercontent.com/plotly/datasets/master/api_docs/mt_bruno_elevation.csv')

data = [
    go.Surface(
        z=z_data.as_matrix()
    )
]
layout = go.Layout(
    title='Mt Bruno Elevation'
)
fig = go.Figure(data=data, layout=layout)
iplot(fig)

# The code above produced a 3d visualisation of Mt Bruno Elevation
# Go ahead and rotate the graph to get a better view!

# -------------------------------------------------------------------------

# Data scientists use all kind of data, some even use geographical data.
# We wanted to make their job easier

from IPython.display import GeoJSON

GeoJSON(      
	{
        "type": "FeatureCollection",
        "features": [
        {
          "type": "Feature",
          "properties": {
          "name": "Van Dorn Street",
          "marker-color": "#0000ff",
          "marker-symbol": "rail-metro",
          "line": "blue"
          },
          "geometry": {
          "type": "Point",
          "coordinates": [
            -77.12911152370515,
            38.79930767201779
          ]
          }
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Glenmont",
                "marker-color": "#ff0000",
                "marker-symbol": "rail-metro",
                "line": "red"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                -77.05355735935977,
                39.06178376553033
                ]
            }
        }]
    },
)

# The coordinates listed in the code above will be represented on a map.
# Explore the map generated!

# ---------------------------------------------------------------------------

# And for the math geeks amongst you, 
# try rendering your favourite math equations using LaTeX right here

%%latex
\frac{1}{\Bigl(\sqrt{\phi \sqrt{5}}-\phi\Bigr) e^{\frac25 \pi}} = 1+\frac{e^{-2\pi}} {1+\frac{e^{-4\pi}} {1+\frac{e^{-6\pi}} {1+\frac{e^{-8\pi}} {1+\cdots} } } }

%%latex
1 +  \frac{q^2}{(1-q)}+\frac{q^6}{(1-q)(1-q^2)}+\cdots = \prod_{j=0}^{\infty}\frac{1}{(1-q^{5j+2})(1-q^{5j+3})}, \quad\quad \text{for }\lvert q\rvert<1.

# ---------------------------------------------------------------------------

# Those cards on the right are starting to get cluttered!
# Luckily you can use the intuitive user interface to organise them:
# Use the search bar, filter and move the cards up and down,
# add markdown comments, and delete the cards you no longer need.

# ---------------------------------------------------------------------------

# Thank you for trying neuron!
# Available in the VS Code extension marketplace soon

# ---------------------------------------------------------------------------