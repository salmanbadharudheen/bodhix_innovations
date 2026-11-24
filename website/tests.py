from django.test import TestCase
from django.urls import reverse


class HomePageTests(TestCase):
    def test_homepage_contains_animated_hero_and_service_photo_carousel_without_video(self):
        response = self.client.get(reverse('home'))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'website/images/bodhix_innovations_logo.png')
        self.assertContains(response, 'aria-label="Opening navigation"')
        self.assertContains(response, 'data-hero-carousel')
        self.assertContains(response, 'data-neural-background')
        self.assertContains(response, 'data-intro-universe')
        self.assertContains(response, 'js/intro-universe.js')
        self.assertNotContains(response, '<video')
        self.assertNotContains(response, 'showreel')
        self.assertNotContains(response, 'video-note')
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

    def test_about_is_available_as_a_dedicated_page(self):
        response = self.client.get(reverse('about'))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'id="about-page-title"')
        self.assertContains(response, 'id="about-story"')
        self.assertContains(response, 'Clever technology. Bold imagination.')

    def test_about_navigation_links_to_the_dedicated_page(self):
        for page_name in ('home', 'about', 'services', 'work', 'approach', 'contact', 'contact_thanks'):
            with self.subTest(page=page_name):
                response = self.client.get(reverse(page_name))
                self.assertContains(response, f'href="{reverse("about")}"')

    def test_approach_is_available_as_a_dedicated_page(self):
        response = self.client.get(reverse('approach'))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'id="approach-page-title"')
        self.assertContains(response, 'id="approach-steps"')
        for step in ('Discover', 'Define', 'Design', 'Build', 'Improve'):
            with self.subTest(step=step):
                self.assertContains(response, f'>{step}<')

    def test_approach_navigation_links_to_the_dedicated_page(self):
        for page_name in ('home', 'about', 'services', 'work', 'contact', 'contact_thanks'):
            with self.subTest(page=page_name):
                response = self.client.get(reverse(page_name))
                self.assertContains(response, f'href="{reverse("approach")}"')

    def test_contact_page_has_netlify_enquiry_form_and_whatsapp_link(self):
        response = self.client.get(reverse('contact'))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'name="project-enquiry"')
        self.assertContains(response, 'data-netlify="true"')
        self.assertContains(response, 'netlify-honeypot="bot-field"')
        self.assertContains(response, 'action="/contact/thanks/"')
        self.assertContains(response, 'name="email"')
        self.assertContains(response, 'name="message"')
        self.assertContains(response, 'https://wa.me/971541830378')

    def test_contact_thank_you_page_is_available(self):
        response = self.client.get(reverse('contact_thanks'))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'id="contact-thanks-title"')

    def test_project_navigation_links_to_contact_page(self):
        for page_name in ('home', 'about', 'services', 'work', 'approach'):
            with self.subTest(page=page_name):
                response = self.client.get(reverse(page_name))
                self.assertContains(
                    response,
                    f'class="nav-cta" href="{reverse("contact")}"',
                )

    def test_site_pages_link_to_whatsapp(self):
        for page_name in ('home', 'about', 'services', 'work', 'approach', 'contact'):
            with self.subTest(page=page_name):
                response = self.client.get(reverse(page_name))
                self.assertContains(response, 'https://wa.me/971541830378')

    def test_work_is_available_as_a_dedicated_page(self):
        response = self.client.get(reverse('work'))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'class="work-page-hero"')
        self.assertNotContains(response, 'class="service-page-hero"')
        self.assertContains(response, 'id="work-page-title"')
        self.assertContains(response, 'Case studies coming soon')

    def test_work_navigation_links_to_the_dedicated_page(self):
        response = self.client.get(reverse('home'))

        self.assertContains(response, f'href="{reverse("work")}"')
        self.assertNotContains(response, 'id="work"')
        response = self.client.get(reverse('services'))
        self.assertContains(response, f'href="{reverse("work")}"')

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
