import { Twilio } from 'twilio'

const accountSid = `${process.env.TWILIO_ACCOUNT_SID}`;
const authToken = `${process.env.TWILIO_AUTH_TOKEN}`;
const from = `${process.env.TWILIO_PHONE}`
const client = new Twilio(accountSid, authToken);

export const sendSms = (to: string, body: string, txt: string) => {
    console.log("to", to);
    
    try {
        client.messages
            .create({
                body: `BlogDev ${txt} - ${body}`,
                from,
                to
            })
            .then(message => console.log(message.sid));
    } catch (error) {
        console.log(error);
    }
}