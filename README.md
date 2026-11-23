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
http://127.0.0.1:8000/work/, and http://127.0.0.1:8000/approach/ for the
dedicated About, Services, Work, and Our Approach pages.

Uploaded media files are stored in the `media/` folder and served from `/media/`
during local development. Configure your production web server or object storage
to serve uploaded media before deployment.

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
`/services/index.html`, `/work/index.html`, and `/approach/index.html` for the
dedicated pages, plus copies of the Django static and media assets.
