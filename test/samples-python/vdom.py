from IPython.display import display
from vdom.helpers import h1, p, img, div, b

display(
    div(
        h1('Our Incredibly Declarative Example'),
        p('Can you believe we wrote this ', b('in Python'), '?'),
        img(src="https://media.giphy.com/media/xUPGcguWZHRC2HyBRS/giphy.gif"),
        p('What will ', b('you'), ' create next?'),
    )
)