import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import { Buffer } from 'node:buffer';

/**
 * Formats a JavaScript Date object into an ICS-compatible UTC date-time string.
 * @param {Date} date - The date to format.
 * @returns {string} - The formatted date string (e.g., "20231027T180000Z").
 */
function formatICSDate(date) {
    if (!date || isNaN(date.getTime())) {
        // Return a default or handle error appropriately
        const now = new Date();
        return now.getUTCFullYear() +
            ('0' + (now.getUTCMonth() + 1)).slice(-2) +
            ('0' + now.getUTCDate()).slice(-2) +
            'T' +
            ('0' + now.getUTCHours()).slice(-2) +
            ('0' + now.getUTCMinutes()).slice(-2) +
            ('0' + now.getUTCSeconds()).slice(-2) +
            'Z';
    }
    return date.getUTCFullYear() +
        ('0' + (date.getUTCMonth() + 1)).slice(-2) +
        ('0' + date.getUTCDate()).slice(-2) +
        'T' +
        ('0' + date.getUTCHours()).slice(-2) +
        ('0' + date.getUTCMinutes()).slice(-2) +
        ('0' + date.getUTCSeconds()).slice(-2) +
        'Z';
}


Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        const { title, description, startTime, endTime, location, toEmail } = await req.json();

        if (!title || !startTime || !endTime || !toEmail) {
            return new Response(JSON.stringify({ error: 'Missing required event details.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const eventDescription = description ? description.replace(/\n/g, '\\n') : 'No description provided.';
        const eventLocation = location ? location.replace(/\n/g, '\\n') : '';

        // Generate a unique ID for the event
        const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@dobrylife.com`;

        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//DobryLife//Task Reminder//EN',
            'BEGIN:VEVENT',
            `UID:${uid}`,
            `DTSTAMP:${formatICSDate(new Date())}`,
            `DTSTART:${formatICSDate(new Date(startTime))}`,
            `DTEND:${formatICSDate(new Date(endTime))}`,
            `SUMMARY:${title}`,
            `DESCRIPTION:${eventDescription}`,
            `LOCATION:${eventLocation}`,
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');
        
        const attachmentContent = Buffer.from(icsContent).toString('base64');
        
        // This relies on `sendExternalEmail` supporting an `attachments` array.
        const emailPayload = {
            to: toEmail,
            subject: `Calendar Invite: ${title}`,
            body: `<p>You're invited to the event: <strong>${title}</strong>.</p><p>Please find the calendar file attached to this email to add it to your calendar.</p><p>Thank you,<br>DobryLife Assistant</p>`,
            attachments: [{
                content: attachmentContent,
                filename: 'invite.ics',
                type: 'text/calendar; method=REQUEST',
                disposition: 'attachment'
            }]
        };

        // Invoke the existing function to send the email with the attachment
        await base44.functions.invoke('sendExternalEmail', emailPayload);

        return new Response(JSON.stringify({ success: true, message: "Calendar invite sent successfully." }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error in sendCalendarInvite:', error);
        return new Response(JSON.stringify({ error: error.message || 'An internal error occurred.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});