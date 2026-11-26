from html.parser import HTMLParser
from django.test import TestCase
from django.urls import reverse
from xml.etree import ElementTree

from .seo import SITEMAP_NAMESPACE, SITEMAP_PATHS, build_robots_txt, build_sitemap


class CopyPunctuationParser(HTMLParser):
    text_tags = {'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li'}

    def __init__(self):
        super().__init__()
        self.active_tags = []
        self.copy = []

    def handle_starttag(self, tag, attrs):
        if tag in self.text_tags:
            self.active_tags.append(tag)

    def handle_endtag(self, tag):
        if self.active_tags and self.active_tags[-1] == tag:
            self.active_tags.pop()

    def handle_data(self, data):
        if self.active_tags:
            self.copy.append(data)


class HomePageTests(TestCase):
    def test_homepage_contains_animated_hero_and_service_photo_carousel_without_video(self):
        response = self.client.get(reverse('home'))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'website/images/bodhix_innovations_logo.png')
        self.assertContains(response, 'aria-label="Opening navigation"')
        self.assertContains(response, 'data-hero-carousel')
        self.assertContains(response, 'data-neural-background')
        self.assertContains(response, 'website/images/intro-orb-hd.svg')
        self.assertNotContains(response, '<video')
        self.assertNotContains(response, 'showreel')
        self.assertNotContains(response, 'video-note')
        self.assertContains(response, '1 of 7: Ideas into experiences')
        self.assertContains(response, '2 of 7: Software solutions')
        self.assertContains(response, '3 of 7: AI and automation')
        self.assertContains(response, '4 of 7: Data and intelligence')
        self.assertContains(response, '5 of 7: Digital commerce')
        self.assertContains(response, '6 of 7: Brand identity')
        self.assertContains(response, '7 of 7: Creative marketing')
        self.assertContains(response, 'hero__slide--software')
        self.assertContains(response, 'hero__slide--ai')
        self.assertContains(response, 'hero__slide--data')
        self.assertContains(response, 'hero__slide--commerce')
        self.assertContains(response, 'website/images/software-dark-abstract.svg', count=2)
        self.assertContains(response, 'hero__slide--brand')
        self.assertContains(response, 'hero__slide--graphic')
        self.assertContains(response, 'hero__diagram--ai')
        self.assertContains(response, 'hero__diagram--data')
        self.assertContains(response, 'id="services"')
        self.assertContains(response, 'id="about"')
        self.assertContains(response, 'id="process"')
        self.assertContains(response, 'id="contact"')

    def test_featured_service_slides_link_to_their_service_cards(self):
        response = self.client.get(reverse('home'))

        for service_id in (
            'service-software-solutions',
            'service-ai-automation',
            'service-data-intelligence',
            'service-digital-commerce',
            'service-brand-identity',
            'service-graphic-design',
        ):
            with self.subTest(service_id=service_id):
                self.assertContains(response, f'href="#{service_id}"')
                self.assertContains(response, f'id="{service_id}"')

    def test_homepage_keeps_marketing_and_branding_services(self):
        response = self.client.get(reverse('home'))

        for service_id in ('service-brand-identity', 'service-graphic-design', 'service-content-creation', 'service-social-media'):
            with self.subTest(service_id=service_id):
                self.assertContains(response, f'id="{service_id}"')
        self.assertContains(response, 'Brand &amp; marketing')
        self.assertContains(response, 'Social media management')

    def test_services_navigation_opens_the_dedicated_service_page(self):
        response = self.client.get(reverse('home'))

        self.assertContains(response, f'href="{reverse("services")}"')

    def test_about_is_available_as_a_dedicated_page(self):
        response = self.client.get(reverse('about'))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'id="about-page-title"')
        self.assertContains(response, 'id="about-story"')
        self.assertContains(response, 'id="about-vision-title"')
        self.assertContains(response, 'Technology and creativity working as one')
        self.assertContains(response, 'Clever technology Bold imagination')

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
        for step in ('Discover', 'Define', 'Design', 'Build', 'Launch &amp; improve'):
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
        self.assertContains(response, '<option>AI and automation</option>')
        self.assertContains(response, '<option>Data and intelligence</option>')
        self.assertContains(response, '<option>Brand identity</option>')
        self.assertContains(response, '<option>Social media management</option>')

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
        self.assertContains(response, 'data-parallax-section', count=6)
        for service_id in (
            'service-software-solutions',
            'service-ai-automation',
            'service-data-intelligence',
            'service-digital-commerce',
            'service-brand-identity',
            'service-graphic-design',
            'service-content-creation',
            'service-social-media',
        ):
            with self.subTest(service_id=service_id):
                self.assertContains(response, f'id="{service_id}"')
        self.assertContains(response, 'Human review and clear boundaries')
        self.assertContains(response, 'Brand &amp; marketing')

    def test_public_pages_have_canonical_urls_and_shared_footer_links(self):
        expected_paths = {
            'home': '/',
            'about': '/about/',
            'services': '/services/',
            'work': '/work/',
            'approach': '/approach/',
            'contact': '/contact/',
        }
        for page_name, path in expected_paths.items():
            with self.subTest(page=page_name):
                response = self.client.get(reverse(page_name))
                self.assertContains(
                    response,
                    f'<link rel="canonical" href="https://bodhix-innovations.netlify.app{path}">',
                )
                self.assertContains(response, 'aria-label="Footer navigation"')
                self.assertContains(response, 'aria-label="Service links"')

    def test_headings_and_main_copy_have_no_commas_or_full_stops(self):
        for page_name in (
            'home',
            'about',
            'services',
            'work',
            'approach',
            'contact',
            'contact_thanks',
        ):
            with self.subTest(page=page_name):
                response = self.client.get(reverse(page_name))
                parser = CopyPunctuationParser()
                parser.feed(response.content.decode())
                self.assertNotRegex(''.join(parser.copy), r'[,.]')

    def test_static_export_seo_files_list_only_public_pages(self):
        sitemap = ElementTree.fromstring(build_sitemap())
        namespace = {'sitemap': SITEMAP_NAMESPACE}
        urls = [
            node.text.removeprefix('https://bodhix-innovations.netlify.app')
            for node in sitemap.findall('sitemap:url/sitemap:loc', namespace)
        ]

        self.assertEqual(urls, list(SITEMAP_PATHS))
        self.assertNotIn('/contact/thanks/', urls)
        self.assertIn(
            b'Sitemap: https://bodhix-innovations.netlify.app/sitemap.xml',
            build_robots_txt(),
        )
