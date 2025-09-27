import re

from django.core.files.base import ContentFile
from django.core.files.storage import default_storage

from django.http import HttpResponse ## document


def list_entries():
    """
    Returns a list of all names of encyclopedia entries.
    """
    _, filenames = default_storage.listdir("entries")
    return list(sorted(re.sub(r"\.md$", "", filename)
                for filename in filenames if filename.endswith(".md")))


def save_entry(title, content):
    """
    Saves an encyclopedia entry, given its title and Markdown
    content. If an existing entry with the same title already exists,
    it is replaced.
    """
    filename = f"entries/{title}.md"
    if default_storage.exists(filename):
        default_storage.delete(filename)
    default_storage.save(filename, ContentFile(content))


def get_entry(title):
    """
    Retrieves an encyclopedia entry by its title. If no such
    entry exists, the function returns None.
    """
    try:
        f = default_storage.open(f"entries/{title}.md")
        return f.read().decode("utf-8")
    except FileNotFoundError:
        return None



def markdown_to_html(content):
    """
    This converts markdown into html.  Covers H1, H2, H3, a, strong, em, ul, ol, li, p.

    Multiline means it matches the pattern by line instead of whole page.  
    "\1" refers to first instance of the regex, whatever is captured in (.*$), and \2 refers to the seocond captured group.

    """

    # Convert Heading tags
    content = re.sub(r'^# (.*)$', r'\n<h1>\1</h1>', content, flags=re.MULTILINE) ## Finds one # and a space at the beginning of the line to make an h1.  
    content = re.sub(r'^## (.*)$', r'\n<h2>\1</h2>', content, flags=re.MULTILINE) ## Finds two # and a space at the beginning of the line to make an h2.
    content = re.sub(r'^### (.*)$', r'\n<h3>\1</h3>', content, flags=re.MULTILINE) ## Finds three # and a space at the beginning of the line to make an h3.
    
    
    # Convert inline content
    content = re.sub(r'\[(.*?)\]\((.*?)\)', r'<a href="\2">\1</a>', content, flags=re.MULTILINE) ## Finds the []() pattern to build the anchor tag inline.
    content = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', content, flags=re.MULTILINE)  ## Finds the ** pattern on both sides of text to bold them using a strong tag.
    content = re.sub(r'\*(.*?)\*', r'<em>\1</em>', content, flags=re.MULTILINE)  ## Finds the * pattern on both sides of text to italicize them using an em tag.

    #Convert lists
    content = re.sub(r'[*+-] (.+$)', r'<uli>\1</uli>', content, flags=re.MULTILINE)  ## Finds the three options to render a UL list item plus a space and then returns the item in a <uli> tag.  This will be converted to a real tag after wrapping with UL.
    content = re.sub(r'^\d+\. (.+)$', r'<oli>\1</oli>', content, flags=re.MULTILINE)  ## Finds the three options to render an OL list item plus a space and then returns the item in a <oli> tag.  This will be converted to a real tag after wrapping with OL.
    
    content = re.sub(r'((<uli>.*?</uli>\s*)+)', r'<ul>\n\1</ul>\n', content, flags=re.MULTILINE)  ## Finds a list of <uli> tags and wraps them in a UL tag.
    content = re.sub(r'((<oli>.*?</oli>\s*)+)', r'<ol>\n\1</ol>\n', content, flags=re.MULTILINE)  ## Finds a list of <oli> tags and wraps them in an OL tag.

    content = re.sub(r'<[ou]li>(.*?)</[ou]li>', r'<li>\1</li>', content, flags=re.MULTILINE)  ## Finds a list of <uli> or <oli> tags and converts them all to regular LI tags.
 
    # Convert paragraphs [this will probably break if tables, etc are introduced]
    content = re.sub(r'^(?!<(/?ul|/?ol|/?li|/?h[1-6]|/?p|/?strong|/?em))[^\s].+$', r'<p>\g<0></p>', content, flags=re.MULTILINE)  ## Finds lines that do not start with items that render anything above (at the beginning of the line) and inserts that content into p tags to make a new paragraph.
    
    
    return content