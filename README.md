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
