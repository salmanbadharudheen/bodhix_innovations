from pathlib import Path
from tempfile import TemporaryDirectory

from django.test import TestCase
from django.test import override_settings
from django.urls import reverse


class HomePageTests(TestCase):
    def test_homepage_contains_video_and_service_photo_carousel(self):
        response = self.client.get(reverse('home'))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'website/images/bodhix_innovations_logo.png')
        self.assertContains(response, 'aria-label="Opening navigation"')
        self.assertContains(response, 'data-hero-carousel')
        self.assertContains(response, 'data-neural-background')
        self.assertContains(response, 'data-intro-universe')
        self.assertContains(response, 'js/intro-universe.js')
        self.assertContains(response, 'class="hero__video"')
        self.assertContains(response, 'website/images/showreel-poster.svg')
        self.assertContains(response, '1 of 5: Ideas into experiences')
        self.assertContains(response, '2 of 5: Software development')
        self.assertContains(response, '3 of 5: Web design and development')
        self.assertContains(response, '4 of 5: Brand identity')
        self.assertContains(response, '5 of 5: Graphic design')
        self.assertContains(response, 'hero__slide--software')
        self.assertContains(response, 'hero__slide--web')
        self.assertContains(response, 'hero__slide--brand')
        self.assertContains(response, 'hero__slide--graphic')
        self.assertContains(response, 'software%20development.jpeg')
        self.assertContains(response, 'website/images/service-web.jpg')
        self.assertContains(response, 'website/images/service-brand.jpg')
        self.assertContains(response, 'website/images/service-graphic.jpg')
        self.assertContains(response, 'id="services"')
        self.assertContains(response, 'id="about"')
        self.assertContains(response, 'id="process"')
        self.assertContains(response, 'id="contact"')

    def test_showreel_is_added_to_intro_slide_only_when_available(self):
        with TemporaryDirectory() as media_root:
            with override_settings(MEDIA_ROOT=Path(media_root)):
                response = self.client.get(reverse('home'))
                self.assertContains(response, 'Your showreel goes here')
                self.assertNotContains(response, '<source src="/media/videos/bodhix-showreel.mp4"')

                video_path = Path(media_root) / 'videos' / 'bodhix-showreel.mp4'
                video_path.parent.mkdir()
                video_path.write_bytes(b'video placeholder')
                response = self.client.get(reverse('home'))

        self.assertContains(response, '<source src="/media/videos/bodhix-showreel.mp4"')
        self.assertNotContains(response, 'Your showreel goes here')

    def test_featured_service_slides_link_to_their_service_cards(self):
        response = self.client.get(reverse('home'))

        for service_id in (
            'service-software-development',
            'service-web-design',
            'service-brand-identity',
            'service-graphic-design',
        ):
            with self.subTest(service_id=service_id):
                self.assertContains(response, f'href="#{service_id}"')
                self.assertContains(response, f'id="{service_id}"')

    def test_services_navigation_opens_the_dedicated_service_page(self):
        response = self.client.get(reverse('home'))

        self.assertContains(response, f'href="{reverse("services")}"')

    def test_service_page_lists_all_services_and_applies_parallax_sections(self):
        response = self.client.get(reverse('services'))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Ideas into')
        self.assertContains(response, 'data-parallax-section', count=8)
        for service_id in (
            'service-brand-identity',
            'service-graphic-design',
            'service-web-design',
            'service-software-development',
            'service-content-creation',
            'service-social-media',
        ):
            with self.subTest(service_id=service_id):
                self.assertContains(response, f'id="{service_id}"')
