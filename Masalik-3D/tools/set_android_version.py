"""Set a monotonically increasing CI versionCode without changing package identity."""
import re, sys
from pathlib import Path
code=int(sys.argv[1])
if code<10001: raise ValueError('Native Android versionCode must exceed previous releases')
p=Path(__file__).resolve().parents[1]/'export_presets.cfg'
s=p.read_text();s,n=re.subn(r'^version/code=\d+$',f'version/code={code}',s,flags=re.M)
if n!=1: raise ValueError('Expected exactly one Android versionCode')
p.write_text(s);print('Android versionCode:',code)
