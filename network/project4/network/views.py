from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django import forms

from .models import User, Post

# class NewPost(forms.Form):
#    PostContent = forms.CharField(widget=forms.Textarea, label="New Post", max_length=500, help_text="Maximum of 500 characters")

class NewPostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['content']
        widgets = {
            'content': forms.Textarea()
        }
        labels = {
            'content': 'What\'s going on?'
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for visible in self.visible_fields():
            visible.field.widget.attrs["class"] = "form-control mb-3"

def index(request):
    if request.method == "POST":
        form = NewPostForm(request.POST)
        if form.is_valid():
            post = form.save(commit=False)
            post.user = request.user
            post.title = ""  # Set empty title or default value
            post.save()
            return HttpResponseRedirect(reverse("index"))
    else:
        form = NewPostForm()

    posts = Post.objects.all()
    
    return render(request, "network/index.html", {
        "newpostform": form,
        "posts": posts
    })

def profile(request, username):
    try:
        profile_user = User.objects.get(username=username)
        posts = Post.objects.filter(user=profile_user)
        
        return render(request, "network/profile.html", {
            "profile_user": profile_user,
            "posts": posts
        })
    
    # Handle case where user doesn't exist (what if their profile is deleted?)
    except User.DoesNotExist:
        return render(request, "network/error.html", {
            "message": f"User {username} was not found."
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
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


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
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
