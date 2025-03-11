const fs = require('fs').promises;
const path = require('path');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');
const { getEventsFromEmail} = require('./middlewares/openai.js')
const _ = require("lodash");
const stringSimilarity = require('string-similarity')

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/calendar.events'];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

function getBody(payload) {
  let body = '';
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body.data) {
        body += Buffer.from(part.body.data, 'base64').toString('utf-8');
      } else if (part.parts) {
        body += getBody(part);
      }
    }
  } else if (payload.body && payload.body.data) {
    body += Buffer.from(payload.body.data, 'base64').toString('utf-8');
  }
  return body;
}

async function getCinéasteEmail(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  const senderEmail = 'contact@cineaste.org'; // Replace with the sender's email address
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = today.getFullYear();
  const query = `from:${senderEmail} after:${year}/${month}/${day}`;
  const res = await gmail.users.messages.list({
    userId: 'me',
    q: query,
  });
  const messages = res.data.messages || [];

  let body;

  for (const message of messages) {
    const msg = await gmail.users.messages.get({
      userId: 'me',
      id: message.id,
    });
    const subjectHeader = msg.data.payload.headers.find(
      (header) => header.name === 'Subject'
    );
    const subject = subjectHeader ? subjectHeader.value : '(No Subject)';
    body = getBody(msg.data.payload);
  }

  return body
}


function parseEventDetails(emailBody) {
  // Implement your logic to extract event details from the email body
  // For example, you might look for specific keywords or patterns
  // Return an object with event details or null if no event details are found
  return {
    summary: 'Sample Event',
    location: '123 Main St, Anytown, USA',
    description: 'This is a sample event description.',
    startDateTime: '2024-11-16T10:00:00',
    endDateTime: '2024-11-16T11:00:00',
    timeZone: 'America/New_York',
  };
}

async function getFutureEvents(auth) {
  const calendar = google.calendar({ version: 'v3', auth });
  const now = new Date().toISOString();

  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin: now,
    singleEvents: true,
    orderBy: 'startTime',
  });

  return res.data.items;
}

function filterOutRecordedEvents(futureEvents, recordedEvents, threshold = 0.8) {
  return futureEvents.filter(event => {
    const recordedSummaries = recordedEvents.map(recordedEvent => recordedEvent.summary);
    const matches = stringSimilarity.findBestMatch(event.summary, recordedSummaries);
    return matches.bestMatch.rating < threshold;
  });
}

const getUniqueCalEvents = async (auth, event_list) => {
  const events = event_list["events"]
  const evs = _.uniqBy(events, 'summary');
  // return evs
  const futureEvents = await getFutureEvents(auth);
  console.log({futureEvents})

    
  const uniqueEvents = filterOutRecordedEvents(evs, futureEvents);
  console.log({uniqueEvents})
  return uniqueEvents
}

const recordNewEvents = (auth, uniqueEvents) => {
  // Create new calendar events for the unique events
  const promises = uniqueEvents.map(event => createCalendarEvent(auth, event));
  return promises;
}

async function createCalendarEvent(auth, eventDetails) {
  const calendar = google.calendar({ version: 'v3', auth });
  console.log({eventDetails})
  const event = {
    summary: eventDetails.summary,
    location: eventDetails.location,
    description: eventDetails.description,
    start: {
      dateTime: eventDetails.startDateTime,
      timeZone: eventDetails.timeZone,
    },
    end: {
      dateTime: eventDetails.endDateTime,
      timeZone: eventDetails.timeZone,
    },
  };
  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });
    console.log('Event created: %s', response.data);
    return response
  } catch (error) {
    console.error('Error creating event: %s', error);
  }
}





const main = async () => {
  const auth = await authorize()
  const message_body = await getCinéasteEmail(auth)
  if(!message_body) {
    console.log("Pas d'email de Cinéaste.org aujourd'hui.")
    return
  }
  const events = await getEventsFromEmail(message_body)
  const uniqueEvents = await getUniqueCalEvents(auth, events)
  const calEvents = await Promise.all(recordNewEvents(auth, uniqueEvents))
  console.log(calEvents)
}


main()

