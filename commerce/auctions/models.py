from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Item(models.Model):
    name = models.CharField()
    price = models.DecimalField(max_digits=8, decimal_places=2)

    def __str__(self):
        return f"{self.id}: {self.name} at {self.price: .2f} each"

class Bid(models.Model):
    price = models.DecimalField(max_digits=8, decimal_places=2) # Caps at 8 digits, which is 999,999.99
    datetime = models.DateTimeField(auto_now_add=True) # This tracks creation and not modification.  Bids should not be modifiable. 
    User = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bids", null=False)  # This should log the user making the bid.  TO DO: CHECK IF THIS IS WORKING.

class Comment(models.Model):
    comment = models.CharField(max_length=512)
    datetime = models.DateTimeField(auto_now_add=True)  # Comments will not be modifiable.
    User = models.ForeignKey(User, on_delete=models.CASCADE, related_name="comments", null=False)  # This should log the user making the comment. TO DO: CHECK IF THIS IS WORKING.

class Listing(models.Model):
    title = models.CharField(max_length=128)
    description = models.CharField(max_length=512)
    url_image = models.URLField()
    CATEGORY_CHOICES = [
        ('Fashion', 'Fashion'),
        ('Toys', 'Toys'),
        ('Electronics', 'Electronics'),
        ('Home', 'Home'),
        ('Uncategorized','Uncategorized')
    ]
    category = models.CharField(max_length=32, choices=CATEGORY_CHOICES, default='Uncategorized')
    Bids = models.ForeignKey(Bid, on_delete=models.CASCADE, related_name="bids", null=True, blank=True)
    Comments = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name="comments", null=True, blank=True)
    Users = models.ForeignKey(User, on_delete=models.CASCADE, related_name="listings", null=True, blank=True)

