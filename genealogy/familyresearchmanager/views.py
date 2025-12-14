from django.shortcuts import render
from rest_framework import viewsets
from .models import Person, Event
from .serializers import PersonSerializer, EventSerializer

def index(request):
    return render(request, 'index.html')

# ModelViewSet employs CRUD instead of manually needing to implement it

class PersonViewSet(viewsets.ModelViewSet):
    queryset = Person.objects.all()
    serializer_class = PersonSerializer

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer