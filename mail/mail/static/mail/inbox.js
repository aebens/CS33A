document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email());

  // By default, load the inbox
  load_mailbox('inbox');

});

// This sets the email info as null as default unless something is given to prefill.
function compose_email(prefill = null) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#message-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  const recipients = document.querySelector('#compose-recipients');
  const subject = document.querySelector('#compose-subject');
  const body = document.querySelector('#compose-body');

  // Cleans the prefill value so "undefined" never appears
  const p = prefill || {};

  // The use of the ?? will set the default if the prefill isn't available.
  recipients.value = p.sender ?? '';
  const subj = p.subject ?? '';
  const bodyp = p.body ?? '';
  const senderp = p.sender ?? '';
  const timep = p.timestamp ?? '';

  // This was done with the help of the Duck because of issues with undefined/blank.
  if (!subj) {
    subject.value = '';
  } else {
    subject.value = subj.startsWith('RE:') ? subj : 'RE: ' + subj;
  }
  
  if (bodyp) {
    body.value = '\n\nOn ' + timep + ' ' + senderp + ' wrote: \n' + bodyp ?? '';
  } else {
    body.value = '';
  }
  

  // Clear out the fields if there is no prefill info
  if (!prefill){
    recipients.value = '';
    subject.value = '';
    body.value = '';
  }

  // Puts the cursor in the body for the user (with help from the Duck)
  body.focus();
  body.setSelectionRange(0, 0);

}

// Posting Emails
// using the preventDefault method was suggested by the Duck (with the explicit event passed)

document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('#compose-form').addEventListener('submit', (event) => {
    event.preventDefault()

    const recipients = document.querySelector('#compose-recipients').value
    const subject = document.querySelector('#compose-subject').value
    const body = document.querySelector('#compose-body').value

    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
      })
    })
    .then(response => response.json())
    .then(result => {
      //Print result
      console.log(result);
      load_mailbox('sent');
    })

    .catch(error => {
        console.log('Error:', error);
    });

  });
});

// This clears the current email list and reloads the list
function load_emails(emails, mailbox){
  const emailview = document.querySelector("#emails-view");
  const divContainer = document.createElement('div')
  emailview.append(divContainer);
  
  for (const email of emails){
    const div = document.createElement('div')
    div.classList.add("email");

    const id = email.id
    div.id = id;

    const spanTime = document.createElement('span')
    spanTime.className = "email-timestamp";
    spanTime.textContent = email.timestamp;

    const spanSubj = document.createElement('span')
    spanSubj.className = "email-subject";
    spanSubj.textContent = email.subject;

    const spanSend = document.createElement('span')
    spanSend.className = "email-sender";
    spanSend.textContent = email.sender;

    div.append(spanTime, spanSend, spanSubj);
    
    // Add click function to open message
    div.addEventListener('click', () => {
      console.log('Message clicked:', div.id);
      load_message(div.id);
    });

    if (mailbox != "sent"){

      const readstatus = Boolean(email.read);

      const readbtn = readbutton(email);
      const archivebtn = archivebutton(email);

      // Dynamically change the div class based on read status and change button text for the initial state
      checkReadStatus(div, readbtn, readstatus);

      div.append(readbtn, archivebtn);
    }

    divContainer.appendChild(div);
    
  }
  
};

function checkReadStatus(div, readbtn, readstatus){
  if (readstatus){
    div.classList.add("read");
    div.classList.remove('unread');
    readbtn.textContent = 'Mark Unread';
  } else {
    div.classList.add('unread');
    div.classList.remove('read');
    readbtn.textContent = 'Mark Read';
  }
  return readbtn;
}

function readbutton(email){
  const id = email.id;

  // Read/unread button
  const readbtn = document.createElement('button');

  readbtn.className = 'btn btn-sm btn-outline-secondary readbtn';
  readbtn.type = 'button';

  readbtn.addEventListener('click', (event) => {
    event.stopPropagation() // suggested by the Duck

    const newReadStatus = !email.read;

    markread(id, newReadStatus)
    .then(() => {
      // Reverse the local variable to match what should be on the server
      email.read = newReadStatus;

      const thisdiv = document.getElementById(id);

      checkReadStatus(thisdiv, readbtn, newReadStatus);

    });
  });

  return readbtn;
}

function archivebutton(email){
  const id = email.id;
  const archivestatus = Boolean(email.archived);

  // Archive button
  const archivebtn = document.createElement('button');
  archivebtn.className = 'btn btn-sm btn-outline-secondary archivebtn';
  archivebtn.type = 'button';

  // Dynamically change the button text
  if (archivestatus){
    archivebtn.textContent = 'Unarchive';
  } else {
    archivebtn.textContent = 'Archive';
  }
  
  archivebtn.addEventListener('click', (event) => {
    event.stopPropagation() // suggested by the Duck

    const newArchiveStatus = !email.archived;

    // Remove the email from the view once archived
    archivemessage(id,newArchiveStatus)
    .then(() => {
      email.archived = newArchiveStatus;
      load_mailbox('inbox');
      //div.remove();
      console.log('Archive clicked for', email.id);
    });
      
  });
  
  return archivebtn;
}

function replybutton(email){
  const id = email.id;

  // Reply button
  const replybtn = document.createElement('button');
  replybtn.className = 'btn btn-sm btn-outline-secondary replybtn';
  replybtn.type = 'button';
  replybtn.textContent = 'Reply';

  replybtn.addEventListener('click', (event) => {
    event.stopPropagation() // suggested by the Duck
      compose_email(email);
    });
  
  return replybtn;
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#message-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Load emails depending on the mailbox in the URL
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
        // Print emails
        console.log(emails);
        load_emails(emails, mailbox);

    });
}

// View Email Message

// Show the message and hide other views
function load_message(id) {
  document.querySelector('#message-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';

  markread(id,"read")

  // Create the view for the email message by wiping out existing content
  const emailview = document.querySelector("#message-view");
  emailview.innerHTML = '';

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);

    const divContainer = document.createElement('div')
    emailview.append(divContainer);

    const divNav = document.createElement('div')
    divContainer.append(divNav);

    const readbtn = readbutton(email);
    const archivebtn = archivebutton(email);
    const replybtn = replybutton(email);

    checkReadStatus(divNav, readbtn, Boolean(email.read));
    divNav.append(readbtn, archivebtn, replybtn);

    divNav.classList.remove('unread');
    divNav.classList.remove('read');

    const subj = document.createElement('div')
    subj.innerHTML = `<h3>${email.subject}</h3>`;
    divContainer.append(subj);

    const firstLineDiv = document.createElement('div')
    firstLineDiv.className = 'message-firstline';
    divContainer.append(firstLineDiv);

    const from = document.createElement('span')
    from.innerHTML = `From: <strong>&lt;${email.sender}&gt;<strong>`;
    firstLineDiv.append(from);

    const datetime = document.createElement('span')
    datetime.innerHTML = `Sent: ${email.timestamp}`;
    firstLineDiv.append(datetime);

    const recipients = document.createElement('div')
    recipients.innerHTML = `<p>To: ${email.recipients}</p>`;
    divContainer.append(recipients);

    const body = document.createElement('div')
    body.innerHTML = `<p>${email.body}</p>`;
    divContainer.append(body);
  });
}

function markread(id,status){
  return fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: Boolean(status)
      })
  });
}

function archivemessage(id,status){
  return fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: Boolean(status)
      })
  });
}