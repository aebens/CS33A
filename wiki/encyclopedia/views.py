from django.shortcuts import render
from django import forms  ##document
from django.http import HttpResponseRedirect  ##document
from django.urls import reverse  ##document

from . import util

class NewEntryForm(forms.Form):
    entryTitle = forms.CharField(label="Entry Title")
    entryContent = forms.CharField(widget=forms.Textarea, label="Entry Content")

def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })

def entry(request, title):
    return render(request, "encyclopedia/layout.html/", {
        "entry": util.get_entry(title)
    })

def add(request):
    entries = util.list_entries()
    if request.method == "POST":
        form = NewEntryForm(request.POST)
        if form.is_valid(): ## Need to check if title already exists.
            entryTitle = form.cleaned_data["entryTitle"]
            entryContent = form.cleaned_data["entryContent"]
            util.save_entry(entryTitle, entryContent)
            return HttpResponseRedirect(reverse("entry", args=[entryTitle]))
        else:
            return render(request, "tasks/add.html", {
                "form": form
            })
    return render(request, "encyclopedia/add.html", {
        "form": NewEntryForm()
    })
