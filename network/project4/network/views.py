from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django import forms
from django.core.paginator import Paginator
import json

from .models import User, Post

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
    page_number = request.GET.get('page', 1)
    posts = Post.objects.all()
    p = Paginator(posts,10)

    # Convert the page number to integer or give default page 1
    try:
        page = p.page(int(page_number))
    except:
        page = p.page(1)
    
    if request.method == "POST":
        form = NewPostForm(request.POST)
        if form.is_valid():
            post = form.save(commit=False)
            post.user = request.user
            post.save()
            return HttpResponseRedirect(reverse("index"))
    else:
        form = NewPostForm()

    return render(request, "network/index.html", {
        "newpostform": form,
        "page": page,        
    })

def profile(request, username):
    page_number = request.GET.get('page', 1)

    try:
        profile_user = User.objects.get(username=username)
        posts = Post.objects.filter(user=profile_user)
        p = Paginator(posts,10)

        # Convert the page number to integer or give default page 1
        try:
            page = p.page(int(page_number))
        except:
            page = p.page(1)

        # Add the following status
        is_following = False
        if request.user.is_authenticated:
            is_following = request.user.is_following(profile_user)
        
        return render(request, "network/profile.html", {
            "profile_user": profile_user,
            "page": page,
            "is_following": is_following
        })
    
    # Handle case where user doesn't exist (what if their profile is deleted?)
    except User.DoesNotExist:
        return render(request, "network/error.html", {
            "message": f"User {username} was not found."
        })

@login_required    
def follow(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        action = data.get('action')
        
        try:
            user_to_follow = User.objects.get(username=username)
            
            if action == 'follow':
                request.user.following.add(user_to_follow)
                following = True
            else:
                request.user.following.remove(user_to_follow)
                following = False
                
            return JsonResponse({
                'success': True,
                'following': following,
                'follower_count': user_to_follow.follower_count()
            })
        except User.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'User not found'})
    
    return JsonResponse({'success': False, 'error': 'Invalid request'})

@login_required
def following(request):    
    page_number = request.GET.get('page', 1)
    following_users = request.user.following.all()

    # Performs a SQL equivalent of an IN function
    posts = Post.objects.filter(user__in=following_users).order_by('-created')
    
    p = Paginator(posts,10)

    # Convert the page number to integer or give default page 1
    try:
        page = p.page(int(page_number))
    except:
        page = p.page(1)

    return render(request, "network/following.html", {
            "page": page,
            "following_users": following_users
    })

@login_required
def edit_post(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        post_id = data.get('post_id')
        new_content = data.get('content')

        # Prevents an empty post
        if not new_content or not new_content.strip():
            return JsonResponse({'success': False, 'error': 'Post cannot be empty'})
        
        try:
            post = Post.objects.get(id=post_id)
            
            # Redundancy to ensure you can only edit your own post
            if post.user != request.user:
                return JsonResponse({'success': False, 'error': 'Permission denied'})
            
            # Update the post and remove trailing spaces
            post.content = new_content.strip()
            post.save()
            
            return JsonResponse({
                'success': True,
                'content': post.content
            })
            
        except Post.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Post not found'})
    
    return JsonResponse({'success': False, 'error': 'Invalid request'})

@login_required
def like_post(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        post_id = data.get('post_id')
        action = data.get('action')
        
        try:
            post = Post.objects.get(id=post_id)
            
            if action == 'like':
                post.like.add(request.user)
                liked = True
            else:
                post.like.remove(request.user)
                liked = False
            
            return JsonResponse({
                'success': True,
                'liked': liked,
                'like_count': post.like_count()
            })
            
        except Post.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Post not found'})
    
    return JsonResponse({'success': False, 'error': 'Invalid request'})

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
