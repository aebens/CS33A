from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("listing/<int:id>", views.listing, name="listing"),
    path('bid/<int:id>/', views.bid, name='bid'),
    path("userlistings", views.userlistings, name="userlistings"),
    path("add", views.add, name="add"),
    path('watchlist/add/<int:id>/', views.add_to_watchlist, name='add_to_watchlist'),
    path('watchlist/remove/<int:id>/', views.remove_from_watchlist, name='remove_from_watchlist'),
    path('close/<int:id>/', views.close_listing, name='close_listing'),
    path('add_commment/<int:id>/', views.add_comment, name='add_comment'),
    path('watchlist/', views.watchlist, name='watchlist'),
    path('categories/', views.categories, name='categories'),
    path('categories/<str:category>/', views.category_listings, name='category_listings')
]
