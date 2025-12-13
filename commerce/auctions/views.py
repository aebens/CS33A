from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django import forms
from auctions.models import CATEGORY_CHOICES

from .models import User, Listing, Bid, Comment, Watchlist


# This wil find the current price for each listing.  It sorts the db by the datetime field and returns the first entry.
def currentprices(queryset):
    for listing in queryset:
        latest_bid = Bid.objects.filter(Listing=listing).order_by('-datetime').first()
        
        if latest_bid:
            listing.current_price = latest_bid.price 
        else:
            None
    return queryset


def get_listing_winner(listing):
    if listing.status == "Closed":
        winning_bid = Bid.objects.filter(Listing=listing).order_by('-price', '-datetime').first()
        if winning_bid:
            return winning_bid.User
    return None


class NewListingForm(forms.Form):
    listingTitle = forms.CharField(label="Title")
    listingDesc = forms.CharField(widget=forms.Textarea, label="Description")
    listingImgUrl = forms.URLField(label="Image URL")
    listingStartBid = forms.DecimalField(label="Starting Bid", max_digits=8, decimal_places=2)
    listingCategory = forms.ChoiceField(choices=CATEGORY_CHOICES, label="Category")


class NewBidForm(forms.Form):
    listingNewBid = forms.DecimalField(label="Your Bid", max_digits=8, decimal_places=2)


class NewCommentForm(forms.Form):
    comment = forms.CharField(widget=forms.Textarea, label="Add Your Comment", max_length=500)


# This is the default route and shows only active listings.
def index(request):
    listings = currentprices(Listing.objects.filter(status="Active"))
    print("active listings count:", listings.count()) 
    return render(request, "auctions/index.html", {
        "listings": listings,
        "bids": Bid.objects.all()
    })


# This is the user's own listings, whether active or not.
def userlistings(request):
    listings = currentprices(Listing.objects.filter(User=request.user))

    return render(request, "auctions/userlistings.html", {
        "listings": listings,
        "bids": Bid.objects.all()
    })


# Provides basic functionality to the listing page by pulling in related table data and 
# allowing the watchlist button to function.  Calculates the winner of the listing.
def listing(request, id):
    listing = Listing.objects.get(id=id)
    listing = currentprices([listing])[0]
    bids = Bid.objects.filter(Listing=listing).order_by('-datetime')
    winner = get_listing_winner(listing)
    comments = Comment.objects.filter(Listing=listing).order_by('-datetime')
    comment_form = NewCommentForm()
    form = NewBidForm()
    in_watchlist = False
    if request.user.is_authenticated:
        in_watchlist = Watchlist.objects.filter(User=request.user, Listing=listing).exists()
    return render(request, "auctions/listing.html", {
        "listing": listing,
        "bids": bids,
        "winner": winner,
        "comments": comments,
        "comment_form": comment_form,
        "form": form,
        "in_watchlist": in_watchlist
    })


#Calculates the bid history for the listing page and allows the user to make a bid.
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
                    bids = Bid.objects.filter(Listing=listing).order_by('-datetime')
                    return render(request, "auctions/listing.html", {
                        "form": form,
                        "listing": listing,
                        "error": error,
                        "bids": bids
                    })
            
        else:
                    error = "Please enter a bid that is greater than the current highest bid but also less than $10,000,000.00."
                    bids = Bid.objects.filter(Listing=listing).order_by('-datetime')
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

# This view adds a listing and its intitial bid.
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
            return render(request, "auctions/login.html", {
            "message": "You must be logged in to create a listing."
        })
    else:
        form = NewListingForm()

    return render(request, "auctions/add.html", {
            "form": form
    })


# Adds listing to watchlist via a conditionally appearing button on the listing page.
def add_to_watchlist(request, id):
    if request.user.is_authenticated:
        listing = Listing.objects.get(id=id)
        Watchlist.objects.get_or_create(User=request.user, Listing=listing)
        return HttpResponseRedirect(reverse("listing", args=[id]))
    else:
        return render(request, "auctions/login.html", {
            "message": "You must be logged in to add items to your watchlist."
        })


# Removes listing to watchlist via a conditionally appearing button on the listing page.
# This queries first for the username and the listing id, then deletes the record.
def remove_from_watchlist(request, id):
    if request.user.is_authenticated:
        listing = Listing.objects.get(id=id)
        Watchlist.objects.filter(User=request.user, Listing=listing).delete()
        return HttpResponseRedirect(reverse("listing", args=[id]))
    else:
        return render(request, "auctions/login.html", {
            "message": "You must be logged in to remove items from your watchlist."
        })


# This view allows the user to close the listing if they are the owner.
# There is a bit of extra security for "unauthorized" attempts to close in case the 
# button accidentally renders on the screen (e.g. stale page).
def close_listing(request, id):
    if request.user.is_authenticated:
        listing = Listing.objects.get(id=id)
        if request.user == listing.User:
            listing.status = "Closed"
            listing.save()
            return HttpResponseRedirect(reverse("listing", args=[id]))
        else:
            return HttpResponse("Unauthorized", status=403)
    else:
        return render(request, "auctions/login.html", {
            "message": "You must be logged in to close a listing."
        })
    

# Allows the user to add a comment.
def add_comment(request, id):
    if request.method == "POST" and request.user.is_authenticated:
        form = NewCommentForm(request.POST)
        listing = Listing.objects.get(id=id)
        if form.is_valid():
            Comment.objects.create(
                Listing=listing,
                User=request.user,
                comment=form.cleaned_data["comment"]
            )

        return HttpResponseRedirect(reverse("listing", args=[id]))
    return HttpResponseRedirect(reverse("listing", args=[id]))


# Allows the user to add an item to their watchlist when they are on the listing.
def watchlist(request):
    if request.user.is_authenticated:
        watched_listings = Listing.objects.filter(watched_by__User=request.user)
        watched_listings = currentprices(watched_listings)
        return render(request, "auctions/watchlist.html", {
            "listings": watched_listings
        })
    else:
        return redirect('login')


# Provides a list of categories avaialable to browse.
def categories(request):
    categories = [choice[0] for choice in CATEGORY_CHOICES]
    return render(request, "auctions/categories.html", {
        "categories": categories
    })


# Provides a page for a given category and will show all the active listings for that category.
def category_listings(request, category):
    listings = currentprices(Listing.objects.filter(category=category, status="Active"))
    return render(request, "auctions/category_listings.html", {
        "listings": listings,
        "category": category
    })


# Login screen
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


#Logout screen
def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index")) 


#Register screen
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
