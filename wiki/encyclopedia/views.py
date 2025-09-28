from django.shortcuts import render
from django import forms
from django.http import HttpResponseRedirect, Http404
from django.urls import reverse
import random

from . import util

class NewEntryForm(forms.Form):
    entryTitle = forms.CharField(label="Entry Title")
    entryContent = forms.CharField(widget=forms.Textarea, label="Entry Content")

## Edit form is separate for New Entry form in case I want these to be different in the future.
class EditForm(forms.Form):
    entryTitle = forms.CharField(label="Entry Title")
    entryContent = forms.CharField(widget=forms.Textarea, label="Entry Content")

def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })

def entry(request, title):
    entry = util.get_entry(title)
    if entry is None:
        raise Http404()
    else:
        content = util.markdown_to_html(entry) # Convert content to html to render in page.
        return render(request, "encyclopedia/entry.html/", {
            "entry": entry,
            "content": content,
            "title": title
        })

def edit(request, title):
    content = util.get_entry(title)
    return render(request, "encyclopedia/edit.html/", {
        "content": content,
        "title": title,
        "form": EditForm(initial={'entryTitle': title, 'entryContent': content})
    })

def save(request, title):
    entries = util.list_entries()
    if request.method == "POST":
        form = EditForm(request.POST)
        if form.is_valid(): 
            entryTitle = form.cleaned_data["entryTitle"]
            entryContent = form.cleaned_data["entryContent"]
            util.save_entry(entryTitle, entryContent)
            return HttpResponseRedirect(reverse("entry", args=[entryTitle]))
        else:
            return render(request, "encyclopedia/edit.html", {
                "form": form
            })
    return render(request, "encyclopedia/edit.html", {
        "form": EditForm()
    })

def add(request):
    entries = util.list_entries()
    if request.method == "POST":
        form = NewEntryForm(request.POST)
        if form.is_valid(): 
            entryTitle = form.cleaned_data["entryTitle"]
            entryContent = form.cleaned_data["entryContent"]
            if entryTitle in entries:  ## Checks to see if title already exists and if so, renders an error in the page.
                return render(request, "encyclopedia/add.html", {
                "form": form,
                "error": "An entry with this title already exists.  Please change the title to continue."
            })
            else:
                util.save_entry(entryTitle, entryContent)
                return HttpResponseRedirect(reverse("entry", args=[entryTitle]))
        else:
            return render(request, "encyclopedia/add.html", {
                "form": form
            })
    return render(request, "encyclopedia/add.html", {
        "form": NewEntryForm()
    })

def search(request):
    notfound = None
    q = request.GET.get('q').lower()
    entries = util.list_entries()

    results = []
    for entry in entries:
        if q in entry.lower():
            results.append(entry)
    if not results:
        notfound = "No results.  Please try a new search."
    if len(results) == 1: 
        return HttpResponseRedirect(reverse("entry", args=[results[0]]))
    else:
        return render(request, "encyclopedia/search.html",{
            "results": results,
            "error": notfound
        })

def randomPage(request):
    entries = util.list_entries()
    if len(entries) == 0:
        return render(request, "encyclopedia/index.html",{
            "entries": util.list_entries()
        })
    elif len(entries) == 1: ## ensures that if there is only one page, it can't be random and will be selected.
        return HttpResponseRedirect(reverse("entry", args=[entries[0]]))
    else:
        # This makes sure it will return a new page by getting the current title and ensuring the page will change.
        current_title = request.GET.get('title')
        while True:
            entry = random.choice(entries)
            if entry != current_title:
                break
        return HttpResponseRedirect(reverse("entry", args=[entry]))