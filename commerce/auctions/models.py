from django.contrib.auth.models import AbstractUser
from django.db import models

CATEGORY_CHOICES = [
        ('Fashion', 'Fashion'),
        ('Toys', 'Toys'),
        ('Electronics', 'Electronics'),
        ('Home', 'Home'),
        ('Uncategorized','Uncategorized')
    ]

STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Closed', 'Closed')
    ]


class User(AbstractUser):
    pass

class Item(models.Model):
    name = models.CharField()
    price = models.DecimalField(max_digits=8, decimal_places=2)

    def __str__(self):
        return f"{self.id}: {self.name} at {self.price: .2f} each"

class Listing(models.Model):
    title = models.CharField(max_length=128)
    description = models.CharField(max_length=512)
    url_image = models.URLField(null=True, blank=True)
    category = models.CharField(max_length=32, choices=CATEGORY_CHOICES, default='Uncategorized')
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='Active')
    User = models.ForeignKey(User, on_delete=models.CASCADE, related_name="listings", null=True, blank=True)

class Bid(models.Model):
    price = models.DecimalField(max_digits=8, decimal_places=2) # Caps at 8 digits, which is 999,999.99
    datetime = models.DateTimeField(auto_now_add=True) # This tracks creation and not modification.  Bids should not be modifiable. 
    User = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bids", null=False)
    Listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="bid_listings", null=False, blank=True)

class Comment(models.Model):
    comment = models.CharField(max_length=512)
    datetime = models.DateTimeField(auto_now_add=True)  # Comments will not be modifiable.
    User = models.ForeignKey(User, on_delete=models.CASCADE, related_name="comments", null=False)
    Listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="comment_listings", null=False, blank=True)

class Watchlist(models.Model):
    datetime = models.DateTimeField(auto_now_add=True)
    User = models.ForeignKey(User, on_delete=models.CASCADE, related_name="watchlists")
    Listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="watched_by")
    

