from django.shortcuts import render
from django import forms  ##document
from django.http import HttpResponseRedirect, Http404  ##document
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
    entry = util.get_entry(title)
    content = util.markdown_to_html(entry) # Convert content to html to render in page.
    return render(request, "encyclopedia/entry.html/", {
        "entry": entry,
        "content": content,
        "title": title
    })

def add(request):
    entries = util.list_entries()
    if request.method == "POST":
        form = NewEntryForm(request.POST)
        if form.is_valid(): ## TODO: Need to check if title already exists.
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
