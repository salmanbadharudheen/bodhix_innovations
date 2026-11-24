from django.conf import settings


def site_metadata(_request):
    return {'site_base_url': settings.SITE_BASE_URL}
