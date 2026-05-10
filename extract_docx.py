import zipfile
import xml.etree.ElementTree as ET
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

z = zipfile.ZipFile('synopsis.docx')
tree = ET.parse(z.open('word/document.xml'))
ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
paragraphs = tree.findall('.//w:p', ns)

for p in paragraphs:
    texts = []
    for r in p.findall('.//w:t', ns):
        if r.text:
            texts.append(r.text)
    line = ''.join(texts)
    print(line)
