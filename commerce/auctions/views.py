from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django import forms ##document?
from auctions.models import CATEGORY_CHOICES ## this is needed in order to get the choice list to show up.

from .models import User, Listing, Bid, Comment

class NewListingForm(forms.Form):
    listingTitle = forms.CharField(label="Title")
    listingDesc = forms.CharField(widget=forms.Textarea, label="Description")
    listingImgUrl = forms.URLField(label="Image URL")
    listingStartBid = forms.DecimalField(label="Starting Bid", max_digits=8, decimal_places=2) ## This should match the model.
    listingCategory = forms.ChoiceField(choices=CATEGORY_CHOICES, label="Category")  ## This should match the model.

def index(request):
    return render(request, "auctions/index.html", {
        "listings": Listing.objects.all()
    })

def listing(request, id):
    listing = Listing.objects.get(id=id)
    return render(request, "auctions/listing.html", {
        "listing": listing
    })

def add(request):
    if request.method == "POST":
        form = NewListingForm(request.POST)
        if  request.user.is_authenticated: 
            if form.is_valid():
                listing = Listing.objects.create(
                    title=form.cleaned_data["listingTitle"],
                    description=form.cleaned_data["listingDesc"],
                    url_image=form.cleaned_data["listingImgUrl"],
                    category=form.cleaned_data["listingCategory"],
                    User=request.user
                )
                bid = Bid.objects.create(
                    price=form.cleaned_data["listingStartBid"],
                    User=request.user
                )

                return HttpResponseRedirect(reverse("listing", args=[listing.id]))
            
        else:
            return render(request, "auctions/login.html")
    else:
        form = NewListingForm()

    return render(request, "auctions/add.html", {
            "form": form
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")
