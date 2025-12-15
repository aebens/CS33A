from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Creates API endpoints
router = DefaultRouter()
router.register(r'people', views.PersonViewSet)
router.register(r'events', views.EventViewSet)
router.register(r'repositories', views.RepositoryViewSet)
router.register(r'source-creators', views.SourceCreatorViewSet)
router.register(r'sources', views.SourceViewSet)
router.register(r'source-accesses', views.SourceAccessViewSet)
router.register(r'citations', views.CitationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]