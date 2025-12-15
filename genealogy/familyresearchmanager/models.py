from django.db import models
from datetime import date
from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver

# Note:  Signals/receiver is needed to allow for deletion of files when the research log item is deleted.

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
    
# Source Citation Models (Evidence Explained approach with normalization)

class Repository(models.Model):
    REPO_TYPES = [
        ('archive', 'Archive/Library'),
        ('courthouse', 'Courthouse'),
        ('church', 'Church/Religious'),
        ('website', 'Website/Database'),
        ('personal', 'Personal Collection'),
    ]

    name = models.CharField(max_length=255)
    repo_type = models.CharField(max_length=50, choices=REPO_TYPES)
    address = models.TextField(blank=True)
    website = models.URLField(blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return self.name

# This is the creator information that is separate from repository/access point.

class SourceCreator(models.Model):
    repository = models.ForeignKey(Repository, on_delete=models.CASCADE, related_name='source_creators')
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255, blank=True)
    publication_info = models.TextField(blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return self.title

# This is the second layer of the citation, e.g. enumeration district, sheet/page.

class Source(models.Model):
    source_creator = models.ForeignKey(SourceCreator, on_delete=models.CASCADE, related_name='sources')
    title = models.CharField(max_length=255)
    date = models.CharField(max_length=100, blank=True)
    page_number = models.CharField(max_length=50, blank=True)
    item_identifier = models.CharField(max_length=255, blank=True)
    url = models.URLField(blank=True)
    file = models.FileField(upload_to='sources/', blank=True, null=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return self.title

# This is used to create a research log.

class SourceAccess(models.Model):
    source = models.ForeignKey(Source, on_delete=models.CASCADE, related_name='accesses')
    repository = models.ForeignKey(Repository, on_delete=models.CASCADE, related_name='access_points')
    access_date = models.DateField(default=date.today)
    person_name = models.CharField(max_length=255, blank=True)
    line_number = models.CharField(max_length=50, blank=True)
    url = models.URLField(blank=True)
    file = models.FileField(upload_to='research_log/', blank=True, null=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.source.title} via {self.repository.name}"

# This is the citation with specific data.

class Citation(models.Model):
    event = models.ManyToManyField(Event, related_name='citations')
    source = models.ForeignKey(Source, on_delete=models.CASCADE, related_name='citations')
    page = models.CharField(max_length=50, blank=True)
    line_number = models.CharField(max_length=50, blank=True)
    name_as_recorded = models.CharField(max_length=255, blank=True)
    transcription = models.TextField(blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.source.title} -> {self.event}"


# These are the receivers that allow the files to be deleted.  I worked on this with the Duck.  
# Save=False is necessary so Django doesn't save a file that is being deleted.

# Delete file when SourceAccess record is deleted
@receiver(post_delete, sender=SourceAccess)
def delete_source_access_file(sender, instance, **kwargs):
    if instance.file:
        instance.file.delete(save=False)

# Delete file when Source record is deleted
@receiver(post_delete, sender=Source)
def delete_source_file(sender, instance, **kwargs):
    if instance.file:
        instance.file.delete(save=False)

# Delete old file when replacing with a new one
@receiver(pre_save, sender=SourceAccess)
def delete_old_source_access_file(sender, instance, **kwargs):
    if instance.pk:
        try:
            old_instance = SourceAccess.objects.get(pk=instance.pk)
            if old_instance.file and old_instance.file != instance.file:
                old_instance.file.delete(save=False)
        except SourceAccess.DoesNotExist:
            pass

@receiver(pre_save, sender=Source)
def delete_old_source_file(sender, instance, **kwargs):
    if instance.pk:
        try:
            old_instance = Source.objects.get(pk=instance.pk)
            if old_instance.file and old_instance.file != instance.file:
                old_instance.file.delete(save=False)
        except Source.DoesNotExist:
            pass