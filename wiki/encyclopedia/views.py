from django.shortcuts import render

from . import util


def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })

## def entry(request, title):
##    return render(request, "encyclopedia/layout.html/", {
##        "title": title
##    })

def add(request):
    return render(request, "encyclopedia/add.html")
