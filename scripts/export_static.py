import os
import shutil
import sys
from pathlib import Path

import django


BASE_DIR = Path(__file__).resolve().parent.parent
DIST_DIR = BASE_DIR / 'dist'

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bodhix_innovations.settings')
sys.path.insert(0, str(BASE_DIR))
django.setup()

from django.conf import settings
from django.core.management import call_command
from django.test import Client


def write_page(path: str, content: bytes) -> None:
    output_path = DIST_DIR / path
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_bytes(content)


DIST_DIR.mkdir(parents=True, exist_ok=True)

for relative_path in ('index.html', 'services'):
    existing_path = DIST_DIR / relative_path
    if existing_path.is_file():
        existing_path.unlink()

services_dir = DIST_DIR / 'services'
if services_dir.is_dir():
    shutil.rmtree(services_dir)

client = Client(HTTP_HOST='localhost')
pages = (
    ('/', 'index.html'),
    ('/services/', 'services/index.html'),
)

for url, output_path in pages:
    response = client.get(url)
    if response.status_code != 200:
        raise RuntimeError(
            f'Unable to render {url}: HTTP {response.status_code}'
        )
    write_page(output_path, response.content)

call_command(
    'collectstatic',
    interactive=False,
    verbosity=0,
    clear=True,
)

static_output = DIST_DIR / 'static'
static_output.parent.mkdir(parents=True, exist_ok=True)
if static_output.exists():
    shutil.rmtree(static_output)
shutil.copytree(settings.STATIC_ROOT, static_output)

media_output = DIST_DIR / 'media'
if media_output.exists():
    shutil.rmtree(media_output)
if settings.MEDIA_ROOT.exists():
    shutil.copytree(settings.MEDIA_ROOT, media_output)

print(f'Static export written to {DIST_DIR}')
