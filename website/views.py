from django.conf import settings
from django.shortcuts import render


def home(request):
    showreel_path = settings.MEDIA_ROOT / 'videos' / 'bodhix-showreel.mp4'
    return render(
        request,
        'website/home.html',
        {
            'media_url': settings.MEDIA_URL,
            'showreel_available': showreel_path.is_file(),
        },
    )


def services(request):
    return render(request, 'website/services.html')
