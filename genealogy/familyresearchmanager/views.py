from django.shortcuts import render
from rest_framework import viewsets
from .models import Person, Event, Repository, SourceCreator, Source, SourceAccess, Citation
from .serializers import (
    PersonSerializer, EventSerializer, RepositorySerializer, SourceCreatorSerializer, 
    SourceSerializer, SourceAccessSerializer, CitationSerializer)

def index(request):
    return render(request, 'index.html')

# ModelViewSet employs CRUD instead of manually needing to implement it

class PersonViewSet(viewsets.ModelViewSet):
    queryset = Person.objects.all()
    serializer_class = PersonSerializer

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    # Filters for the person in question
    def get_queryset(self):
        queryset = Event.objects.all()
        person_id = self.request.query_params.get('person')
        if person_id is not None:
            queryset = queryset.filter(person_id=person_id)
        return queryset

class RepositoryViewSet(viewsets.ModelViewSet):
    queryset = Repository.objects.all()
    serializer_class = RepositorySerializer

class SourceCreatorViewSet(viewsets.ModelViewSet):
    queryset = SourceCreator.objects.all()
    serializer_class = SourceCreatorSerializer

class SourceViewSet(viewsets.ModelViewSet):
    queryset = Source.objects.all()
    serializer_class = SourceSerializer

class SourceAccessViewSet(viewsets.ModelViewSet):
    queryset = SourceAccess.objects.all()
    serializer_class = SourceAccessSerializer

class CitationViewSet(viewsets.ModelViewSet):
    queryset = Citation.objects.all()
    serializer_class = CitationSerializer