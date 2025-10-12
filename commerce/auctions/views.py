from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django import forms ##document?
from auctions.models import CATEGORY_CHOICES ## this is needed in order to get the choice list to show up.
from django.db.models import Max

from .models import User, Listing, Bid, Comment

def currentprices(queryset):
    for listing in queryset:  ## this wil find the current price for each listing
        latest_bid = Bid.objects.filter(Listing=listing).order_by('-datetime').first()  ## sorts the db by the datetime field and returns the first entry
        
        if latest_bid: ## checks if there is a latest bid [jic there is an entry without a starter bid (which should be an error)]
            listing.current_price = latest_bid.price 
        else:
            None ## there would be no initial bid set, so this is none.
    return queryset

class NewListingForm(forms.Form):
    listingTitle = forms.CharField(label="Title")
    listingDesc = forms.CharField(widget=forms.Textarea, label="Description")
    listingImgUrl = forms.URLField(label="Image URL")
    listingStartBid = forms.DecimalField(label="Starting Bid", max_digits=8, decimal_places=2) ## This should match the model.
    listingCategory = forms.ChoiceField(choices=CATEGORY_CHOICES, label="Category")  ## This should match the model.

class NewBidForm(forms.Form):
    listingNewBid = forms.DecimalField(label="Your Bid", max_digits=8, decimal_places=2) ## This should match the model.

def index(request):
    listings = currentprices(Listing.objects.all())

    return render(request, "auctions/index.html", {
        "listings": listings,
        "bids": Bid.objects.all()
    })

def userlistings(request):
    listings = currentprices(Listing.objects.filter(User=request.user))

    return render(request, "auctions/userlistings.html", {
        "listings": listings,
        "bids": Bid.objects.all()
    })

def listing(request, id):
    listing = Listing.objects.get(id=id) ## returns an array with one item
    listing = currentprices([listing])[0]  ## gets the array value from the first slot after converting to a list
    bids = Bid.objects.filter(Listing=listing).order_by('-datetime') ## passes bids for the bid history for this listing
    form = NewBidForm()
    return render(request, "auctions/listing.html", {
        "listing": listing,
        "bids": bids,
        "form": form
    })

def bid(request, id):
    listing = Listing.objects.get(id=id)
    listing = currentprices([listing])[0]
    if request.method == "POST":
        form = NewBidForm(request.POST)
        if form.is_valid():
                bid_amount = form.cleaned_data["listingNewBid"]
                current_price = listing.current_price if listing.current_price else 0
                if bid_amount > current_price:
                    Bid.objects.create(
                        price=bid_amount,
                        User=request.user,
                        Listing=listing
                    )
                    return HttpResponseRedirect(reverse("listing", args=[listing.id]))
                else:
                    error = "Your bid must be greater than the current highest bid."
                    bids = Bid.objects.filter(Listing=listing).order_by('-datetime') ## this will return the bid history even when there is an error.
                    return render(request, "auctions/listing.html", {
                        "form": form,
                        "listing": listing,
                        "error": error,
                        "bids": bids
                    })
            
        else:
                    error = "Please enter a bid that is greater than the current highest bid but also less than $10,000,000.00."
                    bids = Bid.objects.filter(Listing=listing).order_by('-datetime') ## this will return the bid history even when there is an error.
                    return render(request, "auctions/listing.html", {
                        "form": form,
                        "listing": listing,
                        "error": error,
                        "bids": bids
                    })
    else:
        form = NewBidForm()

    return render(request, "auctions/listing.html", {
            "form": form,
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
                    User=request.user,
                    Listing=listing
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
