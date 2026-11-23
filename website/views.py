from django.conf import settings
from django.shortcuts import render


def home(request):
    return render(
        request,
        'website/home.html',
        {
            'media_url': settings.MEDIA_URL,
        },
    )


def about(request):
    return render(request, 'website/about.html')


def services(request):
    return render(request, 'website/services.html')


def work(request):
    return render(request, 'website/work.html')


def approach(request):
    return render(request, 'website/approach.html')
