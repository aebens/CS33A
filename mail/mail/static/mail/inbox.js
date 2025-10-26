document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox

  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

// This clears the current email list and reloads the list

function load_emails(emails){
  const emailview = document.querySelector("#emails-view");
  const divContainer = document.createElement('div')
  emailview.append(divContainer);
  
  for (const email of emails){
    const div = document.createElement('div')
    div.classList.add("email")

    const spanTime = document.createElement('span')
    spanTime.className = "email-timestamp";
    spanTime.textContent = email.timestamp;

    const spanSubj = document.createElement('span')
    spanSubj.className = "email-subject";
    spanSubj.textContent = email.subject;

    const spanSend = document.createElement('span')
    spanSend.className = "email-sender";
    spanSend.textContent = email.sender;

    const id = email.id

    // Read/unread button
    const readbtn = document.createElement('button');
    readbtn.className = 'btn btn-sm btn-outline-secondary';
    readbtn.type = 'button';
    readbtn.textContent = 'Mark Read';

    const unreadbtn = document.createElement('button');
    unreadbtn.className = 'btn btn-sm btn-outline-secondary';
    unreadbtn.type = 'button';
    unreadbtn.textContent = 'Mark Unread';

    // Attach click and status change for the read/unread button, reload page to update css
    readbtn.addEventListener('click', () => {
      markread(id,"read")
      location.reload() // courtesy of the Duck
      console.log('Read clicked for', id);
    });
    
    unreadbtn.addEventListener('click', () => {
      markread(id,"unread")
      location.reload() // courtesy of the Duck
      console.log('Unread clicked for', id);
    });

    // Archive button
    const archivebtn = document.createElement('button');
    archivebtn.className = 'btn btn-sm btn-outline-secondary';
    archivebtn.type = 'button';
    archivebtn.textContent = 'Archive';

    // Remove the email from the view once archived
    archivebtn.addEventListener('click', () => {
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: true
        })
      })
      .then(
        () => div.remove());
      console.log('Archive clicked for', id);
    });
    
    // Declare a variable to dynamically change the read button that is displayed
    let readstatebtn
    
    // Dynamically change the div class based on read status and add correct button
    if (`${email.read}` === "true"){
      div.classList.add("read")
      readstatebtn = unreadbtn;
    } else if (`${email.read}` === "false"){
      div.classList.add("unread")
      readstatebtn = readbtn;
    } 

    div.id = id

    div.append(spanTime, spanSend, spanSubj, readstatebtn, archivebtn);

    // Add click function to open message
    div.addEventListener('click', () => {
      console.log('Message clicked:', div.id);
      load_message(div.id)
    });

    divContainer.appendChild(div);
  }
  
};

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
        load_emails(emails);

    });
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
    load_mailbox('inbox');
  })

  .catch(error => {
      console.log('Error:', error);
  });

  })
})

// View Email Message

// Show the message and hide other views
function load_message(id) {
  document.querySelector('#message-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
}

function markread(id,status){
  if(status==="read"){
    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    })
  } else if (status==="unread"){
    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: false
      })
    })
  }
  
}

