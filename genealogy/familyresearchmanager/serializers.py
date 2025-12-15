from rest_framework import serializers
from .models import Person, Event, Repository, SourceCreator, Source, SourceAccess, Citation

class PersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Person
        fields = ['id', 'given_name', 'last_name']

class CitationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Citation
        fields = ['id', 'event', 'source', 'page', 'line_number', 'name_as_recorded', 'transcription', 'notes']

class EventSerializer(serializers.ModelSerializer):
    citations = CitationSerializer(many=True, read_only=True) # This is needed to nest citations in the model.

    class Meta:
        model = Event
        fields = ['id', 'person', 'event_type', 'date', 'location', 'notes', 'citations']

class RepositorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Repository
        fields = ['id', 'name', 'repo_type', 'address', 'website', 'notes']

class SourceCreatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = SourceCreator
        fields = ['id', 'repository', 'title', 'author', 'publication_info', 'notes']

class SourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Source
        fields = ['id', 'source_creator', 'title', 'date', 'item_identifier', 'page_number', 'url', 'file', 'notes']

class SourceAccessSerializer(serializers.ModelSerializer):
    class Meta:
        model = SourceAccess
        fields = ['id', 'source', 'repository', 'access_date', 'person_name', 'line_number', 'url', 'file', 'notes']
