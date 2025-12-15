from django.apps import AppConfig


class FamilyresearchmanagerConfig(AppConfig):
    name = 'familyresearchmanager'

# This is how the signals are registered.
def ready(self):
    from . import models
