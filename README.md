watchmd
=======

Lightweight utility for previewing markdown in your browser

Install
=======
	npm install -g watchmd

Options
=======

port
-----
Sets the port express will bind to. (Default : 3333)

watchFile || f
-----
The Markdown file to watch and render.  (Default : 'example.md')

style
-----
Enables or Disables giving the markdown preview a little style.  (Default : true)

spawn
------
Enables or Disables automatically launcing the browser.  (Default : true)


Example Usage
=========
	watchmd -f ./markdown_file.md --style=true