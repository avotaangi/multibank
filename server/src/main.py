try:
    from .local_backend.api import app
except ImportError:
    from local_backend.api import app
