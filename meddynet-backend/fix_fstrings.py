import re
import glob

def fix_fstrings(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    def replacer(m):
        quote = m.group(1)
        inner = m.group(2)
        if '{' not in inner and '}' not in inner:
            return quote + inner + quote
        return m.group(0)
    
    new_content = re.sub(r'f([\'\"])(.*?)\1', replacer, content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Fixed {filepath}')

for script in glob.glob('scripts/*.py'):
    fix_fstrings(script)
