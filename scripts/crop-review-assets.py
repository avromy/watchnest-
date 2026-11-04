"""Neutral, deterministic readable crops from manifest-bound screenshot pixels."""
import hashlib, json, math, sys
from pathlib import Path
from PIL import Image
root = Path(sys.argv[1]).resolve()
records = []
for manifest in root.rglob('manifest.json'):
    data = json.loads(manifest.read_text())
    for capture in data.get('captures', []):
        for asset in capture.get('assetEvidence', []):
            source = root / asset['fullPage']
            if not source.exists():
                source = root / asset['fullPage'].removeprefix('test-results/')
            if not source.exists():
                raise FileNotFoundError(source)
            b = asset['bounds']
            with Image.open(source) as raster:
                box = (max(0, math.floor(b['x'])-6), max(0, math.floor(b['y'])-6), min(raster.width, math.ceil(b['x']+b['width'])+6), min(raster.height, math.ceil(b['y']+b['height'])+6))
                if box[2] <= box[0] or box[3] <= box[1]:
                    records.append({'identity':asset['identity'],'result':'OUTSIDE SOURCE RASTER','bounds':b})
                    continue
                crop = raster.crop(box)
                scale = 3 if max(crop.size) < 96 else 1
                if scale > 1:
                    crop = crop.resize((crop.width*scale,crop.height*scale), Image.Resampling.NEAREST)
                target = root / 'asset-crops' / (asset['identity']+'.png')
                target.parent.mkdir(parents=True,exist_ok=True)
                crop.save(target)
            records.append({'identity':asset['identity'],'source':str(source.relative_to(root)),'crop':str(target.relative_to(root)),'sourceBox':box,'scale':scale,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'edgeVerdict':'UNRESOLVED: independent pixels control'})
(root/'asset-crops'/'index.json').write_text(json.dumps({'kind':'neutral source-pixel crops','records':records},indent=2))
print(json.dumps({'crops':sum('crop' in r for r in records),'outside':sum('crop' not in r for r in records)}))
