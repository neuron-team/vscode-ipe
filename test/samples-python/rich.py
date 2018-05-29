
# image as html
from IPython.display import Image
Image(url='https://python.org/images/python-logo.gif')

# svg as svg
from IPython.display import SVG
SVG(url='https://upload.wikimedia.org/wikipedia/commons/0/02/SVG_logo.svg')

# script in html
from IPython.display import HTML
display(HTML("""
<script>console.log('hey')</script>
"""))

# table in html
from IPython.display import HTML
display(HTML("""<table style="width: 100%;">
<tr>
<th>Header 1</th>
<th>Header 2</th>
</tr>
<tr>
<td>row 1,  cell 1</td>
<td>row 1, cell 2</td>
</tr>
<tr>
<td>row 2, cell 1</td>
<td>row 2, cell 2</td>
</tr>
</table>"""))

# plotly graph
from plotly.offline import download_plotlyjs, init_notebook_mode, plot, iplot
from plotly.graph_objs import Scatter, Figure, Layout
init_notebook_mode(connected=True)
iplot([{"x": [1, 2, 3], "y": [3, 1, 6]}])

# markdown
from IPython.display import Markdown
Markdown("""
### Displaying markdown

This is how to programatically display markdown with:

 - bullet list
 - _emphases_
 - **bold**
 
""")