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
http://127.0.0.1:8000/services/ for the dedicated services page.

Uploaded media files are stored in the `media/` folder and served from `/media/`
during local development. Configure your production web server or object storage
to serve uploaded media before deployment.

To add the homepage showreel, place an MP4 video at
`media/videos/bodhix-showreel.mp4`. The landing page includes a designed poster
until the video is added.

## Netlify deployment

The site is deployed as static HTML generated from the Django templates. Push
the repository to the connected Netlify site; `netlify.toml` runs the export
and publishes the `dist/` directory.

To build the static deployment locally:

```powershell
.\.venv\Scripts\Activate.ps1
python scripts/export_static.py
```

The output is written to `dist/`, with `/services/index.html` for the dedicated
services page and copies of the Django static and media assets.
