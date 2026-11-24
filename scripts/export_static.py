import os
import shutil
import stat
import sys
from pathlib import Path

import django


BASE_DIR = Path(__file__).resolve().parent.parent
DIST_DIR = BASE_DIR / 'dist'


def remove_tree(path: Path) -> None:
    if not path.exists():
        return

    def make_writable(function, target, exc_info):
        os.chmod(target, stat.S_IWRITE)
        function(target)

    shutil.rmtree(path, onerror=make_writable)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bodhix_innovations.settings')
sys.path.insert(0, str(BASE_DIR))
django.setup()

from django.conf import settings
from django.core.management import call_command
from django.test import Client
from website.seo import build_robots_txt, build_sitemap


def write_page(path: str, content: bytes) -> None:
    output_path = DIST_DIR / path
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_bytes(content)


DIST_DIR.mkdir(parents=True, exist_ok=True)

for relative_path in ('index.html', 'about', 'services', 'work', 'approach', 'contact'):
    existing_path = DIST_DIR / relative_path
    if existing_path.is_file():
        existing_path.unlink()

services_dir = DIST_DIR / 'services'
remove_tree(services_dir)
about_dir = DIST_DIR / 'about'
remove_tree(about_dir)
work_dir = DIST_DIR / 'work'
remove_tree(work_dir)
approach_dir = DIST_DIR / 'approach'
remove_tree(approach_dir)
contact_dir = DIST_DIR / 'contact'
remove_tree(contact_dir)

client = Client(HTTP_HOST='localhost')
pages = (
    ('/', 'index.html'),
    ('/about/', 'about/index.html'),
    ('/services/', 'services/index.html'),
    ('/work/', 'work/index.html'),
    ('/approach/', 'approach/index.html'),
    ('/contact/', 'contact/index.html'),
    ('/contact/thanks/', 'contact/thanks/index.html'),
)

for url, output_path in pages:
    response = client.get(url)
    if response.status_code != 200:
        raise RuntimeError(
            f'Unable to render {url}: HTTP {response.status_code}'
        )
    write_page(output_path, response.content)

write_page('robots.txt', build_robots_txt())
write_page('sitemap.xml', build_sitemap())

call_command(
    'collectstatic',
    interactive=False,
    verbosity=0,
    clear=True,
)

static_output = DIST_DIR / 'static'
static_output.parent.mkdir(parents=True, exist_ok=True)
remove_tree(static_output)
shutil.copytree(settings.STATIC_ROOT, static_output)

media_output = DIST_DIR / 'media'
remove_tree(media_output)
if settings.MEDIA_ROOT.exists():
    shutil.copytree(settings.MEDIA_ROOT, media_output)

print(f'Static export written to {DIST_DIR}')
