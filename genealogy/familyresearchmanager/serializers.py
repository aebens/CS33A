from rest_framework import serializers
from .models import Person, Event

class PersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Person
        fields = ['id', 'given_name', 'last_name']

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'person', 'event_type', 'date', 'location', 'notes']