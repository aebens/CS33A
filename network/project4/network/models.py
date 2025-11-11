from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    following = models.ManyToManyField('self', symmetrical=False, related_name="followers")
    
    def __str__(self):
        return self.username
    
    def follower_count(self):
        return self.followers.count()

    def following_count(self):
        return self.following.count()
    
    def is_following(self, user):
        return self.following.filter(id=user.id).exists()

class Post(models.Model):
    content = models.TextField(max_length=500)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False) #Soft delete
    like = models.ManyToManyField(User, related_name="liked_posts", blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, related_name="replies", null=True, blank=True) # Allows threads
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts") 
    
    def like_count(self):
        return self.like.count()
    
    def is_liked_by(self, user):
        if not user.is_authenticated:
            return False
        return self.like.filter(id=user.id).exists()
    
    def reply_count(self):
        return self.replies.filter(is_deleted=False).count()
    
    class Meta:
        ordering = ['-created'] # Sort by most recently created