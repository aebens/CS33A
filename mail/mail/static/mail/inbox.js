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

// this clears the current email list and reloads the list

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

    // read/unread button
    const readbtn = document.createElement('button');
    readbtn.className = 'btn btn-sm btn-outline-secondary';
    readbtn.type = 'button';
    readbtn.textContent = 'Mark Read';

    const unreadbtn = document.createElement('button');
    unreadbtn.className = 'btn btn-sm btn-outline-secondary';
    unreadbtn.type = 'button';
    unreadbtn.textContent = 'Mark Unread';

      //change the text in the button depending on status
    readbtn.addEventListener('click', () => {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })
      location.reload() // courtesy of the Ducka
      console.log('Read clicked for', email.id);
    });
      

    unreadbtn.addEventListener('click', () => {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: false
        })
      })
      location.reload() // courtesy of the Duck
      console.log('Unread clicked for', email.id);
    });

    // archive button
    const archivebtn = document.createElement('button');
    archivebtn.className = 'btn btn-sm btn-outline-secondary';
    archivebtn.type = 'button';
    archivebtn.textContent = 'Archive';

      //remove the email from the view once archived
    archivebtn.addEventListener('click', () => {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: true
        })
      })
      .then(
        () => div.remove());
      console.log('Archive clicked for', email.id);
    });
      
    let readstatebtn
    
    if (`${email.read}` === "true"){
      div.classList.add("read")
      readstatebtn = unreadbtn;
    } else if (`${email.read}` === "false"){
      div.classList.add("unread")
      readstatebtn = readbtn;
    } 

    div.id = `${email.id}`

    div.append(spanTime, spanSend, spanSubj, readstatebtn, archivebtn);

    divContainer.appendChild(div);
  }
  
};

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

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