from css_html_js_minify import js_minify
import glob

res = glob.glob("src\**\*.ts", recursive=True)

with open('codeAll.txt', 'w+', encoding='utf8') as f:
    for i in res:
        with open(i, "r", encoding="utf8") as readFile:
            fileData = readFile.read()
            f.write(i + '\n')
            f.write(fileData)
            f.write('\n\n')
