# Bodhix Innovations website

## Local development

In PowerShell, from the project folder:

```powershell
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Open http://127.0.0.1:8000/ for the homepage and
http://127.0.0.1:8000/about/, http://127.0.0.1:8000/services/,
http://127.0.0.1:8000/work/, http://127.0.0.1:8000/approach/, and
http://127.0.0.1:8000/contact/ for the dedicated About, Services, Work,
Our Approach, and Contact pages.

Uploaded media files are stored in the `media/` folder and served from `/media/`
during local development. Configure your production web server or object storage
to serve uploaded media before deployment.

The contact form is handled by Netlify Forms on the deployed static site. Enable
form detection in the Netlify site dashboard, then add an email notification for
the `project-enquiry` form to `info@bodhixinnovations.com` under Forms →
Notifications. Netlify may require the recipient to confirm the notification.
Form submissions can also be reviewed in the Netlify dashboard.

## Netlify deployment

The site is deployed as static HTML generated from the Django templates. Push
the repository to the connected Netlify site; `netlify.toml` runs the export
and publishes the `dist/` directory.

To build the static deployment locally:

```powershell
.\.venv\Scripts\Activate.ps1
python scripts/export_static.py
```

The output is written to `dist/`, with `/about/index.html`,
`/services/index.html`, `/work/index.html`, `/approach/index.html`, and
`/contact/index.html` for the dedicated pages, plus the contact confirmation
at `/contact/thanks/index.html` and copies of the Django static and media assets.
