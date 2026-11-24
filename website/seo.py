from xml.etree import ElementTree

from django.conf import settings


SITEMAP_PATHS = (
    '/',
    '/about/',
    '/services/',
    '/work/',
    '/approach/',
    '/contact/',
)
SITEMAP_NAMESPACE = 'http://www.sitemaps.org/schemas/sitemap/0.9'


def build_sitemap() -> bytes:
    urlset = ElementTree.Element(
        'urlset',
        {'xmlns': SITEMAP_NAMESPACE},
    )
    for path in SITEMAP_PATHS:
        url = ElementTree.SubElement(urlset, 'url')
        ElementTree.SubElement(url, 'loc').text = f'{settings.SITE_BASE_URL}{path}'
    return ElementTree.tostring(
        urlset,
        encoding='utf-8',
        xml_declaration=True,
    )


def build_robots_txt() -> bytes:
    return (
        'User-agent: *\n'
        'Allow: /\n'
        f'Sitemap: {settings.SITE_BASE_URL}/sitemap.xml\n'
    ).encode('utf-8')
