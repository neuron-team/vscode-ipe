# Scatter Plot
library(plotly)

set.seed(123)

x <- rnorm(1000)
y <- rchisq(1000, df = 1, ncp = 0)
group <- sample(LETTERS[1:5], size = 1000, replace = T)
size <- sample(1:5, size = 1000, replace = T)

ds <- data.frame(x, y, group, size)

p <- plot_ly(ds, x = x, y = y, mode = "markers", split = group, size = size) %>% layout(title = "Scatter Plot")
embed_notebook(p)
