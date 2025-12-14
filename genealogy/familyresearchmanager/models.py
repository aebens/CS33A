from django.db import models

class Person(models.Model):
    given_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)

class Event(models.Model):
    EVENT_TYPES = [
        ('birth', 'Birth'),
        ('baptism', 'Baptism'),
        ('christening', 'Christening'),
        ('death', 'Death'),
        ('burial', 'Burial'),
        ('marriage', 'Marriage'),
        ('divorce', 'Divorce'),
        ('immigration', 'Immigration'),
        ('emigration', 'Emigration'),
        ('census', 'Census'),
        ('residence', 'Residence'),
        ('occupation', 'Occupation'),
        ('military', 'Military Service'),
        ('education', 'Education'),
    ]
    
    person = models.ForeignKey(Person, on_delete=models.CASCADE, related_name='events', null=True, blank=True)
    event_type = models.CharField(max_length=50, choices=EVENT_TYPES)
    date = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.event_type} - {self.date}"